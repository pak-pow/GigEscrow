"use client";
import { useState } from "react";
import { isConnected, requestAccess, getNetworkDetails } from "@stellar/freighter-api";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import ClientDashboard from "@/components/ClientDashboard";
import FreelancerDashboard from "@/components/FreelancerDashboard";

export type Role = "client" | "freelancer";

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);

  const handleConnect = async () => {
    if (walletAddress) { setWalletAddress(null); setNetwork(null); setRole(null); return; }
    setConnectError(null);
    try {
      const connected = await isConnected();
      if (!connected.isConnected) { setConnectError("Freighter not found. Install it from freighter.app"); return; }
      const access = await requestAccess();
      if (access.error) { setConnectError("Connection rejected. Please approve in Freighter."); return; }
      const net = await getNetworkDetails();
      setNetwork(net.networkPassphrase?.includes("Test") ? "Testnet" : "Mainnet");
      setWalletAddress(access.address);
    } catch { setConnectError("Could not connect. Please try again."); }
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-950)" }}>
      <Navbar walletAddress={walletAddress} network={network} onConnect={handleConnect} />

      {connectError && (
        <div className="max-w-xl mx-auto mt-4 px-4">
          <div className="flex gap-3 px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#fca5a5" }}>
            ⚠️ {connectError}
          </div>
        </div>
      )}

      {!walletAddress ? (
        <>
          <Hero onConnect={handleConnect} />
          <HowItWorks />
        </>
      ) : !role ? (
        <RoleSelector onSelect={setRole} />
      ) : (
        <main className="max-w-5xl mx-auto px-4 py-10 fade-in">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
                {role === "client" ? "👔 Client Dashboard" : "💻 Freelancer Dashboard"}
              </h2>
              <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
                {role === "client" ? "Post jobs, approve milestones, manage escrow" : "View your jobs, submit milestones, track payments"}
              </p>
            </div>
            <button onClick={() => setRole(null)} className="text-sm cursor-pointer hover:underline" style={{ color: "var(--text-muted)" }}>
              ← Switch role
            </button>
          </div>
          {role === "client"
            ? <ClientDashboard walletAddress={walletAddress} />
            : <FreelancerDashboard walletAddress={walletAddress} />}
        </main>
      )}
    </div>
  );
}

function RoleSelector({ onSelect }: { onSelect: (r: Role) => void }) {
  return (
    <main className="max-w-3xl mx-auto px-4 py-20 fade-in">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>
          Who are you?
        </h2>
        <p style={{ color: "var(--text-secondary)" }}>Select your role to see the right dashboard.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {([
          { role: "client" as Role, icon: "👔", title: "I'm a Client", desc: "I hire Filipino freelancers. I want to post a job, lock USDC in escrow, and release payments on milestone approval.", action: "Post a Job →" },
          { role: "freelancer" as Role, icon: "💻", title: "I'm a Freelancer", desc: "I do the work. I want to see my active jobs, submit milestones, and get paid automatically on approval.", action: "View My Jobs →" },
        ] as const).map((r) => (
          <button
            key={r.role}
            id={`role-${r.role}`}
            onClick={() => onSelect(r.role)}
            className="card p-8 text-left cursor-pointer hover:border-teal-400 transition-all group"
            style={{ borderColor: "var(--surface-border)" }}
          >
            <div className="text-4xl mb-4">{r.icon}</div>
            <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}>{r.title}</h3>
            <p className="text-sm mb-5 leading-relaxed" style={{ color: "var(--text-secondary)" }}>{r.desc}</p>
            <span className="text-sm font-semibold" style={{ color: "var(--teal-400)" }}>{r.action}</span>
          </button>
        ))}
      </div>
    </main>
  );
}
