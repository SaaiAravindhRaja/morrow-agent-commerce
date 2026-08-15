import type { Metadata } from "next";
import Link from "next/link";

import { ArchitectureStage } from "@/components/architecture-stage";
import { mainnetSettlementNotice } from "@/lib/commerce";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Morrow architecture",
  description:
    "Two agents race. One settlement. The loser is never charged. x402 exact and Permit2 on Avalanche C-Chain.",
};

export default function ArchitecturePage() {
  const settlementNotice = mainnetSettlementNotice();

  return (
    <main>
      <nav className="nav shell" aria-label="Primary navigation">
        <Link className="wordmark" href="/" aria-label="Morrow home">
          MORROW<span className="wordmark-dot">.</span>
        </Link>
        <div className="nav-proof">
          <span className="pulse-dot" />
          Architecture · no AWS running
        </div>
        <Link className="nav-link" href="/#proof-title">
          Back to the proof <span aria-hidden="true">↖</span>
        </Link>
      </nav>
      {settlementNotice ? <p className="shell">{settlementNotice}</p> : null}
      <ArchitectureStage />
    </main>
  );
}
