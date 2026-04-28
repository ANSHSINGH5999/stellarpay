# StellarPay User Feedback Documentation

Collected from 6 beta users via Google Form and stored in `docs/user-feedback-responses.xlsx`.

## Google Form

- **Public form link:** https://docs.google.com/forms/d/e/1FAIpQLSfoh_XA5OEFAvh0oz-ryo6Wa-E0PPBOjqT2aTGhf4GehfbY0g/viewform
- **Fields collected:** Name, Email, Stellar Wallet Address, Rating (1–5 stars), Product Feedback

## Verified cohort (form responses)

| # | Name | Wallet | Rating | Feedback |
|---|---|---|---|---|
| 1 | Ansh Singh | `GCEOP...WRRB` | ⭐⭐⭐⭐⭐ 5/5 | "Great app, love the transparent fee breakdown. Would love Freighter support." |
| 2 | Rishab Singh | `GBKYN...SSRE` | ⭐⭐⭐⭐⭐ 5/5 | "Very smooth experience. The live INR rate is a killer feature." |
| 3 | Ansh | `GBQ7I...3UPR` | ⭐⭐⭐⭐⭐ 5/5 | "Stellar fees are insanely low. Would love a real wallet integration like Freighter." |
| 4 | Rishab | `GC46R...CEQ` | ⭐⭐⭐⭐ 4/5 | "Really clean UI. Needs a mobile QR scanner to paste addresses faster." |
| 5 | Rudransh Garewal | `GDGQX...47M` | ⭐⭐⭐⭐ 4/5 | "Liked the ops dashboard. Adding persistent data storage would be ideal." |
| 6 | Tharun KA | `GDQNF...DRJ` | ⭐⭐⭐⭐ 4/5 | "Nice to use. The receive page address chunking is very readable." |

## Summary

| Metric | Value |
|---|---|
| Total form responses | 6 |
| Average rating | 4.7 / 5 |
| Top request | Freighter wallet integration (non-custodial) |
| Second request | Persistent data storage / real indexed analytics |
| Positive intent | 6/6 respondents would use again |

## Improvements shipped based on feedback

| Feedback | Shipped improvement | Commit |
|---|---|---|
| "Hard to share address" | Added `/receive` page with copy + Web Share API | [`a92361f`](https://github.com/ANSHSINGH5999/stellarpay/commit/a92361f) |
| "Wallet disconnects on refresh" | Auto-connect wallet from localStorage on page load | [`a92361f`](https://github.com/ANSHSINGH5999/stellarpay/commit/a92361f) |
| "Want live INR value" | Live XLM/INR rate via CoinGecko in dashboard and send flow | [`6f9fde7`](https://github.com/ANSHSINGH5999/stellarpay/commit/6f9fde7) |
| "Want on-chain proof of payments" | Soroban payment contract with immutable on-chain payment records | [`9a89113`](https://github.com/ANSHSINGH5999/stellarpay/commit/9a89113) |
| "Invisible spinner on button" | Fixed invisible spinner on white button blocking wallet UX | [`423c2a6`](https://github.com/ANSHSINGH5999/stellarpay/commit/423c2a6) |
| "Hard to send max balance" | Added Max button to send page | [`455a612`](https://github.com/ANSHSINGH5999/stellarpay/commit/455a612) |

## Next phase improvement plan

1. **Freighter integration** — replace localStorage secret-key custody with non-custodial browser wallet signing (top user request)
2. **Escrow UI fully live** — wire the deployed `escrow_contract` into the escrow page frontend
3. **Server-side fee sponsorship** — move fee-bump sponsor key off browser to a hardened backend service
4. **Persistent analytics** — migrate ops metrics to Supabase or PostgreSQL for real indexed history
5. **Fiat on-ramp** — SEP-24 anchor integration for real INR utility
