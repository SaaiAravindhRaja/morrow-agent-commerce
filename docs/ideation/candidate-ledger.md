# Track 3 candidate ledger

> Historical ideation record. Its Fuji, S$5, option, and live-settlement assumptions are superseded by [`docs/decisions/mainnet-mvp.md`](../decisions/mainnet-mvp.md).

Last researched: 2026-08-14 SGT. This is the deliberately broad search record, not a menu of recommendations. The selection result is **CommitSlot**; the other entries exist to show that the choice survived a mechanism-level search rather than winning by first-impression bias.

## Search frames and kill codes

- `T1/T2`: the protagonist drifts to shopping/discovery or wallet/payment infrastructure.
- `X`: x402 is a payment garnish rather than the mechanism.
- `I`: a close incumbent or current protocol already covers the core outcome.
- `P`: weak, infrequent, or insufficiently evidenced merchant pain.
- `D`: the 90-second demo lacks a memorable transformation.
- `F`: too much integration, credential, marketplace, compliance, or live-data risk.
- `S`: scope is a platform rather than a one-day proof.

## 60 mechanism-distinct candidates

### Scarcity, capacity, and machine-only inventory

1. **CommitSlot — advance.** For Singapore restaurants, CommitSlot fixes speculative multi-booking and no-show loss through dynamically priced, expiring table options bought by agents over x402 in XSGD, producing a signed commitment receipt, live countdown, and exercise-into-booking transition, unlike static card deposits.
2. **QueueBond — kill (`I`, `F`).** For limited-drop retailers, QueueBond fixes bot queue hoarding through refundable x402 entry bonds settled in XSGD, producing a live fairness ledger, unlike CAPTCHA and identity queues.
3. **ColdHold — kill (`F`).** For cold-storage operators, ColdHold fixes idle pallet-space fragmentation through per-hour capacity options paid over x402, producing a temperature-bound space receipt, unlike emailed freight quotations.
4. **DockOption — kill (`F`, `D`).** For freight warehouses, DockOption fixes truck-bay congestion through machine-priced arrival-window options in XSGD, producing an executable dock pass, unlike spreadsheet slot booking.
5. **ChargeSlot — kill (`I`).** For EV charging operators, ChargeSlot fixes charger squatting through metered reservation rights paid by vehicle agents over x402, producing a charger-bound receipt, unlike app reservations.
6. **BurstGPU — kill (`T2`, `I`).** For GPU clouds, BurstGPU fixes speculative capacity holds through x402-priced five-minute compute options, producing a signed capacity claim, unlike prepaid cloud credits.
7. **TourOption — kill (`P`).** For Singapore tour operators, TourOption fixes last-minute seat spoilage through short-lived agent-only seat options paid in XSGD, producing a redeemable tour receipt, unlike normal booking deposits.
8. **ReadyRoom — kill (`I`).** For hotels, ReadyRoom fixes uncertain early check-in through a paid, real-time room-readiness option negotiated over x402, producing a guaranteed access window, unlike request-only early check-in.
9. **LockerLease — kill (`I`).** For parcel-locker operators, LockerLease fixes stranded capacity through per-minute locker reservations bought by delivery agents, producing a door-scoped lease receipt, unlike courier allocation systems.
10. **PickupPulse — kill (`P`).** For pop-up merchants, PickupPulse fixes collection-window congestion through x402-priced pickup options, producing a color-coded crowd-load receipt, unlike free time-slot selection.

### Merchant promises, quotes, and compatibility

