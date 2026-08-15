import { decodePaymentSignatureHeader } from "@x402/core/http";

import { buildPaymentRequired, isEvmAddress } from "@/lib/commerce";
import { recordSettlement } from "@/lib/commitments";
import { claimInventory, releaseInventory } from "@/lib/inventory";
import { COMMITMENT_POLICIES, type CommitmentPolicy } from "@/lib/policies";
import { isLiveRailConfigured } from "@/lib/rail/clients";
import { settleAuthorization, verifyAuthorization } from "@/lib/rail/settlement";

function policyForRequest(request: Request): CommitmentPolicy | undefined {
  const policyId = new URL(request.url).searchParams.get("policy");
  if (!policyId) return COMMITMENT_POLICIES[0];
  return COMMITMENT_POLICIES.find((policy) => policy.id === policyId && policy.status === "ACTIVE");
}

function resourceUrl(request: Request, policy: CommitmentPolicy) {
  const url = new URL("/api/commit", request.url);
  url.searchParams.set("policy", policy.id);
  return url.toString();
}

function proofModeLabel() {
  return isLiveRailConfigured() ? "live-fork" : "deterministic-demo";
}

function unavailableResponse() {
  return Response.json(
    {
      code: "LIVE_PAYMENT_NOT_CONFIGURED",
      message: "Set MERCHANT_WALLET_ADDRESS before requesting x402 payment terms.",
      proofMode: "deterministic-demo",
    },
    { status: 503 },
  );
}

function unknownPolicyResponse() {
  return Response.json(
    {
      code: "COMMITMENT_POLICY_NOT_FOUND",
      message: "No active commitment policy exists with that id.",
      policies: "/api/policies",
    },
    { status: 404, headers: { "Cache-Control": "no-store" } },
  );
}

function settlementNotEnabledResponse() {
  return Response.json(
    {
      code: "LIVE_SETTLEMENT_ADAPTER_NOT_ENABLED",
      message: "The preview never accepts or forwards payment authorizations.",
      safeToRetry: false,
      proofMode: "deterministic-demo",
    },
    {
      status: 501,
      headers: {
        "Cache-Control": "no-store",
        "X-MORROW-PROOF-MODE": "deterministic-demo",
      },
    },
  );
}

function paymentTermsResponse(request: Request, merchantWallet: string, policy: CommitmentPolicy) {
  const paymentRequired = buildPaymentRequired(merchantWallet, resourceUrl(request, policy), {
    amountAtomic: BigInt(policy.feeAtomic),
    description: `${policy.durationMinutes}-minute commitment for ${policy.item}; credited on exercise`,
  });
  const body = JSON.stringify(paymentRequired);
  const encoded = Buffer.from(body).toString("base64");

  return new Response(body, {
    status: 402,
    headers: {
      "Content-Type": "application/json",
      "PAYMENT-REQUIRED": encoded,
      "Cache-Control": "no-store",
      "X-MORROW-PROOF-MODE": proofModeLabel(),
    },
  });
}

function jsonWithoutSignature(
  body: Record<string, unknown>,
  status: number,
  mode: string,
) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-MORROW-PROOF-MODE": mode,
    },
  });
}

async function settleIfWinner(request: Request, merchantWallet: string, policy: CommitmentPolicy) {
  const header = request.headers.get("PAYMENT-SIGNATURE");
  if (!header) return paymentTermsResponse(request, merchantWallet, policy);

  let payload;
  try {
    payload = decodePaymentSignatureHeader(header);
  } catch {
    return jsonWithoutSignature(
      {
        code: "INVALID_PAYMENT_SIGNATURE",
        message: "PAYMENT-SIGNATURE is not a valid x402 payload.",
        proofMode: "live-fork",
      },
      400,
      "live-fork",
    );
  }

  try {
    const amountAtomic = BigInt(policy.feeAtomic);
    const requirements = buildPaymentRequired(merchantWallet, resourceUrl(request, policy), {
      amountAtomic,
      description: `${policy.durationMinutes}-minute commitment for ${policy.item}; credited on exercise`,
    }).accepts[0];
    const verified = await verifyAuthorization(payload, { requirements });
    if (!verified.isValid) {
      return jsonWithoutSignature(
        {
          code: "PAYMENT_NOT_VERIFIED",
          message: verified.invalidReason ?? "authorization failed verify",
          proofMode: "live-fork",
        },
        402,
        "live-fork",
      );
    }

    const payer = verified.payer ?? "";
    const claim = claimInventory(payer, policy.sku);
    if (claim === "lost") {
      return jsonWithoutSignature(
        {
          code: "SLOT_UNAVAILABLE",
          sku: policy.sku,
          message: "Inventory already granted. Authorization was not settled.",
          proofMode: "live-fork",
        },
        409,
        "live-fork",
      );
    }

    if (claim === "held") {
      return jsonWithoutSignature(
        {
          code: "ALREADY_SETTLED",
          sku: policy.sku,
          message: "This payer already holds the slot. Replay was not settled again.",
          proofMode: "live-fork",
        },
        409,
        "live-fork",
      );
    }

    const settled = await settleAuthorization(payload, { requirements });
    if (!settled.success) {
      releaseInventory(policy.sku);
      return jsonWithoutSignature(
        {
          code: "SETTLEMENT_FAILED",
          message: settled.errorReason ?? "settle failed",
          proofMode: "live-fork",
        },
        402,
        "live-fork",
      );
    }

    recordSettlement({
      id: policy.sku,
      sku: policy.sku,
      payer,
      amountAtomic,
      transaction: settled.transaction,
      durationSeconds: policy.durationMinutes * 60,
    });

    return jsonWithoutSignature(
      {
        code: "COMMITMENT_HELD",
        sku: policy.sku,
        proofMode: "live-fork",
        transaction: settled.transaction,
        payer: settled.payer,
        amountAtomic: amountAtomic.toString(),
        expiresInSeconds: policy.durationMinutes * 60,
        exercise: "/api/exercise",
      },
      200,
      "live-fork",
    );
  } catch (error) {
    return jsonWithoutSignature(liveSettlementErrorBody(error), 502, "live-fork");
  }
}

export function liveSettlementErrorBody(error: unknown) {
  const message = error instanceof Error && error.message ? error.message : "settlement failed";
  return {
    code: "SETTLEMENT_FAILED",
    message,
    proofMode: "live-fork",
  };
}

export function GET(request: Request) {
  const merchantWallet = process.env.MERCHANT_WALLET_ADDRESS;
  const policy = policyForRequest(request);

  if (!isEvmAddress(merchantWallet)) return unavailableResponse();
  if (!policy) return unknownPolicyResponse();
  return paymentTermsResponse(request, merchantWallet, policy);
}

export async function POST(request: Request) {
  const merchantWallet = process.env.MERCHANT_WALLET_ADDRESS;
  const policy = policyForRequest(request);
  if (!isEvmAddress(merchantWallet)) return unavailableResponse();
  if (!policy) return unknownPolicyResponse();

  if (!request.headers.get("PAYMENT-SIGNATURE")) {
    return paymentTermsResponse(request, merchantWallet, policy);
  }

  if (!isLiveRailConfigured()) {
    return settlementNotEnabledResponse();
  }

  return settleIfWinner(request, merchantWallet, policy);
}
