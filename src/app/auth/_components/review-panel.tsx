import { BadgeCheckIcon } from "lucide-react";
import { StarRating } from "./star-rating";

/**
 * Painel de marca das telas de autenticação: mostra uma avaliação de exemplo,
 * com elogio e ressalva, para comunicar o tipo de opinião que a plataforma reúne.
 */
export function ReviewPanel() {
  return (
    <aside className="relative flex flex-col justify-between gap-3 bg-ink px-6 py-6 text-white sm:px-10 lg:min-h-dvh lg:px-14 lg:py-12">
      <Wordmark />

      <figure className="hidden max-w-xl flex-col gap-7 lg:flex">
        <StarRating value={4} animated />
        <blockquote className="font-display text-[clamp(1.75rem,2.5vw,2.5rem)] font-medium leading-[1.12] tracking-[-0.02em] text-balance">
          “Som limpo e cancelamento de ruído que funciona até no metrô. Tirei
          uma estrela porque a bateria dura 22 horas, não as 30 prometidas.”
        </blockquote>
        <figcaption className="flex flex-col gap-1 text-[0.9375rem] text-lavender">
          <span className="font-medium text-white">
            Juliana R. avaliou o fone Aura X2
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BadgeCheckIcon className="size-4 text-marigold" aria-hidden />
            Compra verificada
          </span>
        </figcaption>
      </figure>

      <p className="max-w-md text-[0.9375rem] leading-relaxed text-pretty text-lavender">
        Avaliações escritas por quem comprou, com os prós e os poréns.
      </p>
    </aside>
  );
}

function Wordmark() {
  return (
    <span className="font-display text-2xl font-semibold tracking-[-0.03em]">
      avalia
      <span className="text-marigold" aria-hidden>
        .
      </span>
    </span>
  );
}
