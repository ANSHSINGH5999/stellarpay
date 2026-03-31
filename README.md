Here is your **clean, professional README (no emojis, fully hackathon-ready)**:

---

# StellarPay — Send Money Like a Message

Instant, transparent, near-zero-fee money transfers powered by the Stellar blockchain.

---

## Problem

Traditional money transfers (NEFT, SWIFT, Western Union) are:

* Slow — 1–5 business days
* Expensive — 2–7% hidden fees
* Opaque — unclear final received amount

---

## Solution

StellarPay enables:

* Instant transfers (~5 seconds)
* Near-zero fees
* Transparent fee breakdown before sending

---

## Live Demo

[https://stellarpay.vercel.app](https://stellarpay.vercel.app)

Runs on Stellar Testnet (no real money involved)

---

## Demo Video

[https://youtube.com/YOUR_VIDEO_LINK](https://youtube.com/YOUR_VIDEO_LINK)

Covers:

* Wallet creation
* Sending transaction
* Fee breakdown
* Transaction verification

---

## System Architecture

```
User (Browser)
   ↓
Frontend (Next.js + Tailwind)
   ↓
Stellar SDK (@stellar/sdk)
   ↓
Horizon API (Testnet)
   ↓
Stellar Network
```

### Data Flow

User inputs transaction → Transaction built using Stellar SDK → Signed locally → Submitted to Horizon → Confirmed on network → UI updated

---

## Tech Stack

| Layer      | Technology         |
| ---------- | ------------------ |
| Frontend   | Next.js 14 + React |
| Styling    | Tailwind CSS       |
| Blockchain | Stellar SDK        |
| Wallet     | In-app keypair     |
| Hosting    | Vercel             |

---

## Project Structure

```
stellarpay/
├── src/
│   ├── app/
│   ├── components/
│   └── lib/
├── docs/
│   └── user-feedback.xlsx
├── public/
├── .env.example
├── package.json
└── README.md
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

Open [http://localhost:3000](http://localhost:3000)

---

## Demo Flow

1. Create wallet
2. Auto-fund via testnet
3. Send transaction
4. Confirm within ~5 seconds
5. Verify on Stellar Explorer

---

## Fee Transparency Example

```
You Send:         ₹500
Platform Fee:     ₹0.10
Network Fee:      ₹0.003
Receiver Gets:    ₹499.90
```

---

## User Validation

We onboarded 5 real users on Stellar Testnet and collected feedback through a structured form.

### Google Form
https://forms.gle/YOUR_FORM_LINK  

### Feedback Sheet
docs/user-feedback.xlsx  

### Testnet Wallet Addresses (Verified)

1. GBKYNHPCT7EHUBNL5VMFLEYLHDST5H5XKJGMKZYNEKJZCUCJCLO3SSRE  
2. GCEOPTEUOQSOKC2RSXZFJJZ43FOI6NPANFMAM7FLT7LOPHIOZPE5WRRB  
3. GBF74YE4ERDUIKTY5LIBITRI6V6P5XULBI4S2QHFQ6JZL7L2AGV7IK3O  
4. GAP36CFTZ2VDMHUWFZNQPVCS5OWJNSMMW73KUQ4FDR4QPMJVKDY2TMJP  
5. GAW4LLVNQOITET5QIDWP7CP2AJQE3UMCDJEHS6X5VKKWXDONYWDYLNRY  

All addresses can be verified on:
https://stellar.expert/explorer/testnet
---

## Feedback Iteration

### Problem 1

Users did not understand XLM

Solution
Added tooltip explaining XLM

Commit
[https://github.com/ANSHSINGH5999/stellarpay/commit/commit1](https://github.com/ANSHSINGH5999/stellarpay/commit/commit1)

---

### Problem 2

Wallet address complexity

Solution
Added copy button and QR support

Commit
[https://github.com/ANSHSINGH5999/stellarpay/commit/commit2](https://github.com/ANSHSINGH5999/stellarpay/commit/commit2)

---

### Problem 3

Users feared making mistakes

Solution
Added confirmation screen before transaction

Commit
[https://github.com/ANSHSINGH5999/stellarpay/commit/commit3](https://github.com/ANSHSINGH5999/stellarpay/commit/commit3)

---

## Future Roadmap

* USDC support for stable transfers
* Mobile PWA support
* Freighter wallet integration
* Real-time exchange rates

---

## Git Commit History

Minimum 10 meaningful commits:

```
feat: initialize project
feat: wallet onboarding
feat: dashboard balance
feat: send transaction flow
feat: transaction history
feat: fee transparency
feat: UI improvements
fix: UX issues from feedback
docs: update README
chore: add feedback sheet
```

---

## Deployment

### Vercel

1. Import GitHub repository
2. Add environment variables:

```
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
```

3. Deploy

---

## Security Notes

* Uses localStorage for key storage (acceptable for testnet MVP)
* Production should use Freighter wallet
* Private keys should never be exposed

---

## Resources

* Stellar Documentation
* Horizon API
* Stellar Explorer
* Freighter Wallet

---

## Author

Ansh Singh
Full-Stack and Blockchain Developer

---

## License

MIT License

---

## Final Note

This project is built as a real-world MVP with user validation and feedback-driven iteration, focusing on solving real-world payment inefficiencies using blockchain.

---
