# x402 Demo Website

A ready-to-run website that demonstrates how to **monetize APIs and content** using the open [x402](https://x402.org) payment protocol.

## What you get

- Beautiful dark-themed landing page
- Free endpoint (`/api/free`)
- Two paid endpoints protected by x402:
  - `/api/brief?topic=...` → **$0.01 USDC** — on-demand structured research brief (useful for agents & humans)
  - `/api/premium-data` → **$0.001 USDC** — cheap micropayment data feed
- Uses **Base Sepolia** testnet (safe for experimentation)
- Public facilitator (`https://x402.org/facilitator`)

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Configure your receiving wallet
cp .env.example .env
# Edit .env and set PAY_TO_ADDRESS=0xYourRealAddress

# 3. Start the server
npm start
```

Open http://localhost:4020

## How to benefit

### 1. As a seller (most common)
Replace the demo content with your real API or data.  
Any request to the protected routes will require a micropayment in USDC.  
You receive the funds directly in the wallet you set as `PAY_TO_ADDRESS`.

### 2. Deploy it
- Run on any Node.js host (Vercel, Railway, Render, Fly.io, your VPS, etc.)
- Switch to mainnet by changing the network to `eip155:8453` (Base) and using a mainnet facilitator when ready.

### 3. Let AI agents pay you
Agents that support x402 can discover the 402 response, pay automatically, and consume your API with zero human involvement.

## Project structure

```
x402-demo/
├── server.js          # Express + x402 middleware
├── public/
│   ├── index.html     # Frontend
│   ├── styles.css
│   └── app.js
├── .env.example
├── package.json
└── README.md
```

## Next steps

- Add more routes and different prices
- Support Solana as well (add `@x402/svm` and register the SVM scheme)
- Build a real product on top of this pattern (paid research, AI tools, data feeds, etc.)

Official resources:
- https://x402.org
- https://docs.x402.org
- https://github.com/x402-foundation/x402
