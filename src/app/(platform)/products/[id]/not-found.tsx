import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StarDisplay } from "./_components/stars";

export default function ProductNotFound() {
  return (
    <div className="flex max-w-xl flex-col items-start gap-5 py-10">
      <span aria-hidden>
        <StarDisplay value={0} starClassName="size-7" />
      </span>
      <h1 className="font-display text-[clamp(2rem,4vw,2.75rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-balance text-ink">
        Não encontramos este produto
      </h1>
      <p className="text-[1.0625rem] leading-relaxed text-muted-foreground">
        O link pode estar errado ou o produto saiu do catálogo. Volte para a
        lista e escolha outro.
      </p>
      <Link
        href="/"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 rounded-md px-5 text-[0.9375rem] hover:bg-ink/90",
        )}
      >
        Ver todos os produtos
      </Link>
    </div>
  );
}
