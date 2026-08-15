import { describe, expect, it, vi } from "vitest";

import { runProof } from "@/lib/rail/run-proof";

describe("runProof fallback", () => {
  it("returns a safe deterministic proof and never throws when RPC is a dead port", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const result = await runProof({ rpcUrl: "http://127.0.0.1:1" });

    expect(result.proofMode).toBe("DETERMINISTIC_DEMO");
    expect(result.liveAttempted).toBe(true);
    expect(result.liveErrorCode).toBe("LIVE_PATH_UNAVAILABLE");
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
