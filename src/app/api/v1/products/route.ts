import { TRPCError } from "@trpc/server";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { ZodError, z } from "zod";
import type {
  CreateProductInput,
  ListProductsInput,
  ProductsErrorResponse,
} from "@/lib/validations/products";
import { createTRPCContext } from "@/server/trpc/init";
import { createCaller } from "@/server/trpc/routers/_app";

/**
 * GET /api/v1/products?cursor=&limit=
 * Adaptador REST para a procedure tRPC `products.list` (pública).
 * 200: { items, nextCursor } (items vazio quando não há produtos) | 400: query inválida
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const input: ListProductsInput = {
    cursor: params.get("cursor") || undefined,
    limit: params.get("limit") || undefined,
  };

  return handle("products.list", async () => {
    const caller = createCaller(await createTRPCContext());
    const page = await caller.products.list(input);
    return Response.json(page, { status: 200 });
  });
}

/**
 * POST /api/v1/products
 * Adaptador REST para a procedure tRPC `products.create`. Rota pública.
 * Body: { name, link, image?, description? }
 * 201: produto criado | 400: dados inválidos
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, { message: "Corpo da requisição inválido." });
  }

  return handle("products.create", async () => {
    const caller = createCaller(await createTRPCContext());
    // O corpo é validado pelo schema de input da procedure (Zod).
    const product = await caller.products.create(body as CreateProductInput);
    return Response.json(product, { status: 201 });
  });
}

async function handle(scope: string, run: () => Promise<Response>) {
  try {
    return await run();
  } catch (error) {
    if (error instanceof TRPCError) {
      if (error.cause instanceof ZodError) {
        return errorResponse(400, {
          message: "Dados inválidos. Verifique os campos enviados.",
          errors: z.flattenError(error.cause).fieldErrors,
        });
      }

      const status = getHTTPStatusCodeFromError(error);
      if (status >= 500) console.error(`[${scope}]`, error.cause ?? error);

      return errorResponse(status, {
        message:
          status >= 500
            ? "Erro interno. Tente novamente em instantes."
            : error.message,
      });
    }

    console.error(`[${scope}]`, error);
    return errorResponse(500, {
      message: "Erro interno. Tente novamente em instantes.",
    });
  }
}

function errorResponse(status: number, body: ProductsErrorResponse) {
  return Response.json(body, { status });
}
