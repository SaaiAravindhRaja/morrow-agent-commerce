import { buildPaymentRequired, isEvmAddress } from "@/lib/commerce";

function resourceUrl(request: Request) {
  return new URL("/api/commit", request.url).toString();
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
      "X-MORROW-PROOF-MODE": "deterministic-demo",
    },
  });
}

export function GET(request: Request) {
  const merchantWallet = process.env.MERCHANT_WALLET_ADDRESS;

  if (!isEvmAddress(merchantWallet)) return unavailableResponse();
  return paymentTermsResponse(request, merchantWallet);
}

export function POST(request: Request) {
  const merchantWallet = process.env.MERCHANT_WALLET_ADDRESS;
  if (!isEvmAddress(merchantWallet)) return unavailableResponse();

  if (!request.headers.get("PAYMENT-SIGNATURE")) {
    return paymentTermsResponse(request, merchantWallet);
  }

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