11. **QuoteSeal — advance.** For volatile-stock electronics merchants, QuoteSeal fixes stale agent quotations through paid, merchant-signed price-and-stock locks in XSGD, producing a tamper-evident quote card, unlike scraped product pages.
12. **FitProof — semifinalist.** For industrial spare-parts merchants, FitProof fixes wrong-part returns through a paid merchant compatibility guarantee requested by an agent over x402, producing a signed fit passport, unlike free lookup tables and sales calls.
13. **LandedLock — kill (`F`).** For cross-border wholesalers, LandedLock fixes uncertain duties and FX through an XSGD-paid landed-cost guarantee, producing a route-specific executable quote, unlike non-binding calculators.
14. **FreshPromise — kill (`F`).** For seafood wholesalers, FreshPromise fixes disputed freshness through x402-purchased shelf-life guarantees tied to sensor evidence, producing a signed freshness clock, unlike PDF certificates.
15. **ClaimSure — kill (`P`, `F`).** For luxury resale merchants, ClaimSure fixes agent distrust through a paid authenticity warranty with an XSGD remedy, producing a proof bundle, unlike static authenticity certificates.
16. **BundleCompiler — kill (`X`).** For office-supply wholesalers, BundleCompiler fixes agent constraint mismatch through a paid, merchant-guaranteed bundle quote, producing a single executable bill of materials, unlike ordinary configurators.
17. **PromiseRoute — finalist.** For same-day delivery merchants, PromiseRoute fixes agents buying impossible delivery promises through an x402-priced service-level guarantee and automatic XSGD credit, producing a live promise timeline, unlike best-effort delivery estimates.
18. **RepairClock — kill (`F`).** For electronics repair shops, RepairClock fixes turnaround uncertainty through machine-buyable completion guarantees, producing a signed repair deadline, unlike manual estimates.
19. **WeatherOption — kill (`P`).** For outdoor-event merchants, WeatherOption fixes weather-driven cancellations through a paid contingency right attached to the booking, producing a rule-bound remedy receipt, unlike broad insurance.
20. **ProofCart — kill (`F`, `D`).** For sustainability-sensitive suppliers, ProofCart fixes unsupported carbon claims through x402-paid provenance bundles, producing a verifiable evidence manifest, unlike marketing badges.

### Paid intent, anti-abuse, and merchant attention

21. **CrawlCredit — kill (`I`, `X`).** For product-data merchants, CrawlCredit fixes uncompensated AI crawling through a paid access fee rebated on purchase, producing a usage-to-sale ledger, unlike robots.txt and generic paywalls.
22. **SeriousRFQ — semifinalist.** For B2B distributors, SeriousRFQ fixes machine-generated quote spam through an XSGD earnest fee applied to a completed order, producing an intent-ranked RFQ queue, unlike free lead forms.
23. **IntentMeter — kill (`X`).** For travel merchants, IntentMeter fixes unlimited agent comparison traffic through a buyer-funded exploration budget rebated at checkout, producing a costed search trail, unlike rate limits.
24. **SampleGate — kill (`X`).** For wholesale catalog owners, SampleGate fixes bulk data extraction through per-SKU x402 sampling credits, producing a licensed data receipt, unlike API keys.
25. **SpamDividend — kill (`F`).** For marketplaces, SpamDividend fixes abusive requests through forfeitable micro-bonds redistributed to affected sellers, producing an abuse dividend ledger, unlike bans.
26. **DropPermit — kill (`T2`, `F`).** For sneaker merchants, DropPermit fixes automated purchase storms through paid, identity-bound attempt permits, producing a one-shot access receipt, unlike CAPTCHA.
27. **HumanMinute — kill (`X`).** For complex B2B merchants, HumanMinute fixes agent escalation load through x402-priced access to a human product expert, producing a resolution memo, unlike premium support.
28. **NegotiationTicket — kill (`X`).** For furniture wholesalers, NegotiationTicket fixes low-intent bargaining through a paid ticket that unlocks one binding counteroffer, producing a signed negotiation transcript, unlike chatbots.
29. **RateMarket — kill (`T2`).** For merchant APIs, RateMarket fixes peak load through dynamically auctioned request-rate credits, producing a capacity price curve, unlike fixed rate limits.
30. **MandateDeposit — kill (`T2`).** For high-value merchants, MandateDeposit fixes anonymous agent risk through a refundable mandate-verification deposit, producing an identity-to-payment proof, unlike agent allowlists.

### Returns, remedies, and post-purchase recovery

