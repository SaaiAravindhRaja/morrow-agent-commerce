import { afterEach, describe, expect, it } from "vitest";

import { mainnetSettlementNotice, readMainnetSettlementTx } from "@/lib/commerce";

const original = process.env.MAINNET_SETTLEMENT_TX;

afterEach(() => {
  if (original === undefined) delete process.env.MAINNET_SETTLEMENT_TX;
  else process.env.MAINNET_SETTLEMENT_TX = original;
});

describe("mainnet settlement notice", () => {
  it("renders nothing when MAINNET_SETTLEMENT_TX is unset", () => {
    delete process.env.MAINNET_SETTLEMENT_TX;
    expect(readMainnetSettlementTx()).toBeUndefined();
    expect(mainnetSettlementNotice()).toBeUndefined();
  });

  it("renders nothing for a placeholder or short value", () => {
    process.env.MAINNET_SETTLEMENT_TX = "coming-soon";
    expect(mainnetSettlementNotice()).toBeUndefined();
    process.env.MAINNET_SETTLEMENT_TX = "0xabc";
    expect(mainnetSettlementNotice()).toBeUndefined();
  });

  it("names a real hash as a settlement, not an approve", () => {
    const hash = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
    process.env.MAINNET_SETTLEMENT_TX = hash;
    const notice = mainnetSettlementNotice();
    expect(notice).toBe(`Settled 0.20 XSGD on Avalanche C-Chain mainnet. Tx ${hash}.`);
    expect(notice).not.toMatch(/approve/i);
  });
});
