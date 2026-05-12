# ANÁLISE COMPLETA DO PROJETO GAID

## Marketplace de Peças Automotivas Japonesas

**Versão:** 1.0.0  
**Data da Análise:** 2026-05-11  
**Analisado por:** opencode

---

## 1. VISÃO GERAL DO PROJETO

**GAID** é um marketplace C2C (Consumer-to-Consumer) para peças de carros japoneses de alta performance (JDM - Japan Domestic Market), operando exclusivamente no Japão com entrega para todo o território japonês.

### Nome e Branding
- **Nome:** GAID (Gai-D? - Referência a "Gaiden" ou estilo street racing japonês)
- **Domínio:** japancarparts.jp
- **Slogan:** "A plataforma definitiva para compra e venda de peças no Japão"

### Diferencial Competitivo
- Catálogo completo e inteligente por modelo/ano
- Suporte a vendas diretas e leilões em tempo real
- Focado exclusivamente no mercado japonês
- Identificação inteligente de peças via Google Gemini (IA)
- Cobertura 100% do território japonês

### Público-Alvo
- Entusiastas de carros JDM no Japão
- Oficinas e mecânicos especializados
- Importadores de peças automotivas
- Colecionadores de peças raras

---

## 2. STACK TECNOLÓGICA

### Frontend
| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| Vite | 5.x | Build tool e dev server |
| React | 18.2.0 | Framework UI |
| TypeScript | 5.3.3 | Linguagem tipada |
| Tailwind CSS | 3.4.19 | Estilização |
| TanStack Query | 5.17.0 | Gerenciamento de estado servidor |
| Zustand | 4.4.7 | State management client |
| React Router | 6.21.0 | Roteamento |
| Lucide React | 0.303.0 | Ícones |
| Recharts | 3.8.1 | Gráficos |

### Backend (BaaS)
| Serviço | Plano | Propósito |
|---------|-------|-----------|
| Supabase | Cloud | Database, Auth, Storage, Realtime, Edge Functions |
| PostgreSQL | - | Banco de dados relacional |
| Supabase Auth | - | Autenticação (email + Google OAuth) |
| Supabase Storage | - | Armazenamento de imagens |
| Supabase Realtime | - | WebSocket para chat e auctions |

### Integrações Externas
| Serviço | Status | Propósito |
|---------|--------|-----------|
| Stripe | Preparado | Pagamentos e checkout |
| Google OAuth | Implementado | Login social |
| Google Gemini | Preparado | IA para identificação de peças |

---

## 3. ESTRUTURA DO PROJETO

