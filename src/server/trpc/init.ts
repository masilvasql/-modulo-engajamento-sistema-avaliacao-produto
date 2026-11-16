import "server-only";

import { initTRPC, TRPCError } from "@trpc/server";
import { getSession } from "@/server/auth/session";

export async function createTRPCContext() {
  return { session: await getSession() };
}

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<TRPCContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;

/** Exige sessão válida; expõe `ctx.session` não nulo. */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Entre na sua conta para continuar.",
    });
  }
  return next({ ctx: { ...ctx, session: ctx.session } });
});
