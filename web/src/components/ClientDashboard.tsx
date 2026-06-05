"use client";
import { useState, useEffect, useCallback } from "react";

interface Milestone { index: number; title: string; status: "pending" | "submitted" | "approved"; }
interface Job { id: number; clientAddress: string; freelancerAddress: string; title: string; description: string; totalAmount: number; milestoneCount: number; milestones: Milestone[]; status: "active" | "disputed" | "completed"; createdAt: string; }

const API = "http://localhost:4001";
const USDC_ISSUER_TESTNET = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";

export default function ClientDashboard({ walletAddress }: { walletAddress: string }) {
  const [view, setView] = useState<"jobs" | "new">("jobs");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ freelancerAddress: "", title: "", description: "", totalAmount: "", milestoneCount: "3", milestones: ["", "", ""] });
  const [posting, setPosting] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/jobs?role=client&address=${walletAddress}`);
      const d = await r.json();
      setJobs(d.jobs || []);
    } catch { setJobs([]); } finally { setLoading(false); }
  }, [walletAddress]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const updateMilestoneCount = (count: string) => {
    const n = parseInt(count) || 1;
    const milestones = Array.from({ length: Math.min(n, 10) }, (_, i) => form.milestones[i] || "");
    setForm(f => ({ ...f, milestoneCount: count, milestones }));
  };

  const postJob = async () => {
    if (!form.freelancerAddress || !form.title || !form.totalAmount) return;
    setPosting(true);
    try {
      const milestones = form.milestones.map((title, i) => ({ index: i + 1, title: title || `Milestone ${i + 1}`, status: "pending" }));
      await fetch(`${API}/api/jobs`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ clientAddress: walletAddress, freelancerAddress: form.freelancerAddress, title: form.title, description: form.description, totalAmount: form.totalAmount, milestoneCount: form.milestoneCount, milestones }) });
      setPostSuccess(true);
      setTimeout(() => { setPostSuccess(false); setView("jobs"); fetchJobs(); setForm({ freelancerAddress: "", title: "", description: "", totalAmount: "", milestoneCount: "3", milestones: ["", "", ""] }); }, 2000);
    } catch { alert("Failed to post job. Make sure the backend is running."); } finally { setPosting(false); }
  };

  const approveOrDispute = async (jobId: number, milestoneIndex: number, action: "approve" | "dispute") => {
    await fetch(`${API}/api/jobs/${jobId}/milestone`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, milestoneIndex }) });
    fetchJobs();
  };

  const perMilestone = (job: Job) => (job.totalAmount / job.milestoneCount).toFixed(2);

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {(["jobs", "new"] as const).map(v => (
          <button key={v} id={`client-tab-${v}`} onClick={() => setView(v)} className={`px-5 py-2 text-sm font-semibold rounded-lg cursor-pointer transition-all ${view === v ? "btn-primary" : "btn-outline"}`}>
            {v === "jobs" ? "📋 My Jobs" : "+ Post New Job"}
          </button>
        ))}
      </div>

      {view === "jobs" && (
        <div className="space-y-4 fade-in">
          {loading ? Array.from({ length: 2 }).map((_, i) => <div key={i} className="shimmer h-36" />) :
           jobs.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="text-4xl mb-3">📭</div>
              <div className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>No jobs posted yet</div>
              <div className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>Post your first job to lock funds in escrow and get started.</div>
              <button onClick={() => setView("new")} className="btn-primary px-6 py-2.5 text-sm">Post a Job →</button>
            </div>
          ) : jobs.map(job => (
            <div key={job.id} className="card p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>{job.title}</h3>
                    <span className={`badge badge-${job.status}`}>{job.status}</span>
                  </div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Freelancer: {job.freelancerAddress.slice(0, 8)}...{job.freelancerAddress.slice(-6)} · {job.milestoneCount} milestones · ${perMilestone(job)} USDC each
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xl font-bold" style={{ color: "var(--teal-400)" }}>${job.totalAmount}</div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>USDC in escrow</div>
                </div>
              </div>
              <div className="space-y-2">
                {job.milestones.map(m => (
                  <div key={m.index} className="flex items-center gap-3 py-2 px-3 rounded-lg" style={{ background: "var(--bg-800)" }}>
                    <span className="text-sm w-4 text-center font-mono" style={{ color: "var(--text-muted)" }}>{m.index}</span>
                    <span className="flex-1 text-sm" style={{ color: "var(--text-primary)" }}>{m.title}</span>
                    <span className={`badge badge-${m.status}`}>{m.status}</span>
                    {m.status === "submitted" && job.status === "active" && (
                      <div className="flex gap-2">
                        <button onClick={() => approveOrDispute(job.id, m.index, "approve")} className="btn-primary text-xs px-3 py-1">✅ Approve</button>
                        <button onClick={() => approveOrDispute(job.id, m.index, "dispute")} className="btn-danger">⚠ Dispute</button>
                      </div>
                    )}
                    {m.status === "approved" && <span className="text-xs font-semibold" style={{ color: "var(--green)" }}>+${perMilestone(job)} USDC paid</span>}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                  <span>Progress</span>
                  <span>{job.milestones.filter(m => m.status === "approved").length}/{job.milestoneCount} approved</span>
                </div>
                <div className="progress-track"><div className="progress-fill" style={{ width: `${(job.milestones.filter(m => m.status === "approved").length / job.milestoneCount) * 100}%` }} /></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {view === "new" && (
        <div className="max-w-lg mx-auto fade-in space-y-5">
          <div>
            <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>Post a New Job</h2>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Lock USDC in escrow before work begins. Funds release per milestone automatically.</p>
          </div>
          <div className="card p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Job Title</label>
              <input id="input-job-title" className="input-field" placeholder="e.g. Build a landing page in React" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Freelancer Stellar Address</label>
              <input id="input-freelancer-address" className="input-field font-mono text-sm" placeholder="G... (their Stellar wallet)" value={form.freelancerAddress} onChange={e => setForm(f => ({ ...f, freelancerAddress: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Description</label>
              <textarea className="input-field resize-none" rows={3} placeholder="Describe the scope of work..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Total Budget (USDC)</label>
                <div className="relative">
                  <input id="input-job-amount" type="number" className="input-field pr-16" placeholder="0.00" value={form.totalAmount} onChange={e => setForm(f => ({ ...f, totalAmount: e.target.value }))} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold" style={{ color: "var(--teal-400)" }}>USDC</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Milestones (1–10)</label>
                <input id="input-milestone-count" type="number" className="input-field" placeholder="3" min={1} max={10} value={form.milestoneCount} onChange={e => updateMilestoneCount(e.target.value)} />
              </div>
            </div>
            {form.milestones.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>Milestone Titles</label>
                <div className="space-y-2">
                  {form.milestones.map((m, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-6 text-xs font-mono text-center shrink-0" style={{ color: "var(--text-muted)" }}>{i + 1}</span>
                      <input className="input-field text-sm py-2.5" placeholder={`Milestone ${i + 1} title`} value={m} onChange={e => { const ms = [...form.milestones]; ms[i] = e.target.value; setForm(f => ({ ...f, milestones: ms })); }} />
                      {form.totalAmount && <span className="text-xs shrink-0 font-semibold" style={{ color: "var(--teal-400)" }}>${(parseFloat(form.totalAmount) / form.milestones.length).toFixed(2)}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="p-4 rounded-xl text-sm" style={{ background: "rgba(20,184,166,0.05)", border: "1px solid rgba(20,184,166,0.1)" }}>
            <div className="font-semibold mb-1" style={{ color: "var(--teal-400)" }}>🔒 How escrow works</div>
            <ul className="space-y-0.5" style={{ color: "var(--text-secondary)" }}>
              <li>• Your USDC will be locked in the Soroban smart contract on Stellar</li>
              <li>• Freelancer cannot receive funds until you approve each milestone</li>
              <li>• USDC token issuer on Testnet: <code className="font-mono text-xs">{USDC_ISSUER_TESTNET.slice(0, 16)}...</code></li>
            </ul>
          </div>
          <button id="btn-post-job" onClick={postJob} disabled={!form.freelancerAddress || !form.title || !form.totalAmount || posting} className="btn-primary w-full text-base">
            {postSuccess ? "✅ Job Posted!" : posting ? "Locking in escrow..." : `Lock $${form.totalAmount || "0"} USDC & Post Job`}
          </button>
        </div>
      )}
    </div>
  );
}
