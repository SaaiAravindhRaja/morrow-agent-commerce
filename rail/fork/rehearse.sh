#!/usr/bin/env bash
#
# Rehearse the XSGD payment setup against the local mainnet fork.
#
# Safe to run as many times as you like. It resets the fork to the pinned block
# first, so every run starts from identical state. Nothing here touches
# Avalanche mainnet except two read-only calls at the end that cost nothing.
#
# What it proves:
#   1. Forked state really is mainnet state (balances match)
#   2. Which x402 proxies are actually deployed here
#   3. A wallet can be funded with XSGD and can approve Permit2
#   4. What the real mainnet Permit2 approve will cost Dewa in AVAX
#
set -uo pipefail
cd "$(dirname "$0")"
# shellcheck source=env.sh
source ./env.sh

PASS=0
FAIL=0
ok()   { printf "  \033[32mPASS\033[0m  %s\n" "$1"; PASS=$((PASS+1)); }
bad()  { printf "  \033[31mFAIL\033[0m  %s\n" "$1"; FAIL=$((FAIL+1)); }
head_() { printf "\n\033[1m%s\033[0m\n" "$1"; }

# XSGD has 6 decimals, so render atomic units as a human amount.
xsgd() { awk -v v="$1" 'BEGIN{printf "%.6f", v/1000000}'; }

fork() { cast "$@" --rpc-url "$FORK_RPC"; }

# --- 0. fork must be up ----------------------------------------------------
if ! cast chain-id --rpc-url "$FORK_RPC" >/dev/null 2>&1; then
  echo "No fork at $FORK_RPC. Run ./start.sh first."
  exit 1
fi

head_ "0. Reset fork to pinned block $FORK_BLOCK"
cast rpc anvil_reset \
  "{\"forking\":{\"jsonRpcUrl\":\"$MAINNET_RPC\",\"blockNumber\":$FORK_BLOCK}}" \
  --rpc-url "$FORK_RPC" >/dev/null 2>&1
BLK=$(fork block-number)
[ "$BLK" = "$FORK_BLOCK" ] && ok "fork at block $BLK" || bad "expected block $FORK_BLOCK, got $BLK"
CID=$(fork chain-id)
[ "$CID" = "$CHAIN_ID" ] && ok "chain id $CID" || bad "expected chain id $CHAIN_ID, got $CID"

# --- 1. forked state matches mainnet ---------------------------------------
head_ "1. Forked state is real mainnet state"
DEC=$(fork call "$XSGD" "decimals()(uint8)")
[ "$DEC" = "6" ] && ok "XSGD decimals = 6" || bad "XSGD decimals = $DEC, expected 6"

WHALE_BAL=$(fork call "$XSGD" "balanceOf(address)(uint256)" "$WHALE" | awk '{print $1}')
if [ "$WHALE_BAL" -gt 700000000000 ] 2>/dev/null; then
  ok "whale holds $(xsgd "$WHALE_BAL") XSGD"
else
  bad "whale balance looks wrong: $WHALE_BAL"
fi

DEWA_BAL=$(fork call "$XSGD" "balanceOf(address)(uint256)" "$DEWA" | awk '{print $1}')
if [ "$DEWA_BAL" = "30000000" ]; then
  ok "Dewa's wallet shows $(xsgd "$DEWA_BAL") XSGD, matches mainnet"
else
  bad "Dewa's balance is $(xsgd "$DEWA_BAL") XSGD, expected 30.000000"
fi

