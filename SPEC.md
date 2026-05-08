# JAPANCAR PARTS — Marketplace de Peças de Carros Japoneses

## 1. Conceito & Visão

**JAPANCAR PARTS** é um marketplace C2C exclusivo para peças de carros japoneses de performance (JDM). A experiência transmite a energia das corridas japonesas — velocidade, precisão e paixão por motores. O usuário sente que está entrando em uma garage premium, onde cada peça tem uma história e cada compra é uma afirmação de estilo.

**Diferencial competitivo**: Catálogo completo e inteligente por modelo/ano, com suporte a vendas diretas e leilões em tempo real.

---

## 2. Design Language

### 2.1 Paleta de Cores

| Nome | Hex | Uso |
|------|-----|-----|
| **Racing Red** | `#E63946` | CTAs principais, alertas de urgência, preços promocionais |
| **Jet Black** | `#0D0D0D` | Background principal, header, elementos escuros |
| **Carbon Gray** | `#1A1A2E` | Cards, sidebars, elementos de suporte |
| **Carbon Light** | `#16213E` | Hover states, profundidade |
| **Chrome Silver** | `#C0C0C0` | Bordas, separadores, textos secundários |
| **LED White** | `#F8F9FA` | Fundos de conteúdo, áreas claras |
| **Neon Blue** | `#00D4FF` | Links, badges ativos, destaques de interatividade |
| **JDM Gold** | `#FFB800` | Ratings, preços, badges de destaque/premium |

### 2.2 Tipografia

- **Headings**: `Inter` (weights: 600, 700, 800) — impacto e modernidade
- **Body**: `Inter` (weights: 400, 500) — legibilidade máxima
- **Monospace** (preços, códigos de peça): `JetBrains Mono` ou `Space Mono`

### 2.3 Sistema Espacial

- Base unit: `4px`
- Scale: `4, 8, 12, 16, 24, 32, 48, 64, 96px`
- Border radius: `6px` (botões), `8px` (cards), `12px` (modais)

### 2.4 Motion & Animação

- **Micro-interactions**: `150-200ms ease-out` — hover, focus
- **Page transitions**: `300ms ease-in-out`
- **Loading states**: Skeleton com shimmer gradient
- **Lance em tempo real**: Pulse animation + flash de cor

### 2.5 Ícones & Imagens

- **Ícones**: Lucide React (consistente, clean)
- **Imagens de produtos**: Aspect ratio `4:3`, lazy loading com blur placeholder
- **Logos de marcas**: Formato SVG para escalabilidade

---

## 3. Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| **Build Tool** | Vite | 6.x |
| **Framework** | React | 19.x |
| **Linguagem** | TypeScript | 5.x |
| **Estilização** | Tailwind CSS | 4.x |
| **UI Components** | Shadcn/UI | latest |
| **State Management** | Zustand | 5.x |
| **Server State** | TanStack Query | 5.x |
| **Rotas** | React Router | 7.x |
| **Forms** | React Hook Form + Zod | latest |
| **Backend/DB** | Supabase | Cloud |
| **Real-time** | Supabase Realtime | - |
| **Storage** | Supabase Storage | - |
| **i18n** | react-i18next | latest |
| **Charts** | Recharts | latest |
| **Date** | date-fns | latest |
| **Payment** | Stripe | - |
| **Deploy FE** | Vercel | - |

---

## 4. Arquitetura do Projeto

```
src/
├── components/
│   ├── ui/              # shadcn/ui components (Button, Input, Card...)
│   ├── layout/          # Header, Footer, Sidebar, MobileNav
│   ├── home/            # Hero, FeaturedParts, BrandCarousel, Categories
│   ├── catalog/         # PartCard, PartGrid, FilterSidebar, SortBar
│   ├── part/            # ImageGallery, PartInfo, BidSection, SellerInfo, Reviews
│   ├── auction/         # BidHistory, BidModal, CountdownTimer, BidAlert
│   ├── chat/            # ChatWindow, ChatList, MessageBubble
│   ├── dashboard/       # StatsCards, SalesChart, RecentActivity, ListingTable
│   └── auth/            # LoginForm, RegisterForm, AuthLayout
├── pages/
│   ├── Home.tsx
│   ├── Catalog.tsx
│   ├── PartDetail.tsx
│   ├── CreateListing.tsx
│   ├── EditListing.tsx
│   ├── Checkout.tsx
│   ├── Dashboard.tsx
│   ├── Messages.tsx
│   ├── Favorites.tsx
│   ├── auth/
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   └── seller/
│       ├── MyListings.tsx
│       └── SellerProfile.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useParts.ts
│   ├── useBids.ts
│   ├── useMessages.ts
│   └── useRealtime.ts
├── lib/
│   ├── supabase.ts       # Cliente Supabase
│   ├── utils.ts          # Helpers (cn, formatCurrency, formatDate...)
│   └── constants.ts      # Marcas, categorias, condições
├── stores/
│   ├── authStore.ts      # Zustand store for auth state
│   ├── cartStore.ts
│   └── uiStore.ts        # Modals, sidebars, toasts
├── types/
│   ├── database.ts       # Types do Supabase (generated)
│   ├── parts.ts          # Tipos de peças
│   ├── bids.ts
│   └── user.ts
├── styles/
│   └── globals.css        # Tailwind + custom CSS vars
└── App.tsx
```

