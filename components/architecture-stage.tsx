"use client";

import { useId, useRef, useState } from "react";

import {
  ARCHITECTURE_ADDRESSES,
  ARCHITECTURE_AWS,
  ARCHITECTURE_COLOR_VARS,
  ARCHITECTURE_NODES,
  ARCHITECTURE_RESEARCH,
  bakeSvgColors,
  findArchitectureNode,
  svgHasExternalNetwork,
  wrapStandaloneSvg,
  type ArchitectureNode,
  type ArchitectureEvidence,
} from "@/lib/architecture";

type Scheme = "dark" | "light";

const EVIDENCE_LABEL: Record<ArchitectureEvidence, string> = {
  DEPLOYED: "DEPLOYED",
  FORK_PROVEN: "FORK-PROVEN",
  SIMULATED: "SIMULATED",
  NOT_USED: "NOT USED",
};

function evidenceOf(id: string): ArchitectureEvidence {
  return findArchitectureNode(id)?.evidence[0] ?? "NOT_USED";
}

export function ArchitectureStage() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scheme, setScheme] = useState<Scheme>("light");
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);
  const titleId = useId();

  const selected = selectedId ? findArchitectureNode(selectedId) : undefined;

  const story = ARCHITECTURE_NODES;

  function select(id: string) {
    setSelectedId((current) => (current === id ? null : id));
  }

  function downloadSvg() {
    const svg = svgRef.current;
    if (!svg) {
      setDownloadStatus("The diagram was not ready. Please try again.");
      return;
    }

    const root = svg.closest(".arch-page");
    const styles = root ? getComputedStyle(root) : getComputedStyle(document.documentElement);
    const colors: Record<string, string> = {};
    for (const name of ARCHITECTURE_COLOR_VARS) {
      colors[name] = styles.getPropertyValue(name);
    }

    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.querySelectorAll("[data-selected]").forEach((node) => {
      node.removeAttribute("data-selected");
    });
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const baked = bakeSvgColors(clone.outerHTML, colors);
    if (svgHasExternalNetwork(baked)) {
      setDownloadStatus("Export stopped because the diagram was not fully offline-safe.");
      return;
    }

    const blob = new Blob([wrapStandaloneSvg(baked)], { type: "image/svg+xml;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = "morrow-architecture.svg";
    link.click();
    URL.revokeObjectURL(href);
    setDownloadStatus("Architecture SVG downloaded.");
  }

  return (
    <div className="arch-page" data-scheme={scheme}>
      <header className="arch-head">
        <p className="arch-kicker">StraitsX AgentiX / Track 3 / architecture</p>
        <div className="arch-title-row">
          <h1 id={titleId}>Two agents race. One settlement. The loser is never charged.</h1>
          <div className="arch-tools">
            <div className="arch-scheme" role="group" aria-label="Color scheme">
              <button
                type="button"
                className={scheme === "dark" ? "is-on" : ""}
                aria-pressed={scheme === "dark"}
                onClick={() => setScheme("dark")}
              >
                Dark
              </button>
              <button
                type="button"
                className={scheme === "light" ? "is-on" : ""}
                aria-pressed={scheme === "light"}
                onClick={() => setScheme("light")}
              >
                Light
              </button>
            </div>
            <button type="button" className="arch-download" onClick={downloadSvg}>
              Download SVG
            </button>
          </div>
        </div>
        <p className="arch-lede">
          Morrow sells a paid ten-minute commitment on scarce inventory. Atlas and
          Nova both authorize 0.20 XSGD on x402 exact / Permit2. The merchant
          decides inventory first, then settles only Atlas. Nova&apos;s authorization
          is discarded, so there is nothing to refund. Front-end is on Vercel.
          Settlement is proven on a local Anvil mainnet fork. AWS is not running.
          No real mainnet settlement has been sent.
        </p>
        <p className="arch-error" aria-live="polite">{downloadStatus}</p>
      </header>

      <aside className="arch-banner">
        <strong>AWS Well-Architected, as drawn</strong>
        <p>
          This page demonstrates the principles. The hackathon implementation is
          the Anvil fork plus an in-process lock. AWS services on this page are
          a production mapping, not a running account.
        </p>
      </aside>

      <ul className="arch-legend" aria-label="Current evidence labels">
        <li><i className="swatch-live" /> Deployed route</li>
        <li><i className="swatch-fork" /> Fork-proven behavior</li>
        <li><i className="swatch-demo" /> Simulated behavior</li>
        <li><i className="swatch-out" /> Not used</li>
      </ul>

      <p className="arch-hint">
        Read the ordered evidence below to inspect each system step. The desktop
        diagram is a visual summary and offline export.
      </p>

      <div className="arch-frame" aria-labelledby={titleId}>
        <svg
          ref={svgRef}
          className="arch-svg"
          viewBox="0 0 1304 392"
          aria-hidden="true"
          focusable="false"
        >
          <title>Morrow payment and inventory race</title>
          <desc>
            Atlas and Nova call capabilities and commit, receive HTTP 402 exact
            Permit2 terms, both sign off-chain, merchant verifies both with no
            funds moving, inventory is decided, only the winner is settled
            through the exact Permit2 proxy to XSGD on Avalanche C-Chain, the
            loser authorization is discarded.
          </desc>

          <NodeBox
            id="agents"
            x={8}
            y={10}
            w={148}
            h={116}
            selected={selectedId === "agents"}
            status={evidenceOf("agents")}
            kicker="BUYER AGENTS"
            lines={["Atlas", "Nova"]}
            note="Same last table"
          />

          <Arrow x1={156} y1={68} x2={208} y2={68} />

          <NodeBox
            id="merchant"
            x={210}
            y={28}
            w={196}
            h={80}
            selected={selectedId === "merchant"}
            status={evidenceOf("merchant")}
            kicker="MERCHANT API / VERCEL"
            lines={["GET /api/capabilities", "GET /api/commit"]}
            note="HTTP 402"
          />

          <Arrow x1={406} y1={68} x2={438} y2={68} />

          <NodeBox
            id="terms"
            x={440}
            y={28}
            w={188}
            h={80}
            selected={selectedId === "terms"}
            status={evidenceOf("terms")}
            kicker="402 TERMS"
            lines={["scheme exact", "Permit2 · 0.20 XSGD"]}
            note="200000 · 600s"
          />

          <Arrow x1={628} y1={68} x2={660} y2={68} />

          <NodeBox
            id="sign"
            x={662}
            y={28}
            w={188}
            h={80}
            selected={selectedId === "sign"}
            status={evidenceOf("sign")}
            kicker="OFF-CHAIN"
            lines={["Both sign Permit2"]}
            note="Nothing broadcast"
          />

          <Arrow x1={850} y1={68} x2={882} y2={68} />

          <NodeBox
            id="verify"
            x={884}
            y={28}
            w={412}
            h={80}
            selected={selectedId === "verify"}
            status={evidenceOf("verify")}
            kicker="FACILITATOR /verify"
            lines={["Merchant verifies both. No funds move."]}
            note="Balance, allowance, nonce, deadline. Still unused."
            fill="acid"
          />

          <Arrow x1={650} y1={108} x2={650} y2={158} down />

          <NodeBox
            id="inventory"
            x={8}
            y={162}
            w={430}
            h={132}
            selected={selectedId === "inventory"}
            status={evidenceOf("inventory")}
            kicker="DEMO + PRODUCTION MAPPING"
            lines={["Inventory decision. Exactly one winner."]}
            note="Demo: in-process lock. Mapping: DynamoDB write."
            extra={[
              "attribute_not_exists(lockedBy)",
              "OR expiresAt < :now",
            ]}
          />

          <Arrow x1={438} y1={190} x2={480} y2={190} />
          <text x={444} y={184} className="arch-svg-acid" fontSize="9" fontFamily="ui-monospace, Consolas, monospace">
            WINNER
          </text>

          <NodeBox
            id="settle"
            x={482}
            y={162}
            w={488}
            h={132}
            selected={selectedId === "settle"}
            status={evidenceOf("settle")}
            kicker="SETTLE WINNER ONLY"
            lines={["facilitator /settle", "Exact proxy then Permit2 then XSGD"]}
            extra={[
              ARCHITECTURE_ADDRESSES.exactProxy,
              ARCHITECTURE_ADDRESSES.permit2,
              ARCHITECTURE_ADDRESSES.xsgd,
            ]}
          />

          <path
            d="M223 294 V308 H1145 V294"
            fill="none"
            stroke="var(--arch-orange)"
            strokeWidth="1.4"
          />
          <text x={228} y={306} className="arch-svg-orange" fontSize="9" fontFamily="ui-monospace, Consolas, monospace">
            LOSER
          </text>

          <NodeBox
            id="loser"
            x={994}
            y={162}
            w={302}
            h={132}
            selected={selectedId === "loser"}
            status={evidenceOf("loser")}
            kicker="NEVER SETTLED"
            lines={["Discard / expire", "Charged 0.00 XSGD"]}
            note="No refund. There was never a charge."
          />

          <NodeBox
            id="approve"
            x={8}
            y={326}
            w={420}
            h={56}
            selected={selectedId === "approve"}
            status={evidenceOf("approve")}
            kicker="ONE-TIME, ON-CHAIN"
            lines={["XSGD.approve(Permit2, max). Payer pays gas once."]}
          />

          <NodeBox
            id="fallback"
            x={436}
            y={326}
            w={428}
            h={56}
            selected={selectedId === "fallback"}
            status={evidenceOf("fallback")}
            kicker="JUDGING FALLBACK"
            lines={["Fork down: UI says DETERMINISTIC_DEMO"]}
          />

          <NodeBox
            id="out"
            x={872}
            y={326}
            w={424}
            h={56}
            selected={selectedId === "out"}
            status={evidenceOf("out")}
            kicker="NOT IN THE LIVE PATH"
            lines={["EIP-3009 · card hold · x402 upto"]}
          />
        </svg>
      </div>

      <ol className="arch-story">
        {story.map((node, index) => (
          <li key={node.id}>
            <button
              type="button"
              onClick={() => select(node.id)}
              data-active={selectedId === node.id}
              aria-pressed={selectedId === node.id}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{node.title}</strong>
              <span className="arch-evidence-row">
                {node.evidence.map((evidence) => (
                  <em key={evidence} data-status={evidence}>{EVIDENCE_LABEL[evidence]}</em>
                ))}
              </span>
              <p>{node.does}</p>
              {node.productionMapping ? (
                <small>Production mapping: {node.productionMapping}</small>
              ) : null}
            </button>
          </li>
        ))}
      </ol>

      <DetailPanel node={selected} />

      <section className="arch-aws" aria-labelledby="research-title">
        <h2 id="research-title">What we actually verified on Avalanche</h2>
        <p className="arch-aws-note">
          This is the x402 research. It is why we ship exact + Permit2. None of
          it is a guess.
        </p>
        <div className="arch-aws-grid">
          {ARCHITECTURE_RESEARCH.map((item) => (
            <article key={item.id}>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              <p className="arch-repro">{item.reproduce}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="arch-aws" aria-labelledby="aws-title">
        <h2 id="aws-title">What the AWS judge is looking at</h2>
        <p className="arch-aws-note">
          Production mapping. None of these AWS services are running in the
          hackathon build.
        </p>
        <div className="arch-aws-grid">
          {ARCHITECTURE_AWS.map((item) => (
            <article key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function DetailPanel({ node }: { node?: ArchitectureNode }) {
  if (!node) {
    return (
      <section className="arch-detail is-empty" aria-live="polite">
        <h2>Node detail</h2>
        <p>Select a system step above to inspect its protocol and current evidence.</p>
      </section>
    );
  }

  return (
    <section className="arch-detail" aria-live="polite">
      <div className="arch-detail-status">
        {node.evidence.map((evidence) => (
          <span key={evidence} data-status={evidence}>{EVIDENCE_LABEL[evidence]}</span>
        ))}
      </div>
      <h2>{node.title}</h2>
      <dl>
        <div>
          <dt>What it does</dt>
          <dd>{node.does}</dd>
        </div>
        <div>
          <dt>Protocol</dt>
          <dd>{node.protocol}</dd>
        </div>
        <div>
          <dt>What is real today</dt>
          <dd>{node.today}</dd>
        </div>
        {node.productionMapping ? (
          <div>
            <dt>Production mapping</dt>
            <dd>{node.productionMapping} · not running in this build</dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}

function Arrow({
  x1,
  y1,
  x2,
  y2,
  down,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  down?: boolean;
}) {
  const head = down
    ? `${x2 - 4},${y2 - 10} ${x2},${y2} ${x2 + 4},${y2 - 10}`
    : `${x2 - 10},${y2 - 4} ${x2},${y2} ${x2 - 10},${y2 + 4}`;
  return (
    <g aria-hidden="true">
      <path d={`M${x1} ${y1} L${x2} ${y2}`} stroke="var(--arch-acid)" strokeWidth="1.6" fill="none" />
      <polygon points={head} fill="var(--arch-acid)" />
    </g>
  );
}

function NodeBox({
  id,
  x,
  y,
  w,
  h,
  kicker,
  lines,
  note,
  extra,
  status,
  selected,
  fill,
}: {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  kicker: string;
  lines: string[];
  note?: string;
  extra?: string[];
  status: ArchitectureEvidence;
  selected: boolean;
  fill?: "acid";
}) {
  const labelId = `arch-node-${id}`;
  const acid = fill === "acid";
  return (
    <g
      className="arch-node"
      data-id={id}
      data-status={status}
      data-selected={selected || undefined}
      data-fill={fill}
      aria-hidden="true"
    >
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        className={acid ? "arch-svg-fill-acid" : "arch-svg-fill"}
      />
      <text
        id={labelId}
        x={x + 12}
        y={y + 18}
        className={acid ? "arch-svg-ink" : "arch-svg-muted"}
        fontSize="9"
        fontFamily="ui-monospace, Consolas, monospace"
        letterSpacing="1.1"
      >
        {kicker}
      </text>
      {lines.map((line, index) => (
        <text
          key={line}
          x={x + 12}
          y={y + 40 + index * 18}
          className={acid ? "arch-svg-ink" : "arch-svg-paper"}
          fontSize={index === 0 ? 14 : 12}
          fontFamily="Arial, Helvetica, sans-serif"
          fontWeight={index === 0 ? 700 : 400}
        >
          {line}
        </text>
      ))}
      {note ? (
        <text
          x={x + 12}
          y={y + 40 + lines.length * 18}
          className={acid ? "arch-svg-ink" : "arch-svg-muted"}
          fontSize="11"
          fontFamily="Arial, Helvetica, sans-serif"
        >
          {note}
        </text>
      ) : null}
      {extra?.map((line, index) => (
        <text
          key={line}
          x={x + 12}
          y={y + h - 36 + index * 16}
          className={acid ? "arch-svg-ink" : "arch-svg-acid"}
          fontSize="10"
          fontFamily="ui-monospace, Consolas, monospace"
        >
          {line}
        </text>
      ))}
    </g>
  );
}
