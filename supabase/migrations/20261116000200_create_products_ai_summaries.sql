-- Resumo das avaliações gerado por IA (agente Mastra review-summarizer).
-- Um resumo por produto; é refeito quando feedback_count difere do total atual de avaliações.
create table if not exists public.products_ai_summaries (
  product_id     text        primary key references public.products(id) on delete cascade,
  summary        text        not null,
  feedback_count int         not null check (feedback_count >= 0), -- nº de avaliações usadas no resumo
  model          text        not null,                             -- ex.: openai/gpt-4o-mini
  generated_at   timestamptz not null default now()
);

-- RLS ligado e sem policies: acesso só pela API (chave secreta do servidor).
alter table public.products_ai_summaries enable row level security;
