import { z } from "zod";

// bcrypt só considera os primeiros 72 bytes da senha (mesma regra do sign-up).
const BCRYPT_MAX_BYTES = 72;
const byteLength = (value: string) => new TextEncoder().encode(value).length;

const REQUIRED = { error: "Campo obrigatório." };

/** Schema compartilhado entre o formulário de login (cliente) e a API. */
export const signInSchema = z.object({
  email: z
    .string(REQUIRED)
    .trim()
    .toLowerCase()
    .min(1, "Informe seu e-mail.")
    .pipe(z.email("Informe um e-mail válido.")),
  password: z
    .string(REQUIRED)
    .min(1, "Informe sua senha.")
    .refine(
      (value) => byteLength(value) <= BCRYPT_MAX_BYTES,
      "A senha é longa demais.",
    ),
});

export type SignInInput = z.input<typeof signInSchema>;
export type SignInData = z.output<typeof signInSchema>;

/** Mensagem única para qualquer falha de credenciais (não revela qual campo errou). */
export const INVALID_CREDENTIALS_MESSAGE = "E-mail ou senha inválidos.";

/** Formato da resposta de sucesso (200) da rota POST /api/v1/sign-in. */
export type SignInSuccessResponse = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

/** Formato das respostas de erro da rota POST /api/v1/sign-in. */
export type SignInErrorResponse = {
  message: string;
  errors?: Partial<Record<keyof SignInInput, string[]>>;
};
