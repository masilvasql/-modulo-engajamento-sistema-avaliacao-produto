"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CircleAlertIcon, CircleCheckIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, type Path, useForm, useWatch } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  COMMENT_MAX_LENGTH,
  type CreateFeedbackData,
  type CreateFeedbackInput,
  createFeedbackSchema,
  type Feedback,
  type FeedbackErrorResponse,
} from "@/lib/validations/feedbacks";
import { StarInput } from "./star-input";

class FeedbackRequestError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: FeedbackErrorResponse,
  ) {
    super(body.message);
  }
}

async function postFeedback(
  productId: string,
  data: CreateFeedbackData,
): Promise<Feedback> {
  let response: Response;
  try {
    response = await fetch(
      `/api/v1/products/${encodeURIComponent(productId)}/feedbacks`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
    );
  } catch {
    throw new FeedbackRequestError(0, {
      message:
        "Sem conexão com o servidor. Confira sua internet e tente de novo.",
    });
  }

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new FeedbackRequestError(
      response.status,
      body?.message
        ? (body as FeedbackErrorResponse)
        : { message: "O servidor não respondeu como esperado. Tente de novo." },
    );
  }

  return body as Feedback;
}

type FeedbackFormProps = {
  productId: string;
  authorName: string;
};

export function FeedbackForm({ productId, authorName }: FeedbackFormProps) {
  const router = useRouter();

  const form = useForm<CreateFeedbackInput, unknown, CreateFeedbackData>({
    resolver: zodResolver(createFeedbackSchema),
    defaultValues: { score: 0, comment: "" },
  });

  const comment = useWatch({ control: form.control, name: "comment" });

  const publish = useMutation({
    mutationFn: (data: CreateFeedbackData) => postFeedback(productId, data),
    onSuccess: () => {
      form.reset();
      // Recarrega a página no servidor: a nova avaliação entra no topo e a média se atualiza.
      router.refresh();
    },
    onError: (error) => {
      if (!(error instanceof FeedbackRequestError)) return;
      // Reflete nos campos os erros de validação devolvidos pela API.
      for (const [field, messages] of Object.entries(error.body.errors ?? {})) {
        if (messages?.[0]) {
          form.setError(field as Path<CreateFeedbackInput>, {
            message: messages[0],
          });
        }
      }
    },
  });

  const { errors } = form.formState;
  const isSubmitting = publish.isPending;
  const sessionExpired =
    publish.error instanceof FeedbackRequestError &&
    publish.error.status === 401;

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit((data) => publish.mutate(data))}
      className="flex flex-col gap-6 rounded-xl border border-border bg-white px-5 py-6 sm:px-7 sm:py-7"
    >
      <div className="flex flex-col gap-1">
        <h3 className="font-display text-xl font-semibold tracking-[-0.02em] text-ink">
          Escreva sua avaliação
        </h3>
        <p className="text-sm text-muted-foreground">
          Você publica como {authorName}.
        </p>
      </div>

      {publish.isError && (
        <Alert
          variant="destructive"
          className="rounded-md border-0 border-l-4 border-l-destructive bg-destructive/[0.07] px-3.5 py-3"
        >
          <CircleAlertIcon />
          <AlertTitle className="text-[0.9375rem]">
            A avaliação não foi publicada
          </AlertTitle>
          <AlertDescription className="text-foreground/80">
            {sessionExpired ? (
              <>
                Sua sessão expirou. Entre de novo.{" "}
                <Link
                  href="/auth/sign-in"
                  className="font-medium text-ink underline underline-offset-2"
                >
                  Entrar
                </Link>
              </>
            ) : (
              publish.error.message
            )}
          </AlertDescription>
        </Alert>
      )}

      {publish.isSuccess && (
        <output className="flex items-center gap-2 rounded-md border-l-4 border-l-marigold bg-marigold/10 px-3.5 py-3 text-[0.9375rem] font-medium text-ink">
          <CircleCheckIcon aria-hidden className="size-4 text-ink" />
          Avaliação publicada
        </output>
      )}

      <FieldGroup className="gap-6">
        <Field data-invalid={!!errors.score}>
          <FieldTitle id="score-label">Sua nota</FieldTitle>
          <Controller
            control={form.control}
            name="score"
            render={({ field }) => (
              <StarInput
                name={field.name}
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  publish.reset();
                }}
                onBlur={field.onBlur}
                disabled={isSubmitting}
                invalid={!!errors.score}
                aria-labelledby="score-label"
                aria-describedby={errors.score ? "score-error" : undefined}
              />
            )}
          />
          <FieldError id="score-error" errors={[errors.score]} />
        </Field>

        <Field data-invalid={!!errors.comment}>
          <FieldLabel htmlFor="comment">Comentário</FieldLabel>
          <Textarea
            id="comment"
            rows={5}
            maxLength={COMMENT_MAX_LENGTH}
            placeholder="O que funcionou, o que deixou a desejar e para quem você indica."
            aria-invalid={!!errors.comment}
            aria-describedby="comment-count"
            disabled={isSubmitting}
            className="min-h-32 rounded-md bg-white px-3 py-2.5 text-[0.9375rem] leading-relaxed md:text-[0.9375rem]"
            {...form.register("comment", {
              onChange: () => publish.isSuccess && publish.reset(),
            })}
          />
          <div className="flex items-start justify-between gap-4">
            <FieldError errors={[errors.comment]} />
            <p
              id="comment-count"
              className={cn(
                "ml-auto shrink-0 text-sm tabular-nums",
                comment.length >= COMMENT_MAX_LENGTH
                  ? "text-destructive"
                  : "text-muted-foreground",
              )}
            >
              {comment.length}/{COMMENT_MAX_LENGTH}
            </p>
          </div>
        </Field>
      </FieldGroup>

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="h-11 w-full rounded-md text-[0.9375rem] hover:bg-ink/90 sm:w-fit sm:px-6"
      >
        {isSubmitting && <Spinner />}
        {isSubmitting ? "Publicando…" : "Publicar avaliação"}
      </Button>
    </form>
  );
}
