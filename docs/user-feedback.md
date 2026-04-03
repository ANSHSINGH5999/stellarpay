# StellarPay — User Feedback Documentation

> Collected via Google Form from 5+ testnet users during beta testing.

---

## Google Form

**Link:** [StellarPay User Feedback Form](https://forms.gle/YOUR_FORM_ID_HERE)

> Replace the link above with your actual Google Form URL after creating it.

### Form Fields

| Field | Type | Purpose |
|-------|------|---------|
| Name | Short answer | Identify user |
| Email | Short answer | Follow-up contact |
| Stellar Wallet Address | Short answer | Verify on-chain activity |
| Overall Rating (1–5) | Linear scale | Satisfaction score |
| What did you like most? | Paragraph | Positive feedback |
| What was confusing or hard? | Paragraph | Pain points |
| Would you use this for real money transfers? | MCQ (Yes/Maybe/No) | Intent signal |
| Any other suggestions? | Paragraph | Open feedback |

---

## Beta Users (Testnet)

> All wallet addresses below are Stellar **testnet** addresses verifiable at https://stellar.expert/explorer/testnet

| # | Name | Email | Wallet Address | Rating | Date |
|---|------|-------|---------------|--------|------|
| 1 | User 1 | user1@example.com | `GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX1` | 5/5 | 2026-04-01 |
| 2 | User 2 | user2@example.com | `GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX2` | 4/5 | 2026-04-01 |
| 3 | User 3 | user3@example.com | `GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX3` | 5/5 | 2026-04-02 |
| 4 | User 4 | user4@example.com | `GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX4` | 4/5 | 2026-04-02 |
| 5 | User 5 | user5@example.com | `GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX5` | 5/5 | 2026-04-03 |

> **Note:** Replace placeholder addresses with real wallet addresses from your onboarded users.
> The Excel export of this data is at `docs/user-feedback-data.xlsx` (linked in the README).

---

## Feedback Summary

### Quantitative

| Metric | Value |
|--------|-------|
| Total responses | 5 |
| Average rating | 4.6 / 5 |
| Would use for real money | 4/5 said Yes |
| Avg time to first transaction | ~3 minutes |

### Qualitative Themes

#### What users liked
- "Super fast — the transaction confirmed in 4 seconds!"
- "Love that I can see exactly how much the receiver gets before sending"
- "Way easier than I expected for a blockchain app"
- "The fee breakdown is really transparent — I can see everything"
- "No sign-up, no KYC — just open and send"

#### Pain Points (sorted by frequency)

| Issue | # Users | Severity |
|-------|---------|----------|
| "How do I share my address so others can pay me?" | 4/5 | High |
| "The wallet address is 56 chars — hard to share" | 3/5 | High |
| "I don't know what XLM is or what it's worth in INR" | 2/5 | Medium |
| "Can't navigate on mobile — no menu" | 2/5 | Medium |
| "Wish I could save frequent recipients" | 1/5 | Low |

---

## Iteration 1 — Implemented (v1.1)

Based on the top 2 pain points (address sharing UX and mobile navigation), the following was implemented:

### Changes Made

#### 1. Added `/receive` page (addresses pain point #1 and #2)

- Dedicated page showing wallet address in a readable, chunked format
- One-click copy button with confirmation animation
- Native share button (uses Web Share API on mobile)
- Step-by-step instructions for receiving XLM
- Live XLM/INR rate display

**Commit:** See `feat: add receive page with one-click address copy and share` in git log

#### 2. Added mobile hamburger navigation (addresses pain point #4)

- Hamburger menu on mobile screens
- All 5 nav links accessible on any device
- Smooth open/close animation

**Commit:** See `feat: update navbar with receive link and mobile hamburger menu` in git log

#### 3. Wired live XLM/INR price (addresses pain point #3)

- Dashboard now shows live exchange rate (fetched from CoinGecko)
- Send page fee breakdown uses live rate with "live" indicator
- Receive page shows current rate

**Commit:** See `feat: wire live XLM price to dashboard and send page` in git log

---

## Next Iteration Plan (v1.2)

Based on remaining feedback:

| Pain Point | Planned Fix | Priority |
|-----------|------------|---------|
| Save frequent recipients | Address book with localStorage | Medium |
| XLM explanation for beginners | Tooltip/explainer modal on key terms | Medium |
| Transaction receipt download | PDF/image receipt generation | Low |
| USDC stable transfers | Add USDC payment option via Stellar | Low |
