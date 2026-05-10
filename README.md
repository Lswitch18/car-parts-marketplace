# GAID - Plataforma de Vendas Automotivas
🇯🇵 **A plataforma definitiva para compra e venda de peças no Japão**

GAID é um marketplace avançado focado no mercado automotivo japonês, oferecendo tecnologia de ponta para entusiastas e profissionais.

- 🌍 Cobertura: **100% Território Japonês**
- 🚗 Foco: **Peças Automotivas, Performance e Estilo**
- ⚡ Velocidade: **Logística otimizada em todo o Japão**
- ✅ Segurança: **RLS ativado e transações protegidas**
- 🤖 IA: **Identificação inteligente de peças via Google Gemini**

## Tech Stack

- **Frontend**: Vite + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + Lucide Icons
- **Backend**: Supabase (Auth, DB, Storage, Realtime, Edge Functions)
- **IA**: Google Gemini 1.5 Flash (Visão Computacional)
- **State Management**: TanStack Query + Zustand

## Setup

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente
Crie um arquivo `.env` com as seguintes chaves:
```env
VITE_SUPABASE_URL=https://<seu-projeto>.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```

### 3. Rodar em desenvolvimento
```bash
npm run dev
```

## Funcionalidades Principais

- [x] **Home Dinâmica**: Busca inteligente e categorias JDM.
- [x] **Catálogo Avançado**: Filtros por marca, modelo e condição técnica.
- [x] **IA Vision**: Cadastro de anúncios automático a partir de fotos.
- [x] **Mensageria Realtime**: Chat integrado entre compradores e vendedores.
- [x] **Dashboard de Analytics**: KPIs financeiros e gestão de vendas para Admins.
- [x] **Checkout Seguro**: Fluxo de compra direta e escrow.
- [ ] **Sistema de Leilões**: Lances em tempo real (Em desenvolvimento).

## Marcas Atendidas

- Nissan (GT-R, Skyline, Silvia, Fairlady Z...)
- Toyota (Supra, AE86, GT86, GR86, MR2...)
- Honda (NSX, S2000, Civic Type R, Integra...)
- Mazda (RX-7, RX-8, MX-5...)
- Subaru (WRX STI, BRZ, Impreza 22B...)
- Mitsubishi (Lancer Evo, FTO, 3000GT...)

## Licença

MIT - Desenvolvido pela equipe GAID.
