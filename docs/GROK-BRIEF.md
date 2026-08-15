# Task: finish Morrow and make it submittable

> **Historical brief, kept for the record. Two claims in it are now known false.**
> This file says twice that "mainnet XSGD has no EIP-3009" (success criterion 3,
> and the guardrail about not rediscovering verified facts). That is wrong. Both
> EIP-3009 typehash getters on `0xb2F85b7AB3c2b6f62DF06dE6aE7D09c010a5096E`
> return the canonical constants. The text below is left unedited because it
> records what was believed when the work was commissioned. Current ground truth
> is in `docs/decisions/mainnet-mvp.md`.

Repo: `/Users/dewa/Documents/Claude/projects/straits-x-hackathon/morrow-agent-commerce`

Read `CLAUDE.md` first, then `docs/SESSION-CONTEXT.md`, `docs/CORRECTIONS.md` and
`docs/TOOLKIT.md` in the parent directory, before you touch anything. Those are
the project's ground truth. The corrections log exists because eight confident
claims in this project have already turned out to be false. Read it so you do
not become the ninth.

Deadline is Sunday 16 August, 11:00 SGT. It is tight.

## Goal

Morrow sells AI agents paid, time-limited commitments on scarce inventory. Two
agents race for the last restaurant table. The winner settles 0.20 XSGD on
Avalanche C-Chain mainnet. The loser is never charged, because the merchant
simply never settles their authorization. No refund, because there was never a
charge.

Today that is all simulated. Make it real, keep it honest, and leave every
submission artefact ready except the video recording and the deploy.

## Success criteria

Do not report done on any of these until you have run the command that proves
it and read the output.

1. The x402 payment path runs end to end against the local Anvil mainnet fork:
   authorize, verify, settle the winner, never settle the loser, reject a
   replayed authorization, reject an expired one. Covered by tests that pass.
2. The demo attempts the live path first. If RPC or the facilitator fails, it
   falls back to the deterministic simulation and the UI says, in plain words on
   screen, which mode actually ran. A viewer must never be able to mistake a
   simulated run for a real one.
3. Every technical claim in the UI and in the docs is true. The deployed site
   currently claims `AUTHORIZATION: EIP-3009`. Mainnet XSGD has no EIP-3009.
   That is visible to judges right now.
4. An architecture diagram exists as committed source in the repo and renders
   without any external tool or account.
5. The pitch video script matches what was actually built, not what was hoped
   for. The current draft is in `TEAMMATE_HANDOFF.md`.
6. `corepack pnpm install`, then `test`, `typecheck`, `lint`, `build`, all pass.
7. `main` is untouched and the work is somewhere Saai can review it.

## Guardrails

Hard limits. Breaking one of these is worse than missing a deliverable.

- **No private keys. No real mainnet transactions.** Everything is proven on the
  Anvil fork, which already exists at `rail/fork/`. Run `./start.sh` then
  `./rehearse.sh`, it should report 14 passed. Do not rebuild it. Leave Dewa one
  documented command for the single real transaction he will send himself.
  All agents share the one fork on `127.0.0.1:8545`. Do not start a fork per
  agent, you will rate-limit the public Avalanche RPC and they will all fail.
- **Never commit to `main`, never force-push, never rewrite history.** Dewa's
  teammate Saai owns the front-end and may be working in parallel. Beyond those
  three rules, pick your own git strategy: branches, worktrees, a fork, whatever
  suits how you parallelise. Just leave the result reviewable and say what you
  chose.
- **The deterministic demo must survive.** It is the judging-day fallback. Wrap
  it, do not remove it.
- **Verify on-chain claims by calling the contract**, not by trusting a doc,
  including the docs in this repo. When you disprove something, append it to
  `docs/CORRECTIONS.md` and fix the wrong statement at its source, at the moment
  you learn it, not at the end.
- Two things are already verified. Do not rediscover them expensively.
  Mainnet XSGD has no EIP-3009, so use Permit2. And the upto proxy that
  `@x402/evm@2.22.0` hardcodes has zero bytecode on Avalanche, so build on the
  `exact` scheme. `upto` is a stretch goal only, behind a flag.
- Environment gotchas that will otherwise waste your time: `pnpm` is not on
  PATH, use `corepack pnpm`. `timeout` does not exist on macOS. A
  `DEEPSEEK_API_KEY` is already set in `.env` at the repo root, read it from
  there if the demo agents need a model. `.env` is gitignored and has never been
  committed. Keep it that way. This repo is about to be made public, so no
  secret goes into any tracked file, ever, including docs.
- No emojis in code. No em dashes in prose. Comments sparse.
- If you cannot verify something, say so plainly instead of claiming it works.

## How to run it

Use a workflow and fan out hard. These four are genuinely independent, so run
them in parallel and isolate them however you see fit:

- payment rail: x402 client, merchant endpoints, settlement adapter, fork tests
- front-end: live-first execution, visible fallback, truthful tech panel
- architecture diagram
- docs and pitch video script

Then converge, run the full verification sweep, and adversarially check your own
findings before reporting. Claims in this project have a bad track record.

Use these skills: `superpowers:verification-before-completion`,
`superpowers:test-driven-development`, `superpowers:dispatching-parallel-agents`,
`superpowers:using-git-worktrees`, `andrej-karpathy-skills:karpathy-guidelines`.

## Report back

One page, no longer. What works and is proven, with the command that proves it.
What is stubbed. What you could not verify. And exactly what Dewa must do
himself before he can submit.
