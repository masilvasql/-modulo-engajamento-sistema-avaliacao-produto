import "server-only";

import { TRPCError } from "@trpc/server";
import type { Feedback, FeedbackList } from "@/lib/validations/feedbacks";
import { getSupabase } from "@/server/db/supabase";

export type FeedbackRow = {
  id: string;
  score: number;
  comment: string;
  created_at: string;
  author: { first_name: string; last_name: string } | null;
};

/** Colunas lidas: do autor, só nome e sobrenome (nunca e-mail). */
export const FEEDBACK_COLUMNS =
  "id, score, comment, created_at, author:accounts!products_feedbacks_created_by_fkey(first_name, last_name)";

export function toFeedback(row: FeedbackRow): Feedback {
  return {
    id: row.id,
    score: row.score,
    comment: row.comment,
    createdAt: row.created_at,
    author: {
      firstName: row.author?.first_name ?? "",
      lastName: row.author?.last_name ?? "",
    },
  };
}

/** Avaliações do produto, mais recentes primeiro, com contagem e média. */
export async function listFeedbacks(productId: string): Promise<FeedbackList> {
  const { data, error } = await getSupabase()
    .from("products_feedbacks")
    .select(FEEDBACK_COLUMNS)
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .overrideTypes<FeedbackRow[], { merge: false }>();

  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Não foi possível carregar as avaliações.",
      cause: error,
    });
  }

  const items = data.map(toFeedback);
  const count = items.length;
  const total = items.reduce((sum, item) => sum + item.score, 0);
  const average = count > 0 ? Math.round((total / count) * 10) / 10 : null;

  return { items, count, average };
}
