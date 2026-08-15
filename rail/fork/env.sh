# Shared constants for the Morrow payment rail fork harness.
# Source this file, do not execute it.
#
# Every address below was read off Avalanche C-Chain mainnet on 15 Aug 2026.
# Do not edit one without re-verifying it with `cast code` first.

# --- endpoints -------------------------------------------------------------
MAINNET_RPC="${MAINNET_RPC:-https://api.avax.network/ext/bc/C/rpc}"
FORK_RPC="${FORK_RPC:-http://127.0.0.1:8545}"
CHAIN_ID=43114

# Pinning the block keeps every rehearsal identical and lets Anvil cache state,
# so restarts are fast instead of re-fetching from the public RPC.
FORK_BLOCK="${FORK_BLOCK:-92837195}"

# --- token -----------------------------------------------------------------
XSGD=0xb2F85b7AB3c2b6f62DF06dE6aE7D09c010a5096E
XSGD_DECIMALS=6

# --- x402 infrastructure ---------------------------------------------------
PERMIT2=0x000000000022D473030F116dDEE9F6B43aC78BA3

# Deployed on Avalanche AND matches @x402/evm@2.22.0. Use this one.
X402_EXACT_PROXY=0x402085c248EeA27D92E8b30b2C58ed07f9E20001

# Deployed on Avalanche (3178 bytes). Real upto proxy, witness typehash matches
# the SDK exactly. But the SDK does not point at it.
X402_UPTO_PROXY_DEPLOYED=0x402015c795ecb48A360bDC6e35a2EaEb313a0002

# What @x402/evm@2.22.0 hardcodes. ZERO BYTECODE ON AVALANCHE.
# Signing against this address cannot settle here; rehearse.sh verifies it has no bytecode.
X402_UPTO_PROXY_SDK=0x4020A4f3b7b90ccA423B9fabCc0CE57C6C240002

# --- accounts --------------------------------------------------------------
# Holds ~711,238 XSGD, 39% of supply. Impersonated on the fork to hand out
# test funds. Never touched on mainnet.
WHALE=0x23e8dda3ee946dd3dd555658c4c30876c9bf963c

# Dewa's real wallet. Impersonated on the fork so the mainnet approve can be
# rehearsed without a key. Its 30 XSGD is already in forked state.
DEWA=0xfCD4a60cf01F854e4A70367ac66E069A07c211B6

# Anvil's default account 0, used as the throwaway agent wallet. This key is
# public, printed by anvil on every start, and worthless. Safe to commit.
AGENT=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
AGENT_PK=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# --- amounts ---------------------------------------------------------------
MAX_UINT256=0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff

# XSGD has 6 decimals, so S$1 = 1000000.
COMMITMENT_AMOUNT=200000   # 0.20 XSGD, Morrow's commitment fee
AGENT_FUNDING=10000000     # 10 XSGD, plenty for many rehearsals

# --- files -----------------------------------------------------------------
FORK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ANVIL_LOG="$FORK_DIR/anvil.log"
ANVIL_PID="$FORK_DIR/anvil.pid"
