import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });
const spaceGrotesk = Space_Grotesk({ variable: "--font-display", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "GigEscrow — Freelancer Payment Protection on Stellar",
  description: "Milestone-based escrow for Filipino freelancers. Client pays upfront into a Soroban smart contract. Funds release automatically on approval — no more payment scams.",
  keywords: ["Freelancer", "Escrow", "Stellar", "Soroban", "Philippines", "USDC", "Payment Protection"],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
