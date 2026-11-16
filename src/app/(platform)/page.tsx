import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import {
  PRODUCTS_PAGE_SIZE,
  type ProductsPage,
} from "@/lib/validations/products";
import { listProducts } from "@/server/products/list-products";
import { ProductGridSkeleton } from "./_components/product-card-skeleton";
import { ProductFeed } from "./_components/product-feed";

export const metadata: Metadata = {
  title: "Produtos",
};

export default function HomePage() {
  return (
    <div className="flex flex-col gap-10 sm:gap-14">
      <header className="flex max-w-3xl flex-col gap-4">
        <h1 className="font-display text-[clamp(2.25rem,5vw,3.75rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-balance text-ink">
          Produtos avaliados por quem comprou
        </h1>
        <p className="max-w-xl text-[1.0625rem] leading-relaxed text-pretty text-muted-foreground">
          Escolha um produto para ler o que as pessoas acharam, com os prós e os
          poréns, antes de decidir.
        </p>
      </header>

      <Suspense fallback={<ProductGridSkeleton />}>
        <InitialProducts />
      </Suspense>
    </div>
  );
}

/**
 * Busca a primeira página no servidor para a lista aparecer sem esperar o JS.
 * Se a busca falhar, o cliente tenta de novo e mostra o estado de erro.
 */
async function InitialProducts() {
  await connection();

  let initialPage: ProductsPage | undefined;
  try {
    initialPage = await listProducts({ limit: PRODUCTS_PAGE_SIZE });
  } catch (error) {
    console.error("[home] falha ao carregar produtos", error);
  }

  return <ProductFeed initialPage={initialPage} />;
}
