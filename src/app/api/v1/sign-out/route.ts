import { createTRPCContext } from "@/server/trpc/init";
import { createCaller } from "@/server/trpc/routers/_app";

/**
 * POST /api/v1/sign-out
 * Adaptador REST para a procedure tRPC `auth.signOut`: apaga o cookie de sessão.
 * 204: sessão encerrada (idempotente, também responde 204 sem sessão).
 */
export async function POST() {
  try {
    const caller = createCaller(await createTRPCContext());
    await caller.auth.signOut();
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("[sign-out]", error);
    return Response.json(
      { message: "Erro interno. Tente novamente em instantes." },
      { status: 500 },
    );
  }
}
