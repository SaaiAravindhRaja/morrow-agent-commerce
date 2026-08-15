# Morrow production commerce UI goal

Use this as the autonomous execution prompt for the final product and UI pass.

```text
/goal

Turn Morrow into a production-quality, hackathon-winning merchant commerce product, then commit, push, deploy, and verify it. Own the research, product judgment, visual direction, UX, frontend implementation, integration work, testing, release, and judge rehearsal. Do not stop at a plan or a critique while a safe implementation step remains.

This goal explicitly authorizes normal scoped commits, pushes to this repository's `main` branch, and production deployment through the project's existing Vercel setup. Do not ask again before each routine push or redeploy. Push coherent, verified milestones rather than one giant final commit or a stream of trivial commits. Never force-push, overwrite teammate work, send a blockchain transaction, use compromised credentials, or make an unrelated external change.

## Mission

Replace the current stylized hackathon landing page with a familiar merchant application that a real commerce operator could understand and use.

The current UI looks like an AI-generated Web3 concept: giant serif manifesto copy, black and acid-green styling, tiny monospace labels, protocol-first hierarchy, dense bordered panels, and a hardcoded race presented as the whole product. Remove that visual language. The result should feel closer to a well-made Shopify, Stripe, Square, Linear, or modern inventory-management product: quiet, clear, credible, commerce-first, and operational.

Morrow is not another shopping agent and not a restaurant-only app. It is merchant infrastructure for exposing scarce inventory to autonomous buyers. A merchant defines a commitment policy once; Morrow publishes human-readable terms, agent-readable discovery data, an x402 payment challenge, allocation rules, and a verifiable lifecycle. Reservations are the demo wedge, while appointments, ticket drops, rentals, limited stock, and other scarce resources use the same primitive.

The decisive judge proof remains:

- one merchant publishes one scarce inventory commitment;
- two independent agent clients understand and contend for it;
- exactly one inventory winner is allocated;
- exactly one XSGD settlement is represented in the appropriate proof mode;
- the losing authorization is not settled and the loser pays exactly S$0;
- the winner receives a commitment receipt whose deposit becomes merchant credit when exercised.

The redesign must make the merchant action and this invariant obvious without narration.

## Operating rules

- Work only in `/Users/saaiaravindhraja/Desktop/ThisMac/Dev/StraitsX-Agentic-Playground`.
- Never use Claude Code, its CLI, or a workflow that invokes it.
- Use `pnpm` only for JavaScript and TypeScript package operations.
- Preserve all local and teammate work. Begin every work cycle with `git status`, `git fetch origin`, and a comparison of local `HEAD`, `origin/main`, and the working diff.
- Always fetch before integrating or pushing. If upstream moved while the worktree is dirty, do not blindly pull. Reconcile in a safe branch or clean worktree and manually preserve proven local changes. Never use destructive reset, blind checkout, mass cleanup, or force push.
- Before every commit, verify Git identity is exactly `Saai Aravindh Raja <saaiaravindhraja@gmail.com>`. Use short lowercase imperative commit messages with no period, no co-author line, and no assistant/tooling references.
- Do not commit `AGENTS.md`, `.claude/`, `.codex/`, generated assistant scaffolding, secrets, private keys, seed phrases, AWS passwords, MFA seeds, wallet credentials, local environment files, or unrelated artifacts.
- Treat every wallet and AWS credential previously shared in chat as compromised. Do not use it, test it, transmit it, add it to Vercel, or copy it into documentation. AWS work requires freshly rotated access. Mainnet transactions require a separate explicit instruction and are out of scope for this goal.
- Keep the public demo deterministic and safe. It must never collect, accept, log, forward, or settle a real payment authorization.
- Keep dependencies lean. Prefer existing repo patterns and native React/CSS. Do not add a component system, database, account system, generic chat, LLM dependency, or speculative backend unless it removes a demonstrated blocker.
- Make the plan flexible. Re-rank work when evidence changes, but do not use flexibility as an excuse to expand scope or skip verification.

## Phase 1: reconcile the real project state

Before touching the UI:

1. Read the current `README.md`, `PRODUCT.md`, `TEAMMATE_HANDOFF.md`, `docs/decisions/mainnet-mvp.md`, architecture material, payment rail documentation, route handlers, components, CSS, tests, and recent Git history.
2. Inspect the complete dirty diff and the commits present only on the remote. Build a truth table for what exists locally, on GitHub, on Vercel, and in production. These are separate states.
3. If `docs/audits/2026-08-15-morrow-deep-judge-audit.md` exists locally, use it as evidence, but re-verify all drift-prone facts and do not assume uncommitted audit files exist on the remote.
4. Run the existing deterministic tests, typecheck, lint, and production build to establish a baseline. Run fork tests only through their documented isolated path and only if their prerequisites are already safe and available.
5. Inspect the current local UI and production UI at desktop, tablet, and mobile sizes. Capture idle, create/edit, contention, completion, error/fallback, and architecture states that already exist.
6. Identify which current features and tests are worth preserving. Reuse working payment/proof behavior; replace only presentation and broken product flow.

Do not begin from stale assumptions. In particular, reconcile XSGD/EIP-3009 language before shipping. Mainnet XSGD can execute EIP-3009 even though common domain/typehash getters are irregular. Morrow may still use its fork-proven exact + Permit2 path, but must describe that as a tested product choice, not as proof that XSGD lacks EIP-3009.

## Phase 2: research and select the visual target

Research real merchant and ecommerce interfaces before designing. Use current official sources and visually inspect the pages, not only their prose:

- Shopify app design guidelines: https://shopify.dev/docs/apps/design
- Shopify layout guidance: https://shopify.dev/docs/apps/design/layout
- Shopify app structure: https://shopify.dev/docs/apps/design/app-structure
- Shopify forms: https://shopify.dev/docs/apps/design/user-experience/forms
- Shopify App Home: https://shopify.dev/docs/apps/design/user-experience/app-home-page
- Shopify Dawn storefront reference: https://themes.shopify.com/themes/dawn/presets/dawn
- Stripe Dashboard basics: https://docs.stripe.com/dashboard/basics
- Stripe app design: https://docs.stripe.com/stripe-apps/design
- Square item creation and inventory flows: https://squareup.com/help/us/en/article/8335-create-and-edit-items

Also inspect two or three current, high-quality commerce/admin screenshots from credible sources if they add a pattern the official guides do not show. Prefer primary sources. Record reusable patterns, not superficial branding.

Capture the current Morrow screen and each useful reference at a comparable viewport before drawing conclusions. Create three distinct visual concepts for Morrow's primary screen using real screenshots or generated design mocks. Do not make three color variations of one design. Score them against the rubric below and autonomously choose the strongest because this goal is intended to run without routine approval pauses:

- immediate merchant comprehension;
- familiarity and trust;
- Track 3 clarity;
- ability to show the full create-publish-contend-result loop;
- responsive behavior;
- accessibility;
- implementation feasibility before the deadline;
- visual distinctiveness without Web3 or AI-design clichés.

Record the selected concept and the rejected tradeoffs in a short implementation note. Once selected, use it as the visual source of truth. During implementation, compare reference and implementation screenshots side by side at the same viewport, fix visible differences, and repeat. A screenshot alone is not QA.

## Required visual direction

The selected direction must satisfy these constraints unless a captured reference provides a clearly stronger solution:

- A light, neutral merchant workspace is the default. Use white and soft-gray surfaces, near-black text, restrained borders, and one deep brand accent such as forest green, teal, navy, or cobalt.
- Green means success, availability, or the primary commerce action. Do not use neon green as decoration.
- Use one clean sans-serif family such as Geist, Inter, or the system stack. At most two typefaces. Body text is 14–16px; supporting copy never drops below 12px.
- Use an intentional 4px/8px spacing rhythm, 6–10px corner radii, subtle one-pixel borders, and minimal shadows. Avoid floating glass cards, heavy gradients, glows, cyber patterns, and decorative noise.
- Use a compact top bar or sidebar, a clear page header, breadcrumbs only where useful, one primary action per surface, and familiar resource-index/detail/editor patterns.
- Use real commerce objects: inventory image, resource name, price/deposit, quantity, availability window, expiry, allocation rule, status, and recent activity.
- Use established iconography from the project's existing icon set or one lightweight consistent icon library. No emoji, ASCII art, handcrafted SVG approximations, or fake illustration boxes.
- If a product or inventory image is needed and no suitable source asset exists, create or source a properly cropped asset that fits the measured slot. Do not stretch an arbitrary image.
- Keep technical proof available but subordinate. Raw protocol payloads belong in a disclosure, drawer, tab, or “Technical details” panel, not in the first hierarchy layer.
- The x402, XSGD, Avalanche, Permit2, and AWS labels should explain roles and proof status, not form a sponsor-logo ribbon.
- Architecture is a secondary evidence surface, not primary navigation competing with the merchant task.

Delete or redesign these current patterns:

- giant serif manifesto hero;
- black/acid-green editorial aesthetic;
- excessive uppercase monospace labels;
- tiny operational copy;
- protocol-first landing hierarchy;
- arbitrary grids of bordered cards;
- terminal, circuit, glow, or generic AI-agent imagery;
- hardcoded Atlas and Nova as the entire product experience;
- a demo button presented before the merchant has created or inspected a commitment;
- unverified vanity metrics and fake dashboard analytics.

Do not merely recolor the existing landing page. Rebuild the information architecture around the merchant's work.

## Phase 3: establish the product information architecture

Implement the smallest coherent route and component model that supports the following workflow. Reuse routes when that is simpler; add focused routes only when they materially clarify the product.

### 1. Commitments home / resource index

The first screen should look like a real merchant application, not a marketing site.

It needs:

- Morrow product identity and a compact merchant workspace shell;
- page title such as `Commitments` or `Agent inventory`;
- one plain-language subheading explaining what the merchant is publishing;
- a primary `Create commitment` action;
- a resource list or table with realistic seeded examples across at least three categories, such as reservation, limited product, appointment, ticket, or rental;
- useful fields: resource, type, commitment deposit, availability, inventory, allocation rule, status, and last activity;
- status filters or a minimal search only if they work;
- an empty state that teaches the first action;
- a subtle “Judge demo” path that opens a prepared example without replacing the normal product flow.

Avoid a wall of metrics. One or two truthful operational summaries are acceptable only if derived from the seeded or actual demo state.

### 2. Merchant Policy Compiler / create editor

This is the banger Track 3 feature and the main interaction.

Let the merchant configure:

- resource name and type;
- optional image;
- location or fulfilment context where relevant;
- inventory quantity;
- availability and commitment expiry;
- XSGD commitment amount;
- allocation rule, with plain-language help;
- what the merchant promises;
- what the agent must do;
- whether the full commitment becomes credit on exercise;
- cancellation, no-show, and expiry outcome;
- agent-visible metadata.

Use a focused two-column editor at desktop: form and terms on the left, live agent-facing offer preview on the right. Stack them naturally on mobile. If there are more than five inputs, group them into clear sections and use progressive disclosure for advanced protocol fields.

Provide explicit save/discard or publish controls. Do not autosave destructive policy changes invisibly. Validate inline, preserve input on errors, focus the first invalid field, and explain values in merchant language. Use sensible preset templates to demonstrate generality without building separate vertical products.

The live preview should show two layers:

- the human offer a commerce operator recognizes;
- a concise machine-readable preview showing the generated discovery metadata, HTTP 402 terms, and policy identifier behind a secondary technical tab or disclosure.

The compiler must produce one canonical policy object used by the preview, API response, and proof run. Do not duplicate hardcoded copy across UI and route handlers.

### 3. Commitment detail / operations view

After publishing, show a familiar resource detail page with:

- resource identity, status, deposit, inventory, validity, and merchant terms;
- primary action to run or observe the two-agent contention test;
- overview, activity, offer, and technical proof sections or tabs;
- an order-style lifecycle timeline: published, discovered, authorized, allocated, settled/not settled, receipt issued, exercised or expired;
- two contenders shown as clients or requests, not cartoon AI personas;
- winner and loser results visible together;
- exactly one winner, one settlement, and loser charged S$0 in one glance;
- commitment receipt with copy/verify affordances where the underlying data supports them;
- clear proof mode labels such as `SIMULATED`, `FORK-PROVEN`, `MAINNET-VERIFIED APPROVAL`, and `NOT DEPLOYED`.

The outcome view should feel like an ecommerce order or fulfilment record. It must not look like a cyber-security dashboard.

### 4. Technical evidence

Keep `/architecture` working, responsive, and secondary. Make it consistent with the new design system. Prefer a straightforward system diagram, evidence table, and proof boundary over an interactive novelty diagram.

Technical details should show:

- Track 3 merchant boundary;
- discovery/capability payload;
- HTTP 402 request and x402 version;
- XSGD asset and six decimals;
- Avalanche C-Chain mainnet chain ID;
- exact + Permit2 as Morrow's verified rail;
- allocation/idempotency boundary;
- deterministic versus fork versus actual mainnet evidence;
- AWS as `DESIGNED ONLY` unless fresh, real deployment evidence exists.

Never claim an x402 mainnet Morrow settlement, an AWS deployment, or cryptographic receipt verification that has not happened.

## Phase 4: preserve and improve the core behavior

Do not create a beautiful shell around a fake flow. Wire the merchant-authored canonical policy through the existing APIs and deterministic proof so the UI is genuinely interactive.

At minimum:

1. A merchant can create or edit a policy with realistic validation.
2. Publishing changes the policy/resource status and generates agent-facing terms.
3. The prepared two-agent test reads the published policy rather than unrelated constants.
4. Both clients receive consistent terms and unique request/payment identifiers.
5. Allocation produces exactly one winner.
6. The winner's amount equals the configured XSGD deposit.
7. The loser's settled amount is exactly zero.
8. The resulting activity and receipt use the same policy identifier and terms hash.
9. Reset/run-again produces a clean deterministic state without stale timers or race leakage.
10. The demo remains complete when the local fork is unavailable and clearly labels the fallback.

Use the Merchant Policy Compiler as the primary innovation. If feasible without destabilizing the release, complement it with official x402 concepts such as payment identifiers and signed offer/receipt metadata. Do not invent a competing payment standard. Do not add an LLM merely to make the buyer look intelligent; a small independent deterministic client is stronger proof of interoperability.

Treat allocation honesty as a hard boundary. A process-local lock is not serverless atomicity. Label it accurately or implement a safe durable conditional-write path only with fresh credentials and adequate time. Do not let an AWS prize attempt endanger the Track 3 submission.

## Phase 5: design every important state

Implement and visually verify:

- commitments list with seeded data;
- empty list;
- create draft;
- inline validation error;
- saved draft;
- publish confirmation;
- published detail;
- agents discovering/authorizing;
- allocation in progress;
- one-winner completion;
- loser S$0 result;
- receipt issued;
- exercised and expired status;
- deterministic fallback;
- route/API error with a useful retry;
- loading, disabled, reset, and run-again behavior;
- reduced-motion behavior;
- keyboard-only operation;
- mobile sticky action treatment where needed.

Use banners, inline errors, and toasts according to their semantics. Never expose raw RPC URLs, ports, stack traces, private data, secrets, or internal exceptions in public UI or API responses.

## Phase 6: responsive, accessibility, and quality bar

Verify at minimum at 1440x1000, 1024x768, 390x844, and 360x800.

- Desktop: use space efficiently without stretching content edge to edge. The editor can use form plus live preview.
- Tablet: keep the main action and key status above the fold. Do not collapse into disconnected card stacks.
- Mobile: stack deliberately, keep touch targets at least 44px, keep the primary action reachable, and show winner, settlement, and loser S$0 together or through an immediately visible compact summary.
- No horizontal overflow, clipped controls, hidden focus, overlapping sticky bars, awkward wrapping, or text below 12px.
- Use semantic landmarks, headings, labels, button names, error associations, live-region announcements for the race outcome, logical tab order, visible focus, and adequate contrast.
- Respect `prefers-reduced-motion`. The proof cannot depend on animation timing for comprehension.
- Avoid unnecessary client rendering and animation work. Keep layout stable and interaction latency low.
- Check console errors, hydration warnings, failed requests, route 404s, and broken links.

## Phase 7: judge-first product audit

Audit the built candidate as if judging it under deadline pressure.

### Five seconds

A judge should see that this is a merchant tool for publishing scarce inventory commitments to agents, not a consumer agent or payment rail demo.

### Fifteen seconds

A judge should understand `create policy -> publish agent offer -> agents contend -> merchant gets one accountable commitment` and see the product's primary action.

### Sixty seconds

The demo should complete one coherent story:

1. Open the commitments index.
2. Create or open a merchant-authored policy.
3. Show the human offer and machine-readable output.
4. Publish it.
5. Run two clients against it.
6. Show one allocation, one XSGD settlement in the labelled proof mode, loser S$0, and the receipt.
7. Open technical details only if a judge asks.

Score the candidate against:

- Track 3 merchant-product clarity;
- originality and defensibility;
- x402 being load-bearing;
- XSGD/Avalanche correctness;
- real-world merchant impact;
- usability and visual credibility;
- end-to-end software behavior;
- truthful proof boundaries;
- demo resilience;
- ability for a teammate to present it without the builder.

Fix every high-impact failure you can reproduce. Delete lower-value decoration or features that weaken the story.

## Phase 8: verification

Run and record the exact results of:

- `pnpm test`;
- fork tests through their documented isolated path when safe prerequisites are available;
- `pnpm typecheck`;
- `pnpm lint`;
- `pnpm build`;
- browser QA on all target viewports and states;
- keyboard-only and reduced-motion QA;
- `/`, every new or retained product route, `/architecture`, `/.well-known/agent-commerce`, `/api/capabilities`, and `/api/commit`;
- console, network, overflow, route, and broken-link checks.

For visual QA, compare current reference and candidate screenshots side by side at the same viewport. Inspect typography, hierarchy, padding, margins, alignment, borders, radii, image crops, table behavior, forms, sticky elements, and mobile stacking. Iterate until the candidate looks intentionally designed rather than merely restyled.

Do not say a check passed if it was skipped, timed out, or only partially exercised. Separate deterministic, fork-proven, deployed, and mainnet-verified facts.

## Phase 9: commit, push, deploy, and verify

Land the work in coherent milestones, for example:

1. merchant application shell and design system;
2. policy compiler and canonical policy model;
3. detail/proof lifecycle and responsive polish;
4. documentation, tests, and release fixes.

After each milestone:

- re-fetch and verify remote divergence;
- run the relevant checks;
- commit only the intended files with the required identity;
- push safely to `main`;
- verify the GitHub remote contains the commit.

After the release candidate passes locally:

- verify the Vercel project is connected to the correct GitHub repository and branch;
- deploy through the existing project path; no environment variables are required for the deterministic public experience;
- verify the production deployment corresponds to the latest intended commit;
- inspect production at desktop and mobile;
- verify `/architecture` and all product routes do not 404;
- verify the public UI contains no obsolete Fuji-only, “XSGD has no EIP-3009,” fake mainnet-settlement, or AWS-deployed claim;
- verify no secrets or private values appear in source, build output, client bundles, logs, or Vercel configuration.

If GitHub or Vercel moves underneath the work, reconcile carefully and continue. Stop only for a genuine destructive conflict, unavailable account access, or a security boundary that cannot be crossed safely. Report an exact blocker rather than quietly substituting a fake result.

## Update the teammate and submission package

Keep this concise and human. Update existing README/handoff material instead of creating redundant documents.

Include:

- one-sentence pitch;
- the real merchant problem;
- why this is Track 3 rather than Track 1 or Track 2;
- what the Merchant Policy Compiler produces;
- how x402, XSGD, Avalanche, Permit2, and optional AWS architecture each contribute;
- one timed 60-second demo script;
- one 20-second deterministic fallback;
- exact claims we may and may not make;
- public URL, architecture URL, GitHub URL, release commit, and verification commands.

## Definition of done

This goal is complete only when all of the following are true:

- The app looks like a trustworthy, normal merchant commerce product rather than an AI/Web3 landing page.
- The first screen is a usable commitments workspace with a clear create action.
- A merchant can configure and publish a canonical commitment policy.
- Human and agent-facing offer previews come from the same policy data.
- The two-client proof uses the published policy and displays one winner, one settlement, and loser S$0 together.
- The UI demonstrates applicability beyond restaurants without pretending to be four separate products.
- Protocol details are easy for judges to inspect but do not dominate normal merchant UX.
- The design is responsive, accessible, keyboard-usable, reduced-motion safe, and free of console or layout failures.
- All retained claims about XSGD, Avalanche, x402, Permit2, mainnet evidence, and AWS are technically honest.
- Tests, typecheck, lint, build, route checks, and browser QA pass, or any remaining failure is reported with precise evidence.
- GitHub `main` contains the verified implementation in clean human commits.
- Vercel production serves the latest intended commit, all required routes load, and the public link has been checked on desktop and mobile.
- The teammate handoff contains one pitch, one demo, one fallback, exact proof boundaries, and current links.

## Final report

Lead with the shipped result. Then give:

1. Public production URL and GitHub commit.
2. What materially changed in the product and UI.
3. Why the result is stronger for Track 3 and sponsor prizes.
4. Exact verification results.
5. Local, GitHub, Vercel, production, fork, mainnet, and AWS state as separate facts.
6. Any remaining honest limitation and the single highest-value next action.

Do not pad the report with process narration. Be exact, skeptical, and ship-minded.
```
