import { describe, expect, it, vi } from "vitest";

import {
  isForkReachable,
  isForkReachableSync,
  isLiveRailConfigured,
  isLoopbackForkRpcUrl,
} from "@/lib/rail/clients";
import { runProof } from "@/lib/rail/run-proof";

const AVALANCHE_MAINNET_RPC = "https://api.avax.network/ext/bc/C/rpc";

describe("fork RPC safety", () => {
  it("only accepts explicit loopback HTTP endpoints", () => {
    expect(isLoopbackForkRpcUrl("http://127.0.0.1:8545")).toBe(true);
    expect(isLoopbackForkRpcUrl("http://localhost:8545")).toBe(true);
    expect(isLoopbackForkRpcUrl("http://[::1]:8545")).toBe(true);
    expect(isLoopbackForkRpcUrl(AVALANCHE_MAINNET_RPC)).toBe(false);
    expect(isLoopbackForkRpcUrl("http://127.0.0.1.evil.example:8545")).toBe(false);
    expect(isLoopbackForkRpcUrl("file:///tmp/anvil.ipc")).toBe(false);
  });

  it("rejects an Avalanche mainnet URL before asynchronous network access", async () => {
    const fetchSpy = vi.fn(() => Promise.reject(new Error("network access must not occur")));
    vi.stubGlobal("fetch", fetchSpy);

    try {
      await expect(isForkReachable(AVALANCHE_MAINNET_RPC)).resolves.toBe(false);
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("keeps configured settlement disabled for a mainnet RPC", () => {
    const previousMerchant = process.env.MERCHANT_WALLET_ADDRESS;
    const previousRpc = process.env.FORK_RPC;
    const previousFacilitatorKey = process.env.FACILITATOR_PRIVATE_KEY;

    process.env.MERCHANT_WALLET_ADDRESS = "0x90F79bf6EB2c4f870365E785982E1f101E93b906";
    process.env.FORK_RPC = AVALANCHE_MAINNET_RPC;
    delete process.env.FACILITATOR_PRIVATE_KEY;

    try {
      expect(isForkReachableSync(AVALANCHE_MAINNET_RPC)).toBe(false);
      expect(isLiveRailConfigured()).toBe(false);
    } finally {
      if (previousMerchant === undefined) delete process.env.MERCHANT_WALLET_ADDRESS;
      else process.env.MERCHANT_WALLET_ADDRESS = previousMerchant;
      if (previousRpc === undefined) delete process.env.FORK_RPC;
      else process.env.FORK_RPC = previousRpc;
      if (previousFacilitatorKey === undefined) delete process.env.FACILITATOR_PRIVATE_KEY;
      else process.env.FACILITATOR_PRIVATE_KEY = previousFacilitatorKey;
    }
  });
});

describe("runProof fallback", () => {
  it("returns a safe deterministic proof and never throws when RPC is a dead port", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const result = await runProof({ rpcUrl: "http://127.0.0.1:1" });

    expect(result.proofMode).toBe("DETERMINISTIC_DEMO");
    expect(result.liveAttempted).toBe(true);
    expect(result.liveErrorCode).toBe("LIVE_PATH_UNAVAILABLE");
    expect(result.viewerNote).toContain("Permit2 approve");
    expect(JSON.stringify(result)).not.toContain("127.0.0.1");
    expect(result.contenders).toHaveLength(2);
    expect(result.contenders.filter((contender) => contender.settled)).toHaveLength(1);
    expect(result.contenders.find((contender) => contender.id === "agent-b")).toMatchObject({
      settled: false,
      chargedAtomic: "0",
    });
    expect(errorSpy).toHaveBeenCalledOnce();
    expect(JSON.stringify(errorSpy.mock.calls)).not.toContain("127.0.0.1");
    errorSpy.mockRestore();
  });
});
