import "server-only";

import { CONTEXT_TOOL_DESCRIPTIONS, type ContextClient, type ContextToolName } from "../sanity-context";
import type { WindObservation } from "../weather";
import { SYSTEM_PROMPT } from "./prompts";
import type { BriefAnswer } from "./types";

type Provider = { name: string; key: string; base: string; model: string };

function provider(): Provider | null {
  if (process.env.XAI_API_KEY) {
    return {
      name: "xai",
      key: process.env.XAI_API_KEY,
      base: "https://api.x.ai/v1",
      model: process.env.XAI_MODEL || "grok-3-mini",
    };
  }
  if (process.env.OPENAI_API_KEY) {
    return {
      name: "openai",
      key: process.env.OPENAI_API_KEY,
      base: "https://api.openai.com/v1",
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    };
  }
  if (process.env.GROQ_API_KEY) {
    return {
      name: "groq",
      key: process.env.GROQ_API_KEY,
      base: "https://api.groq.com/openai/v1",
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
    };
  }
  return null;
}

export function hasLlmKey(): boolean {
  return provider() != null;
}

const TOOLS = (Object.keys(CONTEXT_TOOL_DESCRIPTIONS) as ContextToolName[]).map((name) => ({
  type: "function" as const,
  function: {
    name,
    description: CONTEXT_TOOL_DESCRIPTIONS[name],
    parameters: {
      type: "object",
      properties: {
        typeName: { type: "string" },
        type: { type: "string" },
        query: { type: "string" },
        params: { type: "object" },
        documentId: { type: "string" },
        fieldPath: { type: "string" },
        path: { type: "string" },
      },
    },
  },
}));

type ChatMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content?: string | null;
  tool_calls?: Array<{ id: string; type: "function"; function: { name: string; arguments: string } }>;
  tool_call_id?: string;
};

export async function runLlmBrief(
  client: ContextClient,
  question: string,
  wind: WindObservation,
): Promise<BriefAnswer> {
  const p = provider();
  if (!p) throw new Error("No LLM key");

  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: `Skipper question: ${question}\n\nLive wind at the harbour (Open-Meteo, joined at answer time): ${JSON.stringify(wind)}\n\nCall initial_context first. Walk supersedes/cites/appliesTo before recommending a berth.`,
    },
  ];

  for (let i = 0; i < 8; i += 1) {
    const res = await fetch(`${p.base}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${p.key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: p.model,
        messages,
        tools: TOOLS,
        tool_choice: i === 0 ? { type: "function", function: { name: "initial_context" } } : "auto",
      }),
    });
    if (!res.ok) {
      throw new Error(`LLM HTTP ${res.status}`);
    }
    const json = (await res.json()) as {
      choices: Array<{ message: ChatMessage }>;
    };
    const message = json.choices[0]?.message;
    if (!message) break;
    messages.push(message);
    const calls = message.tool_calls ?? [];
    if (!calls.length) {
      const text = message.content ?? "";
      return {
        question,
        mode: "llm",
        contextSource: client.source,
        verdict: /no safe|do not|closed|must not/i.test(text) ? "no-go" : "conditional",
        recommendation: text,
        documentRelations: [],
        contradictions: [],
        walked: client.openedDocuments(),
        wind,
        rules: [],
        keywordTrap: "",
        harbourName: null,
      };
    }
    for (const call of calls) {
      const name = call.function.name as ContextToolName;
      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(call.function.arguments || "{}") as Record<string, unknown>;
      } catch {
        args = {};
      }
      const result = await client.call(name, args);
      messages.push({
        role: "tool",
        tool_call_id: call.id,
        content: JSON.stringify(result),
      });
    }
  }

  throw new Error("LLM reached the 8-call limit without a final answer");
}