31. **KeepBond — kill (`T2`, `F`).** For fashion merchants, KeepBond fixes avoidable returns through a refundable agent confidence bond, producing a return-outcome ledger, unlike free returns.
32. **SizeSure — kill (`I`).** For apparel merchants, SizeSure fixes fit returns through a paid size guarantee generated from declared measurements, producing a merchant-backed fit receipt, unlike size recommenders.
33. **SplitChoice — kill (`X`).** For grocers, SplitChoice fixes failed orders through a paid agent pre-authorization for partial fulfilment rules, producing a machine-readable substitution contract, unlike checkout preferences.
34. **LateCredit — kill (`I`).** For delivery merchants, LateCredit fixes manual service recovery through an automatic XSGD credit when a signed SLA is missed, producing a remedy transaction, unlike promo-code support.
35. **WrongItemNow — kill (`I`).** For marketplaces, WrongItemNow fixes slow wrong-item disputes through a paid proof endpoint that instantly issues replacement entitlement, producing a decision receipt, unlike support tickets.
36. **WarrantyPocket — kill (`T2`, `F`).** For appliance merchants, WarrantyPocket fixes unfunded warranty promises through per-sale XSGD micro-reserves, producing a reserve coverage meter, unlike insurer-backed warranties.
37. **EscalationClock — kill (`X`).** For logistics merchants, EscalationClock fixes silent delivery exceptions through x402-priced priority escalation, producing a visible handoff timer, unlike paid support.
38. **ExceptionBid — kill (`F`).** For travel sellers, ExceptionBid fixes stranded failed bookings through an auction among fulfilment partners, producing a replacement route receipt, unlike manual rebooking.
39. **PauseOption — kill (`I`).** For subscription merchants, PauseOption fixes churn through a machine-buyable pause right, producing a time-bounded entitlement, unlike account settings.
40. **Recover402 — kill (`I`).** For digital-goods sellers, Recover402 fixes “payment settled but response lost” failures through an idempotent recovery inbox, producing a recovered fulfilment receipt, unlike support reconciliation; x402 payment identifiers and x402-signals already target this gap.

### Physical-digital bridges

41. **FreshBatch — semifinalist.** For bakeries and caterers, FreshBatch fixes unsold production through agent-purchased, time-boxed surplus batches in XSGD, producing a live waste-avoided counter, unlike consumer surplus-food marketplaces.
42. **PrepLane — kill (`I`).** For hawkers, PrepLane fixes lunchtime surges through paid machine reservations of cooking capacity, producing a queue-position receipt, unlike mobile pre-ordering.
43. **SubstitutePromise — kill (`I`).** For grocers, SubstitutePromise fixes agent dissatisfaction through paid, category-level substitution guarantees, producing a constraint-proof fulfilment card, unlike standard substitution settings.
44. **VendPolicy — kill (`P`).** For unattended retail, VendPolicy fixes agent access to machine inventory through x402-triggered one-time dispense rights, producing a device attestation, unlike QR payment.
45. **PartPrint — kill (`I`).** For repair merchants, PartPrint fixes discontinued-part shortages through paid, licensed local-print entitlements, producing a one-use manufacturing manifest, unlike ordinary digital-file sales.
46. **LaundryWindow — kill (`P`).** For laundries, LaundryWindow fixes pickup no-shows through x402-paid courier-window commitments, producing a chain-of-custody timer, unlike app bookings.
47. **SamplePod — kill (`S`).** For trade-show vendors, SamplePod fixes unqualified sample requests through paid autonomous vending with purchase rebates, producing a lead-quality receipt, unlike badge scans.
48. **RobotDock — kill (`F`).** For malls, RobotDock fixes delivery-robot contention through per-minute loading-bay rights in XSGD, producing a sensor-confirmed access token, unlike fleet scheduling.
49. **ProofLocker — kill (`I`).** For high-value pickup merchants, ProofLocker fixes disputed handover through an agent-paid locker transaction tied to device evidence, producing a custody receipt, unlike OTP pickup.
50. **ArrivalBond — kill (`F`).** For home-service merchants, ArrivalBond fixes two-sided no-shows through mutual XSGD commitments, producing an outcome-linked release record, unlike card deposits.

