"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CheckIcon, CircleAlertIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { type Path, useForm, useWatch } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import {
  type SignUpData,
  type SignUpErrorResponse,
  type SignUpInput,
  type SignUpSuccessResponse,
  signUpSchema,
} from "@/lib/validations/sign-up";

const MIN_PASSWORD_LENGTH = 8;

class SignUpRequestError extends Error {
  constructor(public readonly body: SignUpErrorResponse) {
    super(body.message);
  }
}

async function postSignUp(data: SignUpData): Promise<SignUpSuccessResponse> {
  let response: Response;
  try {
    response = await fetch("/api/v1/sign-up", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch {
    throw new SignUpRequestError({
      message:
        "Sem conexão com o servidor. Confira sua internet e tente de novo.",
    });
  }

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new SignUpRequestError(
      body?.message
        ? (body as SignUpErrorResponse)
        : { message: "O servidor não respondeu como esperado. Tente de novo." },
    );
  }

  return body as SignUpSuccessResponse;
}

/** Estilo comum dos campos: mais altos e com fundo branco sobre o papel. */
const inputClassName =
  "h-11 rounded-md bg-white px-3 text-[0.9375rem] shadow-[inset_0_1px_0_rgb(34_32_74/0.04)] md:text-[0.9375rem]";

export function SignUpForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<SignUpInput, unknown, SignUpData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = useWatch({ control: form.control, name: "password" });
  const passwordLongEnough = password.length >= MIN_PASSWORD_LENGTH;

  const signUp = useMutation({
    mutationFn: postSignUp,
    onSuccess: () => router.push("/auth/sign-up/success"),
    onError: (error) => {
      if (!(error instanceof SignUpRequestError)) return;
      // Reflete nos campos os erros de validação devolvidos pela API.
      for (const [field, messages] of Object.entries(error.body.errors ?? {})) {
        if (messages?.[0]) {
          form.setError(field as Path<SignUpInput>, { message: messages[0] });
        }
      }
    },
  });

  const isSubmitting = signUp.isPending || signUp.isSuccess;
  const { errors } = form.formState;

  const textField = (
    name: Path<SignUpInput>,
    label: string,
    props: React.ComponentProps<"input">,
  ) => (
    <Field data-invalid={!!errors[name]}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Input
        id={name}
        aria-invalid={!!errors[name]}
        disabled={isSubmitting}
        className={inputClassName}
        {...props}
        {...form.register(name)}
      />
      <FieldError errors={[errors[name]]} />
    </Field>
  );

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit((data) => signUp.mutate(data))}
      className="flex flex-col gap-7"
    >
      {signUp.isError && (
        <Alert
          variant="destructive"
          className="rounded-md border-0 border-l-4 border-l-destructive bg-destructive/[0.07] px-3.5 py-3"
        >
          <CircleAlertIcon />
          <AlertTitle className="text-[0.9375rem]">
            A conta não foi criada
          </AlertTitle>
          <AlertDescription className="text-foreground/80">
            {signUp.error.message}
          </AlertDescription>
        </Alert>
      )}

      <FieldGroup className="gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          {textField("firstName", "Nome", {
            type: "text",
            autoComplete: "given-name",
          })}
          {textField("lastName", "Sobrenome", {
            type: "text",
            autoComplete: "family-name",
          })}
        </div>

        {textField("email", "E-mail", {
          type: "email",
          autoComplete: "email",
          inputMode: "email",
          placeholder: "voce@exemplo.com",
        })}

        <Field data-invalid={!!errors.password}>
          <FieldLabel htmlFor="password">Senha</FieldLabel>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              aria-describedby="password-hint"
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
          {errors.password ? (
            <FieldError errors={[errors.password]} />
          ) : (
            <FieldDescription
              id="password-hint"
              className={cn(
                "flex items-center gap-1.5 text-sm transition-colors",
                passwordLongEnough
                  ? "text-emerald-700"
                  : "text-muted-foreground",
              )}
            >
              <CheckIcon
                aria-hidden
                className={cn(
                  "size-3.5 transition-opacity",
                  passwordLongEnough ? "opacity-100" : "opacity-40",
                )}
              />
              Use {MIN_PASSWORD_LENGTH} caracteres ou mais
            </FieldDescription>
          )}
        </Field>

        {textField("confirmPassword", "Confirme a senha", {
          type: showPassword ? "text" : "password",
          autoComplete: "new-password",
        })}
      </FieldGroup>

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="h-11 w-full rounded-md text-[0.9375rem] hover:bg-ink/90"
      >
        {isSubmitting && <Spinner />}
        {isSubmitting ? "Criando sua conta…" : "Criar conta"}
      </Button>

      <p className="text-center text-[0.9375rem] text-muted-foreground">
        Já tem conta?{" "}
        <Link
          href="/auth/sign-in"
          className="font-medium text-ink underline decoration-marigold decoration-2 underline-offset-4 transition-colors hover:decoration-ink"
        >
          Entrar
        </Link>
      </p>
    </form>
  );
}
