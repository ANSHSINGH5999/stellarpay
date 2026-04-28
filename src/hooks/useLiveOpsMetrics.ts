'use client';

/**
 * useLiveOpsMetrics
 * -----------------
 * Polls real external sources every 30 s:
 *   1. Stellar Horizon testnet — health + latency
 *   2. CoinGecko — live XLM / INR price
 *
 * Also drives a visible countdown so the UI can show
 * "Next refresh in X s" without a full page re-render.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

const REFRESH_MS   = 30_000;
const HORIZON_URL  = 'https://horizon-testnet.stellar.org';
const COINGECKO_URL =
  'https://api.coingecko.com/api/v3/simple/price?ids=stellar&vs_currencies=inr';

export interface LiveOpsMetrics {
  horizonOnline:     boolean;
  horizonLatencyMs:  number | null;
  xlmPriceInr:       number | null;
  lastUpdated:       Date | null;
  isRefreshing:      boolean;
  secondsToRefresh:  number;
  refresh:           () => void;
}

export function useLiveOpsMetrics(): LiveOpsMetrics {
  const [horizonOnline,    setHorizonOnline]    = useState(false);
  const [horizonLatencyMs, setHorizonLatencyMs] = useState<number | null>(null);
  const [xlmPriceInr,      setXlmPriceInr]      = useState<number | null>(null);
  const [lastUpdated,      setLastUpdated]      = useState<Date | null>(null);
  const [isRefreshing,     setIsRefreshing]     = useState(false);
  const [secondsToRefresh, setSecondsToRefresh] = useState(REFRESH_MS / 1000);

  const nextRefreshAt = useRef<number>(Date.now() + REFRESH_MS);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    nextRefreshAt.current = Date.now() + REFRESH_MS;

    // ── 1. Horizon ping ──────────────────────────────────────────────────────
    try {
      const t0  = Date.now();
      const res = await fetch(HORIZON_URL, { cache: 'no-store' });
      const ms  = Date.now() - t0;
      setHorizonOnline(res.ok);
      setHorizonLatencyMs(ms);
    } catch {
      setHorizonOnline(false);
      setHorizonLatencyMs(null);
    }

    // ── 2. XLM price ─────────────────────────────────────────────────────────
    try {
      const res  = await fetch(COINGECKO_URL, { cache: 'no-store' });
      const data = await res.json() as { stellar?: { inr?: number } };
      if (data?.stellar?.inr) setXlmPriceInr(data.stellar.inr);
    } catch {
      // keep previous price
    }

    setLastUpdated(new Date());
    setIsRefreshing(false);
  }, []);

  // ── Main polling loop ──────────────────────────────────────────────────────
  useEffect(() => {
    refresh();
    const id = setInterval(refresh, REFRESH_MS);
    return () => clearInterval(id);
  }, [refresh]);

  // ── Countdown ticker (every second) ────────────────────────────────────────
  useEffect(() => {
    const tick = setInterval(() => {
      const remaining = Math.max(0, Math.round((nextRefreshAt.current - Date.now()) / 1000));
      setSecondsToRefresh(remaining);
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  return {
    horizonOnline,
    horizonLatencyMs,
    xlmPriceInr,
    lastUpdated,
    isRefreshing,
    secondsToRefresh,
    refresh,
  };
}
