import { exerciseCommitment } from "@/lib/commitments";

export const dynamic = "force-dynamic";

const STATUS: Record<string, number> = {
  UNKNOWN_COMMITMENT: 404,
  NOT_SETTLED: 409,
  ALREADY_EXERCISED: 409,
  COMMITMENT_EXPIRED: 409,
};

export async function POST(request: Request) {
  let commitmentId = "";
  try {
    const body = (await request.json()) as { commitmentId?: unknown };
    if (typeof body.commitmentId === "string") commitmentId = body.commitmentId.trim();
  } catch {
    return Response.json(
      { code: "INVALID_BODY", message: "Send JSON with a commitmentId." },
      { status: 400 },
    );
  }

  if (!commitmentId) {
    return Response.json(
      { code: "INVALID_BODY", message: "commitmentId is required." },
      { status: 400 },
    );
  }

  const result = exerciseCommitment(commitmentId);
  if (!result.ok) {
    return Response.json(
      { code: result.code, message: result.message, commitmentId },
      { status: STATUS[result.code] ?? 400 },
    );
  }

  return Response.json({
    code: "EXERCISED",
    message: `Booking confirmed. ${result.booking.credit} credited in full.`,
    ...result.booking,
  });
}
