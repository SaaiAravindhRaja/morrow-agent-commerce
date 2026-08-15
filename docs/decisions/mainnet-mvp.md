# Mainnet MVP decisions

Updated: 15 August 2026, Singapore time.

## What changed

- The organizer requirement is Avalanche C-Chain mainnet, so the MVP does not target Fuji.
- The product is a **non-refundable commitment deposit** credited on timely exercise. Judge-facing copy does not call it an option or derivative.
- The payment amount is **0.20 XSGD**, represented as `200000` atomic units.
- The scheme is **x402 v2 `exact` + Permit2**. It is not EIP-3009. It is not `upto`. The `@x402/evm` hardcoded upto proxy has 0 bytes on Avalanche; see parent `docs/CORRECTIONS.md` #7.
- The one-minute demo is one contention story: two agents request the same merchant SKU, one wins inventory, only the winner is settled, and the loser pays S$0 because settle is never called on them.
- The live path (x402 `exact` + Permit2 against real mainnet bytecode) is proven on a local Anvil mainnet fork (`rail/fork/`). `/api/demo` tries that path first and falls back. The UI labels the mode. The public Vercel site may still be the deterministic simulation until this branch is deployed.
- No real mainnet settlement has been sent. The one-time Permit2 `approve` has not been sent.

## Verified chain facts

Read-only calls against Avalanche C-Chain mainnet (`chainId` 43114) on contract `0xb2F85b7AB3c2b6f62DF06dE6aE7D09c010a5096E`:

- name and symbol: XSGD
- decimals: 6
- EIP-2612 `PERMIT_TYPEHASH()` is present
- `DOMAIN_SEPARATOR()` and `version()` revert
- **EIP-3009 typehash getters revert.** `transferWithAuthorization` / `receiveWithAuthorization` cannot be completed against mainnet XSGD.

An earlier revision of this file listed `authorizationState` and `transferWithAuthorization` selectors on the implementation, then concluded that mainnet XSGD has an EIP-3009-style authorization path. That conclusion is false. Selectors on the implementation are not a working EIP-3009 path when the typehash getters revert. See parent `docs/CORRECTIONS.md` #9.

Usable authorization path:

- Permit2 at `0x000000000022D473030F116dDEE9F6B43aC78BA3`
- x402 exact Permit2 proxy at `0x402085c248EeA27D92E8b30b2C58ed07f9E20001` (matches `@x402/evm@2.22.0`)

## Claim boundary

The product proves the merchant experience, machine-readable API contract, exact mainnet asset metadata, deterministic inventory race, and a zero-charge loser from never settling the losing authorization. The live path is proven on the Anvil fork. It does **not** claim a real mainnet settlement, a funded Permit2 approve, a card hold, or an AWS deployment. AWS has no credits; the diagram maps Well-Architected principles. Implementation is the fork plus an in-process lock.

## Primary references

- [Avalanche C-Chain RPC and chain IDs](https://build.avax.network/docs/tooling/rpc-providers)
- [x402 protocol repository](https://github.com/coinbase/x402)
- [Permit2](https://github.com/Uniswap/permit2)
