import "server-only";

import { Mastra } from "@mastra/core";
import { reviewSummarizer } from "@/mastra/agents/review-summarizer";

/** Registro central dos agentes Mastra (usado só no servidor). */
export const mastra = new Mastra({
  agents: { reviewSummarizer },
});