### Multi-party and cross-border commerce

51. **GroupCommit — kill (`F`).** For caterers, GroupCommit fixes fragmented agent group orders through atomic participant deposits, producing a threshold-funded order, unlike payment links.
52. **FreightSplit — kill (`S`, `F`).** For exporters, FreightSplit fixes multi-party settlement through x402-triggered conditional XSGD splits across carrier, warehouse, and broker, producing a fulfilment waterfall, unlike invoices.
53. **LicenseSlice — kill (`I`).** For creators, LicenseSlice fixes ambiguous AI reuse rights through per-use licences paid over x402, producing a signed rights receipt, unlike stock-media licences.
54. **DutyBuffer — kill (`T2`, `F`).** For cross-border merchants, DutyBuffer fixes customs variance through a bounded XSGD authorization and later exact settlement, producing a duty reconciliation, unlike card pre-authorizations.
55. **TaxProof — kill (`D`).** For regional merchants, TaxProof fixes agent reconciliation through a paid, jurisdiction-specific tax receipt endpoint, producing a machine-verifiable invoice, unlike ordinary e-invoicing.
56. **ReturnRelay — kill (`S`).** For fashion merchants, ReturnRelay fixes returned-stock loss through agent-routed local resale before reverse shipping, producing a diverted-return receipt, unlike recommerce platforms.
57. **ReceiptLoyalty — kill (`I`, `X`).** For restaurant groups, ReceiptLoyalty fixes agent-channel disintermediation through portable purchase receipts that earn XSGD benefits, producing a merchant-owned customer history, unlike points.
58. **ProvenanceBid — kill (`P`).** For ethical-sourcing merchants, ProvenanceBid fixes expensive evidence preparation through an agent-funded proof request auction, producing an evidence pack, unlike certifications.
59. **QuoteFlightRecorder — kill (`I`).** For B2B merchants, QuoteFlightRecorder fixes disputes over agent instructions through a payment-linked tamper-evident transcript, producing an audit trail, unlike logs; current x402 accountability proposals are already close.
60. **ContingencyMenu — kill (`X`).** For perishable-goods merchants, ContingencyMenu fixes fulfilment failure through pre-priced agent choices for refund, substitute, or delayed delivery, producing a deterministic failure receipt, unlike support workflows.

## Hard-gate result: five semifinalists

Scores use the fixed 100-point rubric: Track 3 (20), impact/XSGD (15), x402 depth (15), originality (15), demo (15), one-day feasibility (10), AWS (5), adoption (5). Hard gates overrule totals.

| Candidate | Track | Impact | x402 | Original | Demo | Feasible | AWS | Adoption | Total | Result |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| **CommitSlot** | 20 | 15 | 15 | 14 | 15 | 7 | 4 | 4 | **94** | Winner; external payment gates unresolved |
| **FitProof** | 19 | 13 | 14 | 14 | 13 | 8 | 4 | 5 | **90** | Finalist/fallback |
| **PromiseRoute** | 20 | 14 | 14 | 10 | 14 | 8 | 5 | 5 | **90** | Finalist/fallback; collision penalty |
| **SeriousRFQ** | 19 | 12 | 13 | 13 | 12 | 8 | 4 | 5 | **86** | Semifinalist; weaker live magic |
| **FreshBatch** | 20 | 15 | 12 | 10 | 14 | 7 | 4 | 5 | **87** | Semifinalist; marketplace/data risk |

### Evidence behind the scores

