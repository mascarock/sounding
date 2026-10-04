import "server-only";

import { createContextClient } from "../sanity-context";
import { hasLlmKey, runLlmBrief } from "./llm";
import { walkBrief } from "./walker";
import type { BriefAnswer } from "./types";

export async function runBrief(question: string): Promise<BriefAnswer> {
  const walkerClient = createContextClient();
  const walked = await walkBrief(walkerClient, question);
  if (!hasLlmKey()) return walked;
  try {
    const llmClient = createContextClient();
    const llm = await runLlmBrief(llmClient, question, walked.wind);
    return {
      ...walked,
      mode: "llm",
      recommendation: llm.recommendation || walked.recommendation,
      walked: llm.walked.length ? llm.walked : walked.walked,
    };
  } catch {
    return walked;
  }
}

export { hasLlmKey };
