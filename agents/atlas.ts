import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { encodePaymentSignatureHeader } from "@x402/core/http";

import { askDeepSeek, decisionPrompt, parseDecision } from "@/lib/atlas-decide";
import { COMMITMENT_PRICE_ATOMIC, formatXsgd } from "@/lib/commerce";
import { ATLAS, ensureAgentsReady } from "@/lib/rail/clients";
import { createAuthorization } from "@/lib/rail/settlement";

function loadDotEnv() {
  try {
    const text = readFileSync(resolve(process.cwd(), ".env"), "utf8");
    for (const line of text.split("\n")) {
      const cut = line.trim();
      if (!cut || cut.startsWith("#")) continue;
      const eq = cut.indexOf("=");
      if (eq < 1) continue;
      const key = cut.slice(0, eq);
      const value = cut.slice(eq + 1);
      if (process.env[key] === undefined) process.env[key] = value;
    }
  } catch {
    // .env is optional when the shell already exported the key
  }
}

function arg(name: string, fallback: string): string {
  const prefix = `--${name}=`;
  const hit = process.argv.find((item) => item.startsWith(prefix));
  return hit ? hit.slice(prefix.length) : fallback;
}

function log(step: string, detail: string) {
  console.log(`[atlas] ${step}  ${detail}`);
}

async function main() {
  loadDotEnv();

  const base = arg("base", "http://127.0.0.1:3000").replace(/\/$/, "");
  const goal = arg("goal", "hold the last Friday dinner table for two");
  const budget = arg("budget", "1.00");
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY is not set");

  log("1 discover", `${base}/.well-known/agent-commerce`);
  const discovery = await fetch(`${base}/.well-known/agent-commerce`);
  const terms = (await discovery.json()) as {
    payment?: { amount?: string; authorization?: string; scheme?: string };
    policy?: { durationSeconds?: number };
  };
  const price = formatXsgd(BigInt(terms.payment?.amount ?? COMMITMENT_PRICE_ATOMIC.toString()));
  log("2 terms", `${terms.payment?.scheme ?? "?"} ${terms.payment?.authorization ?? "?"} ${price}`);

  log("3 decide", `goal="${goal}" budget=${budget} XSGD`);
  const raw = await askDeepSeek(apiKey, decisionPrompt(goal, budget, price.replace(" XSGD", "")));
  const decision = parseDecision(raw);
  log("4 model", `${decision.pay ? "PAY" : "DECLINE"} ${decision.reason}`);

  if (!decision.pay) {
    log("5 stop", "no authorization was signed");
    return;
  }

  log("5 fund", "ensure Atlas has XSGD and Permit2 allowance on the fork");
  await ensureAgentsReady();
  const auth = await createAuthorization(ATLAS.privateKey);
  const header = encodePaymentSignatureHeader(auth);
  log("6 pay", "POST /api/commit with PAYMENT-SIGNATURE");
  const paid = await fetch(`${base}/api/commit`, {
    method: "POST",
    headers: { "PAYMENT-SIGNATURE": header },
  });
  const body = await paid.text();
  log("7 result", `HTTP ${paid.status} ${body.slice(0, 240)}`);
}

main().catch((error) => {
  console.error("[atlas] failed", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
