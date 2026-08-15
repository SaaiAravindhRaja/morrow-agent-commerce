export type ArchitectureEvidence =
  | "DEPLOYED"
  | "FORK_PROVEN"
  | "SIMULATED"
  | "NOT_USED";

export type ArchitectureNode = {
  id: string;
  title: string;
  does: string;
  protocol: string;
  today: string;
  evidence: ArchitectureEvidence[];
  productionMapping?: string;
};

export const ARCHITECTURE_NODES: ArchitectureNode[] = [
  {
    id: "agents",
    title: "Atlas and Nova",
    does: "Two buyer agents request the same scarce SKU, a Friday table.",
    protocol: "HTTP GET. No wallet keys on the merchant.",
    today: "Thin test clients in the demo. They exist to drive the race.",
    evidence: ["SIMULATED"],
  },
  {
    id: "merchant",
    title: "Merchant API on Vercel",
    does: "Publishes policy and the 402. Front-end is this Next.js app.",
    protocol: "GET /api/capabilities. GET /api/commit returns 402 only when MERCHANT_WALLET_ADDRESS is set.",
    today: "Live on Vercel. Public GET /api/commit returns 402 with a payment-required header that decodes to the same JSON body. POST with a signature returns 501, because no funded key runs in a hosted environment.",
    evidence: ["DEPLOYED"],
  },
  {
    id: "terms",
    title: "x402 exact terms",
    does: "Names the asset, amount, payTo, network, and Permit2 method.",
    protocol: "x402 v2. scheme exact. extra.assetTransferMethod = permit2. 200000 atomic, 600s.",
    today: "This is what /api/commit emits. Not EIP-3009. Not upto.",
    evidence: ["DEPLOYED"],
  },
  {
    id: "sign",
    title: "Both sign Permit2",
    does: "Each agent signs an authorization. Nothing is broadcast.",
    protocol: "Permit2 permitWitnessTransferFrom. Spender is the exact proxy.",
    today: "Proven on the Anvil fork. No real mainnet settlement has been sent.",
    evidence: ["FORK_PROVEN"],
  },
  {
    id: "verify",
    title: "Verify both. No funds move.",
    does: "Merchant checks both signatures before touching inventory settlement.",
    protocol: "Facilitator verify. Balance, allowance, nonce, deadline. Still unused.",
    today: "Live adapter on the local fork. Public site falls back if the fork is down.",
    evidence: ["FORK_PROVEN"],
  },
  {
    id: "inventory",
    title: "Exactly one winner",
    does: "Inventory is decided before settle. The loser is never eligible.",
    protocol: "Demo: in-process lock. Production mapping: DynamoDB conditional write.",
    today: "Hackathon build uses an in-process lock. DynamoDB is not running.",
    evidence: ["SIMULATED"],
    productionMapping: "DynamoDB conditional write",
  },
  {
    id: "settle",
    title: "Settle Atlas only",
    does: "Only the winning authorization is submitted. 0.20 XSGD moves.",
    protocol: "Facilitator settle to exact proxy, then Permit2, then XSGD on 43114.",
    today: "Proven on the Anvil mainnet fork. POST /api/exercise then credits the 0.20 XSGD if called before expiry. Writes stay local. No mainnet broadcast.",
    evidence: ["FORK_PROVEN"],
  },
  {
    id: "loser",
    title: "Nova is never charged",
    does: "The losing authorization is discarded or expires unused.",
    protocol: "Settle is not called. There is no refund because there was no charge.",
    today: "Fork tests show Nova's XSGD unchanged after Atlas settles.",
    evidence: ["FORK_PROVEN"],
  },
  {
    id: "approve",
    title: "One-time Permit2 approve",
    does: "Payer approves Permit2 once, on-chain, and pays gas that once.",
    protocol: "XSGD.approve(Permit2, max). Later payments are signatures.",
    today: "Sent on Avalanche mainnet. Tx 0xd29b48e98ccf45d4c5d61ac4d6eb85bd37418292496888395734b1c3a5dc6452. Allowance is max.",
    evidence: ["DEPLOYED"],
  },
  {
    id: "fallback",
    title: "Judging-day fallback",
    does: "If fork RPC or the facilitator is down, the deterministic demo still runs.",
    protocol: "GET /api/demo tries live first. UI labels LIVE_FORK or DETERMINISTIC_DEMO.",
    today: "The mode chip is the source of truth. A viewer must not mistake simulation for a live run.",
    evidence: ["DEPLOYED", "SIMULATED"],
  },
  {
    id: "out",
    title: "Not in the live path",
    does: "These are closed or unused for Morrow's core mechanic.",
    protocol: "SDK upto proxy has 0 bytes on Avalanche. Card MCP cannot hold. XSGD has EIP-3009; Morrow still ships Permit2.",
    today: "Do not pitch any of these as the spine.",
    evidence: ["NOT_USED"],
  },
];

