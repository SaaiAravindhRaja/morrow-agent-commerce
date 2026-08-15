import { decodePaymentSignatureHeader } from "@x402/core/http";

import { COMMITMENT_PRICE_ATOMIC, buildPaymentRequired, isEvmAddress } from "@/lib/commerce";
import { isLiveRailConfigured } from "@/lib/rail/clients";
import { settleAuthorization, verifyAuthorization } from "@/lib/rail/settlement";

const SKU = "commitment-fri-2000";
let slotWinner: string | undefined;

function resourceUrl(request: Request) {
  return new URL("/api/commit", request.url).toString();
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

function paymentTermsResponse(request: Request, merchantWallet: string) {
  const paymentRequired = buildPaymentRequired(merchantWallet, resourceUrl(request));
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

async function settleIfWinner(request: Request, merchantWallet: string) {
  const header = request.headers.get("PAYMENT-SIGNATURE");
  if (!header) return paymentTermsResponse(request, merchantWallet);

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
    const requirements = buildPaymentRequired(merchantWallet, resourceUrl(request)).accepts[0];
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
    if (slotWinner && slotWinner !== payer) {
      return jsonWithoutSignature(
        {
          code: "SLOT_UNAVAILABLE",
          sku: SKU,
          message: "Inventory already granted. Authorization was not settled.",
          proofMode: "live-fork",
        },
        409,
        "live-fork",
      );
    }

    if (slotWinner === payer) {
      return jsonWithoutSignature(
        {
          code: "ALREADY_SETTLED",
          sku: SKU,
          message: "This payer already holds the slot. Replay was not settled again.",
          proofMode: "live-fork",
        },
        409,
        "live-fork",
      );
    }

    slotWinner = payer;
    const settled = await settleAuthorization(payload, { requirements });
    if (!settled.success) {
      slotWinner = undefined;
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

    return jsonWithoutSignature(
      {
        code: "COMMITMENT_HELD",
        sku: SKU,
        proofMode: "live-fork",
        transaction: settled.transaction,
        payer: settled.payer,
        amountAtomic: COMMITMENT_PRICE_ATOMIC.toString(),
      },
      200,
      "live-fork",
    );
  } catch {
    return settlementNotEnabledResponse();
  }
}

export function GET(request: Request) {
  const merchantWallet = process.env.MERCHANT_WALLET_ADDRESS;

  if (!isEvmAddress(merchantWallet)) return unavailableResponse();
  return paymentTermsResponse(request, merchantWallet);
}

export async function POST(request: Request) {
  const merchantWallet = process.env.MERCHANT_WALLET_ADDRESS;
  if (!isEvmAddress(merchantWallet)) return unavailableResponse();

  if (!request.headers.get("PAYMENT-SIGNATURE")) {
    return paymentTermsResponse(request, merchantWallet);
  }

  if (!isLiveRailConfigured()) {
    return settlementNotEnabledResponse();
  }

  return settleIfWinner(request, merchantWallet);
}
