export const DEMO_SKU = "commitment-fri-2000";

const holders = new Map<string, string>();

export type ClaimResult = "won" | "held" | "lost";

export function resetInventory(sku = DEMO_SKU): void {
  holders.delete(sku);
}

export function inventoryHolder(sku = DEMO_SKU): string | undefined {
  return holders.get(sku);
}

export function claimInventory(payer: string, sku = DEMO_SKU): ClaimResult {
  const current = holders.get(sku);
  if (!current) {
    holders.set(sku, payer);
    return "won";
  }
  if (current.toLowerCase() === payer.toLowerCase()) return "held";
  return "lost";
}

export function releaseInventory(sku = DEMO_SKU): void {
  holders.delete(sku);
}
