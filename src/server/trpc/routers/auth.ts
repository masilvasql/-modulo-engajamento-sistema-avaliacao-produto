import "server-only";

import { signInSchema } from "@/lib/validations/sign-in";
import { signUpSchema } from "@/lib/validations/sign-up";
import { authenticate } from "@/server/accounts/authenticate";
import { createAccount } from "@/server/accounts/create-account";
import { createSession, deleteSession } from "@/server/auth/session";
import { publicProcedure, router } from "@/server/trpc/init";

export const authRouter = router({
  signUp: publicProcedure
    .input(signUpSchema)
    .mutation(({ input }) => createAccount(input)),

  signIn: publicProcedure.input(signInSchema).mutation(async ({ input }) => {
    const account = await authenticate(input);
    await createSession({
      accountId: account.id,
      firstName: account.firstName,
      lastName: account.lastName,
      email: account.email,
    });
    return account;
  }),

  signOut: publicProcedure.mutation(() => deleteSession()),
});
