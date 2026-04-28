import { NextResponse } from 'next/server';

export async function GET() {
  let horizonStatus: 'ok' | 'error' = 'error';
  let horizonLatencyMs: number | null = null;

  try {
    const start = Date.now();
    const res = await fetch('https://horizon-testnet.stellar.org/', {
      next: { revalidate: 30 },
    });
    horizonLatencyMs = Date.now() - start;
    horizonStatus = res.ok ? 'ok' : 'error';
  } catch {
    horizonStatus = 'error';
  }

  return NextResponse.json({
    status: horizonStatus === 'ok' ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    checks: {
      app: 'ok',
      horizon: horizonStatus,
      horizonLatencyMs,
    },
    version: process.env.npm_package_version ?? '0.1.0',
  });
}
