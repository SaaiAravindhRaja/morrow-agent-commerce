"use client";

import { useEffect, useState } from "react";

import {
  COMMITMENT_PRICE_ATOMIC,
  DEMO_PHASES,
  XSGD,
  buildDemoProof,
  contenderResult,
  contenderStatus,
  formatXsgd,
} from "@/lib/commerce";

const LAST_PHASE = DEMO_PHASES.length - 1;
const DEMO_PROOF = buildDemoProof();
const CHAIN_ID = XSGD.network.replace("eip155:", "");

function statusForPhase(phase: number) {
  if (phase >= 5) return "BOOKED";
  if (phase >= 4) return "HELD";
  if (phase >= 2) return "PAYMENT PENDING";
  return "AVAILABLE";
}

export function CommerceStage() {
  const [phase, setPhase] = useState(0);
  const [running, setRunning] = useState(false);
  const winner = DEMO_PROOF[0];
  const loser = DEMO_PROOF[1];

  useEffect(() => {
    if (!running || phase >= LAST_PHASE) return;

    const timer = window.setTimeout(() => {
      const nextPhase = phase + 1;
      setPhase(nextPhase);
      if (nextPhase >= LAST_PHASE) setRunning(false);
    }, 920);
    return () => window.clearTimeout(timer);
  }, [phase, running]);

  function runProof() {
    if (phase >= LAST_PHASE) setPhase(0);
    setRunning(true);
  }

  function resetProof() {
    setRunning(false);
    setPhase(0);
  }

  const inventoryStatus = statusForPhase(phase);

  return (
    <section className="demo-wrap" aria-labelledby="proof-title">
      <div className="demo-head shell">
        <div>
          <span className="section-kicker">60-SECOND PROOF</span>
          <h2 id="proof-title">Two agents. One final slot.</h2>
        </div>
        <div className="demo-actions">
          <button className="reset-button" type="button" onClick={resetProof}>Reset</button>
          <button className="run-button" type="button" onClick={runProof} disabled={running}>
            <span>{running ? "Proof running" : phase === LAST_PHASE ? "Run again" : "Run the proof"}</span>
            <i aria-hidden="true">{running ? "···" : "→"}</i>
          </button>
        </div>
      </div>

      <div className="proof-shell shell">
        <div className="proof-mode">
          <div><span className="mode-dot" /> DETERMINISTIC DEMO</div>
          <p>No payment is broadcast in this preview. Mainnet contract values are real.</p>
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
              <div className="scarcity">
                <strong>01</strong>
                <span>slot left</span>
              </div>
            </div>
            <div className="inventory-terms">
              <div><span>Commitment</span><strong>10 MIN</strong></div>
              <div><span>Price</span><strong>{formatXsgd(COMMITMENT_PRICE_ATOMIC)}</strong></div>
              <div><span>On exercise</span><strong>FULL CREDIT</strong></div>
            </div>
            <p className="terms-note">Non-refundable if it expires. Credited to the booking when exercised on time.</p>
          </article>

          <article className="race-card" aria-live="polite">
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
              <div className="decision-line"><span style={{ width: `${(phase / LAST_PHASE) * 100}%` }} /></div>
            </div>
            <div className="phase-copy">
              <span>{DEMO_PHASES[phase].title}</span>
              <p>{DEMO_PHASES[phase].detail}</p>
            </div>
          </article>

          <article className={`receipt-card ${phase >= 4 ? "receipt-visible" : ""}`}>
            <div className="card-meta">
              <span>COMMITMENT RECEIPT</span>
              <span>{phase >= 5 ? "EXERCISED" : phase >= 4 ? "DEMO RECEIPT" : "PENDING"}</span>
            </div>
            <div className="receipt-seal">M</div>
            <div className="receipt-title">
              <span>MERCHANT PROMISE</span>
              <h3>{phase >= 5 ? "Booking confirmed." : phase >= 4 ? "Slot held for Atlas." : "Awaiting settlement."}</h3>
            </div>
            <dl>
              <div><dt>Receipt</dt><dd>{phase >= 4 ? winner.receipt?.receiptId : "—"}</dd></div>
              <div><dt>Network</dt><dd>AVAX {CHAIN_ID}</dd></div>
              <div><dt>Asset</dt><dd>{XSGD.symbol} · {XSGD.decimals} DEC</dd></div>
              <div><dt>Loser charged</dt><dd className="zero-value">{phase >= 3 ? "S$0.00" : "—"}</dd></div>
            </dl>
            <div className="receipt-hash">
              <span>TERMS HASH</span>
              <code>{phase >= 4 ? winner.receipt?.termsHash : "0x——————"}</code>
            </div>
          </article>
        </div>

        <div className="proof-ledger">
          <div className="ledger-label">PROOF LEDGER</div>
          <div className={phase >= 2 ? "ledger-active" : ""}><span>01</span><p>Both authorizations valid</p><strong>{phase >= 2 ? "TRUE" : "—"}</strong></div>
          <div className={phase >= 4 ? "ledger-active" : ""}><span>02</span><p>Settlements executed</p><strong>{phase >= 4 ? "1 / 2" : "—"}</strong></div>
          <div className={phase >= 3 ? "ledger-active" : ""}><span>03</span><p>Nova balance delta</p><strong>{phase >= 3 ? formatXsgd(loser.chargedAtomic) : "—"}</strong></div>
          <div className={phase >= 5 ? "ledger-active" : ""}><span>04</span><p>Inventory outcome</p><strong>{phase >= 5 ? "BOOKED" : "—"}</strong></div>
        </div>
      </div>

      <div className="protocol-bar shell">
        <div><span>NETWORK</span><strong>{XSGD.network}</strong></div>
        <div><span>ASSET</span><strong>{XSGD.address.slice(0, 8)}…{XSGD.address.slice(-6)}</strong></div>
        <div><span>ATOMIC PRICE</span><strong>{COMMITMENT_PRICE_ATOMIC.toLocaleString("en-US")}</strong></div>
        <div><span>AUTHORIZATION</span><strong>EIP-3009</strong></div>
        <a href="/.well-known/agent-commerce">AGENT CAPABILITY ↗</a>
      </div>
    </section>
  );
}
