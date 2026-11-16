import { SparklesIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { Feedback } from "@/lib/validations/feedbacks";
import { getProductAiSummary } from "@/server/ai-summaries/get-product-ai-summary";

type AiSummaryProps = { productId: string; feedbacks: Feedback[] };

/**
 * Resumo das avaliações escrito pelo agente de IA (Mastra + gpt-4o-mini).
 * Renderizado atrás de um Suspense: pode levar alguns segundos quando o resumo é refeito.
 */
export async function AiSummary({ productId, feedbacks }: AiSummaryProps) {
  if (feedbacks.length === 0) {
    return (
      <AiSummaryFrame>
        <p className="text-[0.9375rem] leading-relaxed text-lavender">
          O resumo aparece aqui assim que o produto receber a primeira
          avaliação.
        </p>
      </AiSummaryFrame>
    );
  }

  const result = await getProductAiSummary(productId, feedbacks);

  if (!result) {
    return (
      <AiSummaryFrame>
        <p className="text-[0.9375rem] leading-relaxed text-lavender">
          Não conseguimos gerar o resumo agora. As avaliações completas estão
          logo abaixo.
        </p>
      </AiSummaryFrame>
    );
  }

  const count = result.feedbackCount;
  return (
    <AiSummaryFrame>
      <p className="font-display text-[1.1875rem] leading-[1.5] tracking-[-0.01em] text-pretty text-white sm:text-[1.3125rem]">
        {result.summary}
      </p>
      <p className="text-[0.8125rem] leading-relaxed text-lavender/85">
        Gerado por IA a partir de {count}{" "}
        {count === 1 ? "avaliação" : "avaliações"}
        {result.stale ? " (há avaliações novas ainda fora do resumo)" : ""}.
        Pode conter imprecisões.
      </p>
    </AiSummaryFrame>
  );
}

function AiSummaryFrame({ children }: { children: ReactNode }) {
  return (
    <section
      aria-labelledby="ai-summary-title"
      className="relative max-w-3xl overflow-hidden rounded-2xl bg-ink px-6 py-7 sm:px-9 sm:py-9"
    >
      {/* Brilho sutil no canto: único detalhe decorativo do bloco. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-marigold/15 blur-3xl"
      />
      <div className="relative flex flex-col gap-4">
        <AiSummaryHeading />
        {children}
      </div>
    </section>
  );
}

function AiSummaryHeading() {
  return (
    <div className="flex items-center gap-3">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-marigold px-2.5 py-1 text-xs font-semibold tracking-wide text-ink">
        <SparklesIcon aria-hidden className="size-3.5" strokeWidth={2.5} />
        IA
      </span>
      <h2
        id="ai-summary-title"
        className="text-sm font-medium tracking-wide text-lavender uppercase"
      >
        Resumo das avaliações
      </h2>
    </div>
  );
}

/** Fallback do Suspense enquanto o agente lê as avaliações. */
export function AiSummarySkeleton() {
  return (
    <AiSummaryFrame>
      <div className="flex flex-col gap-2.5" aria-hidden>
        <div className="h-4 w-full animate-pulse rounded bg-white/10 motion-reduce:animate-none" />
        <div className="h-4 w-[92%] animate-pulse rounded bg-white/10 motion-reduce:animate-none" />
        <div className="h-4 w-[70%] animate-pulse rounded bg-white/10 motion-reduce:animate-none" />
      </div>
      <output className="text-[0.8125rem] text-lavender/85">
        A IA está lendo as avaliações…
      </output>
    </AiSummaryFrame>
  );
}
