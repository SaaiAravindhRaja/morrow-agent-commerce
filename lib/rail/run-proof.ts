import { keccak256, toBytes } from "viem";

import {
  COMMITMENT_PRICE_ATOMIC,
  XSGD,
  buildDemoProof,
  serializeDemoProof,
  type DemoContender,
  type DemoProofResponse,
} from "@/lib/commerce";
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

function shortenAuthorization(signature: string): string {
  if (signature.length < 12) return signature;
  return `${signature.slice(0, 6)}…${signature.slice(-4)}`;
}

function termsHash(commitmentId: string, transaction: string): string {
  return keccak256(toBytes(`${commitmentId}:${transaction}`));
}

export async function runProof(options?: { rpcUrl?: string }): Promise<DemoProofResponse> {
  const rpcUrl = getRpcUrl(options?.rpcUrl);

  try {
    if (!(await isForkReachable(rpcUrl))) {
      throw new Error(`fork RPC unreachable at ${rpcUrl}`);
    }

    await ensureAgentsReady(rpcUrl);

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

    const settled = await settleAuthorization(atlasAuth, { rpcUrl, requirements });
    if (!settled.success) {
      throw new Error(settled.errorReason ?? "settle failed");
    }

    const atlasSignature =
      typeof atlasAuth.payload.signature === "string" ? atlasAuth.payload.signature : "0x";

    const contenders: DemoContender[] = [
      {
        id: "agent-a",
        label: "Atlas",
        settled: true,
        chargedAtomic: COMMITMENT_PRICE_ATOMIC,
        status: "EXERCISED",
        authorization: shortenAuthorization(atlasSignature),
        receipt: {
          receiptId: settled.transaction,
          commitmentId: "commitment-fri-2000",
          amountAtomic: COMMITMENT_PRICE_ATOMIC.toString(),
          network: XSGD.network,
          status: "EXERCISED",
          creditAtomic: COMMITMENT_PRICE_ATOMIC.toString(),
          termsHash: termsHash("commitment-fri-2000", settled.transaction),
          proofMode: "LIVE_FORK",
        },
      },
      {
        id: "agent-b",
        label: "Nova",
        settled: false,
        chargedAtomic: 0n,
        status: "SLOT_UNAVAILABLE",
        authorization: "discarded before settlement",
      },
    ];

    return serializeDemoProof(contenders, "LIVE_FORK", { liveAttempted: true });
  } catch (error) {
    const liveError = error instanceof Error && error.message ? error.message : String(error);
    return serializeDemoProof(buildDemoProof(), "DETERMINISTIC_DEMO", {
      liveAttempted: true,
      liveError,
    });
  }
}
