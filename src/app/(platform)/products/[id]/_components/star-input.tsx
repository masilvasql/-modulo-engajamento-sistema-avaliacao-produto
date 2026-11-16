"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  MAX_SCORE,
  MIN_SCORE,
  SCORE_LABELS,
} from "@/lib/validations/feedbacks";
import { STAR_PATH } from "./stars";

type StarInputProps = {
  name: string;
  value: number;
  onChange: (value: number) => void;
  onBlur?: () => void;
  disabled?: boolean;
  invalid?: boolean;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
};

const SCORES = Array.from(
  { length: MAX_SCORE - MIN_SCORE + 1 },
  (_, index) => MIN_SCORE + index,
);

/**
 * Seletor de nota acessível: radios nativos (setas do teclado mudam a nota)
 * desenhados como estrelas. O mouse mostra uma prévia e cada nota tem rótulo.
 */
export function StarInput({
  name,
  value,
  onChange,
  onBlur,
  disabled = false,
  invalid = false,
  ...aria
}: StarInputProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const preview = hovered ?? value;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <fieldset
        disabled={disabled}
        aria-invalid={invalid}
        onMouseLeave={() => setHovered(null)}
        className="flex items-center gap-1"
        {...aria}
      >
        {SCORES.map((score) => {
          const filled = score <= preview;
          return (
            <label
              key={score}
              onMouseEnter={() => setHovered(score)}
              className="rounded-md p-1 transition-transform has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50 has-[:disabled]:opacity-50 active:scale-90 motion-reduce:transition-none [&:not(:has(:disabled))]:cursor-pointer"
            >
              <input
                type="radio"
                name={name}
                value={score}
                checked={value === score}
                onChange={() => onChange(score)}
                onBlur={onBlur}
                aria-label={`${score} de ${MAX_SCORE}: ${SCORE_LABELS[score]}`}
                className="sr-only"
              />
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                strokeWidth={1.4}
                strokeLinejoin="round"
                className={cn(
                  "size-9 transition-colors motion-reduce:transition-none",
                  filled
                    ? "fill-marigold stroke-marigold"
                    : cn(
                        "fill-transparent",
                        invalid ? "stroke-destructive/60" : "stroke-ink/25",
                      ),
                )}
              >
                <path d={STAR_PATH} />
              </svg>
            </label>
          );
        })}
      </fieldset>
      <span
        aria-hidden
        className={cn(
          "min-w-20 font-display text-lg font-medium tracking-[-0.01em]",
          preview >= MIN_SCORE ? "text-ink" : "text-muted-foreground",
        )}
      >
        {preview >= MIN_SCORE ? SCORE_LABELS[preview] : "Escolha uma nota"}
      </span>
    </div>
  );
}
