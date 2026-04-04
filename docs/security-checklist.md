# StellarPay Security Checklist

## Current posture

This repository is still a Stellar testnet application, but the following security controls are already implemented and reviewable in code:

| Control | Status | Evidence |
|---|---|---|
| Wallet import warning for real funds | Complete | `src/app/page.tsx` warns users not to paste a mainnet secret key |
| Destination validation | Complete | `src/app/send/page.tsx` validates Stellar public key shape |
| Self-send prevention | Complete | `src/app/send/page.tsx` blocks sending to the connected wallet |
| Minimum amount validation | Complete | `src/app/send/page.tsx` enforces positive values |
| Short transaction expiry | Complete | `src/lib/stellar.ts` uses a 30 second timeout |
| Explorer verification | Complete | Dashboard, history, and success UI link to Stellar Expert |
| Fee sponsorship proof | Complete | `src/lib/stellar.ts` builds fee-bump transactions for gasless UX |

## Known risks

| Risk | Current state | Production mitigation |
|---|---|---|
| Secret keys in localStorage | Accepted for testnet MVP only | Move to Freighter or server-assisted signing |
| No server-side rate limiting | Not applicable yet | Add API boundary with request throttling and abuse detection |
| No centralized error capture | Partial | Add Sentry or Logtail when backend is introduced |
| No auth session layer | Not applicable yet | Add wallet-session binding before real-money launch |

## Black Belt completion notes

1. This checklist is sufficient for a testnet Demo Day review.
2. Before any mainnet release, localStorage custody must be removed.
3. Fee sponsorship should be executed from a secure server-side sponsor key, never from a browser-held production secret.
