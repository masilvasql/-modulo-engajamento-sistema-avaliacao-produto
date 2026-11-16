import { z } from "zod";

// Mensagem usada quando o campo não é enviado ou não é texto.
const REQUIRED = { error: "Campo obrigatório." };

// Só aceita links http/https (bloqueia javascript:, data: etc.).
const httpUrl = (message: string) =>
  z.url({ protocol: /^https?$/, hostname: z.regexes.domain, error: message });

/**
 * Corpo do POST /api/v1/products (inserção de produtos, rota pública).
 * `link` → coluna external_link · `image` → coluna image_url.
 */
export const createProductSchema = z.object({
  name: z
    .string(REQUIRED)
    .trim()
    .min(1, "Informe o nome do produto.")
    .max(200, "O nome deve ter no máximo 200 caracteres."),
  description: z
    .string()
    .trim()
    .max(1000, "A descrição deve ter no máximo 1000 caracteres.")
    .optional()
    .transform((value) => value || undefined),
  link: z
    .string(REQUIRED)
    .trim()
    .pipe(httpUrl("Informe um link http(s) válido.")),
  image: z
    .string()
    .trim()
    .pipe(httpUrl("Informe uma URL de imagem http(s) válida."))
    .optional(),
});

export type CreateProductInput = z.input<typeof createProductSchema>;
export type CreateProductData = z.output<typeof createProductSchema>;

export const PRODUCTS_PAGE_SIZE = 12;

/** Query params do GET /api/v1/products (paginação por cursor). */
export const listProductsSchema = z.object({
  cursor: z.string().min(1).max(512).optional(),
  limit: z.coerce
    .number({ error: "O limite deve ser um número." })
    .int("O limite deve ser um número inteiro.")
    .min(1, "O limite mínimo é 1.")
    .max(50, "O limite máximo é 50.")
    .default(PRODUCTS_PAGE_SIZE),
});

export type ListProductsInput = z.input<typeof listProductsSchema>;
export type ListProductsData = z.output<typeof listProductsSchema>;

/** Produto como a API devolve. */
export type Product = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  externalLink: string;
  createdAt: string;
};

/** Resposta (200) do GET /api/v1/products. */
export type ProductsPage = {
  items: Product[];
  nextCursor: string | null;
};

/** Formato das respostas de erro das rotas de produtos. */
export type ProductsErrorResponse = {
  message: string;
  errors?: Record<string, string[] | undefined>;
};
