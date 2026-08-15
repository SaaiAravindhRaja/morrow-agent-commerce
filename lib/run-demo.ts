import {
  COMMITMENT_PRICE_ATOMIC,
  buildDemoProof,
  serializeDemoProof,
  type DemoFailureCode,
  type DemoProofResponse,
  type ProofMode,
} from "@/lib/commerce";

type FetchLike = (
  input: string,
  init?: RequestInit,
) => Promise<Pick<Response, "ok" | "status" | "json">>;

export function fallbackDemoProof(liveErrorCode: DemoFailureCode): DemoProofResponse {
  return serializeDemoProof(buildDemoProof(), "DETERMINISTIC_DEMO", {
    liveAttempted: true,
    liveErrorCode,
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

function isProofMode(value: unknown): value is ProofMode {
  return value === "LIVE_FORK" || value === "DETERMINISTIC_DEMO";
}

function hasCompleteReceipt(value: unknown, mode: ProofMode): boolean {
  if (!isRecord(value)) return false;
  return (
    typeof value.receiptId === "string" && value.receiptId.length > 0 &&
    value.commitmentId === "commitment-fri-2000" &&
    value.amountAtomic === COMMITMENT_PRICE_ATOMIC.toString() &&
    value.network === "eip155:43114" &&
    value.status === "EXERCISED" &&
    value.creditAtomic === COMMITMENT_PRICE_ATOMIC.toString() &&
    typeof value.termsHash === "string" && value.termsHash.length > 0 &&
    value.proofMode === mode
  );
}

export function isDemoProofResponse(value: unknown): value is DemoProofResponse {
  if (!isRecord(value)) return false;

  const record = value;
  const mode = record.proofMode;

  if (
    !isProofMode(mode) ||
    typeof record.disclaimer !== "string" || record.disclaimer.length === 0 ||
    typeof record.invariant !== "string" || record.invariant.length === 0 ||
    typeof record.liveAttempted !== "boolean" ||
    (record.liveErrorCode !== undefined &&
      record.liveErrorCode !== "LIVE_PATH_UNAVAILABLE" &&
      record.liveErrorCode !== "LIVE_PATH_REJECTED" &&
      record.liveErrorCode !== "INVALID_PROOF_RESPONSE") ||
    !Array.isArray(record.contenders) ||
    record.contenders.length !== 2
  ) {
    return false;
  }

  const contenders = record.contenders;
  if (!contenders.every(isRecord)) return false;
  if (new Set(contenders.map((contender) => contender.id)).size !== 2) return false;
  if (!contenders.some((contender) => contender.id === "agent-a")) return false;
  if (!contenders.some((contender) => contender.id === "agent-b")) return false;

  const winners = contenders.filter((contender) => contender.settled === true);
  const losers = contenders.filter((contender) => contender.settled === false);
  if (winners.length !== 1 || losers.length !== 1) return false;

  const everyContenderIsComplete = contenders.every((contender) =>
    typeof contender.label === "string" && contender.label.length > 0 &&
    typeof contender.authorization === "string" && contender.authorization.length > 0 &&
    typeof contender.chargedAtomic === "string" && /^\d+$/.test(contender.chargedAtomic) &&
    (contender.status === "EXERCISED" || contender.status === "SLOT_UNAVAILABLE"),
  );
  if (!everyContenderIsComplete) return false;

  const winner = winners[0];
  const loser = losers[0];
  return (
    winner.status === "EXERCISED" &&
    winner.chargedAtomic === COMMITMENT_PRICE_ATOMIC.toString() &&
    hasCompleteReceipt(winner.receipt, mode) &&
    loser.status === "SLOT_UNAVAILABLE" &&
    loser.chargedAtomic === "0" &&
    loser.receipt === undefined
  );
}

export async function runDemo(
  fetchImpl: FetchLike = fetch,
  options?: { signal?: AbortSignal },
): Promise<DemoProofResponse> {
  try {
    const response = await fetchImpl("/api/demo", {
      cache: "no-store",
      signal: options?.signal,
    });
    if (!response.ok) {
      return fallbackDemoProof("LIVE_PATH_REJECTED");
    }

    const payload: unknown = await response.json();
    if (!isDemoProofResponse(payload)) {
      return fallbackDemoProof("INVALID_PROOF_RESPONSE");
    }

    return payload;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    return fallbackDemoProof("LIVE_PATH_UNAVAILABLE");
  }
}
