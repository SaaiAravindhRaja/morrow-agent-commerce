import {
  buildDemoProof,
  serializeDemoProof,
  type DemoProofResponse,
} from "@/lib/commerce";

const UNREACHABLE = "the live path could not be reached";

type FetchLike = (
  input: string,
  init?: RequestInit,
) => Promise<Pick<Response, "ok" | "status" | "json">>;

export function fallbackDemoProof(liveError: string): DemoProofResponse {
  return serializeDemoProof(buildDemoProof(), "DETERMINISTIC_DEMO", {
    liveAttempted: true,
    liveError,
  });
}

export function isDemoProofResponse(value: unknown): value is DemoProofResponse {
  if (value === null || typeof value !== "object") return false;

  const record = value as Record<string, unknown>;
  const mode = record.proofMode;

  return (
    (mode === "LIVE_FORK" || mode === "DETERMINISTIC_DEMO") &&
    typeof record.disclaimer === "string" &&
    typeof record.invariant === "string" &&
    typeof record.liveAttempted === "boolean" &&
    Array.isArray(record.contenders) &&
    record.contenders.length >= 2
  );
}

export async function runDemo(fetchImpl: FetchLike = fetch): Promise<DemoProofResponse> {
  try {
    const response = await fetchImpl("/api/demo", { cache: "no-store" });
    if (!response.ok) {
      return fallbackDemoProof(`HTTP ${response.status}`);
    }

    const payload: unknown = await response.json();
    if (!isDemoProofResponse(payload)) {
      return fallbackDemoProof("the live path returned an unexpected payload");
    }

    return payload;
  } catch (error) {
    const message = error instanceof Error && error.message ? error.message : UNREACHABLE;
    return fallbackDemoProof(message);
  }
}
