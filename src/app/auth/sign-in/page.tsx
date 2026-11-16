import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getSession } from "@/server/auth/session";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = {
  title: "Entrar",
};

export default function SignInPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Lê o cookie de sessão: fica atrás de Suspense para não bloquear o shell estático. */}
      <Suspense fallback={null}>
        <RedirectIfSignedIn />
      </Suspense>

      <header className="flex flex-col gap-2.5">
        <h1 className="font-display text-[2rem] font-semibold leading-[1.1] tracking-[-0.025em] text-ink">
          Entre na sua conta
        </h1>
        <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">
          Continue de onde parou: avalie suas compras e veja o que outras
          pessoas acharam.
        </p>
      </header>
      <SignInForm />
    </div>
  );
}

/** Quem já tem sessão válida não precisa ver o login: volta para a home. */
async function RedirectIfSignedIn() {
  const session = await getSession();
  if (session) redirect("/");
  return null;
}
