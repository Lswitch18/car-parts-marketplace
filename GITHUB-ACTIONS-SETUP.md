# CI/CD Pipeline Setup Guide

## Visão Geral

Este projeto usa GitHub Actions para automatizar o deploy do JapanCar Parts.

```
GitHub Push → Lint/Build → Deploy Supabase → Deploy Vercel → DB Check
```

---

## 1. Configurar Secrets no GitHub

Acesse: `https://github.com/lswitch18/car-parts-marketplace/settings/secrets/actions`

### Tokens Configurados (já no brain.py)

| Secret | Valor |
|--------|-------|
| `VERCEL_TOKEN` | `[REDACTED]` |
| `VERCEL_ORG_ID` | `[REDACTED]` |
| `VERCEL_PROJECT_ID` | `[REDACTED]` |

Falta configurar no GitHub:
- `SUPABASE_ACCESS_TOKEN` (token sbp_... do Supabase)
- `SUPABASE_ANON_KEY` (do dashboard do Supabase)

---

## 2. Obter Credenciais

### Supabase

1. Acesse https://supabase.com/dashboard/account/tokens
2. Clique em **Generate a new token**
3. Dê um nome (ex: `github-actions`)
4. Copie o token para `SUPABASE_ACCESS_TOKEN`

### Vercel

1. Acesse https://vercel.com/account/tokens
2. Clique em **Create Token**
3. Nome: `github-actions`
4. Scope: `All scopes`
5. Copie o token para `VERCEL_TOKEN`

Para obter `VERCEL_ORG_ID` e `VERCEL_PROJECT_ID`:
```bash
npm i -g vercel
vercel login
vercel link
cat .vercel/project.json
```

---

## 3. Pasta de Migrations

Coloque seus arquivos `.sql` em `supabase/migrations/`:

```
supabase/
└── migrations/
    ├── 001_initial_schema.sql
    ├── 002_add_auctions.sql
    └── 003_update_parts.sql
```

As migrations são executadas automaticamente após o deploy das functions.

---

## 4. Ativar Workflow

O workflow ativa automaticamente ao:
- Push para `main` ou `develop`
- Pull Request para `main`

### Verificar Execução

1. Acesse: `https://github.com/<owner>/<repo>/actions`
2. Clique no workflow mais recente
3. Veja os logs em tempo real

---

## 5. Variáveis de Ambiente (Frontend)

O frontend precisa destas variáveis (configure no Vercel Dashboard):

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
VITE_STRIPE_PUBLIC_KEY=pk_live_...
VITE_GOOGLE_CLIENT_ID=<client-id>.apps.googleusercontent.com
VITE_APP_URL=https://japancarparts.jp
```

No Vercel: `Settings → Environment Variables`

---

## 6. Deploy Manual

Se precisar fazer deploy manual:

```bash
# Deploy Functions Supabase
curl -fsSL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz | tar xz -C /tmp
/tmp/supabase functions deploy parts --project-ref clqubcryhbrjlupkgeva

# Deploy Vercel
npx vercel --prod
```

---

## 7. Estrutura do Workflow

```yaml
Jobs:
  ├── lint-and-typecheck  # Roda sempre
  ├── build               # Roda após lint
  ├── deploy-supabase     # Só em push para main
  ├── deploy-vercel       # Só em push para main
  ├── update-database    # Health check
  └── notification       # Status final
```

---

## 8. Troubleshooting

### Pipeline falhou no Lint
```bash
npm run lint   # Corrija os erros locally
git commit -m "fix lint errors"
git push
```

### Pipeline falhou no Build
```bash
npm run build # Verifique o build locally
```

### Pipeline falhou no Deploy
1. Verifique se os secrets estão corretos
2. Verifique se o Supabase CLI consegue autenticar:
   ```bash
   supabase login
   supabase functions deploy parts --project-ref clqubcryhbrjlupkgeva
   ```

### Deploy não aparece no Vercel
1. Verifique `VERCEL_ORG_ID` e `VERCEL_PROJECT_ID`
2. Verifique se o projeto existe no Vercel

---

## 9. Links Úteis

- [GitHub Actions Docs](https://docs.github.com/pt/actions)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Vercel GitHub Integration](https://vercel.com/docs/concepts/git/vercel-for-github)
- [Secret Management](https://docs.github.com/pt/actions/security-guides/using-secrets-in-github-actions)
