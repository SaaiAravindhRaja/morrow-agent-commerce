# Morrow teammate handoff

## Links

- Public demo: https://morrow-agent-commerce.vercel.app
- Repository: https://github.com/SaaiAravindhRaja/morrow-agent-commerce
- One-page brief: [`output/pdf/morrow-track3-idea-brief.pdf`](output/pdf/morrow-track3-idea-brief.pdf)

The repository is public (verified 15 Aug). No invite is needed to open it, and it is safe to submit as the GitHub URL.

## The idea

Morrow lets merchants sell AI agents paid, time-boxed commitments on scarce inventory. The restaurant slot is the demo wedge, but the same contract applies to appointments, tickets, rentals, hotel inventory, and limited stock.

Two agents accept the same 0.20 XSGD x402 `exact` / Permit2 terms for one final merchant slot. The merchant chooses one inventory winner. Only the winner is settled. The loser pays S$0 because their authorization is never settled. The winner exercises the non-refundable commitment deposit into a booking with full credit.

## Run locally

```bash
corepack pnpm install
corepack pnpm dev
```

Before sharing a change:

```bash
corepack pnpm test
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm build
```

The commands above do not require Anvil. A deployment candidate must also pass:

```bash
cd rail/fork && ./start.sh && cd ../..
corepack pnpm test:fork
```

Live fork rehearsal (Foundry required):

```bash
cd rail/fork
./start.sh
./rehearse.sh
```

## 60-second demo script

1. **Problem:** "Most teams make agents better shoppers. Morrow gives merchants a way to price the cost of agent uncertainty on scarce inventory."
2. **Product:** "A merchant publishes a paid ten-minute non-refundable commitment deposit. The price is 0.20 XSGD, on x402 exact, authorized with Permit2."
3. **Run the proof:** Click **Run the proof**. "Two agents want the final slot. The merchant resolves inventory first. Only Atlas is settled. Nova pays S$0 because we never settle their authorization."
4. **Mode, say this out loud:** Read the on-screen mode label. If it says live fork: "This run is on the live Avalanche mainnet fork. Nothing was broadcast to real mainnet." If it says simulation: "This run is the deterministic simulation. Same inventory story, no payment broadcast."
5. **Track 3:** "This is a merchant API and lifecycle for AI customers, not another shopping agent. Restaurants are the first wedge."

## What is real and what is simulated

Real and verified in the build:

- XSGD contract, six decimals, Avalanche C-Chain mainnet, and 200000 atomic-unit price
- x402 v2 `exact` payment requirements with Permit2 (not EIP-3009, not `upto`)
- merchant capability endpoints and payment-term response
- deterministic inventory contention, winner/loser states, and receipt schema
- "loser is never charged" by never calling settle on the loser
- Anvil mainnet fork rehearsal (`rail/fork/`): real XSGD bytecode, Permit2 approve, `exact` proxy deployed and matching the SDK

Now in the app:

- `/api/demo` tries the Anvil fork first and falls back to the deterministic simulation
- the UI labels `LIVE FORK` or `DETERMINISTIC DEMO` in plain words
- protocol bar says `Permit2`, not EIP-3009
- fork tests cover verify both, settle winner only, reject replay, reject expired
- `/` is the URL to submit and run for judges
- `/architecture` is the supporting technical evidence route. File copy still at `docs/architecture/morrow-architecture.html`

Intentionally simulated or not done:

- public Vercel site, which may still be the deterministic simulation
- funded XSGD mainnet transaction (none has been sent)
- Dewa's one-time Permit2 `approve` (he must send this himself; it has not happened)
- cryptographic receipt signature
- AWS infrastructure (no credits; diagram maps Well-Architected principles; implementation is the fork plus an in-process lock)
- StraitsX card holds (the card MCP cannot do holds; do not pitch the card as the spine)

The deterministic demo stays as the judging-day fallback. Do not claim a live mainnet payment.

## Highest-value next steps

1. Rehearse the script until it consistently finishes under one minute, including the spoken mode line.
2. Confirm the on-screen mode label matches what you say. If the live fork is down, say simulation.
3. Dewa sends the one-time Permit2 approve himself after a clean `./rehearse.sh`. Nobody else sends mainnet transactions.
4. Keep the deterministic demo as the reliable fallback during judging.
