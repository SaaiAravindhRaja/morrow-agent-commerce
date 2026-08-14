import { buildDemoProof } from "@/lib/commerce";

export const dynamic = "force-static";

export function GET() {
  const contenders = buildDemoProof().map((contender) => ({
    ...contender,
    chargedAtomic: contender.chargedAtomic.toString(),
  }));

  return Response.json({
    proofMode: "DETERMINISTIC_DEMO",
    disclaimer: "No on-chain payment was broadcast by this preview.",
    invariant: "exactly one settlement; losing authorization discarded before settlement",
    contenders,
  });
}
