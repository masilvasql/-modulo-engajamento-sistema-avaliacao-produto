import { TRPCError } from "@trpc/server";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { ZodError, z } from "zod";
import type {
  CreateFeedbackInput,
  FeedbackErrorResponse,
} from "@/lib/validations/feedbacks";
import { createTRPCContext } from "@/server/trpc/init";
import { createCaller } from "@/server/trpc/routers/_app";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/v1/products/{id}/feedbacks
 * Adaptador REST para a procedure tRPC `feedbacks.listByProduct` (pública).
 * 200: { items, count, average } | 404: produto inexistente
 */
export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  try {
    const caller = createCaller(await createTRPCContext());
    const list = await caller.feedbacks.listByProduct({ productId: id });
    return Response.json(list);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/v1/products/{id}/feedbacks
 * Adaptador REST para a procedure tRPC `feedbacks.create`.
 * O autor vem da sessão (cookie), nunca do corpo.
 * 201: avaliação criada | 400: dados inválidos | 401: sem sessão | 404: produto inexistente
 */
export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, { message: "Corpo da requisição inválido." });
  }

  try {
    const caller = createCaller(await createTRPCContext());
    const input = (body ?? {}) as Partial<CreateFeedbackInput>;
    // Só os campos da avaliação seguem adiante; o corpo é validado pelo schema da procedure (Zod).
    const feedback = await caller.feedbacks.create({
      score: input.score as number,
      comment: input.comment as string,
      productId: id,
    });
    return Response.json(feedback, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

function handleError(error: unknown) {
  if (error instanceof TRPCError) {
    if (error.cause instanceof ZodError) {
      return errorResponse(400, {
        message: "Dados inválidos. Verifique a nota e o comentário.",
        errors: z.flattenError(error.cause).fieldErrors,
      });
    }

    const status = getHTTPStatusCodeFromError(error);
    if (status >= 500) console.error("[feedbacks]", error.cause ?? error);

    return errorResponse(status, {
      message:
        status >= 500
          ? "Erro interno. Tente novamente em instantes."
          : error.message,
    });
  }

  console.error("[feedbacks]", error);
  return errorResponse(500, {
    message: "Erro interno. Tente novamente em instantes.",
  });
}

function errorResponse(status: number, body: FeedbackErrorResponse) {
  return Response.json(body, { status });
}
