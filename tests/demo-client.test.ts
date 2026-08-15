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

function validPayload(mode: "LIVE_FORK" | "DETERMINISTIC_DEMO" = "DETERMINISTIC_DEMO") {
  const payload = fallbackDemoProof("LIVE_PATH_UNAVAILABLE");
  return {
    ...payload,
    proofMode: mode,
    disclaimer: proofModeDisclaimer(mode),
    liveErrorCode: undefined,
    contenders: payload.contenders.map((contender) => ({
      ...contender,
      receipt: contender.receipt
        ? { ...contender.receipt, proofMode: mode }
        : undefined,
    })),
  };
}

describe("runDemo", () => {
  it("falls back with a safe code when fetch throws", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(
      new Error("ECONNREFUSED http://127.0.0.1:8545 secret-token"),
    );

    const result = await runDemo(fetchImpl);

    expect(result.proofMode).toBe("DETERMINISTIC_DEMO");
    expect(result.liveErrorCode).toBe("LIVE_PATH_UNAVAILABLE");
    expect(JSON.stringify(result)).not.toMatch(/127\.0\.0\.1|8545|secret-token|ECONNREFUSED/);
    expect(result.contenders.filter((contender) => contender.settled)).toHaveLength(1);
  });

  it("falls back with a stable rejection code for non-ok responses", async () => {
    const result = await runDemo(vi.fn().mockResolvedValue(jsonResponse({}, false, 503)));

    expect(result.liveErrorCode).toBe("LIVE_PATH_REJECTED");
    expect(JSON.stringify(result)).not.toContain("503");
  });

  it("falls back with a stable validation code for invalid payloads", async () => {
    const result = await runDemo(vi.fn().mockResolvedValue(jsonResponse({ ok: true })));

    expect(result.liveErrorCode).toBe("INVALID_PROOF_RESPONSE");
  });

  it("passes the browser abort signal to fetch and rethrows AbortError", async () => {
    const controller = new AbortController();
    const abort = new DOMException("aborted", "AbortError");
    const fetchImpl = vi.fn().mockRejectedValue(abort);

    await expect(runDemo(fetchImpl, { signal: controller.signal })).rejects.toBe(abort);
    expect(fetchImpl).toHaveBeenCalledWith(
      "/api/demo",
      expect.objectContaining({ signal: controller.signal }),
    );
  });

  it("returns a valid LIVE_FORK payload unchanged", async () => {
    const payload = validPayload("LIVE_FORK");
    const result = await runDemo(vi.fn().mockResolvedValue(jsonResponse(payload)));

    expect(result).toEqual(payload);
    expect(result.disclaimer).toContain("local Avalanche mainnet fork");
  });
});

describe("isDemoProofResponse", () => {
  it("accepts a complete two-contender proof", () => {
    expect(isDemoProofResponse(validPayload())).toBe(true);
  });

  it.each([
    ["null", null],
    ["empty", {}],
    ["one contender", { ...validPayload(), contenders: validPayload().contenders.slice(0, 1) }],
    ["duplicate contender", {
      ...validPayload(),
      contenders: validPayload().contenders.map((contender) => ({
        ...contender,
        id: "agent-a",
      })),
    }],
    ["two winners", {
      ...validPayload(),
      contenders: validPayload().contenders.map((contender) => ({
        ...contender,
        settled: true,
        chargedAtomic: "200000",
        status: "EXERCISED",
        receipt: validPayload().contenders[0].receipt,
      })),
    }],
    ["charged loser", {
      ...validPayload(),
      contenders: validPayload().contenders.map((contender) => (
        contender.settled ? contender : { ...contender, chargedAtomic: "1" }
      )),
    }],
    ["missing winner receipt", {
      ...validPayload(),
      contenders: validPayload().contenders.map((contender) => (
        contender.settled ? { ...contender, receipt: undefined } : contender
      )),
    }],
    ["receipt mode mismatch", {
      ...validPayload("LIVE_FORK"),
      contenders: validPayload("LIVE_FORK").contenders.map((contender) => ({
        ...contender,
        receipt: contender.receipt
          ? { ...contender.receipt, proofMode: "DETERMINISTIC_DEMO" }
          : undefined,
      })),
    }],
  ])("rejects %s", (_name, payload) => {
    expect(isDemoProofResponse(payload)).toBe(false);
  });
});
