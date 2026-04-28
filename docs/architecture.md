# StellarPay — Architecture & Data Flow

## System Architecture

```
╔══════════════════════════════════════════════════════════════════════════╗
║                    STELLARPAY — Soroban dApp                             ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║   ┌──────────────────────────────────────────────────────────────────┐   ║
║   │                      BROWSER / CLIENT                            │   ║
║   │                                                                  │   ║
║   │  ┌───────────┐  ┌──────────────┐  ┌──────────┐  ┌──────────┐   │   ║
║   │  │  / (Home) │  │ /dashboard   │  │  /send   │  │ /escrow  │   │   ║
║   │  │           │  │              │  │          │  │          │   │   ║
║   │  │ Create /  │  │ Balance Card │  │ Amount   │  │ Create   │   │   ║
║   │  │ Import    │  │ Quick Actions│  │ Fee Break│  │ Release  │   │   ║
║   │  │ Wallet    │  │ Recent Txns  │  │ Confirm  │  │ Refund   │   │   ║
║   │  └─────┬─────┘  └──────┬───────┘  └────┬─────┘  └────┬─────┘   │   ║
║   │        └───────────────┴───────────────┴───────────────┘        │   ║
║   │                                  │                               │   ║
║   │              ┌───────────────────▼──────────────────┐            │   ║
║   │              │           WalletContext               │            │   ║
║   │              │    (React Context + localStorage)     │            │   ║
║   │              │  publicKey, secretKey, balance, txns  │            │   ║
║   │              └──────────┬──────────────┬────────────┘            │   ║
║   │                         │              │                          │   ║
║   │              ┌──────────▼───┐  ┌───────▼──────────┐              │   ║
║   │              │  stellar.ts  │  │   soroban.ts     │              │   ║
║   │              │  (Horizon)   │  │  (Soroban RPC)   │              │   ║
║   └──────────────┴──────────────┘  └──────────────────┘──────────────┘   ║
║                       │                        │                         ║
║                       │ HTTPS                  │ HTTPS                   ║
╠═══════════════════════╪════════════════════════╪═════════════════════════╣
║                       │                        │                         ║
║   ┌───────────────────▼────────────┐  ┌────────▼──────────────────────┐ ║
║   │   STELLAR HORIZON API (Testnet) │  │  SOROBAN RPC (Testnet)        │ ║
║   │  horizon-testnet.stellar.org    │  │  soroban-testnet.stellar.org  │ ║
║   │                                 │  │                               │ ║
║   │  GET  /accounts/:id → balance   │  │  payment_contract             │ ║
║   │  GET  /accounts/:id/payments    │  │    send_payment()             │ ║
║   │  POST /transactions → submit    │  │    get_payment(id)            │ ║
║   └───────────────────┬─────────────┘  │  escrow_contract              │ ║
║                       │                │    create_escrow()            │ ║
║   ┌───────────────────▼─────────────┐  │    release(id) / refund(id)  │ ║
║   │    STELLAR NETWORK (Testnet)    │  └──────────────────────────────┘ ║
║   │                                 │                                   ║
║   │  Consensus: FBA (5s finality)   │                                   ║
║   │  Fee: 100 stroops = 0.00001 XLM │                                   ║
║   └─────────────────────────────────┘                                   ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## Send Money — Detailed Flow

```
User fills form → Preview fee breakdown
     │
     ▼
Frontend validates:
  ✓ Amount > 0 (minimum ₹1)
  ✓ Address starts with G, 56 chars
  ✓ Not sending to self
  ✓ Sufficient balance (balance - 1 XLM reserve)
  ✓ Max button: sets INR = floor((balance - 1.001) × xlmRate)
     │
     ▼
Show fee breakdown:
  youSend    = ₹500
  platformFee = ₹0.10   (0.02%)
  networkFee  = ₹0.003  (100 stroops)
  receiverGets = ₹499.90
  xlmAmount   = 47.61 XLM
     │
     ▼
stellar.ts → sendPayment()
  1. Keypair.fromSecret(senderSecret)
  2. server.loadAccount(senderPublicKey)
  3. TransactionBuilder.addOperation(payment)
     .addMemo(Memo.text(memo))
     .setTimeout(30)
     .build()
  4. tx.sign(senderKeypair)
  5. server.submitTransaction(tx) → tx hash
     │
     ▼
Success: hash, time, explorer link displayed
```

---

## Escrow Flow (Soroban)

```
User creates escrow → soroban.ts → simulateCreateEscrow()
     │
     ▼
escrow_contract.create_escrow(token, sender, receiver, amount, expiry_seconds)
  → Locks amount in contract address
  → Returns escrow ID
  → Emits escrow_created event
     │
     ▼
Pending state — visible in /escrow page
     │
     ├── Sender calls release(id) → funds sent to receiver
     │     sender.require_auth() verified
     │
     └── After expiry: anyone calls refund(id)
           ledger.timestamp() >= escrow.expiry verified
           funds returned to sender
```

---

## Data Indexing Pipeline

```
Source: Horizon /accounts/:id/payments
     │
     ▼
Normalization: payment → { type, counterpart, amount, timestamp }
     │
     ▼
WalletContext: refresh() → getRecentTransactions()
     │
     ├── Dashboard: last 5 transactions
     ├── History page: full list with filter + INR totals
     └── Ops Center: DAU, tx count, retention aggregation
```

---

## File → Component Responsibility Map

| File | Responsibility |
|------|---------------|
| `src/lib/stellar.ts` | All Horizon SDK calls — sendPayment, getFeeBreakdown, buildSponsoredPayment |
| `src/lib/soroban.ts` | All Soroban RPC calls — simulateContractPayment, simulateCreateEscrow, getContractInfo |
| `src/lib/WalletContext.tsx` | Global wallet state — shares data across all pages |
| `src/app/page.tsx` | Onboarding — create or import wallet |
| `src/app/dashboard/page.tsx` | Balance + recent txns + 5 quick actions (Send, Receive, History, Escrow, Ops) |
| `src/app/send/page.tsx` | 3-step send flow with live rate, fee preview, Max button |
| `src/app/receive/page.tsx` | Address copy, Web Share API, payment URI |
| `src/app/escrow/page.tsx` | Create/release/refund escrow via Soroban |
| `src/app/history/page.tsx` | Full tx history with filter + INR totals |
| `src/app/ops/page.tsx` | Production center — metrics, users, monitoring, security, contracts |
| `src/app/api/health/route.ts` | Health check API — Horizon latency, app status |
| `contracts/payment_contract/` | On-chain fee logic + payment ledger (Rust/Soroban) |
| `contracts/escrow_contract/` | Time-locked conditional payments (Rust/Soroban) |
