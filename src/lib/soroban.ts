import {
  SorobanRpc,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  Contract,
  Address,
  nativeToScVal,
  scValToNative,
  xdr,
} from '@stellar/stellar-sdk';

export const SOROBAN_RPC_URL =
  process.env.NEXT_PUBLIC_SOROBAN_RPC_URL ?? 'https://soroban-testnet.stellar.org';

export const PAYMENT_CONTRACT_ID =
  process.env.NEXT_PUBLIC_PAYMENT_CONTRACT_ID ?? '';

export const ESCROW_CONTRACT_ID =
  process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ID ?? '';

const rpc = new SorobanRpc.Server(SOROBAN_RPC_URL);

export interface ContractInfo {
  id: string;
  deployed: boolean;
  explorerUrl: string;
}

// Check if a contract is live on testnet by fetching its ledger entry.
export async function getContractInfo(contractId: string): Promise<ContractInfo> {
  const explorerUrl = contractId
    ? `https://stellar.expert/explorer/testnet/contract/${contractId}`
    : '';

  if (!contractId) {
    return { id: '', deployed: false, explorerUrl: '' };
  }

  try {
    await rpc.getContractData(
      contractId,
      xdr.ScVal.scvLedgerKeyContractInstance(),
      SorobanRpc.Durability.Persistent,
    );
    return { id: contractId, deployed: true, explorerUrl };
  } catch {
    return { id: contractId, deployed: false, explorerUrl };
  }
}

// Simulate a read-only contract call and return the u64 result.
// Uses the caller's existing account so no extra funding is needed.
async function simulateU64Call(
  contractId: string,
  fnName: string,
  sourcePublicKey: string,
): Promise<number | null> {
  if (!contractId || !sourcePublicKey) return null;
  try {
    const account = await rpc.getAccount(sourcePublicKey);
    const contract = new Contract(contractId);

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(contract.call(fnName))
      .setTimeout(30)
      .build();

    const sim = await rpc.simulateTransaction(tx);

    if (SorobanRpc.Api.isSimulationSuccess(sim) && sim.result?.retval) {
      return Number(scValToNative(sim.result.retval));
    }
    return null;
  } catch {
    return null;
  }
}

// Get the on-chain payment count from the deployed payment contract.
export async function getPaymentContractCount(
  callerPublicKey: string,
): Promise<number | null> {
  return simulateU64Call(PAYMENT_CONTRACT_ID, 'payment_count', callerPublicKey);
}

// Get the on-chain escrow count from the deployed escrow contract.
export async function getEscrowContractCount(
  callerPublicKey: string,
): Promise<number | null> {
  return simulateU64Call(ESCROW_CONTRACT_ID, 'escrow_count', callerPublicKey);
}

export interface ContractPaymentParams {
  senderPublicKey: string;
  receiverPublicKey: string;
  tokenContractId: string;
  amountStroops: bigint;
  memo: string;
}

// Build and simulate a payment through the Soroban payment contract.
// Returns the simulation response so the caller can inspect fees and
// auth entries before signing and submitting.
export async function simulateContractPayment(
  params: ContractPaymentParams,
): Promise<SorobanRpc.Api.SimulateTransactionResponse> {
  const { senderPublicKey, receiverPublicKey, tokenContractId, amountStroops, memo } =
    params;

  const account = await rpc.getAccount(senderPublicKey);
  const contract = new Contract(PAYMENT_CONTRACT_ID);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      contract.call(
        'send_payment',
        Address.fromString(tokenContractId).toScVal(),
        Address.fromString(senderPublicKey).toScVal(),
        Address.fromString(receiverPublicKey).toScVal(),
        nativeToScVal(amountStroops, { type: 'i128' }),
        nativeToScVal(memo, { type: 'string' }),
      ),
    )
    .setTimeout(30)
    .build();

  return rpc.simulateTransaction(tx);
}

export interface EscrowParams {
  senderPublicKey: string;
  receiverPublicKey: string;
  tokenContractId: string;
  amountStroops: bigint;
  expirySeconds: number;
}

// Build and simulate creating an escrow through the Soroban escrow contract.
export async function simulateCreateEscrow(
  params: EscrowParams,
): Promise<SorobanRpc.Api.SimulateTransactionResponse> {
  const { senderPublicKey, receiverPublicKey, tokenContractId, amountStroops, expirySeconds } =
    params;

  const account = await rpc.getAccount(senderPublicKey);
  const contract = new Contract(ESCROW_CONTRACT_ID);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      contract.call(
        'create_escrow',
        Address.fromString(tokenContractId).toScVal(),
        Address.fromString(senderPublicKey).toScVal(),
        Address.fromString(receiverPublicKey).toScVal(),
        nativeToScVal(amountStroops, { type: 'i128' }),
        nativeToScVal(BigInt(expirySeconds), { type: 'u64' }),
      ),
    )
    .setTimeout(30)
    .build();

  return rpc.simulateTransaction(tx);
}
