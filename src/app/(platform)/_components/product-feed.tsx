"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { CircleAlertIcon, PackageOpenIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type {
  ProductsErrorResponse,
  ProductsPage,
} from "@/lib/validations/products";
import { ProductCard } from "./product-card";
import {
  PRODUCT_GRID_CLASS,
  ProductCardSkeleton,
  ProductGridSkeleton,
} from "./product-card-skeleton";

async function fetchProducts(cursor: string | null): Promise<ProductsPage> {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);

  const response = await fetch(`/api/v1/products?${params}`);
  if (!response.ok) {
    const body = (await response
      .json()
      .catch(() => null)) as ProductsErrorResponse | null;
    throw new Error(body?.message ?? "Não foi possível carregar os produtos.");
  }
  return response.json();
}

/**
 * Lista com scroll infinito. A primeira página chega pronta do servidor
 * (`initialPage`); as próximas são buscadas quando o sentinela no fim da
 * lista se aproxima da tela.
 */
export function ProductFeed({ initialPage }: { initialPage?: ProductsPage }) {
  const {
    data,
    error,
    isPending,
    isError,
    isFetchNextPageError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["products", "list"],
    queryFn: ({ pageParam }) => fetchProducts(pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialData: initialPage
      ? { pages: [initialPage], pageParams: [null] }
      : undefined,
    staleTime: 60_000,
  });

  const sentinelRef = useRef<HTMLDivElement>(null);
  const canLoadMore = hasNextPage && !isFetchingNextPage && !isError;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !canLoadMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) fetchNextPage();
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [canLoadMore, fetchNextPage]);

  if (isPending) return <ProductGridSkeleton />;

  if (!data) {
    return (
      <LoadError message={error?.message} onRetry={() => void refetch()} />
    );
  }

  const products = data.pages.flatMap((page) => page.items);

  if (products.length === 0) return <EmptyState />;

  return (
    <div className="flex flex-col gap-10">
      <ul className={PRODUCT_GRID_CLASS}>
        {products.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} />
          </li>
        ))}
        {isFetchingNextPage
          ? ["a", "b", "c", "d"].map((key) => (
              <li key={`skeleton-${key}`} aria-hidden>
                <ProductCardSkeleton />
              </li>
            ))
          : null}
      </ul>

      <div ref={sentinelRef} aria-hidden />

      <div aria-live="polite" className="flex justify-center">
        {isFetchingNextPage ? (
          <span className="sr-only">Carregando mais produtos…</span>
        ) : null}
        {isFetchNextPageError ? (
          <LoadError
            message={error?.message}
            onRetry={() => void fetchNextPage()}
          />
        ) : null}
        {!hasNextPage && !isFetchNextPageError ? (
          <p className="text-[0.9375rem] text-muted-foreground">
            Você viu todos os produtos.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function LoadError({
  message,
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) {
  return (
    <Alert variant="destructive" className="max-w-md px-4 py-3">
      <CircleAlertIcon aria-hidden />
      <AlertTitle>Não conseguimos carregar os produtos</AlertTitle>
      <AlertDescription className="flex flex-col items-start gap-3">
        <p>{message ?? "Verifique sua conexão e tente de novo."}</p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          Tentar de novo
        </Button>
      </AlertDescription>
    </Alert>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-input px-6 py-12 sm:items-center sm:text-center">
      <PackageOpenIcon className="size-8 text-ink" aria-hidden />
      <p className="font-display text-xl font-semibold tracking-[-0.02em] text-ink">
        Nenhum produto por aqui ainda
      </p>
      <p className="max-w-sm text-[0.9375rem] leading-relaxed text-muted-foreground">
        Assim que os primeiros produtos forem cadastrados, eles aparecem nesta
        página.
      </p>
    </div>
  );
}
