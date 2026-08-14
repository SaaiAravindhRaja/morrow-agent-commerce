# Morrow

Morrow is a merchant-side commerce primitive for scarce inventory. A merchant exposes a time-boxed, non-refundable commitment that an agent can discover and acquire using x402 payment terms. If exercised on time, the commitment is fully credited to the purchase.

Public demo: https://morrow-agent-commerce-29bigbxx5-saaiaravindhrajas-projects.vercel.app

For the idea, demo script, setup, and claim boundaries, start with [TEAMMATE_HANDOFF.md](TEAMMATE_HANDOFF.md).

The current demo uses a restaurant slot because it makes contention easy to understand. The same contract can represent appointments, tickets, rentals, and limited stock.

## What the preview proves

- a machine-readable merchant capability and commitment endpoint
- 0.20 XSGD represented as `200000` atomic units
- XSGD on Avalanche C-Chain mainnet (`eip155:43114`)
- a deterministic two-agent inventory race with exactly one winner
- a zero-charge loser and a machine-readable demo receipt

The preview does not broadcast payments, accept wallet authorizations, claim a funded mainnet transaction, or claim an AWS deployment. Live settlement stays disabled until facilitator compatibility and a funded end-to-end transaction are verified.

## Run locally

```bash
pnpm install
pnpm dev
```

Quality checks:

```bash
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

Set `MERCHANT_WALLET_ADDRESS` to a non-zero EVM address only when you need the API to emit payment terms. `POST /api/commit` still rejects every payment authorization because the settlement adapter is intentionally disabled.

## Agent endpoints

- `/.well-known/agent-commerce`
- `/api/capabilities`
- `/api/commit`
- `/api/demo`

The authoritative payment and claim decisions are documented in [docs/decisions/mainnet-mvp.md](docs/decisions/mainnet-mvp.md).
