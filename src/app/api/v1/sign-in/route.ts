import { TRPCError } from "@trpc/server";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { ZodError, z } from "zod";
import {
  INVALID_CREDENTIALS_MESSAGE,
  type SignInErrorResponse,
  type SignInInput,
} from "@/lib/validations/sign-in";
import { createTRPCContext } from "@/server/trpc/init";
import { createCaller } from "@/server/trpc/routers/_app";

/**
 * POST /api/v1/sign-in
 * Adaptador REST para a procedure tRPC `auth.signIn`.
 * 200: sessão criada (cookie `session`) | 400: dados mal formatados
 * 401: credenciais inválidas (mensagem sempre genérica)
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, { message: "Corpo da requisição inválido." });
  }

  try {
    const caller = createCaller(await createTRPCContext());
    // O corpo é validado pelo schema de input da procedure (Zod).
    const account = await caller.auth.signIn(body as SignInInput);
    return Response.json(account, { status: 200 });
  } catch (error) {
    if (error instanceof TRPCError) {
      if (error.cause instanceof ZodError) {
        return errorResponse(400, {
          message: "Dados inválidos. Verifique os campos do formulário.",
          errors: z.flattenError(error.cause).fieldErrors,
        });
      }

      const status = getHTTPStatusCodeFromError(error);
      if (status === 401) {
        return errorResponse(401, { message: INVALID_CREDENTIALS_MESSAGE });
      }
      if (status >= 500) console.error("[sign-in]", error.cause ?? error);

      return errorResponse(status, {
        message:
          status >= 500
            ? "Erro interno. Tente novamente em instantes."
            : error.message,
      });
    }

    console.error("[sign-in]", error);
    return errorResponse(500, {
      message: "Erro interno. Tente novamente em instantes.",
    });
  }
}

function errorResponse(status: number, body: SignInErrorResponse) {
  return Response.json(body, { status });
}
