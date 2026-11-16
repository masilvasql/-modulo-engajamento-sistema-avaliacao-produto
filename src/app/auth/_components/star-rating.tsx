import { cn } from "@/lib/utils";

const STAR_PATH =
  "M12 2.6l2.82 5.72 6.31.92-4.57 4.45 1.08 6.29L12 17.01l-5.64 2.97 1.08-6.29L2.87 9.24l6.31-.92L12 2.6z";

type StarRatingProps = {
  value: number;
  max?: number;
  className?: string;
  /** Acende as estrelas em sequência ao carregar (respeita reduced motion). */
  animated?: boolean;
};

export function StarRating({
  value,
  max = 5,
  className,
  animated = false,
}: StarRatingProps) {
  return (
    <div
      role="img"
      aria-label={`Nota ${value} de ${max}`}
      className={cn("flex items-center gap-1.5", className)}
    >
      {Array.from({ length: max }, (_, i) => i).map((index) => {
        const filled = index < value;
        return (
          <span key={index} className="relative size-7">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="absolute inset-0 size-full fill-none stroke-lavender/35"
              strokeWidth={1.4}
              strokeLinejoin="round"
            >
              <path d={STAR_PATH} />
            </svg>
            {filled && (
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className={cn(
                  "absolute inset-0 size-full fill-marigold",
                  animated && "star-light",
                )}
                style={
                  animated
                    ? ({ "--star-index": index } as React.CSSProperties)
                    : undefined
                }
              >
                <path d={STAR_PATH} />
              </svg>
            )}
          </span>
        );
      })}
    </div>
  );
}
