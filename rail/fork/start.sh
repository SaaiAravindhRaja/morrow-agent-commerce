#!/usr/bin/env bash
#
# Start a local Anvil fork of Avalanche C-Chain mainnet.
#
# A fork is a copy of mainnet state running on your laptop. Same contracts,
# same balances, same addresses. Writes stay local. Nothing reaches the real
# chain and nothing costs real money.
#
#   ./start.sh          start the fork (no-op if already running)
#   ./start.sh --force  kill any existing fork and start clean
#
set -euo pipefail
cd "$(dirname "$0")"
# shellcheck source=env.sh
source ./env.sh

FORCE=0
[ "${1:-}" = "--force" ] && FORCE=1

is_up() { cast chain-id --rpc-url "$FORK_RPC" >/dev/null 2>&1; }

if is_up; then
  if [ "$FORCE" -eq 0 ]; then
    echo "Fork already running at $FORK_RPC (block $(cast block-number --rpc-url "$FORK_RPC"))."
    echo "Use ./start.sh --force to restart clean."
    exit 0
  fi
  echo "Stopping existing fork..."
  [ -f "$ANVIL_PID" ] && kill "$(cat "$ANVIL_PID")" 2>/dev/null || true
  pkill -f "anvil --fork-url" 2>/dev/null || true
  sleep 2
fi

echo "Forking Avalanche C-Chain mainnet at block $FORK_BLOCK..."
echo "  upstream: $MAINNET_RPC"
echo "  local:    $FORK_RPC"

nohup anvil \
  --fork-url "$MAINNET_RPC" \
  --fork-block-number "$FORK_BLOCK" \
  --chain-id "$CHAIN_ID" \
  --accounts 10 \
  --balance 10000 \
  --host 127.0.0.1 \
  --port 8545 \
  >"$ANVIL_LOG" 2>&1 &

echo $! >"$ANVIL_PID"

# Forking pulls a lot of state on the first run, so give it room.
printf "waiting for fork to accept calls"
for _ in $(seq 1 60); do
  if is_up; then
    echo
    echo "Fork is up."
    echo "  chain id: $(cast chain-id --rpc-url "$FORK_RPC")"
    echo "  block:    $(cast block-number --rpc-url "$FORK_RPC")"
    echo "  pid:      $(cat "$ANVIL_PID")"
    echo "  log:      $ANVIL_LOG"
    echo
    echo "Next: ./rehearse.sh"
    exit 0
  fi
  printf "."
  sleep 1
done

echo
echo "FAILED: fork did not come up in 60s. Last 20 lines of $ANVIL_LOG:"
tail -20 "$ANVIL_LOG"
exit 1
