/**
 * stellar.ts
 * ─────────────────────────────────────────────
 * All Stellar blockchain interactions live here.
 * Uses Stellar TESTNET — safe for demos & hackathons.
 *
 * Key concepts:
 *  - Keypair   : your wallet (public key = address, secret key = password)
 *  - Account   : on-chain account with XLM balance
 *  - Transaction: signed bundle of operations sent to the network
 *  - Friendbot : testnet faucet — gives you 10,000 free test XLM
 */

import {
  Horizon,
  Keypair,
  Claimant,
  Networks,
  TransactionBuilder,
  BASE_FEE,
  Operation,
  Asset,
  Memo,
} from '@stellar/stellar-sdk';

// ── Network config ──────────────────────────────────────────────────────────
const TESTNET_URL = 'https://horizon-testnet.stellar.org';

// Lazy-initialize to avoid module-level crash if SDK isn't fully ready yet
let _server: Horizon.Server | null = null;
function getServer(): Horizon.Server {
  if (!_server) _server = new Horizon.Server(TESTNET_URL);
  return _server;
}

// Stellar's base fee is 100 stroops = 0.00001 XLM (≈ ₹0.003)
export const STELLAR_FEE_STROOPS = BASE_FEE; // "100"

// ── Types ────────────────────────────────────────────────────────────────────
export interface WalletInfo {
  publicKey:  string;
  secretKey:  string;
  balance:    string;  // XLM balance
  isNew?:     boolean;
}

export interface TransactionResult {
  hash:          string;
  fee:           string;   // in XLM
  timeSeconds:   number;
  ledger:        number;
  explorerUrl:   string;
}

export interface RecentTx {
  id:          string;
  type:        'sent' | 'received';
  amount:      string;
  asset:       string;
  counterpart: string;   // the other address
  createdAt:   string;
}

export interface SponsoredPaymentResult {
  feeSource: string;
  senderPublicKey: string;
  receiverPublicKey: string;
  sponsoredFeeXLM: string;
  innerTransactionXdr: string;
  feeBumpTransactionXdr: string;
}

// ── 1. Generate a brand-new keypair (wallet) ─────────────────────────────────
export function generateKeypair(): { publicKey: string; secretKey: string } {
  const kp = Keypair.random();
  return {
    publicKey: kp.publicKey(),
    secretKey: kp.secret(),
  };
}

// ── 1b. Derive public key from a secret key ───────────────────────────────────
export function derivePublicKey(secretKey: string): string {
  return Keypair.fromSecret(secretKey.trim()).publicKey();
}

