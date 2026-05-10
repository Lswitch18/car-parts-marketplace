# JAPANCAR PARTS — Infraestrutura de Produção

## 1. Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                        │
│                          (Vercel - Global CDN)                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐    │
│  │  React SPA     │  │  Static Assets  │  │  Edge Functions (API)  │    │
│  │  (TypeScript)  │  │  (Imagens/CSS)  │  │  (Serverless)          │    │
│  └────────┬────────┘  └────────┬────────┘  └────────────┬────────────┘    │
│           │                    │                         │                   │
└───────────┼────────────────────┼─────────────────────────┼───────────────────┘
            │                    │                         │
            ▼                    ▼                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND                                         │
│                      (Supabase Cloud - Tokyo Region)                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐ │
│  │  PostgreSQL    │  │   Auth          │  │  Storage                    │ │
│  │  (Database)    │  │  (Google OAuth) │  │  (Imagens de peças)        │ │
│  └────────┬────────┘  └─────────────────┘  └─────────────────────────────┘ │
│           │                                                                 │
│  ┌────────┴────────┐  ┌─────────────────┐  ┌─────────────────────────────┐ │
│  │  Realtime      │  │  Edge Functions │  │  Row Level Security         │ │
│  │  (WebSocket)   │  │  (Serverless)   │  │  (RLS Policies)             │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          EXTERNAL APIS                                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐ │
│  │   Stripe        │  │   Google        │  │  SendGrid                   │ │
│  │  (Payments)     │  │  (OAuth 2.0)    │  │  (Email Transactional)      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Frontend — Vercel

### 2.1 Configuração

| Recurso | Especificação |
|---------|---------------|
| **Plataforma** | Vercel |
| **Tipo** | SPA (Single Page Application) |
| **Framework** | React 19 + TypeScript + Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Node Version** | 20.x |

### 2.2Domínio e SSL

