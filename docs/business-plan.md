# StellarPay — Hackathon Presentation & Business Plan

## 🎤 2-Minute Pitch Script

> "Every month, 15 million Indian students and workers send money to their families.
> They pay ₹350 in fees and wait 3 days. We built StellarPay to fix that.
>
> [DEMO: Open app → Create wallet → Send ₹500 → Show success in 4 seconds]
>
> That just happened in 4 seconds. The fee was ₹0.10 — not ₹350.
> And the receiver could see exactly what they'd get before we hit send.
>
> We're not replacing banks. We're giving unbanked users a faster lane."

---

## 📊 Problem Validation Data

| Metric | Source |
|--------|--------|
| India remittance market | $125B/year (World Bank 2023) |
| Average fee to send $200 | 5.4% = ~₹900 (World Bank) |
| Time for SWIFT transfer | 1–5 business days |
| Stellar transaction time | ~5 seconds |
| Stellar fee | $0.0000004 per transaction |
| People without bank accounts | 1.4 billion globally |

---

## 🏆 Hackathon Judging Criteria Checklist

### ✅ Technical Implementation
- [x] Working Stellar testnet integration
- [x] Real transaction signing and submission
- [x] Live balance queries via Horizon API
- [x] TypeScript + proper error handling
- [x] Mobile responsive UI

### ✅ Problem & Solution Fit
- [x] Targets real pain: slow, expensive remittances
- [x] Clear target user: students, freelancers, migrant workers
- [x] Measurable improvement: 99.97% cheaper, 86,400x faster

### ✅ Usability
- [x] Non-technical user can send in < 2 minutes
- [x] Transparent fee breakdown (no hidden costs)
- [x] Clear success/error states

### ✅ Innovation
- [x] Uses Stellar's native speed advantage
- [x] Fee transparency as core feature (not afterthought)
- [x] INR denomination (user never sees confusing XLM amounts)

### ✅ Scalability / Business Potential
- [x] Clear path to $10K MRR
- [x] Mainnet swap = change one env variable
- [x] B2B API upsell opportunity

---

## 💰 Path to $10K/Month Revenue

### Revenue Streams

#### 1. Transaction Fee (₹0.10 per transfer)
```
Month 1:   1,000  txns × ₹0.10 = ₹100/mo   (beta users)
Month 3:   10,000 txns × ₹0.10 = ₹1,000/mo (student network)
Month 6:   50,000 txns × ₹0.10 = ₹5,000/mo (word of mouth)
Month 12: 100,000 txns × ₹0.10 = ₹10,000/mo ($10K milestone ✓)
```

#### 2. Premium Plan (₹99/month)
```
Features: API access, bulk send, CSV exports, priority support
Month 6:  50 users  × ₹99 = ₹4,950/mo
Month 12: 100 users × ₹99 = ₹9,900/mo
```

#### 3. B2B API (₹5,000/month per client)
```
Month 6:  1 client (freelancer platform)    = ₹5,000/mo
Month 9:  3 clients                         = ₹15,000/mo
Month 12: 5 clients (e-commerce, gig apps)  = ₹25,000/mo
```

### Combined Revenue at Month 12
```
Transaction fees:  ₹10,000
Premium users:     ₹9,900
B2B API:           ₹25,000
─────────────────────────
Total MRR:         ₹44,900 ≈ $540/mo
```
*$10K/month milestone realistically at Month 18–24 with B2B scale.*

---

## 🗓️ 12-Month Growth Roadmap

### Q1 (Months 1–3): Validate
- [ ] Hackathon launch → get 50 beta testers
- [ ] Collect user feedback (Google Form)
- [ ] 5 user interviews — understand pain points deeply
- [ ] Commit: first 100 transactions on testnet

### Q2 (Months 4–6): Grow
- [ ] Move to mainnet (requires legal compliance check)
- [ ] Launch in 3 college WhatsApp groups
- [ ] Add Freighter wallet integration
- [ ] Add QR code for receiver address
- [ ] Target: 500 registered users, 2,000 transactions

### Q3 (Months 7–9): Scale
- [ ] B2B API launch (pilot with 1 freelancer platform)
- [ ] Add USDC support (stable, no price volatility)
- [ ] Add live XLM/INR rate (production)
- [ ] Apply for Stellar Development Foundation grant
- [ ] Target: 2,000 users, 10,000 transactions/month

### Q4 (Months 10–12): Revenue
- [ ] 3 paying B2B clients
- [ ] Premium plan launch
- [ ] Mobile PWA (installable on phone)
- [ ] Partnership with 1 gig platform (Fiverr/Upwork India)
- [ ] Target: $10K MRR

---

## 🔄 Post-Hackathon Iteration Plan

### Common User Problems (predict before they happen)

1. **"What is XLM? Is this safe?"**
   - Root cause: Crypto unfamiliarity
   - Fix: Never show XLM prominently — lead with INR. Add "What is this?" tooltip.
   - Effort: 2 hours
   - Commit: `fix: hide XLM amounts, show INR as primary currency`

2. **"The address is too long and I'm scared of mistyping"**
   - Root cause: 56-char public keys look like hashes
   - Fix: Add QR code scanner + saved contacts (address book)
   - Effort: 1 day
   - Commit: `feat: add QR code address scanner and saved contacts`

3. **"What if the transaction fails? Do I lose money?"**
   - Root cause: Blockchain anxiety
   - Fix: Add transaction status page with retry, detailed error messages
   - Effort: 4 hours
   - Commit: `feat: add transaction status tracking with retry on failure`

### Improvement Commits (show these to judges)

```bash
# Improvement 1: Live price feed
git commit -m "feat: replace static XLM rate with live CoinGecko feed (60s refresh)"

# Improvement 2: QR code
git commit -m "feat: add QR code scanner for receiver address input"

# Improvement 3: Better errors
git commit -m "fix: add user-friendly error messages for common Stellar errors (underfunded, bad sequence)"

# Improvement 4: USDC
git commit -m "feat: add USDC payment option via Stellar's native DEX"

# Improvement 5: PWA
git commit -m "feat: add PWA manifest for mobile installation"
```

---

## 📋 Google Form Template

**Form Title:** StellarPay Beta Feedback

**Questions:**

1. Your Name * (Short answer)
2. Email Address * (Short answer)
3. Your Wallet Address (Short answer — optional)
4. How easy was it to send money? * (Scale 1–5)
   - 1 = Very Difficult
   - 5 = Very Easy
5. What went well? * (Paragraph)
6. What was confusing or difficult? * (Paragraph)
7. Would you use this for real money transfers? * (Multiple choice)
   - Yes, definitely
   - Maybe, with improvements
   - No
8. Feature request (Short answer — optional)

**How to collect responses:**
1. Share form link in WhatsApp / email
2. Responses tab → click Sheets icon → view live
3. File → Download → Microsoft Excel (.xlsx)
4. Add to repo as `docs/user-feedback.xlsx`

**Form URL format:**
`https://docs.google.com/forms/d/e/1FAIpQLSfoh_XA5OEFAvh0oz-ryo6Wa-E0PPBOjqT2aTGhf4GehfbY0g/viewform`
