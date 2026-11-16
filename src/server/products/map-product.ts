import "server-only";

import type { Product } from "@/lib/validations/products";

/** Colunas lidas de `products`, na ordem usada pelas consultas. */
export const PRODUCT_COLUMNS =
  "id, name, description, image_url, external_link, created_at";

export type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  external_link: string;
  created_at: string;
};

export function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    imageUrl: row.image_url,
    externalLink: row.external_link,
    createdAt: row.created_at,
  };
}
