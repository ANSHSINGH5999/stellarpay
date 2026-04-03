# StellarPay — Architecture & Data Flow

## System Architecture

```
╔══════════════════════════════════════════════════════════════════════╗
║                         STELLARPAY MVP                               ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║   ┌─────────────────────────────────────────────────────────────┐   ║
║   │                   BROWSER / CLIENT                          │   ║
║   │                                                             │   ║
║   │  ┌───────────┐  ┌──────────────┐  ┌───────────────────┐   │   ║
║   │  │  / (Home) │  │ /dashboard   │  │     /send         │   │   ║
║   │  │           │  │              │  │                   │   │   ║
║   │  │ Create    │  │ Balance Card │  │ Amount Input      │   │   ║
║   │  │ Wallet    │  │ Quick Actions│  │ Fee Breakdown     │   │   ║
║   │  │ Import    │  │ Recent Txns  │  │ Confirm & Send    │   │   ║
║   │  └─────┬─────┘  └──────┬───────┘  └─────────┬─────────┘   │   ║
║   │        │               │                     │             │   ║
║   │        └───────────────┼─────────────────────┘             │   ║
║   │                        │                                   │   ║
║   │           ┌────────────▼──────────────────┐                │   ║
║   │           │        WalletContext           │                │   ║
║   │           │  (React Context + localStorage)│                │   ║
║   │           │                               │                │   ║
║   │           │  publicKey, secretKey          │                │   ║
║   │           │  balance, transactions         │                │   ║
║   │           │  createWallet / importWallet   │                │   ║
║   │           └────────────┬──────────────────┘                │   ║
║   │                        │                                   │   ║
║   │           ┌────────────▼──────────────────┐                │   ║
║   │           │         stellar.ts             │                │   ║
║   │           │  (Stellar SDK wrapper)         │                │   ║
║   │           │                               │                │   ║
║   │           │  generateKeypair()             │                │   ║
║   │           │  fundTestnetAccount()          │                │   ║
║   │           │  getAccountBalance()           │                │   ║
║   │           │  sendPayment()                 │                │   ║
║   │           │  getRecentTransactions()       │                │   ║
║   │           │  getFeeBreakdown()             │                │   ║
║   └───────────┴────────────┬──────────────────┴────────────────┘   ║
║                            │ HTTPS                                  ║
╠════════════════════════════╪═════════════════════════════════════════╣
║                            │                                        ║
║   ┌────────────────────────▼──────────────────────────────────┐    ║
║   │              STELLAR HORIZON API (Testnet)                 │    ║
║   │         https://horizon-testnet.stellar.org                │    ║
║   │                                                            │    ║
║   │  GET  /accounts/:id          → balance, sequence           │    ║
║   │  GET  /accounts/:id/payments → transaction history         │    ║
║   │  POST /transactions          → submit signed transaction   │    ║
║   └────────────────────────┬──────────────────────────────────┘    ║
║                            │ Stellar Consensus Protocol             ║
║   ┌────────────────────────▼──────────────────────────────────┐    ║
║   │              STELLAR NETWORK (Testnet)                     │    ║
║   │                                                            │    ║
║   │  Validators: ~5 second block time                          │    ║
║   │  Consensus:  Federated Byzantine Agreement (FBA)           │    ║
║   │  Fee:        100 stroops = 0.00001 XLM ≈ ₹0.003           │    ║
║   │  Finality:   Immediate (no forks, no reorgs)               │    ║
║   └────────────────────────────────────────────────────────────┘    ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## Send Money — Detailed Flow

```
User fills form
     │
     ▼
Frontend validates:
  ✓ Amount > 0
  ✓ Address starts with G, 56 chars
  ✓ Not sending to self
  ✓ Sufficient balance
     │
     ▼
Show fee breakdown:
  youSend    = ₹500
  platformFee = ₹0.10
  networkFee  = ₹0.003
  receiverGets = ₹499.90
  xlmAmount   = 47.6095 XLM
     │
     ▼
User clicks "Confirm & Send"
     │
     ▼
