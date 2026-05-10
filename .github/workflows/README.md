# GitHub Actions CI/CD Setup

## Secrets Necessários (Configurar em GitHub → Settings → Secrets → Actions)

| Secret | Descrição | Como obter |
|--------|-----------|------------|
| `SUPABASE_ACCESS_TOKEN` | Token do Supabase CLI | supabase.com → Account → Access Tokens |
| `VERCEL_TOKEN` | Token da API Vercel | vercel.com → Settings → Tokens |
| `VERCEL_ORG_ID` | ID da organização Vercel | `vercel inspect <url>` |
| `VERCEL_PROJECT_ID` | ID do projeto Vercel | `vercel inspect <url>` |
| `SUPABASE_ANON_KEY` | Chave anônima do Supabase | Supabase Dashboard → Project API |

## Fluxo da Pipeline

```
┌──────────────┐
│  Push/PR     │
└──────┬───────┘
       ▼
┌──────────────┐
│ Lint/TypeCheck│
└──────┬───────┘
       ▼
┌──────────────┐
│    Build     │
└──────┬───────┘
       ▼
┌──────────────┐
│ Deploy Funcs │ ← Supabase Edge Functions
└──────┬───────┘
       ▼
┌──────────────┐
│Deploy Vercel│ ← Frontend em produção
└──────┬───────┘
       ▼
┌──────────────┐
│Update DB    │ ← Health check
└──────────────┘
```

## Funções Deployadas no Supabase

- `parts`
- `users`
- `transactions`
- `auctions`
- `categories`
- `brands`
- `stripe-checkout`
- `stripe-webhook`

## Branches

- **main**: Deploy automático para produção
- **develop**: Deploy para staging (opcional)
- **PR**: Apenas lint, typecheck e build (sem deploy)
