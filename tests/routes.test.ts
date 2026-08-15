import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { PaymentPayload, SettleResponse, VerifyResponse } from "@x402/core/types";

import { GET as getCapabilities } from "@/app/api/capabilities/route";
import {
  GET as getCommitment,
  POST as postCommitment,
  liveSettlementErrorBody,
  settleIfWinner,
  type LiveRailDependencies,
} from "@/app/api/commit/route";
import {
  exerciseCommitment,
  getCommitment as getStoredCommitment,
  resetCommitments,
} from "@/lib/commitments";
import { inventoryHolder, resetInventory } from "@/lib/inventory";
import { COMMITMENT_POLICIES } from "@/lib/policies";

const ORIGINAL_MERCHANT_WALLET = process.env.MERCHANT_WALLET_ADDRESS;
const MERCHANT_WALLET = "0x1111111111111111111111111111111111111111";
const PAYER = "0x2222222222222222222222222222222222222222";
const OTHER_PAYER = "0x3333333333333333333333333333333333333333";
const POLICY = COMMITMENT_POLICIES[0];
const TRANSACTION = `0x${"a".repeat(64)}`;
const PAYMENT_PAYLOAD = {
  x402Version: 2,
  accepted: {} as PaymentPayload["accepted"],
  payload: {},
} satisfies PaymentPayload;

function signedRequest(signature = "private-payment-authorization") {
  return new Request(`https://morrow.example/api/commit?policy=${POLICY.id}`, {
    method: "POST",
    headers: { "PAYMENT-SIGNATURE": signature },
  });
}

function validVerification(payer = PAYER): VerifyResponse {
  return { isValid: true, payer };
}

function settlementResult(overrides: Partial<SettleResponse> = {}): SettleResponse {
  return {
    success: true,
    payer: PAYER,
    transaction: TRANSACTION,
    network: "eip155:43114",
    ...overrides,
  };
}

function liveDependencies(options?: {
  decode?: LiveRailDependencies["decodePaymentSignatureHeader"];
  verify?: LiveRailDependencies["verifyAuthorization"];
  settle?: LiveRailDependencies["settleAuthorization"];
}) {
  const state = { settleCalls: 0 };
  const dependencies: LiveRailDependencies = {
    decodePaymentSignatureHeader: options?.decode ?? (() => PAYMENT_PAYLOAD),
    verifyAuthorization: options?.verify ?? (async () => validVerification()),
    settleAuthorization: async (...args) => {
      state.settleCalls += 1;
      return options?.settle
        ? options.settle(...args)
        : settlementResult();
    },
  };
  return { dependencies, state };
}

beforeEach(() => {
  resetCommitments();
  resetInventory(POLICY.sku);
});

afterEach(() => {
  if (ORIGINAL_MERCHANT_WALLET === undefined) {
    delete process.env.MERCHANT_WALLET_ADDRESS;
  } else {
    process.env.MERCHANT_WALLET_ADDRESS = ORIGINAL_MERCHANT_WALLET;
  }
});

describe("merchant capability route", () => {
  it("separates payment terms from live settlement readiness", async () => {
    process.env.MERCHANT_WALLET_ADDRESS = MERCHANT_WALLET;

    const response = getCapabilities();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      proofMode: "deterministic-demo",
      paymentTermsConfigured: true,
      liveSettlementEnabled: false,
      endpoints: {
        commitment: "/api/commit",
        exercise: "/api/exercise",
        demoProof: "/api/demo",
      },
      payment: {
        network: "eip155:43114",
        amount: "200000",
        eip712Domain: { name: "XSGD", version: "2" },
      },
    });
  });
});

