# Sistema de Avaliação de Produtos

Stack e decisões: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md). Funcionalidades: [`specs/`](specs/).

## 🤖 Construído com Claude Code e subagents

Este projeto foi desenvolvido com o [Claude Code](https://claude.com/claude-code) (modelo Claude Opus) seguindo um fluxo **spec → plano → execução paralela → integração**. A ideia foi tratar a IA como um time de engenharia: uma pessoa define *o quê*, um agente orquestrador define *como* e divide o trabalho, e subagents implementam em paralelo.

### O fluxo

```
specs/*.md ──► plans/*.md ──► Fase 0 ──► Fase 1 (paralela) ──► Fase 2
 (humano)      (revisão e     (contratos   ┌ subagent Sign-In ┐   (integração,
               aprovação)     compartilh.) ├ subagent Home    ├──► lint, tipos,
                                           └ subagent Feedback┘    build, testes)
```

1. **Specs escritas por uma pessoa** ([`specs/`](specs/)): contexto, requisitos funcionais e não funcionais, critérios de aceitação e o que *não* fazer. As specs são a fonte da verdade, não o prompt.
2. **Plano por feature, revisado antes de qualquer código** ([`plans/`](plans/)): o Claude lê as specs e o código existente e escreve um plano por feature. Ambiguidades da spec (ex.: um campo `score: boolean` sem sentido, uma imagem sem coluna no banco) viram perguntas explícitas marcadas com ❓, e a pessoa aprova ou ajusta antes da execução.
3. **Fase 0: contratos antes do paralelismo** ([`plans/_orquestracao.md`](plans/_orquestracao.md)): como as features dependem umas das outras (o feedback precisa da sessão do sign-in e da tabela da home), o orquestrador primeiro cria a fundação compartilhada: assinaturas da sessão, `protectedProcedure` do tRPC, routers vazios já registrados, layout com o cabeçalho, dependências instaladas e nomes de migrations reservados na ordem certa das chaves estrangeiras.
4. **Fase 1: três subagents em paralelo**: cada um recebeu seu plano e uma **tabela de ownership de arquivos**, podendo editar só os arquivos da própria feature. Arquivos compartilhados ficaram congelados: se um agente precisasse mudar algo neles, reportava ao orquestrador em vez de editar.
5. **Fase 2: integração**: o orquestrador conferiu que cada agente respeitou o ownership, rodou `tsc`, lint e build com tudo junto e testou os endpoints com o app rodando.

### Por que funcionou

- **Sem conflitos de merge sem usar git**: o paralelismo foi seguro porque os limites entre agentes eram de *arquivo*, definidos antes, e não de "boa vontade".
- **Contrato > implementação**: o subagent de Feedback desenvolveu contra um *stub* da sessão (`getSession()` retornando `null`) enquanto o de Sign-In implementava a versão real. As assinaturas não mudaram, então a integração foi direta.
- **Humano no controle das decisões**: o agente não "adivinhou" requisitos ambíguos; perguntou. E não executou ações externas (como aplicar migrations no banco) sem confirmação.
- **Contexto persistente**: a direção visual (paleta Tinta/Papel/Estrela, tipografia Bricolage Grotesque + Instrument Sans) foi guardada na memória do Claude Code e reaplicada em todas as telas novas, mantendo consistência entre agentes diferentes.
- **Docs da versão certa**: o projeto usa Next.js 16, com APIs diferentes das que o modelo conhecia. O [`AGENTS.md`](AGENTS.md) obriga cada agente a ler a documentação local em `node_modules/next/dist/docs/` antes de codar.

### Cuidados de engenharia que vieram do processo

- Sessão em cookie `httpOnly` com JWT assinado (`jose`), lida em `<Suspense>` por causa do `cacheComponents` do Next 16.
- Login com tempo de resposta constante (bcrypt contra um hash fictício quando o e-mail não existe), para não revelar quais e-mails têm conta.
- Mensagem de erro genérica no login ("E-mail ou senha inválidos.").
- O autor de uma avaliação vem sempre da sessão, nunca do corpo da requisição.
- Paginação por cursor (keyset) na home, estável mesmo com produtos entrando durante o scroll.

### IA dentro do produto: resumo das avaliações

Além de ter sido *construído* com IA, o produto *usa* IA: a página de cada produto mostra um **resumo das avaliações** gerado por um agente [Mastra](https://mastra.ai) com `openai/gpt-4o-mini` ([`src/mastra/`](src/mastra/)).

- O resumo fica em cache no banco (`products_ai_summaries`) e só é refeito quando o número de avaliações muda, sem chamar o modelo a cada visita.
- Os comentários vão ao modelo delimitados como *dados*, com instrução para ignorar instruções embutidas neles (mitigação de prompt injection).
- O bloco carrega em `<Suspense>` próprio e, se o modelo falhar, a página mostra o último resumo salvo ou segue sem ele.

## Configuração

1. Instale as dependências:

   ```bash
   bun install
   ```

2. Crie a tabela no Supabase: rode o SQL de
   [`supabase/migrations/20261115000000_create_accounts.sql`](supabase/migrations/20261115000000_create_accounts.sql)
   no SQL Editor do projeto (ou `supabase db push` com a Supabase CLI).

3. Copie `.env.example` para `.env.local` e preencha `SUPABASE_URL` e `SUPABASE_SECRET_KEY`
   (Project Settings > API). Na Vercel, cadastre as mesmas variáveis no projeto.

4. Rode em desenvolvimento:

   ```bash
   bun dev
   ```

   Acesse http://localhost:3000/auth/sign-up.

## Scripts

| Comando | O que faz |
|---|---|
| `bun dev` | Servidor de desenvolvimento |
| `bun run build` | Build de produção |
| `bun run lint` | Biome (lint + formatação) |
| `bun run format` | Formata o código com Biome |

## API

### `POST /api/v1/sign-up`

Corpo (JSON): `firstName`, `lastName`, `email`, `password`, `confirmPassword`.

| Status | Quando |
|---|---|
| `201` | Conta criada. Retorna `id`, `firstName`, `lastName`, `email`, `createdAt`. |
| `400` | Dados mal formatados. Retorna `message` e `errors` por campo. |
| `409` | Já existe conta com o e-mail. |
| `500` | Erro interno. |

## Estrutura

```
src/
  app/
    api/v1/sign-up/route.ts      # adaptador REST -> tRPC (auth.signUp)
    auth/sign-up/                # página, formulário e página de sucesso
  components/ui/                 # componentes Shadcn
  lib/validations/sign-up.ts     # schema Zod compartilhado (cliente + API)
  server/
    trpc/                        # init + routers (auth)
    accounts/create-account.ts   # regra de criação da conta
    auth/password.ts             # hash bcrypt
    db/supabase.ts               # cliente Supabase (servidor)
supabase/migrations/             # SQL da tabela accounts
```
