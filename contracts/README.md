# StellarPay — Soroban Smart Contracts

Soroban smart contracts powering StellarPay's on-chain logic, deployed on **Stellar Testnet**.

## Contracts

### 1. Payment Contract (`payment_contract/`)

Handles XLM payments with transparent platform fee deduction.

**Functions:**
| Function | Description |
|---|---|
| `initialize(owner, fee_recipient)` | Deploy with owner and fee wallet |
| `send_payment(token, sender, receiver, amount, memo)` | Send payment; 0.20% fee auto-deducted |
| `get_payment(id)` | Fetch payment record by ID |
| `payment_count()` | Total payments processed |
| `get_fee_bps()` | Current fee in basis points |
| `set_fee_bps(new_fee)` | Update fee (owner only, max 5%) |

**Fee Logic:**
- Platform fee: `0.20%` (20 basis points) of the sent amount
- `net_amount = amount - (amount × fee_bps / 10000)`
- Fee transferred to `fee_recipient` set at initialization

---

### 2. Escrow Contract (`escrow_contract/`)

Time-locked escrow for conditional payments.

**Functions:**
| Function | Description |
|---|---|
| `create_escrow(token, sender, receiver, amount, expiry_seconds)` | Lock funds; returns escrow ID |
| `release(escrow_id)` | Sender releases funds to receiver |
| `refund(escrow_id)` | Refund to sender after expiry |
| `get_escrow(id)` | Fetch escrow details |
| `escrow_count()` | Total escrows created |

**Status Lifecycle:**
```
Pending → Released (sender calls release)
Pending → Refunded (anyone calls refund after expiry)
```

---

## Prerequisites

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Add Wasm target
rustup target add wasm32-unknown-unknown

# Install Stellar CLI
cargo install --locked stellar-cli --features opt
```

## Build

```bash
cd contracts

# Build payment contract
stellar contract build --manifest-path payment_contract/Cargo.toml

# Build escrow contract
stellar contract build --manifest-path escrow_contract/Cargo.toml
```

Compiled `.wasm` files appear in `target/wasm32-unknown-unknown/release/`.

## Test

```bash
cd contracts

# Test all contracts
cargo test

# Test a specific contract
cargo test -p stellarpay-payment
cargo test -p stellarpay-escrow
```

## Deploy to Testnet

```bash
# Configure Stellar CLI for testnet
stellar network add testnet \
  --rpc-url https://soroban-testnet.stellar.org \
  --network-passphrase "Test SDF Network ; September 2015"

# Generate/import your deployer identity
stellar keys generate deployer --network testnet

# Fund it via Friendbot
stellar keys fund deployer --network testnet

# Deploy payment contract
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/stellarpay_payment.wasm \
  --source deployer \
  --network testnet

# Deploy escrow contract
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/stellarpay_escrow.wasm \
  --source deployer \
  --network testnet
```

## Initialize (after deploy)

```bash
# Initialize payment contract
stellar contract invoke \
  --id <PAYMENT_CONTRACT_ID> \
  --source deployer \
  --network testnet \
  -- initialize \
  --owner <YOUR_PUBLIC_KEY> \
  --fee_recipient <FEE_WALLET_PUBLIC_KEY>
```

## Integration with StellarPay Frontend

The frontend (`src/lib/stellar.ts`) uses the Horizon API for standard XLM transfers. These Soroban contracts extend functionality for:

- **Payment Contract** — on-chain fee transparency and payment history ledger
- **Escrow Contract** — trustless conditional transfers (planned for v1.2)

Contract IDs (testnet) are surfaced in the `/ops` dashboard under **Contract Registry**.

## Architecture

```
StellarPay Frontend (Next.js)
        │
        ├── Horizon API ──── standard XLM transfers (current)
        │
        └── Soroban RPC ──── smart contract calls (this folder)
                │
                ├── payment_contract  ← fee logic + payment ledger
                └── escrow_contract   ← time-locked conditional payments
```
