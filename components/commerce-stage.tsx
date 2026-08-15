"use client";

import { useEffect, useRef, useState } from "react";

import {
  COMMITMENT_PRICE_ATOMIC,
  DEMO_PHASES,
  XSGD,
  contenderResult,
  contenderStatus,
  formatXsgd,
  proofModeDisclaimer,
  type DemoProofResponse,
} from "@/lib/commerce";
import { runDemo } from "@/lib/run-demo";

type ProofLifecycle = "idle" | "attempting" | "playing" | "completed" | "error";

const LAST_PHASE = DEMO_PHASES.length - 1;
const CHAIN_ID = XSGD.network.replace("eip155:", "");

function statusForPhase(phase: number) {
  if (phase >= 5) return "BOOKED";
  if (phase >= 4) return "HELD";
  if (phase >= 2) return "PAYMENT PENDING";
  return "AVAILABLE";
}

function modeTone(proof: DemoProofResponse | null, lifecycle: ProofLifecycle) {
  if (lifecycle === "attempting") return "pending";
  if (lifecycle === "error") return "error";
  if (!proof) return "idle";
  return proof.proofMode === "LIVE_FORK" ? "live" : "demo";
}

function modeLabel(proof: DemoProofResponse | null, lifecycle: ProofLifecycle) {
  if (lifecycle === "attempting") return "CHECKING LOCAL FORK";
  if (lifecycle === "error") return "PROOF UNAVAILABLE";
  if (!proof) return "PROOF READY · LIVE-FIRST";
  return proof.proofMode === "LIVE_FORK" ? "LOCAL FORK · VERIFIED" : "DETERMINISTIC · SIMULATED";
}

function modeCopy(proof: DemoProofResponse | null, lifecycle: ProofLifecycle) {
  if (lifecycle === "attempting") {
    return "Checking the local Avalanche mainnet fork before choosing the proof path.";
  }
  if (lifecycle === "error") {
    return "The proof could not be prepared. No payment was broadcast. Retry when ready.";
  }
  if (!proof) {
    return "Live fork first; deterministic fallback if unavailable. Neither path broadcasts to mainnet.";
  }
  if (proof.viewerNote) return proof.viewerNote;
  if (proof.liveErrorCode) {
    return "Local fork unavailable. Deterministic proof activated; no payment was broadcast.";
  }
  return proof.disclaimer || proofModeDisclaimer(proof.proofMode);
}

function lifecycleAnnouncement(lifecycle: ProofLifecycle, phase: number, proof: DemoProofResponse | null) {
  if (lifecycle === "attempting") return "Checking the local fork.";
  if (lifecycle === "playing") return `Proof step ${phase + 1} of 6: ${DEMO_PHASES[phase].title}.`;
  if (lifecycle === "completed") {
    return `Proof complete in ${proof?.proofMode === "LIVE_FORK" ? "local fork" : "deterministic simulation"} mode. Atlas won. Nova was charged zero.`;
  }
  if (lifecycle === "error") return "Proof unavailable. Retry or reset.";
  return "Proof ready.";
}

