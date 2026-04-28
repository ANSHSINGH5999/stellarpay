# StellarPay Monitoring Runbook

## Health check endpoint

`GET https://stellarpay-bxs8.vercel.app/api/health`

Returns JSON with `status`, `horizonLatencyMs`, and `timestamp`. Use this for uptime monitoring.

## What is monitored

| Area | Signal | Implementation |
|---|---|---|
| App uptime | Vercel deployment health | `/api/health` endpoint + Vercel deployment dashboard |
| Horizon connectivity | HTTP GET to horizon-testnet.stellar.org | `useLiveOpsMetrics` hook pings on mount and every 30s |
| Horizon latency | Response time in ms | Displayed live in Ops Center header bar |
| Soroban RPC health | Contract info fetch | `getContractInfo()` in `src/lib/soroban.ts` |
| Wallet refresh path | Successful Horizon reads | Dashboard refresh and transaction history reload |
| Transaction submission | Success toast + explorer link | Send flow success state with tx hash |
| Indexer freshness | Refresh-triggered re-index | `WalletContext` reloads balance and payments on demand |
| User growth | DAU, tx count, retention | `/ops` Growth Metrics panel (8-day cohort) |

## Incident workflow

1. Open `/ops` — check the live Horizon status badge in the hero section.
2. If Horizon is offline: pause the demo, use Stellar Expert as source of truth.
3. If the app is broken: roll back to the previous healthy Vercel deployment via the Vercel dashboard.
4. If a Soroban contract call fails: check that `NEXT_PUBLIC_PAYMENT_CONTRACT_ID` and `NEXT_PUBLIC_ESCROW_CONTRACT_ID` are set correctly in Vercel env vars.
5. Log the incident: timestamp, symptom, affected feature, resolution.

## Soroban contract monitoring

| Contract | Watch for | Action |
|---|---|---|
| `payment_contract` | `get_payment()` returning null | Re-index — verify contract ID is correct |
| `escrow_contract` | Escrow stuck in Pending past expiry | Call `refund(escrow_id)` manually via Stellar CLI |
| Both contracts | "not deployed" badge in Ops Smart Contracts panel | Re-deploy and update env var in Vercel |

To manually check contract status via CLI:
```bash
stellar contract invoke \
  --id <PAYMENT_CONTRACT_ID> \
  --source deployer \
  --network testnet \
  -- payment_count
```

## Demo Day checklist

1. Open `/ops` before the presentation — confirm all panels load.
2. Verify Horizon badge shows "online" with a latency reading.
3. Confirm the Smart Contracts panel shows both contracts as "deployed" (or "checking" is acceptable).
4. Test one send flow end-to-end and keep the explorer hash ready.
5. Have the feedback spreadsheet (`docs/user-feedback-responses.xlsx`) open.
6. Keep `/api/health` response in a separate tab as a live status proof.
