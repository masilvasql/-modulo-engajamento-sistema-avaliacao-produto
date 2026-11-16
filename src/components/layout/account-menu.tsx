"use client";

import { useMutation } from "@tanstack/react-query";
import { ChevronDownIcon, LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";

type AccountMenuProps = {
  firstName: string;
  lastName: string;
  email: string;
};

/** Avatar mockado pelo DiceBear (iniciais), nas cores da marca. */
function avatarUrl(fullName: string) {
  const params = new URLSearchParams({
    seed: fullName,
    backgroundColor: "22204a",
    textColor: "ffffff",
    fontWeight: "600",
  });
  return `https://api.dicebear.com/9.x/initials/svg?${params}`;
}

function initials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

async function postSignOut() {
  const response = await fetch("/api/v1/sign-out", { method: "POST" });
  if (!response.ok) throw new Error("Não foi possível sair. Tente de novo.");
}

export function AccountMenu({ firstName, lastName, email }: AccountMenuProps) {
  const router = useRouter();
  const fullName = `${firstName} ${lastName}`;

  const signOut = useMutation({
    mutationFn: postSignOut,
    // Atualiza os Server Components para o cabeçalho voltar ao estado deslogado.
    onSuccess: () => router.refresh(),
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Menu da conta de ${fullName}`}
        className="group flex items-center gap-2.5 rounded-full py-1 pr-1 pl-1 outline-none transition-colors hover:bg-ink/[0.05] focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:bg-ink/[0.05] sm:pl-3"
      >
        <span className="hidden max-w-40 truncate text-[0.9375rem] font-medium text-ink sm:block">
          {fullName}
        </span>
        <ChevronDownIcon
          aria-hidden
          className="hidden size-4 text-muted-foreground transition-transform group-data-popup-open:rotate-180 sm:block"
        />
        <Avatar className="size-9 after:border-ink/10">
          <AvatarImage src={avatarUrl(fullName)} alt="" />
          <AvatarFallback className="bg-ink text-xs font-semibold text-white">
            {initials(firstName, lastName)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-64 rounded-lg p-1.5 shadow-lg shadow-ink/10"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center gap-3 px-2 py-2">
            <Avatar className="size-10 after:border-ink/10">
              <AvatarImage src={avatarUrl(fullName)} alt="" />
              <AvatarFallback className="bg-ink text-sm font-semibold text-white">
                {initials(firstName, lastName)}
              </AvatarFallback>
            </Avatar>
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate font-display text-[0.9375rem] font-semibold tracking-[-0.01em] text-ink">
                {fullName}
              </span>
              <span className="truncate text-[0.8125rem] font-normal text-muted-foreground">
                {email}
              </span>
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          closeOnClick={false}
          disabled={signOut.isPending || signOut.isSuccess}
          onClick={() => signOut.mutate()}
          className="gap-2 px-2 py-2 text-[0.9375rem]"
        >
          {signOut.isPending ? <Spinner /> : <LogOutIcon aria-hidden />}
          {signOut.isPending
            ? "Saindo…"
            : signOut.isError
              ? "Não deu certo. Sair de novo"
              : "Sair"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