---

## 5. Schema do Banco de Dados (Supabase/PostgreSQL)

### 5.1 Tabelas

#### `profiles`
```sql
id UUID REFERENCES auth.users PRIMARY KEY,
username TEXT UNIQUE NOT NULL,
email TEXT UNIQUE NOT NULL,
full_name TEXT,
avatar_url TEXT,
phone TEXT,
location TEXT,
bio TEXT,
rating DECIMAL(2,1) DEFAULT 0,
total_sales INTEGER DEFAULT 0,
total_reviews INTEGER DEFAULT 0,
is_verified BOOLEAN DEFAULT FALSE,
created_at TIMESTAMPTZ DEFAULT NOW(),
updated_at TIMESTAMPTZ DEFAULT NOW()
```

#### `brands`
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
name TEXT NOT NULL,
slug TEXT UNIQUE NOT NULL,
logo_url TEXT,
country TEXT,
created_at TIMESTAMPTZ DEFAULT NOW()
```
> Nissan, Toyota, Honda, Mazda, Subaru, Mitsubishi, Lexus, Acura, Infiniti, etc.

#### `car_models`
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
brand_id UUID REFERENCES brands NOT NULL,
name TEXT NOT NULL,
slug TEXT UNIQUE NOT NULL,
generation TEXT,
year_start INTEGER,
year_end INTEGER,
image_url TEXT,
body_type TEXT,
created_at TIMESTAMPTZ DEFAULT NOW()
```
> GT-R, Supra, NSX, RX-7, Evo, WRX, 86/BRZ, etc.

#### `categories`
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
name TEXT NOT NULL,
slug TEXT UNIQUE NOT NULL,
icon TEXT,
parent_id UUID REFERENCES categories,
created_at TIMESTAMPTZ DEFAULT NOW()
```
> Body Kits, Spoilers/Wings, Wheels/Rims, Brakes, Suspension, Engine, Exhaust, Interior, Lighting, Aero, Turbo/Boost, Cooling

#### `parts`
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
seller_id UUID REFERENCES profiles NOT NULL,
model_id UUID REFERENCES car_models,
category_id UUID REFERENCES categories,
title TEXT NOT NULL,
description TEXT,
specifications JSONB,
condition TEXT CHECK (condition IN ('new', 'like_new', 'excellent', 'good', 'fair')),
price DECIMAL(10,2),
auction_enabled BOOLEAN DEFAULT FALSE,
auction_start TIMESTAMPTZ,
auction_end TIMESTAMPTZ,
starting_bid DECIMAL(10,2),
current_bid DECIMAL(10,2),
buy_now_price DECIMAL(10,2),
images TEXT[],
status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'sold', 'ended', 'cancelled')),
brand_compatibility TEXT[],
year_start INTEGER,
year_end INTEGER,
part_number TEXT,
shipping_options JSONB,
views INTEGER DEFAULT 0,
watchers INTEGER DEFAULT 0,
featured BOOLEAN DEFAULT FALSE,
created_at TIMESTAMPTZ DEFAULT NOW(),
updated_at TIMESTAMPTZ DEFAULT NOW()
```

