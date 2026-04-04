/**
 * WalletContext.tsx
 * ──────────────────────────────────────────────
 * React Context that holds wallet state globally.
 * Any component can call useWallet() to access:
 *   - publicKey, secretKey
 *   - balance
 *   - recent transactions
 *   - loading / error states
 *
 * Wallet is persisted to localStorage so it survives page refresh.
 * WARNING: In production, NEVER store secret keys in localStorage —
 *          use a proper wallet like Freighter. For MVP/demo this is OK.
 */

'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import {
  generateKeypair,
  fundTestnetAccount,
  getAccountBalance,
  getRecentTransactions,
  RecentTx,
} from '@/lib/stellar';

// ── Types ────────────────────────────────────────────────────────────────────
interface WalletState {
  publicKey:    string | null;
  secretKey:    string | null;
  balance:      string;
  transactions: RecentTx[];
  isLoading:    boolean;
  isFunded:     boolean;
  error:        string | null;
  createdAt:    string | null;
}

interface WalletContextValue extends WalletState {
  createWallet:  () => Promise<void>;
  importWallet:  (secretKey: string) => Promise<void>;
  refreshBalance: () => Promise<void>;
  disconnect:    () => void;
}

// ── Context ──────────────────────────────────────────────────────────────────
const WalletContext = createContext<WalletContextValue | null>(null);

// ── Provider ─────────────────────────────────────────────────────────────────
export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>({
    publicKey:    null,
    secretKey:    null,
    balance:      '0',
    transactions: [],
    isLoading:    false,
    isFunded:     false,
    error:        null,
    createdAt:    null,
  });

  // ── Load from localStorage on mount ───────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem('stellarpay_wallet');
    if (stored) {
      try {
        const { publicKey, secretKey, createdAt } = JSON.parse(stored);
        setState(s => ({ ...s, createdAt: createdAt ?? null }));
        loadAccountData(publicKey, secretKey);
      } catch {
        localStorage.removeItem('stellarpay_wallet');
      }
    }
  }, []);

  // ── Load balance + transactions ────────────────────────────────────────────
  const loadAccountData = useCallback(async (pub: string, sec: string) => {
    setState(s => ({ ...s, isLoading: true, error: null, publicKey: pub, secretKey: sec }));
    try {
      const [balance, transactions] = await Promise.all([
        getAccountBalance(pub),
        getRecentTransactions(pub),
      ]);
      setState(s => ({
        ...s,
        balance,
        transactions,
        isLoading: false,
        isFunded:  parseFloat(balance) > 0,
      }));
    } catch (err) {
      setState(s => ({
        ...s,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load account',
      }));
    }
  }, []);

  // ── Create new wallet ──────────────────────────────────────────────────────
  const createWallet = async () => {
    setState(s => ({ ...s, isLoading: true, error: null }));
    try {
      const { publicKey, secretKey } = generateKeypair();

      // Fund with Friendbot (testnet only)
      await fundTestnetAccount(publicKey);

      // Save to localStorage with creation timestamp
      localStorage.setItem('stellarpay_wallet', JSON.stringify({ publicKey, secretKey, createdAt: new Date().toISOString() }));

      // Load balance
      await loadAccountData(publicKey, secretKey);
    } catch (err) {
      setState(s => ({
        ...s,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Wallet creation failed',
      }));
    }
  };

  // ── Import existing wallet ─────────────────────────────────────────────────
  const importWallet = async (secretKey: string) => {
    setState(s => ({ ...s, isLoading: true, error: null }));
    try {
      // Derive public key from secret
      const { Keypair } = await import('@stellar/stellar-sdk');
      const kp = Keypair.fromSecret(secretKey.trim());
      const publicKey = kp.publicKey();

      localStorage.setItem('stellarpay_wallet', JSON.stringify({ publicKey, secretKey }));
      await loadAccountData(publicKey, secretKey);
    } catch {
      setState(s => ({
        ...s,
        isLoading: false,
        error: 'Invalid secret key. Please check and try again.',
      }));
    }
  };

  // ── Refresh balance ────────────────────────────────────────────────────────
  const refreshBalance = async () => {
    if (!state.publicKey || !state.secretKey) return;
    await loadAccountData(state.publicKey, state.secretKey);
  };

  // ── Disconnect / logout ────────────────────────────────────────────────────
  const disconnect = () => {
    localStorage.removeItem('stellarpay_wallet');
    setState({
      publicKey:    null,
      secretKey:    null,
      balance:      '0',
      transactions: [],
      isLoading:    false,
      isFunded:     false,
      error:        null,
      createdAt:    null,
    });
  };

  return (
    <WalletContext.Provider value={{ ...state, createWallet, importWallet, refreshBalance, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used inside WalletProvider');
  return ctx;
}