export const ARCHITECTURE_AWS = [
  {
    title: "Race",
    body: "DynamoDB single-item write. ConditionExpression: attribute_not_exists(lockedBy) OR expiresAt < :now. Failed condition is 409 and RaceConflicts. Demo today: in-process lock with the same order, decide inventory, then settle at most one.",
  },
  {
    title: "Idempotency",
    body: "Every mutate carries Idempotency-Key. Key maps to an outcome table (status, tx hash, timestamp, TTL 24 to 48 h). Duplicate key returns the stored outcome. REL04-BP04. Production mapping, not built here.",
  },
  {
    title: "Compensating action",
    body: "Never settle the loser. On timeout, skip settle and release the lock only if lockedBy still matches.",
  },
  {
    title: "Observability",
    body: "RaceConflicts, PaymentVerifyLatency, PaymentSettleLatency. Structured logs carry inventoryId, agentId, idempotencyKey, outcome. Production mapping.",
  },
];

export const ARCHITECTURE_RESEARCH = [
  {
    id: "upto",
    title: "Correction 7. Stock upto cannot run on Avalanche",
    body: "@x402/evm@2.22.0 hardcodes the upto proxy at 0x4020A4f3b7b90ccA423B9fabCc0CE57C6C240002. That address has zero bytecode on Avalanche C-Chain. A real upto proxy sits at 0x402015c795ecb48A360bDC6e35a2EaEb313a0002 and matches the SDK witness typehash, but the facilitator rejects any other spender. exact works because the SDK exact proxy matches what is deployed.",
    reproduce: "cd rail/fork && ./start.sh && ./rehearse.sh   # section 2 asserts SDK upto code size is 0, and fails if that ever changes",
  },
  {
    id: "eip3009-exists",
    title: "Correction 12. Mainnet XSGD does support EIP-3009",
    body: "TRANSFER_WITH_AUTHORIZATION_TYPEHASH and RECEIVE_WITH_AUTHORIZATION_TYPEHASH return the canonical constants. authorizationState resolves. DOMAIN_SEPARATOR() and version() still revert. Saying XSGD has no EIP-3009 is false. Morrow still ships Permit2. That is a product choice, not a token limitation.",
    reproduce: "cast call 0xb2F85b7AB3c2b6f62DF06dE6aE7D09c010a5096E \"TRANSFER_WITH_AUTHORIZATION_TYPEHASH()(bytes32)\" --rpc-url https://api.avax.network/ext/bc/C/rpc",
  },
  {
    id: "domain",
    title: "Correction 14. Domain version is 2, recovered then reproduced",
    body: "Live 0xGasless tx 0xe352cde5b79d5035848bf7fda7860e8798802c961944470fbf2e61f8b65a630c recovers only against name XSGD, version 2, chainId 43114, verifyingContract the XSGD proxy. A fresh anvil signature then settled 0.20 XSGD on the fork. Stock @x402/evm exact + eip3009 verified and settled. Shipping rail stays Permit2.",
    reproduce: "cast tx 0xe352cde5b79d5035848bf7fda7860e8798802c961944470fbf2e61f8b65a630c --rpc-url https://api.avax.network/ext/bc/C/rpc",
  },
] as const;

export { mainnetSettlementNotice } from "@/lib/commerce";

export const ARCHITECTURE_ADDRESSES = {
  exactProxy: "0x402085c248EeA27D92E8b30b2C58ed07f9E20001",
  permit2: "0x000000000022D473030F116dDEE9F6B43aC78BA3",
  xsgd: "0xb2F85b7AB3c2b6f62DF06dE6aE7D09c010a5096E",
} as const;

export const ARCHITECTURE_COLOR_VARS = [
  "--arch-ink",
  "--arch-panel",
  "--arch-paper",
  "--arch-muted",
  "--arch-acid",
  "--arch-acid-fill",
  "--arch-orange",
] as const;

export function findArchitectureNode(id: string): ArchitectureNode | undefined {
  return ARCHITECTURE_NODES.find((node) => node.id === id);
}

export function bakeSvgColors(markup: string, colors: Record<string, string>): string {
  let next = markup;
  for (const [name, value] of Object.entries(colors)) {
    if (!value) continue;
    next = next.split(`var(${name})`).join(value.trim());
  }
  return next;
}

export function svgHasExternalNetwork(markup: string): boolean {
  const withoutSvgNamespace = markup.replaceAll("http://www.w3.org/2000/svg", "");
  return /https?:\/\//i.test(withoutSvgNamespace);
}

export function wrapStandaloneSvg(inner: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>\n${inner}`;
}
