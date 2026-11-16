import "server-only";

import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import type { CreateFeedbackData, Feedback } from "@/lib/validations/feedbacks";
import { getSupabase } from "@/server/db/supabase";
import { requireProduct } from "./get-product";
import {
  FEEDBACK_COLUMNS,
  type FeedbackRow,
  toFeedback,
} from "./list-feedbacks";

type CreateFeedbackParams = CreateFeedbackData & {
  productId: string;
  /** Sempre `session.accountId` — nunca vem do corpo da requisição. */
  accountId: string;
};

export async function createFeedback({
  productId,
  accountId,
  score,
  comment,
}: CreateFeedbackParams): Promise<Feedback> {
  await requireProduct(productId);

  const { data, error } = await getSupabase()
    .from("products_feedbacks")
    .insert({
      id: nanoid(),
      score,
      comment,
      created_by: accountId,
      product_id: productId,
    })
    .select(FEEDBACK_COLUMNS)
    .single<FeedbackRow>();

  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Não foi possível publicar a avaliação.",
      cause: error,
    });
  }

  return toFeedback(data);
}
