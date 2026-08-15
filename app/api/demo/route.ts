import { runProof } from "@/lib/rail/run-proof";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(await runProof());
}
