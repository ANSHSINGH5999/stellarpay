# ⚡ StellarPay — Send Money Like a Message

> Instant, transparent, near-zero-fee money transfers powered by the Stellar blockchain.

![Stellar Testnet](https://img.shields.io/badge/Network-Stellar%20Testnet-blue)
![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🎯 Problem We're Solving

Traditional money transfers (NEFT, SWIFT, Western Union) are:
- **Slow** — 1–5 business days
- **Expensive** — 2–7% in hidden fees
- **Opaque** — receivers don't know how much they'll actually get

StellarPay fixes all three.

---

## 🚀 Live Demo

| Environment | URL |
|-------------|-----|
| Production  | https://stellarpay.vercel.app *(replace with yours)* |
| Testnet     | Uses Stellar Testnet — no real money |

---

## 📸 Screenshots

> Add screenshots of homepage, dashboard, and send flow here.

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                         USER (Browser)                         │
└─────────────────────┬──────────────────────────────────────────┘
                      │ HTTP / React
                      ▼
┌─────────────────────────────────────────┐
│         FRONTEND (Next.js + Tailwind)   │
│  ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│  │ Homepage │ │Dashboard │ │  Send   │ │
│  │(onboard) │ │(balance) │ │ (form)  │ │
│  └──────────┘ └──────────┘ └─────────┘ │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  WalletContext (React Context)  │    │
│  │  - Keypair (localStorage)       │    │
│  │  - Balance (from Horizon API)   │    │
│  │  - Transaction history          │    │
│  └──────────────┬──────────────────┘    │
│                 │                       │
│  ┌──────────────▼──────────────────┐    │
│  │   Stellar SDK (@stellar/sdk)    │    │
│  │   - TransactionBuilder          │    │
│  │   - Operation.payment()         │    │
│  │   - tx.sign(keypair)            │    │
│  └──────────────┬──────────────────┘    │
└─────────────────┼───────────────────────┘
                  │ HTTPS
                  ▼
┌─────────────────────────────────────────┐
│     STELLAR HORIZON API (Testnet)       │
│     https://horizon-testnet.stellar.org │
│                                         │
│  - Submit signed transactions           │
│  - Query account balances               │
│  - Fetch payment history                │
└─────────────────┬───────────────────────┘
                  │ Stellar Consensus Protocol
                  ▼
┌─────────────────────────────────────────┐
│       STELLAR NETWORK (Testnet)         │
│                                         │
│  - Federated Byzantine Agreement        │
│  - ~5 second finality                   │
│  - 100 stroops (0.00001 XLM) base fee   │
└─────────────────────────────────────────┘

Data Flow:
User fills form → Stellar SDK builds tx → Signs with secret key
→ Submits to Horizon → Network confirms → Success screen shown
```

---

## 🛠️ Tech Stack

| Layer      | Technology           | Why                                    |
|------------|----------------------|----------------------------------------|
| Frontend   | Next.js 14 + React   | Fast, SEO-friendly, easy deployment    |
| Styling    | Tailwind CSS         | Rapid UI, responsive by default        |
| Blockchain | Stellar SDK v12      | 5s finality, $0.003 fees, USDC support |
| Wallet     | In-app keypair       | Simple for MVP; Freighter ready        |
| Hosting    | Vercel               | One-click deploy from GitHub           |

---

## 📁 Project Structure

```
stellarpay/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout (NavBar + providers)
│   │   ├── globals.css         # Tailwind + global styles
│   │   ├── page.tsx            # Homepage — wallet onboarding
│   │   ├── dashboard/
│   │   │   └── page.tsx        # Balance dashboard
│   │   ├── send/
│   │   │   └── page.tsx        # Send money flow
│   │   └── history/
│   │       └── page.tsx        # Transaction history
│   ├── components/
│   │   └── ui/
│   │       └── NavBar.tsx      # Navigation bar
│   └── lib/
│       ├── stellar.ts          # All Stellar SDK logic
│       └── WalletContext.tsx   # Global wallet state
├── public/                     # Static assets
├── .env.example                # Environment variables template
├── next.config.js              # Next.js + webpack config
├── tailwind.config.js          # Design tokens
├── tsconfig.json               # TypeScript config
└── package.json                # Dependencies
```

---

## ⚙️ Local Setup (Step by Step)

### Prerequisites
- Node.js v18+ (`node --version`)
- npm or yarn
- Git

### Step 1 — Clone & Install

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/stellarpay.git
cd stellarpay

# Install dependencies
npm install
```

### Step 2 — Environment Setup

```bash
# Copy the example env file
cp .env.example .env.local

# Edit if needed (defaults work for testnet)
nano .env.local
```

### Step 3 — Run Development Server

```bash
npm run dev
# Open http://localhost:3000
```

### Step 4 — Create Your Test Wallet

1. Open http://localhost:3000
2. Click **"Create New Wallet"**
3. Wait ~5 seconds — Friendbot will fund it with **10,000 test XLM**
4. You're ready to send!

---

## 🔑 Demo: Create Wallet & Send Transaction

### Create a Sender Wallet
1. Go to http://localhost:3000
2. Click **Create New Wallet**
3. Copy your Public Key from the Dashboard

### Create a Receiver Wallet
1. Open a new Incognito window → http://localhost:3000
2. Click **Create New Wallet**
3. Copy the receiver's Public Key

### Send a Transaction
1. In the sender window → click **Send Money**
2. Enter amount: `₹500`
3. Paste the receiver's Public Key
4. Click **Review Transfer** → verify fee breakdown
5. Click **Confirm & Send**
6. Transaction confirms in **< 5 seconds** ⚡

### Verify on Stellar Explorer
1. Copy the **Transaction Hash** from the success screen
2. Visit: https://stellar.expert/explorer/testnet/tx/YOUR_TX_HASH
3. You'll see: sender, receiver, amount, fee, timestamp, ledger number

---

## 📊 Fee Transparency Example

```
You Send:         ₹500.00
─────────────────────────
Platform Fee:     −₹0.10
Network Fee:      −₹0.003
─────────────────────────
Receiver Gets:    ₹499.90  ✅

Compare to traditional transfers:
SWIFT fee:        −₹350–750  ❌
Time:             1–5 days   ❌
```

---

## 🌐 Deployment on Vercel

### Step 1 — Push to GitHub

```bash
# Initialize git (if not already)
git init
git add .
git commit -m "feat: initial stellarpay MVP"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/stellarpay.git
git push -u origin main
```

### Step 2 — Deploy on Vercel

1. Go to https://vercel.com/new
2. Click **Import Git Repository**
3. Select your `stellarpay` repo
4. Framework: **Next.js** (auto-detected)
5. Add environment variables:
   ```
   NEXT_PUBLIC_STELLAR_NETWORK = testnet
   NEXT_PUBLIC_HORIZON_URL     = https://horizon-testnet.stellar.org
   NEXT_PUBLIC_XLM_TO_INR      = 10.5
   ```
6. Click **Deploy** → done in ~60 seconds

### Step 3 — Custom Domain (Optional)

In Vercel dashboard → Domains → Add `stellarpay.yourdomain.com`

---

## 📝 Git Commit History (Minimum 10)

Use these as your actual commits:

```bash
git commit -m "feat: initialize Next.js project with Tailwind CSS"
git commit -m "feat: add Stellar SDK and core lib (stellar.ts)"
git commit -m "feat: implement WalletContext with create/import/disconnect"
git commit -m "feat: build homepage with wallet onboarding flow"
git commit -m "feat: add NavBar with wallet status indicator"
git commit -m "feat: build dashboard with balance and recent transactions"
git commit -m "feat: implement send money flow with 3-step UX"
git commit -m "feat: add transparent fee breakdown component"
git commit -m "feat: build transaction history page with explorer links"
git commit -m "feat: add INR-XLM conversion (static rate)"
git commit -m "style: polish UI — animations, responsive layout, dark theme"
git commit -m "docs: add comprehensive README with architecture diagram"
git commit -m "chore: add .env.example and deployment config"
```

---

## 📋 User Feedback System

### Google Form Setup

Create a Google Form with these fields:

| Field            | Type           | Options                   |
|------------------|----------------|---------------------------|
| Your Name        | Short answer   |                           |
| Email            | Short answer   |                           |
| Wallet Address   | Short answer   | (optional)                |
| Rating           | Linear scale   | 1–5                       |
| What went well?  | Paragraph      |                           |
| What was hard?   | Paragraph      |                           |
| Would you use it for real? | MCQ | Yes / Maybe / No        |

### Collecting Responses

1. In Google Forms → **Responses tab** → click the Sheets icon
2. This creates a linked Google Sheet
3. **Export to Excel**: File → Download → `.xlsx`
4. Add to your repo: `docs/user-feedback.xlsx`

### Sample Feedback Link

> https://forms.gle/YOUR_FORM_ID *(replace with your form)*

---

## 🔄 Feedback Iteration Plan

### Common User Problems

1. **"I don't know what XLM is"**
   - Fix: Add tooltips explaining XLM = digital currency for transfer rails
   - Commit: `fix: add XLM explainer tooltip on send page`

2. **"The address is too long and scary"**
   - Fix: Add QR code scanner for receiver address
   - Commit: `feat: add QR code address scanner`

3. **"I'm afraid of making a mistake"**
   - Fix: Add address book / saved contacts
   - Commit: `feat: add contact address book with save/load`

### Improvements

1. **Live XLM/INR rate** — fetch from CoinGecko every 60s
   ```bash
   git commit -m "feat: add live XLM/INR rate from CoinGecko API"
   ```

2. **USDC support** — stable transfers (no XLM price risk)
   ```bash
   git commit -m "feat: add USDC payment option via Stellar DEX"
   ```

3. **Mobile PWA** — installable on phone home screen
   ```bash
   git commit -m "feat: add PWA manifest and service worker for offline"
   ```

---

## 💰 Scale to $10K/Month — Startup Roadmap

### Revenue Model

| Stream               | How                                        | Potential          |
|----------------------|--------------------------------------------|--------------------|
| Transaction Fee      | ₹0.10 per transfer (vs ₹350 for SWIFT)    | 100K txs = ₹10K   |
| Premium Accounts     | ₹99/mo — bulk send, API access             | 100 users = ₹9.9K  |
| B2B API              | Freelancer platforms pay per transfer      | 10 clients = ₹50K  |
| Currency Spread      | 0.5% INR→USDC conversion spread           | Volume-based       |

### Go-to-Market

```
Month 1–2: Hackathon → Product validation
           → 50 beta users, collect feedback

Month 3–4: Launch on college WhatsApp groups
           → Students sending money home
           → Target: 500 users, 2000 transactions

Month 5–6: Partner with 3 freelancer communities
           → Upwork/Fiverr India groups
           → Target: 2000 users, 10K transactions/mo

Month 7–9: Launch B2B API for platforms
           → Target: 3 paying clients @ ₹5K/mo

Month 10–12: $10K MRR milestone
             → 5000 users + 3 B2B clients
```

### Path to Mainnet (Real Money)
1. Get Stellar Development Foundation grant (up to $250K)
   → https://communityfund.stellar.org
2. Register as payment aggregator (RBI guidelines)
3. Swap testnet → mainnet in one env variable change

---

## 🔒 Security Notes

- **This MVP stores secret keys in localStorage** — fine for demos/testnet
- **Production**: Integrate [Freighter Wallet](https://freighter.app/) (browser extension) — never touch secret keys
- Never deploy with real mainnet keys in a web app without a proper wallet integration

---

## 📚 Resources

- [Stellar Docs](https://developers.stellar.org/docs)
- [Horizon API Reference](https://developers.stellar.org/api)
- [Stellar Expert (Testnet Explorer)](https://stellar.expert/explorer/testnet)
- [Freighter Wallet Docs](https://docs.freighter.app)
- [SDF Community Fund](https://communityfund.stellar.org)

---

## 👥 Team

| Name | Role |
|------|------|
| [Your Name] | Full-Stack + Blockchain |

---

## 📄 License

MIT — build freely, give credit.

---

*Built for [Hackathon Name] · Powered by Stellar · Made with ❤️ in India*