describe("x402 commitment route", () => {
  it("returns 503 when no valid merchant recipient is configured", async () => {
    process.env.MERCHANT_WALLET_ADDRESS = "not-an-address";

    const response = getCommitment(new Request("https://morrow.example/api/commit"));
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.code).toBe("LIVE_PAYMENT_NOT_CONFIGURED");
  });

  it("returns honest x402 terms with matching header and body", async () => {
    process.env.MERCHANT_WALLET_ADDRESS = MERCHANT_WALLET;

    const response = getCommitment(new Request("https://morrow.example/api/commit"));
    const body = await response.json();
    const encoded = response.headers.get("PAYMENT-REQUIRED");

    expect(response.status).toBe(402);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(response.headers.get("X-MORROW-PROOF-MODE")).toBe("deterministic-demo");
    expect(encoded).not.toBeNull();
    expect(JSON.parse(Buffer.from(encoded!, "base64").toString("utf8"))).toEqual(body);
    expect(body.accepts[0].extra).toEqual({
      assetTransferMethod: "permit2",
      name: "XSGD",
      version: "2",
    });
  });

  it("compiles each active merchant policy into matching payment terms", async () => {
    process.env.MERCHANT_WALLET_ADDRESS = MERCHANT_WALLET;

    const response = getCommitment(
      new Request("https://morrow.example/api/commit?policy=policy-counter-1930"),
    );
    const body = await response.json();

    expect(response.status).toBe(402);
    expect(body.resource.url).toBe(
      "https://morrow.example/api/commit?policy=policy-counter-1930",
    );
    expect(body.resource.description).toContain("Chef's counter");
    expect(body.accepts[0].amount).toBe("500000");
  });

  it("rejects unknown or inactive policy ids", async () => {
    process.env.MERCHANT_WALLET_ADDRESS = MERCHANT_WALLET;

    const response = getCommitment(
      new Request("https://morrow.example/api/commit?policy=policy-missing"),
    );
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.code).toBe("COMMITMENT_POLICY_NOT_FOUND");
  });

  it("rejects payment signatures without accepting or echoing them", async () => {
    process.env.MERCHANT_WALLET_ADDRESS = MERCHANT_WALLET;
    const signature = "sensitive-payment-authorization";

    const response = await postCommitment(
      new Request("https://morrow.example/api/commit", {
        method: "POST",
        headers: { "PAYMENT-SIGNATURE": signature },
      }),
    );
    const serializedBody = await response.text();

    expect(response.status).toBe(501);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(response.headers.get("X-MORROW-PROOF-MODE")).toBe("deterministic-demo");
    expect(serializedBody).toContain("LIVE_SETTLEMENT_ADAPTER_NOT_ENABLED");
    expect(serializedBody).not.toContain(signature);
  });

  it("keeps uncertain settlement details private and prevents automatic retries", () => {
    const body = liveSettlementErrorBody(new Error("facilitator timed out"));
    expect(body).toEqual({
      code: "SETTLEMENT_PENDING_REVIEW",
      message:
        "Settlement status could not be confirmed. The commitment remains locked for review and will not be retried automatically.",
      proofMode: "live-fork",
      safeToRetry: false,
    });
    expect(JSON.stringify(body)).not.toContain("facilitator timed out");
  });

  it("fails closed when verification throws without locking inventory", async () => {
    const { dependencies, state } = liveDependencies({
      verify: async () => {
        throw new Error("private facilitator detail");
      },
    });

    const response = await settleIfWinner(signedRequest(), MERCHANT_WALLET, POLICY, dependencies);
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body).toMatchObject({ code: "PAYMENT_VERIFICATION_UNAVAILABLE", safeToRetry: false });
    expect(JSON.stringify(body)).not.toContain("private facilitator detail");
    expect(getStoredCommitment(POLICY.sku)).toBeUndefined();
    expect(inventoryHolder(POLICY.sku)).toBeUndefined();
    expect(state.settleCalls).toBe(0);
  });

  it("rejects invalid verification and malformed verified payers before claiming inventory", async () => {
    const cases: Array<{ name: string; verification: VerifyResponse; code: string; status: number }> = [
      {
        name: "invalid authorization",
        verification: { isValid: false, invalidReason: "private reason" },
        code: "PAYMENT_NOT_VERIFIED",
        status: 402,
      },
      {
        name: "malformed payer",
        verification: validVerification("not-an-address"),
        code: "PAYMENT_PAYER_MISSING",
        status: 422,
      },
    ];

    for (const testCase of cases) {
      const { dependencies, state } = liveDependencies({
        verify: async () => testCase.verification,
      });
      const response = await settleIfWinner(
        signedRequest(`${testCase.name}-signature`),
        MERCHANT_WALLET,
        POLICY,
        dependencies,
      );
      const body = await response.json();

      expect(response.status, testCase.name).toBe(testCase.status);
      expect(body, testCase.name).toMatchObject({ code: testCase.code, safeToRetry: false });
      expect(JSON.stringify(body), testCase.name).not.toContain("private reason");
      expect(getStoredCommitment(POLICY.sku), testCase.name).toBeUndefined();
      expect(inventoryHolder(POLICY.sku), testCase.name).toBeUndefined();
      expect(state.settleCalls, testCase.name).toBe(0);
    }
  });

  it("keeps unsuccessful settlement pending with a safe correlation fingerprint", async () => {
    const signature = "authorization-that-must-not-be-stored-or-returned";
    const { dependencies, state } = liveDependencies({
      settle: async () => {
        expect(getStoredCommitment(POLICY.sku)).toMatchObject({
          payer: PAYER,
          status: "PENDING",
          network: "eip155:43114",
        });
        expect(getStoredCommitment(POLICY.sku)?.authorizationFingerprint).toMatch(
          /^0x[a-f0-9]{64}$/,
        );
        return settlementResult({
          success: false,
          transaction: "",
          errorReason: "private downstream error",
        });
      },
    });

    const response = await settleIfWinner(
      signedRequest(signature),
      MERCHANT_WALLET,
      POLICY,
      dependencies,
    );
    const body = await response.json();
    const pending = getStoredCommitment(POLICY.sku);

    expect(response.status).toBe(502);
    expect(body).toMatchObject({ code: "SETTLEMENT_PENDING_REVIEW", safeToRetry: false });
    expect(JSON.stringify(body)).not.toContain(signature);
    expect(JSON.stringify(body)).not.toContain("private downstream error");
    expect(pending).toMatchObject({
      payer: PAYER,
      status: "PENDING",
      network: "eip155:43114",
    });
    expect(pending?.transaction).toBeUndefined();
    expect(pending?.authorizationFingerprint).toMatch(/^0x[a-f0-9]{64}$/);
    expect(pending?.authorizationFingerprint).not.toContain(signature);
    expect(inventoryHolder(POLICY.sku)).toBe(PAYER);

    const replay = await settleIfWinner(
      signedRequest(signature),
      MERCHANT_WALLET,
      POLICY,
      dependencies,
    );
    expect(replay.status).toBe(409);
    expect(await replay.json()).toMatchObject({
      code: "COMMITMENT_PENDING_REVIEW",
      safeToRetry: false,
    });
    expect(state.settleCalls).toBe(1);
  });

  it("keeps a non-empty failed settlement transaction for reconciliation", async () => {
    const failedTransaction = `0x${"b".repeat(64)}`;
    const { dependencies } = liveDependencies({
      settle: async () =>
        settlementResult({
          success: false,
          transaction: failedTransaction,
          errorReason: "receipt status unknown",
        }),
    });

    const response = await settleIfWinner(signedRequest(), MERCHANT_WALLET, POLICY, dependencies);

    expect(response.status).toBe(502);
    expect(getStoredCommitment(POLICY.sku)).toMatchObject({
      status: "PENDING",
      transaction: failedTransaction,
      network: "eip155:43114",
    });
  });

  it("keeps inventory locked when settlement throws", async () => {
    const { dependencies } = liveDependencies({
      settle: async () => {
        throw new Error("rpc disconnected after broadcast");
      },
    });

    const response = await settleIfWinner(signedRequest(), MERCHANT_WALLET, POLICY, dependencies);
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body).toMatchObject({ code: "SETTLEMENT_PENDING_REVIEW", safeToRetry: false });
    expect(JSON.stringify(body)).not.toContain("rpc disconnected");
    expect(getStoredCommitment(POLICY.sku)).toMatchObject({ status: "PENDING", payer: PAYER });
    expect(inventoryHolder(POLICY.sku)).toBe(PAYER);

    const otherDependencies = liveDependencies({
      verify: async () => validVerification(OTHER_PAYER),
    });
    const blocked = await settleIfWinner(
      signedRequest("other-payer-authorization"),
      MERCHANT_WALLET,
      POLICY,
      otherDependencies.dependencies,
    );
    expect(blocked.status).toBe(409);
    expect(await blocked.json()).toMatchObject({ code: "SLOT_UNAVAILABLE" });
    expect(otherDependencies.state.settleCalls).toBe(0);
  });

  it("returns the stored successful outcome on replay without settling twice", async () => {
    const { dependencies, state } = liveDependencies();

    const first = await settleIfWinner(signedRequest(), MERCHANT_WALLET, POLICY, dependencies);
    expect(first.status).toBe(200);
    expect(await first.json()).toMatchObject({
      code: "COMMITMENT_HELD",
      commitmentStatus: "SETTLED",
      outcome: "HELD",
      transaction: TRANSACTION,
      idempotent: false,
    });

    const replay = await settleIfWinner(signedRequest(), MERCHANT_WALLET, POLICY, dependencies);
    expect(replay.status).toBe(200);
    expect(await replay.json()).toMatchObject({
      code: "COMMITMENT_HELD",
      commitmentStatus: "SETTLED",
      outcome: "HELD",
      transaction: TRANSACTION,
      idempotent: true,
    });
    expect(state.settleCalls).toBe(1);

    const exercised = exerciseCommitment(POLICY.sku);
    expect(exercised.ok).toBe(true);
    const exercisedReplay = await settleIfWinner(
      signedRequest(),
      MERCHANT_WALLET,
      POLICY,
      dependencies,
    );
    expect(exercisedReplay.status).toBe(200);
    expect(await exercisedReplay.json()).toMatchObject({
      code: "COMMITMENT_HELD",
      commitmentStatus: "EXERCISED",
      outcome: "EXERCISED",
      bookingId: exercised.ok ? exercised.booking.bookingId : undefined,
      idempotent: true,
    });
    expect(state.settleCalls).toBe(1);
  });
});
