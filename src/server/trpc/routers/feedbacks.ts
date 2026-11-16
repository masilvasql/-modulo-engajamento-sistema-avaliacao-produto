import "server-only";

import { z } from "zod";
import { createFeedbackInputSchema } from "@/lib/validations/feedbacks";
import { createFeedback } from "@/server/feedbacks/create-feedback";
import { requireProduct } from "@/server/feedbacks/get-product";
import { listFeedbacks } from "@/server/feedbacks/list-feedbacks";
import {
  protectedProcedure,
  publicProcedure,
  router,
} from "@/server/trpc/init";

export const feedbacksRouter = router({
  listByProduct: publicProcedure
    .input(z.object({ productId: z.string().trim().min(1) }))
    .query(async ({ input }) => {
      await requireProduct(input.productId);
      return listFeedbacks(input.productId);
    }),

  create: protectedProcedure
    .input(createFeedbackInputSchema)
    .mutation(({ input, ctx }) =>
      createFeedback({
        productId: input.productId,
        score: input.score,
        comment: input.comment,
        // O autor sai da sessão, nunca do corpo da requisição.
        accountId: ctx.session.accountId,
      }),
    ),
});
