/**
 * WalletContext.tsx
 * ──────────────────────────────────────────────
 * React Context that holds wallet state globally.
 * Any component can call useWallet() to access:
 *   - publicKey, secretKey
 *   - balance
 *   - recent transactions
 *   - loading / error states
 *   - isInitializing — true until the localStorage check on mount completes.
 *     Protected pages must wait for this to be false before redirecting.
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
  derivePublicKey,
  fundTestnetAccount,
  getAccountBalance,
  getRecentTransactions,
  RecentTx,
} from '@/lib/stellar';

// ── Types ────────────────────────────────────────────────────────────────────
interface WalletState {
  publicKey:      string | null;
  secretKey:      string | null;
  balance:        string;
  transactions:   RecentTx[];
  isLoading:      boolean;
  isInitializing: boolean;   // true until first localStorage check is done
  isFunded:       boolean;
  error:          string | null;
  createdAt:      string | null;
}

interface WalletContextValue extends WalletState {
  createWallet:   () => Promise<void>;
  importWallet:   (secretKey: string) => Promise<void>;
  refreshBalance: () => Promise<void>;
  disconnect:     () => void;
}

const DEFAULT_STATE: WalletState = {
  publicKey:      null,
  secretKey:      null,
  balance:        '0',
  transactions:   [],
  isLoading:      false,
  isInitializing: true,
  isFunded:       false,
  error:          null,
  createdAt:      null,
};

// ── Context ──────────────────────────────────────────────────────────────────
const WalletContext = createContext<WalletContextValue | null>(null);

// ── Provider ─────────────────────────────────────────────────────────────────
export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>(DEFAULT_STATE);

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

  // ── Load from localStorage on mount ──────────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem('stellarpay_wallet');
    if (stored) {
      try {
        const { publicKey, secretKey, createdAt } = JSON.parse(stored);
        setState(s => ({
          ...s,
          publicKey,
          secretKey,
          createdAt:      createdAt ?? null,
          isLoading:      true,
          isInitializing: false,
        }));
        loadAccountData(publicKey, secretKey);
      } catch {
        localStorage.removeItem('stellarpay_wallet');
        setState(s => ({ ...s, isInitializing: false }));
      }
    } else {
      // No stored wallet — show the landing page so the user explicitly
      // creates or imports their own wallet.
      setState(s => ({ ...s, isInitializing: false }));
    }
  }, [loadAccountData]);

  // ── Create new wallet ──────────────────────────────────────────────────────
  const createWallet = async () => {
    setState(s => ({ ...s, isLoading: true, error: null }));
    try {
      const { publicKey, secretKey } = generateKeypair();
      await fundTestnetAccount(publicKey);
      const createdAt = new Date().toISOString();
      localStorage.setItem('stellarpay_wallet', JSON.stringify({ publicKey, secretKey, createdAt }));
      // Set publicKey immediately so the redirect to /dashboard fires without
      // a brief flash of the login form while loadAccountData is in-flight.
      setState(s => ({ ...s, publicKey, secretKey, createdAt, isInitializing: false }));
      await loadAccountData(publicKey, secretKey);
    } catch (err) {
      setState(s => ({
        ...s,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Wallet creation failed',
      }));
      throw err;
    }
  };

  // ── Import existing wallet ─────────────────────────────────────────────────
  const importWallet = async (secretKey: string) => {
    setState(s => ({ ...s, isLoading: true, error: null }));
    try {
      const publicKey = derivePublicKey(secretKey);
      localStorage.setItem('stellarpay_wallet', JSON.stringify({ publicKey, secretKey }));
      setState(s => ({ ...s, publicKey, secretKey, isInitializing: false }));
      await loadAccountData(publicKey, secretKey);
    } catch (err) {
      setState(s => ({
        ...s,
        isLoading: false,
        error: 'Invalid secret key. Please check and try again.',
      }));
      throw err;
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
    setState({ ...DEFAULT_STATE, isInitializing: false });
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
