-- Tabela de produtos (spec: specs/home.md · plano: plans/home.md)
-- Sem coluna `score`: a nota vem da média de products_feedbacks (decisão aprovada).
create table if not exists public.products (
  id            text        primary key,              -- nanoid gerado na API
  name          text        not null,
  description   text,                                 -- opcional
  image_url     text,                                 -- URL externa da imagem (opcional)
  external_link text        not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Índice da paginação por cursor (keyset) usada na home: (created_at desc, id desc)
create index if not exists products_created_at_id_idx
  on public.products (created_at desc, id desc);

-- Mantém updated_at atualizado (função criada na migration de accounts)
drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row
  execute function public.set_updated_at();

-- RLS ligado e sem policies: a tabela só é acessível pela API (chave secreta do servidor).
alter table public.products enable row level security;
