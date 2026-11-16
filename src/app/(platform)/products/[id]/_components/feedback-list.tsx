import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Feedback } from "@/lib/validations/feedbacks";
import { StarDisplay } from "./stars";

export function FeedbackList({ items }: { items: Feedback[] }) {
  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-input bg-white/60 px-6 py-10 text-center text-[0.9375rem] text-muted-foreground">
        Ninguém avaliou ainda. Seja a primeira pessoa.
      </p>
    );
  }

  return (
    <ol className="flex flex-col divide-y divide-border rounded-xl border border-border bg-white">
      {items.map((feedback) => (
        <FeedbackItem key={feedback.id} feedback={feedback} />
      ))}
    </ol>
  );
}

function FeedbackItem({ feedback }: { feedback: Feedback }) {
  const fullName =
    `${feedback.author.firstName} ${feedback.author.lastName}`.trim() ||
    "Pessoa usuária";
  const createdAt = new Date(feedback.createdAt);

  return (
    <li className="flex gap-4 px-5 py-6 sm:px-7">
      {/* biome-ignore lint/performance/noImgElement: avatar externo (DiceBear) sem next/image (decisão do projeto) */}
      <img
        src={`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(fullName)}`}
        alt=""
        width={40}
        height={40}
        loading="lazy"
        className="size-10 shrink-0 rounded-full bg-muted"
      />
      <article className="flex min-w-0 flex-1 flex-col gap-2">
        <header className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h3 className="font-medium text-ink">{fullName}</h3>
          <StarDisplay value={feedback.score} starClassName="size-4" />
          <time
            dateTime={feedback.createdAt}
            title={format(createdAt, "d 'de' MMMM 'de' yyyy, HH:mm", {
              locale: ptBR,
            })}
            className="text-sm text-muted-foreground"
          >
            {formatDistanceToNow(createdAt, { addSuffix: true, locale: ptBR })}
          </time>
        </header>
        <p className="max-w-[68ch] whitespace-pre-line break-words text-[0.9375rem] leading-relaxed text-foreground/85">
          {feedback.comment}
        </p>
      </article>
    </li>
  );
}
