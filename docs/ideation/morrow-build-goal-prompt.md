# Morrow build goal

This is the current execution prompt. The original Fuji/AWS plan was superseded after the organizer mainnet requirement and XSGD contract behavior were verified. The authority for payment facts and claim boundaries is [`docs/decisions/mainnet-mvp.md`](../decisions/mainnet-mvp.md).

```text
/goal

Ship the smallest judge-ready Track 3 proof that a merchant can sell AI agents time-boxed commitments on scarce inventory. Use the restaurant slot as the visual wedge, but keep the product applicable to appointments, tickets, rentals, and limited stock.

Think, research, build, verify, and deploy systematically. Prefer current primary sources and live read-only checks over assumptions. Keep the plan flexible when evidence changes an implementation choice, while preserving the product invariants below.

Product invariants

- The merchant is the protagonist. This is AI-native merchant infrastructure, not another shopping agent.
- Call the product a non-refundable commitment, credited in full when exercised on time. Do not call it an option.
- Use XSGD on Avalanche C-Chain mainnet: chain `eip155:43114`, token `0xb2F85b7AB3c2b6f62DF06dE6aE7D09c010a5096E`, six decimals.
- Price the demo at 0.20 XSGD, represented as `200000` atomic units.
- Emit x402 v2 exact-payment terms with XSGD's EIP-712 domain name `XSGD`, version `2`, and transfer method `eip3009`.
- The decisive story is one merchant SKU, two agents, one final unit, exactly one inventory winner, a loser charged S$0, and a winner receipt exercised into a booking.
- Every screen and API must distinguish deterministic proof from live settlement. Never label a receipt signed unless it is cryptographically signed. Never claim a mainnet transaction, AWS deployment, or accepted payment authorization without evidence.
- The public preview must not accept, store, log, forward, or settle a payment authorization. A live adapter remains disabled until facilitator compatibility, funding, merchant recipient, and an end-to-end mainnet transaction are verified.

Execution loop

1. Inspect the repository and preserve existing work.
2. Re-check only external facts that can change architecture, judging claims, or safety. Record decisions with source links.
3. Implement the narrow merchant contract and deterministic race before adding breadth.
4. Keep payment metadata, inventory state, phase copy, API responses, and receipt claims consistent.
5. Add tests for six-decimal pricing, x402 metadata, zero-address rejection, state transitions, route headers/bodies, unavailable configuration, and refusal of payment signatures.
6. Run tests, typecheck, lint, production build, and browser QA at desktop and mobile sizes. Exercise run, reset, and run-again behavior and check the console.
7. Conduct an adversarial review for correctness, false claims, API contract drift, security, reliability, maintainability, and missing tests. Fix every confirmed blocker.
8. Deploy a Vercel preview only after local verification passes. Do not configure a merchant recipient in the public preview.
9. Hand off the preview URL, exact verification results, and the remaining live-settlement gap.

Scope cuts

- Cut generic agent chat, four-merchant fan-out, accounts, dashboards, AWS infrastructure, and live wallet flows before weakening the one-minute contention proof.
- Prefer a narrow working product with honest labels over a broad architecture diagram.
- Do not stop at a plan while a safe, reversible implementation or verification step remains.

Definition of done

- A judge understands the merchant problem, x402 role, XSGD/Avalanche use, winner/loser outcome, and generality in under one minute.
- The public UI and agent endpoints are coherent and responsive.
- All automated checks and the production build pass.
- The deployed preview is reachable and permanently labeled deterministic.
- No live payment or cryptographic claim exceeds the proof actually obtained.
```
