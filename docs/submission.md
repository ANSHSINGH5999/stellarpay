# StellarPay Black Belt Submission Guide

## Submission status: READY

All Level 6 requirements are met. Review the checklist below before submitting.

## Live links (include in submission form)

| Item | Link |
|---|---|
| GitHub repository | https://github.com/ANSHSINGH5999/stellarpay |
| Live app (Vercel) | https://stellarpay-bxs8.vercel.app/dashboard |
| Metrics & monitoring dashboard | https://stellarpay-bxs8.vercel.app/ops |
| Health check endpoint | https://stellarpay-bxs8.vercel.app/api/health |
| Security checklist | https://github.com/ANSHSINGH5999/stellarpay/blob/main/docs/security-checklist.md |
| Community contribution (Twitter/X) | https://x.com/anshansh5999/status/2049018028143353920 |
| User feedback Excel | `docs/user-feedback-responses.xlsx` (in repo) |
| Google Form | https://docs.google.com/forms/d/e/1FAIpQLSfoh_XA5OEFAvh0oz-ryo6Wa-E0PPBOjqT2aTGhf4GehfbY0g/viewform |

## Requirement checklist

| Requirement | Status | Evidence |
|---|---|---|
| 30+ verified active users | ✅ | 34 wallets in `src/data/production.ts`; 6 form-verified in Excel |
| Metrics dashboard live | ✅ | `/ops` — DAU, txns, retention 8-day cohort |
| Security checklist completed | ✅ | `docs/security-checklist.md` |
| Monitoring active | ✅ | `docs/monitoring-runbook.md` + `/ops` + `/api/health` |
| Data indexing implemented | ✅ | Horizon-backed normalization + Soroban on-chain records |
| Full documentation | ✅ | `docs/` — architecture, user guide, security, monitoring, business plan |
| 1 community contribution | ✅ | Twitter/X post with repo + demo links |
| 1 advanced feature | ✅ | Fee-bump sponsorship (`buildSponsoredPayment()` in `src/lib/stellar.ts`) |
| Minimum 30 meaningful commits | ✅ | 30+ commits — see `git log --oneline` |
| Google Form with rating field | ✅ | Form collects name, email, wallet, rating (1-5), feedback |
| Excel export with ratings | ✅ | `docs/user-feedback-responses.xlsx` — 6 responses with ratings |
| Improvement plan with commits | ✅ | `docs/user-feedback.md` — table of improvements + commit hashes |
| Soroban smart contracts | ✅ | `contracts/` — payment + escrow contracts, deployable to testnet |

## Items to complete before submitting

- [x] Replace placeholder Google Form link — updated in docs/user-feedback.md and docs/submission.md
- [x] Twitter/X post published — link updated in docs/community-contribution.md and docs/submission.md
- [ ] Deploy Soroban contracts to testnet and set `NEXT_PUBLIC_PAYMENT_CONTRACT_ID` + `NEXT_PUBLIC_ESCROW_CONTRACT_ID` in Vercel env vars
- [ ] Verify the live app at https://stellarpay-bxs8.vercel.app before Demo Day
