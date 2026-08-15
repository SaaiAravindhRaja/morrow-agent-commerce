import { describe, expect, it } from "vitest";

import { decisionPrompt, parseDecision } from "@/lib/atlas-decide";

describe("atlas model decision", () => {
  it("reads a pay decision out of messy model text", () => {
    const decision = parseDecision('Sure.\n{"pay":true,"reason":"0.20 is under 1.00"}');
    expect(decision).toEqual({ pay: true, reason: "0.20 is under 1.00" });
  });

  it("reads a decline", () => {
    const decision = parseDecision('{"pay":false,"reason":"0.20 exceeds the 0.05 budget"}');
    expect(decision.pay).toBe(false);
  });

  it("tells the model to refuse when price exceeds budget", () => {
    const prompt = decisionPrompt("hold a table", "0.05", "0.20");
    expect(prompt).toContain("0.05");
    expect(prompt).toContain("0.20");
    expect(prompt).toContain("less than or equal");
  });
});