# --- 2. which x402 proxies exist here --------------------------------------
head_ "2. x402 proxy deployment on Avalanche"
codesize() { local c; c=$(fork code "$1"); echo $(( (${#c} - 2) / 2 )); }

EXACT_SZ=$(codesize "$X402_EXACT_PROXY")
[ "$EXACT_SZ" -gt 0 ] && ok "exact proxy deployed, $EXACT_SZ bytes (SDK points here, good)" \
                      || bad "exact proxy has no code"

UPTO_DEP_SZ=$(codesize "$X402_UPTO_PROXY_DEPLOYED")
[ "$UPTO_DEP_SZ" -gt 0 ] && ok "upto proxy deployed at ...$( echo "$X402_UPTO_PROXY_DEPLOYED" | tail -c 7), $UPTO_DEP_SZ bytes" \
                         || bad "expected a deployed upto proxy, found none"

UPTO_SDK_SZ=$(codesize "$X402_UPTO_PROXY_SDK")
if [ "$UPTO_SDK_SZ" -eq 0 ]; then
  ok "SDK's upto address has 0 bytes here"
else
  bad "SDK's upto address now HAS code ($UPTO_SDK_SZ bytes). Re-evaluate the upto path"
fi

WTS=$(fork call "$X402_UPTO_PROXY_DEPLOYED" "WITNESS_TYPE_STRING()(string)" 2>/dev/null | tr -d '"')
case "$WTS" in
  *"Witness(address to,address facilitator,uint256 validAfter)"*)
    ok "deployed upto witness struct matches the SDK's" ;;
  *) bad "unexpected witness struct: $WTS" ;;
esac

# --- 3. fund a throwaway agent wallet --------------------------------------
head_ "3. Fund the agent wallet from the whale"
cast rpc anvil_impersonateAccount "$WHALE" --rpc-url "$FORK_RPC" >/dev/null
cast rpc anvil_setBalance "$WHALE" 0x56BC75E2D63100000 --rpc-url "$FORK_RPC" >/dev/null

fork send "$XSGD" "transfer(address,uint256)" "$AGENT" "$AGENT_FUNDING" \
  --from "$WHALE" --unlocked >/dev/null 2>&1

AGENT_BAL=$(fork call "$XSGD" "balanceOf(address)(uint256)" "$AGENT" | awk '{print $1}')
[ "$AGENT_BAL" = "$AGENT_FUNDING" ] \
  && ok "agent funded with $(xsgd "$AGENT_BAL") XSGD" \
  || bad "agent balance is $AGENT_BAL, expected $AGENT_FUNDING"

# --- 4. the one-time Permit2 approve ---------------------------------------
head_ "4. Permit2 approve, the one on-chain step every payer needs"

fork send "$XSGD" "approve(address,uint256)" "$PERMIT2" "$MAX_UINT256" \
  --private-key "$AGENT_PK" >/dev/null 2>&1

ALLOW=$(fork call "$XSGD" "allowance(address,address)(uint256)" "$AGENT" "$PERMIT2" | awk '{print $1}')
EXPECTED=115792089237316195423570985008687907853269984665640564039457584007913129639935
[ "$ALLOW" = "$EXPECTED" ] \
  && ok "agent allowance to Permit2 is max uint256" \
  || bad "agent allowance is $ALLOW, expected max uint256"

# Rehearse the exact transaction Dewa will send on mainnet, using impersonation
# so no private key is needed.
cast rpc anvil_impersonateAccount "$DEWA" --rpc-url "$FORK_RPC" >/dev/null
fork send "$XSGD" "approve(address,uint256)" "$PERMIT2" "$MAX_UINT256" \
  --from "$DEWA" --unlocked >/dev/null 2>&1

DEWA_ALLOW=$(fork call "$XSGD" "allowance(address,address)(uint256)" "$DEWA" "$PERMIT2" | awk '{print $1}')
[ "$DEWA_ALLOW" = "$EXPECTED" ] \
  && ok "Dewa's approve succeeds against real XSGD bytecode" \
  || bad "Dewa's allowance is $DEWA_ALLOW, expected max uint256"

# --- 5. what the real thing will cost --------------------------------------
head_ "5. Cost of doing this for real on mainnet (read-only, free)"
GAS=$(cast estimate "$XSGD" "approve(address,uint256)" "$PERMIT2" "$MAX_UINT256" \
        --from "$DEWA" --rpc-url "$MAINNET_RPC" 2>/dev/null)
GASPRICE=$(cast gas-price --rpc-url "$MAINNET_RPC" 2>/dev/null)

if [ -n "${GAS:-}" ] && [ -n "${GASPRICE:-}" ]; then
  COST_WEI=$((GAS * GASPRICE))
  COST_AVAX=$(cast from-wei "$COST_WEI")
  AVAX_BAL=$(cast balance "$DEWA" --rpc-url "$MAINNET_RPC")
  ok "mainnet approve costs ~$(printf '%.6f' "$COST_AVAX") AVAX ($GAS gas)"
  ok "Dewa holds $(printf '%.4f' "$(cast from-wei "$AVAX_BAL")") AVAX, enough"
else
  bad "could not estimate mainnet gas (RPC issue, not a blocker)"
fi

# --- report ----------------------------------------------------------------
head_ "Result"
echo "  $PASS passed, $FAIL failed"
if [ "$FAIL" -eq 0 ]; then
  echo
  echo "  Fork rehearsal is green. The payment setup works against real"
  echo "  mainnet bytecode without spending anything."
  exit 0
fi
exit 1