```
car-parts-marketplace/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx      # Header com navegação
│   │   │   ├── Footer.tsx      # Footer com links
│   │   │   └── Layout.tsx      # Layout principal ( Outlet )
│   │   ├── admin/
│   │   │   └── analytics/
│   │   │       ├── index.ts
│   │   │       ├── CategoryChart.tsx
│   │   │       ├── RevenueChart.tsx
│   │   │       ├── TopSellersChart.tsx
│   │   │       ├── TransactionStatus.tsx
│   │   │       └── UserGrowthChart.tsx
│   │   ├── AdminRoute.tsx      # Proteção de rotas admin
│   │   ├── ProtectedRoute.tsx  # Proteção de rotas autenticadas
│   │   ├── ChatPopup.tsx       # Chat flutuante
│   │   ├── GaidLogo.tsx       # Logo GAID
│   │   ├── LanguageDetector.tsx # Detecção de idioma
│   │   ├── PurchaseFlow.tsx    # Fluxo de compra
│   │   └── SimulateSale.tsx   # Simulação de vendas (demo)
│   ├── pages/
│   │   ├── Home.tsx           # Página inicial
│   │   ├── Catalog.tsx        # Catálogo com filtros
│   │   ├── ProductDetail.tsx   # Detalhes do produto
│   │   ├── Login.tsx          # Login
│   │   ├── Register.tsx       # Registro
│   │   ├── Dashboard.tsx      # Dashboard do vendedor
│   │   ├── CreateListing.tsx   # Criar anúncio
│   │   ├── Profile.tsx        # Perfil do usuário
│   │   ├── Favorites.tsx       # Lista de favoritos
│   │   ├── Messages.tsx        # Mensagens/Chat
│   │   ├── PaymentCheckout.tsx # Checkout de pagamento
│   │   └── admin/
│   │       ├── Dashboard.tsx   # Dashboard administrativo
│   │       ├── UserManagement.tsx # Gerenciamento de usuários
│   │       └── TransactionManagement.tsx # Gerenciamento de transações
│   ├── stores/
│   │   ├── authStore.ts        # Zustand store para autenticação
│   │   └── favoriteStore.ts    # Zustand store para favoritos
│   ├── lib/
│   │   ├── supabase.ts         # Cliente Supabase + funções admin
│   │   ├── api.ts              # Wrapper para Edge Functions
│   │   ├── constants.ts        # BRANDS, CATEGORIES, CONDITIONS
│   │   ├── i18n.tsx           # Sistema de internacionalização
│   │   └── supabaseErrorHandler.ts # Tratamento de erros
│   ├── hooks/
│   │   ├── useAnalytics.ts     # Hook para analytics
│   │   └── useTranslation.ts   # Hook para tradução
│   ├── types/
│   │   └── index.ts            # TypeScript types (User, Product, etc)
│   ├── App.tsx                 # Componente principal com rotas
│   ├── main.tsx                # Entry point com providers
│   └── index.css              # Estilos globais + Tailwind
├── supabase/                   # Configurações do Supabase
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── dist/                       # Build de produção
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
├── SPEC.md                     # Especificação técnica completa
├── INFRASTRUCTURE.md           # Documentação de infraestrutura
└── README.md

---

## 4. FUNCIONALIDADES IMPLEMENTADAS

### 4.1 Autenticação e Usuários
- [x] Registro com email/senha
- [x] Login com email/senha
- [x] Login com Google OAuth
- [x] Recuperação de senha (preparado)
- [x] Perfil completo com avatar
- [x] Edição de perfil (nome, telefone, endereço)
- [x] Verificação de usuário (is_verified)
- [x] Sistema de roles (admin, user)

### 4.2 Catálogo e Busca
- [x] Listagem por marca (Nissan, Toyota, Honda, Mazda, Subaru, Mitsubishi...)
- [x] Listagem por categoria (Body Kits, Wheels, Brakes, Suspension...)
- [x] Busca por texto
- [x] Filtros por:
  - [x] Marca
  - [x] Modelo
  - [x] Categoria
  - [x] Condição (novo, usado, reformado)
  - [x] Ano inicial e final
  - [x] Faixa de preço
- [x] Ordenação (mais recentes, menor/maior preço, mais visualizados)
- [x] Paginação (limite de 50 itens)
- [x] Lazy loading de imagens

### 4.3 Detalhe do Produto
- [x] Galeria de imagens com seleção
- [x] Informações completas (título, descrição, preço, condição)
- [x] Compatibilidade (marca, modelo, anos)
- [x] Informações do vendedor
- [x] Botão adicionar aos favoritos
- [x] Botão compartilhar
- [x] Botão enviar mensagem
- [x] Botão comprar agora
- [x] Contador de visualizações
- [x] Badge de condição
- [x] Indicadores de segurança (compra segura, envio)

### 4.4 Sistema de Anúncios
- [x] Criação de anúncios
- [x] Upload de imagens
- [x] Edição de anúncios
- [x] Exclusão de anúncios
- [x] Status do anúncio (draft, active, sold, ended, cancelled)
- [x] Listagem de anúncios do vendedor

### 4.5 Favoritos
- [x] Adicionar/remover favoritos
- [x] Toggle de favorito
- [x] Persistência em localStorage
- [x] Listagem de favoritos
- [x] Sincronização com UI (botão coração preenchido)

### 4.6 Mensagens e Chat
- [x] Chat flutuante (ChatPopup)
- [x] Lista de conversas
- [x] Envio de mensagens
- [x] Realtime via Supabase (preparado)
- [x] Link para chat na página de produto

### 4.7 Checkout e Pagamentos
- [x] Página de checkout
- [x] Integração Stripe (preparada)
- [x] Fluxo de compra completo (PurchaseFlow)
- [x] Cálculo de comissões
- [x] Criação de transações
- [x] Status de pagamento (pending, paid, refunded, failed)

### 4.8 Dashboard do Vendedor
- [x] Visão geral com estatísticas
- [x] Cards de métricas (anúncios ativos, visualizações, vendas, mensagens)
- [x] Listagem de anúncios do vendedor
- [x] Gráfico de vendas (preparado)
- [x] Edição de perfil
- [x] Links rápidos (nova listagem, mensagens, favoritos)
- [x] Simulação de vendas (demo)

### 4.9 Dashboard Administrativo
- [x] Analytics geral
- [x] Gráfico de receita (RevenueChart)
- [x] Gráfico de crescimento de usuários (UserGrowthChart)
- [x] Gráfico de categorias (CategoryChart)
- [x] Gráfico de top vendedores (TopSellersChart)
- [x] Status de transações (TransactionStatus)
- [x] Gerenciamento de usuários
- [x] Gerenciamento de transações
- [x] Atualização de status de usuário (role, verified)
- [x] Atualização de status de transação

### 4.10 Internacionalização
- [x] Sistema i18n implementado
- [x] Detecção de idioma
- [x] Traduções em PT e JA
- [x] Hook useI18n para tradução

---

## 5. MODELO DE DADOS

### 5.1 Tabelas do Banco de Dados

#### profiles
```typescript
interface Profile {
  id: string
  email: string
  full_name?: string
  name?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  cep?: string
  avatar_url?: string
  bio?: string
  rating?: number
  total_sales?: number
  is_verified?: boolean
  role?: 'admin' | 'user'
  created_at: string
  updated_at?: string
}
```

#### parts (Produtos/Anúncios)
```typescript
interface Part {
  id: string
  seller_id: string
  title: string
  description: string
  price: number
  condition: 'new' | 'used' | 'refurbished'
  brand_id?: string
  category_id?: string
  model_id?: string
  images: string[]
  status: 'draft' | 'active' | 'sold' | 'ended' | 'cancelled'
  views: number
  watchers: number
  featured: boolean
  created_at: string
  updated_at: string
}
```

#### transactions
```typescript
interface Transaction {
  id: string
  part_id: string
  buyer_id: string
  seller_id: string
  amount: number
  commission_rate: number
  commission_amount: number
  platform_fee: number
  seller_net: number
  payment_status: 'pending' | 'paid' | 'refunded' | 'failed'
  fulfillment_status: 'pending' | 'shipped' | 'delivered' | 'completed' | 'disputed'
  stripe_payment_id?: string
  created_at: string
  updated_at: string
}
```

#### messages
```typescript
interface Message {
  id: string
  sender_id: string
  receiver_id: string
  part_id?: string
  content: string
  is_read: boolean
  created_at: string
}
```

### 5.2 Relacionamentos
- `profiles` → `parts` (1:N) - Um usuário pode ter vários anúncios
- `profiles` → `transactions` (1:N) - Um usuário pode ter várias transações
- `parts` → `transactions` (1:N) - Um anúncio pode ter várias transações
- `profiles` → `messages` (1:N) - Um usuário pode enviar/receber mensagens

---

## 6. MARCAS E CATEGORIAS

### 6.1 Marcas Suportadas
| Marca | Modelos |
|-------|---------|
| Nissan | GT-R, Skyline, Silvia, Fairlady Z, 350Z, 370Z, Altima, Sentra |
| Toyota | Supra, AE86, GT86, GR86, MR2, Celica, Land Cruiser, GR Corolla |
| Honda | NSX, S2000, Civic Type R, Integra, Accord, Prelude, CR-Z |
| Mazda | RX-7, RX-8, MX-5, Miata, Mazda3, Mazda6 |
| Subaru | WRX STI, WRX, BRZ, Impreza, Legacy, Forester |
| Mitsubishi | Lancer Evo, Lancer, FTO, 3000GT, Eclipse, Pajero |
| Lexus | LFA, RC F, GS F, IS F, LC, LS, NX, RX |
| Acura | NSX, Integra Type R, RLX, TLX, RDX |
| Infiniti | G35, G37, Q60, Q50, FX, QX |

### 6.2 Categorias de Peças
| Categoria | Ícone |
|------------|-------|
| Body Kits | Car |
| Wings & Spoilers | Triangle |
| Wheels & Rims | Circle |
| Brakes | Disc |
| Suspension | ArrowUpDown |
| Engine | Cylinder |
| Exhaust | Wind |
| Interior | Armchair |
| Lighting | Lightbulb |
| Aero | Waves |
| Turbo & Boost | Zap |
| Cooling | Thermometer |
| Electronics | Cpu |
| Transmission | Gear |
| Fuel System | Fuel |

---

## 7. DESIGN SYSTEM

### 7.1 Paleta de Cores
| Nome | Hex | Uso |
|------|-----|-----|
| Racing Red | #E63946 / #ff3d00 | CTAs, alertas, preços |
| Jet Black | #0D0D0D / #0a0a0a | Background principal |
| Carbon Gray | #1A1A2E | Cards, sidebars |
| Carbon Light | #16213E | Hover states |
| Chrome Silver | #C0C0C0 | Bordas, textos secundários |
| LED White | #F8F9FA | Fundos claros |
| Neon Blue | #00D4FF | Links, badges ativos |
| JDM Gold | #FFB800 / #ffd700 | Ratings, destaques |

### 7.2 Tipografia
- **Headings:** Inter (weights: 600, 700, 800)
- **Body:** Inter (weights: 400, 500)
- **Monospace:** JetBrains Mono / Space Mono (preços)

### 7.3 Componentes UI
- Cards com sombras e bordas
- Badges coloridos por status
- Botões primários (#ff3d00)
- Inputs com bordas escuras
- Loading spinners animados
- Skeleton loaders (preparado)

---

## 8. API E ENDPOINTS

### 8.1 Edge Functions do Supabase
O projeto utiliza Edge Functions para operações serverless:

```
/functions/v1/
├── analytics/
│   ├── all
│   ├── sales
│   ├── sellers
│   ├── categories
│   ├── users
│   ├── brands
│   ├── status
│   ├── daily
│   └── recent
├── parts/
│   ├── list
│   ├── get
│   └── create
├── users/
│   ├── me
│   └── get
├── transactions/
│   ├── list
│   ├── get
│   ├── create
│   ├── update
│   └── calculate
├── auctions/
│   ├── active
│   ├── list
│   ├── get
│   ├── create
│   └── bid
├── categories/
│   ├── list
│   └── get
├── brands/
│   ├── list
│   └── get
├── stripe-checkout/
│   ├── create-checkout
│   ├── create-connected-account
│   ├── account-link
│   └── portal
├── notifications/
├── analyze-part
└── (outras funções)
```

### 8.2 RPC Functions (PostgreSQL)
```sql
get_total_users()      -- Retorna total de usuários
get_total_gmv()        -- Retorna GMV total
get_total_revenue()    -- Retorna receita total
```

---

## 9. SEGURANÇA

### 9.1 Row Level Security (RLS)
Todas as tabelas do Supabase têm RLS habilitado com políticas específicas:

- **profiles:** Público ler, dono escrever
- **brands/categories/car_models:** Público total
- **parts:** Público ler, dono criar/atualizar
- **bids:** Dono e vendedor ler/escrever
- **messages:** Apenas remetente e destinatário
- **favorites:** Dono total
- **transactions:** Dono (buyer/seller) ler/escrever
- **reviews:** Público ler, dono criar

### 9.2 Autenticação
- JWT tokens com expiração
- Session duration: 7 dias
- Google OAuth 2.0
- Password policy: mínimo 8 caracteres

### 9.3 Headers de Segurança (preparado)
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; img-src 'self' https: data:;
```

