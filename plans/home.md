# Plano — Home (Listagem de produtos)

Spec: `specs/home.md` · Agente: **Home** · Depende da Fase 0 (`plans/_orquestracao.md`)

## Objetivo

A home (`/`) lista publicamente todos os produtos, com scroll infinito. Cada card mostra imagem, nome e descrição curta, e o nome leva para `/products/{id}` (página criada pelo agente Feedback). Também há um endpoint para inserir produtos manualmente.

## Interpretações da spec

- "Criar uma nova conta na tabela `products`" → criar a **tabela** `products`.
- "Você não deve: nada além de sign-up" é cópia da spec anterior → leio como "nada além da **listagem de produtos**".
- **❓ `score: boolean`** — não faz sentido como nota. Proposta: **não criar** `score` em `products`; a nota média vem de `products_feedbacks` (feature Feedback). Se preferir seguir a spec literalmente, crio `score boolean not null default false`.
- **❓ Imagem** — a spec pede imagem no card e no POST mas não lista a coluna. Proposta: `image_url text` (URL externa). Sem upload de arquivo.
- **❓ POST** — a spec diz `POST /products`; uso `POST /api/v1/products` para manter o padrão da API, protegido por header `x-admin-key` (env `ADMIN_API_KEY`).
- **❓ Resposta do GET** — scroll infinito precisa de cursor: `{ items, nextCursor }`. "Array vazio" = `items: []`.

## Banco de dados

### 1. Migration `supabase/migrations/20261116000000_create_products.sql`
```sql
create table if not exists public.products (
  id            text        primary key,          -- nanoid gerado na API
  name          text        not null,
  description   text,                             -- opcional
  image_url     text,                             -- ❓ decisão 2
  external_link text        not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
  -- score: ❓ decisão 1
);
create index if not exists products_created_at_id_idx on public.products (created_at desc, id desc);
-- trigger reaproveitando public.set_updated_at() (já existe na migration de accounts)
alter table public.products enable row level security; -- acesso só pela API
```

## Back-end

### 2. Validação — `src/lib/validations/products.ts`
- `createProductSchema`: `name` (1–200), `description` (opcional, até 1000), `externalLink` (`z.url`, http/https), `imageUrl` (`z.url`, opcional).
- `listProductsSchema`: `cursor` (string opcional), `limit` (1–50, padrão **12**).
- Tipos `Product` (`{ id, name, description, imageUrl, externalLink, createdAt }`) e `ProductsPage` (`{ items: Product[]; nextCursor: string | null }`).

### 3. Serviço — `src/server/products/`
- `list-products.ts`: **paginação por cursor** (keyset) sobre `(created_at desc, id desc)`. O cursor é `base64url(created_at|id)`. Busca `limit + 1` para saber se há próxima página. Mais rápido e estável que `offset` quando entram produtos novos durante o scroll.
- `create-product.ts`: `id = nanoid()`, insert, retorna o `Product`.

### 4. tRPC — `src/server/trpc/routers/products.ts`
- `list: publicProcedure.input(listProductsSchema).query(...)`
- `create: publicProcedure.input(createProductSchema).mutation(...)` (a checagem da chave admin fica na rota REST).

### 5. Rota REST — `src/app/api/v1/products/route.ts`
- `GET /api/v1/products?cursor=&limit=` → `200 { items, nextCursor }` (público). `400` se os query params forem inválidos.
- `POST /api/v1/products` → `201 Product`. `401` sem `x-admin-key` válido, `400` dados inválidos.
- `ADMIN_API_KEY` adicionada ao `.env.example` (me reportar; o arquivo é compartilhado, eu aplico).

## Front-end

### 6. Página `/` — `src/app/(platform)/page.tsx`
- Server Component: cabeçalho da seção ("Produtos avaliados por quem comprou" + subtítulo) e a **primeira página pré-carregada no servidor** (sem esperar o JS), passada como `initialData` para o client — primeira pintura rápida.
- A lista fica dentro de `<Suspense>` com skeleton (exigido por `cacheComponents`).

### 7. Lista infinita — `src/app/(platform)/_components/`
- `product-feed.tsx` (client): `useInfiniteQuery` (React Query) chamando `GET /api/v1/products?cursor=`; um `IntersectionObserver` em um sentinela no fim da lista carrega a próxima página com antecedência (`rootMargin: "400px"`).
- `product-card.tsx`: imagem (`<img loading="lazy">`, proporção 4:3, `object-cover`; sem imagem → placeholder Tinta com a inicial do produto), nome em Bricolage como `<Link href="/products/{id}">` (link cobre o card inteiro, com foco visível), descrição com `line-clamp-2`, domínio do `external_link` em texto pequeno Grafite.
- `product-card-skeleton.tsx`: usado no carregamento inicial e ao fim da lista ao buscar mais.
- Grid responsivo: 1 coluna (mobile), 2 (sm), 3 (lg), 4 (xl).
- Estados: **vazio** ("Nenhum produto por aqui ainda"), **erro** (alert com botão "Tentar de novo"), **fim da lista** ("Você viu todos os produtos").
- Hover sutil (leve elevação, borda Tinta), respeitando `prefers-reduced-motion`.

## Arquivos

Novos: migration, `src/lib/validations/products.ts`, `src/server/products/list-products.ts`, `src/server/products/create-product.ts`, `src/app/api/v1/products/route.ts`, `src/app/(platform)/_components/product-feed.tsx`, `product-card.tsx`, `product-card-skeleton.tsx`.
Editados: `src/server/trpc/routers/products.ts` (stub → implementação), `src/app/(platform)/page.tsx` (stub → implementação).

## Verificação

- Script de seed (em `scripts/seed-products.ts`, usa o POST) com ~30 produtos para testar o scroll infinito.
- `curl`: GET sem produtos → `{ items: [], nextCursor: null }`; paginação devolve páginas sem repetir itens; POST sem chave → 401, com dados ruins → 400, válido → 201.
- Na UI: skeleton → primeira página → carrega mais ao rolar → mensagem de fim; clique no nome navega para `/products/{id}`.
- `bunx tsc --noEmit` e `bun run lint`.

## Fora do escopo
Busca, filtros, ordenação, página de detalhes (Feedback), edição/remoção de produtos, upload de imagem.
