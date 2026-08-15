export type AtlasDecision = {
  pay: boolean;
  reason: string;
};

export function parseDecision(raw: string): AtlasDecision {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) {
    throw new Error(`model did not return JSON: ${raw.slice(0, 160)}`);
  }

  const parsed = JSON.parse(raw.slice(start, end + 1)) as { pay?: unknown; reason?: unknown };
  if (typeof parsed.pay !== "boolean") {
    throw new Error("model JSON missing boolean pay");
  }

  return {
    pay: parsed.pay,
    reason: typeof parsed.reason === "string" && parsed.reason ? parsed.reason : "no reason given",
  };
}

export function decisionPrompt(goal: string, budgetXsgd: string, priceXsgd: string): string {
  return [
    "You are a buyer agent for a merchant commitment.",
    `Goal: ${goal}`,
    `Stated budget: ${budgetXsgd} XSGD`,
    `Published price: ${priceXsgd} XSGD`,
    "Pay only if the published price is less than or equal to the stated budget.",
    'Reply with JSON only, no markdown: {"pay":true|false,"reason":"one sentence"}',
  ].join("\n");
}

export async function askDeepSeek(
  apiKey: string,
  prompt: string,
  fetchImpl: typeof fetch = fetch,
): Promise<string> {
  const response = await fetchImpl("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      temperature: 0,
      messages: [
        { role: "system", content: "You decide whether a payment fits a budget. JSON only." },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepSeek HTTP ${response.status}`);
  }

  const body = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = body.choices?.[0]?.message?.content;
  if (!content) throw new Error("DeepSeek returned an empty message");
  return content;
}
