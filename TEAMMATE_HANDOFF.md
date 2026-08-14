# Morrow teammate handoff

## Links

- Public demo: https://morrow-agent-commerce-29bigbxx5-saaiaravindhrajas-projects.vercel.app
- Private repository: https://github.com/SaaiAravindhRaja/morrow-agent-commerce
- One-page brief: [`output/pdf/morrow-track3-idea-brief.pdf`](output/pdf/morrow-track3-idea-brief.pdf)

The GitHub repository is private. Saai must invite your GitHub username before the repository link will open.

## The idea

Morrow lets merchants sell AI agents paid, time-boxed commitments on scarce inventory. The restaurant slot is the demo wedge, but the same contract applies to appointments, tickets, rentals, hotel inventory, and limited stock.

Two agents accept the same 0.20 XSGD x402 terms for one final merchant slot. The merchant chooses one inventory winner, only the winner is eligible to settle, the loser pays S$0, and the winner exercises the commitment into a booking with full credit.

## Run locally

```bash
pnpm install
pnpm dev
```

Before sharing a change:

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

## 60-second demo script

1. **Problem:** "Most teams make agents better shoppers. Morrow gives merchants a way to price the cost of agent uncertainty."
2. **Product:** "A merchant publishes a paid ten-minute commitment on scarce inventory through an agent-readable endpoint."
3. **Run the proof:** Click **Run the proof**. "Two agents want the final slot. The merchant resolves inventory first. Atlas wins and advances to settlement; Nova pays S$0."
4. **Receipt:** "The winner receives a machine-readable commitment receipt and exercises it into a booking. The fee is credited in full."
5. **Track 3:** "This is a merchant API and lifecycle built for AI customers, not another consumer shopping agent. Restaurants are only the first wedge."

## What is real and what is simulated

Real and verified in the build:

- XSGD contract, six decimals, Avalanche C-Chain mainnet, and 200000 atomic-unit price
- x402 v2 payment requirements using EIP-3009 metadata
- merchant capability endpoints and payment-term response
- deterministic inventory contention, winner/loser states, and receipt schema

Intentionally simulated:

- payment signature validation and facilitator settlement
- funded XSGD mainnet transaction
- cryptographic receipt signature
- AWS infrastructure

The public deployment rejects every payment authorization. Do not claim a live mainnet payment unless a separate funded end-to-end run is completed and verified.

## Highest-value next steps

1. Rehearse the script until it consistently finishes under one minute.
2. Ask DevRel whether the available facilitator supports this exact XSGD EIP-3009 mainnet flow.
3. Only if that is confirmed, build the live settlement adapter separately without weakening the deterministic demo.
4. Keep the public demo as the reliable fallback during judging.
