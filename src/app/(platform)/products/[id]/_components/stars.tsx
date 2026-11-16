import { cn } from "@/lib/utils";

/** Mesmo desenho de estrela do painel de autenticação. */
export const STAR_PATH =
  "M12 2.6l2.82 5.72 6.31.92-4.57 4.45 1.08 6.29L12 17.01l-5.64 2.97 1.08-6.29L2.87 9.24l6.31-.92L12 2.6z";

type StarProps = {
  /** Fração preenchida, de 0 a 1. */
  fill: number;
  className?: string;
  /** Cor do contorno quando vazia. */
  emptyClassName?: string;
};

/** Uma estrela com contorno e preenchimento parcial (para médias fracionadas). */
export function Star({
  fill,
  className,
  emptyClassName = "stroke-ink/20",
}: StarProps) {
  const percent = Math.max(0, Math.min(1, fill)) * 100;
  return (
    <span className={cn("relative inline-block size-5 shrink-0", className)}>
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={cn("absolute inset-0 size-full fill-none", emptyClassName)}
        strokeWidth={1.4}
        strokeLinejoin="round"
      >
        <path d={STAR_PATH} />
      </svg>
      {percent > 0 && (
        <span
          className="absolute inset-y-0 left-0 overflow-hidden"
          style={{ width: `${percent}%` }}
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-full w-auto max-w-none fill-marigold"
            style={{ aspectRatio: "1 / 1" }}
          >
            <path d={STAR_PATH} />
          </svg>
        </span>
      )}
    </span>
  );
}

type StarDisplayProps = {
  value: number;
  max?: number;
  className?: string;
  starClassName?: string;
  emptyClassName?: string;
  label?: string;
};

/** Nota somente leitura, com suporte a valores fracionados. */
export function StarDisplay({
  value,
  max = 5,
  className,
  starClassName,
  emptyClassName,
  label,
}: StarDisplayProps) {
  return (
    <span
      role="img"
      aria-label={label ?? `Nota ${formatScore(value)} de ${max}`}
      className={cn("inline-flex items-center gap-0.5", className)}
    >
      {Array.from({ length: max }, (_, index) => index).map((index) => (
        <Star
          key={index}
          fill={value - index}
          className={starClassName}
          emptyClassName={emptyClassName}
        />
      ))}
    </span>
  );
}

/** Formata a nota no padrão brasileiro: 4,5. */
export function formatScore(value: number) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
    maximumFractionDigits: 1,
  });
}
