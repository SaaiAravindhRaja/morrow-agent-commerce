export type ArchitectureStatus = "LIVE" | "DEMO" | "MAPPING" | "OUT";

export type ArchitectureNode = {
  id: string;
  title: string;
  does: string;
  protocol: string;
  today: string;
  status: ArchitectureStatus;
};

export const ARCHITECTURE_NODES: ArchitectureNode[] = [
  {
    id: "agents",
    title: "Atlas and Nova",
    does: "Two buyer agents request the same scarce SKU, a Friday table.",
    protocol: "HTTP GET. No wallet keys on the merchant.",
    today: "Thin test clients in the demo. They exist to drive the race.",
    status: "LIVE",
  },
  {
    id: "merchant",
    title: "Merchant API on Vercel",
    does: "Publishes policy and the 402. Front-end is this Next.js app.",
    protocol: "GET /api/capabilities. GET /api/commit returns HTTP 402.",
    today: "Deployed on Vercel. Payment terms are exact + Permit2 for 0.20 XSGD.",
    status: "LIVE",
  },
  {
    id: "terms",
    title: "x402 exact terms",
    does: "Names the asset, amount, payTo, network, and Permit2 method.",
    protocol: "x402 v2. scheme exact. extra.assetTransferMethod = permit2. 200000 atomic, 600s.",
    today: "This is what /api/commit emits. Not EIP-3009. Not upto.",
    status: "LIVE",
  },
  {
    id: "sign",
    title: "Both sign Permit2",
    does: "Each agent signs an authorization. Nothing is broadcast.",
    protocol: "Permit2 permitWitnessTransferFrom. Spender is the exact proxy.",
    today: "Proven on the Anvil fork. No real mainnet settlement has been sent.",
    status: "LIVE",
  },
  {
    id: "verify",
    title: "Verify both. No funds move.",
    does: "Merchant checks both signatures before touching inventory settlement.",
    protocol: "Facilitator verify. Balance, allowance, nonce, deadline. Still unused.",
    today: "Live adapter on the local fork. Public site falls back if the fork is down.",
    status: "LIVE",
  },
  {
    id: "inventory",
    title: "Exactly one winner",
    does: "Inventory is decided before settle. The loser is never eligible.",
    protocol: "Demo: in-process lock. Production mapping: DynamoDB conditional write.",
    today: "Hackathon build uses an in-process lock. DynamoDB is not running.",
    status: "DEMO",
  },
  {
    id: "settle",
    title: "Settle Atlas only",
    does: "Only the winning authorization is submitted. 0.20 XSGD moves.",
    protocol: "Facilitator settle to exact proxy, then Permit2, then XSGD on 43114.",
    today: "Proven on the Anvil mainnet fork. Writes stay local. No mainnet broadcast.",
    status: "LIVE",
  },
  {
    id: "loser",
    title: "Nova is never charged",
    does: "The losing authorization is discarded or expires unused.",
    protocol: "Settle is not called. There is no refund because there was no charge.",
    today: "Fork tests show Nova's XSGD unchanged after Atlas settles.",
    status: "LIVE",
  },
  {
    id: "approve",
    title: "One-time Permit2 approve",
    does: "Payer approves Permit2 once, on-chain, and pays gas that once.",
    protocol: "XSGD.approve(Permit2, max). Later payments are signatures.",
    today: "Rehearsed on the fork. Dewa has not sent the real mainnet approve yet.",
    status: "LIVE",
  },
  {
    id: "fallback",
    title: "Judging-day fallback",
    does: "If fork RPC or the facilitator is down, the deterministic demo still runs.",
    protocol: "GET /api/demo tries live first. UI labels LIVE_FORK or DETERMINISTIC_DEMO.",
    today: "The mode chip is the source of truth. A viewer must not mistake simulation for a live run.",
    status: "DEMO",
  },
  {
    id: "out",
    title: "Not in the live path",
    does: "These are closed or unused for Morrow's core mechanic.",
    protocol: "EIP-3009 typehash getters revert on mainnet XSGD. Card MCP cannot hold. SDK upto proxy has 0 bytes on Avalanche.",
    today: "Do not pitch any of these as the spine.",
    status: "OUT",
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
