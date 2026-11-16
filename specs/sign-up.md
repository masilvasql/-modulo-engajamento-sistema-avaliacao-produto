# Sign Up (Criação de conta)

## Escopo

Front-End, Back-End, Banco de Dados

## Contexto

Precisamos implementar o fluxo para criação de contas na plataforma, as pessoas precisarão fornecer:

- Primeiro nome
- Sobrenome
- Email
- Senha
- Confirmação de senha

## Requisitos funcionais

1. Precisamos adicionar validação no formulário na camada de cliente
   1. Caso o formulário esteja válido, podemos enviar a requisição para a API
2. Os campos de nome e sobrenome devem ser separados.
3. Precisamos criar uma nova conta no banco de dados na tabela de accounts.
   1. `id`: nanoid (gerado com `nanoid` na camada de API)
   2. `first_name`: text
   3. `last_name`: text
   4. `created_at`: timestamp
   5. `updated_at`: timestamp
   6. `active`: boolean
   7. `email`: text
   8. `password`: text (hash gerado com `bcrypt`)
   9. `salt`: text (salt gerado com `bcrypt.genSalt`)
4. A Requisição deve ser um `POST` para a rota `/api/vi/sign-up` e receber os dados como JSON no `body`.
5. Caso tudo dê certo, retornar `201` ou erros de acordo com a validação:
   1. `400`: Má formatação de dados

## Requisitos não funcionais

- Segurança: Precisamos salvar a senha de forma segura no banco de dados.
  - Usar a biblioteca [`bcrypt`](https://www.npmjs.com/package/bcrypt) (não usar o módulo `crypto` nativo do Node):
    - Salt: `bcrypt.genSalt(12)` (cost factor 12).
    - Hash: `bcrypt.hash(senha, salt)`.
  - Precisamos receber os dados do cliente de forma segura usando HTTPS (para previnir network sniffing).
- UI/UX: Boa experiência de uso através de uma interface bonita, elegante, moderna.
- Performance: O Processo de criação de contas precisa ser rápido

## Você deve

- Criar a base do projeto com um endpoint inicial para criação de contas.
- Criar a base do projeto com uma página inicial para a interface de criação de contas.
- Configurar as bibliotecas base

## Você não deve

- Implementar qualquer outra funcionalidade que não esteja relacionada com o sign-up. (Criação de conta)
- Não vamos realizar nenhum envio de e-mail no momento, apenas processar a requisição, salvar no banco de dados e retornar um sucesso ou erro.

## Tecnologias (Stack)

React.js, Next.js, React Hook Form, Shadcn, TailwindCSS, Supabase, TRPC, bcrypt, Bunjs.

## Critérios de aceitação

- Temos uma página para criar a nova conta em '/auth/sign-up'.
- A página contém um formulário com validação.
- A Plataforma consegue se comunicar com a API para enviar os dados e receber uma resposta.
- Estamos informando possíveis erros.
  - Mostrar um alert em vermelho no formulário
- Estamos informando o sucesso de criação da conta:
  - Navegar para `/auth/sign-up/success`

## Resultado

Pessoas conseguem criar uma nova conta na plataforma.
