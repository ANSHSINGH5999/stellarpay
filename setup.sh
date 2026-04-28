#!/bin/bash
# ─────────────────────────────────────────────────────────
# StellarPay — One-command setup script
# Usage: chmod +x setup.sh && ./setup.sh
# ─────────────────────────────────────────────────────────

set -e  # Exit on any error

echo ""
echo "⚡ StellarPay Setup"
echo "════════════════════════════════════"

# 1. Check Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Install from https://nodejs.org (v18+)"
  exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Node.js v18+ required. You have: $(node -v)"
  exit 1
fi

echo "✅ Node.js $(node -v)"

# 2. Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# 3. Create .env.local if missing
if [ ! -f .env.local ]; then
  cp .env.example .env.local
  echo "✅ Created .env.local from template"
else
  echo "✅ .env.local already exists"
fi

# 4. Success
echo ""
echo "════════════════════════════════════"
echo "✅ Setup complete!"
echo ""
echo "Start the dev server:"
echo "  npm run dev"
echo ""
echo "Then open: http://localhost:3000"
echo ""
echo "Quick start:"
echo "  1. Click 'Create New Wallet'"
echo "  2. Get 10,000 free test XLM from Friendbot"
echo "  3. Click 'Send Money' and try a transfer!"
echo ""
