# Mainnet MVP decisions

Updated: 14 August 2026, Singapore time.

## What changed

- The organizer requirement supplied during the briefing is Avalanche C-Chain mainnet, so the MVP no longer targets Fuji.
- The product is a **non-refundable commitment** credited on timely exercise. Judge-facing copy does not call it an option or derivative.
- The real-payment amount is **0.20 XSGD**, represented as `200000` atomic units.
- The one-minute demo is one contention story: two agents request the same merchant SKU, one wins inventory, only the winner may settle, and the other pays zero.
- The Vercel preview is a deterministic product proof. It labels itself clearly and never accepts, stores, or forwards a wallet authorization.

## Verified chain facts

Read-only calls against Avalanche C-Chain mainnet (`chainId` 43114) established that contract `0xb2F85b7AB3c2b6f62DF06dE6aE7D09c010a5096E` reports:

- name and symbol: XSGD
- decimals: 6
- an `authorizationState(address,bytes32)` view
- `transferWithAuthorization` selectors on the active implementation, including both packed-signature and `v,r,s` variants
- `receiveWithAuthorization`, `cancelAuthorization`, and permit-related selectors

This disproves the claim that the deployed mainnet token lacks an EIP-3009-style authorization path. It does not prove that the hackathon facilitator supports this exact token/flow; that remains a live-adapter gate.

## Claim boundary

The deployed preview proves the merchant experience, machine-readable API contract, exact mainnet asset metadata, deterministic inventory race, and honest winner/loser state. It does **not** claim an on-chain settlement or an AWS deployment. A live adapter can be enabled only after facilitator compatibility, merchant recipient, funded payer, and transaction validation are confirmed.

## Primary references

- [Avalanche C-Chain RPC and chain IDs](https://build.avax.network/docs/tooling/rpc-providers)
- [x402 protocol repository](https://github.com/coinbase/x402)
- [EIP-3009: Transfer With Authorization](https://eips.ethereum.org/EIPS/eip-3009)
