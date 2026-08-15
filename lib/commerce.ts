export const XSGD = {
  name: "XSGD",
  symbol: "XSGD",
  decimals: 6,
  address: "0xb2F85b7AB3c2b6f62DF06dE6aE7D09c010a5096E",
  network: "eip155:43114",
  chainName: "Avalanche C-Chain Mainnet",
  eip712DomainVersion: "2",
} as const;

export const COMMITMENT_PRICE_ATOMIC = 200_000n;

export const PERMIT2_ADDRESS = "0x000000000022D473030F116dDEE9F6B43aC78BA3" as const;
export const X402_EXACT_PERMIT2_PROXY = "0x402085c248EeA27D92E8b30b2C58ed07f9E20001" as const;

export type ProofMode = "LIVE_FORK" | "DETERMINISTIC_DEMO";
export type DemoFailureCode =
  | "LIVE_PATH_UNAVAILABLE"
  | "LIVE_PATH_REJECTED"
  | "INVALID_PROOF_RESPONSE";
export type AssetTransferMethod = "permit2";

export type PaymentRequired = {
  x402Version: 2;
  error: string;
  resource: {
    url: string;
    description: string;
    mimeType: "application/json";
  };
  accepts: Array<{
    scheme: "exact";
    network: typeof XSGD.network;
    amount: string;
    asset: typeof XSGD.address;
    payTo: string;
    maxTimeoutSeconds: number;
    extra: {
      assetTransferMethod: AssetTransferMethod;
      name: "XSGD";
      version: typeof XSGD.eip712DomainVersion;
    };
  }>;
};

export type DemoContender = {
  id: "agent-a" | "agent-b";
  label: string;
  settled: boolean;
  chargedAtomic: bigint;
  status: "EXERCISED" | "SLOT_UNAVAILABLE";
  authorization: string;
  receipt?: {
    receiptId: string;
    commitmentId: string;
    amountAtomic: string;
    network: typeof XSGD.network;
    status: "EXERCISED";
    creditAtomic: string;
    termsHash: string;
    proofMode: ProofMode;
  };
};

export const MAINNET_APPROVE_TX =
  "0xd29b48e98ccf45d4c5d61ac4d6eb85bd37418292496888395734b1c3a5dc6452" as const;

export function proofModeDisclaimer(mode: ProofMode): string {
  if (mode === "LIVE_FORK") {
    return "This run settled against the local Avalanche mainnet fork. No real mainnet transaction was broadcast.";
  }
  return "This run used the deterministic simulation. No payment was broadcast. Mainnet contract values are real.";
}

export function containsLoopback(value: string): boolean {
  return /127\.0\.0\.1|localhost/i.test(value);
}

export function viewerFacingNote(
  mode: ProofMode,
  liveErrorCode?: DemoFailureCode,
): string | undefined {
  if (mode !== "DETERMINISTIC_DEMO" || !liveErrorCode) return undefined;
  return `Deterministic walkthrough. This hosted run cannot use a local fork. The one Avalanche mainnet write from this project is the Permit2 approve ${MAINNET_APPROVE_TX}.`;
}

export type DemoProofResponse = {
  proofMode: ProofMode;
  disclaimer: string;
  invariant: string;
  liveAttempted: boolean;
  liveErrorCode?: DemoFailureCode;
  viewerNote?: string;
  contenders: Array<
    Omit<DemoContender, "chargedAtomic"> & {
      chargedAtomic: string;
    }
  >;
};

export function serializeDemoProof(
  contenders: DemoContender[],
  mode: ProofMode,
  extras?: { liveAttempted?: boolean; liveErrorCode?: DemoFailureCode },
): DemoProofResponse {
  return {
    proofMode: mode,
    disclaimer: proofModeDisclaimer(mode),
    invariant: "exactly one settlement; losing authorization discarded before settlement",
    liveAttempted: extras?.liveAttempted ?? false,
    liveErrorCode: extras?.liveErrorCode,
    viewerNote: viewerFacingNote(mode, extras?.liveErrorCode),
    contenders: contenders.map((contender) => ({
      ...contender,
      chargedAtomic: contender.chargedAtomic.toString(),
    })),
  };
}

const ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/;

export function isEvmAddress(value: string | undefined): value is `0x${string}` {
  return (
    typeof value === "string" &&
    ADDRESS_PATTERN.test(value) &&
    value.toLowerCase() !== "0x0000000000000000000000000000000000000000"
  );
}

export function formatXsgd(amountAtomic: bigint): string {
  const base = 10n ** BigInt(XSGD.decimals);
  const whole = amountAtomic / base;
  const fraction = (amountAtomic % base).toString().padStart(XSGD.decimals, "0");
  return `${whole}.${fraction.slice(0, 2)} XSGD`;
}

export function buildPaymentRequired(payTo: string, resourceUrl: string): PaymentRequired {
  if (!isEvmAddress(payTo)) {
    throw new Error("A valid merchant EVM address is required");
  }

  return {
    x402Version: 2,
    error: "Payment required to acquire this merchant commitment",
    resource: {
      url: resourceUrl,
      description: "10-minute non-refundable commitment, credited on exercise",
      mimeType: "application/json",
    },
    accepts: [
      {
        scheme: "exact",
        network: XSGD.network,
        amount: COMMITMENT_PRICE_ATOMIC.toString(),
        asset: XSGD.address,
        payTo,
        maxTimeoutSeconds: 60,
        extra: {
          assetTransferMethod: "permit2",
          name: XSGD.name,
          version: XSGD.eip712DomainVersion,
        },
      },
    ],
  };
}

export function buildDemoProof(): DemoContender[] {
  return [
    {
      id: "agent-a",
      label: "Atlas",
      settled: true,
      chargedAtomic: COMMITMENT_PRICE_ATOMIC,
      status: "EXERCISED",
      authorization: "0x7e91…a402",
      receipt: {
        receiptId: "rcpt_01MORROW",
        commitmentId: "commitment-fri-2000",
        amountAtomic: COMMITMENT_PRICE_ATOMIC.toString(),
        network: XSGD.network,
        status: "EXERCISED",
        creditAtomic: COMMITMENT_PRICE_ATOMIC.toString(),
        termsHash: "0x9fd4c4c91c…512a",
        proofMode: "DETERMINISTIC_DEMO",
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
}

export const DEMO_PHASES = [
  { title: "Inventory exposed", detail: "Merchant publishes one machine-readable commitment SKU." },
  { title: "Terms accepted", detail: "Two agents accept the same 0.20 XSGD x402 terms." },
  { title: "Authorizations verified", detail: "Both signatures pass local validation; neither has settled." },
  { title: "Inventory decided", detail: "The merchant atomically grants the final slot to Atlas." },
  { title: "Winner settled", detail: "Only the winner is submitted for XSGD settlement; the loser pays S$0." },
  { title: "Promise exercised", detail: "Exercised on time. 0.20 XSGD credited to the booking. After ten minutes the merchant keeps the deposit." },
] as const;

export type ContenderRole = "winner" | "loser";

export function contenderStatus(phase: number, role: ContenderRole): string {
  if (phase === 0) return "INVENTORY DISCOVERED";
  if (phase === 1) return "TERMS ACCEPTED";
  if (phase === 2) return "AUTHORIZATION READY";
  if (role === "loser") return "SLOT UNAVAILABLE";
  if (phase >= 5) return "EXERCISED · CREDITED";
  return phase >= 4 ? "SETTLED · 0.20 XSGD" : "INVENTORY WON";
}

export function contenderResult(phase: number, role: ContenderRole): string {
  if (phase < 3) return "WAITING";
  return role === "winner" ? "WINNER" : "S$0";
}
