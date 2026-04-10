/**
 * types/index.ts
 * ──────────────────────────────────────────────
 * Central TypeScript type definitions for StellarPay.
 * Import from here: import type { Transfer } from '@/types';
 */

// ── Wallet ────────────────────────────────────────────────────────────────────
export interface Wallet {
  publicKey:  string;
  secretKey?: string;  // Only in memory, never persisted to DB
  balance:    string;  // XLM balance as string (Stellar uses string amounts)
  network:    'testnet' | 'mainnet';
}

// ── Transfer ──────────────────────────────────────────────────────────────────
export interface Transfer {
  id?:          string;
  senderKey:    string;
  receiverKey:  string;
  amountXLM:    string;
  amountINR?:   number;
  memo?:        string;
  fee:          string;       // in XLM
  status:       TransferStatus;
  txHash?:      string;
  createdAt?:   Date;
  confirmedAt?: Date;
  ledger?:      number;
}

export type TransferStatus = 'pending' | 'confirmed' | 'failed';

// ── Fee breakdown ─────────────────────────────────────────────────────────────
export interface FeeBreakdown {
  youSend:       string;   // INR
  platformFee:   string;   // INR
  networkFee:    string;   // INR
  receiverGets:  string;   // INR
  xlmAmount:     string;   // XLM
}

// ── Transaction (from Horizon API) ────────────────────────────────────────────
export interface Transaction {
  id:          string;
  type:        'sent' | 'received';
  amount:      string;
  asset:       string;       // 'XLM', 'USDC', etc.
  counterpart: string;       // other party's address
  createdAt:   string;       // ISO date string
  explorerUrl: string;
}

// ── Currency conversion ───────────────────────────────────────────────────────
export interface ConversionRate {
  xlmToInr:    number;
  xlmToUsd:    number;
  lastUpdated: Date;
}

// ── User feedback (Google Form → exported data) ────────────────────────────────
export interface UserFeedback {
  name:      string;
  email:     string;
  wallet?:   string;
  rating:    1 | 2 | 3 | 4 | 5;
  whatWell:  string;
  whatHard:  string;
  wouldUse:  'Yes' | 'Maybe' | 'No';
  timestamp: string;
}
