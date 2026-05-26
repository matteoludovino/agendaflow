# AgendaFlow

Plataforma de agendamento online para profissionais autônomos.

## Stack

- **Framework**: Next.js 15 (App Router)
- **Linguagem**: TypeScript
- **Estilo**: TailwindCSS + shadcn/ui
- **Banco**: PostgreSQL via Neon.tech
- **ORM**: Prisma
- **Auth**: NextAuth.js v5
- **Pagamentos**: Stripe
- **E-mail**: Resend

## Setup

### 1. Clone e configure variáveis de ambiente

```bash
cp .env.example .env.local
```

Edite `.env.local` com suas credenciais:
- `DATABASE_URL` — string de conexão PostgreSQL (recomendado: [Neon.tech](https://neon.tech))
- `AUTH_SECRET` — execute `openssl rand -base64 32`
- `AUTH_GOOGLE_ID` e `AUTH_GOOGLE_SECRET` — [console.cloud.google.com](https://console.cloud.google.com)
- `STRIPE_SECRET_KEY` e demais chaves Stripe — [dashboard.stripe.com](https://dashboard.stripe.com)
- `RESEND_API_KEY` — [resend.com](https://resend.com)

### 2. Execute o script de setup

```bash
chmod +x setup.sh
./setup.sh
```

O script instala dependências, adiciona componentes shadcn/ui e executa as migrations.

### 3. Inicie o servidor

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Comandos úteis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run type-check   # Verifica tipos TypeScript
npm run db:studio    # Abre Prisma Studio (interface do banco)
npm run db:migrate   # Executa migrations pendentes
npm run db:generate  # Regenera Prisma Client
```

## Estrutura de pastas

```
src/
├── actions/          # Server Actions (mutations)
├── app/              # Pages e layouts (App Router)
│   ├── (auth)/       # Login, Register
│   ├── (dashboard)/  # Área logada
│   └── (booking)/    # Página pública de agendamento
├── components/
│   ├── layout/       # Sidebar, Header, Nav
│   ├── dashboard/    # StatsCard, etc.
│   ├── shared/       # EmptyState, PageHeader, etc.
│   └── ui/           # shadcn/ui (gerado)
├── hooks/            # React hooks customizados
├── lib/
│   ├── auth.ts       # NextAuth config completa
│   ├── auth.config.ts # Config edge-safe (middleware)
│   ├── prisma.ts     # Singleton Prisma Client
│   ├── utils.ts      # Helpers (cn, formatters)
│   ├── constants/    # Plans, config
│   └── validations/  # Schemas Zod
└── types/            # Tipos globais e extensões
```

## Planos

| Funcionalidade          | Free | Pro (R$49) | Business (R$99) |
|------------------------|------|------------|-----------------|
| Serviços               | 3    | Ilimitado  | Ilimitado       |
| Agendamentos/mês       | 20   | 200        | Ilimitado       |
| Slug personalizado     | ❌   | ✅         | ✅              |
| E-mails de lembrete    | ❌   | ✅         | ✅              |
| Analytics              | ❌   | ✅         | ✅              |
| CRM de clientes        | ❌   | ❌         | ✅              |
| Suporte prioritário    | ❌   | ❌         | ✅              |

## Fases de implementação

- **Fase 1** ✅ — Infraestrutura (auth, banco, layout)
- **Fase 2** — Onboarding (3 steps)
- **Fase 3** — Core (serviços, disponibilidade)
- **Fase 4** — Agendamento público
- **Fase 5** — Monetização (Stripe)
- **Fase 6** — Polimento e deploy

## Deploy

Recomendado: [Vercel](https://vercel.com) + [Neon.tech](https://neon.tech)

1. Push para GitHub
2. Importe o repositório no Vercel
3. Configure as variáveis de ambiente
4. Vercel executa `prisma generate` automaticamente no build
