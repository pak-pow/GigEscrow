"use client";
import { useState, useEffect, useCallback } from "react";

interface Milestone { index: number; title: string; status: "pending" | "submitted" | "approved"; }
interface Job { id: number; clientAddress: string; freelancerAddress: string; title: string; description: string; totalAmount: number; milestoneCount: number; milestones: Milestone[]; status: "active" | "disputed" | "completed"; createdAt: string; }

const API = "http://localhost:4001";

export default function FreelancerDashboard({ walletAddress }: { walletAddress: string }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<number | null>(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/jobs?role=freelancer&address=${walletAddress}`);
      const d = await r.json();
      setJobs(d.jobs || []);
    } catch { setJobs([]); } finally { setLoading(false); }
  }, [walletAddress]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const submitMilestone = async (jobId: number, milestoneIndex: number) => {
    setSubmitting(milestoneIndex);
    try {
      await fetch(`${API}/api/jobs/${jobId}/milestone`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "submit", milestoneIndex }) });
      await fetchJobs();
    } finally { setSubmitting(null); }
  };

  const totalEarned = (job: Job) => job.milestones.filter(m => m.status === "approved").length * (job.totalAmount / job.milestoneCount);
  const pendingAmount = (job: Job) => job.milestones.filter(m => m.status !== "approved").length * (job.totalAmount / job.milestoneCount);

  return (
    <div className="space-y-4 fade-in">
      {loading ? Array.from({ length: 2 }).map((_, i) => <div key={i} className="shimmer h-36" />) :
       jobs.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-3">💼</div>
          <div className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>No jobs assigned yet</div>
          <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Share your Stellar wallet address with clients so they can post jobs to you. Your address:<br />
            <code className="font-mono text-xs mt-2 block" style={{ color: "var(--teal-400)" }}>{walletAddress}</code>
          </div>
        </div>
       ) : (
        <>
          {/* Summary row */}
          <div className="grid grid-cols-3 gap-3 mb-2">
            {[
              { label: "Active Jobs", value: jobs.filter(j => j.status === "active").length, color: "var(--teal-400)" },
              { label: "Total Earned", value: `$${jobs.reduce((s, j) => s + totalEarned(j), 0).toFixed(2)} USDC`, color: "var(--green)" },
              { label: "Pending Payment", value: `$${jobs.reduce((s, j) => s + pendingAmount(j), 0).toFixed(2)} USDC`, color: "var(--gold-400)" },
            ].map(s => (
              <div key={s.label} className="card p-4 text-center">
                <div className="text-xl font-bold mb-0.5" style={{ color: s.color, fontFamily: "var(--font-display)" }}>{s.value}</div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {jobs.map(job => {
            const approvedCount = job.milestones.filter(m => m.status === "approved").length;
            const nextPending = job.milestones.find(m => m.status === "pending");
            const awaitingApproval = job.milestones.find(m => m.status === "submitted");
            const perM = (job.totalAmount / job.milestoneCount).toFixed(2);

            return (
              <div key={job.id} className="card p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>{job.title}</h3>
                      <span className={`badge badge-${job.status}`}>{job.status}</span>
                    </div>
                    {job.description && <p className="text-xs mb-1" style={{ color: "var(--text-secondary)" }}>{job.description}</p>}
                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                      Client: {job.clientAddress.slice(0, 8)}...{job.clientAddress.slice(-6)} · ${perM} USDC per milestone
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-lg font-bold" style={{ color: "var(--green)" }}>+${totalEarned(job).toFixed(2)}</div>
                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>earned so far</div>
                  </div>
                </div>

                {/* Status banner */}
                {awaitingApproval && (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)" }}>
                    <span>⏳</span>
                    <span style={{ color: "var(--gold-400)" }}>
                      <strong>Milestone {awaitingApproval.index}</strong> is waiting for client approval. You'll receive ${perM} USDC automatically once approved.
                    </span>
                  </div>
                )}
                {job.status === "disputed" && (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    <span>🚨</span><span style={{ color: "var(--red)" }}>This job is under dispute. Funds are frozen until resolved.</span>
                  </div>
                )}
                {job.status === "completed" && (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                    <span>🎉</span><span style={{ color: "var(--green)" }}>Job completed! All ${job.totalAmount} USDC has been released to your wallet.</span>
                  </div>
                )}

                {/* Milestones */}
                <div className="space-y-2">
                  {job.milestones.map(m => (
                    <div key={m.index} className="flex items-center gap-3 py-2.5 px-3 rounded-lg" style={{ background: "var(--bg-800)" }}>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{
                        background: m.status === "approved" ? "rgba(16,185,129,0.2)" : m.status === "submitted" ? "rgba(251,191,36,0.2)" : "var(--surface)",
                        color: m.status === "approved" ? "var(--green)" : m.status === "submitted" ? "var(--gold-400)" : "var(--text-muted)"
                      }}>
                        {m.status === "approved" ? "✓" : m.index}
                      </div>
                      <span className="flex-1 text-sm" style={{ color: m.status === "approved" ? "var(--text-muted)" : "var(--text-primary)", textDecoration: m.status === "approved" ? "line-through" : "none" }}>
                        {m.title}
                      </span>
                      <span className={`badge badge-${m.status} shrink-0`}>{m.status}</span>
                      {m.status === "approved" && <span className="text-xs font-semibold shrink-0" style={{ color: "var(--green)" }}>+${perM}</span>}
                      {m.status === "pending" && m === nextPending && job.status === "active" && !awaitingApproval && (
                        <button
                          id={`btn-submit-milestone-${job.id}-${m.index}`}
                          onClick={() => submitMilestone(job.id, m.index)}
                          disabled={submitting === m.index}
                          className="btn-primary text-xs px-3 py-1.5 shrink-0"
                        >
                          {submitting === m.index ? "Submitting..." : "Submit →"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5" style={{ color: "var(--text-muted)" }}>
                    <span>{approvedCount}/{job.milestoneCount} milestones approved</span>
                    <span>${totalEarned(job).toFixed(2)} / ${job.totalAmount} USDC earned</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${(approvedCount / job.milestoneCount) * 100}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </>
       )}
    </div>
  );
}
