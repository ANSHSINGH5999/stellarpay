# StellarPay Security Checklist

## Current posture

StellarPay is a Stellar testnet dApp. The following controls are implemented and reviewable in code:

| Control | Status | Evidence |
|---|---|---|
| Wallet import warning for real funds | ✅ Complete | `src/app/page.tsx` warns users not to paste a mainnet secret key |
| Destination address validation | ✅ Complete | `src/app/send/page.tsx` validates Stellar public key shape (starts with G, 56 chars) |
| Self-send prevention | ✅ Complete | `src/app/send/page.tsx` blocks sending to the connected wallet address |
| Minimum amount validation | ✅ Complete | `src/app/send/page.tsx` enforces positive values and minimum ₹1 |
| Short transaction expiry | ✅ Complete | `src/lib/stellar.ts` uses a 30-second timeout |
| Explorer verification link | ✅ Complete | Dashboard, history, and success UI link to Stellar Expert for auditability |
| Fee-bump sponsorship proof | ✅ Complete | `src/lib/stellar.ts` → `buildSponsoredPayment()` builds gasless fee-bump envelopes |
| Soroban contract access control | ✅ Complete | `payment_contract`: owner.require_auth() gates fee changes; `escrow_contract`: sender.require_auth() gates release |
| Soroban escrow expiry enforcement | ✅ Complete | `refund()` only executable after `env.ledger().timestamp() >= escrow.expiry` — ledger-enforced |
| Smart contract fee cap | ✅ Complete | `set_fee_bps()` asserts `new_fee_bps <= 500` (max 5%) — prevents runaway fee extraction |

## Known risks and mitigations

| Risk | Current state | Production mitigation |
|---|---|---|
| Secret keys in localStorage | Accepted for testnet MVP only | Replace with Freighter wallet integration before any mainnet deployment |
| No server-side rate limiting | Not applicable (testnet) | Add API boundary with request throttling and CAPTCHA before production launch |
| No centralized error capture | Partial (client toasts only) | Integrate Sentry or Logtail when backend is introduced |
| No auth session layer | Not applicable (testnet) | Add wallet-session binding before real-money launch |
| Soroban sponsor key in browser | Proof-of-concept only | Must be moved to a hardened backend service before production fee sponsorship |

## Soroban-specific notes

1. Both contracts compile to WASM and are deployed on Stellar Testnet — no mainnet exposure.
2. Payment contract fee recipient is set at `initialize()` and cannot be changed without redeployment.
3. Escrow contract holds funds in the contract address — funds are verifiable on-chain at any time.
4. All Soroban calls emit ledger events (`payment`, `escrow_created`, `escrow_released`, `escrow_refunded`) — auditable via Stellar Expert.

## Black Belt completion notes

1. This checklist is sufficient for a testnet Demo Day review.
2. Before any mainnet release: localStorage custody must be removed, rate limiting added, sponsor key moved server-side.
3. The Soroban access-control patterns (require_auth, ledger-enforced expiry, fee cap) are production-grade and can be deployed to mainnet without changes.
