import { ArrowUpRightIcon } from "lucide-react";
import Link from "next/link";
import type { Product } from "@/lib/validations/products";

/**
 * Card de produto da home. O link do nome cobre o card inteiro (pseudo-elemento),
 * então o card todo é clicável sem aninhar elementos interativos.
 */
export function ProductCard({ product }: { product: Product }) {
  const domain = getDomain(product.externalLink);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-[border-color,translate] duration-200 hover:border-ink has-[a:focus-visible]:border-ink has-[a:focus-visible]:ring-3 has-[a:focus-visible]:ring-ring/40 motion-safe:hover:-translate-y-0.5">
      <div className="relative aspect-[4/3] overflow-hidden bg-ink">
        {product.imageUrl ? (
          // biome-ignore lint/performance/noImgElement: imagens externas sem configurar remotePatterns no next.config.
          <img
            src={product.imageUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className="size-full object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.03]"
          />
        ) : (
          <ImagePlaceholder name={product.name} />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 px-5 pt-4 pb-5">
        <h2 className="font-display text-[1.25rem] font-semibold leading-[1.2] tracking-[-0.02em] text-balance text-ink">
          <Link
            href={`/products/${product.id}`}
            className="underline decoration-transparent decoration-[3px] underline-offset-[5px] outline-none transition-[text-decoration-color] duration-200 after:absolute after:inset-0 after:content-[''] group-hover:decoration-marigold focus-visible:decoration-marigold"
          >
            {product.name}
          </Link>
        </h2>

        {product.description ? (
          <p className="line-clamp-2 text-[0.9375rem] leading-relaxed text-pretty text-muted-foreground">
            {product.description}
          </p>
        ) : null}

        {domain ? (
          <p className="mt-auto inline-flex items-center gap-1 pt-2 text-[0.8125rem] text-muted-foreground">
            <ArrowUpRightIcon className="size-3.5" aria-hidden />
            <span className="sr-only">Vendido em </span>
            {domain}
          </p>
        ) : null}
      </div>
    </article>
  );
}

/** Sem imagem: a inicial do produto em Estrela sobre Tinta. */
function ImagePlaceholder({ name }: { name: string }) {
  return (
    <div
      aria-hidden
      className="flex size-full items-center justify-center font-display text-7xl font-semibold tracking-[-0.04em] text-marigold"
    >
      {name.trim().charAt(0).toUpperCase()}
    </div>
  );
}

function getDomain(link: string): string | null {
  try {
    return new URL(link).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}
