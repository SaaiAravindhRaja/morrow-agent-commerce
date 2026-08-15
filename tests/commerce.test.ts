import { describe, expect, it } from "vitest";

import {
  COMMITMENT_PRICE_ATOMIC,
  XSGD,
  buildDemoProof,
  buildPaymentRequired,
  contenderResult,
  contenderStatus,
  formatXsgd,
  isEvmAddress,
  MAINNET_APPROVE_TX,
  containsLoopback,
  proofModeDisclaimer,
  viewerFacingNote,
} from "@/lib/commerce";

describe("XSGD payment contract", () => {
  it("prices the commitment at exactly S$0.20 using six decimals", () => {
    expect(COMMITMENT_PRICE_ATOMIC).toBe(200_000n);
    expect(formatXsgd(COMMITMENT_PRICE_ATOMIC)).toBe("0.20 XSGD");
  });

  it("builds x402 v2 requirements for XSGD on Avalanche C-Chain mainnet", () => {
    const required = buildPaymentRequired(
      "0x1111111111111111111111111111111111111111",
      "https://merchant.example/api/commit",
    );

    expect(required.x402Version).toBe(2);
    expect(required.accepts).toHaveLength(1);
    expect(required.accepts[0]).toMatchObject({
      scheme: "exact",
      network: "eip155:43114",
      amount: "200000",
      asset: XSGD.address,
      payTo: "0x1111111111111111111111111111111111111111",
      extra: {
        assetTransferMethod: "permit2",
        name: "XSGD",
        version: "2",
      },
    });
  });

  it("describes the two proof modes in plain words", () => {
    expect(proofModeDisclaimer("LIVE_FORK")).toContain("local Avalanche mainnet fork");
    expect(proofModeDisclaimer("DETERMINISTIC_DEMO")).toContain("deterministic simulation");
  });

  it("never puts loopback hosts in the viewer-facing fallback note", () => {
    const note = viewerFacingNote("DETERMINISTIC_DEMO", "LIVE_PATH_UNAVAILABLE");
    expect(note).toBeDefined();
    expect(containsLoopback(note ?? "")).toBe(false);
    expect(note).toContain(MAINNET_APPROVE_TX);
    expect(containsLoopback(proofModeDisclaimer("DETERMINISTIC_DEMO"))).toBe(false);
  });

  it("rejects the zero address as a merchant recipient", () => {
    expect(isEvmAddress("0x0000000000000000000000000000000000000000")).toBe(false);
    expect(() =>
      buildPaymentRequired(
        "0x0000000000000000000000000000000000000000",
        "https://merchant.example/api/commit",
      ),
    ).toThrow("A valid merchant EVM address is required");
  });
});

describe("deterministic proof", () => {
  it("settles exactly one contender and charges the loser zero", () => {
    const proof = buildDemoProof();

    expect(proof.filter((contender) => contender.settled)).toHaveLength(1);
    expect(proof.find((contender) => contender.id === "agent-b")).toMatchObject({
      settled: false,
      chargedAtomic: 0n,
      status: "SLOT_UNAVAILABLE",
    });
  });

  it("binds the winner receipt to the commitment and later booking", () => {
    const proof = buildDemoProof();
    const winner = proof.find((contender) => contender.settled);

    expect(winner?.receipt).toMatchObject({
      commitmentId: "commitment-fri-2000",
      amountAtomic: "200000",
      network: "eip155:43114",
      status: "EXERCISED",
      creditAtomic: "200000",
    });
  });

  it("does not show payment authorization before that phase", () => {
    expect(contenderStatus(0, "winner")).toBe("INVENTORY DISCOVERED");
    expect(contenderStatus(1, "loser")).toBe("TERMS ACCEPTED");
    expect(contenderStatus(2, "winner")).toBe("AUTHORIZATION READY");
    expect(contenderStatus(3, "winner")).toBe("INVENTORY WON");
    expect(contenderStatus(3, "loser")).toBe("SLOT UNAVAILABLE");
    expect(contenderStatus(4, "winner")).toBe("SETTLED · 0.20 XSGD");
    expect(contenderStatus(5, "winner")).toBe("EXERCISED · CREDITED");
    expect(contenderResult(2, "winner")).toBe("WAITING");
    expect(contenderResult(3, "winner")).toBe("WINNER");
    expect(contenderResult(3, "loser")).toBe("S$0");
  });
});
