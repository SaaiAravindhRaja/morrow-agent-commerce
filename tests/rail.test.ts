import { beforeAll, describe, expect, it } from "vitest";

import type { PaymentPayload } from "@x402/core/types";
import { x402ExactPermit2ProxyAddress } from "@x402/evm";

import {
  COMMITMENT_PRICE_ATOMIC,
  X402_EXACT_PERMIT2_PROXY,
  XSGD,
} from "@/lib/commerce";
import {
  ATLAS,
  FORK_CHAIN_ID,
  FORK_RPC,
  MERCHANT,
  NOVA,
  ensureAgentsReady,
  xsgdBalanceOf,
} from "@/lib/rail/clients";
import { runProof } from "@/lib/rail/run-proof";
import {
  createAuthorization,
  settleAuthorization,
  verifyAuthorization,
} from "@/lib/rail/settlement";

type Permit2Inner = {
  signature: string;
  permit2Authorization: {
    spender: string;
    deadline: string;
    from: string;
    witness: { to: string; validAfter: string };
    permitted: { token: string; amount: string };
  };
};

const race: {
  atlas?: PaymentPayload;
  nova?: PaymentPayload;
  atlasBalance?: bigint;
  novaBalance?: bigint;
  merchantBalance?: bigint;
} = {};

async function requireFork() {
  try {
    const response = await fetch(FORK_RPC, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_chainId", params: [] }),
    });
    const body = (await response.json()) as { result?: string };
    const chainId = Number.parseInt(body.result ?? "", 16);
    if (chainId !== FORK_CHAIN_ID) {
      throw new Error(`fork chain id is ${chainId}, expected ${FORK_CHAIN_ID}`);
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Avalanche mainnet fork is down at ${FORK_RPC}. Start it with rail/fork/start.sh. ${detail}`,
    );
  }
}

describe("live fork rail", () => {
  beforeAll(async () => {
    await requireFork();
    await ensureAgentsReady();

    race.atlasBalance = await xsgdBalanceOf(ATLAS.address);
    race.novaBalance = await xsgdBalanceOf(NOVA.address);
    race.merchantBalance = await xsgdBalanceOf(MERCHANT.address);

    race.atlas = await createAuthorization(ATLAS.privateKey);
    race.nova = await createAuthorization(NOVA.privateKey);
  }, 60_000);

  it("both agents create Permit2 authorizations that verify; neither XSGD moves", async () => {
    const atlas = race.atlas!;
    const nova = race.nova!;
    const atlasInner = atlas.payload as Permit2Inner;
    const novaInner = nova.payload as Permit2Inner;

    expect(atlasInner.permit2Authorization.spender.toLowerCase()).toBe(
      x402ExactPermit2ProxyAddress.toLowerCase(),
    );
    expect(novaInner.permit2Authorization.spender.toLowerCase()).toBe(
      X402_EXACT_PERMIT2_PROXY.toLowerCase(),
    );
    expect(atlasInner.permit2Authorization.permitted.token.toLowerCase()).toBe(
      XSGD.address.toLowerCase(),
    );
    expect(atlasInner.permit2Authorization.permitted.amount).toBe(
      COMMITMENT_PRICE_ATOMIC.toString(),
    );

    const atlasVerify = await verifyAuthorization(atlas);
    const novaVerify = await verifyAuthorization(nova);

    expect(atlasVerify.isValid).toBe(true);
    expect(novaVerify.isValid).toBe(true);

    expect(await xsgdBalanceOf(ATLAS.address)).toBe(race.atlasBalance);
    expect(await xsgdBalanceOf(NOVA.address)).toBe(race.novaBalance);
    expect(await xsgdBalanceOf(MERCHANT.address)).toBe(race.merchantBalance);
  });

  it("settles only Atlas; winner XSGD drops by 200000 and merchant rises by 200000", async () => {
    const settled = await settleAuthorization(race.atlas!);

    expect(settled.success).toBe(true);
    expect(settled.transaction).toMatch(/^0x[a-fA-F0-9]{64}$/);

    expect(await xsgdBalanceOf(ATLAS.address)).toBe(
      race.atlasBalance! - COMMITMENT_PRICE_ATOMIC,
    );
    expect(await xsgdBalanceOf(MERCHANT.address)).toBe(
      race.merchantBalance! + COMMITMENT_PRICE_ATOMIC,
    );
  });

  it("does not settle Nova; loser XSGD is unchanged after the winner settles", async () => {
    expect(await xsgdBalanceOf(NOVA.address)).toBe(race.novaBalance);
  });

  it("rejects a replayed winner authorization", async () => {
    const replayVerify = await verifyAuthorization(race.atlas!);
    const replaySettle = await settleAuthorization(race.atlas!);

    expect(replayVerify.isValid).toBe(false);
    expect(replaySettle.success).toBe(false);
  });

  it("rejects an authorization with a deadline in the past", async () => {
    const fresh = await createAuthorization(ATLAS.privateKey);
    const inner = fresh.payload as Permit2Inner;
    const expired: PaymentPayload = {
      ...fresh,
      payload: {
        ...inner,
        permit2Authorization: {
          ...inner.permit2Authorization,
          deadline: "1",
        },
      },
    };

    const result = await verifyAuthorization(expired);
    expect(result.isValid).toBe(false);
    expect(result.invalidReason ?? "").toMatch(/deadline|expired|invalid/i);
  });

  it("rejects an authorization that is not yet valid", async () => {
    const fresh = await createAuthorization(NOVA.privateKey);
    const inner = fresh.payload as Permit2Inner;
    const tooEarly: PaymentPayload = {
      ...fresh,
      payload: {
        ...inner,
        permit2Authorization: {
          ...inner.permit2Authorization,
          witness: {
            ...inner.permit2Authorization.witness,
            validAfter: String(Math.floor(Date.now() / 1000) + 3600),
          },
        },
      },
    };

    const result = await verifyAuthorization(tooEarly);
    expect(result.isValid).toBe(false);
  });
});

describe("runProof fallback", () => {
  it("returns LIVE_FORK on a healthy local fork", async () => {
    const result = await runProof();

    expect(result.proofMode).toBe("LIVE_FORK");
    expect(result.liveAttempted).toBe(true);
    expect(result.liveError).toBeUndefined();
    expect(result.contenders.filter((contender) => contender.settled)).toHaveLength(1);
    expect(result.contenders.find((contender) => contender.id === "agent-b")).toMatchObject({
      settled: false,
      chargedAtomic: "0",
    });
  });

  it("returns DETERMINISTIC_DEMO and never throws when RPC is a dead port", async () => {
    const result = await runProof({ rpcUrl: "http://127.0.0.1:1" });

    expect(result.proofMode).toBe("DETERMINISTIC_DEMO");
    expect(result.liveAttempted).toBe(true);
    expect(result.liveError).toBeTruthy();
    expect(result.contenders).toHaveLength(2);
    expect(result.contenders.filter((contender) => contender.settled)).toHaveLength(1);
    expect(result.contenders.find((contender) => contender.id === "agent-b")).toMatchObject({
      settled: false,
      chargedAtomic: "0",
    });
  });
});
