import "server-only";

import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import type { CreateProductData, Product } from "@/lib/validations/products";
import { getSupabase } from "@/server/db/supabase";
import {
  PRODUCT_COLUMNS,
  type ProductRow,
  toProduct,
} from "@/server/products/map-product";

export async function createProduct(
  input: CreateProductData,
): Promise<Product> {
  const { data, error } = await getSupabase()
    .from("products")
    .insert({
      id: nanoid(),
      name: input.name,
      description: input.description ?? null,
      image_url: input.image ?? null,
      external_link: input.link,
    })
    .select(PRODUCT_COLUMNS)
    .single<ProductRow>();

  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Não foi possível cadastrar o produto.",
      cause: error,
    });
  }

  return toProduct(data);
}
