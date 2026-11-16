# Orquestração — Sign-In, Home e Feedback em paralelo

Este arquivo define **como** as três features rodam ao mesmo tempo sem se atropelar. Os planos de cada feature estão em `plans/sign-in.md`, `plans/home.md` e `plans/feedback.md`.

## Problema

As três specs dependem umas das outras:

- **Feedback** precisa da sessão (Sign-In) e da tabela `products` (Home).
- **Home** e **Sign-In** mexem na home (`/`) e no layout base.
- As três registram routers no mesmo `src/server/trpc/routers/_app.ts`.
- Instalar dependências em paralelo (`bun add`, `shadcn add`) gera conflito em `package.json` / `bun.lock`.
- O projeto **não é um repositório git**, então não dá para isolar cada agente em um worktree.

**Solução:** uma **Fase 0** curta, feita por mim (orquestrador) antes de subir os agentes, cria os contratos e arquivos compartilhados. Depois disso cada agente só escreve nos arquivos que são **dele** (tabela de ownership abaixo).

## Fase 0 — Fundação compartilhada (orquestrador, sequencial)

1. **Dependências** (uma única vez):
   - `bun add jose` (assinatura do cookie de sessão — recomendado em `node_modules/next/dist/docs/01-app/02-guides/authentication.md`).
   - `bunx shadcn add avatar dropdown-menu skeleton textarea badge` (componentes de UI que os três vão usar).
2. **Env**: adicionar `SESSION_SECRET` ao `.env.example` (e pedir para você preencher no `.env.local`, ex.: `openssl rand -base64 32`).
3. **Contrato de sessão** `src/server/auth/session.ts` — apenas **tipos + assinaturas** (stub). A implementação real é do agente Sign-In:
   ```ts
   export type Session = { accountId: string; firstName: string; lastName: string; email: string };
   export async function createSession(data: Session): Promise<void>;
   export async function getSession(): Promise<Session | null>; // lê cookie, valida assinatura/expiração
   export async function deleteSession(): Promise<void>;
   ```
4. **tRPC**:
   - `init.ts`: o contexto passa a ter `session` (via `getSession()`), e cria `protectedProcedure` (lança `UNAUTHORIZED` se não houver sessão).
   - `_app.ts`: já registra `auth`, `products` e `feedbacks`, apontando para arquivos de router vazios (`routers/products.ts`, `routers/feedbacks.ts`) que cada agente preenche.
5. **Layout base**: mover as páginas da plataforma para o route group `src/app/(platform)/` com `layout.tsx` que renderiza `<SiteHeader />` (arquivo stub em `src/components/layout/site-header.tsx`, implementado pelo Sign-In) + `<main>`.
   - `src/app/page.tsx` atual (redirect para sign-up) é removido; a home passa a ser `src/app/(platform)/page.tsx` (stub com título + esqueleto, enriquecido pelo agente Home).
6. **Migrations** — nomes reservados para garantir a ordem (FK de feedback depende de products):
   - `supabase/migrations/20261116000000_create_products.sql` → Home
   - `supabase/migrations/20261116000100_create_products_feedbacks.sql` → Feedback
7. Rodar `bun run lint` e `bun run build` para confirmar que a base compila antes de subir os agentes.

## Ownership de arquivos (Fase 1 — paralela)

| Agente | Pode criar/editar | Não pode tocar |
|---|---|---|
| **Sign-In** | `src/server/auth/session.ts` (implementação), `src/app/api/v1/sign-in/**`, `src/app/api/v1/sign-out/**`, `src/app/auth/sign-in/**`, `src/lib/validations/sign-in.ts`, `src/server/accounts/authenticate.ts`, `src/server/trpc/routers/auth.ts`, `src/components/layout/**` | `(platform)/page.tsx`, `products/**`, migrations |
| **Home** | `src/app/(platform)/page.tsx`, `src/app/(platform)/_components/**`, `src/app/api/v1/products/route.ts`, `src/server/products/**`, `src/server/trpc/routers/products.ts`, `src/lib/validations/products.ts`, migration `..._create_products.sql` | `(platform)/products/[id]/**`, header, sessão |
| **Feedback** | `src/app/(platform)/products/[id]/**`, `src/app/api/v1/products/[id]/feedbacks/**`, `src/server/feedbacks/**`, `src/server/trpc/routers/feedbacks.ts`, `src/lib/validations/feedbacks.ts`, migration `..._create_products_feedbacks.sql` | header, home, `session.ts` (só consome) |

