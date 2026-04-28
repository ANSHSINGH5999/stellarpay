/**
 * useStellarPrice.ts
 * ──────────────────────────────────────────────
 * Custom hook that fetches the live XLM/INR price
 * from CoinGecko every 60 seconds.
 *
 * Falls back to the static rate from .env if the
 * API call fails (e.g. offline / rate-limited).
 *
 * Usage:
 *   const { xlmToInr, isLoading, lastUpdated } = useStellarPrice();
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

const _parsed       = parseFloat(process.env.NEXT_PUBLIC_XLM_TO_INR ?? '');
const FALLBACK_RATE = Number.isFinite(_parsed) && _parsed > 0 ? _parsed : 10.5;
const REFRESH_MS    = 60_000;  // 60 seconds

interface PriceState {
  rate:        number;   // 1 XLM in INR
  isLoading:   boolean;
  lastUpdated: Date | null;
  error:       string | null;
}

export function useStellarPrice() {
  const [state, setState] = useState<PriceState>({
    rate:        FALLBACK_RATE,
    isLoading:   true,
    lastUpdated: null,
    error:       null,
  });

  const fetchPrice = useCallback(async () => {
    try {
      // CoinGecko free API — no key needed
      const res = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=stellar&vs_currencies=inr',
        { cache: 'no-store' }
      );
      if (!res.ok) throw new Error('CoinGecko error');

      const data: { stellar?: { inr?: number } } = await res.json();
      const rate = data?.stellar?.inr;

      if (rate && rate > 0) {
        setState({ rate, isLoading: false, lastUpdated: new Date(), error: null });
      } else {
        throw new Error('Invalid rate');
      }
    } catch (err) {
      // Use fallback — don't break the UI
      setState(s => ({
        ...s,
        rate:      FALLBACK_RATE,
        isLoading: false,
        error:     'Using cached rate',
      }));
    }
  }, []);

  useEffect(() => {
    fetchPrice();
    const interval = setInterval(fetchPrice, REFRESH_MS);
    return () => clearInterval(interval);
  }, [fetchPrice]);

  // Helper converters
  const xlmToInr = (xlm: number) => xlm * state.rate;
  const inrToXlm = (inr: number) => inr / state.rate;

  return {
    ...state,
    xlmToInr,
    inrToXlm,
  };
}