| Item | Valor |
|------|-------|
| **Domínio Principal** | japancarparts.jp (registrar em JP) |
| **Domínio Alternativo** | japancarparts.com (opcional) |
| **SSL** | Automático (Let's Encrypt via Vercel) |
| **HSTS** | Enabled (max-age=31536000) |

### 2.3 Configuração de Deploy

**vercel.json** (raiz do projeto):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

### 2.4 Variáveis de Ambiente

```env
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
VITE_STRIPE_PUBLIC_KEY=pk_live_...
VITE_GOOGLE_CLIENT_ID=<client-id>
VITE_APP_URL=https://japancarparts.jp
```

### 2.5 Performance

| Métrica | Meta |
|---------|------|
| **LCP** (Largest Contentful Paint) | < 2.5s |
| **FCP** (First Contentful Paint) | < 1.8s |
| **TTFB** (Time to First Byte) | < 600ms |
| **CLS** (Cumulative Layout Shift) | < 0.1 |
| **FID** (First Input Delay) | < 100ms |

### 2.6 Otimizações

- **CDN**: Edge network global (Vercel)
- **Cache**: Headers configurados para static assets
- **Images**: Lazy loading + WebP automatic
- **Bundle**: Code splitting automático

---

## 3. Backend — Supabase

### 3.1 Database (PostgreSQL)

| Recurso | Plano Pro |
|---------|-----------|
| **Região** | Tokyo (ap-northeast-1) |
| **Storage** | 8 GB |
| **Bandwidth** | 50 GB/mês |
| **Backup** | Automático (7 dias) |
| **Point-in-time Recovery** | Disponível (Enterprise) |

#### Estrutura do Banco

```
┌─────────────────────────────────────────────────────────────────┐
│                        SCHEMA: public                           │
├─────────────────────────────────────────────────────────────────┤
│  Tabelas:                                                      │
│  ├── profiles        (usuários, roles, ratings)               │
│  ├── brands          (marcas de carros)                        │
│  ├── car_models      (modelos por marca)                       │
│  ├── categories     (categorias de peças)                     │
│  ├── parts           (anúncios de peças)                       │
│  ├── bids            (lances de leilões)                       │
│  ├── transactions    (vendas comissões)                       │
│  ├── messages        (chat entre usuários)                     │
│  ├── favorites       (itens favoritados)                       │
│  └── reviews         (avaliações pós-venda)                    │
│                                                                  │
│  Views:                                                        │
│  ├── seller_stats        (stats agregadas por vendedor)       │
│  ├── active_auctions     (leilões ativos)                     │
│  └── parts_with_counts   (peças com contagens)                │
│                                                                  │
│  Functions:                                                    │
│  ├── increment_views     (incrementa visualizações)           │
│  ├── calculate_fees      (calcula comissão)                    │
│  └── process_auction_end (encerra Leilao)                      │
└─────────────────────────────────────────────────────────────────┘
```

#### Índices Otimizados

```sql
-- Busca e filtros
CREATE INDEX idx_parts_brand ON parts(brand_id);
CREATE INDEX idx_parts_category ON parts(category_id);
CREATE INDEX idx_parts_model ON parts(model_id);
CREATE INDEX idx_parts_status ON parts(status);
CREATE INDEX idx_parts_price ON parts(price);
CREATE INDEX idx_parts_created ON parts(created_at DESC);

-- Leilões
CREATE INDEX idx_parts_auction_enabled ON parts(auction_enabled) WHERE auction_enabled = true;
CREATE INDEX idx_parts_auction_end ON parts(auction_end) WHERE status = 'active';

-- Transações
CREATE INDEX idx_transactions_buyer ON transactions(buyer_id);
CREATE INDEX idx_transactions_seller ON transactions(seller_id);
CREATE INDEX idx_transactions_status ON transactions(payment_status);

-- Full-text search
CREATE INDEX idx_parts_search ON parts USING gin(to_tsvector('japanese', title || ' ' || description));
```

### 3.2 Autenticação (Supabase Auth)

| Configuração | Valor |
|--------------|-------|
| **Provedores** | Email/Password + Google OAuth |
| **MFA** | Opcional (recomendado para vendedores) |
| **Session Duration** | 7 dias |
| **Password Policy** | Mín 8 caracteres |
| **Email Confirm** | Obrigatório |

#### Configuração Google OAuth

1. Criar projeto em Google Cloud Console
2. Configurar OAuth consent screen
3. Criar OAuth 2.0 credentials
4. Adicionar URIs autorizados:
   - `https://<project>.supabase.co/auth/v1/callback`
   - `https://japancarparts.jp/auth/v1/callback`
5. Configurar no Supabase: Authentication → Providers → Google

### 3.3 Storage (Imagens)

| Bucket | Uso | Tamanho Máximo | Cache |
|--------|-----|----------------|-------|
| **parts-images** | Imagens de peças | 10 MB/imagem | 1 dia |
| **avatars** | Fotos de perfil | 2 MB/imagem | 30 dias |
| **brands-logos** | Logos de marcas | 1 MB/imagem | 1 ano |

#### Configuração

```javascript
// Policies de acesso
// parts-images: Público leitura, auth gravação (próprio usuário)
// avatars: Público leitura, auth gravação (próprio usuário)
// brands-logos: Público total
```

#### Otimizações

- **Resize**: Edge Function para redimensionar
- **Format**: Conversão automática para WebP
- **CDN**: Cloudflare integration

### 3.4 Realtime (WebSocket)

| Configuração | Valor |
|--------------|-------|
| **Conexões Simultâneas** | 200 (Pro) |
| **Channels** | parts, bids, messages |
| **Presence** | Online status |

#### Channels

```typescript
// Escuta de lances em tempo real
supabase.channel('auction-123')
  .on('postgres_changes', { 
    event: 'INSERT', 
    schema: 'public', 
    table: 'bids',
    filter: 'part_id=eq.123'
  }, (payload) => {
    console.log('Novo lance:', payload.new);
  })
  .subscribe();
```

### 3.5 Edge Functions (Serverless)

| Função | Trigger | Descrição |
|--------|---------|-----------|
| `process-payment` | Stripe Webhook | Confirmação de pagamento |
| `calculate-fees` | HTTP Request | Calcula comissão/taxas |
| `send-notification` | DB Trigger | Envio de emails |
| `image-resize` | Storage Trigger | Redimensiona imagens |
| `cleanup-expired` | Cron (1x/dia) | Remove auctions expiradas |

#### Estrutura de Funções

```
supabase/functions/
├── parts/           # CRUD de peças
├── users/           # Gestão de perfis
├── transactions/    # Transações e comissões
├── auctions/        # Leilões e lances
├── categories/      # Categorias
├── brands/          # Marcas
└── utils/           # Helpers compartilhados
```

---

## 4. Pagamentos — Stripe

### 4.1 Configuração

| Item | Valor |
|------|-------|
| **Modo** | Connected Accounts (vendedores) |
| **Checkout** | Stripe Checkout (redirect) |
| **Webhooks** | Edge Function dedicada |
| **Taxa Transação** | 2.9% + ¥30 |

### 4.2 Fluxo de Pagamento

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Comprador     │     │    Stripe      │     │   Vendedor      │
│   inicia        │────▶│   retém valor   │     │                 │
│   checkout      │     │                 │     │                 │
└─────────────────┘     └────────┬────────┘     └────────┬────────┘
                                 │                      │
                                 ▼                      ▼
                        ┌─────────────────┐     ┌─────────────────┐
                        │  Peça enviada   │◀────│  Confirma envio │
                        │  Recebimento   │     │                 │
                        └────────┬────────┘     └────────┬────────┘
                                 │                      │
                                 ▼                      ▼
                        ┌─────────────────┐     ┌─────────────────┐
                        │ Comprador       │     │  Taxa plataforma│
                        │ aprova          │────▶│  (10%)          │
                        └─────────────────┘     └────────┬────────┘
                                                       │
                                                       ▼
                                                ┌─────────────────┐
                                                │ Saldo líquido   │
                                                │ para vendedor   │
                                                └─────────────────┘
```

### 4.3 Breakdown de Taxas

| Item | Valor |
|------|-------|
| **Valor da peça** | ¥10,000 |
| **Comissão (10%)** | -¥1,000 |
| **Taxa Stripe (2.9% + ¥30)** | -¥320 |
| **Taxa plataforma** | -¥30 |
| **Total taxas** | -¥1,350 |
| **Vendedor recebe** | ¥8,650 |

---

## 5. Segurança

### 5.1 Camada de Rede

| Medida | Implementação |
|--------|---------------|
| **TLS** | 1.3 (obrigatório) |
| **HSTS** | max-age=31536000; includeSubDomains |
| **Firewall** | Supabase built-in |
| **DDOS** | Vercel + Cloudflare protection |

### 5.2 Camada de Dados

| Medida | Implementação |
|--------|---------------|
| **RLS** | Todas as tabelas com políticas |
| **Row-level Policies** | Verificação por usuário |
| **Masking** | Dados sensíveis mascarados |
| **Audit** | Logs de todas as operações |

#### Exemplos de Políticas RLS

```sql
-- Parts: qualquer um pode ver, só dono edita
CREATE POLICY "parts_read_public" ON parts FOR SELECT USING (true);
CREATE POLICY "parts_insert_owner" ON parts FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "parts_update_owner" ON parts FOR UPDATE USING (auth.uid() = seller_id);

-- Transactions: só participantes
CREATE POLICY "transactions_participants" ON transactions 
  FOR SELECT USING (
    buyer_id = auth.uid() OR 
    seller_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role::text LIKE '%admin%')
  );