// ── 2. Fund a new testnet account via Friendbot ───────────────────────────────
async function friendbotOnce(publicKey: string, timeoutMs: number): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(
      `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`,
      { signal: controller.signal }
    );
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Friendbot failed (${response.status}): ${text.slice(0, 120)}`);
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('TIMEOUT');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function fundTestnetAccount(publicKey: string): Promise<void> {
  // Try once with 45s, then retry once more if it times out
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      await friendbotOnce(publicKey, 45_000);
      return;
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'TIMEOUT' && attempt < 2) {
        continue; // retry once
      }
      if (err instanceof Error && err.message === 'TIMEOUT') {
        throw new Error('Friendbot timed out twice. Stellar testnet may be congested — try again in a moment.');
      }
      throw err;
    }
  }
}

// ── 3. Fetch account balance ─────────────────────────────────────────────────
export async function getAccountBalance(publicKey: string): Promise<string> {
  try {
    const account = await getServer().loadAccount(publicKey);
    // Find the native XLM balance
    const nativeBalance = account.balances.find(
      (b) => b.asset_type === 'native'
    );
    return nativeBalance ? parseFloat(nativeBalance.balance).toFixed(4) : '0';
  } catch (err: unknown) {
    // Account not found on testnet (needs Friendbot funding)
    if ((err as { response?: { status: number } })?.response?.status === 404) {
      return '0';
    }
    throw err;
  }
}

// ── 4. Send XLM payment ───────────────────────────────────────────────────────
export async function sendPayment(
  senderSecret:    string,
  receiverPublic:  string,
  amountXLM:       string,
  memo?:           string
): Promise<TransactionResult> {
  const startTime  = Date.now();
  const senderKP   = Keypair.fromSecret(senderSecret);
  const senderPub  = senderKP.publicKey();

  // Load sender's account sequence number (prevents replay attacks)
  const senderAccount = await getServer().loadAccount(senderPub);

  // Build the transaction
  const txBuilder = new TransactionBuilder(senderAccount, {
    fee:        STELLAR_FEE_STROOPS,           // 100 stroops = 0.00001 XLM
    networkPassphrase: Networks.TESTNET,
  });

  // Add payment operation
  txBuilder.addOperation(
    Operation.payment({
      destination: receiverPublic,
      asset:       Asset.native(),             // XLM
      amount:      amountXLM,
    })
  );

  // Optional: attach a text memo (like a payment note)
  if (memo) {
    txBuilder.addMemo(Memo.text(memo.substring(0, 28))); // max 28 bytes
  }

  // Transactions expire after 30 seconds (safety net)
  txBuilder.setTimeout(30);

  const tx = txBuilder.build();

  // Sign with sender's secret key
  tx.sign(senderKP);

  // Submit to Stellar testnet
  const result = await getServer().submitTransaction(tx);

  const timeSeconds = Math.round((Date.now() - startTime) / 1000);

  return {
    hash:        result.hash,
    fee:         '0.00001',                    // 100 stroops in XLM
    timeSeconds,
    ledger:      result.ledger,
    explorerUrl: `https://stellar.expert/explorer/testnet/tx/${result.hash}`,
  };
}

// ── 4b. Build a fee-bump sponsored transaction (gasless UX foundation) ─────
export async function buildSponsoredPayment(
  senderSecret: string,
  sponsorSecret: string,
  receiverPublic: string,
  amountXLM: string,
  memo?: string
): Promise<SponsoredPaymentResult> {
  const senderKP = Keypair.fromSecret(senderSecret);
  const sponsorKP = Keypair.fromSecret(sponsorSecret);
  const senderAccount = await getServer().loadAccount(senderKP.publicKey());

  const innerTxBuilder = new TransactionBuilder(senderAccount, {
    fee: STELLAR_FEE_STROOPS,
    networkPassphrase: Networks.TESTNET,
  }).addOperation(
    Operation.payment({
      destination: receiverPublic,
      asset: Asset.native(),
      amount: amountXLM,
    })
  );

  if (memo) {
    innerTxBuilder.addMemo(Memo.text(memo.substring(0, 28)));
  }

  const innerTx = innerTxBuilder.setTimeout(30).build();
  innerTx.sign(senderKP);

  const feeBumpTx = TransactionBuilder.buildFeeBumpTransaction(
    sponsorKP.publicKey(),
    STELLAR_FEE_STROOPS,
    innerTx,
    Networks.TESTNET
  );
  feeBumpTx.sign(sponsorKP);

  return {
    feeSource: sponsorKP.publicKey(),
    senderPublicKey: senderKP.publicKey(),
    receiverPublicKey: receiverPublic,
    sponsoredFeeXLM: '0.00001',
    innerTransactionXdr: innerTx.toXDR(),
    feeBumpTransactionXdr: feeBumpTx.toXDR(),
  };
}

// ── 5. Fetch recent transactions for an account ───────────────────────────────
export async function getRecentTransactions(
  publicKey: string,
  limit = 10
): Promise<RecentTx[]> {
  try {
    const payments = await getServer()
      .payments()
      .forAccount(publicKey)
      .limit(limit)
      .order('desc')
      .call();

    const txs: RecentTx[] = [];

    for (const record of payments.records) {
      // We only care about payment operations
      if (record.type !== 'payment') continue;

      const r = record as {
        type: string;
        transaction_hash: string;
        from: string;
        to: string;
        amount: string;
        asset_type: string;
        asset_code?: string;
        created_at: string;
      };

      const isSent = r.from === publicKey;

      txs.push({
        id:          r.transaction_hash,
        type:        isSent ? 'sent' : 'received',
        amount:      parseFloat(r.amount).toFixed(4),
        asset:       r.asset_type === 'native' ? 'XLM' : (r.asset_code ?? 'UNKNOWN'),
        counterpart: isSent ? r.to : r.from,
        createdAt:   r.created_at,
      });
    }

    return txs;
  } catch {
    return [];
  }
}

