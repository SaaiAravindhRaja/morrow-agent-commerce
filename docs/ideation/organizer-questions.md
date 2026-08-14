# Organizer Questions

> Historical pre-briefing questions. The current build follows the mainnet and claim decisions in [`docs/decisions/mainnet-mvp.md`](../decisions/mainnet-mvp.md).

Ask these in order. They are the remaining organizer-only facts with the highest power to change the build.

1. **Can one submission win its Track 3 prize and multiple sponsor prizes, or are awards mutually exclusive?**
2. **What is the exact judging rubric, weighting, demo duration, and submission format for Track 3?**
3. **How will teams receive testnet XSGD in their Fuji wallet?** The Dev Hub says there is no public XSGD faucet, while the supplied card MCP requires testnet XSGD before it can complete its x402 payment.
4. **Is the supplied `get_card_sandbox` MCP the intended reference x402/XSGD integration, and may Track 3 expose a merchant-owned x402 resource that settles XSGD through a public XSGD-capable facilitator without issuing a card?**
5. **Must judges see a live Fuji XSGD settlement and explorer transaction, or is the `settlement_tx` returned by the supplied sandbox MCP the expected proof?**
6. **What credentials, credits, merchant accounts, API hosts, or allowlists are being issued for the StraitsX API, card-issuance MCP sandbox, Crossmint, AWS, and Avalanche?**
7. **Is the disposable-card lifecycle mandatory for Track 3, or may a merchant-native x402/XSGD flow bypass card issuance when that better answers the track?**
8. **Are there any Track 3-specific examples or anti-examples the judges already showed, and is the use of Crossmint judged or merely available?**

## Verified context behind the questions

- Dev Hub accessed in the browser at 2026-08-14 20:11 SGT.
- It links Avalanche docs, StraitsX API docs, StraitsX card-issuance MCP sandbox and production endpoints, Crossmint docs, Avalanche Fuji faucet, and Avalanche mainnet/Fuji RPCs.
- It explicitly states that XSGD has no public testnet faucet and that testing is done through the StraitsX API environment.
- A read-only MCP protocol inspection verified that the supplied sandbox server exposes `get_card_sandbox` and `view_card_sandbox`. `get_card_sandbox` requests an exact S$5-S$30 test-card amount, uses an EIP-3009 `TransferWithAuthorization` payment in testnet XSGD on Avalanche Fuji (chain ID 43113), and returns a `settlement_tx`; it does not spend real money.
- The connected Notion integration could not fetch the page because it is authenticated to a different workspace; the public page was read directly in the browser.
