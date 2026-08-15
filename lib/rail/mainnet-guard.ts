import { getAddress } from "viem";

import { COMMITMENT_PRICE_ATOMIC, isEvmAddress } from "@/lib/commerce";

export const REQUIRED_CHAIN_ID = 43114;
export const SETTLEMENT_AMOUNT_ATOMIC = COMMITMENT_PRICE_ATOMIC;

const ANVIL_RECIPIENTS = new Set(
  [
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    "0x0000000000000000000000000000000000000000",
  ].map((address) => address.toLowerCase()),
);

export type GuardCode =
  | "WRONG_CHAIN"
  | "WRONG_AMOUNT"
  | "MISSING_CONFIRM"
  | "BAD_RECIPIENT"
  | "ANVIL_RECIPIENT"
  | "INSUFFICIENT_XSGD"
  | "INSUFFICIENT_ALLOWANCE"
  | "INSUFFICIENT_AVAX";

export type GuardFailure = {
  ok: false;
  code: GuardCode;
  message: string;
};

export type GuardSuccess = { ok: true };

export type GuardResult = GuardSuccess | GuardFailure;

export type SettleIntent = {
  dryRun: boolean;
  confirmRealMoney: boolean;
  recipient: string | undefined;
};

export type ChainSnapshot = {
  chainId: number;
  amountAtomic: bigint;
  payerXsgdAtomic: bigint;
  permit2Allowance: bigint;
  avaxWei: bigint;
};

export function parseSettleArgs(argv: string[]): SettleIntent {
  const recipientFlag = argv.find((item) => item.startsWith("--to="));
  const confirmRealMoney = argv.includes("--yes-real-money");
  const explicitDryRun = argv.includes("--dry-run");
  return {
    dryRun: explicitDryRun || !confirmRealMoney,
    confirmRealMoney,
    recipient: recipientFlag ? recipientFlag.slice("--to=".length) : undefined,
  };
}

export function resolveRecipient(
  raw: string | undefined,
): { ok: true; address: `0x${string}` } | GuardFailure {
  if (!raw || !isEvmAddress(raw)) {
    return {
      ok: false,
      code: "BAD_RECIPIENT",
      message: "Pass --to=0x… with the merchant address you control. There is no default.",
    };
  }
  const address = getAddress(raw);
  if (ANVIL_RECIPIENTS.has(address.toLowerCase())) {
    return {
      ok: false,
      code: "ANVIL_RECIPIENT",
      message: "Recipient looks like an Anvil test address. Refusing to send XSGD there.",
    };
  }
  return { ok: true, address };
}

export function evaluateGuards(intent: SettleIntent, chain: ChainSnapshot): GuardResult {
  if (chain.chainId !== REQUIRED_CHAIN_ID) {
    return {
      ok: false,
      code: "WRONG_CHAIN",
      message: `eth_chainId is ${chain.chainId}, not ${REQUIRED_CHAIN_ID}.`,
    };
  }
  if (chain.amountAtomic !== SETTLEMENT_AMOUNT_ATOMIC) {
    return {
      ok: false,
      code: "WRONG_AMOUNT",
      message: `Amount must be exactly ${SETTLEMENT_AMOUNT_ATOMIC.toString()} atomic XSGD (0.20).`,
    };
  }

  const recipient = resolveRecipient(intent.recipient);
  if (!recipient.ok) return recipient;

  if (chain.payerXsgdAtomic < SETTLEMENT_AMOUNT_ATOMIC) {
    return {
      ok: false,
      code: "INSUFFICIENT_XSGD",
      message: `Payer XSGD balance ${chain.payerXsgdAtomic.toString()} is below ${SETTLEMENT_AMOUNT_ATOMIC.toString()}.`,
    };
  }
  if (chain.permit2Allowance < SETTLEMENT_AMOUNT_ATOMIC) {
    return {
      ok: false,
      code: "INSUFFICIENT_ALLOWANCE",
      message: "Permit2 allowance is below 200000. The one-time approve is missing on this chain.",
    };
  }
  if (chain.avaxWei === 0n) {
    return {
      ok: false,
      code: "INSUFFICIENT_AVAX",
      message: "Payer AVAX balance is 0. The facilitator cannot pay gas.",
    };
  }
  if (!intent.dryRun && !intent.confirmRealMoney) {
    return {
      ok: false,
      code: "MISSING_CONFIRM",
      message: "Refusing to send. Pass --yes-real-money, or omit it to stay in dry-run.",
    };
  }
  return { ok: true };
}

export function redactSecrets(value: string): string {
  return value.replace(/0x[a-fA-F0-9]{64}/g, "[redacted-hex]");
}
