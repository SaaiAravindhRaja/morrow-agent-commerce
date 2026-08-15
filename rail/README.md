# Morrow payment rail

Dewa's side of the build. Kept deliberately separate from the deterministic demo
in `app/` so that nothing here can weaken the judging-day fallback.

## Why a fork

There is no XSGD testnet faucet, so every mainnet mistake costs real money out of
a wallet holding 30 XSGD. A **fork** fixes that. Anvil copies Avalanche mainnet
state onto the laptop: same contracts, same balances, same addresses. Writes stay
local. Nothing reaches the real chain.

That turns a scary one-shot mainnet transaction into fifty free rehearsals.

## Run it

```bash
cd rail/fork
./start.sh      # boots the fork, ~10s
./rehearse.sh   # runs the checks, safe to repeat
```

`./start.sh --force` restarts clean. `./rehearse.sh` resets the fork to the
pinned block first, so every run starts from identical state.

Requires Foundry (`brew install foundry`). Nothing else, no node modules.

## Live rail tests

The TypeScript adapter talks to the same fork. It authorizes two agents,
verifies both, settles only Atlas, and refuses a replay or an expired
signature.

```bash
# fork must already be running (./start.sh). Do not start a second one.
corepack pnpm test tests/rail.test.ts
corepack pnpm test
```

If the fork is down, `tests/rail.test.ts` fails loudly. It does not skip.

The one real mainnet action (Permit2 approve from MetaMask) is documented in
[MAINNET-ONCE.md](./MAINNET-ONCE.md). Do not put a private key in this folder.

## What the rehearsal proves

| # | Check |
|---|---|
| 0 | Fork is at the pinned block, chain id 43114 |
| 1 | Forked balances match mainnet: whale 711,238.54 XSGD, Dewa 30.00 XSGD |
| 2 | Which x402 proxies are actually deployed on Avalanche |
| 3 | A wallet can be funded with XSGD by impersonating the whale |
| 4 | The one-time Permit2 approve succeeds against real XSGD bytecode |
| 5 | What the real mainnet approve will cost in AVAX |

As of 15 Aug: 14 passed, 0 failed.

## The finding that matters

Section 2 exists because of a trap. `@x402/evm@2.22.0` hardcodes its upto proxy
at `0x4020A4f3b7b90ccA423B9fabCc0CE57C6C240002`, and **that address has no
bytecode on Avalanche.** A different upto proxy *is* deployed here, at
`0x402015c795ecb48A360bDC6e35a2EaEb313a0002`, and it is ABI-compatible: its
`WITNESS_TYPE_STRING()` and `WITNESS_TYPEHASH()` match what the SDK signs,
verified both directions.

But the SDK's facilitator hard-rejects any other spender:

```js
if (getAddress(...spender) !== getAddress(x402UptoPermit2ProxyAddress))
  return { isValid: false, invalidReason: "invalid_permit2_spender" }
```

So stock `upto` cannot work on Avalanche. `exact` can, because the SDK's exact
proxy address matches what is deployed. Full detail in `docs/CORRECTIONS.md` #7.

The rehearsal asserts this every run, including the reverse case. If the SDK's
address ever gets deployed on Avalanche, check 2 flips to FAIL and tells you the
correction is stale. That is intentional.

## Cost of the real mainnet approve

Measured 15 Aug: **56,650 gas**. At the then-current 0.052 gwei that is
**0.0000029 AVAX**. Even at a pessimistic 25 gwei it is 0.0014 AVAX. Dewa holds
0.2 AVAX, so this is not a constraint.

## Keys

The harness needs none. Anvil's `anvil_impersonateAccount` forges transactions
from any address without a key, which is how the whale and Dewa's wallet are
driven here. The only private key in these files is Anvil's public default test
key, which is printed on every anvil start and is worthless.

Never put a real private key in this directory. `.env*` is gitignored, use that.

## Files

| File | What |
|---|---|
| `fork/env.sh` | Every address and amount, in one place. Source it, do not run it |
| `fork/start.sh` | Boots the fork, pinned to a block so runs are reproducible |
| `fork/rehearse.sh` | The repeatable rehearsal with a pass/fail report |
