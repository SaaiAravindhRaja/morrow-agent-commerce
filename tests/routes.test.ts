import { afterEach, describe, expect, it } from "vitest";

import { GET as getCapabilities } from "@/app/api/capabilities/route";
import { GET as getCommitment, POST as postCommitment } from "@/app/api/commit/route";

const ORIGINAL_MERCHANT_WALLET = process.env.MERCHANT_WALLET_ADDRESS;
const MERCHANT_WALLET = "0x1111111111111111111111111111111111111111";

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
});
