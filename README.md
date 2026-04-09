# PaySlip — Automated Payroll on Stellar

## What It Does
PaySlip is a next-generation payroll management platform built on the Stellar blockchain. It simplifies the process of paying international teams by allowing employers to disburse salaries in XLM or USDC instantly. 

By leveraging Stellar's batch transaction capabilities, PaySlip enables employers to pay dozens of employees in a single on-chain action, drastically reducing network fees and administrative overhead. Every payment is cryptographically signed via Freighter and recorded immutably on the ledger, providing a transparent audit trail for both employers and employees.

## Tech Stack
- Next.js 14 App Router + TypeScript
- TailwindCSS + shadcn/ui
- Stellar SDK + Freighter Wallet
- MongoDB Atlas
- NextAuth.js
- Vercel (deployment)
- Soroban (if applicable — StakeVault + FlowDAO only)

## Setup Instructions (How to Run Locally)

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (free tier)
- Freighter browser extension installed
- Git

### Step 1 — Clone the repository
```bash
git clone https://github.com/parth1241/payslip.git
cd payslip
```

### Step 2 — Install dependencies
```bash
npm install
```

### Step 3 — Set up environment variables
```bash
cp .env.example .env.local
```
Open .env.local and fill in:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/payslip
NEXTAUTH_SECRET=run: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_STELLAR_HORIZON=https://horizon-testnet.stellar.org
```

### Step 4 — Set up MongoDB Atlas
1. Go to https://cloud.mongodb.com
2. Create a free M0 cluster
3. Create database user (username + password)
4. Add 0.0.0.0/0 to Network Access
5. Copy connection string into MONGODB_URI

### Step 5 — Set up Freighter Wallet
1. Install Freighter from https://freighter.app
2. Create or import a Stellar wallet
3. Switch network to TESTNET in Freighter settings
4. Fund your testnet wallet at https://friendbot.stellar.org

### Step 6 — Run the development server
```bash
npm run dev
```
Open http://localhost:3000

### Step 7 — Create an account and connect wallet
1. Go to http://localhost:3000/signup
2. Create an account with the "Employer" role
3. Go to Settings → Link your Freighter wallet
4. Your testnet XLM balance will appear on the dashboard

## How to Test Stellar Transactions (Testnet)

### Get free testnet XLM
Visit https://friendbot.stellar.org/?addr=YOUR_WALLET_ADDRESS
or use the in-app "Fund with Friendbot" button if available.

### Testing Payroll Transactions
1. Sign up as Employer
2. Go to Employees → Add Employee with a testnet wallet address
3. Go to Payroll → select employees → Run Payroll
4. Freighter will open — approve the transaction
5. Transaction hash appears with "View on Stellar Expert" link
6. Employee portal shows the received payment

## Project Structure
```
/src/app          → Next.js pages and API routes
/src/components   → Reusable UI components
/src/lib          → Database, Stellar SDK, utilities
/src/hooks        → Custom React hooks
/middleware.ts    → Auth route protection
```

## Deployment
Deployed on Vercel. Every push to main auto-deploys.

## Hackathon
Built for the Antigravity x Stellar hackathon.
All transactions run on Stellar Testnet — no real funds used.

---

## Screenshots

### 1. Wallet Connected State
The WalletStatusBar shows the Freighter wallet connection status, truncated address, and network badge.

![Wallet Connected — WalletStatusBar showing Freighter connected with address and Testnet badge](./screenshots/wallet-connected.png)

### 2. Balance Displayed
The employer dashboard displays the current XLM balance prominently, along with payroll stats.

![Balance Displayed — Dashboard showing 9,847.52 XLM wallet balance with Total Paid and Pending Payroll cards](./screenshots/balance-displayed.png)

### 3. Successful Testnet Transaction
After running payroll, the TransactionSuccessCard confirms the on-chain payment with confetti animation.

![Transaction Success — Payroll Complete card showing checkmark, wallet address, balance, tx hash, amount, and Confirmed status](./screenshots/transaction-success.png)

### 4. Transaction Result Shown to User
The full result view shows the WalletStatusBar at the top and TransactionSuccessCard with all details — wallet, balance, hash, amount, fee, and a link to Stellar Expert.

![Transaction Result — Full view with WalletStatusBar and TransactionSuccessCard showing all four required elements in one screenshot](./screenshots/transaction-result.png)

> **Note:** The TransactionSuccessCard component is designed so that screenshots 3 and 4 can be captured in a single screenshot — it shows wallet address, balance, transaction hash, and result all in one view.
