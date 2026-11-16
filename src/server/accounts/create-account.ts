import "server-only";

import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import type {
  SignUpData,
  SignUpSuccessResponse,
} from "@/lib/validations/sign-up";
import { hashPassword } from "@/server/auth/password";
import { getSupabase } from "@/server/db/supabase";

const UNIQUE_VIOLATION = "23505";

export async function createAccount(
  input: SignUpData,
): Promise<SignUpSuccessResponse> {
  const { hash, salt } = await hashPassword(input.password);

  const { data, error } = await getSupabase()
    .from("accounts")
    .insert({
      id: nanoid(),
      first_name: input.firstName,
      last_name: input.lastName,
      email: input.email,
      password: hash,
      salt,
      active: true,
    })
    .select("id, first_name, last_name, email, created_at")
    .single();

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      throw new TRPCError({
        code: "CONFLICT",
        message:
          "Já existe uma conta com este e-mail. Use outro endereço para continuar.",
      });
    }

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Não foi possível criar a conta.",
      cause: error,
    });
  }

  return {
    id: data.id,
    firstName: data.first_name,
    lastName: data.last_name,
    email: data.email,
    createdAt: data.created_at,
  };
}
