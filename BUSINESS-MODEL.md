# JAPANCAR PARTS — Estudo de Modelo de Negócio

---

## 1. Business Model Canvas

### Canvas Completo

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BUSINESS MODEL CANVAS                             │
│                         JAPANCAR PARTS — Marketplace JDM                    │
├─────────────────┬───────────────────┬─────────────────────────────────────────┤
│ KEY PARTNERS    │ KEY ACTIVITIES    │ VALUE PROPOSITIONS                      │
│                 │                   │                                          │
│ • Yamato/Sagawa │ • Plataforma tech │ • Marketplace exclusivo JDM             │
│ • Fabricantes   │ • Matching buyer/ │ • Vendas + Leilões em tempo real        │
│ • Oficinas JDM  │   seller          │ • Catálogo inteligente por modelo/ano  │
│ • TikTok        │ • Sistema de      │ • Transações seguras + escrow           │
│ • Stripe/PayPay │   payments        │ • Comunidade de enthusiasts JDM         │
│ • Seguradoras   │ • Marketing +     │ • Peças autenticadas (verification)    │
│ • Loganísticas  │   community       │ • Preços competitivos vs dealers        │
│                 │ • Compliance +    │ • Experiência premium (dark theme)     │
│                 │   legal           │                                          │
├─────────────────┼───────────────────┼─────────────────────────────────────────┤
│ KEY RESOURCES   │ KEY ACTIVITIES    │ CUSTOMER RELATIONSHIPS                   │
│                 │ (cont.)           │                                          │
│ • Supabase DB   │                   │ • Suporte chat 24/7                    │
│ • Time tech     │                   │ • Reviews + Ratings                    │
│ • Brand equity  │                   │ • Comunidad Discord/forum              │
│ • Data de users │                   │ • Notifications (push/email)            │
│ • Network effect│                   │ • Seller verification badge            │
│                 │                   │                                          │
├─────────────────┴───────────────────┼─────────────────────────────────────────┤
│                                         │                                        │
│ CHANNELS                               │ CUSTOMER SEGMENTS                       │
│                                         │                                        │
│ • Site/app próprio                     │ • Entusiastas JDM (18-45 anos)         │
│ • SEO/Google                           │ • Tuners e builders                    │
│ • TikTok (marketing)                   │ • Proprietários de carros japoneses    │
│ • Instagram                            │ • Lojas/offices de tuning              │
│ • YouTube (reviews)                    │ • Importadores de peças JDM            │
│ • Comunidades online (Forza, gran          │ • Colecionadores                     │
│   turismo, etc)                       │ • Japão: residentes e turistas        │
│ • Word-of-mouth                        │                                          │
│                                         │                                          │
└─────────────────────────────────────────┴─────────────────────────────────────────┘
```

---

## 2. Análise SWOTT

### Forças (Strengths)
| Fator | Impacto |
|-------|---------|
| Nicho exclusivo JDM | Baixa concorrência direta |
| Catálogo por modelo | Diferencial técnico forte |
| Vendas + Leilões | Duas fontes de receita |
| Stack moderna | Escalabilidade garantida |
| Mercado japonês maduro | Infraestrutura de envio confiável |

### Fraquezas (Weaknesses)
| Fator | Impacto |
|-------|---------|
| Base de usuários zero | Chicken-and-egg problem |
| Confiança do vendedor | Necessita tempo para reputação |
| Custo de aquisição | CAC alto no início |
| Competição global | Yahoo! Auctions, Mercari |

### Oportunidades (Opportunities)
| Fator | Impacto |
|-------|---------|
| TikTok Shop Japan | Canal de aquisição massivo |
| Tendência JDM global | Filmes, jogos, cultura pop |
| Exportação de peças | Mercado internacional |
| Live commerce | Formato em alta no Japão |

### Ameaças (Threats)
| Fator | Impacto |
|-------|---------|
| Yahoo! Auctions | Plataforma estabelecida |
| Mercari | App de compra/venda popular |
| Amazon Japan | Logística robusta |
| Regulação de importação | Peças usadas podem ter restrições |
| Flutuação do ¥en | Afeta precificação |

---

## 3. Análise de Concorrência

### Mapa de Posicionamento

```
                    ALCANCE GLOBAL
                         ▲
                         │
         Amazon          │         Yahoo! Auctions
    ┌────────────────────┼────────────────────┐
    │                    │                    │
    │   ▪ Logística      │   ▪ Maior volume   │
    │   ▪ Confiança      │   ▪ Leilões        │
    │   ▪ Tudo em um     │   ▪ Japoneses     │
    │                    │                    │
