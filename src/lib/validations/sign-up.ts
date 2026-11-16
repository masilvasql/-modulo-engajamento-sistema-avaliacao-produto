import { z } from "zod";

// bcrypt só considera os primeiros 72 bytes da senha; acima disso o restante seria ignorado.
const BCRYPT_MAX_BYTES = 72;
const byteLength = (value: string) => new TextEncoder().encode(value).length;

// Mensagem usada quando o campo não é enviado ou não é texto.
const REQUIRED = { error: "Campo obrigatório." };

/**
 * Schema compartilhado entre o formulário (cliente) e a API (servidor),
 * garantindo as mesmas regras de validação nas duas camadas.
 */
export const signUpSchema = z
  .object({
    firstName: z
      .string(REQUIRED)
      .trim()
      .min(1, "Informe seu primeiro nome.")
      .max(100, "O nome deve ter no máximo 100 caracteres."),
    lastName: z
      .string(REQUIRED)
      .trim()
      .min(1, "Informe seu sobrenome.")
      .max(100, "O sobrenome deve ter no máximo 100 caracteres."),
    email: z
      .string(REQUIRED)
      .trim()
      .toLowerCase()
      .min(1, "Informe seu e-mail.")
      .pipe(z.email("Informe um e-mail válido.")),
    password: z
      .string(REQUIRED)
      .min(8, "A senha deve ter pelo menos 8 caracteres.")
      .refine(
        (value) => byteLength(value) <= BCRYPT_MAX_BYTES,
        "A senha é longa demais.",
      ),
    confirmPassword: z.string(REQUIRED).min(1, "Confirme sua senha."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem.",
    path: ["confirmPassword"],
  });

export type SignUpInput = z.input<typeof signUpSchema>;
export type SignUpData = z.output<typeof signUpSchema>;

/** Formato das respostas de erro da rota POST /api/v1/sign-up. */
export type SignUpErrorResponse = {
  message: string;
  errors?: Partial<Record<keyof SignUpInput, string[]>>;
};

/** Formato da resposta de sucesso (201) da rota POST /api/v1/sign-up. */
export type SignUpSuccessResponse = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
};
