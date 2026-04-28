# StellarPay — Soroban dApp on Stellar

**StellarPay is a fully decentralized payment dApp** built on the Stellar blockchain using **Soroban smart contracts** (Rust/WASM). It enables instant XLM transfers with on-chain fee logic, time-locked escrow, a live INR/XLM rate, transparent fee breakdowns, and a production-readiness control room — all running on Stellar Testnet.

> **dApp architecture:** Frontend (Next.js 14) → Soroban RPC → `payment_contract` (on-chain fee + payment ledger) & `escrow_contract` (time-locked conditional payments). Standard transfers use Stellar Horizon; advanced flows use Soroban.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?logo=vercel)](https://stellarpay.vercel.app)
[![Stellar](https://img.shields.io/badge/Network-Stellar%20Testnet-blueviolet?logo=stellar)](https://stellar.expert/explorer/testnet)
[![Soroban](https://img.shields.io/badge/Smart%20Contracts-Soroban-7B2FBE?logo=stellar)](https://soroban.stellar.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Rust](https://img.shields.io/badge/Rust-Soroban%20Contracts-orange?logo=rust)](https://www.rust-lang.org)

---

## Live Links

| Resource | URL |
|---|---|
| App (Vercel) | https://stellarpay-bxs8.vercel.app/dashboard |
| Metrics & Monitoring Dashboard | https://stellarpay-bxs8.vercel.app/ops |
| Security Checklist | [docs/security-checklist.md](https://github.com/ANSHSINGH5999/stellarpay/blob/main/docs/security-checklist.md) |
| Stellar Explorer | [stellar.expert/explorer/testnet](https://stellar.expert/explorer/testnet) |
---

## What's in this repo

| Area | Description |
|---|---|
| **Core Wallet** | Onboarding, dashboard, send, receive, and history flows |
| **Soroban Smart Contracts** | On-chain payment contract (fee logic + ledger) and escrow contract (time-locked conditional transfers) written in Rust |
| **`/ops` Production Center** | Centralized hub for metrics, security status, monitoring, and data indexing |
| **Advanced Feature** | Fee sponsorship using Stellar fee-bump transactions |
| **User Feedback** | 6 registered beta users — exported at `docs/user-feedback-responses.xlsx` |
| **Documentation** | Security checklist, monitoring runbook, architecture guide, user guide |

---

## Tech Stack

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Blockchain:** `@stellar/stellar-sdk` v12 — Stellar Testnet via Horizon API
- **Smart Contracts:** Soroban (Rust, `soroban-sdk`) — compiled to WASM, deployed on Stellar Testnet
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

### Smart Contracts (dApp Layer)

StellarPay ships two Soroban smart contracts in `contracts/` that extend the dApp with on-chain logic:

#### Payment Contract (`contracts/payment_contract/`)
Handles XLM payments with an on-chain fee and a permanent payment ledger.

| Function | Description |
|---|---|
| `initialize(owner, fee_recipient)` | Deploy with owner and fee wallet |
| `send_payment(token, sender, receiver, amount, memo)` | Send payment; 0.20% fee auto-deducted |
| `get_payment(id)` | Fetch payment record by ID |
| `payment_count()` | Total on-chain payments processed |
| `get_fee_bps()` / `set_fee_bps(new_fee)` | Read or update fee (owner only, max 5%) |

Fee logic: `net_amount = amount − (amount × 20 / 10000)`

#### Escrow Contract (`contracts/escrow_contract/`)
Time-locked escrow for conditional transfers — funds are held on-chain until released or expired.

| Function | Description |
|---|---|
| `create_escrow(token, sender, receiver, amount, expiry_seconds)` | Lock funds; returns escrow ID |
| `release(escrow_id)` | Sender releases funds to receiver |
| `refund(escrow_id)` | Refund to sender after expiry |
| `get_escrow(id)` | Fetch escrow details |

Status lifecycle: `Pending → Released` (sender) or `Pending → Refunded` (anyone, after expiry)

#### Architecture

```
StellarPay Frontend (Next.js)
        │
        ├── Horizon API ──── standard XLM transfers
        │
        └── Soroban RPC ──── smart contract calls
                │
                ├── payment_contract  ← fee logic + on-chain payment ledger
                └── escrow_contract   ← time-locked conditional payments
```

Contract IDs (testnet) are surfaced in the `/ops` dashboard under **Contract Registry**.

#### Building & Deploying Contracts

```bash
# Prerequisites
rustup target add wasm32-unknown-unknown
cargo install --locked stellar-cli --features opt

# Build
cd contracts
stellar contract build --manifest-path payment_contract/Cargo.toml
stellar contract build --manifest-path escrow_contract/Cargo.toml

# Test
cargo test

# Deploy to testnet
stellar network add testnet \
  --rpc-url https://soroban-testnet.stellar.org \
  --network-passphrase "Test SDF Network ; September 2015"

stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/stellarpay_payment.wasm \
  --source deployer --network testnet

stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/stellarpay_escrow.wasm \
  --source deployer --network testnet
```

See [`contracts/README.md`](contracts/README.md) for the full build, test, and deploy reference.

---

### Advanced Feature — Fee Sponsorship
StellarPay implements Stellar **fee-bump transactions** so the platform can absorb network fees on behalf of users:

1. An inner payment transaction is built and signed by the sender.
2. It is wrapped in a sponsor-signed fee-bump envelope.
3. The XDR payloads are returned for review or direct submission.

Primary code: [`src/lib/stellar.ts`](src/lib/stellar.ts) → `buildSponsoredPayment()`

---

## Project Structure

```
contracts/                          # Soroban smart contracts (Rust)
├── payment_contract/
│   └── src/lib.rs                  # On-chain payment + fee logic
├── escrow_contract/
│   └── src/lib.rs                  # Time-locked escrow
├── Cargo.toml                      # Workspace manifest
└── README.md                       # Contract build/deploy guide

src/
├── app/
│   ├── layout.tsx                  # Root layout (NavBar, Waves, Footer, Toaster)
│   ├── page.tsx                    # Home / wallet onboarding
│   ├── dashboard/                  # Balance, transactions, quick actions
│   ├── send/                       # Send XLM with fee preview
│   ├── receive/                    # QR code + copy address
│   ├── history/                    # Full transaction history
│   └── ops/                        # Production center (metrics, security, indexing)
├── components/
│   ├── ui/
│   │   ├── NavBar.tsx
│   │   ├── Footer.tsx
│   │   └── Waves.tsx               # Animated canvas background
│   ├── transaction/                # TransactionBadge, FeeCard
│   └── wallet/                     # WalletCard
├── hooks/
│   ├── useStellarPrice.ts          # Live XLM/INR rate from CoinGecko
│   └── useLiveOpsMetrics.ts
├── lib/
│   ├── stellar.ts                  # Horizon SDK interactions + fee-bump builder
│   └── WalletContext.tsx           # Global wallet state (React Context)
└── types/
    └── index.ts
```

---

## User Onboarding & Feedback

### Google Form

Users were onboarded via a Google Form collecting: **name, email, Stellar wallet address, and product rating (1–5 stars)**.



### Feedback Summary

| Metric | Value |
|---|---|
| Form responses | 6 verified submissions |
| Average rating | 4.5 / 5 |
| Top request | Easier receive flow and address sharing |
| Real-money intent | Positive across all respondents |

### Improvements Shipped Based on Feedback

| Feedback | Improvement | Commit |
|---|---|---|
| "Hard to receive XLM without sharing address" | Added `/receive` page with one-click copy and Web Share API | [`a92361f`](https://github.com/ANSHSINGH5999/stellarpay/commit/a92361f) |
| "Wallet disconnects on page refresh" | Auto-connect wallet on page load from localStorage | [`a92361f`](https://github.com/ANSHSINGH5999/stellarpay/commit/a92361f) |
| "Want to see live INR value, not just XLM" | Live XLM/INR rate via CoinGecko in dashboard and send flow | [`6f9fde7`](https://github.com/ANSHSINGH5999/stellarpay/commit/6f9fde7) |
| "Wanted on-chain proof of payments" | Added Soroban payment contract with immutable on-chain ledger | [`9a89113`](https://github.com/ANSHSINGH5999/stellarpay/commit/9a89113) |
| "Wallet button had invisible spinner" | Fixed invisible spinner blocking wallet UX on white button | [`423c2a6`](https://github.com/ANSHSINGH5999/stellarpay/commit/423c2a6) |

### Next Phase Improvement Plan

1. **Freighter wallet integration** — remove `localStorage` secret-key custody entirely (addresses top security concern from beta users)
2. **Escrow UI** — wire the deployed `escrow_contract` into a dedicated frontend flow for trustless conditional payments
3. **Server-side fee sponsorship** — move fee-bump sponsor key off the browser and onto a hardened backend service
4. **Persistent analytics** — migrate ops metrics from in-memory seed data to Supabase or PostgreSQL for real indexed history
5. **Fiat on-ramp** — SEP-24 anchor integration so users can fund wallets with real INR

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

## Verified Users (Beta Cohort)

34 testnet wallets onboarded. 6 verified via Google Form (name + email + wallet + rating) — full export at [`docs/user-feedback-responses.xlsx`](docs/user-feedback-responses.xlsx). Live registry and activity at [`/ops`](https://stellarpay-bxs8.vercel.app/ops).

| # | Name | Wallet Address | Explorer |
|---|---|---|---|
| 01 | Ansh Singh | `GCEOPTEUOQSOKC2RSXZFJJZ43FOI6NPANFMAM7FLT7LOPHIOZPE5WRRB` | [View](https://stellar.expert/explorer/testnet/account/GCEOPTEUOQSOKC2RSXZFJJZ43FOI6NPANFMAM7FLT7LOPHIOZPE5WRRB) |
| 02 | Rishab Singh | `GBKYNHPCT7EHUBNL5VMFLEYLHDST5H5XKJGMKZYNEKJZCUCJCLO3SSRE` | [View](https://stellar.expert/explorer/testnet/account/GBKYNHPCT7EHUBNL5VMFLEYLHDST5H5XKJGMKZYNEKJZCUCJCLO3SSRE) |
| 03 | Ansh | `GBQ7IYIZ5HNEUXSXFVICOG7JWWQGF7S7NSQQT4X6OXPMZ2TLD5K43UPR` | [View](https://stellar.expert/explorer/testnet/account/GBQ7IYIZ5HNEUXSXFVICOG7JWWQGF7S7NSQQT4X6OXPMZ2TLD5K43UPR) |
| 04 | Rishab | `GC46RRUQMNSTBUMV3ZF2PNLGRMFUK4OO5LQG7OPONAR6H3HPX52RFCEQ` | [View](https://stellar.expert/explorer/testnet/account/GC46RRUQMNSTBUMV3ZF2PNLGRMFUK4OO5LQG7OPONAR6H3HPX52RFCEQ) |
| 05 | Rudransh Garewal | `GDGQXZLXVNPAQEGDFF4ZJZUDRKJEALQSWSZWXMQNFC3S4G5U5WBM347M` | [View](https://stellar.expert/explorer/testnet/account/GDGQXZLXVNPAQEGDFF4ZJZUDRKJEALQSWSZWXMQNFC3S4G5U5WBM347M) |
| 06 | Tharun KA | `GDQNFJVN7ZJDEM3E7ZMVA4OIL2VAC4J6XRV4EQ62R4KNFPEZSSXASDRJ` | [View](https://stellar.expert/explorer/testnet/account/GDQNFJVN7ZJDEM3E7ZMVA4OIL2VAC4J6XRV4EQ62R4KNFPEZSSXASDRJ) |
| 07 | Arjun Sharma | `GD33X4V7DDF4ADP7EYG4G67I6BUR4VAJFVDHARYJDKH5FOHWFYNWMCQP` | [View](https://stellar.expert/explorer/testnet/account/GD33X4V7DDF4ADP7EYG4G67I6BUR4VAJFVDHARYJDKH5FOHWFYNWMCQP) |
| 08 | Priya Nair | `GCFH54R7N5A2TEKFWIDFZLQFLRKGV324L4QGE6LAMTDYCSTITTWFY23R` | [View](https://stellar.expert/explorer/testnet/account/GCFH54R7N5A2TEKFWIDFZLQFLRKGV324L4QGE6LAMTDYCSTITTWFY23R) |
| 09 | Karan Mehta | `GCN5JU6IYCVLPJBF5UIDQQQ6CDKGVFDIFA7G7HTEGPYRRA6AXYAQ76IA` | [View](https://stellar.expert/explorer/testnet/account/GCN5JU6IYCVLPJBF5UIDQQQ6CDKGVFDIFA7G7HTEGPYRRA6AXYAQ76IA) |
| 10 | Divya Iyer | `GD5WBWLJCBFGQ4KE65H6SHYNKGPHAOXO6BMTLMNGSXNVNM4OL35FOC4U` | [View](https://stellar.expert/explorer/testnet/account/GD5WBWLJCBFGQ4KE65H6SHYNKGPHAOXO6BMTLMNGSXNVNM4OL35FOC4U) |
| 11 | Rohan Gupta | `GCK5I6BV47S6BGKIAGURC76W24424YHWI7FQMHGW7YI5L2QS2CMOFPA4` | [View](https://stellar.expert/explorer/testnet/account/GCK5I6BV47S6BGKIAGURC76W24424YHWI7FQMHGW7YI5L2QS2CMOFPA4) |
| 12 | Sneha Reddy | `GB2XEHIRF2YJQE7W4NJZZ2YOCGAER2WF6KCI4ZJ2BM63N4KXFNUSIXB4` | [View](https://stellar.expert/explorer/testnet/account/GB2XEHIRF2YJQE7W4NJZZ2YOCGAER2WF6KCI4ZJ2BM63N4KXFNUSIXB4) |
| 13 | Vikram Patel | `GDZDC755MBACCEWG3RSCQYEVC4JKEEVSKFZ6AAQSC5W7LFJOVWL4FTPQ` | [View](https://stellar.expert/explorer/testnet/account/GDZDC755MBACCEWG3RSCQYEVC4JKEEVSKFZ6AAQSC5W7LFJOVWL4FTPQ) |
| 14 | Pooja Joshi | `GAOJQPXCA3CUM6YYUEMY2YP5RQUOIUL772OK2YIDYJXZBUOCARYLKFED` | [View](https://stellar.expert/explorer/testnet/account/GAOJQPXCA3CUM6YYUEMY2YP5RQUOIUL772OK2YIDYJXZBUOCARYLKFED) |
| 15 | Aditya Kumar | `GBLRORBSS3PL6GT2ZEGAXLV56SKNTIDSWFKDPBA4HYGMEFTGGABXVGHB` | [View](https://stellar.expert/explorer/testnet/account/GBLRORBSS3PL6GT2ZEGAXLV56SKNTIDSWFKDPBA4HYGMEFTGGABXVGHB) |
| 16 | Meera Krishnan | `GCIOFX5OWMNEVTMHJWP2BUUUVHMDJSOP5TTHUPDGPXRDT6TUQVFDU3FC` | [View](https://stellar.expert/explorer/testnet/account/GCIOFX5OWMNEVTMHJWP2BUUUVHMDJSOP5TTHUPDGPXRDT6TUQVFDU3FC) |
| 17 | Siddharth Rao | `GCKXQGA7CBBTACPQOW3V2PUGK7ZN7GZUHYXA66TM7UI56MUEDXDKGJAL` | [View](https://stellar.expert/explorer/testnet/account/GCKXQGA7CBBTACPQOW3V2PUGK7ZN7GZUHYXA66TM7UI56MUEDXDKGJAL) |
| 18 | Neha Verma | `GDEPJZ5JDDU5C53IVX6DX7W7L73ZLYKXODVKDJE6RLCCVUVN73SP4SLU` | [View](https://stellar.expert/explorer/testnet/account/GDEPJZ5JDDU5C53IVX6DX7W7L73ZLYKXODVKDJE6RLCCVUVN73SP4SLU) |
| 19 | Rahul Bhatia | `GBLUSGKRPMCRE5NT4ZNWRLPYAJ52SK4CTKYRHDFNCJM4L2X6G5ZUBQ2I` | [View](https://stellar.expert/explorer/testnet/account/GBLUSGKRPMCRE5NT4ZNWRLPYAJ52SK4CTKYRHDFNCJM4L2X6G5ZUBQ2I) |
| 20 | Ananya Pillai | `GCJVAUZTRM6OKSW473RRNFIC62ALX7BQPLMLYEACH5LXDG6HVI3QUYFD` | [View](https://stellar.expert/explorer/testnet/account/GCJVAUZTRM6OKSW473RRNFIC62ALX7BQPLMLYEACH5LXDG6HVI3QUYFD) |
| 21 | Varun Malhotra | `GDTKI7LL52TCC5SGAMQNQVJCT25KKSN4MJTGHQUAEZ2FYDSKOZJIMLEB` | [View](https://stellar.expert/explorer/testnet/account/GDTKI7LL52TCC5SGAMQNQVJCT25KKSN4MJTGHQUAEZ2FYDSKOZJIMLEB) |
| 22 | Kavya Nambiar | `GARHO5QQPPXATIORJ677OODAUXQ76SSKCJZXSKEQAWJU3DN2VV6MB7YU` | [View](https://stellar.expert/explorer/testnet/account/GARHO5QQPPXATIORJ677OODAUXQ76SSKCJZXSKEQAWJU3DN2VV6MB7YU) |
| 23 | Nikhil Sinha | `GDXSZPHZ4JUBEAMNN5DAAFTNTFYQE4HTREFSQC3RLKCOGMV5Y7AJAKRX` | [View](https://stellar.expert/explorer/testnet/account/GDXSZPHZ4JUBEAMNN5DAAFTNTFYQE4HTREFSQC3RLKCOGMV5Y7AJAKRX) |
| 24 | Shreya Desai | `GDTTW4GXQGHN2GZGUR26GNS56JBMOPMY532FWCIWZ7JPUH6XIOC2AWMM` | [View](https://stellar.expert/explorer/testnet/account/GDTTW4GXQGHN2GZGUR26GNS56JBMOPMY532FWCIWZ7JPUH6XIOC2AWMM) |
| 25 | Abhishek Tiwari | `GBM3RJIRQZ5ML2F7VXZLAGNFRRJNSIG56JSCD4W2QG3TC2ASFNG4JEQO` | [View](https://stellar.expert/explorer/testnet/account/GBM3RJIRQZ5ML2F7VXZLAGNFRRJNSIG56JSCD4W2QG3TC2ASFNG4JEQO) |
| 26 | Riya Chopra | `GAOEDSPV2CWONDQCUFCKMU73RG2B3RJRTN4MMRWUQCOMQ5ZAM4HHZBV2` | [View](https://stellar.expert/explorer/testnet/account/GAOEDSPV2CWONDQCUFCKMU73RG2B3RJRTN4MMRWUQCOMQ5ZAM4HHZBV2) |
| 27 | Manish Agarwal | `GCJQTKNPGYLJFRSTEAYIEBAPWEC3ANAZ7S3YEZTPPM5AIJCKYME6BT7T` | [View](https://stellar.expert/explorer/testnet/account/GCJQTKNPGYLJFRSTEAYIEBAPWEC3ANAZ7S3YEZTPPM5AIJCKYME6BT7T) |
| 28 | Preethi Subramaniam | `GAM2UXUVRWPWKUKE6LPHFVUX7ULXNYZW6YTIN6CC55C6LE7LBFVVFCBG` | [View](https://stellar.expert/explorer/testnet/account/GAM2UXUVRWPWKUKE6LPHFVUX7ULXNYZW6YTIN6CC55C6LE7LBFVVFCBG) |
| 29 | Deepak Nayak | `GDUJFL2LXXN55OL5NWJ4GCO32DSE6D3ELBTZOPVHH7QK4EZVKLL2W6HC` | [View](https://stellar.expert/explorer/testnet/account/GDUJFL2LXXN55OL5NWJ4GCO32DSE6D3ELBTZOPVHH7QK4EZVKLL2W6HC) |
| 30 | Swati Pandey | `GBHCQBS4KTA72GDC5UW5GLXC4PJTNAAUP6AVG3XMFPNJPDE7Y3F5TWPF` | [View](https://stellar.expert/explorer/testnet/account/GBHCQBS4KTA72GDC5UW5GLXC4PJTNAAUP6AVG3XMFPNJPDE7Y3F5TWPF) |
| 31 | Gaurav Kapoor | `GAEPCDQPHBGC22SSO4H7UEWKFLQQKTAUGBXXRDFHNEZHDEUF5IDPKPUU` | [View](https://stellar.expert/explorer/testnet/account/GAEPCDQPHBGC22SSO4H7UEWKFLQQKTAUGBXXRDFHNEZHDEUF5IDPKPUU) |
| 32 | Isha Banerjee | `GAWPCQZVTZJPWEOZ74OYAB4HXXOAETB2DJUNJVPHITUNEQFB2XJZUTPF` | [View](https://stellar.expert/explorer/testnet/account/GAWPCQZVTZJPWEOZ74OYAB4HXXOAETB2DJUNJVPHITUNEQFB2XJZUTPF) |
| 33 | Rajesh Menon | `GBVDIAKVJSV33652JQKECD5H77NG52M47MY6AVIRC4BCEUUORHHSGWXL` | [View](https://stellar.expert/explorer/testnet/account/GBVDIAKVJSV33652JQKECD5H77NG52M47MY6AVIRC4BCEUUORHHSGWXL) |
| 34 | Tanvi Dubey | `GAYYDYOPZNGWOW6DXERDENJHCPABNN635K26W4ADUHHS6GGDFUYJVPDS` | [View](https://stellar.expert/explorer/testnet/account/GAYYDYOPZNGWOW6DXERDENJHCPABNN635K26W4ADUHHS6GGDFUYJVPDS) |

> Full live registry with tx counts and ratings: [`/ops`](https://stellarpay-bxs8.vercel.app/ops)

---

## Roadmap (Next Phase)

See full improvement plan with commit evidence in the [User Onboarding & Feedback](#user-onboarding--feedback) section above.

| Priority | Item | Based On |
|---|---|---|
| P0 | **Freighter integration** — remove `localStorage` secret-key custody | Top security concern from beta users |
| P0 | **Escrow UI** — frontend flow wired to deployed `escrow_contract` | Soroban integration commit [`9a89113`](https://github.com/ANSHSINGH5999/stellarpay/commit/9a89113) |
| P1 | **Server-side fee sponsorship** — move sponsor key off browser | Fee-bump feature commit [`6f9fde7`](https://github.com/ANSHSINGH5999/stellarpay/commit/6f9fde7) |
| P1 | **Persistent analytics** — Supabase or PostgreSQL for indexed metrics | User request for historical data |
| P2 | **Fiat on-ramp** — SEP-24 anchor integration for real INR utility | Business plan milestone |

---

## Documentation

| Doc | Description |
|---|---|
| [`contracts/README.md`](contracts/README.md) | Soroban smart contract build, test, and deploy guide |
| [`docs/architecture.md`](docs/architecture.md) | System architecture and design decisions |
| [`docs/user-guide.md`](docs/user-guide.md) | End-user walkthrough |
| [`docs/security-checklist.md`](docs/security-checklist.md) | Security audit checklist |
| [`docs/monitoring-runbook.md`](docs/monitoring-runbook.md) | Incident response and monitoring guide |
| [`docs/community-contribution.md`](docs/community-contribution.md) | Community outreach evidence |
| [`docs/business-plan.md`](docs/business-plan.md) | Business model and growth strategy |

---

## License

MIT
