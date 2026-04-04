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
  Networks,
  TransactionBuilder,
  BASE_FEE,
  Operation,
  Asset,
  Memo,
} from '@stellar/stellar-sdk';

// ── Network config ──────────────────────────────────────────────────────────
const TESTNET_URL = 'https://horizon-testnet.stellar.org';
const server      = new Horizon.Server(TESTNET_URL);

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

// ── 2. Fund a new testnet account via Friendbot ───────────────────────────────
export async function fundTestnetAccount(publicKey: string): Promise<void> {
  const response = await fetch(
    `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`
  );
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Friendbot failed: ${text}`);
  }
}

// ── 3. Fetch account balance ─────────────────────────────────────────────────
export async function getAccountBalance(publicKey: string): Promise<string> {
  try {
    const account = await server.loadAccount(publicKey);
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
  const senderAccount = await server.loadAccount(senderPub);

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
  const result = await server.submitTransaction(tx);

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
  const senderAccount = await server.loadAccount(senderKP.publicKey());

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
    const payments = await server
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

export { server };
