import { TRPCError } from "@trpc/server";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { ZodError, z } from "zod";
import type {
  SignUpErrorResponse,
  SignUpInput,
} from "@/lib/validations/sign-up";
import { createTRPCContext } from "@/server/trpc/init";
import { createCaller } from "@/server/trpc/routers/_app";

/**
 * POST /api/v1/sign-up
 * Adaptador REST para a procedure tRPC `auth.signUp`.
 * 201: conta criada | 400: dados mal formatados | 409: e-mail já cadastrado
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
    const account = await caller.auth.signUp(body as SignUpInput);
    return Response.json(account, { status: 201 });
  } catch (error) {
    if (error instanceof TRPCError) {
      if (error.cause instanceof ZodError) {
        return errorResponse(400, {
          message: "Dados inválidos. Verifique os campos do formulário.",
          errors: z.flattenError(error.cause).fieldErrors,
        });
      }

      const status = getHTTPStatusCodeFromError(error);
      if (status >= 500) console.error("[sign-up]", error.cause ?? error);

      return errorResponse(status, {
        message:
          status >= 500
            ? "Erro interno. Tente novamente em instantes."
            : error.message,
      });
    }

    console.error("[sign-up]", error);
    return errorResponse(500, {
      message: "Erro interno. Tente novamente em instantes.",
    });
  }
}

function errorResponse(status: number, body: SignUpErrorResponse) {
  return Response.json(body, { status });
}