-- Messages: só remetente/destinatário
CREATE POLICY "messages_participants" ON messages
  FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());
```

### 5.3 Camada de Aplicação

| Medida | Implementação |
|--------|---------------|
| **Rate Limiting** | 100 req/min por IP |
| **Input Validation** | Zod em todas Edge Functions |
| **Sanitization** | Escape de inputs |
| **Secrets** | Supabase Vault |

### 5.4 Headers de Segurança

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; img-src 'self' https: data:; script-src 'self'
```

---

## 6. Monitoramento e Observabilidade

### 6.1 Ferramentas

| Ferramenta | Uso | Custo |
|------------|-----|-------|
| **Vercel Analytics** | Performance, Core Web Vitals | Grátis |
| **Supabase Logs** | Query performance, errors | Grátis |
| **Sentry** | Error tracking (FE + BE) | Grátis (20k/mês) |
| **Uptime Robot** | Health checks | Grátis |

### 6.2 Métricas Monitoradas

| Métrica | Alerta |
|---------|--------|
| **Erros 5xx** | > 1% em 5 min |
| **Latência DB** | > 500ms |
| **Edge Function Errors** | Qualquer erro |
| **Stripe Webhook Failure** | Qualquer falha |
| **Disk Usage** | > 80% |

### 6.3 Dashboards

- **Vercel**: Dashboard de deploy e performance
- **Supabase**: Dashboard de database e auth
- **Stripe**: Dashboard de pagamentos

---

## 7. Backup e Recuperação

### 7.1 Estratégia

| Recurso | Frequência | Retenção |
|---------|------------|----------|
| **Database** | Automático (contínuo) | 7 dias |
| **PITR** | Sob demanda | 30 dias (Enterprise) |
| **Export SQL** | Semanal | Manual |
| **Storage** | N/A (já redundante) | - |

### 7.2 Procedimento de Recuperação

1. **Database**: Supabase Dashboard → Settings → Backups → Restore
2. **Functions**: Redeploy via CLI
3. **Storage**: Recovery via Supabase Storage

### 7.3 Teste de Recuperação

- Frequência: Trimestral
- Procedimento: Restaurar em ambiente de staging
- Validação: Verificar integridade dos dados

---

## 8. CI/CD Pipeline

### 8.1 Workflow

