# CLAUDE.md — AI Assistant Guide for Neagle-

> This file provides context and conventions for AI assistants (Claude, Copilot, etc.) working in this repository.

## Project Overview

**Repository:** `contatoneoxreal-eng/Neagle-`
**What it does:** App de controle de gastos via WhatsApp. O usuário envia uma foto de nota fiscal pelo WhatsApp, a IA (Claude Vision) escaneia e extrai os dados automaticamente, e tudo aparece num dashboard futurístico.

AI assistants should re-read this file at the start of every session.

## Tech Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS (dark/neon theme) |
| Database | PostgreSQL via Supabase |
| ORM | Prisma v5 |
| AI Vision | Claude API (@anthropic-ai/sdk) |
| WhatsApp | Twilio WhatsApp API |
| Charts | Recharts |

## Repository Structure

```
Neagle-/
├── prisma/
│   └── schema.prisma              # Database schema (Expense, ExpenseItem, Category enum)
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout (dark theme, Geist fonts)
│   │   ├── page.tsx               # Dashboard entry point
│   │   ├── globals.css            # Global styles (glassmorphism, neon glows, grid bg)
│   │   └── api/
│   │       ├── webhook/route.ts   # Twilio WhatsApp webhook (receives photos, processes receipts)
│   │       └── expenses/route.ts  # GET expenses with stats, filters, aggregations
│   ├── components/
│   │   ├── Dashboard.tsx          # Main dashboard container (period filter, auto-refresh)
│   │   ├── StatsCards.tsx         # 4 stat cards (total mês, semana, média, maior gasto)
│   │   ├── ExpenseChart.tsx       # Area chart — daily expenses (Recharts)
│   │   ├── CategoryBreakdown.tsx  # Donut chart — expenses by category
│   │   └── ExpenseTable.tsx       # Table — recent expenses with category badges
│   ├── lib/
│   │   ├── claude.ts              # Claude Vision integration (receipt scanning)
│   │   ├── twilio.ts              # Twilio helpers (send message, download image, validate)
│   │   ├── prisma.ts              # Prisma client singleton
│   │   └── utils.ts               # formatCurrency, formatDate, category labels/colors
│   └── types/
│       └── index.ts               # Shared TypeScript types
├── .env.example                   # Required environment variables template
├── tailwind.config.ts             # Custom neon theme config
├── package.json
└── CLAUDE.md                      # This file
```

## Architecture

```
WhatsApp (foto) → Twilio Webhook → POST /api/webhook → Claude Vision API
                                                              ↓
                                                   Extrai: loja, itens, valores, data, categoria
                                                              ↓
                                                   Salva no PostgreSQL (Prisma)
                                                              ↓
                                                   Responde no WhatsApp: "✅ Gasto registrado!"
                                                              ↓
                                          Dashboard (GET /api/expenses) atualiza a cada 30s
```

## Useful Commands

```bash
# Development
npm run dev              # Start dev server (localhost:3000)
npm run build            # Production build
npm run lint             # ESLint

# Database
npx prisma generate      # Generate Prisma client after schema changes
npx prisma migrate dev   # Run migrations in development
npx prisma studio        # Visual database browser

# WhatsApp Testing (local)
# Use ngrok to expose /api/webhook and configure in Twilio console
```

## Environment Variables

See `.env.example` for required variables:
- `DATABASE_URL` — Supabase PostgreSQL connection string
- `ANTHROPIC_API_KEY` — Claude API key for receipt scanning
- `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` — Twilio credentials
- `TWILIO_WHATSAPP_NUMBER` — Twilio WhatsApp sandbox number

**Never commit `.env` files.**

## Database Models

- **Expense** — storeName, total, date, category (enum), rawText, imageUrl
- **ExpenseItem** — name, quantity, unitPrice, totalPrice (belongs to Expense)
- **Category** enum — ALIMENTACAO, TRANSPORTE, SAUDE, LAZER, CASA, EDUCACAO, OUTROS

## Key Conventions

1. **Read before editing** — Always read a file before modifying it.
2. **Minimal changes** — Only change what is requested.
3. **No secrets** — Never commit `.env`, API keys, or credentials.
4. **Security first** — Validate webhook signatures, sanitize inputs.
5. **Preserve patterns** — Follow existing glassmorphism/neon UI patterns.
6. **Portuguese UI** — All user-facing text is in Brazilian Portuguese.
7. **"use client"** — Components using hooks/interactivity must have the `"use client"` directive.

## Development Workflow

### Branching
- **`main`** — stable code. Do not push directly.
- **Feature branches** — descriptive names (e.g., `feature/add-auth`, `fix/chart-bug`).

### Commits
- Clear, concise messages describing *why* the change was made.
- One logical change per commit.

---

*Keep this file updated when adding new features, dependencies, or architectural changes.*
