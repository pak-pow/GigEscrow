export default function Hero({ onConnect }: { onConnect: () => void }) {
  return (
    <section className="relative overflow-hidden px-6 pt-24 pb-20 text-center">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(20,184,166,0.07) 0%, transparent 70%)" }} />
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6" style={{ background: "rgba(20,184,166,0.08)", border: "1px solid rgba(20,184,166,0.2)", color: "var(--teal-400)" }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--teal-400)" }} />
        Built on Stellar · Soroban Testnet · For Filipino Freelancers
      </div>
      <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-5 max-w-3xl mx-auto" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
        Get paid for your work.
        <br /><span style={{ color: "var(--teal-400)" }}>Every single time.</span>
      </h1>
      <p className="text-lg max-w-xl mx-auto mb-10 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        The Philippines is one of the world's top freelance nations — but too many talented developers, designers, and writers get <strong style={{ color: "var(--text-primary)" }}>scammed by clients who ghost after the work is done</strong>. GigEscrow locks the client's <strong style={{ color: "var(--teal-400)" }}>USDC in a Soroban smart contract</strong>. You get paid automatically the moment your milestone is approved. No trust required.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
        <button id="hero-connect-btn" onClick={onConnect} className="btn-primary text-base px-8 py-4 teal-glow">
          Start as Freelancer →
        </button>
        <a href="#how-it-works" className="btn-outline text-base px-8 py-4">How it works</a>
      </div>
      <div className="flex flex-col sm:flex-row justify-center gap-6 max-w-2xl mx-auto">
        {[
          { label: "Freelancers scammed yearly", value: "Millions", sub: "No recourse in traditional platforms" },
          { label: "Payment on approval", value: "Instant", sub: "Soroban releases funds on-chain" },
          { label: "Client can't rug", value: "0 risk", sub: "Funds locked until milestone approved" },
        ].map((s) => (
          <div key={s.label} className="card flex-1 p-5 text-center">
            <div className="text-2xl font-bold mb-1" style={{ color: "var(--teal-400)", fontFamily: "var(--font-display)" }}>{s.value}</div>
            <div className="text-sm font-semibold mb-0.5" style={{ color: "var(--text-primary)" }}>{s.label}</div>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>{s.sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
