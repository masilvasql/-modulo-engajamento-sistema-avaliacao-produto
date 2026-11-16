import { LockKeyholeIcon } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Bloco exibido no lugar do formulário para quem não entrou na conta. */
export function SignInRequired() {
  return (
    <div className="flex flex-col gap-5 rounded-xl bg-ink px-6 py-7 text-white sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <div className="flex items-start gap-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10">
          <LockKeyholeIcon aria-hidden className="size-5 text-marigold" />
        </span>
        <div className="flex flex-col gap-1">
          <h3 className="font-display text-xl font-semibold tracking-[-0.02em]">
            Entre para avaliar este produto
          </h3>
          <p className="text-[0.9375rem] text-lavender">
            Qualquer pessoa lê as avaliações. Para publicar a sua, entre na sua
            conta.
          </p>
        </div>
      </div>
      <div className="flex shrink-0 gap-3">
        <Link
          href="/auth/sign-in"
          className={cn(
            buttonVariants({ size: "lg" }),
            "h-11 rounded-md bg-marigold px-5 text-[0.9375rem] text-ink hover:bg-marigold/90",
          )}
        >
          Entrar
        </Link>
        <Link
          href="/auth/sign-up"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "h-11 rounded-md border-white/30 bg-transparent px-5 text-[0.9375rem] text-white hover:bg-white/10 hover:text-white",
          )}
        >
          Criar conta
        </Link>
      </div>
    </div>
  );
}