────┼────────────────────┼────────────────────┼────
    │                    │                    │
    │   JAPANCAR PARTS   │      Mercari       │
    │   (NOSSO)          │                    │
    │   ▪ Nicho JDM     │   ▪ App mobile     │
    │   ▪ Catálogo smart │   ▪ C2C simples    │
    │   ▪ Vendas+Leilões │   ▪ Gen pop        │
    │   ▪ Experiência    │                    │
    │     premium        │                    │
    │                    │                    │
────┼────────────────────┼────────────────────┼────
    │                    │                    │
    │   Carrossell       │     Facebook        │
    │                    │     Marketplace     │
    └────────────────────┴────────────────────┘
                         │
                         ▼
                    NICHO ESPECÍFICO
```

### Comparativo de Funcionalidades

| Feature | JAPANCAR | Yahoo! | Mercari | Amazon |
|---------|----------|--------|---------|--------|
| Nicho JDM | ✅ | ❌ | ❌ | ❌ |
| Catálogo por modelo | ✅ | ❌ | ❌ | ❌ |
| Leilões | ✅ | ✅ | ❌ | ❌ |
| Vendas diretas | ✅ | ✅ | ✅ | ✅ |
| Chat comprador/vendedor | ✅ | ✅ | ✅ | ❌ |
| Reviews seller | ✅ | ✅ | ✅ | ✅ |
| Dark theme | ✅ | ❌ | ❌ | ❌ |
| API transportasi | ✅ | ❌ | ❌ | ✅ |
| Mobile-first | ✅ | ❌ | ✅ | ✅ |
| PWA | ✅ | ❌ | ✅ | ✅ |

---

## 4. Fontes de Receita

### 4.1 Receita Primária

| Fonte | % Taxa | Descrição |
|-------|--------|-----------|
| **Comissão por venda** | 10% | Sobre valor final (peça + envio) |
| **Comissão por leilão** | 10% | Sobre valor final do leilão |
| **Taxa de pagamento** | ~3% | Stripe/PayPay (pass-through) |

**Exemplo de Receita por Venda de ¥10.000:**
```
Valor peça:           ¥10.000
Taxa envio:           ¥ 2.000
─────────────────────────────
Total transação:      ¥12.000

Comissão 10%:        -¥1.200
Taxa Stripe 3%:        -¥360
─────────────────────────────
Plataforma lucra:     ¥1.560
Vendedor recebe:      ¥10.440
```

### 4.2 Receita Secundária

| Fonte | Valor | Descrição |
|-------|-------|-----------|
| **Destaque premium** | ¥500/listagem | Topo da categoria por 7 dias |
| **Badge verificado** | ¥2.000/mês | Para sellers premium |
| **Promoções** | ¥1.000/campanha | Destaques especiais |
| **Data insights** | ¥5.000/mês | Analytics para sellers |

### 4.3 Planos de Assinatura para Vendedores

| Feature | **Grátis** | **Pro** (¥2.980/mês) | **Elite** (¥9.800/mês) |
|---------|------------|----------------------|-------------------------|
| **Listagens/mês** | 5 | 50 | Ilimitadas |
| **Comissão** | 10% | 8% | 6% |
| **Destaques incluídos** | 0 | 10/mês | 30/mês |
| **Fotos/listagem** | 5 | 15 | 30 |
| **Video por listagem** | ❌ | ✅ | ✅ |
| **Banner loja** | ❌ | ✅ | ✅ |
| **Analytics avançado** | ❌ | ✅ | ✅ |
| **Badge verificado** | ❌ | ✅ | ✅ |
| **Suporte prioritário** | ❌ | ❌ | ✅ |
| **Exportação dados** | ❌ | ❌ | ✅ |
| **Multi-vendedor** | ❌ | ❌ | ✅ |
| **API access** | ❌ | ❌ | ✅ |
| **Sem anúncios** | ❌ | ✅ | ✅ |

**Benefícios da Assinatura:**

```
┌────────────────────────────────────────────────────────────┐
│                    POR QUE ASSINAR?                       │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  PRO                                                       │
│  ├── 8%佣金 (省2%) → 卖出¥100.000/月 → 节省¥2.000/月    │
│  ├── 50 listings/month (足够新手)                          │
│  ├── 10 destaques inclusos (价值¥5.000)                   │
│  └── Analytics para otimizar vendas                        │
│                                                            │
│  ELITE                                                     │
│  ├── 6%佣金 (省4%) → 卖出¥500.000/月 → 节省¥20.000/月   │
│  ├── Listings ilimitados (loja grande)                     │
│  ├── 30 destaques + banner próprio (visibilidade máxima)    │
│  ├── Multi-vendedor (gestão de equipa)                     │
│  └── API para integração (ERP/CRM)                        │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Projeção de Receita Assinaturas:**

