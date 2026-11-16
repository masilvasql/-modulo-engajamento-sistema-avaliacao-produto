import Link from "next/link";
import { Suspense } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getSession } from "@/server/auth/session";
import { AccountMenu } from "./account-menu";

/**
 * Cabeçalho da plataforma. O wordmark entra no shell estático; o slot de conta
 * lê o cookie de sessão, por isso fica atrás de Suspense (cacheComponents).
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-paper/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          aria-label="avalia, página inicial"
          className="group flex items-baseline gap-0.5 rounded-sm font-display text-2xl font-semibold tracking-[-0.03em] text-ink outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          avalia
          <span
            aria-hidden
            className="size-1.5 rounded-full bg-marigold transition-transform group-hover:scale-125"
          />
        </Link>

        <Suspense fallback={<AccountSlotSkeleton />}>
          <AccountSlot />
        </Suspense>
      </div>
    </header>
  );
}

async function AccountSlot() {
  const session = await getSession();

  if (!session) {
    return (
      <Link
        href="/auth/sign-in"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-9 rounded-md px-4 text-[0.9375rem] hover:bg-ink/90",
        )}
      >
        Entrar
      </Link>
    );
  }

  return (
    <AccountMenu
      firstName={session.firstName}
      lastName={session.lastName}
      email={session.email}
    />
  );
}

function AccountSlotSkeleton() {
  return (
    <div className="flex items-center gap-2.5" aria-hidden>
      <Skeleton className="hidden h-4 w-24 sm:block" />
      <Skeleton className="size-9 rounded-full" />
    </div>
  );
}
