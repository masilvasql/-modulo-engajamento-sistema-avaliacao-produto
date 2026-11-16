"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CircleAlertIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import {
  INVALID_CREDENTIALS_MESSAGE,
  type SignInData,
  type SignInErrorResponse,
  type SignInInput,
  type SignInSuccessResponse,
  signInSchema,
} from "@/lib/validations/sign-in";

class SignInRequestError extends Error {
  constructor(public readonly body: SignInErrorResponse) {
    super(body.message);
  }
}

async function postSignIn(data: SignInData): Promise<SignInSuccessResponse> {
  let response: Response;
  try {
    response = await fetch("/api/v1/sign-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch {
    throw new SignInRequestError({
      message:
        "Sem conexão com o servidor. Confira sua internet e tente de novo.",
    });
  }

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    // 400 e 401 mostram sempre a mesma mensagem: não revelamos qual campo falhou.
    if (response.status === 400 || response.status === 401) {
      throw new SignInRequestError({ message: INVALID_CREDENTIALS_MESSAGE });
    }
    throw new SignInRequestError(
      body?.message
        ? (body as SignInErrorResponse)
        : { message: "O servidor não respondeu como esperado. Tente de novo." },
    );
  }

  return body as SignInSuccessResponse;
}

/** Estilo comum dos campos: mais altos e com fundo branco sobre o papel. */
const inputClassName =
  "h-11 rounded-md bg-white px-3 text-[0.9375rem] shadow-[inset_0_1px_0_rgb(34_32_74/0.04)] md:text-[0.9375rem]";

export function SignInForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<SignInInput, unknown, SignInData>({
    resolver: zodResolver(signInSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  });

  const signIn = useMutation({
    mutationFn: postSignIn,
    onSuccess: () => {
      router.replace("/");
      // Atualiza os Server Components para o cabeçalho ler a nova sessão.
      router.refresh();
    },
    onError: () => form.setFocus("email"),
  });

  const isSubmitting = signIn.isPending || signIn.isSuccess;
  const { errors } = form.formState;

  return (
    <div className="flex flex-col gap-7">
      <form
        noValidate
        onSubmit={form.handleSubmit((data) => signIn.mutate(data))}
        className="flex flex-col gap-7"
      >
        {signIn.isError && (
          <Alert
            variant="destructive"
            className="rounded-md border-0 border-l-4 border-l-destructive bg-destructive/[0.07] px-3.5 py-3"
          >
            <CircleAlertIcon />
            <AlertTitle className="text-[0.9375rem]">
              Não foi possível entrar
            </AlertTitle>
            <AlertDescription className="text-foreground/80">
              {signIn.error.message}
            </AlertDescription>
          </Alert>
        )}

        <FieldGroup className="gap-5">
          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="email">E-mail</FieldLabel>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="voce@exemplo.com"
              aria-invalid={!!errors.email}
              disabled={isSubmitting}
              className={inputClassName}
              {...form.register("email")}
            />
            <FieldError errors={[errors.email]} />
          </Field>

          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor="password">Senha</FieldLabel>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                disabled={isSubmitting}
                className={cn(inputClassName, "pr-11")}
                {...form.register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-md text-muted-foreground outline-none transition-colors hover:text-ink focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {showPassword ? (
                  <EyeOffIcon className="size-[1.125rem]" />
                ) : (
                  <EyeIcon className="size-[1.125rem]" />
                )}
              </button>
            </div>
            <FieldError errors={[errors.password]} />
          </Field>
        </FieldGroup>

        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="h-11 w-full rounded-md text-[0.9375rem] hover:bg-ink/90"
        >
          {isSubmitting && <Spinner />}
          {isSubmitting ? "Entrando…" : "Entrar"}
        </Button>
      </form>

      <p className="text-center text-[0.9375rem] text-muted-foreground">
        Ainda não tem conta?{" "}
        <Link
          href="/auth/sign-up"
          className="font-medium text-ink underline decoration-marigold decoration-2 underline-offset-4 transition-colors hover:decoration-ink"
        >
          Criar conta
        </Link>
      </p>
    </div>
  );
}
