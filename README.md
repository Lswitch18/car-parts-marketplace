# JAPANCAR PARTS

Marketplace de peças de carros japoneses JDM.

## Tech Stack

- **Vite** + **React** + **TypeScript**
- **Tailwind CSS** (v4)
- **Supabase** (Backend as a Service)
- **TanStack Query** (Server State)
- **Zustand** (Client State)
- **React Router** (Routing)

## Setup

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Copie o `.env.example` para `.env` e preencha com suas credenciais:

```bash
cp .env.example .env
```

3. Execute o schema SQL no Supabase Dashboard:
   - Vá em **SQL Editor**
   - Cole o conteúdo de `supabase-schema.sql`
   - Execute

### 3. Rodar em desenvolvimento

```bash
npm run dev
```

## Estrutura do Projeto

```
src/
├── components/
│   └── layout/
│       └── Header.tsx
├── hooks/
├── lib/
│   ├── constants.ts      # Marcas, modelos, categorias
│   ├── supabase.ts      # Cliente Supabase
│   └── utils.ts         # Helpers
├── pages/
│   ├── Home.tsx
│   ├── Catalog.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Dashboard.tsx
│   └── CreateListing.tsx
├── stores/
│   └── authStore.ts     # Zustand auth state
├── types/
│   └── index.ts
├── App.tsx
└── main.tsx
```

## Funcionalidades

- [x] Homepage com marcas e categorias
- [x] Catálogo com filtros (marca, modelo, categoria, condição, preço)
- [x] Cadastro de usuário (nome, email, telefone, endereço, CEP)
- [x] Login
- [x] Dashboard do vendedor
- [x] Criar listagem de peças
- [ ] Sistema de compras
- [ ] Sistema de mensagens
- [ ] Leilões

## Database Schema

O schema do banco está em `supabase-schema.sql` e inclui:

- `profiles` - Perfis de usuário
- `brands` - Marcas de carros
- `car_models` - Modelos de carros
- `categories` - Categorias de peças
- `parts` - Peças para venda
- `favorites` - Favoritos
- `messages` - Mensagens
- `transactions` - Transações
- `reviews` - Avaliações

## Marcasa Cadastradas

- Nissan (GT-R, Skyline, Silvia, Fairlady Z...)
- Toyota (Supra, AE86, GT86, GR86, MR2...)
- Honda (NSX, S2000, Civic Type R, Integra...)
- Mazda (RX-7, RX-8, MX-5...)
- Subaru (WRX STI, BRZ, Impreza 22B...)
- Mitsubishi (Lancer Evo, FTO, 3000GT...)
- Lexus (LFA, RC F, GS F, IS F...)
- Acura (NSX, Integra Type R...)
- Infiniti (G35, G37, Q60...)

## Categorias de Peças

- Body Kits
- Wings & Spoilers
- Wheels & Rims
- Brakes
- Suspension
- Engine
- Exhaust
- Interior
- Lighting
- Aero
- Turbo & Boost
- Cooling

## Build

```bash
npm run build
```

## Licença

MIT
