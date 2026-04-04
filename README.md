# PaySlip — On-Chain Payroll on Stellar

> Instant, transparent, borderless payroll powered by the Stellar blockchain.

## Live Demo
🔗 https://payslip.vercel.app (update this after deploying)

## What it does
PaySlip lets employers pay their teams in XLM or USDC directly on the Stellar network. Every payment is recorded on-chain, creating a permanent verifiable payslip. Employees receive salaries to any Stellar wallet address — no bank account required.

## Features
- Multi-employer organisations with team member roles
- Bulk payroll disbursement via Freighter wallet
- On-chain payslip history for employees
- Wallet-based login for employees (no password needed)
- Remember me — 30-day persistent sessions
- Vibrant futuristic UI with mixed color system

## Tech Stack
- **Frontend**: Next.js 14 (App Router), TailwindCSS, shadcn/ui
- **Blockchain**: Stellar SDK, Freighter Wallet API
- **Auth**: NextAuth.js with JWT sessions
- **Database**: MongoDB Atlas (Mongoose)
- **Hosting**: Vercel

## Local Setup

### Prerequisites
- Node.js 18+
- [Freighter wallet](https://freighter.app) browser extension (set to Testnet)
- MongoDB Atlas account (free tier works)

### Steps
```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/payslip.git
cd payslip

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local and fill in your MongoDB URI and NextAuth secret

# 4. Generate NextAuth secret
openssl rand -base64 32
# Paste the output as NEXTAUTH_SECRET in .env.local

# 5. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Get Free Testnet XLM
Visit https://friendbot.stellar.org/?addr=YOUR_STELLAR_ADDRESS

## Deployment
This app deploys automatically to Vercel on every push to main.
See DEPLOYMENT.md for environment variable setup.

## Team
Built at [Hackathon Name] — [Date]
- [Your Name] — [@github](https://github.com/yourusername)