| Período | Sellers Grátis | Sellers Pro | Sellers Elite | Receita Mensal |
|---------|----------------|-------------|---------------|----------------|
| Mês 6 | 150 | 30 | 5 | ¥134.400 |
| Mês 12 | 400 | 80 | 15 | ¥393.400 |
| Ano 2 | 1.200 | 250 | 50 | ¥1.241.000 |
| Ano 3 | 3.000 | 700 | 150 | ¥3.389.000 |

### 4.5 Receita de Publicidade (Ads)

**Modelo:** Usuários Free veem anúncios. Assinantes Pro/Elite **não veem anúncios**.

| Formato | Preço | Visualização |
|---------|-------|--------------|
| **Banner topo (homepage)** | ¥500/dia | Todos os usuários |
| **Banner lateral (catálogo)** | ¥300/dia | Apenas usuários Free |
| **Banner detalhe produto** | ¥200/dia | Apenas usuários Free |
| **Sponsored listing (topo)** | ¥100/item/dia | Todos |
| **Carousel sponsorizado** | ¥1.000/dia | Todos os usuários |

**Precificação:**
- CPM (Custo por 1.000 impressões): ¥50-80
- CPC (Custo por clique): ¥30-60

**Integração:**
```
┌────────────────────────────────────────────────────────────┐
│                 EXPERIÊNCIA DO USUÁRIO                     │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  USUÁRIO FREE:                                            │
│  ├── Banner topo em todas as páginas                      │
│  ├── 1-2 ads por página de catálogo                      │
│  ├── Anúncio após busca de produto                       │
│  └── "Upgrade para Pro: Sem anúncios!"                   │
│                                                            │
│  USUÁRIO PRO/ELITE:                                       │
│  ├── ZERO anúncios                                         │
│  ├── Interface limpa                                      │
│  └── Foco total nos produtos                             │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Projeção de Receita Ads:**

| Período | Visitantes/dia | % Free | Impressões/dia | Receita/Dia | Receita Mensal |
|---------|---------------|--------|----------------|------------|----------------|
| Mês 6 | 1.000 | 70% | 7.000 | ¥2.100 | ¥63.000 |
| Mês 12 | 5.000 | 65% | 32.500 | ¥9.750 | ¥292.500 |
| Ano 2 | 20.000 | 60% | 120.000 | ¥36.000 | ¥1.08M |
| Ano 3 | 50.000 | 55% | 275.000 | ¥82.500 | ¥2.47M |

### 4.7 Projeção de Receita Total (Ano 1-3)

```
Receita Mensal Total (¥)
│
│                                    ████████████
│                               █████
│                          █████
│                     █████           ████████████
│                █████                          (ano 3: ¥14M+)
│           █████
│      █████
└────────────────────────────────────────────►
  Mês 1   Mês 4   Mês 8   Mês 12  Ano 2   Ano 3
