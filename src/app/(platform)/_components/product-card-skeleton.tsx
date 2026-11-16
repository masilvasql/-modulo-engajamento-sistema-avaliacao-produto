import { Skeleton } from "@/components/ui/skeleton";

/** Esqueleto com as mesmas proporções do ProductCard. */
export function ProductCardSkeleton() {
  return (
    <div
      aria-hidden
      className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card"
    >
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="flex flex-col gap-2.5 px-5 pt-4 pb-5">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="mt-2 h-3.5 w-1/3" />
      </div>
    </div>
  );
}

export const PRODUCT_GRID_CLASS =
  "grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

/** Grade de esqueletos usada no carregamento inicial (fallback do Suspense). */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className={PRODUCT_GRID_CLASS}>
      <output className="sr-only">Carregando produtos…</output>
      {Array.from({ length: count }, (_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: lista estática de esqueletos.
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}
