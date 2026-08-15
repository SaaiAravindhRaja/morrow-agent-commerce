import { afterEach, describe, expect, it } from "vitest";

import { COMMITMENT_PRICE_ATOMIC } from "@/lib/commerce";
import {
  COMMITMENT_DURATION_SECONDS,
  exerciseCommitment,
  getCommitment,
  recordSettlement,
  rememberUnsettled,
  resetCommitments,
} from "@/lib/commitments";
import { POST as postExercise } from "@/app/api/exercise/route";

afterEach(() => {
  resetCommitments();
});

const PAYER = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

function openSettled(id: string, now: number, durationSeconds = COMMITMENT_DURATION_SECONDS) {
  return recordSettlement({
    id,
    sku: id,
    payer: PAYER,
    amountAtomic: COMMITMENT_PRICE_ATOMIC,
    transaction: "0xabc",
    now,
    durationSeconds,
  });
}

describe("exercise before and after expiry", () => {
  it("credits the full deposit and returns a booking when exercised on time", () => {
    const now = 1_700_000_000;
    openSettled("commitment-on-time", now);

    const result = exerciseCommitment("commitment-on-time", now + 60);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.booking.creditAtomic).toBe(COMMITMENT_PRICE_ATOMIC.toString());
    expect(result.booking.commitmentId).toBe("commitment-on-time");
    expect(result.booking.bookingId).toMatch(/^book_/);
    expect(getCommitment("commitment-on-time")?.status).toBe("EXERCISED");
  });

  it("fails after the deadline and the merchant keeps the deposit", () => {
    const now = 1_700_000_000;
    openSettled("commitment-late", now, 600);

    const result = exerciseCommitment("commitment-late", now + 601);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("COMMITMENT_EXPIRED");
    expect(result.message).toMatch(/merchant keeps the 0\.20 XSGD deposit/i);
    expect(result.message).toMatch(/not refundable/i);
    expect(getCommitment("commitment-late")?.status).toBe("EXPIRED");
  });
});

describe("exercise cannot be abused", () => {
  it("rejects an unknown commitment", () => {
    const result = exerciseCommitment("commitment-missing", 1);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("UNKNOWN_COMMITMENT");
  });

  it("rejects an unsettled commitment", () => {
    rememberUnsettled("commitment-pending", PAYER);
    const result = exerciseCommitment("commitment-pending", 1);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("NOT_SETTLED");
  });

  it("rejects exercising the same commitment twice", () => {
    openSettled("commitment-once", 1_700_000_000);
    const first = exerciseCommitment("commitment-once", 1_700_000_010);
    const second = exerciseCommitment("commitment-once", 1_700_000_020);

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(false);
    if (second.ok) return;
    expect(second.code).toBe("ALREADY_EXERCISED");
  });
});

describe("POST /api/exercise", () => {
  it("returns the same codes over HTTP", async () => {
    const missing = await postExercise(
      new Request("https://morrow.example/api/exercise", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ commitmentId: "no-such" }),
      }),
    );
    expect(missing.status).toBe(404);
    expect((await missing.json()).code).toBe("UNKNOWN_COMMITMENT");

    rememberUnsettled("pending-http", PAYER);
    const pending = await postExercise(
      new Request("https://morrow.example/api/exercise", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ commitmentId: "pending-http" }),
      }),
    );
    expect(pending.status).toBe(409);
    expect((await pending.json()).code).toBe("NOT_SETTLED");
  });
});
