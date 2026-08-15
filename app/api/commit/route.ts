import { decodePaymentSignatureHeader } from "@x402/core/http";
import type { PaymentPayload, PaymentRequirements, SettleResponse, VerifyResponse } from "@x402/core/types";
import { keccak256, toBytes } from "viem";

import { buildPaymentRequired, isEvmAddress } from "@/lib/commerce";
import {
  getCommitment,
  recordSettlement,
  rememberUnsettled,
  type Commitment,
} from "@/lib/commitments";
import { claimInventory } from "@/lib/inventory";
import { COMMITMENT_POLICIES, type CommitmentPolicy } from "@/lib/policies";
import { isLiveRailConfigured } from "@/lib/rail/clients";
import { settleAuthorization, verifyAuthorization } from "@/lib/rail/settlement";

const LIVE_FORK_PROOF_MODE = "live-fork";

export type LiveRailDependencies = {
  decodePaymentSignatureHeader: (header: string) => PaymentPayload;
  verifyAuthorization: (
    payload: PaymentPayload,
    options: { requirements: PaymentRequirements },
  ) => Promise<VerifyResponse>;
  settleAuthorization: (
    payload: PaymentPayload,
    options: { requirements: PaymentRequirements },
  ) => Promise<SettleResponse>;
};

const liveRailDependencies: LiveRailDependencies = {
  decodePaymentSignatureHeader,
  verifyAuthorization,
  settleAuthorization,
};

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
  return isLiveRailConfigured() ? LIVE_FORK_PROOF_MODE : "deterministic-demo";
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

function buildPolicyPaymentRequired(
  request: Request,
  merchantWallet: string,
  policy: CommitmentPolicy,
) {
  return buildPaymentRequired(merchantWallet, resourceUrl(request, policy), {
    amountAtomic: BigInt(policy.feeAtomic),
    description: `${policy.durationMinutes}-minute commitment for ${policy.item}; credited on exercise`,
  });
}

function paymentTermsResponse(request: Request, merchantWallet: string, policy: CommitmentPolicy) {
  const paymentRequired = buildPolicyPaymentRequired(request, merchantWallet, policy);
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

function liveRailJson(body: Record<string, unknown>, status: number) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-MORROW-PROOF-MODE": LIVE_FORK_PROOF_MODE,
    },
  });
}

function authorizationFingerprint(header: string) {
  return keccak256(toBytes(header));
}

function commitmentHeldBody(
  commitment: Commitment,
  policy: CommitmentPolicy,
  idempotent: boolean,
) {
  return {
    code: "COMMITMENT_HELD",
    sku: policy.sku,
    proofMode: LIVE_FORK_PROOF_MODE,
    commitmentStatus: commitment.status,
    outcome: commitment.status === "EXERCISED" ? "EXERCISED" : "HELD",
    transaction: commitment.transaction,
    payer: commitment.payer,
    amountAtomic: commitment.amountAtomic.toString(),
    expiresAt: commitment.expiresAt,
    bookingId: commitment.bookingId,
    exercise: commitment.status === "SETTLED" ? "/api/exercise" : undefined,
    idempotent,
  };
}

