export default function HowItWorks() {
  const steps = [
    { icon: "👔", role: "Client", title: "Client Posts a Job", desc: "Fill in the job title, freelancer's Stellar address, total USDC amount, and how many milestones to split it into. Review and confirm." },
    { icon: "🔒", role: "Soroban Contract", title: "USDC Locked in Escrow", desc: "The client's full USDC payment is locked inside a Soroban smart contract on Stellar. The client cannot withdraw it unilaterally — it's yours as soon as work is approved." },
    { icon: "💻", role: "Freelancer", title: "Freelancer Does the Work", desc: "The freelancer sees the job on their dashboard with all milestone details. They deliver each milestone and hit 'Submit for Review'." },
    { icon: "✅", role: "Client", title: "Client Reviews & Approves", desc: "Client reviews the submitted work. On approval, the Soroban contract automatically releases the pro-rata USDC payment directly to the freelancer's Stellar wallet." },
    { icon: "⚡", role: "Both", title: "Instant Settlement", desc: "No waiting. No bank transfer. No middleman. USDC lands in the freelancer's wallet in seconds on the Stellar network." },
    { icon: "🚨", role: "Safety Net", title: "Dispute? Raise a Flag", desc: "If either party disagrees, they can raise a dispute. The contract locks the remaining funds until resolution — protecting both sides." },
  ];

  return (
    <section id="how-it-works" className="px-6 py-20" style={{ background: "rgba(8,18,32,0.6)" }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>How GigEscrow Works</h2>
          <p className="text-base" style={{ color: "var(--text-secondary)" }}>Smart contract-enforced payments — no trust required between strangers.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {steps.map((s, i) => (
            <div key={i} className="card p-5 flex gap-4 items-start fade-in">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: "rgba(20,184,166,0.08)", border: "1px solid rgba(20,184,166,0.2)" }}>{s.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{s.title}</span>
                  <span className="badge badge-active text-xs">{s.role}</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{s.desc}</p>
              </div>
              <span className="text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--bg-800)", color: "var(--teal-400)" }}>{i + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
