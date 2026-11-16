import type { Metadata } from "next";
import { SignUpForm } from "./sign-up-form";

export const metadata: Metadata = {
  title: "Criar conta",
};

export default function SignUpPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2.5">
        <h1 className="font-display text-[2rem] font-semibold leading-[1.1] tracking-[-0.025em] text-ink">
          Crie sua conta
        </h1>
        <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">
          Com ela você avalia o que comprou e confere o que outras pessoas
          acharam antes de decidir.
        </p>
      </header>
      <SignUpForm />
    </div>
  );
}