export function CommerceStage() {
  const [phase, setPhase] = useState(0);
  const [lifecycle, setLifecycle] = useState<ProofLifecycle>("idle");
  const [proof, setProof] = useState<DemoProofResponse | null>(null);
  const runIdRef = useRef(0);
  const requestRef = useRef<AbortController | null>(null);

  const active = lifecycle === "attempting" || lifecycle === "playing";
  const tone = modeTone(proof, lifecycle);
  const winner = proof?.contenders.find((contender) => contender.settled);
  const loser = proof?.contenders.find((contender) => !contender.settled);

  useEffect(() => {
    return () => {
      runIdRef.current += 1;
      requestRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (lifecycle !== "playing" || phase >= LAST_PHASE) return;

    const timer = window.setTimeout(() => {
      setPhase((current) => {
        const next = current + 1;
        if (next >= LAST_PHASE) setLifecycle("completed");
        return next;
      });
    }, 720);
    return () => window.clearTimeout(timer);
  }, [phase, lifecycle]);

  async function runProof() {
    if (active) return;

    const runId = ++runIdRef.current;
    const controller = new AbortController();
    requestRef.current = controller;
    setPhase(0);
    setProof(null);
    setLifecycle("attempting");

    try {
      const nextProof = await runDemo(fetch, { signal: controller.signal });
      if (runId !== runIdRef.current) return;

      setProof(nextProof);
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reducedMotion) {
        setPhase(LAST_PHASE);
        setLifecycle("completed");
      } else {
        setPhase(0);
        setLifecycle("playing");
      }
    } catch (error) {
      if (controller.signal.aborted || runId !== runIdRef.current) return;
      console.error("Unable to prepare the demo proof", error);
      setLifecycle("error");
    } finally {
      if (requestRef.current === controller) requestRef.current = null;
    }
  }

  function resetProof() {
    if (active) return;
    runIdRef.current += 1;
    setLifecycle("idle");
    setPhase(0);
    setProof(null);
  }

  const inventoryStatus = statusForPhase(phase);
  const receiptKind =
    phase >= 5
      ? "EXERCISED"
      : phase >= 4
        ? proof?.proofMode === "LIVE_FORK"
          ? "FORK RECEIPT"
          : "DEMO RECEIPT"
        : "PENDING";
  const loserCharged = phase >= 3 && loser ? formatAtomic(loser.chargedAtomic) : "—";

  return (
    <section className="demo-wrap" aria-labelledby="proof-title" id="proof">
      <div className="demo-head shell">
        <div className="demo-intro">
          <span className="section-kicker">THE MERCHANT PROOF</span>
          <h2 id="proof-title">One final slot. Two autonomous buyers.</h2>
          <p>Friday dinner for two · SKU #SG-0820 · Atlas versus Nova</p>
        </div>
        <div className="demo-decision">
          <span>MERCHANT GUARANTEE</span>
          <strong>1 winner · 1 settlement · loser S$0</strong>
        </div>
        <div className="demo-actions">
          {(lifecycle === "completed" || lifecycle === "error") ? (
            <button className="reset-button" type="button" onClick={resetProof}>Reset</button>
          ) : null}
          <button className="run-button" type="button" onClick={runProof} disabled={active}>
            <span>
              {lifecycle === "attempting"
                ? "Checking fork"
                : lifecycle === "playing"
                  ? `Step ${phase + 1} of 6`
                  : lifecycle === "completed"
                    ? "Run again"
                    : lifecycle === "error"
                      ? "Retry proof"
                      : "Run proof"}
            </span>
            <i aria-hidden="true">{active ? "···" : "→"}</i>
          </button>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {lifecycleAnnouncement(lifecycle, phase, proof)}
      </p>

      <div className={`proof-shell shell shell-${tone}`} data-lifecycle={lifecycle}>
        <div className={`proof-mode mode-${tone}`}>
          <div>
            <span className="mode-dot" aria-hidden="true" />
            {modeLabel(proof, lifecycle)}
          </div>
          <p>{modeCopy(proof, lifecycle)}</p>
        </div>

        <div className="proof-grid">
          <article className="inventory-card">
            <div className="card-meta">
              <span>MERCHANT INVENTORY / #SG-0820</span>
              <span className={`inventory-status status-${inventoryStatus.toLowerCase().replace(" ", "-")}`}>
                {inventoryStatus}
              </span>
            </div>
            <div className="inventory-main">
              <div>
                <span className="inventory-type">DEMO WEDGE · DINING</span>
                <h3>Friday dinner<br />for two.</h3>
              </div>
              <div className="scarcity" aria-label="One slot left">
                <strong>01</strong>
                <span>slot left</span>
              </div>
            </div>
            <div className="inventory-terms">
              <div><span>Commitment</span><strong>10 MIN</strong></div>
              <div><span>Price</span><strong>{formatXsgd(COMMITMENT_PRICE_ATOMIC)}</strong></div>
              <div><span>On exercise</span><strong>FULL CREDIT</strong></div>
            </div>
            <p className="terms-note">Merchant-set terms. Non-refundable on expiry; fully credited when exercised.</p>
          </article>

          <article className="race-card">
            <div className="card-meta">
              <span>MERCHANT DECISION ENGINE</span>
              <span>STEP {String(phase + 1).padStart(2, "0")} / 06</span>
            </div>
            <div className="race-track">
              <div className={`agent-row ${phase >= 3 ? "agent-winner" : ""}`}>
                <div className="agent-mark">A</div>
                <div><span>ATLAS / BUYER AGENT</span><strong>{contenderStatus(phase, "winner")}</strong></div>
                <div className="agent-result">{contenderResult(phase, "winner")}</div>
              </div>
              <div className={`agent-row ${phase >= 3 ? "agent-loser" : ""}`}>
                <div className="agent-mark">N</div>
                <div><span>NOVA / BUYER AGENT</span><strong>{contenderStatus(phase, "loser")}</strong></div>
                <div className="agent-result">{contenderResult(phase, "loser")}</div>
              </div>
              <div className="decision-line" aria-hidden="true"><span style={{ width: `${(phase / LAST_PHASE) * 100}%` }} /></div>
            </div>
            <div className="phase-copy">
              <span>{DEMO_PHASES[phase].title}</span>
              <p>{DEMO_PHASES[phase].detail}</p>
            </div>
          </article>

          <article className={`receipt-card ${phase >= 4 ? "receipt-visible" : ""}`}>
            <div className="card-meta">
              <span>COMMITMENT RECEIPT</span>
              <span>{receiptKind}</span>
            </div>
            <div className="receipt-seal" aria-hidden="true">M</div>
            <div className="receipt-title">
              <span>MERCHANT PROMISE</span>
              <h3>{phase >= 5 ? "Booking confirmed." : phase >= 4 ? "Slot held for Atlas." : "Awaiting settlement."}</h3>
            </div>
            <dl>
              <div><dt>Receipt</dt><dd>{phase >= 4 ? winner?.receipt?.receiptId ?? "—" : "—"}</dd></div>
              <div><dt>Network target</dt><dd>AVAX {CHAIN_ID}</dd></div>
              <div><dt>Asset</dt><dd>{XSGD.symbol} · {XSGD.decimals} DEC</dd></div>
              <div><dt>Nova charged</dt><dd className="zero-value">{phase >= 3 ? "S$0.00" : "—"}</dd></div>
            </dl>
            <div className="receipt-hash">
              <span>TERMS HASH</span>
              <code>{phase >= 4 ? winner?.receipt?.termsHash ?? "—" : "0x------"}</code>
            </div>
          </article>
        </div>

        <div className="proof-ledger">
          <div className="ledger-label">PROOF LEDGER</div>
          <div className={phase >= 2 ? "ledger-active" : ""}><span>01</span><p>Both authorizations valid</p><strong>{phase >= 2 ? "TRUE" : "—"}</strong></div>
          <div className={phase >= 4 ? "ledger-active" : ""}><span>02</span><p>Settlements executed</p><strong>{phase >= 4 ? "1 / 2" : "—"}</strong></div>
          <div className={phase >= 3 ? "ledger-active" : ""}><span>03</span><p>Nova balance delta</p><strong>{loserCharged}</strong></div>
          <div className={phase >= 5 ? "ledger-active" : ""}><span>04</span><p>Inventory outcome</p><strong>{phase >= 5 ? "BOOKED" : "—"}</strong></div>
        </div>
      </div>

      <div className="protocol-bar shell" aria-label="Sponsor technology roles">
        <div><span>MACHINE PAYMENT</span><strong>x402 v2 · exact</strong></div>
        <div><span>SETTLEMENT ASSET</span><strong>XSGD · 200000 atomic</strong></div>
        <div><span>TARGET NETWORK</span><strong>Avalanche C-Chain</strong></div>
        <div><span>AUTHORIZATION</span><strong>Permit2 · sign first</strong></div>
        <a href="/.well-known/agent-commerce">AGENT CAPABILITY ↗</a>
      </div>
    </section>
  );
}

function formatAtomic(amountAtomic: string) {
  try {
    return formatXsgd(BigInt(amountAtomic));
  } catch {
    return amountAtomic;
  }
}