- **CommitSlot:** Chope says restaurant deposits exist to deter no-shows and late cancellations; Singapore reporting documents multiple same-night bookings, two-to-four weekly no-shows at one restaurant before a S$25 hold, and a fall to one or two tables monthly after it. The merchant pain and remedy are therefore direct, recurring, and locally coherent. Its difference is the agent-only product: a real-time, dynamically priced *temporary option* rather than a full booking or static deposit. x402 price negotiation, EIP-3009 XSGD settlement, payment identifiers, a signed hold receipt, and expiry are the product interaction, not a payment button.
- **FitProof:** wrong-part returns and technical presales are credible, but the best beachhead and exact cost need more primary evidence; demo data would be partly fabricated. Its paid guarantee is novel and screenshotable, yet there is more domain-model work than CommitSlot.
- **PromiseRoute:** the pain and visual SLA clock are strong, but `x402-signals` v0.2 already defines fulfilment policies, status endpoints, refund endpoints, lost-200 recovery, and outcome-specific refunds. We could produce a merchant experience on top, but the protocol novelty is less defensible.
- **SeriousRFQ:** payment as a signal is load-bearing, but an earnest fee may depress legitimate leads, the live transformation is mostly queue reordering, and a normal refundable card deposit is a strong simpler substitute.
- **FreshBatch:** Singapore generated 790,000 tonnes of food waste in 2025, but proving a causal merchant outcome would require real surplus inventory or marketplace supply; Too Good To Go-style surplus marketplaces make the pitch look familiar.

## Finalist adversarial lenses

### CommitSlot

- **StraitsX/product:** Singapore restaurants already use SGD deposits; XSGD preserves the familiar denomination while enabling an agent to commit in one signed HTTP round trip. First deployers: fine-dining restaurants and reservation platforms.
- **Avalanche/x402:** the merchant returns a dynamic 402 for the exact hold terms. The agent signs an EIP-3009 XSGD authorization; the facilitator verifies and settles; the merchant returns an idempotent, signed hold receipt linked to the Fuji transaction. Removing x402 removes the instant economic commitment and retry-safe protocol surface.
- **AWS:** conditional inventory writes prevent double-holds; payment IDs deduplicate retries; expiry events release inventory; a queue/DLQ preserves settlement-to-hold recovery; audit metrics expose stuck states.
- **Hackathon:** an empty four-seat slot visibly flips to “held by an agent,” a countdown begins, and the screen joins policy, XSGD transaction, and inventory state in one receipt. The flow is understandable without explaining crypto.
- **Closest incumbents:** Chope/Grab, SevenRooms/OpenTable, and Oddle Reserve already offer deposits, card guarantees, and reservation operations; ACP/UCP covers checkout. None currently exposes a dynamically priced, seconds-to-minutes inventory option as a permissionless x402 resource. The ordinary-deposit objection remains the leader’s main attack.
- **Smallest impressive demo:** one mandate fans out across four options but permits one paid hold; two agents contest the last table; one real Fuji XSGD settlement wins; the loser authorization stays unused; the winner exercises into a booking.
- **Die overnight if:** one restaurant operator and one organizer/judge proxy cannot distinguish the short option from an ordinary deposit. Missing Fuji XSGD or merchant-direct permission weakens the sponsor proof but does not justify an expensive concept reset.

### FitProof

- **StraitsX/product:** a merchant sells accountable expertise rather than a product listing, reducing expensive wrong-part returns; XSGD is coherent for a regional distributor but less naturally local than restaurant deposits.
- **Avalanche/x402:** the 402 purchases a signed compatibility guarantee, not access to data. Payment ID binds the machine model, candidate SKU, terms, and remedy.
- **AWS:** durable evidence manifests, idempotent guarantee issuance, and audit logs are credible; the parts knowledge base is the fragile dependency.
- **Hackathon:** a visually strong red “not compatible” becomes a green merchant-backed fit passport, but judges may ask whether the model is merely a rules engine.
- **Closest incumbents:** fitment databases, sales-engineer consultations, and product warranties. Differentiation is that an agent buys a merchant-backed decision with a bounded remedy.
- **Smallest impressive demo:** ten real public part/compatibility rows, one wrong suggestion rejected, one paid guarantee issued.
- **Die overnight if:** no defensible public compatibility dataset or merchant return-cost evidence is found.

