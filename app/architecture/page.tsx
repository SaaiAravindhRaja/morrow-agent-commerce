import type { Metadata } from "next";
import Link from "next/link";

import { ArchitectureStage } from "@/components/architecture-stage";

export const metadata: Metadata = {
  title: "Morrow architecture",
  description:
    "Two agents race. One settlement. The loser is never charged. x402 exact and Permit2 on Avalanche C-Chain.",
};

export default function ArchitecturePage() {
  return (
    <main>
      <nav className="architecture-nav" aria-label="Primary navigation">
        <Link className="brand" href="/" aria-label="Morrow commitments">
          MORROW<span>.</span>
        </Link>
        <span>Architecture · evidence labels distinguish deployed, fork-proven, and simulated paths</span>
        <Link href="/">
          Back to commitments
        </Link>
      </nav>
      <ArchitectureStage />
    </main>
  );
}