stellar.ts: sendPayment()
  1. Keypair.fromSecret(senderSecret)
  2. server.loadAccount(senderPublicKey)
     → gets account sequence number
  3. new TransactionBuilder(account, { fee, networkPassphrase })
     .addOperation(Operation.payment({
         destination: receiverPublicKey,
         asset: Asset.native(),
         amount: "47.6095"
     }))
     .addMemo(Memo.text(memo))
     .setTimeout(30)
     .build()
  4. tx.sign(senderKeypair)
  5. server.submitTransaction(tx)
     │
     ▼
Horizon validates & broadcasts
  → Stellar nodes reach consensus
  → Transaction included in ledger
  → HTTP 200 response with tx hash
     │
     ▼
Success screen shows:
  ✓ Transaction Hash (link to Explorer)
  ✓ Time taken (usually 3–5 seconds)
  ✓ Fee paid (0.00001 XLM)
  ✓ Ledger number
```

---

## Wallet Creation Flow

```
User clicks "Create New Wallet"
     │
     ▼
generateKeypair()
  → Keypair.random()
  → { publicKey: "GABC...", secretKey: "SABC..." }
     │
     ▼
fundTestnetAccount(publicKey)
  → GET https://friendbot.stellar.org?addr=GABC...
  → Friendbot creates account with 10,000 XLM
     │
     ▼
localStorage.setItem('stellarpay_wallet', JSON.stringify({...}))
     │
     ▼
getAccountBalance(publicKey)
  → server.loadAccount(publicKey)
  → find balance where asset_type === 'native'
  → returns "10000.0000"
     │
     ▼
WalletContext updated → all components re-render
```

---

## INR ↔ XLM Conversion

```
Static (MVP):
  XLM_TO_INR = 10.5
  inrToXlm(₹500) = 500 / 10.5 = 47.619 XLM

Live (production with useStellarPrice hook):
  CoinGecko API: GET /simple/price?ids=stellar&vs_currencies=inr
  Response: { "stellar": { "inr": 10.47 } }
  Refreshed every 60 seconds
```

---

## File → Component Responsibility Map

| File | Responsibility |
|------|---------------|
| `src/lib/stellar.ts` | All Stellar SDK calls — one source of truth |
| `src/lib/WalletContext.tsx` | Global wallet state — shares data across all pages |
| `src/app/page.tsx` | Onboarding — create or import wallet |
| `src/app/dashboard/page.tsx` | Balance overview + recent transactions + live rate |
| `src/app/send/page.tsx` | The core UX — 3-step send flow with live rate |
| `src/app/receive/page.tsx` | Receive page — share address, copy/share button |
| `src/app/history/page.tsx` | Full transaction history with filtering |
| `src/components/ui/NavBar.tsx` | Responsive navigation (desktop + mobile hamburger) |
| `src/components/transaction/FeeCard.tsx` | Transparent fee breakdown display |
| `src/components/wallet/WalletCard.tsx` | Compact wallet info display |
| `src/hooks/useStellarPrice.ts` | Live XLM/INR rate from CoinGecko (used in dashboard, send, receive) |
| `src/types/index.ts` | TypeScript types — single source of truth |

---

## v1.1 Changes (Post User Feedback)

### New: `/receive` page flow

```
User clicks "Receive" in nav or dashboard
     │
     ▼
ReceivePage renders:
  - publicKey displayed in chunked format (8 chars per group)
  - "Copy Address" button → navigator.clipboard.writeText(publicKey)
  - "Share" button → navigator.share() (Web Share API, mobile)
  - Instructions: 4 steps for how to receive XLM
  - Live rate: useStellarPrice() hook
     │
     ▼
Sender enters the address in /send page
  - Validates: starts with 'G', exactly 56 chars
  - Not equal to sender's own address
     │
     ▼
Transaction flows normally via sendPayment()
```

### Updated: Live XLM/INR Rate

```
useStellarPrice() hook:
  1. On mount: fetch CoinGecko /simple/price?ids=stellar&vs_currencies=inr
  2. Returns { rate, xlmToInr(), inrToXlm(), lastUpdated }
  3. Sets interval: refetch every 60 seconds
  4. On error: falls back to STATIC_XLM_TO_INR (10.5)

Used in:
  - dashboard/page.tsx → balanceInr display
  - send/page.tsx → feeBreakdown.xlmAmount calculation
  - receive/page.tsx → rate display
```
