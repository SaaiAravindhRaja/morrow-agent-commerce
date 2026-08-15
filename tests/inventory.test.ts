import { describe, expect, it } from "vitest";

import { claimInventory, resetInventory } from "@/lib/inventory";

describe("inventory lock", () => {
  it("lets the first arrival win and rejects the second", () => {
    resetInventory();
    const first = claimInventory("0x1111111111111111111111111111111111111111");
    const second = claimInventory("0x2222222222222222222222222222222222222222");

    expect(first).toBe("won");
    expect(second).toBe("lost");
  });

  it("changes the winner when arrival order is swapped", () => {
    resetInventory();
    expect(claimInventory("0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")).toBe("won");
    expect(claimInventory("0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb")).toBe("lost");

    resetInventory();
    expect(claimInventory("0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb")).toBe("won");
    expect(claimInventory("0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")).toBe("lost");
  });

  it("settles exactly one of two concurrent claims", async () => {
    resetInventory();
    const payers = [
      "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    ];

    const results = await Promise.all(payers.map((payer) => Promise.resolve(claimInventory(payer))));

    expect(results.filter((result) => result === "won")).toHaveLength(1);
    expect(results.filter((result) => result === "lost")).toHaveLength(1);
  });
});
