# JAPANCAR PARTS — Status do Projeto

> **Documento de acompanhamento do desenvolvimento e estado atual do projeto.**
> Última atualização: 2026-05-09

---

## 1. Visão Geral do Projeto

| Item | Descrição |
|------|-----------|
| **Nome** | JAPANCAR PARTS |
| **Tipo** | Marketplace de peças automotivas JDM |
| **Mercado** | Japão |
| **Stack** | React 19 + TypeScript + Vite + Tailwind + Supabase |
| **Domínio** | japancarparts.jp (em desenvolvimento) |

---

## 2. Status Atual

### Fase de Desenvolvimento: **Testes de Catálogo**

Estamos atualmente na fase de **testes do catálogo de peças**. O sistema básico de listagem e visualização está operacional.

---

## 3. Funcionalidades Implementadas

### 3.1 Frontend ✅

| Página/Componente | Status | Notas |
|-------------------|--------|-------|
| **Home** | ✅ Completo | Hero, marcas, categorias, peças em destaque |
| **Catalog** | ✅ Completo | Filtros (marca, modelo, categoria, condição, preço), ordenação, paginação |
| **ProductDetail** | ✅ Completo | Galeria, informações, seller info, compra direta |
| **Login** | ✅ Completo | Email/password + Google OAuth |
| **Register** | ✅ Completo | Cadastro com validação |
| **Dashboard** | ✅ Completo | Stats do vendedor, listagens, transações |
| **CreateListing** | ✅ Completo | Criação de anúncios com upload de imagens |
| **Favorites** | ✅ Completo | Lista de favoritos |
| **Messages** | ✅ Completo | Chat entre comprador/vendedor |
| **Profile** | ✅ Completo | Edição de perfil |
| **Admin/UserManagement** | ✅ Completo | Gestão de usuários |
| **Admin/TransactionManagement** | ✅ Completo | Gestão de transações |
| **Admin/Dashboard** | ✅ Completo | Dashboard admin |

### 3.2 Backend ✅

| Serviço | Status | Notas |
|---------|--------|-------|
| **Database Schema** | ✅ Completo | 10 tabelas (profiles, brands, car_models, categories, parts, bids, transactions, messages, favorites, reviews) |
| **Auth** | ✅ Completo | Supabase Auth + Google OAuth |
| **Storage** | ✅ Completo | Buckets para imagens, avatares, logos |
| **Realtime** | ✅ Configurado | Para mensagens e lances |
| **Edge Functions** | ✅ Criadas | APIs em `supabase/functions/` |

### 3.3 Sistema de Mensagens ✅

O sistema de mensagens já está implementado e funcional:

| Feature | Status |
|---------|--------|
| Lista de conversas | ✅ |
| Chat em tempo real | ✅ |
| Histórico de mensagens | ✅ |
| Visualização por produto | ✅ |
| Interface responsiva | ✅ |

---

## 4. Pendências e Próximos Passos

### 4.1 Alto Prioridade

| Item | Descrição | Status |
|------|-----------|--------|
| **Políticas RLS** | Implementar Row Level Security no banco de dados | ⏳ Pendente |
| **Webhooks Stripe** | Configurar webhook para processar pagamentos | ⏳ Pendente |
| **Transações** | Finalizar fluxo de compra/venda | ⏳ Pendente |

### 4.2 Médio Prioridade

| Item | Descrição | Status |
|------|-----------|--------|
| **Sistema de Leilões** | Lances, countdown, histórico | ⏳ Pendente |
| **Reviews/Avaliações** | Sistema de rating pós-venda | ⏳ Pendente |
| **Notificações** | Email/push para novas mensagens e lances | ⏳ Pendente |

### 4.3 Baixo Prioridade

| Item | Descrição | Status |
|------|-----------|--------|
| **Chatbot para leads** | Automação de captação | 📋 Backlog |
| **Analytics** | Dashboard de métricas | 📋 Backlog |
| **PWA** | Progressive Web App | 📋 Backlog |

---

## 5. Implementar: Políticas RLS (Row Level Security)

### 5.1 O que são Políticas RLS?

RLS (Row Level Security) é um recurso do PostgreSQL/Supabase que controla quais linhas cada usuário pode ver ou modificar no banco de dados.

### 5.2 Políticas Necessárias

