# One mainnet transaction

Everything else in this folder is a fork rehearsal. This page is the single
real Avalanche C-Chain write Dewa sends himself.

It is an ERC-20 `approve` of XSGD to Permit2. After this, Morrow can settle
`exact` + Permit2 payments without another on-chain approval from this wallet.
It is not a transfer. It does not move XSGD. It only lets Permit2 pull later,
when a signed authorization is settled.

Do this from MetaMask. Do not paste a private key into a terminal.

## The command

Open Snowtrace's write tab for XSGD, connect MetaMask on Avalanche C-Chain, and
call `approve`:

```bash
open "https://snowtrace.io/token/0xb2F85b7AB3c2b6f62DF06dE6aE7D09c010a5096E#writeContract"
```

Fill in:

| Field | Value |
|---|---|
| From | Dewa's wallet `0xfCD4a60cf01F854e4A70367ac66E069A07c211B6` |
| Network | Avalanche C-Chain (chain id 43114) |
| Contract | XSGD `0xb2F85b7AB3c2b6f62DF06dE6aE7D09c010a5096E` |
| Function | `approve(address spender, uint256 amount)` |
| `spender` | Permit2 `0x000000000022D473030F116dDEE9F6B43aC78BA3` |
| `amount` | `115792089237316195423570985008687907853269984665640564039457584007913129639935` (max uint256) |

Confirm in MetaMask. Wait for the receipt. Then check:

```bash
cast call 0xb2F85b7AB3c2b6f62DF06dE6aE7D09c010a5096E \
  "allowance(address,address)(uint256)" \
  0xfCD4a60cf01F854e4A70367ac66E069A07c211B6 \
  0x000000000022D473030F116dDEE9F6B43aC78BA3 \
  --rpc-url https://api.avax.network/ext/bc/C/rpc
```

The return value should be max uint256.

## Cost

Measured on 15 Aug 2026 against mainnet: about 56,650 gas. At 0.052 gwei that
was 0.0000029 AVAX. Dewa holds about 0.2 AVAX, so the fee is not the risk.
The risk is approving the wrong spender. The spender must be Permit2, not the
x402 proxy, and not any other address.

## What this is not

- Not a transfer of XSGD
- Not an x402 settlement
- Not something the agents can do for you
- Not a Fuji or fork transaction. This one hits real Avalanche mainnet.
