import "server-only";

import { TRPCError } from "@trpc/server";
import { cache } from "react";
import { getSupabase } from "@/server/db/supabase";

/** Produto exibido na página de detalhes. */
export type ProductDetail = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  externalLink: string;
};

type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  external_link: string;
};

/**
 * Busca um produto pelo id lendo direto a tabela `products`
 * (independente do código da listagem). Retorna null se não existir.
 * `cache` evita consultar duas vezes no mesmo request (metadata + página).
 */
export const getProduct = cache(
  async (id: string): Promise<ProductDetail | null> => {
    const { data, error } = await getSupabase()
      .from("products")
      .select("id, name, description, image_url, external_link")
      .eq("id", id)
      .maybeSingle<ProductRow>();

    if (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Não foi possível carregar o produto.",
        cause: error,
      });
    }

    if (!data) return null;

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      imageUrl: data.image_url,
      externalLink: data.external_link,
    };
  },
);

/** Igual a `getProduct`, mas lança NOT_FOUND quando o produto não existe. */
export async function requireProduct(id: string): Promise<ProductDetail> {
  const product = await getProduct(id);
  if (!product) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Produto não encontrado.",
    });
  }
  return product;
}