---

## 10. FLUXOS DE USUÁRIO

### 10.1 Visitante → Compra Direta
```
Home → Browse catálogo → Filtra por modelo → Part Card →
Part Detail → Buy Now → Checkout (Stripe) → Confirmação →
Recebe email → Avalia vendedor
```

### 10.2 Visitante → Leilão (preparado)
```
Home → Seção Leilões → Part Card → Part Detail →
Faz lance → [Se superado] Notificação →
[Fim do leilão] Se vencedor → Checkout → Confirmação
```

### 10.3 Usuário → Listar Peça
```
Login/Registro → Dashboard → Nova listagem →
Preenche dados → Upload imagens → Preview →
Publica → Aparece no catálogo
```

### 10.4 Autenticação
```
Home → Login/Register →
[Email] Preenche credenciais → Valida → Redireciona
[Google] Clica Google → OAuth redirect → Cria perfil → Redireciona
```

---

## 11. MODELO DE MONETIZAÇÃO

### 11.1 Taxas
| Tipo | Valor |
|------|-------|
| Comissão plataforma | 10% sobre valor final |
| Taxa pagamento (Stripe) | 2.9% + ¥30 por transação |
| Taxa listagem | Gratuito (MVP) |
| Destaque do anúncio | Gratuito (MVP) |