```

| Período | Vendas/Mês | GMV | Comissão | Assinaturas | Ads | Receita Total |
|---------|------------|-----|----------|-------------|-----|---------------|
| Mês 1-3 | 50 | ¥750K | ¥75K | ¥30K | ¥15K | ¥120K |
| Mês 4-6 | 200 | ¥3.6M | ¥360K | ¥80K | ¥50K | ¥490K |
| Mês 7-12 | 800 | ¥16M | ¥1.6M | ¥134K | ¥292K | ¥2.03M |
| Ano 2 | 3.000 | ¥792M | ¥63M | ¥1.24M | ¥1.08M | ¥65M |
| Ano 3 | 8.000 | ¥2.4B | ¥144M | ¥3.4M | ¥2.47M | ¥150M |

**Breakdown da Receita Ano 3:**
- Comissão sobre vendas: **¥144M** (96%)
- Assinaturas: **¥3.4M** (2.3%)
- Publicidade: **¥2.5M** (1.7%)
- Total: **¥150M/ano**

---

## 5. Estrutura de Custos

### 5.1 Custos Fixos Mensais

| Item | Custo (¥) | Observação |
|------|-----------|------------|
| **Infraestrutura** | | |
| Supabase Pro | ¥45.000 | DB + Auth + Storage |
| Vercel Pro | ¥35.000 | Hosting + CDN |
| Stripe fees | ~3% | Pass-through |
| **Pessoal** | | |
| Dev Full-stack | ¥600.000 | 1 pessoa (MVP) |
| Designer | ¥300.000 | 20h/semana |
| **Operações** | | |
| Contabilidade | ¥50.000 | PJ no Japão |
| Legal/Compliance | ¥30.000 | Termos, privacidade |
| **Marketing inicial** | ¥200.000 | Ads + conteúdo |
| **TOTAL** | ¥1.26M/mês | |

### 5.2 Custos Variáveis

| Item | Custo | Por |
|------|-------|-----|
| Taxa Stripe | 2.9% + ¥30 | Transação |
| Taxa PayPay | 3.24% | Transação |
| SMS (2FA) | ¥10 | Por OTP |
| Storage adicional | ¥0.025/GB | Acima do plano |
| API calls Supabase | ¥0.50/1000 | Acima do plano |

### 5.3 Break-even Analysis

```
Custos fixos mensais: ¥1.26M
Margem por venda (líquida): ~7%

Break-even = ¥1.26M / 0.07 = ¥18M GMV/mês
Break-even = ¥18M / ¥20K (avg) = 900 vendas/mês

Timeline: ~8-10 meses para atingir break-even
```

---

## 6. Estratégia de Preço

### 6.1 Para o Comprador

| Tipo | Preço | Inclui |
|------|-------|--------|
| **Frete básico** | ¥990-1.500 | Dentro da prefectura |
| **Frete médio** | ¥1.500-2.500 |跨 Prefecture |
| **Frete grande** | ¥2.500-4.000 | Items grandes |
| **Frete freight** | ¥5.000+ | Peças extra-grandes |

### 6.2 Para o Vendedor

| Serviço | Taxa | Detalhe |
|---------|------|---------|
| **Listagem** | Gratuito | Até 20 listings/mês |
| **Venda direta** | 10% | Sobre valor final |
| **Leilão** | 10% | Sobre valor final |
| **Destaque** | ¥500 | 7 dias no topo |
| **Badge Pro** | ¥2.000/mês | Verified seller |

### 6.3 Incentivos

| Ação | Incentivo |
|------|-----------|
| Primeira compra | ¥500 desconto |
| Primeiro listing | Fee gratuito |
| Volume alto | Desconto progressivo (8% >¥100k/mês) |
| Referência | ¥1.000 para ambos |

---

## 7. Estratégia de Aquisição de Usuários

### 7.1 Fase 1: Launch (Meses 1-3)

**Foco: Chicken-and-Egg Problem**

| Tática | Canais | Meta |
|--------|--------|------|
| **Founding sellers** | Outreach direto | 20 sellers |
| **Beta testers** | Convites exclusivos | 100 buyers |
| ** seeding** | Listagem própria | 50 peças |
| **Reddit/Forums** | r/JDM, r/projectcar | Awareness |
| **Instagram** | @japancarparts | 500 followers |

### 7.2 Fase 2: Growth (Meses 4-6)

| Tática | Canais | Meta |
|--------|--------|------|
| **TikTok content** | @japancarparts | 10K views/semana |
| **SEO** | Google (JDM parts Japan) | Top 10 |
| **Micro-influencers** | 5-10 creators JDM | 50K reach |
| **Referral program** | Inside app | 500 referrals |
| **App store optimization** | ASO | 1K downloads |

### 7.3 Fase 3: Scale (Meses 7-12)

| Tática | Canais | Meta |
|--------|--------|------|
| **Paid ads** | Google Ads, TikTok Ads | 5K installs |
| **PR/Press** | Japanese car magazines | 3 matérias |
| **Partnerships** | Oficinas, eventos JDM | 10 parceiros |
| **Brand ambassadors** | Racers, builders conhecidos | 3 ambassadors |
| **SEO expansion** | Multi-keywords | 10K organik/mês |

### 7.4 CAC (Customer Acquisition Cost)

| Canal | CAC Estimado | Conversão |
|-------|--------------|-----------|
| SEO/Organic | ¥50-100 | Alta |
| TikTok (orgânico) | ¥100-200 | Média |
| TikTok (paid) | ¥300-500 | Média |
| Google Ads | ¥500-800 | Alta |
| Influencers | ¥1.000-2.000 | Variável |
| PR/Press | ¥2.000-5.000 | Baixa |

---

## 8. Métricas de Negócio (KPIs)

### 8.1 KPIs Principais

| Métrica | Definição | Meta Mês 6 | Meta Mês 12 |
|---------|-----------|------------|--------------|
| **GMV** | Volume total de vendas | ¥16M | ¥50M |
| **Receita** | 10% do GMV | ¥1.6M | ¥5M |
| **Vendas/mês** | Transações completadas | 800 | 2.500 |
| **Utilizadores ativos** | Compradores únicos/mês | 500 | 2.000 |
| **Vendedores ativos** | Com listing ativo | 100 | 300 |
| **Ticket médio** | GMV / Vendas | ¥20.000 | ¥22.000 |
| **Take rate real** | Receita / GMV | 8-9% | 9-10% |
| **Retention D30** | Retorno em 30 dias | 25% | 35% |
| **NPS** | Net Promoter Score | 40+ | 50+ |

### 8.2 KPIs de Engajamento

| Métrica | Meta |
|---------|------|
| **Leilões/mês** | 200+ |
| **Lance médio** | 15 lances/leilão |
| **Conversão view→buy** | 3-5% |
| **Chat messages/dia** | 500+ |
| **Favoritos por listing** | 5+ avg |

### 8.3 Unit Economics

```
LTV (Lifetime Value):
  Ticket médio: ¥20.000
  Margem 8%: ¥1.600/transação
  Transações/buyer/ano: 3
  LTV: ¥4.800

