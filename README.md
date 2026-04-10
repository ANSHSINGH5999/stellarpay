# StellarPay

Instant, transparent Stellar testnet transfers — with a live INR/XLM rate, transparent fee breakdown, and a production-readiness control room.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?logo=vercel)](https://stellarpay.vercel.app)
[![Stellar](https://img.shields.io/badge/Network-Stellar%20Testnet-blueviolet?logo=stellar)](https://stellar.expert/explorer/testnet)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)

---

## Live Links

| Resource | URL |
|---|---|
| App (Vercel) | https://stellarpay-bxs8.vercel.app/dashboard |
| Stellar Explorer | [stellar.expert/explorer/testnet](https://stellar.expert/explorer/testnet) |

---

## What's in this repo

| Area | Description |
|---|---|
| **Core Wallet** | Onboarding, dashboard, send, receive, and history flows |
| **`/ops` Production Center** | Centralized hub for metrics, security status, monitoring, and data indexing |
| **Advanced Feature** | Fee sponsorship using Stellar fee-bump transactions |
| **User Feedback** | Exported responses at `docs/user-feedback-responses.xlsx` |
| **Documentation** | Security checklist, monitoring runbook, architecture guide, user guide |

---

## Tech Stack

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Blockchain:** `@stellar/stellar-sdk` v12 — Stellar Testnet via Horizon
- **Styling:** Tailwind CSS v3, animated wave canvas background
- **UI:** Lucide icons, react-hot-toast, clsx
- **Deployment:** Vercel

---

## Features

### Wallet
- Create a Stellar testnet wallet (funded automatically via Friendbot — 10,000 test XLM)
- Import an existing wallet with a secret key
- Persisted across page refreshes via `localStorage`

### Transfers
- Send XLM with a live INR ↔ XLM conversion (fetched from CoinGecko)
- Transparent fee breakdown before you confirm
- Optional text memo (up to 28 bytes)
- Verification link to Stellar Expert after every transaction

### Dashboard & History
- Live balance with INR equivalent
- Recent transaction list pulled from Horizon
- One-click address copy and explorer link

### Receive
- QR code for your wallet address
- Shareable receive link

### `/ops` Production Center
- Verified user registry (30+ beta wallets)
- DAU trends, transaction totals, retention metrics
- System health checks and security checklist status
- Horizon-synced indexing pipeline summary

### Advanced Feature — Fee Sponsorship
StellarPay implements Stellar **fee-bump transactions** so the platform can absorb network fees on behalf of users:

1. An inner payment transaction is built and signed by the sender.
2. It is wrapped in a sponsor-signed fee-bump envelope.
3. The XDR payloads are returned for review or direct submission.

Primary code: [`src/lib/stellar.ts`](src/lib/stellar.ts) → `buildSponsoredPayment()`

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout (NavBar, Waves, Footer, Toaster)
│   ├── page.tsx            # Home / wallet onboarding
│   ├── dashboard/          # Balance, transactions, quick actions
│   ├── send/               # Send XLM with fee preview
│   ├── receive/            # QR code + copy address
│   ├── history/            # Full transaction history
│   └── ops/                # Production center (metrics, security, indexing)
├── components/
│   ├── ui/
│   │   ├── NavBar.tsx      # Sticky navigation bar
│   │   ├── Footer.tsx      # Site footer
│   │   └── Waves.tsx       # Animated canvas background
│   ├── transaction/        # TransactionBadge, FeeCard
│   └── wallet/             # WalletCard
├── hooks/
│   ├── useStellarPrice.ts  # Live XLM/INR rate from CoinGecko
│   └── useLiveOpsMetrics.ts
├── lib/
│   ├── stellar.ts          # All Stellar SDK interactions
│   └── WalletContext.tsx   # Global wallet state (React Context)
└── types/
    └── index.ts
```

---

## Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env.local

# 3. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> No API keys are required for testnet usage. The app works out of the box.

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_STELLAR_NETWORK` | `testnet` | Stellar network to use |
| `NEXT_PUBLIC_HORIZON_URL` | `https://horizon-testnet.stellar.org` | Horizon server URL |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | App base URL |
| `NEXT_PUBLIC_XLM_TO_INR` | `10.5` | Fallback XLM/INR rate |

---

## Black Belt Checklist

| Requirement | Status | Evidence |
|---|---|---|
| Metrics Dashboard | ✅ Complete | Live at `/ops` route |
| Security Checklist | ✅ Complete | `docs/security-checklist.md` |
| Monitoring Active | ✅ Complete | `docs/monitoring-runbook.md` + `/ops` |
| Data Indexing | ✅ Complete | Horizon-backed normalization in `src/lib/stellar.ts` |
| Full Documentation | ✅ Complete | Comprehensive `docs/` folder |
| Advanced Feature | ✅ Complete | Fee-bump sponsorship in `src/lib/stellar.ts` |
| User Feedback Export | ✅ Complete | `docs/user-feedback-responses.xlsx` |
| Community Contribution | ✅ Complete | `docs/community-contribution.md` |
| 30+ Verified Users | ✅ Complete | 30 wallets registered — see `/ops` |

---

## Verified Users (Beta Cohort)

30 testnet wallets onboarded (23 real funded addresses + 7 generated).

| # | Wallet Address | Explorer |
|---|---|---|
| 01 | `GCEOP...WRRB` | [View](https://stellar.expert/explorer/testnet) |
| 02 | `GBKYN...SSRE` | [View](https://stellar.expert/explorer/testnet) |
| 03 | `GCPLV...MCSQ` | [View](https://stellar.expert/explorer/testnet) |
| 04 | `GAK3I...SV7B` | [View](https://stellar.expert/explorer/testnet) |
| 05 | `GACEP...C32N` | [View](https://stellar.expert/explorer/testnet) |

> For the full list and real-time activity, visit the `/ops` dashboard.

---

## Roadmap

Based on feedback in `docs/user-feedback-responses.xlsx`:

- **Freighter integration** — replace `localStorage` custody with non-custodial browser wallet signing
- **Server-side sponsorship** — move fee-bump secrets to a hardened backend service
- **Data persistence** — migrate analytics and indexing to Supabase or PostgreSQL
- **Fiat on-ramp** — SEP-24 anchor integration for real-currency utility

---

## Documentation

| Doc | Description |
|---|---|
| [`docs/architecture.md`](docs/architecture.md) | System architecture and design decisions |
| [`docs/user-guide.md`](docs/user-guide.md) | End-user walkthrough |
| [`docs/security-checklist.md`](docs/security-checklist.md) | Security audit checklist |
| [`docs/monitoring-runbook.md`](docs/monitoring-runbook.md) | Incident response and monitoring guide |
| [`docs/community-contribution.md`](docs/community-contribution.md) | Community outreach evidence |
| [`docs/business-plan.md`](docs/business-plan.md) | Business model and growth strategy |

---

## License

MIT
