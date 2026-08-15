"use client";

import { ArrowCounterClockwise, Check, Circle, Flask, ShieldCheck } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

import {
  DEMO_PHASES,
  formatXsgd,
  type DemoProofResponse,
} from "@/lib/commerce";
import { COMMITMENT_POLICIES, type CommitmentPolicy } from "@/lib/policies";
import { runDemo } from "@/lib/run-demo";

type ProofLifecycle = "idle" | "attempting" | "playing" | "completed" | "error";

const LAST_PHASE = DEMO_PHASES.length - 1;

function proofLabel(proof: DemoProofResponse | null, lifecycle: ProofLifecycle) {
  if (lifecycle === "attempting") return "Preparing checkout";
  if (lifecycle === "error") return "Checkout unavailable";
  if (lifecycle === "completed" && proof) return "Test complete";
  if (lifecycle === "playing") return "Checkout in progress";
  return "Ready to test";
}

function proofDescription(proof: DemoProofResponse | null, lifecycle: ProofLifecycle) {
  if (lifecycle === "attempting") return "Preparing authorization, allocation, settlement, and exercise.";
  if (lifecycle === "error") return "Nothing was charged. Reset and try again.";
  if (lifecycle === "completed" && proof) return "The sample checkout completed. No customer account was charged.";
  if (lifecycle === "playing") return "Following the commitment through each checkout step.";
  return "Uses sample buyers and never charges a customer.";
}

export function CommerceStage({
  policy = COMMITMENT_POLICIES[0],
}: {
  policy?: CommitmentPolicy;
}) {
  const [phase, setPhase] = useState(0);
  const [lifecycle, setLifecycle] = useState<ProofLifecycle>("idle");
  const [proof, setProof] = useState<DemoProofResponse | null>(null);
  const runIdRef = useRef(0);
  const requestRef = useRef<AbortController | null>(null);
  const active = lifecycle === "attempting" || lifecycle === "playing";
  const winner = proof?.contenders.find((contender) => contender.settled);

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
    }, 620);
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

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setPhase(LAST_PHASE);
        setLifecycle("completed");
      } else {
        setLifecycle("playing");
      }
    } catch (error) {
      if (controller.signal.aborted || runId !== runIdRef.current) return;
      console.error("Unable to prepare the proof", error);
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

  const isComplete = lifecycle === "completed";
  const statusTone = lifecycle === "error" ? "error" : lifecycle === "completed" ? "verified" : lifecycle === "idle" ? "neutral" : "demo";

  return (
    <section className="proof-panel" aria-labelledby="proof-panel-title">
      <header className="proof-panel-header">
        <div>
          <span className="overline">Checkout test</span>
          <h3 id="proof-panel-title">One slot, two buyers, one settlement</h3>
          <p>Preview how two buyers compete for the last available commitment.</p>
        </div>
        <div className="proof-actions">
          {lifecycle === "completed" || lifecycle === "error" ? (
            <button className="button button-secondary button-icon" type="button" onClick={resetProof} aria-label="Reset checkout test">
              <ArrowCounterClockwise size={17} aria-hidden="true" />
            </button>
          ) : null}
          <button className="button button-primary" type="button" onClick={runProof} disabled={active}>
            <Flask size={17} weight="bold" aria-hidden="true" />
            {lifecycle === "attempting"
              ? "Preparing"
              : lifecycle === "playing"
                ? `Step ${phase + 1} of ${DEMO_PHASES.length}`
                : lifecycle === "completed"
                  ? "Run again"
                  : lifecycle === "error"
                    ? "Retry test"
                    : "Run test"}
          </button>
        </div>
      </header>

      <p className="sr-only" aria-live="polite">
        {lifecycle === "playing"
          ? `Step ${phase + 1}: ${DEMO_PHASES[phase].title}`
          : lifecycle === "completed"
            ? "Checkout test complete. Exactly one buyer settled and the losing buyer paid zero."
            : proofLabel(proof, lifecycle)}
      </p>

      <div className={`proof-notice proof-notice-${statusTone}`}>
        <ShieldCheck size={20} weight="fill" aria-hidden="true" />
        <div>
          <strong>{proofLabel(proof, lifecycle)}</strong>
          <p>{proofDescription(proof, lifecycle)}</p>
        </div>
      </div>

      <div className="proof-layout">
        <ol className="proof-timeline">
          {DEMO_PHASES.map((step, index) => {
            const complete = lifecycle === "completed" || index < phase;
            const current = lifecycle === "playing" && index === phase;
            return (
              <li key={step.title} data-state={complete ? "complete" : current ? "current" : "pending"}>
                <span className="proof-step-icon" aria-hidden="true">
                  {complete ? <Check size={14} weight="bold" /> : <Circle size={10} weight={current ? "fill" : "regular"} />}
                </span>
                <div>
                  <strong>{step.title}</strong>
                  <p>{step.detail}</p>
                </div>
              </li>
            );
          })}
        </ol>

        <aside className="proof-outcome" aria-label="Checkout result">
          <div className="proof-offer">
            <span>Offer under test</span>
            <strong>{policy.item}</strong>
            <dl>
              <div><dt>Commitment</dt><dd>{formatXsgd(BigInt(policy.feeAtomic))}</dd></div>
              <div><dt>Capacity</dt><dd>1 final slot</dd></div>
              <div><dt>Window</dt><dd>{policy.durationMinutes} minutes</dd></div>
            </dl>
          </div>

          <div className="proof-buyers">
            <div data-result={isComplete ? "winner" : "pending"}>
              <span className="buyer-mark">A</span>
              <div><strong>Atlas</strong><small>Buyer agent</small></div>
              <b>{isComplete ? "Exercised" : "Authorized"}</b>
            </div>
            <div data-result={isComplete ? "loser" : "pending"}>
              <span className="buyer-mark">N</span>
              <div><strong>Nova</strong><small>Buyer agent</small></div>
              <b>{isComplete ? "S$0 charged" : "Authorized"}</b>
            </div>
          </div>

          <div className="proof-receipt" data-visible={isComplete}>
            <span>Merchant receipt</span>
            <strong>{isComplete ? winner?.receipt?.receiptId ?? "rcpt_01MORROW" : "Generated after settlement"}</strong>
            <dl>
              <div><dt>Settlements</dt><dd>{isComplete ? "1 of 2" : "—"}</dd></div>
              <div><dt>Winner credit</dt><dd>{isComplete ? formatXsgd(BigInt(policy.feeAtomic)) : "—"}</dd></div>
              <div><dt>Loser balance delta</dt><dd className="success-text">{isComplete ? "0.00 XSGD" : "—"}</dd></div>
            </dl>
          </div>
        </aside>
      </div>

    </section>
  );
}