### PromiseRoute

- **StraitsX/product:** merchants make delivery promises every day and service recovery is costly; an SGD-denominated automatic credit is intuitive.
- **Avalanche/x402:** signed offers, payment IDs, lifecycle hooks, status and refund signals all fit naturally, but the adjacent independent `x402-signals` implementation sharply reduces originality.
- **AWS:** this is the cleanest event-driven architecture: order event, deadline timer, status transition, retry, DLQ, and credit.
- **Hackathon:** a promise timeline turning red and issuing a visible XSGD remedy is memorable, though demonstrating a genuine miss consumes time or requires a controlled clock.
- **Closest incumbents:** carrier SLAs, shipping insurance, and x402-signals. The remaining product gap is merchant policy authoring and customer-visible proof, not the underlying protocol.
- **Smallest impressive demo:** one paid same-day delivery promise, one compressed deadline miss, one remedy receipt.
- **Die overnight if:** judges recognize it as a UI for x402-signals or generic escrow/refund infrastructure.

## Leader pre-mortem and attempted kill

Assume CommitSlot lost. The likely reasons are: judges call it “Chope with crypto”; the agent flow never proves why it can book more destructively than a human; the payment settles but the inventory lock fails; a retry double-charges; testnet XSGD is unavailable; the expiry demo takes too long; or the pitch wanders into wallets instead of restaurant economics.

Countermeasures required in the winner brief:

1. Start with the new failure mode: one agent can reserve ten restaurants in milliseconds while choosing only one.
2. Call the product a *merchant-priced option on temporary inventory*, not a reservation app or deposit rail.
3. Show two simultaneous agents contesting the last table; only the settled, idempotent commitment gets it.
4. Use an atomic conditional write and a `PAYMENT_PENDING -> HELD` recovery state so payment and inventory cannot silently diverge.
5. Keep the default demo fee at S$5 and expiry compressed to 20 seconds; explain that production TTL and fee are merchant policy.
6. Prepare recorded transaction/receipt playback if Fuji, facilitator, or venue Wi-Fi fails.
7. Switch to FitProof only if testnet XSGD cannot be funded early enough or organizers disallow merchant-owned x402 endpoints.

### Why a simpler non-blockchain solution does not fully kill it

A normal card pre-authorization can deter no-shows, and that is the strongest counterargument. It does not, by itself, give arbitrary software agents a permissionless HTTP negotiation, one-signature stablecoin settlement, standard payment proof, retry-safe payment ID, and machine-verifiable receipt. That protocol-level interoperability is useful only if multiple agents can call the same merchant endpoint; for a single closed reservation app, ordinary cards remain the simpler production choice. The pitch must state this boundary honestly.

## Source ledger

### Verified facts

