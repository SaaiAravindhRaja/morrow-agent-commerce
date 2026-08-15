# Mainnet MVP decisions

Updated: 15 August 2026, Singapore time.

## What changed

- The organizer requirement is Avalanche C-Chain mainnet, so the MVP does not target Fuji.
- The product is a **non-refundable commitment deposit** credited on timely exercise. Judge-facing copy does not call it an option or derivative.
- The payment amount is **0.20 XSGD**, represented as `200000` atomic units.
- The scheme Morrow ships is **x402 v2 `exact` + Permit2**, not EIP-3009 and not `upto`. That is a product choice about Morrow, not a statement about what the token supports. Mainnet XSGD does support EIP-3009; see "Verified chain facts" below. The `@x402/evm` hardcoded upto proxy has 0 bytes on Avalanche; the fork rehearsal checks this before running the exact flow.
- The one-minute demo is one contention story: two agents request the same merchant SKU, one wins inventory, only the winner is settled, and the loser pays S$0 because settle is never called on them.
- The live path (x402 `exact` + Permit2 against real mainnet bytecode) is proven on a local Anvil mainnet fork (`rail/fork/`). `/api/demo` tries that path first and returns the sample checkout result when the local fork is unavailable. The checkout panel distinguishes a fork settlement from a simulated walkthrough, while the product UI identifies the flow as a test with sample buyers and no customer charge.
- No verified mainnet settlement hash is recorded in the deployment. The one-time Permit2 `approve` **has** been sent: tx `0xd29b48e98ccf45d4c5d61ac4d6eb85bd37418292496888395734b1c3a5dc6452`, block 92847340, allowance now max uint256. An approve is not a settlement. Do not describe it as one.

## Verified chain facts

Read-only calls against Avalanche C-Chain mainnet (`chainId` 43114) on contract `0xb2F85b7AB3c2b6f62DF06dE6aE7D09c010a5096E`:

- name and symbol: XSGD
- decimals: 6
- EIP-2612 `PERMIT_TYPEHASH()` is present
- `DOMAIN_SEPARATOR()` and `version()` revert
- **EIP-3009 is present.** `TRANSFER_WITH_AUTHORIZATION_TYPEHASH()` returns `0x7c7c6cdb67a18743f49ec6fa9b35f50d52ed05cbed4cc592e13b44501c1a2267` and `RECEIVE_WITH_AUTHORIZATION_TYPEHASH()` returns `0xd099cc98ef71107a616c4f0f941f04c322d8e254fe26b3c6668db87aae413de8`. Both equal the canonical keccak of the EIP-3009 structs. `authorizationState(address,bytes32)` resolves instead of reverting.

Reproduce the EIP-3009 line for yourself:

```bash
cast call 0xb2F85b7AB3c2b6f62DF06dE6aE7D09c010a5096E \
  "TRANSFER_WITH_AUTHORIZATION_TYPEHASH()(bytes32)" \
  --rpc-url https://api.avax.network/ext/bc/C/rpc
```

An earlier revision of this file said the EIP-3009 typehash getters revert. Re-running the call settled the question: the getters resolve. Saying "mainnet XSGD has no EIP-3009" is false.

What is genuinely missing is the **domain**, not the standard. `DOMAIN_SEPARATOR()` and `version()` revert, so the EIP-712 domain cannot be read off-chain. It was recovered from a live 0xGasless settlement as `{ name: "XSGD", version: "2", chainId: 43114, verifyingContract: 0xb2F8…5096E }` and reproduced on the Anvil fork. Morrow ships Permit2 because Permit2 carries its own domain and needs no recovered constant. That is the honest reason.

Usable authorization path:

- Permit2 at `0x000000000022D473030F116dDEE9F6B43aC78BA3`
- x402 exact Permit2 proxy at `0x402085c248EeA27D92E8b30b2C58ed07f9E20001` (matches `@x402/evm@2.22.0`)

## Claim boundary

The product proves the merchant experience, machine-readable API contract, exact mainnet asset metadata, sample inventory race, and a zero-charge loser from never settling the losing authorization. The live path is proven on the Anvil fork. The recorded real mainnet write is the Permit2 approve above, and it is an approve and nothing more. The project does **not** claim a real mainnet settlement, a card hold, or an AWS deployment. AWS has no credits; the diagram maps Well-Architected principles. Implementation is the fork plus an in-process lock.

## Primary references

- [Avalanche C-Chain RPC and chain IDs](https://build.avax.network/docs/tooling/rpc-providers)
- [x402 protocol repository](https://github.com/coinbase/x402)
- [Permit2](https://github.com/Uniswap/permit2)
