import "server-only";

import { TRPCError } from "@trpc/server";
import {
  INVALID_CREDENTIALS_MESSAGE,
  type SignInData,
  type SignInSuccessResponse,
} from "@/lib/validations/sign-in";
import { verifyPassword } from "@/server/auth/password";
import { getSupabase } from "@/server/db/supabase";

/**
 * Hash bcrypt fictício (cost 12, mesmo do cadastro). Comparado quando o e-mail
 * não existe, para que a resposta leve o mesmo tempo e não revele quais
 * e-mails têm conta.
 */
const DUMMY_HASH =
  "$2b$12$6sgwVMCsOuxqtkN0wCCo8uVm.UuC2.UO8LHNBvUJBqwWaMNu/wg5e";

function invalidCredentials() {
  return new TRPCError({
    code: "UNAUTHORIZED",
    message: INVALID_CREDENTIALS_MESSAGE,
  });
}

export async function authenticate(
  input: SignInData,
): Promise<SignInSuccessResponse> {
  const { data: account, error } = await getSupabase()
    .from("accounts")
    .select("id, first_name, last_name, email, password, active")
    .eq("email", input.email)
    .maybeSingle();

  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Não foi possível verificar as credenciais.",
      cause: error,
    });
  }

  const passwordMatches = await verifyPassword(
    input.password,
    account?.password ?? DUMMY_HASH,
  ).catch(() => false);

  if (!account || !passwordMatches || !account.active) {
    throw invalidCredentials();
  }

  return {
    id: account.id,
    firstName: account.first_name,
    lastName: account.last_name,
    email: account.email,
  };
}
