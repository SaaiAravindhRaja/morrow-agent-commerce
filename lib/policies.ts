import { XSGD, formatXsgd } from "@/lib/commerce";

export type PolicyStatus = "ACTIVE" | "DRAFT" | "PAUSED";
export type AllocationRule = "FIRST_VERIFIED" | "MERCHANT_APPROVAL" | "BALLOT";
export type PolicyCategory = "DINING" | "HEALTHCARE" | "RETAIL" | "RENTAL";

export type CommitmentPolicy = {
  id: string;
  sku: string;
  name: string;
  item: string;
  category: PolicyCategory;
  status: PolicyStatus;
  feeAtomic: string;
  durationMinutes: number;
  exerciseWindowMinutes: number;
  capacity: number;
  claimed: number;
  exercised: number;
  allocationRule: AllocationRule;
  creditOnExercise: boolean;
  terms: string;
  updatedAt: string;
};

export type PolicyDraft = Omit<
  CommitmentPolicy,
  "id" | "sku" | "status" | "feeAtomic" | "claimed" | "exercised" | "updatedAt"
> & {
  feeSgd: string;
};

export const ALLOCATION_LABELS: Record<AllocationRule, string> = {
  FIRST_VERIFIED: "First verified authorization",
  MERCHANT_APPROVAL: "Merchant approval",
  BALLOT: "Fair ballot",
};

export const CATEGORY_LABELS: Record<PolicyCategory, string> = {
  DINING: "Dining",
  HEALTHCARE: "Healthcare",
  RETAIL: "Retail",
  RENTAL: "Rental",
};

export const COMMITMENT_POLICIES: CommitmentPolicy[] = [
  {
    id: "policy-dinner-2000",
    sku: "SG-0820",
    name: "Friday dinner commitment",
    item: "Dinner for two · 8:00 PM",
    category: "DINING",
    status: "ACTIVE",
    feeAtomic: "200000",
    durationMinutes: 10,
    exerciseWindowMinutes: 10,
    capacity: 8,
    claimed: 7,
    exercised: 5,
    allocationRule: "FIRST_VERIFIED",
    creditOnExercise: true,
    terms: "Non-refundable on expiry. Fully credited to the final bill when exercised on time.",
    updatedAt: "Today, 08:42",
  },
  {
    id: "policy-clinic-1130",
    sku: "HC-1130",
    name: "Same-day consultation hold",
    item: "General consultation · 11:30 AM",
    category: "HEALTHCARE",
    status: "ACTIVE",
    feeAtomic: "500000",
    durationMinutes: 15,
    exerciseWindowMinutes: 15,
    capacity: 6,
    claimed: 3,
    exercised: 3,
    allocationRule: "FIRST_VERIFIED",
    creditOnExercise: true,
    terms: "The fee secures the appointment window and is credited at check-in.",
    updatedAt: "Yesterday, 17:16",
  },
  {
    id: "policy-release-001",
    sku: "RT-0001",
    name: "Limited release access",
    item: "Founders edition · allocation 01",
    category: "RETAIL",
    status: "DRAFT",
    feeAtomic: "1000000",
    durationMinutes: 5,
    exerciseWindowMinutes: 5,
    capacity: 50,
    claimed: 0,
    exercised: 0,
    allocationRule: "BALLOT",
    creditOnExercise: true,
    terms: "Selected buyers receive a five-minute checkout window. The fee is credited at purchase.",
    updatedAt: "Aug 14, 21:04",
  },
  {
    id: "policy-camera-weekend",
    sku: "RN-WE01",
    name: "Weekend rental reservation",
    item: "Cinema camera kit · weekend",
    category: "RENTAL",
    status: "PAUSED",
    feeAtomic: "2000000",
    durationMinutes: 30,
    exerciseWindowMinutes: 30,
    capacity: 4,
    claimed: 2,
    exercised: 2,
    allocationRule: "MERCHANT_APPROVAL",
    creditOnExercise: true,
    terms: "Subject to merchant approval. The reservation fee is credited to the rental invoice.",
    updatedAt: "Aug 13, 14:22",
  },
];

export const DEFAULT_POLICY_DRAFT: PolicyDraft = {
  name: "Friday dinner commitment",
  item: "Dinner for two · 8:00 PM",
  category: "DINING",
  feeSgd: "0.20",
  durationMinutes: 10,
  exerciseWindowMinutes: 10,
  capacity: 8,
  allocationRule: "FIRST_VERIFIED",
  creditOnExercise: true,
  terms: "Non-refundable on expiry. Fully credited to the final bill when exercised on time.",
};

export function parseSgdToAtomic(value: string): bigint {
  const normalized = value.trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) {
    throw new Error("Enter an SGD amount with up to two decimal places");
  }

  const [whole, fraction = ""] = normalized.split(".");
  const cents = fraction.padEnd(2, "0");
  const atomic = BigInt(whole) * 1_000_000n + BigInt(cents) * 10_000n;
  if (atomic <= 0n) throw new Error("Commitment fee must be greater than zero");
  return atomic;
}

export function policyFromDraft(draft: PolicyDraft, id = `policy-${Date.now()}`): CommitmentPolicy {
  const feeAtomic = parseSgdToAtomic(draft.feeSgd);
  const slug = draft.name
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 8);

  return {
    ...draft,
    id,
    sku: slug || "OFFER-01",
    status: "ACTIVE",
    feeAtomic: feeAtomic.toString(),
    claimed: 0,
    exercised: 0,
    updatedAt: "Just now",
  };
}

export function compilePolicy(policy: CommitmentPolicy) {
  const creditAtomic = policy.creditOnExercise ? policy.feeAtomic : "0";

  return {
    id: policy.id,
    sku: policy.sku,
    status: policy.status.toLowerCase(),
    inventory: {
      category: policy.category.toLowerCase(),
      capacity: policy.capacity,
      available: Math.max(0, policy.capacity - policy.claimed),
    },
    allocation: {
      rule: policy.allocationRule.toLowerCase(),
      decisionBeforeSettlement: true,
    },
    commitment: {
      amount: policy.feeAtomic,
      displayAmount: formatXsgd(BigInt(policy.feeAtomic)),
      durationSeconds: policy.durationMinutes * 60,
      exerciseWindowSeconds: policy.exerciseWindowMinutes * 60,
      refundableOnExpiry: false,
      creditOnExercise: creditAtomic,
    },
    payment: {
      protocol: "x402-v2",
      scheme: "exact",
      network: XSGD.network,
      asset: XSGD.address,
      symbol: XSGD.symbol,
      decimals: XSGD.decimals,
      authorization: "Permit2",
    },
    endpoints: {
      commit: "/api/commit",
      exercise: "/api/exercise",
      proof: "/api/demo",
    },
  } as const;
}

export function policyValidationErrors(draft: PolicyDraft): string[] {
  const errors: string[] = [];
  if (draft.name.trim().length < 4) errors.push("Add a clear offer name");
  if (draft.item.trim().length < 4) errors.push("Select or name the inventory item");
  try {
    parseSgdToAtomic(draft.feeSgd);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "Enter a valid commitment fee");
  }
  if (draft.durationMinutes < 1) errors.push("Duration must be at least one minute");
  if (draft.exerciseWindowMinutes < 1) errors.push("Exercise window must be at least one minute");
  if (draft.capacity < 1) errors.push("Capacity must be at least one");
  if (draft.terms.trim().length < 12) errors.push("Explain the customer-facing terms");
  return errors;
}
