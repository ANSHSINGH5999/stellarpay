# StellarPay Monitoring Runbook

## Objective

Provide a simple operator playbook for Demo Day and early production-style testing.

## What is monitored

| Area | Signal | Current implementation |
|---|---|---|
| App uptime | Vercel deployment health | Deployment target and rollback-ready setup |
| Wallet refresh path | Successful Horizon reads | Dashboard refresh action and transaction history refresh |
| Transaction submission | Success toast plus explorer link | Send flow success state and transaction hash |
| Index freshness | Refresh-triggered re-index | `WalletContext` reloads account balance and recent payments |
| User growth | DAU, tx count, retention | `/ops` dashboard |

## Incident workflow

1. Confirm whether the issue is UI-only or Horizon/network-related.
2. Refresh the wallet and compare the app state with Stellar Expert.
3. If Horizon is slow, pause the demo flow and use explorer links as source of truth.
4. If the deployed app is broken, roll back to the previous healthy Vercel deployment.
5. Log the incident in the Demo Day notes with timestamp, symptom, and resolution.

## Demo Day checklist

1. Open `/ops` before the presentation.
2. Confirm the verified user registry is visible.
3. Test one send flow and keep the explorer hash ready.
4. Keep the feedback spreadsheet and architecture doc open in adjacent tabs.
