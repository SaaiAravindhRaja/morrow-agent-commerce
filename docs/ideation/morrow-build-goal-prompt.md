# Morrow final-mile goal

This is the canonical execution prompt for finishing the hackathon submission. It supersedes every earlier build prompt, especially any instruction that mentions Fuji, EIP-3009, an `upto` payment, an AWS deployment, or a real mainnet settlement.

```text
/goal

Finish Morrow as a judge-ready, submission-ready Track 3 product and maximise its realistic chance of winning the main track plus the StraitsX Real-World Impact and Avalanche Best Use of x402 prizes.

Own the thinking, current-source research, product judgment, implementation, adversarial review, verification, judge rehearsal, and release preparation. Work systematically but keep the plan flexible: rank work by judge impact and evidence, then change the plan when a better verified path appears. Do not ask me to make routine reversible decisions. Do not stop at analysis while a safe, useful implementation or verification step remains.

Repository and current state

- Work only in `/Users/saaiaravindhraja/Desktop/ThisMac/Dev/StraitsX-Agentic-Playground`.
- At prompt creation, local `HEAD` and `origin/main` are both `a7ff037`, but the worktree contains a substantial completed, verified, uncommitted judge-first UI and proof-flow pass. Re-check all of this rather than assuming it remains current.
- Preserve every existing local and teammate change. Begin with `git status`, `git fetch origin`, and a comparison of local `HEAD`, `origin/main`, and the working diff. Never use a destructive reset, force push, blind checkout, or cleanup.
- If upstream moved while the worktree is dirty, do not blindly pull. Inspect the divergence, preserve the working changes, and reconcile safely. Stop only for a genuine overlapping conflict that cannot be resolved without choosing between competing user changes.
- Use `pnpm` only for JavaScript/TypeScript package operations.
- Do not use Claude Code, its CLI, or any workflow that invokes it.
- Prefer current repository patterns and the smallest change that materially improves the submission. Do not add a component library, generic agent chat, accounts, a database, or speculative infrastructure unless evidence shows it is necessary.

Product truth that must not drift

- Morrow is merchant infrastructure for autonomous buyers. The merchant is the protagonist; the product is not another consumer shopping agent.
- The restaurant slot is a vivid demo wedge, not the total market. The primitive also applies to appointments, tickets, rentals, limited stock, and other scarce inventory.
- The merchant sells a non-refundable commitment deposit that is credited in full when exercised on time. Do not call it an option or derivative.
- The decisive proof is one scarce merchant SKU, two agents, one inventory winner, one settlement, one exercised receipt, and a loser charged exactly S$0 because the losing authorization is never settled.
- Target Avalanche C-Chain mainnet, chain `eip155:43114`.
- Use XSGD contract `0xb2F85b7AB3c2b6f62DF06dE6aE7D09c010a5096E`, with six decimals. The demo amount is `0.20 XSGD`, or `200000` atomic units.
- The verified rail is x402 v2 `exact` + Permit2. It is not EIP-3009 and not `upto`. Permit2 is `0x000000000022D473030F116dDEE9F6B43aC78BA3`; the x402 exact Permit2 proxy is `0x402085c248EeA27D92E8b30b2C58ed07f9E20001` for the currently verified dependency version.
- The live payment path is proven against real Avalanche mainnet bytecode on a local Anvil fork. No real mainnet settlement or funded one-time Permit2 approval has been sent.
- The public deterministic proof must remain useful when the local fork is unreachable. It must never accept, store, log, forward, or settle a payment authorization.
- AWS is a production architecture mapping, not a deployed dependency. Do not imply that AWS infrastructure is live.
- Keep current evidence visually distinct: `DEPLOYED`, `FORK-PROVEN`, `SIMULATED`, and `NOT USED`. A protocol target is not proof that a mainnet transaction occurred.
- Treat `docs/decisions/mainnet-mvp.md` as the local authority for payment facts. If a current primary source contradicts it, verify the contradiction carefully and update code, tests, docs, and judge claims together.

Winning objective

The first minute must let a judge correctly explain all five of these points without help:

1. Merchants cannot safely expose scarce inventory to many autonomous buyers using ordinary checkout semantics.
2. Morrow gives the merchant a machine-readable commitment endpoint with explicit inventory and payment terms.
3. Two agents can contend, but the merchant produces exactly one winner and one settlement; the loser pays S$0.
4. x402 provides the machine-payment challenge and settlement contract, XSGD is the SGD-denominated asset, and Avalanche is the settlement network.
5. The shown run is honestly labelled as deterministic or fork-proven, with no invented mainnet or AWS claim.

Optimise for judge comprehension, credibility, memorability, working software, and sponsor fit. Do not optimise for feature count. The app should feel like a real merchant product, not a pitch deck, architecture toy, or generic hackathon dashboard.

Execution loop

Phase 1: establish current truth

- Read `PRODUCT.md`, `README.md`, `TEAMMATE_HANDOFF.md`, `docs/decisions/mainnet-mvp.md`, the latest implementation plan, the current diff, the proof code, and the tests before editing.
- Run the deterministic quality gates to establish a baseline. Run fork verification only through its documented separate path.
- Inspect the current production deployment and Vercel project state read-only. Verify whether GitHub integration, the production commit, `/`, and `/architecture` match the repository. Do not assume yesterday's deployment state is current.
- Use current primary sources for facts that may have changed: the organizer Dev Hub, official x402 sources, Avalanche documentation, StraitsX/XSGD evidence, Permit2 sources, and Vercel state. Avoid shallow web research and do not replace verified contract behavior with tutorial assumptions.
- Build a compact judge-score audit covering Track 3 fit, x402/Avalanche innovation, StraitsX real-world impact, architecture credibility, demo clarity, technical correctness, and failure resilience.
- Identify the three to five highest-impact remaining gaps. Rank them by `judge impact x confidence x feasibility` and implement in that order. Do not redo already-good work merely to make the diff larger.

Phase 2: close the highest-value product and UI gaps

- Review the current experience as a senior product designer and frontend engineer at 1440x1000, 1024x768, 390x844, and 360x800.
- Preserve the existing black, ivory, acid-lime editorial merchant-operations identity unless direct visual evidence supports a change.
- Make the first viewport decisive: thesis, scarce SKU, two contenders, one-winner/one-settlement/S$0-loser invariant, honest evidence label, x402/XSGD/Avalanche roles, and the primary action must be immediately understandable.
- Keep cause and outcome connected on mobile. Do not solve responsiveness by stacking disconnected desktop panels or shrinking operational text below comfortable reading size.
- Polish loading, playback, completion, fallback, error, retry, reset, keyboard, focus, reduced-motion, and touch behavior as one coherent state machine.
- Keep raw RPC hosts, ports, stack traces, credentials, payloads, and internal exception text out of public responses and judge-facing UI.
- Keep `/` as the canonical judge route. Keep `/architecture` as optional technical evidence with semantic mobile content and explicit proof-status taxonomy.
- Delete or simplify anything that weakens the one-minute story. Add new UI or copy only when it improves a named judge criterion or prevents a real failure.

Phase 3: make the proof hard to break

- Adversarially test the invariant and the presentation boundary: malformed payloads, duplicate contenders, wrong winner count, non-zero loser charge, mode mismatch, incomplete receipt, unavailable fork, aborted client wait, rapid repeat activation, reset/run-again, and reduced motion.
- Verify the public fallback completes without Anvil and never masquerades as a broadcast.
- Verify the fork tier proves x402 exact Permit2 using Avalanche mainnet bytecode when its prerequisites are running.
- Check that implementation, tests, architecture labels, README, product copy, and teammate handoff all describe the same rail and claim boundary.
- Run a correctness, security, API-contract, reliability, accessibility, performance, maintainability, and test-coverage review. Fix confirmed high-impact findings; document rather than inflate low-value speculative work.

Phase 4: prepare the judge and teammate package

- Produce one primary 60-second demo path. Do not present two competing scenarios.
- Update the existing handoff material with:
  - a one-sentence product pitch;
  - the problem and why normal checkout fails for agent contention;
  - the exact Track 3 relationship;
  - the roles of x402, XSGD, Avalanche, Permit2, and the optional AWS production mapping;
  - a timed 60-second talk track;
  - a 20-second fallback talk track if the live-fork path is unavailable;
  - exact claims we may and may not make;
  - submission URL, architecture URL, repo status, and verification commands.
- Keep this concise and natural. Reuse the current README and handoff rather than creating redundant pitch documents.
- Make the strongest defensible case for all relevant prizes without pretending the current system proves more than it does.

Phase 5: verify the complete local candidate

- Run, at minimum, deterministic tests, the separate fork tests with documented prerequisites, typecheck, lint, and a production build.
- Perform browser QA on `/` and `/architecture` at every target viewport, with default motion and reduced motion. Test keyboard-only operation, run, fallback, completion, reset, run again, architecture navigation/download, console output, overflow, clipping, and broken links.
- Inspect production-build output for route or rendering regressions.
- Record exact pass counts, commands, screenshots or observations, and any limitation. Never say a check passed if it was skipped or only partially exercised.

Phase 6: controlled landing and deployment

- First reach a clean `ready to ship` checkpoint and report the exact diff, checks, current remote state, and intended landing actions.
- Do not commit, push, connect GitHub, redeploy, or change remote project settings unless I explicitly authorize that external action in the same turn. A request to polish or verify is not deployment approval.
- If same-turn approval is present, verify Git identity is exactly `Saai Aravindh Raja <saaiaravindhraja@gmail.com>`, use a concise lowercase imperative commit message with no period or co-author lines, push only the intended changes, and deploy through the project's established Vercel path.
- Do not connect the Vercel project to GitHub unless that connection itself is explicitly authorized. If it remains disconnected, state that future pushes will not auto-deploy.
- No environment variables are required for the deterministic public preview. Never configure a merchant recipient or payment credential in the public preview.
- After an authorized deployment, verify the deployed commit and inspect both `/` and `/architecture` on desktop and mobile. Confirm the public site no longer contains obsolete EIP-3009 language and that the architecture route is not a 404.

Definition of done

- The strongest remaining judge-impact gaps have been fixed, not merely listed.
- A first-time judge can explain the problem, merchant primitive, race invariant, sponsor technology, and proof boundary after one 60-second walkthrough.
- The public demo is polished, responsive, accessible, deterministic when offline from the fork, and free of raw internal errors.
- The fork path and deterministic path have separate truthful labels and separate reproducible verification.
- The repository contains no active Fuji/EIP-3009/real-mainnet/AWS-deployed contradiction in the submission path or handoff material.
- Deterministic tests, fork tests, typecheck, lint, build, and browser QA all pass, or any remaining failure is reported precisely with evidence.
- The teammate handoff includes one pitch, one demo script, one fallback, claim boundaries, links, and exact commands.
- The work is either at a fully reported ready-to-ship checkpoint, or, if same-turn external-action approval was explicitly provided, committed, pushed, deployed, and verified at the public URLs.

Final report format

Lead with the outcome. Then report:

1. What materially improved and why it helps the judges.
2. Files changed.
3. Exact verification results.
4. Local, GitHub, Vercel, and production state as separate facts.
5. Remaining claim boundary or blocker, if any.
6. The single next action that requires my approval, if applicable.

Do not pad the report with process narration. Be exact, skeptical, and ship-minded.
```