CAC:
  Misto: ¥300-500

LTV:CAC Ratio:
  ¥4.800 : ¥400 = 12:1 ✓ (Excelente se >3:1)
```

---

## 9. Riscos e Mitigações

### Matriz de Riscos

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| **Falta de liquidity** (poucos sellers) | Alta | Alto | Founding sellers, incentivos iniciais |
| **Fraude** (buyer/seller) | Média | Alto | Escrow, verificação, RLS |
| **Concorrência** (Yahoo!/Mercari) | Alta | Médio | Nicho JDM, features únicas |
| **Regulação** (envio peças usadas) | Baixa | Alto | Compliance, partnerships |
| **Chargebacks** | Média | Médio | Dispute resolution, insurance |
| **Tech debt** | Média | Médio | Code review, testes |
| **TikTok ban** | Baixa | Médio | Canais múltiplos de acquisition |

---

## 10. Timeline de Lançamento

```
═══════════════════════════════════════════════════════════════
                         ROADMAP 12 MESES
═══════════════════════════════════════════════════════════════

Mês 1-2: FOUNDATION
├── Setup técnico (Vite + React + Supabase)
├── Schema DB + Seed data (marcas/modelos)
├── Design system + componentes base
├── Auth + Perfil usuário
└── Homepage + Catálogo básico

Mês 3-4: CORE FEATURES
├── Listagem de peças (venda direta)
├── Detail page + Galeria
├── Checkout + Stripe
├── Sistema de envio (Yamato integration)
└── Dashboard vendedor básico

Mês 5-6: LEILÕES + SOCIAL
├── Sistema de lances (realtime)
├── Countdown timers
├── Chat comprador/vendedor
├── Favoritos
└── Notifications

Mês 7-8: GROWTH
├── TikTok marketing campaign
├── Referral program
├── SEO optimization
├── Mobile PWA
└── Analytics dashboard

Mês 9-10: SCALE
├── Reviews + Ratings
├── Seller verification badges
├── Promotional tools
├── API pública (opcional)
└── 100 sellers milestone

Mês 11-12: INTERNATIONAL (Avaliar)
├── Estudo viabilidade exportação
├── TikTok Shop integration?
├── Multi-moeda
└── Localização EN/JP/PT

