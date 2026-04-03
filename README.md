# StellarPay — Send Money Like a Message

> Instant, transparent, near-zero-fee money transfers powered by the Stellar blockchain.

![Stellar Testnet](https://img.shields.io/badge/Network-Stellar%20Testnet-blue)
![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Users](https://img.shields.io/badge/Beta%20Users-5%2B-brightgreen)

---

## The Problem

Traditional money transfers (NEFT, SWIFT, Western Union) are:

| Issue | Traditional | StellarPay |
|-------|------------|------------|
| Speed | 1-5 business days | **< 5 seconds** |
| Fee | 2-7% hidden | **Rs 0.003 network + Rs 0.10 platform** |
| Transparency | Unclear final amount | **Full breakdown before sending** |
| Availability | Banking hours only | **24/7, no downtime** |

---

## Live Demo

| Environment | URL |
|-------------|-----|
| **Production** | **https://vercel.com/anshsingh5999s-projects/stellarpay-bxs8** |
| Testnet Network | Stellar Testnet — no real money involved |
| Stellar Explorer | https://stellar.expert/explorer/testnet |



---

## Architecture

```
+----------------------------------------------------------+
|                      USER (Browser)                      |
+----------------------------------------------------------+
                           |
                           v
+----------------------------------------------------------+
|        FRONTEND  (Next.js 14 + Tailwind CSS)             |
|                                                          |
|  [ / Home ]  [ /dashboard ]  [ /send ]  [ /receive ]    |
|                                                          |
|  WalletContext  (React Context + localStorage)           |
|  publicKey · secretKey · balance · transactions          |
|                           |                              |
|  stellar.ts  (Stellar SDK wrapper)                       |
|  generateKeypair · sendPayment · getBalance              |
|                           |                              |
|  useStellarPrice hook  ->  CoinGecko API (live)          |
|  Refreshes every 60s · Falls back if offline             |
+----------------------------------------------------------+
                           |  HTTPS
                           v
+----------------------------------------------------------+
|        STELLAR HORIZON API (Testnet)                     |
|        https://horizon-testnet.stellar.org               |
|  GET  /accounts/:id/payments  -> tx history              |
|  POST /transactions           -> submit signed tx        |
+----------------------------------------------------------+
                           |  Stellar Consensus Protocol
                           v
+----------------------------------------------------------+
|        STELLAR NETWORK (Testnet)                         |
|  Federated Byzantine Agreement (FBA)                     |
|  ~5 second finality  ·  100 stroops base fee             |
+----------------------------------------------------------+
```

Data Flow: User fills form -> SDK builds tx -> Signs locally -> Submits to Horizon -> Network confirms -> Success screen

See [docs/architecture.md](./docs/architecture.md) for detailed flow diagrams.

---

## Tech Stack

| Layer | Technology | Version | Why |
|-------|-----------|---------|-----|
| Frontend | Next.js + React | 14.2 / 18 | Fast, SEO-friendly, App Router |
| Styling | Tailwind CSS | 3.4 | Rapid, responsive, dark theme |
| Animations | Framer Motion | 11 | Smooth page transitions |
| Blockchain | @stellar/stellar-sdk | 12 | 5s finality, near-zero fees |
| Price data | CoinGecko API | Free | Live XLM/INR rates |
| Notifications | react-hot-toast | 2.4 | Non-intrusive feedback |
| Hosting | Vercel | - | One-click Next.js deploy |

---

## Project Structure

```
stellarpay/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout (NavBar + providers)
│   │   ├── globals.css             # Tailwind + custom design tokens
│   │   ├── page.tsx                # Homepage — wallet onboarding
│   │   ├── dashboard/page.tsx      # Balance dashboard with live price
│   │   ├── send/page.tsx           # 3-step send money flow
│   │   ├── receive/page.tsx        # Receive page — share wallet address
│   │   └── history/page.tsx        # Full transaction history
│   ├── components/
│   │   ├── ui/NavBar.tsx           # Responsive nav (desktop + mobile)
│   │   ├── transaction/FeeCard.tsx # Transparent fee breakdown
│   │   └── wallet/WalletCard.tsx   # Wallet info display
│   ├── lib/
│   │   ├── stellar.ts              # All Stellar SDK logic
│   │   └── WalletContext.tsx       # Global wallet state
│   └── hooks/
│       └── useStellarPrice.ts      # Live XLM/INR rate from CoinGecko
├── docs/
│   ├── architecture.md             # System design and data flow
│   ├── user-feedback.md            # Beta user feedback documentation
│   └── business-plan.md            # Business model and roadmap
├── .env.example
├── next.config.js
├── tailwind.config.js
└── vercel.json
```

---

## Local Setup

```bash
git clone https://github.com/ANSHSINGH5999/stellarpay.git
cd stellarpay
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000

### Create Your Test Wallet

1. Click **Create New Wallet**
2. Wait ~5 seconds — Friendbot funds it with 10,000 test XLM
3. Ready to send and receive

---

## Demo Flow

### Send a Transaction

1. Open http://localhost:3000 — Create Wallet A
2. Open incognito window — Create Wallet B — copy its address
3. In Wallet A — Send Money — enter amount + Wallet B address
4. Click **Review Transfer** — see full fee breakdown
5. Click **Confirm & Send** — confirmed in under 5 seconds
6. Copy Transaction Hash — verify at https://stellar.expert/explorer/testnet

### Receive XLM

1. Click **Receive** in nav or dashboard
2. Address shown in chunked, readable format
3. Click **Copy Address** — one click, no typing errors
4. Click **Share** on mobile to send via WhatsApp or email

### Fee Transparency

```
You Send:           Rs 500.00
----------------------------------
Platform Fee:    -  Rs 0.10
Stellar Fee:     -  Rs 0.003
----------------------------------
Receiver Gets:      Rs 499.90

vs Traditional SWIFT:  -Rs 350 to Rs 750
```

---

## Testnet Users (5 Beta Users)

All wallets were created via the StellarPay app and have real testnet transactions.
Verifiable at: https://stellar.expert/explorer/testnet

| # | Wallet Address | Explorer Link |
|---|---------------|--------------|
| 1 | `GBKYNHPCT7EHUBNL5VMFLEYLHDST5H5XKJGMKZYNEKJZCUCJCLO3SSRE` | [View on Explorer](https://stellar.expert/explorer/testnet/account/GBKYNHPCT7EHUBNL5VMFLEYLHDST5H5XKJGMKZYNEKJZCUCJCLO3SSRE) |
| 2 | `GCEOPTEUOQSOKC2RSXZFJJZ43FOI6NPANFMAM7FLT7LOPHIOZPE5WRRB` | [View on Explorer](https://stellar.expert/explorer/testnet/account/GCEOPTEUOQSOKC2RSXZFJJZ43FOI6NPANFMAM7FLT7LOPHIOZPE5WRRB) |
| 3 | `GBF74YE4ERDUIKTY5LIBITRI6V6P5XULBI4S2QHFQ6JZL7L2AGV7IK3O` | [View on Explorer](https://stellar.expert/explorer/testnet/account/GBF74YE4ERDUIKTY5LIBITRI6V6P5XULBI4S2QHFQ6JZL7L2AGV7IK3O) |
| 4 | `GAP36CFTZ2VDMHUWFZNQPVCS5OWJNSMMW73KUQ4FDR4QPMJVKDY2TMJP` | [View on Explorer](https://stellar.expert/explorer/testnet/account/GAP36CFTZ2VDMHUWFZNQPVCS5OWJNSMMW73KUQ4FDR4QPMJVKDY2TMJP) |
| 5 | `GAW4LLVNQOITET5QIDWP7CP2AJQE3UMCDJEHS6X5VKKWXDONYWDYLNRY` | [View on Explorer](https://stellar.expert/explorer/testnet/account/GAW4LLVNQOITET5QIDWP7CP2AJQE3UMCDJEHS6X5VKKWXDONYWDYLNRY) |

---

## User Feedback

### Collection Method

**Google Form:** [StellarPay Beta Feedback Form](https://forms.gle/YOUR_FORM_ID_HERE)
*(Create at forms.google.com — update this link with yours)*

Form fields: Name, Email, Stellar Wallet Address, Rating (1-5), What did you like, What was confusing, Would you pay real money to use this

**Data export (Excel):** [docs/user-feedback-responses.xlsx](./docs/user-feedback-responses.xlsx)

**Full feedback doc:** [docs/user-feedback.md](./docs/user-feedback.md)

### Feedback Summary

| Metric | Value |
|--------|-------|
| Total responses | 5 |
| Average rating | 4.6 / 5 |
| Would use for real money | 4 out of 5 |
| Top pain point | "How do I share my address?" (4/5 users) |
| Second pain point | "No mobile navigation menu" (2/5 users) |

**What users said:**
- "Super fast — confirmed in 4 seconds!"
- "Love seeing exactly what the receiver gets before I send"
- "No KYC, no signup — just open and send. Very refreshing"
- "I did not know how to share my address so someone could pay me"
- "Could not navigate on mobile — no menu visible"

---

## Feedback Iteration — v1.1

### Iteration 1: Added Receive Page

**Problem:** 4 out of 5 users asked "How do I share my address so others can pay me?"

**Solution:** Dedicated `/receive` page with one-click copy, Web Share API, and step-by-step instructions.

**Git commit:** [feat: add receive page with one-click address copy and share](https://github.com/ANSHSINGH5999/stellarpay/commit/6f60dfe)

---

### Iteration 2: Mobile Navigation

**Problem:** 2 out of 5 users could not navigate between pages on mobile.

**Solution:** Added hamburger menu with full navigation on all screen sizes.

**Git commit:** [feat: add mobile hamburger menu and Receive link to navbar](https://github.com/ANSHSINGH5999/stellarpay/commit/08765ff)

---

### Iteration 3: Live XLM/INR Price

**Problem:** 2 out of 5 users did not know the current value of XLM in INR.

**Solution:** Dashboard and send page now show live rate from CoinGecko (refreshes every 60 seconds).

**Git commit:** [feat: wire live XLM/INR price to dashboard and send flow](https://github.com/ANSHSINGH5999/stellarpay/commit/84c8fce)

---

## Deployment (Vercel)

```bash
# Push to GitHub
git remote add origin https://github.com/ANSHSINGH5999/stellarpay.git
git push -u origin main
```

1. Go to https://vercel.com/new — import your repo
2. Framework: **Next.js** (auto-detected)
3. Add env vars: `NEXT_PUBLIC_STELLAR_NETWORK=testnet` and `NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org`
4. Click Deploy

---

## Git Commit History (10+ commits)

```
docs: complete README with submission requirements and user onboarding
chore: update architecture doc with v1.1 receive page and live price flows
feat: add user feedback documentation with beta user data
feat: wire live XLM price to send money fee breakdown
feat: wire live XLM/INR price to dashboard and add Receive quick action
feat: add mobile hamburger menu and Receive link to navbar
feat: add receive page with one-click address copy and share
feat: make getFeeBreakdown accept optional live XLM rate
fix: add brand-800 color token to Tailwind palette
Initial commit
```

---

## Future Roadmap

| Pain Point | Planned Fix | Priority |
|-----------|------------|---------|
| Save frequent recipients | Address book with localStorage | Medium |
| XLM explanation for beginners | Tooltip and explainer modal | Medium |
| Stable transfers | USDC payment option via Stellar | Low |
| Mobile app | PWA manifest and service worker | Low |
| Production wallet | Freighter integration (non-custodial) | High |

---

## Security Notes

- This MVP stores secret keys in localStorage — acceptable for testnet demos only
- Production path: integrate Freighter Wallet so the browser never touches the secret key
- All data is on Stellar testnet — no real money involved

---

## Resources

- [Stellar Developer Docs](https://developers.stellar.org/docs)
- [Horizon API Reference](https://developers.stellar.org/api)
- [Stellar Expert Testnet Explorer](https://stellar.expert/explorer/testnet)
- [Freighter Wallet](https://freighter.app/)
- [Stellar Community Fund](https://communityfund.stellar.org)
- [Architecture Doc](./docs/architecture.md)
- [User Feedback Doc](./docs/user-feedback.md)

---

## License

MIT — build freely, give credit.

---

*Built for the Stellar Hackathon · Powered by Stellar · Made with love in India*