#### `bids`
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
part_id UUID REFERENCES parts NOT NULL,
bidder_id UUID REFERENCES profiles NOT NULL,
amount DECIMAL(10,2) NOT NULL,
is_winning BOOLEAN DEFAULT FALSE,
created_at TIMESTAMPTZ DEFAULT NOW()
```

#### `transactions`
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
part_id UUID REFERENCES parts NOT NULL,
buyer_id UUID REFERENCES profiles NOT NULL,
seller_id UUID REFERENCES profiles NOT NULL,
amount DECIMAL(10,2) NOT NULL,
commission_rate DECIMAL(4,2) DEFAULT 0.10,
commission_amount DECIMAL(10,2) NOT NULL,
platform_fee DECIMAL(10,2) NOT NULL,
seller_net DECIMAL(10,2) NOT NULL,
payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
fulfillment_status TEXT DEFAULT 'pending' CHECK (fulfillment_status IN ('pending', 'shipped', 'delivered', 'completed', 'disputed')),
stripe_payment_id TEXT,
created_at TIMESTAMPTZ DEFAULT NOW(),
updated_at TIMESTAMPTZ DEFAULT NOW()
```

#### `messages`
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
sender_id UUID REFERENCES profiles NOT NULL,
receiver_id UUID REFERENCES profiles NOT NULL,
part_id UUID REFERENCES parts,
content TEXT NOT NULL,
is_read BOOLEAN DEFAULT FALSE,
created_at TIMESTAMPTZ DEFAULT NOW()
```

#### `favorites`
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID REFERENCES profiles NOT NULL,
part_id UUID REFERENCES parts NOT NULL,
created_at TIMESTAMPTZ DEFAULT NOW(),
UNIQUE(user_id, part_id)
```

#### `reviews`
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
transaction_id UUID REFERENCES transactions NOT NULL,
reviewer_id UUID REFERENCES profiles NOT NULL,
reviewed_id UUID REFERENCES profiles NOT NULL,
rating INTEGER CHECK (rating >= 1 AND rating <= 5),
comment TEXT,
created_at TIMESTAMPTZ DEFAULT NOW()
```

### 5.2 Row Level Security (RLS)

Todas as tabelas têm RLS habilitado com políticas:
- `profiles`: Público ler, dono escrever
- `brands/categories/car_models`: Público total
- `parts`: Público ler, dono criar/atualizar
- `bids`: Dono e vendedor do part ler/escrever
- `messages`: Apenas remetente e destinatário
- `favorites`: Dono total
- `transactions`: Dono (buyer/seller) ler/escrever
- `reviews`: Público ler, dono criar

---

## 6. API & Endpoints (Supabase RPC)

### 6.1 Funções Edge

```sql
-- Criar novo lance (com validação)
create_bid(part_id, amount)

-- Processar fim de leilão
process_auction_end(part_id)

-- Criar transação com comissão
create_transaction(part_id, buyer_id)

-- Calcular comissão (10%)
calculate_commission(amount)
  RETURNS TABLE(commission, platform_fee, seller_net)

-- Incrementar visualização
increment_views(part_id)

