# Plano — Sign-In (Autenticação)

Spec: `specs/sign-in.md` · Agente: **Sign-In** · Depende da Fase 0 (`plans/_orquestracao.md`)

## Objetivo

Pessoas com conta entram com e-mail e senha em `/auth/sign-in`, recebem um cookie de sessão e voltam para `/`. O cabeçalho mostra "Entrar" para quem está deslogado e um avatar (nome, sobrenome, e-mail) para quem está logado.

## Interpretações da spec

- "Você não deve: nada além de sign-up" é cópia da spec anterior → leio como "nada além de **sign-in**".
- "Página para criar a nova conta em `/auth/sign-in`" → página de **login**.
- "Sessão do Next.js com cookies": o Next não tem sessão nativa. Uso o padrão do guia oficial (`docs/01-app/02-guides/authentication.md`): **cookie stateless assinado com JWT (`jose`, HS256)**.

## Back-end

### 1. Validação — `src/lib/validations/sign-in.ts`
- `signInSchema` (Zod, compartilhado cliente/servidor): `email` (trim, lowercase, `z.email`), `password` (string, mín. 1, máx. 72 bytes como no sign-up).
- Tipos `SignInInput`, `SignInSuccessResponse` (`{ id, firstName, lastName, email }`), `SignInErrorResponse` (`{ message, errors? }`).

### 2. Autenticação — `src/server/accounts/authenticate.ts`
- Busca em `accounts` por `email` (`id, first_name, last_name, email, password, active`).
- `verifyPassword()` já existe em `src/server/auth/password.ts`.
- **Mesmo tempo de resposta** para e-mail inexistente: roda `bcrypt.compare` contra um hash fictício fixo, evitando descobrir quais e-mails existem pela latência.
- Conta inexistente, senha errada ou `active = false` → `TRPCError UNAUTHORIZED` com a mensagem genérica **"E-mail ou senha inválidos."**

### 3. Sessão — `src/server/auth/session.ts` (implementa o stub da Fase 0)
- `createSession(data)`: JWT com `{ accountId, firstName, lastName, email }`, expira em **7 dias**, assinado com `SESSION_SECRET`. Cookie `session`: `httpOnly`, `secure` em produção, `sameSite: "lax"`, `path: "/"`.
- `getSession()`: lê `(await cookies()).get("session")`, valida com `jwtVerify`; inválido/expirado → `null`. Envolvido em `React.cache` para não decodificar duas vezes por request.
- `deleteSession()`: apaga o cookie.

### 4. tRPC — `src/server/trpc/routers/auth.ts`
- Adiciona `signIn: publicProcedure.input(signInSchema).mutation(...)` → `authenticate()` + `createSession()`.
- Adiciona `signOut: publicProcedure.mutation(deleteSession)`.

### 5. Rotas REST
- `POST /api/v1/sign-in` (`src/app/api/v1/sign-in/route.ts`), mesmo padrão do `sign-up/route.ts`:
  - `200` + `SignInSuccessResponse` e cookie definido.
  - `400` JSON inválido ou falha de schema (com `errors` por campo).
  - `401` credenciais inválidas (mensagem genérica).
  - `500` erro interno.
- `POST /api/v1/sign-out` → `204` (❓ decisão 6 da orquestração — não está na spec, proposta para viabilizar teste).

## Front-end

### 6. Página `/auth/sign-in`
- `src/app/auth/sign-in/page.tsx` + `sign-in-form.tsx`, reaproveitando o `auth/layout.tsx` (painel Tinta com a avaliação de exemplo + formulário sobre Papel), igual ao sign-up.
- Título "Entre na sua conta", subtítulo curto.
- React Hook Form + `zodResolver(signInSchema)`, validação `onTouched`.
- Campos: e-mail (`autoComplete="email"`), senha (`autoComplete="current-password"`) com botão mostrar/ocultar (mesmo do sign-up).
- `useMutation` (React Query) → `fetch("/api/v1/sign-in")`. Botão com `Spinner` e desabilitado durante o envio.
- Erro 401/400/500 → `Alert` vermelho (borda esquerda, mesmo estilo do sign-up) com a mensagem genérica. Foco volta para o campo de e-mail.
- Sucesso → `router.replace("/")` + `router.refresh()` (para o header ler a nova sessão).
- Link "Ainda não tem conta? Criar conta" → `/auth/sign-up`. No sign-up, adicionar o link inverso "Já tem conta? Entrar" (único ajuste em arquivo de sign-up).
- Se a pessoa já estiver logada e abrir `/auth/sign-in` → redirect para `/`.

### 7. Layout base e cabeçalho — `src/components/layout/`
- `site-header.tsx` (Server Component): wordmark "Avalia" (Bricolage, Tinta) linkando para `/`, à direita o slot de conta.
- Slot de conta dentro de `<Suspense>` (exigido por `cacheComponents`, porque lê cookies), com fallback skeleton circular — o resto da página continua estático.
  - **Deslogado**: botão "Entrar" → `/auth/sign-in`.
  - **Logado**: `account-menu.tsx` (client) — `Avatar` com imagem DiceBear `https://api.dicebear.com/9.x/initials/svg?seed={nome sobrenome}` (tag `<img>`, sem mexer em `next.config`), nome + sobrenome ao lado em telas ≥ sm; ao clicar abre `DropdownMenu` com nome completo, e-mail e "Sair".
- Header sticky, fundo Papel com leve blur, borda inferior sutil, altura 64px, responsivo (no mobile só o avatar).

## Arquivos

Novos: `src/lib/validations/sign-in.ts`, `src/server/accounts/authenticate.ts`, `src/app/api/v1/sign-in/route.ts`, `src/app/api/v1/sign-out/route.ts`, `src/app/auth/sign-in/page.tsx`, `src/app/auth/sign-in/sign-in-form.tsx`, `src/components/layout/account-menu.tsx`.
Editados: `src/server/auth/session.ts` (stub → implementação), `src/server/trpc/routers/auth.ts`, `src/components/layout/site-header.tsx` (stub → implementação), `src/app/auth/sign-up/sign-up-form.tsx` (só o link "Entrar").

## Verificação

- `curl` no endpoint: 200 com cookie `Set-Cookie: session=...; HttpOnly`; 400 com body inválido; 401 com senha errada e com e-mail inexistente (mesma mensagem).
- Na UI: validação dos campos, alert vermelho no erro, redirect para `/` no sucesso, header troca de "Entrar" para avatar, "Sair" volta ao estado deslogado.
- `bunx tsc --noEmit` e `bun run lint`.

## Fora do escopo
Recuperação de senha, "lembrar de mim", OAuth, rate limiting, proteção de rotas via `proxy.ts`.
