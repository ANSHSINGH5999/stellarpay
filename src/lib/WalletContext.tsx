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
  signTxLocally,
  TESTNET_PASSPHRASE,
  RecentTx,
} from '@/lib/stellar';

export type ConnectionType = 'local' | 'freighter';

interface WalletState {
  publicKey:      string | null;
  secretKey:      string | null;
  balance:        string;
  transactions:   RecentTx[];
  isLoading:      boolean;
  isInitializing: boolean;
  isFunded:       boolean;
  error:          string | null;
  createdAt:      string | null;
  connectionType: ConnectionType | null;
}

interface WalletContextValue extends WalletState {
  createWallet:     () => Promise<void>;
  importWallet:     (secretKey: string) => Promise<void>;
  connectFreighter: () => Promise<void>;
  refreshBalance:   () => Promise<void>;
  disconnect:       () => void;
  signTx:           (unsignedXdr: string) => Promise<string>;
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
  connectionType: null,
};

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>(DEFAULT_STATE);

  const loadAccountData = useCallback(async (pub: string, sec: string | null) => {
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
        isFunded: parseFloat(balance) > 0,
      }));
    } catch (err) {
      setState(s => ({
        ...s,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load account',
      }));
    }
  }, []);

  // ── Restore session from localStorage ──────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem('stellarpay_wallet');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const { publicKey, secretKey, createdAt, connectionType } = parsed;
        const type: ConnectionType = connectionType === 'freighter' ? 'freighter' : 'local';

        setState(s => ({
          ...s,
          publicKey,
          secretKey: secretKey ?? null,
          createdAt:      createdAt ?? null,
          connectionType: type,
          isLoading:      true,
          isInitializing: false,
        }));
        loadAccountData(publicKey, secretKey ?? null);
      } catch {
        localStorage.removeItem('stellarpay_wallet');
        setState(s => ({ ...s, isInitializing: false }));
      }
    } else {
      setState(s => ({ ...s, isInitializing: false }));
    }
  }, [loadAccountData]);

  // ── Create new local wallet ────────────────────────────────────────────────
  const createWallet = async () => {
    setState(s => ({ ...s, isLoading: true, error: null }));
    try {
      const { publicKey, secretKey } = generateKeypair();
      await fundTestnetAccount(publicKey);
      const createdAt = new Date().toISOString();
      localStorage.setItem('stellarpay_wallet', JSON.stringify({
        connectionType: 'local',
        publicKey,
        secretKey,
        createdAt,
      }));
      setState(s => ({ ...s, publicKey, secretKey, createdAt, connectionType: 'local', isInitializing: false }));
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

  // ── Import existing local wallet via secret key ────────────────────────────
  const importWallet = async (secretKey: string) => {
    setState(s => ({ ...s, isLoading: true, error: null }));
    try {
      const publicKey = derivePublicKey(secretKey);
      localStorage.setItem('stellarpay_wallet', JSON.stringify({
        connectionType: 'local',
        publicKey,
        secretKey,
      }));
      setState(s => ({ ...s, publicKey, secretKey, connectionType: 'local', isInitializing: false }));
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

  // ── Connect Freighter wallet ───────────────────────────────────────────────
  const connectFreighter = async () => {
    setState(s => ({ ...s, isLoading: true, error: null }));
    try {
      const freighter = await import('@stellar/freighter-api');

      // 1. Check extension is installed
      const { isConnected: installed } = await freighter.isConnected();
      if (!installed) {
        throw new Error(
          'Freighter not found. Install the Freighter browser extension, then try again.'
        );
      }

      // 2. Request access — shows Freighter permission popup
      const accessResult = await freighter.requestAccess();
      if (accessResult.error) {
        throw new Error(accessResult.error.message || 'Freighter access denied');
      }
      const publicKey = accessResult.address;
      if (!publicKey) throw new Error('No address returned from Freighter');

      // 3. Verify Freighter is on testnet
      const networkResult = await freighter.getNetworkDetails();
      if (!networkResult.error && networkResult.networkPassphrase !== TESTNET_PASSPHRASE) {
        throw new Error(
          'Freighter is on the wrong network. Switch to "Testnet" in Freighter settings and try again.'
        );
      }

      const createdAt = new Date().toISOString();
      localStorage.setItem('stellarpay_wallet', JSON.stringify({
        connectionType: 'freighter',
        publicKey,
        createdAt,
      }));

      setState(s => ({
        ...s,
        publicKey,
        secretKey: null,
        connectionType: 'freighter',
        createdAt,
        isInitializing: false,
      }));
      await loadAccountData(publicKey, null);
    } catch (err) {
      setState(s => ({
        ...s,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to connect Freighter',
      }));
      throw err;
    }
  };

  // ── Sign a transaction XDR (routes to Freighter or local keypair) ──────────
  const signTx = useCallback(async (unsignedXdr: string): Promise<string> => {
    if (state.connectionType === 'freighter') {
      const freighter = await import('@stellar/freighter-api');
      const result = await freighter.signTransaction(unsignedXdr, {
        networkPassphrase: TESTNET_PASSPHRASE,
      });
      if (result.error) throw new Error(result.error.message || 'Freighter signing failed');
      return result.signedTxXdr;
    }
    if (state.connectionType === 'local' && state.secretKey) {
      return signTxLocally(state.secretKey, unsignedXdr);
    }
    throw new Error('No wallet connected');
  }, [state.connectionType, state.secretKey]);

  // ── Refresh balance + transactions ────────────────────────────────────────
  const refreshBalance = async () => {
    if (!state.publicKey) return;
    await loadAccountData(state.publicKey, state.secretKey);
  };

  // ── Disconnect ─────────────────────────────────────────────────────────────
  const disconnect = () => {
    localStorage.removeItem('stellarpay_wallet');
    setState({ ...DEFAULT_STATE, isInitializing: false });
  };

  return (
    <WalletContext.Provider value={{
      ...state,
      createWallet,
      importWallet,
      connectFreighter,
      refreshBalance,
      disconnect,
      signTx,
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used inside WalletProvider');
  return ctx;
}