// ── 6. INR ↔ XLM conversion (static rate for MVP) ────────────────────────────
// In production, fetch this from CoinGecko or Stellar DEX
export const STATIC_XLM_TO_INR = 10.5;  // fallback rate — update as needed

export function inrToXlm(inr: number, rate = STATIC_XLM_TO_INR): number {
  return inr / rate;
}

export function xlmToInr(xlm: number, rate = STATIC_XLM_TO_INR): number {
  return xlm * rate;
}

// ── 7. Fee breakdown helper ───────────────────────────────────────────────────
// Accepts an optional live XLM/INR rate (from useStellarPrice hook).
// Falls back to STATIC_XLM_TO_INR if not provided.
export function getFeeBreakdown(amountInr: number, xlmRate = STATIC_XLM_TO_INR) {
  const feeInr     = 0.10;          // flat fee in INR (you keep this)
  const networkFee = 0.003;         // Stellar fee ≈ ₹0.003
  const receiveAmt = amountInr - feeInr;
  const xlmAmount  = inrToXlm(receiveAmt, xlmRate);

  return {
    youSend:       amountInr.toFixed(2),
    platformFee:   feeInr.toFixed(2),
    networkFee:    networkFee.toFixed(3),
    receiverGets:  receiveAmt.toFixed(2),
    xlmAmount:     xlmAmount.toFixed(4),
    rate:          xlmRate,
  };
}

export { getServer as getHorizonServer };

// ── 8. Escrow via Stellar Claimable Balances ─────────────────────────────────

export interface EscrowBalance {
  id: string;
  amount: string;
  asset: string;
  sponsor: string;
  receiver: string;
  expiresAt: string;   // ISO date string
  isExpired: boolean;
  role: 'sender' | 'receiver';
}

// Recursively pull abs_before ISO date out of a Horizon ClaimPredicate object
function extractExpiry(predicate: Record<string, unknown>): string {
  if (typeof predicate.abs_before === 'string') return predicate.abs_before;
  if (predicate.not && typeof predicate.not === 'object')
    return extractExpiry(predicate.not as Record<string, unknown>);
  if (Array.isArray(predicate.and)) {
    for (const p of predicate.and) {
      const d = extractExpiry(p as Record<string, unknown>);
      if (d) return d;
    }
  }
  if (Array.isArray(predicate.or)) {
    for (const p of predicate.or) {
      const d = extractExpiry(p as Record<string, unknown>);
      if (d) return d;
    }
  }
  return '';
}

