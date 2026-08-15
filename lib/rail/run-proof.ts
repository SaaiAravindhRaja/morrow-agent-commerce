import { keccak256, toBytes } from "viem";

import {
  COMMITMENT_PRICE_ATOMIC,
  XSGD,
  buildDemoProof,
  serializeDemoProof,
  type DemoContender,
  type DemoProofResponse,
} from "@/lib/commerce";
import { DEMO_SKU, claimInventory, releaseInventory, resetInventory } from "@/lib/inventory";
import {
  ATLAS,
  MERCHANT,
  NOVA,
  ensureAgentsReady,
  getRpcUrl,
  isForkReachable,
} from "@/lib/rail/clients";
import {
  createAuthorization,
  defaultRequirements,
  settleAuthorization,
  verifyAuthorization,
} from "@/lib/rail/settlement";
import type { PaymentPayload } from "@x402/core/types";

export type ContenderKey = "atlas" | "nova";

type PreparedContender = {
  key: ContenderKey;
  id: DemoContender["id"];
  label: string;
  payer: string;
  auth: PaymentPayload;
};

function shortenAuthorization(signature: string): string {
  if (signature.length < 12) return signature;
  return `${signature.slice(0, 6)}…${signature.slice(-4)}`;
}

function termsHash(commitmentId: string, transaction: string): string {
  return keccak256(toBytes(`${commitmentId}:${transaction}`));
}

function signatureOf(auth: PaymentPayload): string {
  return typeof auth.payload.signature === "string" ? auth.payload.signature : "0x";
}

export async function attemptCommit(payer: string, auth: PaymentPayload, rpcUrl: string) {
  const claim = claimInventory(payer, DEMO_SKU);
  if (claim !== "won") {
    return { claim, settled: false as const, transaction: "" };
  }

  const settled = await settleAuthorization(auth, { rpcUrl, requirements: auth.accepted });
  if (!settled.success) {
    releaseInventory(DEMO_SKU);
    return {
      claim: "won" as const,
      settled: false as const,
      transaction: "",
      error: settled.errorReason ?? "settle failed",
    };
  }

  return { claim, settled: true as const, transaction: settled.transaction };
}

export async function runProof(options?: {
  rpcUrl?: string;
  arrival?: [ContenderKey, ContenderKey];
}): Promise<DemoProofResponse> {
  const rpcUrl = getRpcUrl(options?.rpcUrl);
  const arrival = options?.arrival ?? (["atlas", "nova"] as [ContenderKey, ContenderKey]);

  try {
    if (!(await isForkReachable(rpcUrl))) {
      throw new Error(`fork RPC unreachable at ${rpcUrl}`);
    }

    await ensureAgentsReady(rpcUrl);
    resetInventory(DEMO_SKU);

    const requirements = defaultRequirements(MERCHANT.address);
    const atlasAuth = await createAuthorization(ATLAS.privateKey, { rpcUrl, requirements });
    const novaAuth = await createAuthorization(NOVA.privateKey, { rpcUrl, requirements });

    const [atlasVerify, novaVerify] = await Promise.all([
      verifyAuthorization(atlasAuth, { rpcUrl, requirements }),
      verifyAuthorization(novaAuth, { rpcUrl, requirements }),
    ]);

    if (!atlasVerify.isValid || !novaVerify.isValid) {
      throw new Error(
        `verify failed atlas=${atlasVerify.invalidReason ?? "unknown"} nova=${novaVerify.invalidReason ?? "unknown"}`,
      );
    }

    const prepared: Record<ContenderKey, PreparedContender> = {
      atlas: {
        key: "atlas",
        id: "agent-a",
        label: "Atlas",
        payer: ATLAS.address,
        auth: atlasAuth,
      },
      nova: {
        key: "nova",
        id: "agent-b",
        label: "Nova",
        payer: NOVA.address,
        auth: novaAuth,
      },
    };

    const first = prepared[arrival[0]];
    const second = prepared[arrival[1]];
    const firstResult = await attemptCommit(first.payer, first.auth, rpcUrl);
    const secondResult = await attemptCommit(second.payer, second.auth, rpcUrl);

    const winner = firstResult.settled ? first : secondResult.settled ? second : undefined;
    const winResult = winner === first ? firstResult : secondResult;

    if (!winner || !winResult.settled) {
      throw new Error(firstResult.error ?? secondResult.error ?? "no contender settled");
    }

    const contenders: DemoContender[] = [first, second].map((contender) => {
      if (contender.key !== winner.key) {
        return {
          id: contender.id,
          label: contender.label,
          settled: false,
          chargedAtomic: 0n,
          status: "SLOT_UNAVAILABLE",
          authorization: "discarded before settlement",
        };
      }

      return {
        id: contender.id,
        label: contender.label,
        settled: true,
        chargedAtomic: COMMITMENT_PRICE_ATOMIC,
        status: "EXERCISED",
        authorization: shortenAuthorization(signatureOf(contender.auth)),
        receipt: {
          receiptId: winResult.transaction,
          commitmentId: DEMO_SKU,
          amountAtomic: COMMITMENT_PRICE_ATOMIC.toString(),
          network: XSGD.network,
          status: "EXERCISED",
          creditAtomic: COMMITMENT_PRICE_ATOMIC.toString(),
          termsHash: termsHash(DEMO_SKU, winResult.transaction),
          proofMode: "LIVE_FORK",
        },
      };
    });

    return serializeDemoProof(contenders, "LIVE_FORK", { liveAttempted: true });
  } catch (error) {
    const liveError = error instanceof Error && error.message ? error.message : String(error);
    return serializeDemoProof(buildDemoProof(), "DETERMINISTIC_DEMO", {
      liveAttempted: true,
      liveError,
    });
  }
}
