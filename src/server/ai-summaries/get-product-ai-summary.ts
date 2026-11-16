import "server-only";

import type { Feedback } from "@/lib/validations/feedbacks";
import { mastra } from "@/mastra";
import { REVIEW_SUMMARIZER_MODEL } from "@/mastra/agents/review-summarizer";
import { getSupabase } from "@/server/db/supabase";

/** Limite de avaliações enviadas ao modelo (as mais recentes), para controlar custo e latência. */
const MAX_FEEDBACKS_IN_PROMPT = 150;

export type ProductAiSummary = {
  summary: string;
  feedbackCount: number;
  generatedAt: string;
  /** true quando a geração nova falhou e mostramos o último resumo salvo. */
  stale: boolean;
};

type SummaryRow = {
  summary: string;
  feedback_count: number;
  generated_at: string;
};

/**
 * Devolve o resumo de IA do produto. Usa o resumo salvo enquanto o número de
 * avaliações não mudar; senão gera outro com o agente e salva (cache no banco).
 * Nunca lança: em falha devolve o último resumo salvo ou null.
 */
export async function getProductAiSummary(
  productId: string,
  feedbacks: Feedback[],
): Promise<ProductAiSummary | null> {
  if (feedbacks.length === 0) return null;

  const saved = await readSaved(productId);
  if (saved && saved.feedback_count === feedbacks.length) {
    return toSummary(saved, false);
  }

  try {
    const summary = await generateSummary(feedbacks);
    const row: SummaryRow = {
      summary,
      feedback_count: feedbacks.length,
      generated_at: new Date().toISOString(),
    };

    const { error } = await getSupabase()
      .from("products_ai_summaries")
      .upsert({
        product_id: productId,
        model: REVIEW_SUMMARIZER_MODEL,
        ...row,
      });
    if (error) console.error("[ai-summary] falha ao salvar", error);

    return toSummary(row, false);
  } catch (error) {
    console.error("[ai-summary] falha ao gerar", error);
    return saved ? toSummary(saved, true) : null;
  }
}

async function readSaved(productId: string): Promise<SummaryRow | null> {
  const { data, error } = await getSupabase()
    .from("products_ai_summaries")
    .select("summary, feedback_count, generated_at")
    .eq("product_id", productId)
    .maybeSingle<SummaryRow>();

  if (error) {
    console.error("[ai-summary] falha ao ler", error);
    return null;
  }
  return data;
}

async function generateSummary(feedbacks: Feedback[]): Promise<string> {
  // `feedbacks` chega do mais recente para o mais antigo.
  const sample = feedbacks.slice(0, MAX_FEEDBACKS_IN_PROMPT);
  const average =
    sample.reduce((sum, item) => sum + item.score, 0) / sample.length;

  const reviews = sample
    .map(
      (item) => `- Nota ${item.score}/5: ${item.comment.replace(/\s+/g, " ")}`,
    )
    .join("\n");

  const prompt = `Total de avaliações: ${feedbacks.length} (média ${average.toFixed(1)} de 5).

<avaliacoes>
${reviews}
</avaliacoes>

Escreva o resumo geral dessas avaliações.`;

  const agent = mastra.getAgentById("review-summarizer");
  const result = await agent.generate(prompt, {
    modelSettings: { temperature: 0.3, maxOutputTokens: 300 },
  });

  const text = result.text.trim();
  if (!text) throw new Error("O modelo devolveu um resumo vazio.");
  return text;
}

function toSummary(row: SummaryRow, stale: boolean): ProductAiSummary {
  return {
    summary: row.summary,
    feedbackCount: row.feedback_count,
    generatedAt: row.generated_at,
    stale,
  };
}