```yaml
name: Deploy Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: dist
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### 8.2 Secrets Necessários

| Secret | Descrição |
|--------|-----------|
| `VERCEL_TOKEN` | Token de acesso Vercel |
| `VERCEL_ORG_ID` | ID da organização Vercel |
| `VERCEL_PROJECT_ID` | ID do projeto Vercel |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave service role (para functions) |
| `STRIPE_SECRET_KEY` | Chave secreta Stripe |

---

## 9. Custos Mensais

### 9.1 Detalhamento

| Serviço | Plano | Custo (JPY) | Custo (USD) |
|---------|-------|-------------|-------------|
| **Vercel Pro** | Pro | ¥2,500 | ~$17 |
| **Supabase Pro** | Pro | ¥4,500 | ~$30 |
| **Stripe** | Standard | Fee passed | - |
| **Domínio (.jp)** | Registro | ¥250/mês | ~$2 |
| **SendGrid** | Starter | ¥1,500 | ~$10 |
| **Sentry** | Team | ¥0 (gratuito) | - |
| **Uptime Robot** | Free | ¥0 | - |
| **TOTAL** | | **¥8,750** | **~$59** |

### 9.2 Projeção de Custos (Escala)

| Mês | Usuários | Vendas | Custo Est. |
|-----|----------|--------|------------|
| 1-3 | 1,000 | 50 | ¥8,750 |
| 4-6 | 5,000 | 500 | ¥8,750 |
| 7-12 | 20,000 | 2,000 | ¥15,000 |
| 12+ | 50,000+ | 10,000+ | ¥25,000+ |

*Nota: Custos aumentam com升级 de plano Supabase e Vercel*

---

## 10. Escalabilidade

### 10.1 Limites Atuais vs. Necessários

| Recurso | Free | Pro (Atual) | 6 meses | 12 meses |
|---------|------|--------------|---------|-----------|
| **DB Storage** | 500 MB | 8 GB | 15 GB | 50 GB |
| **Bandwidth** | 2 GB | 50 GB | 150 GB | 500 GB |
| **Realtime Conn** | 50 | 200 | 500 | 2,000 |
| **Storage** | 1 GB | 100 GB | 250 GB | 500 GB |
| **Edge Functions** | 500K | 2M | 5M | 10M |

### 10.2 Estratégia de Escala

| Fase | Ação |
|------|------|
| **1-1000 usuários** | Plano Pro padrão |
| **1000-10000** | Upgrade para Enterprise (se necessário) |
| **10000+** | Análise de carga, otimização de queries |

### 10.3 Otimizações de Performance

- **Database**: Query optimization, connection pooling
- **CDN**: Edge caching, image optimization
- **Images**: Lazy loading, WebP, CDN
- **Code**: Bundle splitting, tree shaking

---

## 11. Plano de Desastre (DR)

### 11.1 RTO (Recovery Time Objective)

| Serviço | RTO |
|---------|-----|
| **Frontend** | < 5 min (deploy automático) |
| **Database** | < 1 hora (restore) |
| **Edge Functions** | < 10 min (redeploy) |
| **Stripe** | N/A (externo) |

### 11.2 RPO (Recovery Point Objective)

| Dados | RPO |
|-------|-----|
| **Código** | N/A (git) |
| **Database** | 7 dias (backup automático) |
| **Uploads** | N/A (cloud storage) |
| **Config** | 24 horas (manual backup) |

### 11.3 Cenários de Falha

| Cenário | Mitigação |
|---------|-----------|
| **Falha Vercel** | DNS backup (Netlify) |
| **Falha Supabase** | Backup SQL recovery |
| **Falha Stripe** | Retry logic + logs |
| **DDoS** | Cloudflare protection |

---

## 12. Checklist de Produção

### Pré-Deploy

- [ ] Domínio registrado e configurado
- [ ] SSL funcionando (HTTPS)
- [ ] Variáveis de ambiente configuradas
- [ ] Build testado localmente
- [ ] Lint e typecheck passando

### Deploy

- [ ] Frontend deployado na Vercel
- [ ] Edge Functions deployed
- [ ] Database schema aplicado
- [ ] RLS policies aplicadas
- [ ] Stripe webhook configurado

### Pós-Deploy

- [ ] Health check passando
- [ ] Login funcionando (teste manual)
- [ ] CRUD de peças funcionando
- [ ] Imagens upload funcionando
- [ ] Monitoramento configurado

---

## 13. Referências

| Recurso | URL |
|---------|-----|
| **Vercel Docs** | https://vercel.com/docs |
| **Supabase Docs** | https://supabase.com/docs |
| **Stripe Docs** | https://stripe.com/docs |
| **Security Headers** | https://securityheaders.com |

---

*Documento atualizado: 2026-05-09*
*Projeto: JAPANCAR PARTS Marketplace*
*Versão: 1.0.0*