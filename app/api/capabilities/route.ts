import { COMMITMENT_PRICE_ATOMIC, XSGD, isEvmAddress } from "@/lib/commerce";

export const dynamic = "force-static";

export function GET() {
  const merchantWallet = process.env.MERCHANT_WALLET_ADDRESS;

  return Response.json({
    name: "Morrow merchant commitments",
    version: "0.1.0",
    description: "Time-boxed, paid commitments on scarce merchant inventory",
    proofMode: "deterministic-demo",
    paymentTermsConfigured: isEvmAddress(merchantWallet),
    liveSettlementEnabled: false,
    endpoints: {
      commitment: "/api/commit",
      demoProof: "/api/demo",
    },
    payment: {
      protocol: "x402-v2",
      scheme: "exact",
      network: XSGD.network,
      chainName: XSGD.chainName,
      asset: XSGD.address,
      decimals: XSGD.decimals,
      amount: COMMITMENT_PRICE_ATOMIC.toString(),
      authorization: "EIP-3009",
      eip712Domain: {
        name: XSGD.name,
        version: XSGD.eip712DomainVersion,
      },
    },
    policy: {
      durationSeconds: 600,
      refundable: false,
      creditOnExercise: COMMITMENT_PRICE_ATOMIC.toString(),
    },
  });
}
