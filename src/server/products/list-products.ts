import "server-only";

import { TRPCError } from "@trpc/server";
import type {
  ListProductsData,
  ProductsPage,
} from "@/lib/validations/products";
import { getSupabase } from "@/server/db/supabase";
import {
  PRODUCT_COLUMNS,
  type ProductRow,
  toProduct,
} from "@/server/products/map-product";

type Cursor = { createdAt: string; id: string };

const ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
// Timestamp ISO como o PostgREST devolve (ex.: 2026-11-16T12:00:00.123456+00:00).
const TIMESTAMP_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,6})?(Z|[+-]\d{2}:\d{2})$/;

/** Cursor opaco: base64url de `created_at|id` do último item da página. */
function encodeCursor({ createdAt, id }: Cursor): string {
  return Buffer.from(`${createdAt}|${id}`, "utf8").toString("base64url");
}

function decodeCursor(cursor: string): Cursor {
  const [createdAt, id, ...rest] = Buffer.from(cursor, "base64url")
    .toString("utf8")
    .split("|");

  if (
    rest.length > 0 ||
    !createdAt ||
    !id ||
    !TIMESTAMP_PATTERN.test(createdAt) ||
    !ID_PATTERN.test(id)
  ) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Cursor inválido." });
  }

  return { createdAt, id };
}

/**
 * Paginação por cursor (keyset) sobre (created_at desc, id desc).
 * Busca `limit + 1` linhas para saber se existe uma próxima página.
 */
export async function listProducts({
  cursor,
  limit,
}: ListProductsData): Promise<ProductsPage> {
  let query = getSupabase()
    .from("products")
    .select(PRODUCT_COLUMNS)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit + 1);

  if (cursor) {
    const { createdAt, id } = decodeCursor(cursor);
    // Valores entre aspas: o timestamp contém ":" e "+", reservados no filtro do PostgREST.
    query = query.or(
      `created_at.lt."${createdAt}",and(created_at.eq."${createdAt}",id.lt."${id}")`,
    );
  }

  const { data, error } = await query.overrideTypes<
    ProductRow[],
    { merge: false }
  >();

  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Não foi possível carregar os produtos.",
      cause: error,
    });
  }

  const hasMore = data.length > limit;
  const rows = hasMore ? data.slice(0, limit) : data;
  const last = rows.at(-1);

  return {
    items: rows.map(toProduct),
    nextCursor:
      hasMore && last
        ? encodeCursor({ createdAt: last.created_at, id: last.id })
        : null,
  };
}
