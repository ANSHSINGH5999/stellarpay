#!/bin/bash
# ════════════════════════════════════════════════════════════════════════════
# StellarPay — Complete Terminal Commands Reference
# Run these commands in order to go from zero to deployed.
#
# Save this file and read it like a checklist.
# Each section is standalone — you can jump to any part.
# ════════════════════════════════════════════════════════════════════════════

# ────────────────────────────────────────────────────────────────────────────
# PHASE 1: MACHINE SETUP (do once)
# ────────────────────────────────────────────────────────────────────────────

# 1a. Check if Node.js is installed (need v18+)
node --version
# Expected: v18.x.x or v20.x.x

# 1b. If not installed, download from https://nodejs.org
#     On Mac with Homebrew:
brew install node
#     On Ubuntu/Debian:
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 1c. Check npm version
npm --version
# Expected: 9.x or 10.x

# 1d. Install Git (if not installed)
git --version
#     On Mac:  brew install git
#     On Ubuntu: sudo apt-get install git

# 1e. Configure Git (first time only)
git config --global user.name  "Your Name"
git config --global user.email "you@example.com"


# ────────────────────────────────────────────────────────────────────────────
# PHASE 2: PROJECT SETUP
# ────────────────────────────────────────────────────────────────────────────

# 2a. Create project (if starting fresh)
npx create-next-app@14 stellarpay \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-git

# 2b. OR clone the existing repo
git clone https://github.com/YOUR_USERNAME/stellarpay.git
cd stellarpay

# 2c. Install all dependencies
npm install

# 2d. Install Stellar SDK + key packages
npm install @stellar/stellar-sdk@12 \
            lucide-react \
            react-hot-toast \
            framer-motion \
            clsx \
            tailwind-merge \
            axios

# 2e. Set up environment file
cp .env.example .env.local
# Edit .env.local with your preferred editor:
nano .env.local
# OR
code .env.local


# ────────────────────────────────────────────────────────────────────────────
# PHASE 3: DEVELOPMENT
# ────────────────────────────────────────────────────────────────────────────

# 3a. Start the development server
npm run dev
# Opens on http://localhost:3000
# Hot-reload is on — save a file and the browser updates instantly

# 3b. Run type checking (find TS errors)
npx tsc --noEmit

# 3c. Run linter
npm run lint

# 3d. Build for production (test before deploying)
npm run build
# Should show: ✓ Compiled successfully

# 3e. Start the production build locally
npm start
# Opens on http://localhost:3000


# ────────────────────────────────────────────────────────────────────────────
# PHASE 4: GIT — COMMIT HISTORY (minimum 10 commits)
# ────────────────────────────────────────────────────────────────────────────

# Initialize git (skip if you cloned)
git init
git branch -M main

# Commit 1 — project scaffold
git add package.json tsconfig.json next.config.js tailwind.config.js postcss.config.js
git commit -m "feat: initialize Next.js 14 project with TypeScript and Tailwind CSS"

# Commit 2 — Stellar SDK lib
git add src/lib/stellar.ts
git commit -m "feat: add Stellar SDK wrapper with send, balance, and history functions"

# Commit 3 — Wallet context
git add src/lib/WalletContext.tsx
git commit -m "feat: implement WalletContext with create, import, refresh, and disconnect"

# Commit 4 — Global layout and styles
git add src/app/layout.tsx src/app/globals.css
git commit -m "feat: add root layout with WalletProvider, NavBar, and toast notifications"

# Commit 5 — NavBar
git add src/components/ui/NavBar.tsx
git commit -m "feat: build NavBar with wallet status chip and responsive mobile menu"

# Commit 6 — Homepage
git add src/app/page.tsx
git commit -m "feat: build homepage with wallet onboarding (create + import flow)"

# Commit 7 — Dashboard
git add src/app/dashboard/page.tsx src/app/dashboard/loading.tsx
git commit -m "feat: add dashboard with live balance, recent transactions, and quick actions"

# Commit 8 — Send page
git add src/app/send/page.tsx
git commit -m "feat: implement 3-step send money flow with fee preview and tx confirmation"

# Commit 9 — History page
git add src/app/history/page.tsx
git commit -m "feat: add full transaction history page with Stellar Explorer links"

# Commit 10 — Fee components
git add src/components/transaction/FeeCard.tsx src/components/transaction/TransactionBadge.tsx
git commit -m "feat: add FeeCard and TransactionBadge reusable components"

# Commit 11 — Wallet component
git add src/components/wallet/WalletCard.tsx
git commit -m "feat: add WalletCard component with copy address and explorer link"

# Commit 12 — Live price hook
git add src/hooks/useStellarPrice.ts
git commit -m "feat: add useStellarPrice hook for live XLM/INR rate from CoinGecko"

# Commit 13 — Types
git add src/types/index.ts
git commit -m "chore: add central TypeScript type definitions"

# Commit 14 — Config and env
git add vercel.json .env.example .gitignore
git commit -m "chore: add Vercel config, env template, and gitignore"

