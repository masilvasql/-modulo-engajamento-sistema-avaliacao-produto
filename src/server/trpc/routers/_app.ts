import "server-only";

import { createCallerFactory, router } from "@/server/trpc/init";
import { authRouter } from "@/server/trpc/routers/auth";
import { feedbacksRouter } from "@/server/trpc/routers/feedbacks";
import { productsRouter } from "@/server/trpc/routers/products";

export const appRouter = router({
  auth: authRouter,
  products: productsRouter,
  feedbacks: feedbacksRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
