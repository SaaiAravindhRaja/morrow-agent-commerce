# Track 3 winning `/goal` prompt

> Historical research prompt, retained as the concept-selection record. Use [`morrow-build-goal-prompt.md`](morrow-build-goal-prompt.md) for current execution.

Paste everything inside the code block into a new Codex goal.

```text
/goal

Find, select, and fully shape the single highest-win-probability product concept for the StraitsX AgentiX Playground Hackathon's AI-native Commerce track (Track 3). Optimize for winning Track 3 and every legitimately stackable sponsor award, especially StraitsX Real-World Impact, Avalanche Best Use of x402, and AWS Best Architected Solution. Do not build the product yet. This goal is complete only when one merchant-native, non-generic idea survives current research, incumbent collision, protocol feasibility, prize-by-prize scoring, and an adversarial pre-mortem, and is turned into a build-ready winner brief.

## Fixed context

- Event: StraitsX Agentic Playground Hackathon, 14-16 August 2026, Singapore.
- Submission deadline: Sunday, 16 August 2026 at 11:00 SGT. Treat the remaining time as a hard constraint and recalculate it when starting.
- Teams may have up to three people. If actual team details cannot be found locally, assume a small team of two to three generalist engineers and scope so the decisive demo can be working within roughly one day.
- Selected track: **AI-native Commerce (Track 3): Build the merchant experiences, APIs, and protocols for a future where AI agents become first-class customers.** This track selection cannot be changed.
- Event-wide requirement: solutions showcase XSGD on Avalanche.
- Main event prize pool: S$7,500. Verify the exact Track 3 prize, judging rubric, eligibility, submission artifacts, demo duration, and whether track and sponsor prizes can stack. Never assume stacking merely because multiple prizes are listed.
- Sponsor awards shown in the organizer slide:
  - **StraitsX Real-World Impact Award**: most impactful solution solving a real-world commerce challenge through agentic payments; S$750.
  - **Avalanche Best Use of x402 on Avalanche**: most innovative agentic payment experience using x402 on Avalanche; S$750.
  - **AWS Best Architected Solution Award**: most secure, reliable, and well-engineered agentic payment solution using AWS Well-Architected principles; S$750.
- Source image: `/Users/saaiaravindhraja/Downloads/photo_2026-08-14 19.58.10.jpeg`
- Workspace: `/Users/saaiaravindhraja/Desktop/ThisMac/Dev/StraitsX-Agentic-Playground`
- The workspace may initially be empty. Preserve any existing user files and do not create implementation scaffolding during this ideation goal.

## Operating method

Use `$compound-engineering-hackathon:ce-hackathon` as the governing winner-selection funnel. After one winner is selected, use `compound-engineering:ce-brainstorm` to turn it into a precise requirements brief, then run `compound-engineering:ce-doc-review mode:headless` to attack and tighten that brief. Do not proceed to implementation, deployment, commits, or paid/mainnet actions. A small local/read-only feasibility spike is allowed only when it resolves a critical protocol uncertainty.

Work autonomously and keep going until the deliverables and win bar below are satisfied. Do not stop at a plan, ask me to choose from a generic list, or treat the first exciting idea as the winner. If an organizer-only fact is unavailable, label it unverified, add it to a short organizer question sheet, make the safest explicit assumption, and continue the research.

Use current primary sources for protocols, contracts, SDKs, event rules, and incumbent products. Record direct links, access dates, and the exact claim each source supports. Product documentation and source repositories beat articles and SEO roundups. Clearly separate verified facts, inferences, and unverified assumptions.

Start with these sources, but do not limit research to them:

- Event: https://luma.com/0x4uwpyh
- x402 neutral docs: https://docs.x402.org/
- x402 Foundation source: https://github.com/x402-foundation/x402
- x402 extensions: https://docs.x402.org/extensions/overview
- x402 seller flow: https://docs.x402.org/getting-started/quickstart-for-sellers
- Avalanche x402 academy/facilitators: https://build.avax.network/academy/blockchain/x402-payment-infrastructure/04-x402-on-avalanche/03-facilitators
- Avalanche integration directory: https://build.avax.network/integrations
- XSGD official page and Avalanche contract listing: https://www.straitsx.com/xsgd
- AWS Well-Architected pillars: https://docs.aws.amazon.com/wellarchitected/latest/framework/the-pillars-of-the-framework.html
- UCP: https://ucp.dev/documentation/core-concepts/
- ACP: https://www.agenticcommerce.dev/
- AP2: https://ap2-protocol.org/
- Visa Trusted Agent Protocol: https://developer.visa.com/capabilities/trusted-agent-protocol/trusted-agent-protocol-specifications/

## Non-negotiable product thesis

The merchant is the protagonist. The product must help a real merchant or merchant operator serve, trust, price, contract with, fulfill, retain, or recover from AI-agent customers in a way that is materially different from serving humans through a normal storefront.

Reject ideas whose main user is a shopper, whose core action is an agent finding products, or whose value is a wallet/spend-control layer. Those naturally drift into Track 1 or Track 2. A small buyer agent may exist only as the counterparty needed to prove the merchant experience.

The winning kind of novelty is a surprising new mechanism applied to a painfully familiar merchant problem. Do not reward weirdness that lacks a deployable customer or commercial reason. The product should still matter if the hackathon and prizes disappeared.

The final idea must satisfy all of these:

1. **Track 3 is undeniable**: it creates a merchant-side experience, API, or protocol specifically because agents are becoming first-class customers.
2. **x402 is load-bearing**: it does more than add a payment button or paywall. Use payment negotiation, programmable per-request economics, discovery, lifecycle hooks, signed offers/receipts, idempotency, authentication, a defensible custom extension, or another protocol-native primitive that makes the product collapse if x402 is removed.
3. **XSGD on Avalanche is real and visible**: show a concrete XSGD settlement path on Avalanche and a transaction/receipt/proof surface. Do not silently substitute USDC.
4. **StraitsX impact is concrete**: name the merchant, repeated pain, current workaround, economic or operational cost, and realistic adoption path, preferably with a Singapore or Southeast Asia wedge where XSGD is coherent rather than decorative.
5. **AWS is architectural, not logo confetti**: use the smallest set of load-bearing AWS services needed for security, reliability, observability, idempotency, and failure recovery. Map the design honestly to all six Well-Architected pillars. Do not add services only to accumulate sponsor names.
6. **The demo has a remembered moment**: in 60-90 seconds, a judge sees a machine customer arrive, a merchant-native decision or transformation occur, x402/XSGD settle on Avalanche, and a visually distinctive proof/artifact appear.
7. **It is buildable before the deadline**: the core proof cannot depend on unavailable production credentials, fake users, a new two-sided marketplace, multiple merchant integrations, or a large custom model.
8. **It is safe and honest**: use non-custodial patterns, least privilege, idempotency/replay protection, explicit failure states, and no false compliance or production-readiness claims.

## Phase 1: Produce a verified brief matrix

Inspect the supplied image, event page, all locally available event material, registration text, T&Cs, organizer decks, sample repos, SDKs, Telegram material the user has made available, and sponsor documentation. Extract:

- all track and sponsor prizes and whether they are stackable;
- exact judging criteria and likely hidden judge incentives;
- demo/submission format and hard deadline;
- required XSGD network, contract, faucet/funding method, account/KYC assumptions, and whether mainnet or Fuji/test assets are expected;
- required or recommended x402 version, facilitator, wallet, SDK, and organizer-provided infrastructure;
- Crossmint or other sponsor capabilities that are available, while refusing to force them into the concept if they do not improve it;
- team resources, credentials, starter code, repos, and any attendee-only constraints found locally;
- disqualifiers and unresolved organizer-only facts.

Immediately write `docs/ideation/organizer-questions.md` containing no more than eight high-leverage questions. Prioritize: prize stacking, exact rubric/demo time, Avalanche network and XSGD asset, XSGD-compatible x402 facilitator/scheme, required real settlement proof, supplied credits/keys, and whether sponsor tech is mandatory. Do not pause the rest of the goal while these remain unanswered.

## Phase 2: Audit the required assets before ideating

### x402 and Avalanche

Read the current x402 specification, Foundation repo, examples, project ideas, extensions, facilitator requirements, and Avalanche-specific material. At minimum understand and compare:

- v2 request/402/payment/verify/settle/200 flow and headers;
- `exact`, `upto`, and `batch-settlement` schemes;
- Bazaar discovery, payment identifiers/idempotency, Sign-In-With-X, signed offers and receipts, lifecycle hooks, and custom extension points;
- Avalanche C-Chain/Fuji identifiers, finality, facilitator choices, gas sponsorship, and observable settlement proof;
- which primitives are mature enough to demo and which would require speculative custom work.

Do not mistake “uses x402” for “innovates with x402.” State what an Avalanche/x402 judge has already seen dozens of times and what deeper primitive or new merchant interaction would feel fresh.

### XSGD feasibility kill gate

Resolve this before promoting a finalist. Public Avalanche x402 examples often emphasize USDC and ERC-2612/EIP-3009-style token authorization. Verify, from the organizer setup, current facilitator docs, token ABI/source, or a minimal local/read-only spike:

- the official XSGD Avalanche contract and decimals;
- whether the supplied facilitator natively supports XSGD;
- whether XSGD supports the authorization/permit mechanism expected by the selected x402 scheme;
- whether an approval-based gas-sponsoring flow, organizer adapter, custom scheme/facilitator, or another honest path is required;
- what can actually be shown before the deadline without deploying or spending funds during this research goal.

Never claim native support unless verified. If the path is blocked, either choose a technically honest fallback or make the missing organizer dependency explicit. No finalist may receive a high feasibility score while this is unresolved.

### AWS

Research only the AWS components relevant to the finalists. Favor a small, credible event-driven design with explicit identity/secret handling, durable idempotency, bounded retries, dead-letter/failure recovery, encryption, audit logs, observability, cost limits, and graceful degradation. The award is for architecture quality, not service count.

## Phase 3: Research real pain and collisions

Research current agentic-commerce standards, merchant products, sponsor demos, recent x402 projects/hackathon winners, GitHub repos, and direct incumbents. The collision set must include, where relevant:

- UCP, ACP, AP2, Visa Trusted Agent Protocol, MCP/A2A commerce patterns, and other current merchant-agent standards;
- x402 Bazaar, the x402 project-ideas list, Foundation examples, paid APIs/paywalls, generic facilitator demos, and signed-receipt examples;
- Avalanche integrations such as Reap Protocol, PayAI, Thirdweb x402, 0xGasless, and other current x402 products;
- Crossmint's current agent/commerce capabilities and any organizer demos;
- Shopify/Stripe/OpenAI/Google merchant experiences and close startups;
- recent Devpost/GitHub/Product Hunt concepts only as collision evidence, with original project links where possible.

Mine merchant pain across the full lifecycle, not just checkout: agent recognition and bot abuse, machine-readable eligibility, live inventory and capacity, quote/offer integrity, price discrimination concerns, paid discovery, reservation, bundles, negotiated constraints, perishable inventory, fulfillment proof, returns, refunds, warranties, disputes, tax/reconciliation, loyalty, post-purchase service, data provenance, rate limits, and multi-party delivery. These are search frames, not preselected solutions.

For each plausible problem, name the specific merchant, frequency, present workaround, why agents make it newly acute, and evidence that the pain is real. Prefer a narrow beachhead with an obvious live demo over “all merchants.”

## Phase 4: Generate a genuinely broad search space

Generate at least 50 mechanism-distinct candidates before selecting. Use a morphological search matrix combining:

- a concrete merchant segment and painful lifecycle moment;
- a merchant decision, contract, proof, or new machine-only product surface;
- an x402 primitive or defensible custom extension;
- XSGD/Avalanche settlement or incentive behavior;
- a real input and screenshotable output;
- a 60-90 second demo transformation.

Cover these frames: weird-but-useful protocol; adversarial merchant defense; new machine-only SKU; verifiable service-level promise; paid intent or signal; inventory/capacity market; post-purchase/returns; physical-digital bridge; multi-party fulfillment; failure recovery; Southeast Asia cross-border wedge; and “impossible before autonomous customers.” Include several ideas that are not obvious ecommerce storefronts.

Write each candidate in one line:

`For [specific merchant], [product] fixes [costly job/pain] through [merchant-native mechanism where x402/XSGD/Avalanche is essential], producing [memorable proof/artifact], unlike [current workaround or incumbent].`

Do not show me an unfiltered idea dump as the final answer. Keep the full candidate ledger in `docs/ideation/candidate-ledger.md` as evidence that the search was broad.

### Default kill list

Kill or radically reframe these common outputs unless a genuinely new mechanism changes the category:

- another AI shopping or product-comparison agent;
- “Shopify for agents,” an agent-ready storefront, or a generic merchant MCP server;
- a normal x402 paywall, pay-per-API endpoint, facilitator dashboard, or payment button;
- a universal checkout wrapper;
- a generic smart wallet, spend-policy engine, escrow, or virtual-card flow;
- an agent marketplace that needs fake supply and demand;
- generic dynamic pricing, negotiation, loyalty-token, invoice-autopay, fraud-score, analytics, or reconciliation dashboards;
- an LLM chat frontend whose core value survives unchanged without the LLM;
- stitching UCP/AP2/ACP/x402 together with no new merchant outcome;
- any idea best described as Track 1 discovery or Track 2 payments infrastructure.

## Phase 5: Apply hard kill gates and score survivors

Hard-kill any candidate that has weak pain, vague merchant, optional sponsor assets, shallow x402, unproved XSGD path, obvious incumbent collision, fake-data dependency, no 90-second demo, no visual artifact, too much setup/auth, broad platform scope, legal/compliance hand-waving, or a pitch that is more impressive than the product interaction.

Keep at most five semifinalists, then score them with evidence on a 100-point rubric:

- 20: merchant-native Track 3 fit;
- 15: concrete real-world impact and StraitsX/XSGD coherence;
- 15: x402 + Avalanche + XSGD technical depth;
- 15: originality and distance from incumbents/common hackathon entries;
- 15: 60-90 second demo magic, visual power, and judge memorability;
- 10: feasibility within the remaining hours and available credentials;
- 5: AWS Well-Architected credibility;
- 5: post-hackathon adoption/business potential.

Weights do not override hard gates. Cite evidence for every non-obvious score. For each semifinalist provide the smallest impressive demo, closest three incumbents, why it is not the same, real data/credential needs, hardest technical dependency, likely judge objection, and what would make it die overnight.

Advance only the top three. Have each one face four skeptical judge lenses:

1. **StraitsX/product judge**: “Where is the painful real-world commerce problem, why XSGD, and who deploys this?”
2. **Avalanche/x402 DevRel**: “Is x402 deeply and correctly used, is settlement genuinely on Avalanche, and is this more than a paywall?”
3. **AWS architect**: “What fails, how is it secured/observed/recovered, and why are these services justified?”
4. **Hackathon/product judge**: “Can I understand and remember the magic in 90 seconds, and is it actually buildable?”

## Phase 6: Adversarial final selection

For each finalist, run an assumption map and pre-mortem covering value, usability, feasibility, XSGD compatibility, data/credentials, security, compliance, demo fragility, incumbent collision, and team/time fit. Assume the demo failed and the judges forgot it; explain exactly why.

Then try to kill the leader by finding:

- a product or protocol that already does the same thing;
- a simpler non-blockchain/non-agent solution;
- a reason x402 or XSGD is decorative;
- a live-demo dependency likely to fail;
- a merchant who would not care or pay;
- a reason the concept belongs in Track 1 or 2;
- a scope cut that removes the supposed magic.

If the leader fails, promote the next survivor or return to candidate generation. Do not rationalize a weak first choice. Select exactly one winner only when it survives. Keep two fallbacks in reserve, but do not dilute the recommendation with “all three are good.”

## Phase 7: Produce the winner brief

Create `docs/ideation/track-3-winner.md` containing:

1. product name and a plain-English 12-word description;
2. one-sentence contrarian insight explaining why this is not the obvious Track 3 idea;
3. exact merchant beachhead, painful job, current workaround, frequency/cost, and evidence;
4. product mechanism and step-by-step merchant/agent/payment/fulfillment flow;
5. the “only possible now” insight and why x402, XSGD, Avalanche, and agents are each load-bearing;
6. the exact 30-second pitch and 90-second live demo script;
7. the full-screen screenshotable visual surface and the final proof/artifact judges will remember;
8. a prize-fit table for Track 3, StraitsX, Avalanche/x402, and AWS, with one concrete demo proof per criterion and no service-name padding;
9. concrete x402 flow: endpoint/resource, 402 terms, chosen scheme, extensions/hooks, payment signature, verification/settlement, idempotency/retry behavior, XSGD asset/network, and visible Avalanche transaction/receipt;
10. XSGD compatibility evidence and honest fallback if organizer infrastructure is required;
11. minimal AWS architecture as a Mermaid diagram, threat/failure paths, and a concise mapping to the six Well-Architected pillars;
12. closest incumbents and standards, what they already solve, the remaining gap, and the demo moment proving differentiation;
13. smallest buildable MVP, ruthless non-goals, mock boundaries, required credentials/data/accounts, and a teammate split for one, two, and three builders;
14. a deadline-aware build order with a 12-hour kill switch, demo-first milestones, fallback mode for every external dependency, and time reserved for pitch/QA;
15. security and trust model: non-custody, replay/double-charge prevention, idempotency, key/secret handling, authorization, refunds/failures, auditability, and claims we must not make;
16. post-hackathon deployment path, first five realistic design partners, and why Singapore FinTech Festival viewers would care;
17. top five risks with mitigation and exact organizer questions still unresolved;
18. two short fallback concepts and the trigger that would cause us to switch;
19. a source ledger separating verified fact, inference, and assumption;
20. a short “why the obvious ideas lost” section naming at least ten strong-looking candidates that were killed and why.

Then run `compound-engineering:ce-brainstorm` on the selected winner to tighten the product requirements and `compound-engineering:ce-doc-review mode:headless` to attack weak pain, shallow required-asset use, hidden build risk, over-scope, boring visuals, and unclear differentiation. Apply safe corrections to the winner brief and record material changes in a short decision log.

## Final response

Lead with the selected winner, not the process. Give me:

- the name and 12-word idea;
- why it has the highest probability of winning Track 3 and the three sponsor prizes;
- the killer 90-second demo moment;
- the critical x402/XSGD feasibility verdict;
- the biggest remaining risk;
- links to the three local artifacts;
- the next recommended action, which should be a build goal only after this ideation goal is complete.

Do not claim certainty or guaranteed prizes. Optimize ruthlessly for the strongest evidence-backed bet.

## Completion bar

Do not mark this goal complete unless all are true:

- one idea, not a generic list, is clearly recommended;
- the merchant and costly workaround are specific and real;
- Track 3 fit is unmistakable;
- removing x402, XSGD, Avalanche, or the agent breaks the core mechanism;
- the XSGD settlement path is verified or the exact blocker/dependency is stated;
- the demo can land in 90 seconds with a distinctive visual proof;
- the idea is meaningfully separated from current standards, sponsor examples, and incumbents;
- the MVP is credible within the remaining hackathon hours;
- AWS architecture demonstrates engineering judgment instead of service count;
- the concept survives the pre-mortem and skeptical-judge attack;
- `organizer-questions.md`, `candidate-ledger.md`, and `track-3-winner.md` exist and are source-grounded;
- no implementation, deployment, mainnet spending, commit, or push was performed during this ideation goal.
```