Arquivos compartilhados (`_app.ts`, `init.ts`, `globals.css`, `package.json`, `next.config.ts`, `(platform)/layout.tsx`, `src/components/ui/**`) ficam **congelados** durante a Fase 1. Se um agente precisar mudar algo neles, ele **para e me reporta**, e eu aplico.

### Contratos entre agentes

- **Feedback → Home**: lê o produto por `id` direto em `products` (colunas definidas em `plans/home.md`). Cria um `src/server/feedbacks/get-product.ts` próprio para não depender do código do agente Home.
- **Feedback → Sign-In**: usa só `getSession()` e `protectedProcedure`. Enquanto o Sign-In não termina, o stub retorna `null` — o agente Feedback testa o estado "deslogado" e valida o "logado" depois da integração.
- **Home → Feedback**: o card de produto linka para `/products/{id}`.
- **Sign-In → todos**: o header aparece em todas as páginas de `(platform)`.

## Regras para todos os agentes

- Ler `AGENTS.md` e o guia relevante em `node_modules/next/dist/docs/` antes de codar (Next 16.4: `cookies()` é async, `cacheComponents: true` → dados de request precisam de `<Suspense>`; middleware agora é `proxy.ts`).
- Seguir a direção visual existente (memória do projeto + `globals.css`): Tinta `#22204A`, Papel `#F5F6FA`, Estrela `#F2B705`, Lavanda, Grafite, Alerta; Bricolage Grotesque (display) + Instrument Sans (corpo). Usar a skill `frontend-design` (`.agents/skills/frontend-design/SKILL.md`).
- Seguir o padrão existente: schema Zod compartilhado em `src/lib/validations/*`, procedure tRPC, rota REST em `src/app/api/v1/*` como adaptador (igual a `sign-up/route.ts`), Supabase via `getSupabase()`, React Hook Form + React Query no cliente.
- Textos de UI em pt-BR, voz ativa.
- Não rodar `bun add` / `shadcn add`. Não rodar `next build` (o `.next` é compartilhado) — validar com `bunx tsc --noEmit` e `bun run lint` restrito aos seus arquivos.
- Ao terminar: relatório com arquivos criados, decisões tomadas, pendências e como testar.

## Fase 2 — Integração e verificação (orquestrador)

1. Revisar diffs de cada agente contra a tabela de ownership.
2. `bunx tsc --noEmit`, `bun run lint`, `bun run build`.
3. Aplicar as migrations no Supabase (precisa da sua confirmação — é uma ação no banco remoto).
4. Teste ponta a ponta com o app rodando: criar conta → login → header com avatar → home com produtos (inserir alguns via POST) → detalhes → avaliar → logout → detalhes mostra bloco "faça login".
5. Corrigir problemas de integração (eu mesmo, ou devolvendo ao agente dono via SendMessage).
6. Relatório final para você.

## Decisões que preciso que você confirme

Estão marcadas como **❓** em cada plano. Resumo:

1. **Home – `score: boolean`** na tabela `products`: parece engano. Proponho não criar `score` em `products` e calcular a **média das avaliações** (`avg(products_feedbacks.score)`) quando o Feedback existir. Alternativa: manter literalmente como boolean.
2. **Home – imagem**: a spec pede imagem no card e no POST, mas não há coluna. Proponho coluna `image_url text` (URL externa), sem upload para o Supabase Storage.
3. **Home – POST `/products`**: proponho `POST /api/v1/products` protegido por header `x-admin-key` (env `ADMIN_API_KEY`), para não deixar qualquer pessoa inserir produtos.
4. **Home – formato do GET**: infinite scroll precisa de cursor. Proponho `{ items: Product[], nextCursor: string | null }` em vez de um array puro (lista vazia = `items: []`).
5. **Feedback – 1 avaliação por pessoa por produto?** A spec não diz. Proponho **permitir várias** (literal da spec), mas posso adicionar `unique (product_id, created_by)`.
6. **Sign-In – logout**: a spec não pede, mas sem ele não dá para testar o fluxo deslogado. Proponho um item "Sair" no menu do avatar (`POST /api/v1/sign-out`).