export async function settleIfWinner(
  request: Request,
  merchantWallet: string,
  policy: CommitmentPolicy,
  dependencies: LiveRailDependencies = liveRailDependencies,
) {
  const header = request.headers.get("PAYMENT-SIGNATURE");
  if (!header) return paymentTermsResponse(request, merchantWallet, policy);

  let payload;
  try {
    payload = dependencies.decodePaymentSignatureHeader(header);
  } catch {
    return liveRailJson(
      {
        code: "INVALID_PAYMENT_SIGNATURE",
        message: "PAYMENT-SIGNATURE is not a valid x402 payload.",
        proofMode: LIVE_FORK_PROOF_MODE,
      },
      400,
    );
  }

  const amountAtomic = BigInt(policy.feeAtomic);
  const requirements = buildPolicyPaymentRequired(request, merchantWallet, policy).accepts[0];

  let verified;
  try {
    verified = await dependencies.verifyAuthorization(payload, { requirements });
  } catch {
    return liveRailJson(
      {
        code: "PAYMENT_VERIFICATION_UNAVAILABLE",
        message: "Payment verification could not be completed. Do not retry this authorization automatically.",
        proofMode: LIVE_FORK_PROOF_MODE,
        safeToRetry: false,
      },
      502,
    );
  }

  if (!verified.isValid) {
    return liveRailJson(
      {
        code: "PAYMENT_NOT_VERIFIED",
        message: "The payment authorization did not pass verification.",
        proofMode: LIVE_FORK_PROOF_MODE,
        safeToRetry: false,
      },
      402,
    );
  }

  const payer = verified.payer ?? "";
  if (!isEvmAddress(payer)) {
    return liveRailJson(
      {
        code: "PAYMENT_PAYER_MISSING",
        message: "The verified authorization did not identify a valid payer.",
        proofMode: LIVE_FORK_PROOF_MODE,
        safeToRetry: false,
      },
      422,
    );
  }

  const claim = claimInventory(payer, policy.sku);
  if (claim === "lost") {
    return liveRailJson(
      {
        code: "SLOT_UNAVAILABLE",
        sku: policy.sku,
        message: "Inventory already granted. Authorization was not settled.",
        proofMode: LIVE_FORK_PROOF_MODE,
      },
      409,
    );
  }

  if (claim === "held") {
    const existing = getCommitment(policy.sku);
    if (
      existing &&
      existing.payer.toLowerCase() === payer.toLowerCase() &&
      (existing.status === "SETTLED" || existing.status === "EXERCISED")
    ) {
      return liveRailJson(commitmentHeldBody(existing, policy, true), 200);
    }

    if (existing?.status === "EXPIRED") {
      return liveRailJson(
        {
          code: "COMMITMENT_EXPIRED",
          sku: policy.sku,
          message: "This commitment has expired and cannot be settled again.",
          proofMode: LIVE_FORK_PROOF_MODE,
          safeToRetry: false,
        },
        410,
      );
    }

    return liveRailJson(
      {
        code: existing?.status === "PENDING" ? "COMMITMENT_PENDING_REVIEW" : "COMMITMENT_STATE_UNAVAILABLE",
        sku: policy.sku,
        message:
          existing?.status === "PENDING"
            ? "This authorization is already pending review. Replay was not settled again."
            : "This payer already holds the slot, but its commitment outcome is unavailable.",
        proofMode: LIVE_FORK_PROOF_MODE,
        safeToRetry: false,
      },
      409,
    );
  }

  const fingerprint = authorizationFingerprint(header);
  rememberUnsettled({
    id: policy.sku,
    sku: policy.sku,
    payer,
    amountAtomic,
    authorizationFingerprint: fingerprint,
    network: requirements.network,
  });

  try {
    const settled = await dependencies.settleAuthorization(payload, { requirements });
    if (!settled.success) {
      rememberUnsettled({
        id: policy.sku,
        sku: policy.sku,
        payer,
        amountAtomic,
        authorizationFingerprint: fingerprint,
        network: settled.network,
        transaction: settled.transaction.trim() || undefined,
      });
      return liveRailJson(liveSettlementErrorBody(settled.errorReason), 502);
    }

    const commitment = recordSettlement({
      id: policy.sku,
      sku: policy.sku,
      payer,
      amountAtomic,
      transaction: settled.transaction,
      authorizationFingerprint: fingerprint,
      network: settled.network,
      durationSeconds: policy.durationMinutes * 60,
    });

    return liveRailJson(commitmentHeldBody(commitment, policy, false), 200);
  } catch (error) {
    return liveRailJson(liveSettlementErrorBody(error), 502);
  }
}

export function liveSettlementErrorBody(error: unknown) {
  void error;
  return {
    code: "SETTLEMENT_PENDING_REVIEW",
    message:
      "Settlement status could not be confirmed. The commitment remains locked for review and will not be retried automatically.",
    proofMode: LIVE_FORK_PROOF_MODE,
    safeToRetry: false,
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
