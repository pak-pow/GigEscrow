interface NavbarProps {
  walletAddress: string | null;
  network: string | null;
  onConnect: () => void;
}

export default function Navbar({ walletAddress, network, onConnect }: NavbarProps) {
  const short = walletAddress ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : null;
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4" style={{ background: "rgba(5,12,24,0.85)", backdropFilter: "blur(16px)", borderBottom: "1px solid var(--surface-border)" }}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-bold" style={{ background: "linear-gradient(135deg, var(--teal-400), var(--teal-600))", color: "#fff" }}>🔐</div>
        <span className="text-xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
          Gig<span style={{ color: "var(--teal-400)" }}>Escrow</span>
        </span>
      </div>
      <div className="flex items-center gap-3">
        {walletAddress && (
          <div className="hidden sm:flex items-center gap-2">
            {network && (
              <span className="px-2 py-1 rounded-lg text-xs font-bold" style={{ background: "rgba(20,184,166,0.1)", border: "1px solid rgba(20,184,166,0.25)", color: "var(--teal-400)" }}>
                {network}
              </span>
            )}
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm" style={{ background: "var(--bg-800)", border: "1px solid var(--surface-border)", color: "var(--text-secondary)" }}>
              <span className="w-2 h-2 rounded-full" style={{ background: "var(--green)" }} />
              {short}
            </span>
          </div>
        )}
        <button id="btn-connect-wallet" onClick={onConnect} className="btn-primary text-sm px-5 py-2.5" style={{ borderRadius: "0.625rem" }}>
          {walletAddress ? "Disconnect" : "Connect Wallet"}
        </button>
      </div>
    </nav>
  );
}