═══════════════════════════════════════════════════════════════
```

---

## 11. Estrutura Societária (Japão)

### 11.1 Opções

| Estrutura | Prós | Contras |
|-----------|------|---------|
| **合同会社 (Godo Kaisha)** | Simples, Liability limitada | Limitado para VC |
| **株式会社 (Kabushiki Kaisha)** | Profissional, SC | Mais complexo |
| **Representante estrangeiro** | Rápido | Responsabilidade pessoal |

### 11.2 Recomendação

```
Para MVP: 
├── ¥300.000 capital inicial
├── 合同会社 (Godo Kaisha) - baixo custo
├── Representante legal: você ou contador
└── ABNJ (número fiscal estrangeiro) se residindo fora
```

### 11.3 Requisitos Legais Japão

| Requisito | Custo | Tempo |
|-----------|-------|-------|
| Registro empresa | ¥250.000 | 2-4 semanas |
| Certificado registro | ¥15.000 | 1 semana |
| Conta bancária corporate | ¥0-50.000 | 4-8 semanas |
| Accountant | ¥30.000/mês | Contínuo |
| Legal review contracts | ¥100.000 | One-time |

---

## 12. Pitch Deck Summary

### One-Pager para Investidores

```
┌─────────────────────────────────────────────────────────────┐
│                  JAPANCAR PARTS                              │
│       Marketplace Exclusivo de Peças JDM                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PROBLEMA                                                   │
│  • Entusiastas JDM compram peças de múltiplas fontes       │
│  • Yahoo! Auctions: sem garantias, interface antiga        │
│  • Mercari: genérico, sem foco em peças de carro           │
│  • Sem catálogo inteligente (modelo/ano/compatibilidade)   │
│                                                             │
│  SOLUÇÃO                                                    │
│  • Marketplace C2C exclusivo para peças JDM                 │
│  • Catálogo inteligente por modelo/ano de carro             │
│  • Vendas diretas + Leilões em tempo real                  │
│  • Checkout seguro + Sistema de envio integrado            │
│                                                             │
│  TRACÇÃO ATUAL                                              │
│  • [ ] Pre-launch (MVP em desenvolvimento)                  │
│  • [ ] 50+ peças seedadas                                  │
│  • [ ] 20 sellers interestados                             │
│                                                             │
│  MODELO DE NEGÓCIO                                          │
│  • 10% comissão sobre GMV                                   │
│  • Taxa de destaque: ¥500                                  │
│  • Mercado endereçável: ¥50B (JDM parts JP)                │
│  • Target: 10% share em 3 anos = ¥5B GMV                  │
│                                                             │
│  FINANÇAS PROJECTADAS                                       │
│  • Mês 12: ¥50M GMV, ¥5M receita                           │
│  • Ano 2: ¥800M GMV, ¥80M receita                          │
│  • Ano 3: ¥2.4B GMV, ¥240M receita                         │
│                                                             │
│  EQUIPE                                                     │
│  • [Fundador] - Tech lead, full-stack                      │
│  • [Advisors] - 待定                                       │
│                                                             │
│  USO DE CAPITAL                                              │
│  • Mês 1-6: MVP development (¥10M)                        │
│  • Mês 7-12: Marketing + Growth (¥15M)                    │
│  • Hiring: Dev + Designer + Ops (¥25M)                    │
│                                                             │
│  ASK: ¥50M (Seed)                                           │
│  Val: ¥250M post-money                                      │
│  Equity: 20%                                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 13. Conclusão

### Por que JAPANCAR PARTS vai funcionar:

1. **Mercado grande e crescente**: Cultura JDM em alta globalmente
2. **Whitespace**: Nenhuma plataforma focada exclusivamente em peças JDM
3. **Stack moderna**: Vantagem tecnológica sobre concorrentes legados
4. **Múltiplas receita**: Comissões + Features premium
5. **Network effects**: Mais sellers = mais buyers = mais sellers
6. **TikTok como acelerador**: Canal de aquisição orgânico em expansão

### Próximos Passos Imediatos:

1. [ ] Validar interesse com pesquisa (50+ respostas)
2. [ ] Secured founding sellers (5-10 sellers)
3. [ ] MVP launched (2-3 meses)
4. [ ] Primeiras 100 vendas
5. [ ] Ajustar baseado em feedback
6. [ ] Escalar acquisition

---

*Documento gerado para estudo interno. Atualizar conforme evolução do projeto.*
