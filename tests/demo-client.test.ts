import { describe, expect, it, vi } from "vitest";

import { proofModeDisclaimer } from "@/lib/commerce";
import { fallbackDemoProof, isDemoProofResponse, runDemo } from "@/lib/run-demo";

function jsonResponse(body: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: async () => body,
  };
}

describe("runDemo", () => {
  it("falls back to DETERMINISTIC_DEMO when fetch throws", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error("ECONNREFUSED"));

    const result = await runDemo(fetchImpl);

    expect(result.proofMode).toBe("DETERMINISTIC_DEMO");
    expect(result.disclaimer).toBe(proofModeDisclaimer("DETERMINISTIC_DEMO"));
    expect(result.liveAttempted).toBe(true);
    expect(result.liveError).toBe("ECONNREFUSED");
    expect(result.contenders).toHaveLength(2);
    expect(result.contenders.filter((contender) => contender.settled)).toHaveLength(1);
  });

  it("says the live path could not be reached when fetch throws a non-Error", async () => {
    const result = await runDemo(vi.fn().mockRejectedValue("offline"));

    expect(result.proofMode).toBe("DETERMINISTIC_DEMO");
    expect(result.liveError).toBe("the live path could not be reached");
  });

  it("falls back when the response is not ok", async () => {
    const result = await runDemo(vi.fn().mockResolvedValue(jsonResponse({}, false, 503)));

    expect(result.proofMode).toBe("DETERMINISTIC_DEMO");
    expect(result.liveError).toBe("HTTP 503");
  });

  it("falls back when the payload is not a demo proof", async () => {
    const result = await runDemo(vi.fn().mockResolvedValue(jsonResponse({ ok: true })));

    expect(result.proofMode).toBe("DETERMINISTIC_DEMO");
    expect(result.liveError).toBe("the live path returned an unexpected payload");
  });

  it("returns a LIVE_FORK payload from the server unchanged", async () => {
    const payload = {
      proofMode: "LIVE_FORK" as const,
      disclaimer: proofModeDisclaimer("LIVE_FORK"),
      invariant: "exactly one settlement; losing authorization discarded before settlement",
      liveAttempted: true,
      contenders: fallbackDemoProof("unused").contenders.map((contender) => ({
        ...contender,
        receipt: contender.receipt
          ? { ...contender.receipt, proofMode: "LIVE_FORK" as const }
          : undefined,
      })),
    };

    const result = await runDemo(vi.fn().mockResolvedValue(jsonResponse(payload)));

    expect(result).toEqual(payload);
    expect(result.disclaimer).toContain("local Avalanche mainnet fork");
    expect(result.disclaimer).toContain("No real mainnet transaction was broadcast");
  });

  it("returns a DETERMINISTIC_DEMO payload from the current handler", async () => {
    const payload = fallbackDemoProof("unused");
    const serverPayload = {
      ...payload,
      liveAttempted: false,
      liveError: undefined,
    };

    const result = await runDemo(vi.fn().mockResolvedValue(jsonResponse(serverPayload)));

    expect(result.proofMode).toBe("DETERMINISTIC_DEMO");
    expect(result.liveAttempted).toBe(false);
  });
});

describe("isDemoProofResponse", () => {
  it("rejects a payload with fewer than two contenders", () => {
    expect(
      isDemoProofResponse({
        proofMode: "LIVE_FORK",
        disclaimer: "x",
        invariant: "y",
        liveAttempted: true,
        contenders: [{}],
      }),
    ).toBe(false);
  });
});
