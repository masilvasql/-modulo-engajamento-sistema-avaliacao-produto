import { z } from "zod";

export const MIN_SCORE = 1;
export const MAX_SCORE = 5;
export const COMMENT_MIN_LENGTH = 3;
export const COMMENT_MAX_LENGTH = 2000;

/** Rótulo de cada nota, usado no seletor de estrelas. */
export const SCORE_LABELS: Record<number, string> = {
  1: "Péssimo",
  2: "Ruim",
  3: "Ok",
  4: "Bom",
  5: "Excelente",
};

/**
 * Schema compartilhado entre o formulário (cliente) e a API (servidor),
 * garantindo as mesmas regras de validação nas duas camadas.
 */
export const createFeedbackSchema = z.object({
  score: z
    .int({ error: "Escolha uma nota de 1 a 5." })
    .min(MIN_SCORE, "Escolha uma nota de 1 a 5.")
    .max(MAX_SCORE, "Escolha uma nota de 1 a 5."),
  comment: z
    .string({ error: "Campo obrigatório." })
    .trim()
    .min(
      COMMENT_MIN_LENGTH,
      `Escreva pelo menos ${COMMENT_MIN_LENGTH} caracteres.`,
    )
    .max(
      COMMENT_MAX_LENGTH,
      `O comentário deve ter no máximo ${COMMENT_MAX_LENGTH} caracteres.`,
    ),
});

/** Input da procedure tRPC: o produto vem da URL, nunca o autor. */
export const createFeedbackInputSchema = createFeedbackSchema.extend({
  productId: z.string().trim().min(1),
});

export type CreateFeedbackInput = z.input<typeof createFeedbackSchema>;
export type CreateFeedbackData = z.output<typeof createFeedbackSchema>;

/** Avaliação pública: o autor expõe só nome e sobrenome (nunca e-mail). */
export type Feedback = {
  id: string;
  score: number;
  comment: string;
  createdAt: string;
  author: { firstName: string; lastName: string };
};

/** Resposta do GET /api/v1/products/{id}/feedbacks. */
export type FeedbackList = {
  items: Feedback[];
  count: number;
  /** Média das notas com uma casa decimal; null quando não há avaliações. */
  average: number | null;
};

/** Formato das respostas de erro das rotas de avaliações. */
export type FeedbackErrorResponse = {
  message: string;
  errors?: Partial<Record<keyof CreateFeedbackInput, string[]>>;
};
