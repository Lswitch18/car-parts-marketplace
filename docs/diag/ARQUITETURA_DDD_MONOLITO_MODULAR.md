# Arquitetura DDD (Domain-Driven Design) e Monólito Modular (DAIG SaaS)

## 📌 1. Conceito da Arquitetura: Monólito Modular + DDD

A plataforma **Digital AIGarage (DAIG)** adota a arquitetura de **Monólito Modular orientado a Domínios (DDD)**. 

Esta abordagem garante:
* **Isolação Clara de Responsabilidades:** Cada módulo (`src/modules/[context]`) representa um **Bounded Context** com suas próprias entidades, serviços e tipos.
* **Baixo Acoplamento:** Módulos não acessam o banco de dados de outros domínios diretamente; a comunicação é feita exclusivamente via interfaces públicas exportadas em `src/modules/[context]/index.ts`.
* **Caminho Simples para Microsserviços:** Se um módulo (ex: `ai-cataloger` ou `inventory`) precisar escalar de forma independente no futuro, ele pode ser extraído para um microsserviço serverless sem refatorar o restante do código.

---

## 🏛️ 2. Mapeamento de Bounded Contexts (Domínios DDD)

```
                                  +---------------------------------------+
                                  |     IDENTITY & TENANT CONTEXT         |
                                  |     - Organizações, Usuários, RBAC    |
                                  +---------------------------------------+
                                                      |
                  +-----------------------------------+-----------------------------------+
                  |                                   |                                   |
                  v                                   v                                   v
+-----------------------------------+ +-----------------------------------+ +-----------------------------------+
|  INVENTORY & WMS CONTEXT          | |  SERVICE ORDERS (O.S.) CONTEXT    | |  AI CATALOGER & 3D CONTEXT      |
|  - Estoque Privado do Tenant      | |  - Ordens de Serviço da Oficina | |  - Visão por IA (Gemini/Ollama)  |
|  - Prateleira WMS & QR Code       | |  - Cadastro de Veículos & VIN   | |  - Modelo 3D Interativo GLTF    |
+-----------------------------------+ +-----------------------------------+ +-----------------------------------+
                  |                                   |                                   |
                  +-----------------------------------+-----------------------------------+
                                                      |
                                                      v
                                  +---------------------------------------+
                                  |   MARKETPLACE & ESCROW CONTEXT        |
                                  |   - Feed Público de Vendas            |
                                  |   - Botão de Publicação em 1-Clique   |
                                  |   - Custódia Escrow (Stripe Connect)  |
                                  +---------------------------------------+
```

---

## 📂 3. Estrutura de Pastas do Monólito Modular (`src/modules/`)

```text
src/
├── modules/
│   ├── identity/                  # 🔑 Identity & Tenant Context
│   │   ├── components/            # ProtectedRoute, TenantGuard, SubdomainResolver
│   │   ├── pages/                 # Login, Register, Profile, TenantSelect
│   │   ├── services/              # TenantService, AuthService
│   │   ├── store/                 # authStore.ts (Zustand)
│   │   └── types/                 # User, Tenant, Role
│   │
│   ├── inventory/                 # 📦 Inventory & WMS Context
│   │   ├── components/            # QRCodePrinter, ShelfMapper, StockTable
│   │   ├── pages/                 # StockList, WMSWarehousePage, BarcodeScan
│   │   ├── services/              # InventoryService, QRGeneratorService
│   │   └── types/                 # PartItem, WarehouseLocation, QRLabel
│   │
│   ├── service-orders/            # 🚗 Service Order (O.S.) Context
│   │   ├── components/            # OSForm, CustomerVehicleLookup, OSStatusBadge
│   │   ├── pages/                 # ServiceOrderList, OSDetail
│   │   ├── services/              # ServiceOrderService, CustomerService
│   │   └── types/                 # WorkOrder, Vehicle, Customer
│   │
│   ├── ai-cataloger/              # 🤖 AI Cataloger & 3D Context
│   │   ├── components/            # PhotoUploadScanner, CameraScannerModal
│   │   ├── pages/                 # AICatalogPage, Mesh3DPreview
│   │   ├── services/              # VisionAIService, Replicate3DService
│   │   └── types/                 # AICatalogResult, Mesh3DData
│   │
│   ├── marketplace/               # 🛒 Marketplace & Escrow Context
│   │   ├── components/            # OneClickPublishToggle, EscrowBadge, PublicFeed
│   │   ├── pages/                 # Catalog, PublicProductDetail, Checkout
│   │   ├── services/              # MarketplaceService, StripeEscrowService
│   │   └── types/                 # PublicListing, StripeSession
│   │
│   └── shared/                    # 🛠️ Kernel Compartilhado (Shared Infrastructure)
│       ├── components/            # Layout, Navbar, Button, Modal, Card
│       ├── lib/                   # Supabase client, Upstash Redis, i18n
│       └── types/                 # Common interfaces (PaginatedResult, APIError)
```

---

## 🔄 4. Regras de Comunicação Entre Módulos

1. **Apenas Exportações Públicas:** O módulo `inventory` só pode importar do módulo `identity` através do seu arquivo de barreira (`@/modules/identity`). Importações profundas (ex: `@/modules/identity/internal/helper`) são proibidas.
2. **Eventos de Domínio (In-Memory Event Bus):** Quando uma venda ocorre no `marketplace`, um evento `PartSoldEvent` é publicado. O módulo `inventory` escuta esse evento e atualiza o estoque sem que o `marketplace` conheça as regras internas do `inventory`.
3. **Inversão de Dependência:** Todo serviço depende de interfaces, não de implementações concretas de banco de dados.

---

## 🖥️ 5. Painel Privado do Tenant (`TenantDashboard.tsx`)

A tela do painel do Tenant (`/tenant/dashboard`) consolida todos os domínios para o usuário empresarial:

* **Métricas Principais:** Valor Total do Estoque Privado em JPY (¥), O.S. em Aberto na Oficina, Peças Catalogadas com IA e Itens com 1-Clique Ativo.
* **Ações Rápidas:**
  * 📸 *Nova Catalogação com IA (30s)*
  * 🏷️ *Gerar Etiquetas QR Code de Prateleira*
  * 🚗 *Nova Ordem de Serviço (O.S.)*
  * 🛒 *Gerenciar Peças no Marketplace DAIG*
