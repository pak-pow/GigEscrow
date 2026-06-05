import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Horizon } from '@stellar/stellar-sdk';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4001;
const HORIZON_URL = process.env.HORIZON_URL || 'https://horizon-testnet.stellar.org';
const server = new Horizon.Server(HORIZON_URL);

// In-memory job store (replace with DB in production)
const jobs = new Map();
let jobCounter = 0;

// ─── Health ───────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'gigescrow-backend', network: 'testnet' });
});

// ─── GET /api/account/:address ─────────────────────────────────────────────
app.get('/api/account/:address', async (req, res) => {
  try {
    const account = await server.loadAccount(req.params.address);
    const balances = account.balances.map((b) => ({
      asset: b.asset_type === 'native' ? 'XLM' : b.asset_code,
      balance: b.balance,
    }));
    res.json({ address: req.params.address, balances });
  } catch {
    res.status(404).json({ error: 'Account not found on testnet.' });
  }
});

// ─── GET /api/jobs ──────────────────────────────────────────────────────────
// Returns all jobs (for demo; in production, read from Soroban via RPC)
app.get('/api/jobs', (req, res) => {
  const { role, address } = req.query;
  let result = Array.from(jobs.values());

  if (role === 'client' && address) {
    result = result.filter((j) => j.clientAddress === address);
  } else if (role === 'freelancer' && address) {
    result = result.filter((j) => j.freelancerAddress === address);
  }

  res.json({ jobs: result });
});

// ─── POST /api/jobs ─────────────────────────────────────────────────────────
app.post('/api/jobs', (req, res) => {
  const { clientAddress, freelancerAddress, title, description, totalAmount, milestoneCount, milestones } = req.body;

  if (!clientAddress || !freelancerAddress || !title || !totalAmount || !milestoneCount) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  jobCounter++;
  const job = {
    id: jobCounter,
    clientAddress,
    freelancerAddress,
    title,
    description,
    totalAmount: parseFloat(totalAmount),
    milestoneCount: parseInt(milestoneCount),
    milestones: milestones || Array.from({ length: parseInt(milestoneCount) }, (_, i) => ({
      index: i + 1,
      title: `Milestone ${i + 1}`,
      status: 'pending', // pending | submitted | approved
    })),
    status: 'active', // active | disputed | completed
    createdAt: new Date().toISOString(),
    contractJobId: null, // set after on-chain tx
  };

  jobs.set(jobCounter, job);
  res.status(201).json({ job });
});

// ─── PATCH /api/jobs/:id/milestone ─────────────────────────────────────────
app.patch('/api/jobs/:id/milestone', (req, res) => {
  const job = jobs.get(parseInt(req.params.id));
  if (!job) return res.status(404).json({ error: 'Job not found.' });

  const { action, milestoneIndex } = req.body;
  const milestone = job.milestones.find((m) => m.index === milestoneIndex);
  if (!milestone) return res.status(404).json({ error: 'Milestone not found.' });

  if (action === 'submit') {
    milestone.status = 'submitted';
  } else if (action === 'approve') {
    milestone.status = 'approved';
    const paid = job.milestones.filter((m) => m.status === 'approved').length;
    if (paid === job.milestoneCount) job.status = 'completed';
  } else if (action === 'dispute') {
    job.status = 'disputed';
  }

  jobs.set(parseInt(req.params.id), job);
  res.json({ job });
});

app.listen(PORT, () => {
  console.log(`\n🔐 GigEscrow Backend running on http://localhost:${PORT}`);
  console.log(`   Stellar Testnet | Horizon: ${HORIZON_URL}\n`);
});
