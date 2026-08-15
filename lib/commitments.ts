import { COMMITMENT_PRICE_ATOMIC, formatXsgd } from "@/lib/commerce";

export const COMMITMENT_DURATION_SECONDS = 600;

export type CommitmentStatus = "PENDING" | "SETTLED" | "EXERCISED" | "EXPIRED";

export type Commitment = {
  id: string;
  sku: string;
  payer: string;
  amountAtomic: bigint;
  authorizationFingerprint?: string;
  network?: string;
  transaction?: string;
  settledAt?: number;
  expiresAt?: number;
  status: CommitmentStatus;
  bookingId?: string;
};

export type Booking = {
  bookingId: string;
  commitmentId: string;
  payer: string;
  creditAtomic: string;
  credit: string;
};

export type ExerciseFailure = {
  ok: false;
  code: "UNKNOWN_COMMITMENT" | "NOT_SETTLED" | "ALREADY_EXERCISED" | "COMMITMENT_EXPIRED";
  message: string;
};

export type ExerciseSuccess = {
  ok: true;
  booking: Booking;
};

export type ExerciseResult = ExerciseSuccess | ExerciseFailure;

const store = new Map<string, Commitment>();
let bookingSeq = 0;

export function resetCommitments(): void {
  store.clear();
  bookingSeq = 0;
}

export function resetCommitment(id: string): void {
  store.delete(id);
}

export function getCommitment(id: string): Commitment | undefined {
  return store.get(id);
}

export function rememberUnsettled(input: {
  id: string;
  payer: string;
  sku?: string;
  amountAtomic?: bigint;
  authorizationFingerprint?: string;
  network?: string;
  transaction?: string;
}): Commitment {
  const {
    id,
    payer,
    sku = id,
    amountAtomic = COMMITMENT_PRICE_ATOMIC,
    authorizationFingerprint,
    network,
    transaction,
  } = input;
  const existing = store.get(id);
  if (existing) {
    if (existing.status !== "PENDING" || existing.payer.toLowerCase() !== payer.toLowerCase()) {
      return existing;
    }

    const pending: Commitment = {
      ...existing,
      authorizationFingerprint: authorizationFingerprint ?? existing.authorizationFingerprint,
      network: network ?? existing.network,
      transaction: transaction || existing.transaction,
    };
    store.set(id, pending);
    return pending;
  }
  const pending: Commitment = {
    id,
    sku,
    payer,
    amountAtomic,
    authorizationFingerprint,
    network,
    transaction: transaction || undefined,
    status: "PENDING",
  };
  store.set(id, pending);
  return pending;
}

export function recordSettlement(input: {
  id: string;
  sku: string;
  payer: string;
  amountAtomic: bigint;
  transaction: string;
  authorizationFingerprint?: string;
  network?: string;
  now?: number;
  durationSeconds?: number;
}): Commitment {
  const now = input.now ?? Math.floor(Date.now() / 1000);
  const duration = input.durationSeconds ?? COMMITMENT_DURATION_SECONDS;
  const pending = store.get(input.id);
  const next: Commitment = {
    id: input.id,
    sku: input.sku,
    payer: input.payer,
    amountAtomic: input.amountAtomic,
    authorizationFingerprint: input.authorizationFingerprint ?? pending?.authorizationFingerprint,
    network: input.network ?? pending?.network,
    transaction: input.transaction,
    settledAt: now,
    expiresAt: now + duration,
    status: "SETTLED",
  };
  store.set(input.id, next);
  return next;
}

export function exerciseCommitment(id: string, now = Math.floor(Date.now() / 1000)): ExerciseResult {
  const commitment = store.get(id);
  if (!commitment) {
    return {
      ok: false,
      code: "UNKNOWN_COMMITMENT",
      message: "No commitment exists with that id.",
    };
  }
  if (commitment.status === "PENDING" || commitment.settledAt === undefined) {
    return {
      ok: false,
      code: "NOT_SETTLED",
      message: "This commitment has not been settled, so there is no deposit to credit.",
    };
  }
  if (commitment.status === "EXERCISED") {
    return {
      ok: false,
      code: "ALREADY_EXERCISED",
      message: "This commitment was already exercised. The deposit was already credited.",
    };
  }
  if (commitment.status === "EXPIRED" || now > (commitment.expiresAt ?? 0)) {
    commitment.status = "EXPIRED";
    store.set(id, commitment);
    return {
      ok: false,
      code: "COMMITMENT_EXPIRED",
      message: `The commitment expired. The merchant keeps the ${formatXsgd(commitment.amountAtomic)} deposit. It is not refundable.`,
    };
  }

  bookingSeq += 1;
  const bookingId = `book_${String(bookingSeq).padStart(4, "0")}`;
  commitment.status = "EXERCISED";
  commitment.bookingId = bookingId;
  store.set(id, commitment);

  return {
    ok: true,
    booking: {
      bookingId,
      commitmentId: commitment.id,
      payer: commitment.payer,
      creditAtomic: commitment.amountAtomic.toString(),
      credit: formatXsgd(commitment.amountAtomic),
    },
  };
}
