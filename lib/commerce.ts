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
      assetTransferMethod: "eip3009";
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
    proofMode: "DETERMINISTIC_DEMO";
  };
};

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
          assetTransferMethod: "eip3009",
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
  { title: "Winner settled", detail: "Only Atlas is submitted for XSGD settlement; Nova pays S$0." },
  { title: "Promise exercised", detail: "The commitment receipt becomes a booking with S$0.20 credit." },
] as const;

export type ContenderRole = "winner" | "loser";

export function contenderStatus(phase: number, role: ContenderRole): string {
  if (phase === 0) return "INVENTORY DISCOVERED";
  if (phase === 1) return "TERMS ACCEPTED";
  if (phase === 2) return "AUTHORIZATION READY";
  if (role === "loser") return "SLOT UNAVAILABLE";
  return phase >= 4 ? "SETTLED · 0.20 XSGD" : "INVENTORY WON";
}

export function contenderResult(phase: number, role: ContenderRole): string {
  if (phase < 3) return "WAITING";
  return role === "winner" ? "WINNER" : "S$0";
}