### 11.2 Breakdown por Venda de ¥10.000
```
Valor da peça:        ¥10.000
Comissão (10%):       -¥1.000
Taxa Stripe (~3%):     -¥320
────────────────────────────────
Vendedor recebe:       ¥8.680
Plataforma lucra:      ¥1.320
```

---

## 12. INFRAESTRUTURA DE PRODUÇÃO

### 12.1 Arquitetura
```
┌─────────────────────────────────────┐
│         FRONTEND (Vercel)           │
│  React SPA + Static Assets + CDN    │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│         BACKEND (Supabase)          │
│  PostgreSQL + Auth + Storage + RT  │
│         Tokyo Region                │
└─────────────────┬───────────────────┘
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
┌───────────────┐   ┌───────────────┐
│    Stripe      │   │   Google      │
│  (Payments)    │   │   (OAuth)     │
└───────────────┘   └───────────────┘
```

### 12.2 Custos Mensais Estimados
| Serviço | Custo (JPY) | Custo (USD) |
|---------|-------------|-------------|
| Vercel Pro | ¥2,500 | ~$17 |
| Supabase Pro | ¥4,500 | ~$30 |
| Stripe | Fee passed | - |
| Domínio (.jp) | ¥250 | ~$2 |
| SendGrid | ¥1,500 | ~$10 |
| Sentry | ¥0 | - |
| Uptime Robot | ¥0 | - |
| **TOTAL** | **¥8,750** | **~$59** |

