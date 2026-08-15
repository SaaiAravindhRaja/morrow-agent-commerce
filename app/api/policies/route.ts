import { COMMITMENT_POLICIES, compilePolicy } from "@/lib/policies";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({
    merchant: "Atlas Bistro",
    generatedAt: new Date().toISOString(),
    policies: COMMITMENT_POLICIES.filter((policy) => policy.status === "ACTIVE").map((policy) => ({
      name: policy.name,
      item: policy.item,
      terms: policy.terms,
      ...compilePolicy(policy),
    })),
  });
}
