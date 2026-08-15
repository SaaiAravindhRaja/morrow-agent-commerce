import { describe, expect, it } from "vitest";

import {
  SETTLEMENT_AMOUNT_ATOMIC,
  evaluateGuards,
  parseSettleArgs,
  redactSecrets,
  resolveRecipient,
  type ChainSnapshot,
} from "@/lib/rail/mainnet-guard";

const healthy: ChainSnapshot = {
  chainId: 43114,
  amountAtomic: SETTLEMENT_AMOUNT_ATOMIC,
  payerXsgdAtomic: 30_000_000n,
  permit2Allowance: 2n ** 256n - 1n,
  avaxWei: 10n ** 17n,
};

const realTo = "0x22F2BD6f2c2289FA42429A8487D391f07feFe54A";

describe("parseSettleArgs", () => {
  it("is a dry run by default", () => {
    expect(parseSettleArgs(["--to=" + realTo])).toMatchObject({
      dryRun: true,
      confirmRealMoney: false,
    });
  });

  it("still dry-runs when both flags are passed", () => {
    expect(parseSettleArgs(["--to=" + realTo, "--yes-real-money", "--dry-run"]).dryRun).toBe(true);
  });
});

describe("evaluateGuards", () => {
  it("accepts a dry run against a healthy chain", () => {
    expect(evaluateGuards({ dryRun: true, confirmRealMoney: false, recipient: realTo }, healthy)).toEqual({
      ok: true,
    });
  });

  it("refuses the wrong chain", () => {
    const result = evaluateGuards(
      { dryRun: true, confirmRealMoney: false, recipient: realTo },
      { ...healthy, chainId: 1 },
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("WRONG_CHAIN");
  });

  it("refuses any amount other than 200000", () => {
    const result = evaluateGuards(
      { dryRun: true, confirmRealMoney: false, recipient: realTo },
      { ...healthy, amountAtomic: 200_000_000_000_000_000n },
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("WRONG_AMOUNT");
  });

  it("refuses to send without --yes-real-money", () => {
    const result = evaluateGuards(
      { dryRun: false, confirmRealMoney: false, recipient: realTo },
      healthy,
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("MISSING_CONFIRM");
  });

  it("refuses a missing or invalid recipient", () => {
    expect(resolveRecipient(undefined).ok).toBe(false);
    expect(resolveRecipient("not-an-address").ok).toBe(false);
    const missing = evaluateGuards({ dryRun: true, confirmRealMoney: false, recipient: undefined }, healthy);
    expect(missing.ok).toBe(false);
    if (missing.ok) return;
    expect(missing.code).toBe("BAD_RECIPIENT");
  });

  it("refuses Anvil test recipients", () => {
    const result = evaluateGuards(
      {
        dryRun: true,
        confirmRealMoney: false,
        recipient: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      },
      healthy,
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("ANVIL_RECIPIENT");
  });

  it("refuses when Permit2 allowance is too low", () => {
    const result = evaluateGuards(
      { dryRun: true, confirmRealMoney: false, recipient: realTo },
      { ...healthy, permit2Allowance: 0n },
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("INSUFFICIENT_ALLOWANCE");
  });

  it("refuses when payer XSGD is below 200000", () => {
    const result = evaluateGuards(
      { dryRun: true, confirmRealMoney: false, recipient: realTo },
      { ...healthy, payerXsgdAtomic: 199_999n },
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("INSUFFICIENT_XSGD");
  });

  it("refuses when payer AVAX is 0", () => {
    const result = evaluateGuards(
      { dryRun: true, confirmRealMoney: false, recipient: realTo },
      { ...healthy, avaxWei: 0n },
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("INSUFFICIENT_AVAX");
  });
});

describe("redactSecrets", () => {
  it("strips 32-byte hex so keys cannot leak through errors", () => {
    const redacted = redactSecrets("failed 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
    expect(redacted).toBe("failed [redacted-hex]");
    expect(redacted).not.toMatch(/0x[a-fA-F0-9]{64}/);
  });
});
