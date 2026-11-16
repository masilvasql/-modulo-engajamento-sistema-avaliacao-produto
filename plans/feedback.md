# Plano — Feedback (Avaliações de produtos)

Spec: `specs/feedback.md` · Agente: **Feedback** · Depende da Fase 0 (`plans/_orquestracao.md`)

## Objetivo

A página `/products/{id}` mostra o produto, todas as avaliações já feitas e, no fim, o formulário para uma nova avaliação (nota 1–5 + comentário). Quem não está logado vê as avaliações, mas no lugar do formulário aparece um bloco pedindo login.

## Interpretações da spec

- "Nova de 1-5" → **nota** de 1 a 5.
- "Você não deve: nada além de sign-up" é cópia → leio como "nada além de **avaliações**".
- `created_by` é o `id` da conta (`accounts.id`) e `product_id` é `products.id` — ambos com **foreign key**.
- **❓ Várias avaliações por pessoa no mesmo produto?** A spec não restringe; proposta: permitir. Se quiser uma por pessoa, adiciono `unique (product_id, created_by)` e respondo `409`.

## Banco de dados

### 1. Migration `supabase/migrations/20261116000100_create_products_feedbacks.sql`
(timestamp depois da migration de `products`, por causa da FK)
```sql
create table if not exists public.products_feedbacks (
  id          text        primary key,                                  -- nanoid
  score       int         not null check (score between 1 and 5),
  comment     text        not null check (char_length(comment) between 1 and 2000),
  created_at  timestamptz not null default now(),
  created_by  text        not null references public.accounts(id) on delete cascade,
  product_id  text        not null references public.products(id) on delete cascade
);
create index if not exists products_feedbacks_product_created_idx
  on public.products_feedbacks (product_id, created_at desc);
alter table public.products_feedbacks enable row level security; -- acesso só pela API
```

## Back-end

### 2. Validação — `src/lib/validations/feedbacks.ts`
- `createFeedbackSchema`: `score` (`z.int().min(1).max(5)`), `comment` (trim, 3–2000 caracteres).
- Tipo `Feedback`: `{ id, score, comment, createdAt, author: { firstName, lastName } }`.

### 3. Serviço — `src/server/feedbacks/`
- `get-product.ts`: produto por `id` (só lê `products`; independente do código do agente Home). Não encontrado → `null`.
- `list-feedbacks.ts`: avaliações do produto, mais recentes primeiro, com `join` em `accounts` para pegar só `first_name` e `last_name` (nunca e-mail). Retorna também `count` e `average`.
- `create-feedback.ts`: confere se o produto existe (`404` se não), `id = nanoid()`, `created_by = session.accountId` (**vem da sessão, nunca do body**), insert e retorna o `Feedback` criado.

### 4. tRPC — `src/server/trpc/routers/feedbacks.ts`
- `listByProduct: publicProcedure` → `{ items, count, average }`.
- `create: protectedProcedure.input(createFeedbackSchema.extend({ productId }))` → `Feedback`.

### 5. Rota REST — `src/app/api/v1/products/[id]/feedbacks/route.ts`
- `POST` → `201 Feedback` · `400` dados inválidos · `401` sem sessão · `404` produto inexistente.
- `GET` → `200 { items, count, average }` (público; usado para atualizar a lista depois de enviar).

## Front-end

### 6. Página `/products/[id]` — `src/app/(platform)/products/[id]/page.tsx`
- Server Component; `params` é async no Next 16. Produto inexistente → `notFound()` (com `not-found.tsx` amigável e link de volta para a home).
- `generateMetadata` com o nome do produto.
- **Bloco do produto**: imagem grande (ou placeholder Tinta com inicial), nome em Bricolage, descrição, link externo "Ver na loja ↗" (`target="_blank" rel="noopener noreferrer"`), e o **resumo das notas**: média em destaque com estrelas Estrela + "N avaliações".
- **Lista de avaliações** (`feedback-list.tsx`): cada item com avatar DiceBear do autor, nome + sobrenome, estrelas, data relativa (`date-fns` com locale `ptBR`, ex.: "há 2 dias") e comentário. Estado vazio: "Ninguém avaliou ainda. Seja a primeira pessoa."
- **Área do formulário** dentro de `<Suspense>` (lê sessão → dinâmico com `cacheComponents`):
  - **Deslogado** → `sign-in-required.tsx`: card com texto "Entre para avaliar este produto" + botões "Entrar" (`/auth/sign-in`) e "Criar conta" (`/auth/sign-up`).
  - **Logado** → `feedback-form.tsx` (client).

### 7. Formulário — `feedback-form.tsx`
- React Hook Form + `zodResolver(createFeedbackSchema)`.
- **Seletor de estrelas** acessível (`radiogroup`, setas do teclado, hover mostra prévia, rótulos "Péssimo / Ruim / Ok / Bom / Excelente"). Reutiliza o visual de `auth/_components/star-rating.tsx` sem alterá-lo (componente novo e interativo, dentro da pasta da página).
- `Textarea` com contador de caracteres.
- `useMutation` → `POST /api/v1/products/{id}/feedbacks`. Botão com `Spinner`.
- Erro → `Alert` vermelho no formulário (mesmo estilo do sign-in/sign-up). `401` → mensagem "Sua sessão expirou. Entre de novo." com link.
- Sucesso → limpa o formulário, `router.refresh()` para a nova avaliação aparecer no topo da lista e a média atualizar, e uma confirmação curta "Avaliação publicada".

## Arquivos

Novos: migration, `src/lib/validations/feedbacks.ts`, `src/server/feedbacks/{get-product,list-feedbacks,create-feedback}.ts`, `src/app/api/v1/products/[id]/feedbacks/route.ts`, `src/app/(platform)/products/[id]/{page,not-found,loading}.tsx`, `src/app/(platform)/products/[id]/_components/{product-summary,feedback-list,feedback-form,star-input,sign-in-required}.tsx`.
Editado: `src/server/trpc/routers/feedbacks.ts` (stub → implementação).

## Verificação

- `curl`: POST sem cookie → 401; com cookie e nota 0/6 → 400; produto inexistente → 404; válido → 201. GET retorna lista, contagem e média.
- Na UI deslogado: produto + avaliações + bloco de login. Logado: formulário valida, publica e a lista atualiza.
- Testado com o stub de sessão (estado deslogado) durante a Fase 1; o estado logado é validado na Fase 2, depois da integração com o Sign-In.
- `bunx tsc --noEmit` e `bun run lint`.

## Fora do escopo
Editar/apagar avaliação, curtidas, respostas, moderação, paginação de avaliações (pode virar uma melhoria se houver muitas).
