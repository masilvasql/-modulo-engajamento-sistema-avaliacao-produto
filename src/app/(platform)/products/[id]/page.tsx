import { ArrowLeftIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getSession } from "@/server/auth/session";
import { getProduct } from "@/server/feedbacks/get-product";
import { listFeedbacks } from "@/server/feedbacks/list-feedbacks";
import { AiSummary, AiSummarySkeleton } from "./_components/ai-summary";
import { FeedbackForm } from "./_components/feedback-form";
import { FeedbackList } from "./_components/feedback-list";
import { ProductSummary } from "./_components/product-summary";
import { SignInRequired } from "./_components/sign-in-required";

type ProductPageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: "Produto não encontrado" };
  return {
    title: `${product.name} — avaliações`,
    description:
      product.description ?? `Leia e publique avaliações de ${product.name}.`,
  };
}

/**
 * Detalhes do produto: informações, avaliações e formulário.
 * `params` é dado de request; o `loading.tsx` serve de fallback enquanto carrega.
 */
export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const [product, feedbacks] = await Promise.all([
    getProduct(id),
    listFeedbacks(id),
  ]);

  if (!product) notFound();

  return (
    <div className="flex flex-col gap-12 sm:gap-16">
      <div className="flex flex-col gap-6">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-1.5 rounded-sm text-sm font-medium text-muted-foreground outline-none transition-colors hover:text-ink focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <ArrowLeftIcon aria-hidden className="size-4" />
          Todos os produtos
        </Link>
        <ProductSummary
          product={product}
          count={feedbacks.count}
          average={feedbacks.average}
        />
      </div>

      {/* Resumo de IA: pode chamar o modelo, então carrega à parte. */}
      <Suspense fallback={<AiSummarySkeleton />}>
        <AiSummary productId={product.id} feedbacks={feedbacks.items} />
      </Suspense>

      <section
        aria-labelledby="feedbacks-title"
        className="flex max-w-3xl flex-col gap-6"
      >
        <h2
          id="feedbacks-title"
          className="font-display text-2xl font-semibold tracking-[-0.02em] text-ink sm:text-3xl"
        >
          Avaliações
        </h2>
        <FeedbackList items={feedbacks.items} />

        {/* Lê a sessão (cookie): renderizado no request, atrás do Suspense. */}
        <Suspense fallback={<Skeleton className="h-40 w-full rounded-xl" />}>
          <FeedbackFormArea productId={product.id} />
        </Suspense>
      </section>
    </div>
  );
}

async function FeedbackFormArea({ productId }: { productId: string }) {
  const session = await getSession();
  if (!session) return <SignInRequired />;

  // Só nome e sobrenome vão para o cliente (nunca o e-mail).
  const authorName = `${session.firstName} ${session.lastName}`.trim();
  return <FeedbackForm productId={productId} authorName={authorName} />;
}
