import Link from "next/link";

import { CommerceStage } from "@/components/commerce-stage";

export default function Home() {
  return (
    <main>
      <nav className="nav shell" aria-label="Primary navigation">
        <a className="wordmark" href="#top" aria-label="Morrow home">
          MORROW<span className="wordmark-dot">.</span>
        </a>
        <div className="nav-proof">
          <span className="pulse-dot" />
          Track 3 · merchant-side commerce
        </div>
        <div className="nav-links">
          <Link className="nav-link" href="/architecture">
            Architecture
          </Link>
          <a className="nav-link" href="#contract">
            Read the contract <span aria-hidden="true">↘</span>
          </a>
        </div>
      </nav>

      <section className="hero shell" id="top">
        <div className="eyebrow">SCARCITY, MADE PROGRAMMABLE</div>
        <h1>
          Agents move fast.
          <br />
          Merchants should <em>get paid</em> for keeping up.
        </h1>
        <div className="hero-bottom">
          <p>
            Morrow lets any merchant sell a time-boxed commitment on scarce inventory.
            One agent wins, one payment settles, and the merchant&apos;s promise becomes a portable receipt.
          </p>
          <div className="network-stamp" aria-label="Payment network">
            <span>SETTLEMENT</span>
            <strong>XSGD / AVAX</strong>
            <small>x402 · C-Chain Mainnet</small>
          </div>
        </div>
      </section>

      <CommerceStage />

      <section className="contract-section shell" id="contract">
        <div className="section-kicker">THE MERCHANT CONTRACT</div>
        <div className="contract-grid">
          <div>
            <h2>Not another agent that shops.</h2>
            <p className="contract-lead">
              This is the missing merchant primitive: quote scarcity, collect commitment,
              expose state, and issue a machine-readable receipt for what happened.
            </p>
          </div>
          <div className="contract-list">
            <div><span>01</span><strong>Discover</strong><p>Agents read inventory and policy without scraping a storefront.</p></div>
            <div><span>02</span><strong>Commit</strong><p>The endpoint returns exact x402 terms for 0.20 XSGD.</p></div>
            <div><span>03</span><strong>Prove</strong><p>A merchant receipt binds payment, inventory, expiry, and credit.</p></div>
          </div>
        </div>

        <div className="beyond-card">
          <span className="beyond-label">ONE API, MANY KINDS OF SCARCITY</span>
          <div className="use-cases" aria-label="Supported commerce categories">
            <span>restaurant tables</span><i>↗</i>
            <span>clinic appointments</span><i>↗</i>
            <span>ticket allotments</span><i>↗</i>
            <span>equipment rentals</span><i>↗</i>
            <span>limited inventory</span><i>↗</i>
          </div>
        </div>
      </section>

      <footer className="footer shell">
        <span>MORROW / AGENTIX PLAYGROUND 2026</span>
        <span>Built for merchants, callable by agents.</span>
      </footer>
    </main>
  );
}