```sql
-- =============================================
-- POLÍTICAS RLS - JAPANCAR PARTS
-- =============================================

-- 1. PROFILES (usuários)
-- Qualquer um pode ler perfis públicos (nome, avatar, rating)
-- Apenas o próprio usuário pode editar
CREATE POLICY "profiles_read_public" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 2. PARTS (anúncios)
-- Todos podem ver anúncios ativos
CREATE POLICY "parts_read_active" ON parts
  FOR SELECT USING (status = 'active' OR seller_id = auth.uid());

-- Apenas vendedores podem criar/editar seus próprios anúncios
CREATE POLICY "parts_insert_own" ON parts
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "parts_update_own" ON parts
  FOR UPDATE USING (auth.uid() = seller_id);

-- 3. TRANSACTIONS
-- Apenas comprador e vendedor podem ver
CREATE POLICY "transactions_read_parties" ON transactions
  FOR SELECT USING (
    buyer_id = auth.uid() OR 
    seller_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role LIKE '%admin%')
  );

-- 4. MESSAGES
-- Apenas remetente e destinatário
CREATE POLICY "messages_read_parties" ON messages
  FOR SELECT USING (
    sender_id = auth.uid() OR receiver_id = auth.uid()
  );

CREATE POLICY "messages_insert_own" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- 5. FAVORITES
-- Apenas dono pode ver/adicionar
CREATE POLICY "favorites_own" ON favorites
  FOR ALL USING (user_id = auth.uid());

-- 6. BIDS (lances)
-- Apenas participante do leilão e vendedor
CREATE POLICY "bids_read_parties" ON bids
  FOR SELECT USING (
    bidder_id = auth.uid() OR
    EXISTS (SELECT 1 FROM parts WHERE id = part_id AND seller_id = auth.uid())
  );

CREATE POLICY "bids_insert_own" ON bids
  FOR INSERT WITH CHECK (auth.uid() = bidder_id);

-- 7. REVIEWS
-- Público para ler, apenas comprador pode criar
CREATE POLICY "reviews_read_public" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "reviews_insert_buyer" ON reviews
  FOR INSERT WITH CHECK (
    reviewer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM transactions 
      WHERE id = transaction_id AND buyer_id = auth.uid()
    )
  );
```

### 5.3 Ativar RLS em Todas as Tabelas

```sql
-- Ativar RLS em cada tabela
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
```

---

## 6. Implementar: Sistema de Mensagens Expandido

### 6.1 Estado Atual

O sistema de mensagens já está implementado com:
- Lista de conversas agrupadas
- Chat em tempo real
- Interface responsiva

### 6.2 Melhorias Necessárias

| Feature | Prioridade | Descrição |
|---------|------------|-----------|
| **Notificações** | Alta | Email quando receber mensagem |
| **Status online** | Média | Mostrar se usuário está online |
| **Mensagens não lidas** | Alta | Badge com contador |
| **Preview imagens** | Baixa | Mostrar thumbnails |

### 6.3 Código para Melhorias

```typescript
// Realtime para mensagens
supabase
  .channel('messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `receiver_id=eq.${user.id}`
  }, (payload) => {
    // Mostrar notificação
    showNotification('Nova mensagem!')
  })
  .subscribe()
```

---

## 7. Estrutura de Arquivos do Projeto

```
src/
├── components/
│   ├── AdminRoute.tsx
│   ├── LanguageDetector.tsx
│   ├── PurchaseFlow.tsx
│   └── layout/
│       ├── Footer.tsx
│       ├── Header.tsx
│       └── Layout.tsx
├── hooks/
│   └── useTranslation.ts
├── lib/
│   ├── constants.ts
│   ├── i18n.tsx
│   ├── supabase.ts
│   └── supabaseErrorHandler.ts
├── pages/
│   ├── Home.tsx
│   ├── Catalog.tsx
│   ├── ProductDetail.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Dashboard.tsx
│   ├── CreateListing.tsx
│   ├── Favorites.tsx
│   ├── Messages.tsx
│   ├── Profile.tsx
│   └── admin/
│       ├── Dashboard.tsx
│       ├── TransactionManagement.tsx
│       └── UserManagement.tsx
├── stores/
│   ├── authStore.ts
│   └── favoriteStore.ts
├── types/
│   └── index.ts
├── App.tsx
├── main.tsx
└── index.css

supabase/
└── functions/
    ├── parts/index.ts
    ├── users/index.ts
    ├── transactions/index.ts
    ├── auctions/index.ts
    ├── categories/index.ts
    ├── brands/index.ts
    └── utils/
        ├── base.ts
        ├── validators.ts
        └── health.ts
```

---

## 8. Banco de Dados

### 8.1 Tabelas

| Tabela | Descrição | Status |
|--------|-----------|--------|
| `profiles` | Perfis de usuários | ✅ |
| `brands` | Marcas de carros | ✅ |
| `car_models` | Modelos por marca | ✅ |
| `categories` | Categorias de peças | ✅ |
| `parts` | Anúncios de peças | ✅ |
| `bids` | Lances em leilões | ✅ |
| `transactions` | Transações/vendas | ✅ |
| `messages` | Mensagens | ✅ |
| `favorites` | Favoritos | ✅ |
| `reviews` | Avaliações | ✅ |

### 8.2 Índices

```sql
CREATE INDEX idx_parts_brand ON parts(brand_id);
CREATE INDEX idx_parts_category ON parts(category_id);
CREATE INDEX idx_parts_status ON parts(status);
CREATE INDEX idx_parts_price ON parts(price);
CREATE INDEX idx_parts_auction_end ON parts(auction_end) WHERE status = 'active';
```

---

## 9. Variáveis de Ambiente

```env
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<sua-chave>
VITE_STRIPE_PUBLIC_KEY=pk_live_...
VITE_GOOGLE_CLIENT_ID=<client-id>
VITE_APP_URL=http://localhost:5173
```

---

## 10. Próximos Passos Imediatos

1. **Aplicar políticas RLS** no Supabase (SQL)
2. **Testar sistema de mensagens** com usuários reais
3. **Configurar Stripe webhook** para processar pagamentos
4. **Finalizar fluxo de transações**

---

## 11. Contato e Suporte

| Canal | Info |
|-------|------|
| **Email** | suporte@japancarparts.jp |
| **GitHub** | (repositório) |

---

*Documento atualizado: 2026-05-09*
*Projeto: JAPANCAR PARTS Marketplace*
*Versão: 1.0.0*