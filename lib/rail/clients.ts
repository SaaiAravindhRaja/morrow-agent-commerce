import { execFileSync } from "node:child_process";

import {
  createPublicClient,
  createTestClient,
  createWalletClient,
  getAddress,
  http,
  publicActions,
  walletActions,
  type Address,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { avalanche } from "viem/chains";

import {
  COMMITMENT_PRICE_ATOMIC,
  PERMIT2_ADDRESS,
  XSGD,
  isEvmAddress,
} from "@/lib/commerce";

export const FORK_CHAIN_ID = 43114;
export const DEFAULT_FORK_RPC = "http://127.0.0.1:8545";
export const FORK_RPC = process.env.FORK_RPC ?? DEFAULT_FORK_RPC;

export const WHALE = getAddress("0x23e8dda3ee946dd3dd555658c4c30876c9bf963c");

export const ATLAS = {
  address: getAddress("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"),
  privateKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" as Hex,
};

export const NOVA = {
  address: getAddress("0x70997970C51812dc3A010C7d01b50e0d17dc79C8"),
  privateKey: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d" as Hex,
};

export const FACILITATOR = {
  address: getAddress("0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"),
  privateKey: "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a" as Hex,
};

export const MERCHANT = {
  address: getAddress("0x90F79bf6EB2c4f870365E785982E1f101E93b906"),
};

export const AGENT_FUNDING_ATOMIC = 10_000_000n;
const MAX_UINT256 = 2n ** 256n - 1n;
const XSGD_ADDRESS = getAddress(XSGD.address);

export const erc20Abi = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
  },
] as const;

export function getRpcUrl(override?: string): string {
  return override ?? process.env.FORK_RPC ?? DEFAULT_FORK_RPC;
}

export function getMerchantAddress(): Address {
  const configured = process.env.MERCHANT_WALLET_ADDRESS;
  if (isEvmAddress(configured)) return getAddress(configured);
  return MERCHANT.address;
}

export function getFacilitatorPrivateKey(): Hex {
  const configured = process.env.FACILITATOR_PRIVATE_KEY;
  if (configured && /^0x[0-9a-fA-F]{64}$/.test(configured)) {
    return configured as Hex;
  }
  return FACILITATOR.privateKey;
}

function transport(rpcUrl: string, timeout = 8_000) {
  return http(rpcUrl, { timeout });
}

export function createForkPublicClient(rpcUrl = getRpcUrl()) {
  return createPublicClient({
    chain: avalanche,
    transport: transport(rpcUrl),
  });
}

export function createForkWalletClient(privateKey: Hex, rpcUrl = getRpcUrl()) {
  return createWalletClient({
    account: privateKeyToAccount(privateKey),
    chain: avalanche,
    transport: transport(rpcUrl),
  });
}

export function createForkTestClient(rpcUrl = getRpcUrl()) {
  return createTestClient({
    chain: avalanche,
    mode: "anvil",
    transport: transport(rpcUrl),
  })
    .extend(publicActions)
    .extend(walletActions);
}

export async function isForkReachable(rpcUrl = getRpcUrl()): Promise<boolean> {
  try {
    const client = createPublicClient({
      chain: avalanche,
      transport: transport(rpcUrl, 1_500),
    });
    const chainId = await client.getChainId();
    return chainId === FORK_CHAIN_ID;
  } catch {
    return false;
  }
}

export function isForkReachableSync(rpcUrl = getRpcUrl()): boolean {
  try {
    const result = execFileSync(
      "curl",
      [
        "-sS",
        "-m",
        "1",
        "-X",
        "POST",
        "-H",
        "content-type: application/json",
        "--data",
        '{"jsonrpc":"2.0","id":1,"method":"eth_chainId","params":[]}',
        rpcUrl,
      ],
      { encoding: "utf8", timeout: 2_500, stdio: ["ignore", "pipe", "pipe"] },
    );
    return result.toLowerCase().includes("0xa86a");
  } catch {
    return false;
  }
}

export function isLiveRailConfigured(): boolean {
  if (!isEvmAddress(process.env.MERCHANT_WALLET_ADDRESS)) return false;
  if (!process.env.FORK_RPC && !process.env.FACILITATOR_PRIVATE_KEY) return false;
  return isForkReachableSync();
}

export async function xsgdBalanceOf(address: Address, rpcUrl = getRpcUrl()): Promise<bigint> {
  const client = createForkPublicClient(rpcUrl);
  return client.readContract({
    address: XSGD_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [getAddress(address)],
  });
}

async function fundIfNeeded(address: Address, rpcUrl: string) {
  const balance = await xsgdBalanceOf(address, rpcUrl);
  if (balance >= AGENT_FUNDING_ATOMIC) return;

  const needed = AGENT_FUNDING_ATOMIC - balance;
  const testClient = createForkTestClient(rpcUrl);
  await testClient.impersonateAccount({ address: WHALE });
  await testClient.setBalance({ address: WHALE, value: 10n ** 20n });
  const hash = await testClient.writeContract({
    account: WHALE,
    address: XSGD_ADDRESS,
    abi: erc20Abi,
    functionName: "transfer",
    args: [address, needed],
    chain: avalanche,
  });
  await testClient.waitForTransactionReceipt({ hash });
}

async function approvePermit2IfNeeded(privateKey: Hex, rpcUrl: string) {
  const account = privateKeyToAccount(privateKey);
  const publicClient = createForkPublicClient(rpcUrl);
  const allowance = await publicClient.readContract({
    address: XSGD_ADDRESS,
    abi: erc20Abi,
    functionName: "allowance",
    args: [account.address, PERMIT2_ADDRESS],
  });
  if (allowance >= COMMITMENT_PRICE_ATOMIC) return;

  const wallet = createForkWalletClient(privateKey, rpcUrl);
  const hash = await wallet.writeContract({
    address: XSGD_ADDRESS,
    abi: erc20Abi,
    functionName: "approve",
    args: [PERMIT2_ADDRESS, MAX_UINT256],
  });
  await publicClient.waitForTransactionReceipt({ hash });
}

export async function ensureAgentsReady(rpcUrl = getRpcUrl()): Promise<void> {
  await fundIfNeeded(ATLAS.address, rpcUrl);
  await fundIfNeeded(NOVA.address, rpcUrl);
  await approvePermit2IfNeeded(ATLAS.privateKey, rpcUrl);
  await approvePermit2IfNeeded(NOVA.privateKey, rpcUrl);
}
