import { ExternalLinkIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ProductDetail } from "@/server/feedbacks/get-product";
import { StarDisplay } from "./stars";

type ProductSummaryProps = {
  product: ProductDetail;
  count: number;
  average: number | null;
};

export function ProductSummary({
  product,
  count,
  average,
}: ProductSummaryProps) {
  return (
    <section
      aria-labelledby="product-name"
      className="grid gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:items-center md:gap-12"
    >
      <ProductImage product={product} />

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <h1
            id="product-name"
            className="font-display text-[clamp(2rem,4.5vw,3.25rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-balance text-ink"
          >
            {product.name}
          </h1>
          {product.description && (
            <p className="max-w-[62ch] text-[1.0625rem] leading-relaxed text-pretty text-muted-foreground">
              {product.description}
            </p>
          )}
        </div>

        <RatingSummary count={count} average={average} />

        <a
          href={product.externalLink}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "h-11 w-fit gap-2 rounded-md bg-white px-4 text-[0.9375rem] text-ink",
          )}
        >
          Ver na loja
          <ExternalLinkIcon aria-hidden className="size-4" />
          <span className="sr-only">(abre em nova aba)</span>
        </a>
      </div>
    </section>
  );
}

function ProductImage({ product }: { product: ProductDetail }) {
  if (product.imageUrl) {
    return (
      <div className="overflow-hidden rounded-xl border border-border bg-white">
        {/* biome-ignore lint/performance/noImgElement: imagens externas sem next/image (decisão do projeto) */}
        <img
          src={product.imageUrl}
          alt={product.name}
          className="aspect-[4/3] size-full object-contain p-6"
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden
      className="flex aspect-[4/3] items-center justify-center rounded-xl bg-ink"
    >
      <span className="font-display text-[clamp(5rem,12vw,9rem)] font-semibold leading-none tracking-[-0.04em] text-marigold">
        {product.name.trim().charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

function RatingSummary({
  count,
  average,
}: {
  count: number;
  average: number | null;
}) {
  if (average === null) {
    return (
      <div className="flex items-center gap-3 border-l-4 border-l-marigold py-1 pl-4">
        <StarDisplay value={0} label="Sem avaliações" starClassName="size-6" />
        <p className="text-[0.9375rem] text-muted-foreground">
          Ainda sem avaliações
        </p>
      </div>
    );
  }

  const formatted = average.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  return (
    <div className="flex items-center gap-4 border-l-4 border-l-marigold py-1 pl-4">
      <p className="font-display text-5xl font-semibold leading-none tracking-[-0.04em] text-ink tabular-nums">
        {formatted}
        <span className="sr-only"> de 5</span>
      </p>
      <div className="flex flex-col gap-1.5">
        <StarDisplay
          value={average}
          label={`Média ${formatted} de 5`}
          starClassName="size-6"
        />
        <p className="text-sm text-muted-foreground">
          {count === 1 ? "1 avaliação" : `${count} avaliações`}
        </p>
      </div>
    </div>
  );
}
