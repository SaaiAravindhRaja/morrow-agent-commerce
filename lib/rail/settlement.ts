import type {
  PaymentPayload,
  PaymentRequirements,
  SettleResponse,
  VerifyResponse,
} from "@x402/core/types";
import { toClientEvmSigner, toFacilitatorEvmSigner, type FacilitatorEvmSigner } from "@x402/evm";
import { ExactEvmScheme as ExactEvmClient } from "@x402/evm/exact/client";
import { ExactEvmScheme as ExactEvmFacilitator } from "@x402/evm/exact/facilitator";
import type { Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { buildPaymentRequired } from "@/lib/commerce";
import {
  createForkPublicClient,
  createForkWalletClient,
  getFacilitatorPrivateKey,
  getMerchantAddress,
  getRpcUrl,
} from "@/lib/rail/clients";

export function defaultRequirements(
  payTo = getMerchantAddress(),
  resourceUrl = "https://morrow.local/api/commit",
): PaymentRequirements {
  return buildPaymentRequired(payTo, resourceUrl).accepts[0];
}

export function wrapPaymentPayload(
  created: Pick<PaymentPayload, "x402Version" | "payload"> & {
    extensions?: Record<string, unknown>;
  },
  requirements: PaymentRequirements,
): PaymentPayload {
  return {
    x402Version: created.x402Version,
    accepted: requirements,
    payload: created.payload,
    extensions: created.extensions,
  };
}

export async function createAuthorization(
  privateKey: Hex,
  options?: { rpcUrl?: string; requirements?: PaymentRequirements },
): Promise<PaymentPayload> {
  const rpcUrl = getRpcUrl(options?.rpcUrl);
  const requirements = options?.requirements ?? defaultRequirements();
  const account = privateKeyToAccount(privateKey);
  const publicClient = createForkPublicClient(rpcUrl);
  const signer = toClientEvmSigner(account, publicClient);
  const client = new ExactEvmClient(signer);
  const created = await client.createPaymentPayload(2, requirements);
  return wrapPaymentPayload(created, requirements);
}

function createFacilitatorSigner(rpcUrl: string): FacilitatorEvmSigner {
  const privateKey = getFacilitatorPrivateKey();
  const account = privateKeyToAccount(privateKey);
  const publicClient = createForkPublicClient(rpcUrl);
  const walletClient = createForkWalletClient(privateKey, rpcUrl);

  return toFacilitatorEvmSigner({
    address: account.address,
    readContract: (args) => publicClient.readContract(args as never),
    verifyTypedData: (args) => publicClient.verifyTypedData(args as never),
    writeContract: (args) => walletClient.writeContract(args as never),
    sendTransaction: (args) =>
      walletClient.sendTransaction({
        to: args.to,
        data: args.data,
      }),
    waitForTransactionReceipt: async (args) => {
      const receipt = await publicClient.waitForTransactionReceipt({ hash: args.hash });
      return { status: receipt.status, logs: receipt.logs };
    },
    getCode: (args) => publicClient.getCode({ address: args.address }),
  });
}

function createFacilitator(rpcUrl: string) {
  return new ExactEvmFacilitator(createFacilitatorSigner(rpcUrl));
}

export async function verifyAuthorization(
  payload: PaymentPayload,
  options?: { rpcUrl?: string; requirements?: PaymentRequirements },
): Promise<VerifyResponse> {
  const rpcUrl = getRpcUrl(options?.rpcUrl);
  const requirements = options?.requirements ?? payload.accepted;
  return createFacilitator(rpcUrl).verify(payload, requirements);
}

export async function settleAuthorization(
  payload: PaymentPayload,
  options?: { rpcUrl?: string; requirements?: PaymentRequirements },
): Promise<SettleResponse> {
  const rpcUrl = getRpcUrl(options?.rpcUrl);
  const requirements = options?.requirements ?? payload.accepted;
  return createFacilitator(rpcUrl).settle(payload, requirements);
}