- [AgentiX Playground Dev Hub](https://app.notion.com/p/convergencesummit/AgentiX-Playground-Dev-Hub-3b354aa8ea60806e80acd3c1a43b019f), accessed 2026-08-14: links the StraitsX card MCP sandbox/production endpoints, StraitsX/Avalanche/Crossmint docs, Fuji faucet, RPCs, and states that XSGD has no public testnet faucet.
- Read-only MCP `tools/list`, accessed 2026-08-14: the organizer sandbox’s `get_card_sandbox` accepts S$5-S$30, uses testnet XSGD/EIP-3009 on Fuji, returns a test Visa card and `settlement_tx`, and cannot spend real money. This is a verified fallback, not a merchant-direct settlement claim.
- [0xGasless facilitator API](https://docs.0xgasless.com/x402/facilitator-api/), docs and live read-only `/health` and `/tokens` checked 2026-08-14: public account-less facilitator; Fuji chain 43113; test XSGD `0xd769410dc8772695a7f55a304d2125320a65c2a5`; 6 decimals; EIP-3009; no approval; XSGD EIP-712 domain version 2; `/settle` returns a transaction hash. Live health was `healthy`.
- [StraitsX XSGD page](https://www.straitsx.com/xsgd), accessed 2026-08-14: official Avalanche mainnet XSGD contract `0xb2F85b7AB3c2b6f62DF06dE6aE7D09c010a5096E`.
- Read-only Avalanche C-Chain `eth_call` on the official contract, 2026-08-14: `decimals()` returned 6. [Snowtrace](https://snowtrace.io/token/0xb2F85b7AB3c2b6f62DF06dE6aE7D09c010a5096E/contract/code?chainId=43114) independently labels the verified proxy and six decimals.
- [Chope diner FAQ](https://www.chope.co/singapore-restaurants/pages/dinerfaq), accessed 2026-08-14: restaurants use deposits to discourage no-shows and late cancellations; restaurants set different deposit policies.
- [Grab/Chope reservation terms](https://www.grab.com/sg/terms-policies/reservation-services-powered-by-chope/), accessed 2026-08-14: no-shows can forfeit deposits or cause account restrictions, and attendance disputes require fulfilment proof.
- [CNA on Singapore restaurant reservation fees](https://www.channelnewsasia.com/singapore/restaurants-reservation-booking-fee-deposit-no-show-cancellation-2930231), accessed 2026-08-14: one cited restaurant had two-to-four no-shows weekly before a S$25 credit-card hold and one-to-two tables monthly after; a merchant explicitly cited customers making multiple same-day restaurant bookings. This is strong local reporting, not an organizer or protocol source.
- [x402 Foundation protocol repository](https://github.com/x402-foundation/x402), accessed 2026-08-14: v2-style 402/sign/verify/settle/200 flow; exact, upto, and batch-settlement schemes; explicit `(scheme, network)` support.
- [x402 payment identifier extension](https://docs.x402.org/extensions/payment-identifier), accessed 2026-08-14: client payment IDs let sellers deduplicate retries and return cached responses without charging again.
- [x402-signals issue #2291](https://github.com/x402-foundation/x402/issues/2291), accessed 2026-08-14: independent CC0 proposal already covers post-settlement fulfilment policies, refund policies, status/refund endpoints, and lost-200 recovery, with a live field implementation. It is not Foundation-canonical.
- [Agentic Commerce Protocol](https://www.agenticcommerce.dev/), accessed 2026-08-14: ACP covers programmatic checkout while sellers remain merchant of record and control products/fulfilment.
- [AWS Well-Architected pillars](https://docs.aws.amazon.com/wellarchitected/latest/framework/the-pillars-of-the-framework.html), accessed 2026-08-14: operational excellence, security, reliability, performance efficiency, cost optimization, and sustainability.
- [NEA food-waste statistics](https://www.nea.gov.sg/our-services/waste-management/3r-programmes-and-resources/food-waste-management), updated June 2026 and accessed 2026-08-14: Singapore generated 790,000 tonnes of food waste in 2025 and recycled 18%.
- [Recent Algorand x402 hackathon recap](https://algorand.co/blog/agentic-commerce-x402-hackathon-berlin-recap), accessed 2026-08-14: recent winners and entries already cluster around pay-per-use APIs, marketplaces, trust routers, audit trails, escrow, physical fulfilment, and micropayment batching.

### Inferences

- Autonomous agents will make speculative fan-out bookings cheaper and faster than humans do; the standards reviewed establish agent-programmatic checkout, but no source quantifies future restaurant reservation fan-out.
- A merchant-priced short-term option is more defensible than a generic deposit because the price can reflect slot scarcity and requested TTL. Customer willingness to accept dynamic hold pricing remains untested.
- XSGD is coherent for a Singapore restaurant fee because it is SGD-denominated; this is a product-fit inference, not evidence that restaurants currently want stablecoins.

### Unverified assumptions

- Sponsor and track prizes can stack.
- Judges permit a Track 3 merchant-owned x402 resource using the public 0xGasless facilitator instead of requiring the supplied card MCP path.
- Organizers will provide enough Fuji XSGD to the team wallet for a live settlement.
- One or more restaurants or reservation platforms would pilot dynamically priced agent-only holds.
