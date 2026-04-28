# StellarPay User Guide

## What StellarPay does

StellarPay is a Soroban-powered dApp on Stellar Testnet — instant XLM transfers with on-chain fee logic, time-locked escrow via smart contracts, live INR pricing, and full Explorer auditability.

## How to start

1. Open the home page at https://stellarpay-bxs8.vercel.app
2. Click **Create New Wallet** to generate and fund a testnet account via Friendbot (10,000 free XLM).
3. Or click **Import Existing Wallet** and paste your Stellar secret key (testnet only).
4. You are redirected to the dashboard after wallet connects.

## How to send money

1. Go to `/send`.
2. Enter an amount in INR or use a quick-amount button (₹100, ₹500, ₹1000 …).
3. Click **Max** to auto-fill your maximum sendable balance.
4. Paste the recipient's Stellar address (starts with G, 56 characters).
5. Use the **Paste** button to read from clipboard.
6. Optionally add a memo (up to 28 bytes).
7. Review the transparent fee breakdown — platform fee + Stellar network fee.
8. Click **Review Transfer** → **Confirm & Send**.
9. After confirmation, click **View on Stellar Explorer** to verify on-chain.

## How to receive money

1. Go to `/receive`.
2. Click **Copy Address** to copy your Stellar public key.
3. Or click the share icon to use the native Web Share API on mobile.
4. You can also copy the `web+stellar:` payment URI for wallet-compatible apps.
5. Refresh the dashboard after the payment arrives — balance updates in ≤5 seconds.

## How to use Escrow (Soroban)

1. Go to `/escrow`.
2. Click **Create New Escrow**.
3. Enter the receiver address, XLM amount, and expiry time (in hours).
4. Click **Lock Funds** — the Soroban `create_escrow()` call locks funds on-chain.
5. To release funds before expiry: click **Release** (sender only).
6. If the escrow expires without release: anyone can click **Refund** to return funds to sender.

Contract source: `contracts/escrow_contract/src/lib.rs`

## How to read the Ops Center

1. Go to `/ops`.
2. Review **Growth metrics** — DAU, transaction count, retention over 8 days.
3. Check **Verified users** registry — search by name or wallet address.
4. Review **Monitoring** — Horizon latency, Soroban RPC health, indexer status.
5. Review **Security** checklist — items completed vs. in progress.
6. View the **Smart Contracts** panel — deployed contract IDs with Explorer links.

## How to verify a transaction

Every transaction shows a hash and a direct Stellar Expert link after completion.  
You can also open any wallet from the verified-users list directly:  
`https://stellar.expert/explorer/testnet/account/<WALLET_ADDRESS>`
