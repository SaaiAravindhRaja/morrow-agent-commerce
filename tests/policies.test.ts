import { describe, expect, it } from "vitest";

import { GET as getPolicies } from "@/app/api/policies/route";
import {
  COMMITMENT_POLICIES,
  DEFAULT_POLICY_DRAFT,
  compilePolicy,
  parseSgdToAtomic,
  policyFromDraft,
  policyValidationErrors,
} from "@/lib/policies";

describe("merchant policy compiler", () => {
  it("converts SGD into XSGD atomic units without floating point arithmetic", () => {
    expect(parseSgdToAtomic("0.20")).toBe(200_000n);
    expect(parseSgdToAtomic("2.5")).toBe(2_500_000n);
    expect(() => parseSgdToAtomic("0")).toThrow();
    expect(() => parseSgdToAtomic("1.001")).toThrow();
  });

  it("compiles one merchant policy into inventory, allocation, payment, and exercise terms", () => {
    const compiled = compilePolicy(COMMITMENT_POLICIES[0]);

    expect(compiled).toMatchObject({
      status: "active",
      inventory: { capacity: 8, available: 1 },
      allocation: { rule: "first_verified", decisionBeforeSettlement: true },
      commitment: {
        amount: "200000",
        durationSeconds: 600,
        refundableOnExpiry: false,
        creditOnExercise: "200000",
      },
      payment: {
        protocol: "x402-v2",
        network: "eip155:43114",
        symbol: "XSGD",
        authorization: "Permit2",
      },
    });
  });

  it("validates and publishes a complete draft", () => {
    expect(policyValidationErrors(DEFAULT_POLICY_DRAFT)).toEqual([]);
    expect(policyFromDraft(DEFAULT_POLICY_DRAFT, "policy-test")).toMatchObject({
      id: "policy-test",
      status: "ACTIVE",
      feeAtomic: "200000",
    });
  });
});

describe("GET /api/policies", () => {
  it("only exposes active machine-readable offers", async () => {
    const response = getPolicies();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.policies).toHaveLength(2);
    expect(body.policies.every((policy: { status: string }) => policy.status === "active")).toBe(true);
  });
});
