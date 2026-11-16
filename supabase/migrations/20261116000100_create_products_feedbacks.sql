-- Avaliações de produtos (spec: specs/feedback.md)
-- Depende de public.accounts e public.products (migrations anteriores).
-- Uma pessoa pode publicar várias avaliações no mesmo produto (sem unique).
create table if not exists public.products_feedbacks (
  id          text        primary key,                 -- nanoid gerado na API
  score       int         not null check (score between 1 and 5),
  comment     text        not null check (char_length(comment) between 1 and 2000),
  created_at  timestamptz not null default now(),
  created_by  text        not null references public.accounts (id) on delete cascade,
  product_id  text        not null references public.products (id) on delete cascade
);

-- Listagem por produto, mais recentes primeiro.
create index if not exists products_feedbacks_product_created_idx
  on public.products_feedbacks (product_id, created_at desc);

-- Índice para a FK de autor (cascade ao apagar conta).
create index if not exists products_feedbacks_created_by_idx
  on public.products_feedbacks (created_by);

-- RLS ligado e sem policies: a tabela só é acessível pela API (chave secreta do servidor).
alter table public.products_feedbacks enable row level security;