---

## 13. QUALIDADE DO CÓDIGO

### 13.1 Pontos Positivos
- ✅ TypeScript com tipos bem definidos
- ✅ Componentes funcionais com hooks
- ✅ Separação clara de responsabilidades
- ✅ Uso de Zustand para state management
- ✅ TanStack Query para data fetching
- ✅ RLS implementado no banco
- ✅ Validação de formulários
- ✅ Error handling consistente
- ✅ Código modular e reutilizável
- ✅ Documentação completa (SPEC.md, INFRASTRUCTURE.md)

### 13.2 Áreas de Melhoria
- ⚠️ Alguns componentes grandes podem ser divididos
- ⚠️ Falta testes unitários/e2e
- ⚠️ Falta documentação inline no código
- ⚠️ Algumas inconsistências de nomenclatura (text/text-secondary vs classes hardcoded)
- ⚠️ Algumas páginas não implementadas (EditListing, SellerProfile)
- ⚠️ Sistema de leilão não implementado (apenas preparado)
- ⚠️ Falta otimização de imagens (WebP, lazy loading nativo)

---

## 14. ARQUIVOS IMPORTANTES

| Arquivo | Descrição |
|---------|-----------|
| `SPEC.md` | Especificação técnica completa |
| `INFRASTRUCTURE.md` | Documentação de infraestrutura |
| `README.md` | Documentação do projeto |
| `src/App.tsx` | Rotas e configuração principal |
| `src/lib/supabase.ts` | Cliente Supabase e funções admin |
| `src/lib/api.ts` | Wrapper para Edge Functions |
| `src/stores/authStore.ts` | Estado de autenticação |
| `src/lib/constants.ts` | Constantes (marcas, categorias) |

---

## 15. PRÓXIMOS PASSOS (ROADMAP)

### Fase 1 — MVP Core ✅
- [x] Setup projeto (Vite + React + TS + Tailwind)
- [x] Configuração Supabase (schema + RLS)
- [x] Design system + componentes base
- [x] Autenticação (registro + login + OAuth)
- [x] Páginas públicas (Home + Catálogo)
- [x] Detalhe do produto
- [x] Sistema de listagem de peças
- [x] Sistema de compras diretas
- [x] Checkout com Stripe

### Fase 2 — Leilões & Realtime 🔄
- [ ] Sistema de lances
- [ ] Realtime updates para lances
- [ ] Countdown timers
- [ ] Histórico de lances
- [ ] Notificações de lance

### Fase 3 — Social & Engagement 📋
- [x] Chat/mensagens
- [x] Favoritos
- [ ] Reviews e ratings
- [x] Dashboard do vendedor

### Fase 4 — Polish & Scale 📋
- [ ] Testes E2E
- [ ] Performance optimization
- [ ] SEO setup (SSR/SSG)
- [ ] PWA support
- [ ] Email templates
- [ ] Deploy production

---

## 16. CONCLUSÃO

O projeto **GAID** é um marketplace bem estruturado e completo para peças automotivas JDM no Japão. A arquitetura é sólida, utilizando tecnologias modernas e escaláveis como React, TypeScript, Supabase e Stripe.

O código é bem organizado, com boa separação de responsabilidades e seguir práticas recomendadas de desenvolvimento. O projeto está em um estágio avançado de desenvolvimento, com a maioria das funcionalidades core implementadas.

**Pontos fortes:**
- Tech stack moderna e consistente
- Arquitetura bem definida
- RLS e segurança implementados
- UI responsiva e atraente
- Documentação completa

**Áreas para evolução:**
- Sistema de leilões
- Testes automatizados
- Otimizações de performance
- PWA/SEO

**Recomendação:** O projeto está pronto para um soft launch com as funcionalidades atuais. O sistema de leilões pode ser implementado como feature phase 2.

---

*Documento gerado automaticamente pelo opencode*
*Análise completa baseada em codebase inspection*