-- Verificar e atualizar status do leilão
check_auction_status(part_id)
```

---

## 7. Funcionalidades do MVP

### 7.1 Autenticação
- Registro com email/senha
- Login com Google OAuth
- Recuperação de senha
- Perfil completo com avatar

### 7.2 Catálogo & Busca
- Listagem por marca (Nissan, Toyota, Honda...)
- Listagem por modelo (GT-R, Supra, NSX...)
- Listagem por categoria (Body Kits, Wheels, Brakes...)
- Busca por texto com sugestões
- Filtros: preço, condição, ano, categoria, localização
- Ordenação: mais recentes, menor/maior preço, mais lances
- Paginação com infinite scroll

### 7.3 Detalhe do Produto
- Galeria de imagens com lightbox
- Informações completas (specs, compatibilidade, condição)
- Preço ou andamento do leilão
- Countdown timer para leilões
- Histórico de lances
- Informações do vendedor (rating, total vendas)
- Reviews do vendedor
- Botão comprar/lance
- Adicionar aos favoritos
- Compartilhar
- Perguntas ao vendedor

### 7.4 Sistema de Vendas
- **Venda direta**: Preço fixo + opção "Compre Agora"
- **Leilão**: Lance inicial + duração configurável
- Upload múltiplo de imagens (até 10)
- Editor de descrição com preview
- Preview da listagem antes de publicar
- Editar/deletar listagem (se não vendida)
- Relistar itens

### 7.5 Sistema de Lances
- Lance mínimo (incremento de 5% ou valor definido)
- Lance automático (proxy bidding)
- Notificação quando superado
- Alerta visual em tempo real
- Validação: usuário não pode dar lance na própria peça

### 7.6 Checkout & Pagamento
- Carrinho de compras
- Stripe Checkout / Stripe Elements
- Cálculo automático de comissão (10%)
- Detalhamento: subtotal, comissão, taxa plataforma, total
- Status da transação em tempo real
- Confirmação por email

### 7.7 Chat / Mensagens
- Conversas por produto
- Lista de conversas ordenadas por recente
- Notificações de mensagens não lidas
- Suporte a realtime (Supabase Realtime)
- Webhook para notificações push

### 7.8 Dashboard do Vendedor
- Visão geral (vendas, receita, visualizações)
- Gráfico de vendas (últimos 30 dias)
- Listagens ativas / vendidas / encerradas
- Pedidos pendentes
- Mensagens não lidas
- Gerenciamento de estoque
- Configurações da loja

### 7.9 Recursos Adicionais
- Favoritos / Watchlist
- Notifications center
- Página de perfil do vendedor pública
- Reviews e ratings após transação
- Busca salva
- Comparação de peças

---

## 8. Fluxo de Usuário

### 8.1 Visitante → Compra Direta
```
Home → Browse catálogo → Filtra por modelo → Part Card →
Part Detail → Buy Now → Checkout (Stripe) → Confirmação →
Recebe email → Avalia vendedor
```

### 8.2 Visitante → Leilão
```
Home → Seção Leilões → Part Card → Part Detail →
Faz lance → [Se superado] Notificação →
[Fim do leilão] Se vencedor → Checkout → Confirmação
```

### 8.3 Usuário → Listar Peça
```
Login/Registro → Dashboard → Nova listagem →
Preenche dados → Upload imagens → Preview →
Publica → Aparece no catálogo
```

---

## 9. Modelo de Monetização

### 9.1 Taxas
| Tipo | Valor |
|------|-------|
| **Comissão plataforma** | 10% sobre valor final |
| **Taxa pagamento (Stripe)** | 2.9% + 30¢ por transação |
| **Taxa listagem** | Gratuito (MVP) |
| **Destaque do anúncio** | Gratuito (MVP) |

### 9.2 Breakdown por Venda de ¥10.000
```
Valor da peça:        ¥10.000
Comissão (10%):       -¥1.000
Taxa Stripe (~3%):     -¥290
─────────────────────────────
Vendedor recebe:       ¥8.710
Plataforma lucra:      ¥1.290
```

---

## 10. Responsabilidades

### 10.1 Frontend
- Interface responsiva (mobile-first)
- Performance (Core Web Vitals < thresholds)
- Acessibilidade (WCAG 2.1 AA)
- SEO (SSR/SSG para páginas públicas)
- PWA-ready

### 10.2 Backend
- RLS em todas as tabelas
- Rate limiting
- Validação Zod em todos os inputs
- Soft delete para dados críticos
- Backups automáticos (Supabase)

### 10.3 Realtime
- Lances atualizados em tempo real
- Mensagens em tempo real
- Status de auction atualizado
- Notificações push

---

## 11. Roadmap de Desenvolvimento

### Fase 1 — MVP Core (4-6 semanas)
- [ ] Setup projeto (Vite + React + TS + Tailwind)
- [ ] Configuração Supabase (schema + RLS)
- [ ] Design system + componentes base
- [ ] Autenticação (registro + login + OAuth)
- [ ] Páginas públicas (Home + Catálogo)
- [ ] Detalhe do produto
- [ ] Sistema de listagem de peças
- [ ] Sistema de compras diretas
- [ ] Checkout com Stripe

### Fase 2 — Leilões & Realtime (2-3 semanas)
- [ ] Sistema de lances
- [ ] Realtime updates
- [ ] Countdown timers
- [ ] Histórico de lances
- [ ] Notificações de lance

### Fase 3 — Social & Engagement (2 semanas)
- [ ] Chat/mensagens
- [ ] Favoritos
- [ ] Reviews e ratings
- [ ] Dashboard do vendedor

### Fase 4 — Polish & Scale (1-2 semanas)
- [ ] Testes E2E
- [ ] Performance optimization
- [ ] SEO setup
- [ ] Analytics
- [ ] Email templates
- [ ] Deploy production

---

## 12. Configuração de Ambiente

### Variáveis de Ambiente (.env)
```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

---

Este documento serve como especificação técnica completa para o desenvolvimento do JAPANCAR PARTS.
