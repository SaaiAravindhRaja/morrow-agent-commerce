import { formatEther, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { COMMITMENT_PRICE_ATOMIC, PERMIT2_ADDRESS, XSGD, formatXsgd } from "@/lib/commerce";
import {
  createForkPublicClient,
  erc20Abi,
  getFacilitatorPrivateKey,
  getRpcUrl,
} from "@/lib/rail/clients";
import {
  REQUIRED_CHAIN_ID,
  SETTLEMENT_AMOUNT_ATOMIC,
  evaluateGuards,
  parseSettleArgs,
  redactSecrets,
  resolveRecipient,
} from "@/lib/rail/mainnet-guard";
import {
  createAuthorization,
  defaultRequirements,
  settleAuthorization,
  verifyAuthorization,
} from "@/lib/rail/settlement";

function fail(message: string): never {
  console.error(redactSecrets(message));
  process.exit(1);
}

function line(label: string, value: string) {
  console.log(`${label.padEnd(22)} ${value}`);
}

async function main() {
  const intent = parseSettleArgs(process.argv.slice(2));
  const rpcUrl = getRpcUrl(process.env.SETTLE_RPC);
  const publicClient = createForkPublicClient(rpcUrl);

  const rawKey = process.env.MAINNET_PAYER_PRIVATE_KEY ?? getFacilitatorPrivateKey();
  if (!/^0x[0-9a-fA-F]{64}$/.test(rawKey)) {
    fail("MAINNET_PAYER_PRIVATE_KEY is missing or not a 32-byte hex key.");
  }
  const payerKey = rawKey as Hex;
  const payer = privateKeyToAccount(payerKey);

  const recipient = resolveRecipient(intent.recipient);
  if (!recipient.ok) fail(`${recipient.code}: ${recipient.message}`);

  const [chainId, payerXsgd, permit2Allowance, avaxWei, blockNumber] = await Promise.all([
    publicClient.getChainId(),
    publicClient.readContract({
      address: XSGD.address,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [payer.address],
    }),
    publicClient.readContract({
      address: XSGD.address,
      abi: erc20Abi,
      functionName: "allowance",
      args: [payer.address, PERMIT2_ADDRESS],
    }),
    publicClient.getBalance({ address: payer.address }),
    publicClient.getBlockNumber(),
  ]);

  const snapshot = {
    chainId,
    amountAtomic: SETTLEMENT_AMOUNT_ATOMIC,
    payerXsgdAtomic: payerXsgd,
    permit2Allowance,
    avaxWei,
  };
  const guard = evaluateGuards(intent, snapshot);
  if (!guard.ok) fail(`${guard.code}: ${guard.message}`);

  line("mode", intent.dryRun ? "DRY RUN (no send)" : "LIVE SEND");
  line("rpc", rpcUrl);
  line("chainId", String(chainId));
  line("block", blockNumber.toString());
  line("payer", payer.address);
  line("recipient", recipient.address);
  line("amount", `${SETTLEMENT_AMOUNT_ATOMIC.toString()} atomic (${formatXsgd(SETTLEMENT_AMOUNT_ATOMIC)})`);
  line("payer XSGD", payerXsgd.toString());
  line("permit2 allowance", permit2Allowance.toString());
  line("payer AVAX", formatEther(avaxWei));
  line("nonce", String(await publicClient.getTransactionCount({ address: payer.address })));

  if (intent.dryRun) {
    console.log("dry-run complete. nothing sent.");
    return;
  }

  if (chainId !== REQUIRED_CHAIN_ID) fail("WRONG_CHAIN: refusing to send.");
  if (SETTLEMENT_AMOUNT_ATOMIC !== COMMITMENT_PRICE_ATOMIC) fail("WRONG_AMOUNT: refusing to send.");

  process.env.FACILITATOR_PRIVATE_KEY = payerKey;
  const requirements = defaultRequirements(recipient.address);
  const payload = await createAuthorization(payerKey, { rpcUrl, requirements });
  const verified = await verifyAuthorization(payload, { rpcUrl, requirements });
  if (!verified.isValid) fail(`verify failed: ${verified.invalidReason ?? "unknown"}`);

  const settled = await settleAuthorization(payload, { rpcUrl, requirements });
  if (!settled.success || !settled.transaction) {
    fail(`settle failed: ${settled.errorReason ?? "unknown"}`);
  }
  line("transaction", settled.transaction);
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error));
});
