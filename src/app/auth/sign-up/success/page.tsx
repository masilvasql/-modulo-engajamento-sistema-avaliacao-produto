import { CheckIcon } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conta criada",
};

export default function SignUpSuccessPage() {
  return (
    <div className="flex flex-col gap-6">
      <span className="flex size-12 items-center justify-center rounded-full bg-marigold text-ink">
        <CheckIcon className="size-6" strokeWidth={2.5} aria-hidden />
      </span>
      <div className="flex flex-col gap-2.5">
        <h1 className="font-display text-[2rem] font-semibold leading-[1.1] tracking-[-0.025em] text-ink">
          Sua conta está pronta
        </h1>
        <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">
          Em breve você vai poder entrar e publicar sua primeira avaliação.
        </p>
      </div>
    </div>
  );
}
