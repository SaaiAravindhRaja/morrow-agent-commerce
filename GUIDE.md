# Morrow guide

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
3. **Show the checkout:** Open **Test checkout** and click **Run test**. "Two sample buyers want the final slot. The merchant resolves inventory first. Only Atlas is eligible to settle. Nova pays S$0 because we never settle their authorization."
4. **Read the proof mode, then show the receipt:** "Settled on a mainnet fork means the local rehearsal executed the payment path against forked Avalanche state. Simulated walkthrough means the hosted fallback used sample payment data and did not settle funds. The winner receives full credit, while the losing authorization is never charged."
5. **Track 3:** "This is a merchant API and lifecycle for agent customers, not another shopping agent. Restaurants are the first wedge."

## What is real and what is simulated

Real and verified in the build:

- XSGD contract, six decimals, Avalanche C-Chain mainnet, and 200000 atomic-unit price
- x402 v2 `exact` payment requirements with Permit2 (not EIP-3009, not `upto`)
- merchant capability endpoints and payment-term response
- sample inventory contention, winner/loser states, and receipt schema
- "loser is never charged" by never calling settle on the loser
- Anvil mainnet fork rehearsal (`rail/fork/`): real XSGD bytecode, Permit2 approve, `exact` proxy deployed and matching the SDK
- one 0.20 XSGD mainnet settlement, tx `0xd365489a08ff00f17c816e174cb8fd5d79c604a5db95159d1fd53244a047b7d2`

Now in the app:

- `/api/demo` tries the Anvil fork first and returns the sample checkout result when the fork is unavailable
- the checkout panel says settled on a mainnet fork or simulated walkthrough, never the same sentence for both
- the customer-facing UI identifies the flow as a test with sample buyers and no customer charge
- capability copy and `/architecture` say Permit2, not EIP-3009
- fork tests cover verify both, settle winner only, reject replay, reject expired
- `/` is the URL to submit and run for judges
- `/architecture` is the supporting technical evidence route

Intentionally simulated or not done:

- customer settlement on the public Vercel site. Signed POST is rejected. The 0.20 XSGD mainnet send was a separate local runner, not the hosted checkout.
- cryptographic receipt signature
- AWS infrastructure (no credits; diagram maps Well-Architected principles; implementation is the fork plus an in-process lock)
- StraitsX card holds (the card MCP cannot do holds; do not pitch the card as the spine)

The Permit2 approve and a 0.20 XSGD settlement have both been sent on Avalanche mainnet. The hosted checkout still does not settle. Do not claim an AWS deployment. Do not call the approve hash a settlement.

## Highest-value next steps

1. Rehearse the script until it consistently finishes under one minute.
2. Keep the public product story on merchant value; use `/architecture` only when a judge asks how the rail works.
3. Describe the hosted flow as a sample checkout and the Anvil path as fork-proven settlement behavior.
4. Point judges at settlement tx `0xd365489a08ff00f17c816e174cb8fd5d79c604a5db95159d1fd53244a047b7d2`, not the approve.