# Commit 15 — Documentation
git add README.md
git commit -m "docs: add comprehensive README with architecture, setup, and scaling guide"

# View your commit history
git log --oneline


# ────────────────────────────────────────────────────────────────────────────
# PHASE 5: GITHUB — PUSH YOUR CODE
# ────────────────────────────────────────────────────────────────────────────

# 5a. Create a new repo on GitHub (go to github.com → New repository)
#     Name: stellarpay
#     Visibility: Public (for hackathon judges)
#     Do NOT add README/gitignore — we have ours

# 5b. Add remote and push
git remote add origin https://github.com/YOUR_USERNAME/stellarpay.git
git push -u origin main

# 5c. Verify it's live at:
#     https://github.com/YOUR_USERNAME/stellarpay


# ────────────────────────────────────────────────────────────────────────────
# PHASE 6: DEPLOY TO VERCEL
# ────────────────────────────────────────────────────────────────────────────

# Option A: Vercel CLI (fastest)
# 6a. Install Vercel CLI
npm install -g vercel

# 6b. Login (opens browser)
vercel login

# 6c. Deploy (from project root)
vercel
# Answer the prompts:
#   Set up and deploy? Y
#   Which scope? (your username)
#   Link to existing project? N
#   Project name? stellarpay
#   Directory? ./  (just press Enter)
#   Override settings? N

# 6d. Set environment variables on Vercel
vercel env add NEXT_PUBLIC_STELLAR_NETWORK
# Type: testnet → Enter → All environments

vercel env add NEXT_PUBLIC_HORIZON_URL
# Type: https://horizon-testnet.stellar.org

vercel env add NEXT_PUBLIC_XLM_TO_INR
# Type: 10.5

# 6e. Deploy to production
vercel --prod

# Option B: Vercel Dashboard (no CLI)
# 1. Go to https://vercel.com/new
# 2. Import your GitHub repo
# 3. Add environment variables in the UI
# 4. Click Deploy

# After deploy, your app is live at:
# https://stellarpay-YOUR_USERNAME.vercel.app


# ────────────────────────────────────────────────────────────────────────────
# PHASE 7: TEST YOUR DEPLOYMENT
# ────────────────────────────────────────────────────────────────────────────

# 7a. Create sender wallet
#     → Go to your app URL
#     → Click "Create New Wallet"
#     → Copy the public key

# 7b. Create receiver wallet
#     → Open incognito window
#     → Go to same URL
#     → Click "Create New Wallet"
#     → Copy that public key

# 7c. Fund both wallets (auto via Friendbot — happens on Create)
#     Manual funding (if needed):
curl "https://friendbot.stellar.org?addr=GPASTE_PUBLIC_KEY_HERE"

# 7d. Send a test transaction
#     → Sender window → "Send Money"
#     → Enter ₹500
#     → Paste receiver's public key
#     → Click "Review" → "Confirm & Send"
#     → Should confirm in < 5 seconds!

# 7e. Verify on Stellar Explorer
#     → Copy the transaction hash from success screen
#     → Open: https://stellar.expert/explorer/testnet/tx/YOUR_TX_HASH


# ────────────────────────────────────────────────────────────────────────────
# PHASE 8: USEFUL STELLAR TESTNET TOOLS
# ────────────────────────────────────────────────────────────────────────────

# Create a keypair via command line (Node.js)
node -e "
  const { Keypair } = require('@stellar/stellar-sdk');
  const kp = Keypair.random();
  console.log('Public Key:', kp.publicKey());
  console.log('Secret Key:', kp.secret());
"

# Fund account via Friendbot
curl "https://friendbot.stellar.org?addr=YOUR_PUBLIC_KEY"

# Check account balance via Horizon API
curl "https://horizon-testnet.stellar.org/accounts/YOUR_PUBLIC_KEY" | \
  node -e "
    let d=''; process.stdin.on('data',c=>d+=c).on('end',()=>{
      const b = JSON.parse(d).balances;
      console.table(b.map(x=>({asset:x.asset_type, balance:x.balance})));
    });
  "

# Get recent transactions
curl "https://horizon-testnet.stellar.org/accounts/YOUR_PUBLIC_KEY/payments?limit=5&order=desc"


# ────────────────────────────────────────────────────────────────────────────
# PHASE 9: UPDATING YOUR DEPLOYMENT
# ────────────────────────────────────────────────────────────────────────────

# After making changes:
git add -A
git commit -m "fix: your change description"
git push origin main
# Vercel auto-deploys on every push to main!

# Or manually redeploy:
vercel --prod


# ────────────────────────────────────────────────────────────────────────────
# PHASE 10: HELPFUL SCRIPTS
# ────────────────────────────────────────────────────────────────────────────

# Count your lines of code
find src -name "*.tsx" -o -name "*.ts" | xargs wc -l | tail -1

# Check bundle size after build
npm run build
# Look for the "First Load JS" column — aim for < 150kB

# Clear Next.js cache (if you see weird build errors)
rm -rf .next
npm run build