// Create a time-locked escrow using Stellar's native Claimable Balance feature.
// - Receiver can claim XLM before expiryDate.
// - Sender can reclaim (refund) after expiryDate.
export async function createEscrow(
  senderSecret: string,
  receiverPublic: string,
  amountXLM: string,
  expiryDate: Date
): Promise<{ hash: string; balanceId: string; explorerUrl: string }> {
  const senderKP = Keypair.fromSecret(senderSecret);
  const senderPublic = senderKP.publicKey();
  const senderAccount = await getServer().loadAccount(senderPublic);
  const expiryTimestamp = String(Math.floor(expiryDate.getTime() / 1000));

  const tx = new TransactionBuilder(senderAccount, {
    fee: STELLAR_FEE_STROOPS,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.createClaimableBalance({
        asset: Asset.native(),
        amount: amountXLM,
        claimants: [
          new Claimant(
            receiverPublic,
            Claimant.predicateBeforeAbsoluteTime(expiryTimestamp)
          ),
          new Claimant(
            senderPublic,
            Claimant.predicateNot(
              Claimant.predicateBeforeAbsoluteTime(expiryTimestamp)
            )
          ),
        ],
      })
    )
    .setTimeout(30)
    .build();

  tx.sign(senderKP);
  const result = await getServer().submitTransaction(tx);

  let balanceId = '';
  try {
    const ops = await getServer().operations().forTransaction(result.hash).call();
    const createOp = ops.records.find(op => op.type === 'create_claimable_balance');
    if (createOp) balanceId = (createOp as unknown as Record<string, string>).balance_id ?? '';
  } catch { /* non-critical — hash is sufficient */ }

  return {
    hash: result.hash,
    balanceId,
    explorerUrl: `https://stellar.expert/explorer/testnet/tx/${result.hash}`,
  };
}

// Fetch all claimable balances where publicKey is a claimant (both sent and received)
export async function getMyEscrows(publicKey: string): Promise<EscrowBalance[]> {
  try {
    const resp = await getServer()
      .claimableBalances()
      .claimant(publicKey)
      .limit(20)
      .order('desc')
      .call();

    return resp.records.map(b => {
      const rec = b as unknown as Record<string, unknown>;
      const isSender = rec.sponsor === publicKey;
      const claimants = (rec.claimants as Array<{ destination: string; predicate: Record<string, unknown> }>) ?? [];
      const otherClaimant = claimants.find(c => c.destination !== publicKey);
      const myClaimant = claimants.find(c => c.destination === publicKey);

      let expiresAt = '';
      if (isSender && otherClaimant?.predicate) {
        expiresAt = extractExpiry(otherClaimant.predicate);
      } else if (!isSender && myClaimant?.predicate) {
        expiresAt = extractExpiry(myClaimant.predicate);
      }

      const isExpired = expiresAt ? new Date(expiresAt) < new Date() : false;

      return {
        id: String(rec.id ?? ''),
        amount: parseFloat(String(rec.amount ?? '0')).toFixed(4),
        asset: rec.asset === 'native' ? 'XLM' : String(rec.asset ?? 'XLM'),
        sponsor: String(rec.sponsor ?? publicKey),
        receiver: isSender ? (otherClaimant?.destination ?? '') : publicKey,
        expiresAt,
        isExpired,
        role: isSender ? 'sender' : 'receiver',
      } as EscrowBalance;
    });
  } catch {
    return [];
  }
}

// Claim or refund a claimable balance.
// The Stellar network enforces the time predicate — the caller just needs to sign.
export async function claimEscrow(
  claimerSecret: string,
  balanceId: string
): Promise<TransactionResult> {
  const claimerKP = Keypair.fromSecret(claimerSecret);
  const claimerAccount = await getServer().loadAccount(claimerKP.publicKey());
  const startTime = Date.now();

  const tx = new TransactionBuilder(claimerAccount, {
    fee: STELLAR_FEE_STROOPS,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(Operation.claimClaimableBalance({ balanceId }))
    .setTimeout(30)
    .build();

  tx.sign(claimerKP);
  const result = await getServer().submitTransaction(tx);

  return {
    hash: result.hash,
    fee: '0.00001',
    timeSeconds: Math.round((Date.now() - startTime) / 1000),
    ledger: result.ledger,
    explorerUrl: `https://stellar.expert/explorer/testnet/tx/${result.hash}`,
  };
}

// ── 9. Submit a fee-bump sponsored payment ────────────────────────────────────
// Builds AND submits the fee-bump envelope so the sponsor actually pays the fee.
// NOTE: sponsorSecret must never be stored client-side in production.
export async function submitSponsoredPayment(
  senderSecret: string,
  sponsorSecret: string,
  receiverPublic: string,
  amountXLM: string,
  memo?: string
): Promise<TransactionResult> {
  const built = await buildSponsoredPayment(senderSecret, sponsorSecret, receiverPublic, amountXLM, memo);
  const feeBumpTx = TransactionBuilder.fromXDR(built.feeBumpTransactionXdr, Networks.TESTNET);
  const startTime = Date.now();
  const result = await getServer().submitTransaction(feeBumpTx);
  return {
    hash: result.hash,
    fee: built.sponsoredFeeXLM,
    timeSeconds: Math.round((Date.now() - startTime) / 1000),
    ledger: result.ledger,
    explorerUrl: `https://stellar.expert/explorer/testnet/tx/${result.hash}`,
  };
}
