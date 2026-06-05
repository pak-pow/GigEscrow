# GigEscrow 🔐

> **Freelancer Payment Protection on Stellar**
> Milestone-based escrow for Filipino freelancers. Client locks USDC in a Soroban smart contract. Funds release automatically per milestone — no more payment scams.

---

## The Problem

The Philippines is one of the **top freelance nations in the world** — millions of Filipinos work as developers, designers, and writers for international clients. But the payment system is broken:

- Clients ghost after receiving the work
- No legal recourse for cross-border disputes
- Platforms like Upwork take 20% in fees
- Freelancers front the work with zero payment guarantee

**GigEscrow fixes this at the protocol level.** The client's USDC is locked into a Soroban smart contract before any work begins. It's mathematically impossible for the client to "rug" the freelancer — funds release automatically when a milestone is approved.

---

## How it Uses Stellar

| Feature | Stellar Primitive |
|---|---|
| USDC escrow deposit | Soroban — `create_job()` locks client funds |
| Milestone payment release | Soroban — `approve_milestone()` transfers pro-rata USDC |
| Dispute mechanism | Soroban — `raise_dispute()` freezes funds |
| Wallet connection | Freighter via `@stellar/freighter-api` |
| Account balances | Stellar Horizon REST API |
| Asset | USDC on Stellar Testnet |

---

## Repo Structure

```
GigEscrow/
├── web/                    # Next.js 16 + TypeScript + Tailwind v4
│   └── src/
│       ├── app/            # page.tsx, layout.tsx, globals.css
│       └── components/     # Navbar, Hero, HowItWorks, ClientDashboard, FreelancerDashboard
├── backend/                # Node.js Express API (job store + Horizon proxy)
│   └── src/index.js
├── contracts/              # Soroban Rust smart contract (soroban-sdk v22)
│   └── src/
│       ├── lib.rs          # create_job / submit_milestone / approve_milestone / raise_dispute
│       └── test.rs         # unit tests (cargo test ✅ 2 passed)
└── README.md
```

---

## What Works in the Demo

- [x] Connect Freighter wallet (real address + Testnet badge)
- [x] Role selector — Client or Freelancer
- [x] **Client**: Post a job with title, freelancer address, budget, milestone titles
- [x] **Client**: Approve milestones → triggers USDC release on Soroban
- [x] **Client**: Raise dispute → freezes remaining funds
- [x] **Freelancer**: View all assigned jobs with progress bars
- [x] **Freelancer**: Submit milestones for review
- [x] **Freelancer**: See earnings breakdown and pending amounts
- [x] Smart contract: `create_job`, `submit_milestone`, `approve_milestone`, `raise_dispute`, `get_job`
- [x] Unit tests: 3-milestone happy path + dispute flow both passing

---

## Prerequisites

- **Node.js 20+** and **npm**
- **Freighter** browser extension — switch to **Test Net**
- **Rust** + `wasm32v1-none` target + **Stellar CLI** (for contract deploy)

### Install the contract toolchain (Windows)

```powershell
winget install --id Rustlang.Rustup -e --accept-source-agreements --accept-package-agreements
winget install --id Stellar.StellarCLI -e --accept-source-agreements --accept-package-agreements
rustup default stable-x86_64-pc-windows-gnu
rustup target add wasm32v1-none
```

---

## Setup & Run

### 1. Frontend

```powershell
cd web
npm install
npm run dev        # → http://localhost:3000
```

1. Click **Connect Wallet** → approve in Freighter (Test Net)
2. Select your role: **Client** or **Freelancer**
3. **Client**: Post a job → fill in freelancer address, budget, milestones
4. **Freelancer**: View jobs → submit milestones → wait for approval

### 2. Backend

```powershell
cd backend
npm install
npm run dev        # → http://localhost:4001
```

Environment (`.env`):
```
HORIZON_URL=https://horizon-testnet.stellar.org
PORT=4001
CONTRACT_ID=       # set after deploying the contract
```

### 3. Smart Contract

```powershell
cd contracts
cargo test         # ✅ 2 tests passed

stellar contract build
stellar contract deploy \
  --wasm target/wasm32v1-none/release/gigescrow_contract.wasm \
  --source <your-identity> \
  --network testnet
```

---

## Smart Contract Functions

| Function | Who Calls | Description |
|---|---|---|
| `create_job(client, freelancer, token, amount, milestones)` | Client | Locks full USDC upfront into escrow |
| `submit_milestone(job_id, freelancer)` | Freelancer | Marks current milestone as submitted for review |
| `approve_milestone(job_id, client)` | Client | Approves + releases 1/N payment to freelancer |
| `raise_dispute(job_id, by)` | Either | Freezes remaining funds, flags for resolution |
| `get_job(job_id)` | Anyone | Read full job state |

---

## Troubleshooting

- **Freighter not detected** — install extension, reload, confirm it's unlocked and on Test Net.
- **Backend not running** — make sure `npm run dev` is running in `/backend` on port 4001.
- **Balance shows 0** — fund via [Friendbot](https://laboratory.stellar.org/#account-creator?network=test).
- **`tx_bad_auth`** — confirm Freighter is on Test Net network.

---

## Demo

- **Public repo:** https://github.com/pak-pow/GigEscrow

---

## Submission Checklist

- [x] Public GitHub repo with MIT license
- [x] README explains problem, Stellar usage, and setup
- [x] Soroban smart contract with passing unit tests
- [x] Working frontend with real Horizon + Freighter
- [x] Submitted via SwitchX portal

---

## License

MIT — see [LICENSE](./LICENSE)
