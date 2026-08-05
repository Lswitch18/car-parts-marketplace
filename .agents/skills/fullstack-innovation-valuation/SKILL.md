---
name: fullstack-innovation-valuation
description: Skill de melhoria contínua Fullstack (Frontend & Backend Avançado) para revisão de código, auditoria de UX/UI Hi-Tech Cyber Neon, arquitetura escalável e inovação constante para elevar o valor de mercado (Valuation) da plataforma DAIG.
---

# 🚀 Fullstack Innovation & Product Valuation Skill (DAIG Auto Parts)

Esta skill estabelece o protocolo avançado de **Engenharia Fullstack, Design de Elite e Inovação Tecnológica**, focado em auditar, refinar e elevar continuamente o valor de mercado (*Valuation*) do ecossistema **DAIG Auto Parts**.

---

## 🎨 1. Frontend & UX/UI Hi-Tech Cyber Neon (Visual & Performance)

### 🔹 Padrão Estético de Alto Valor Percebido
- **Estética 21st.dev Cyber Neon**: Fundo profundo `#06080F` e `#0B0E17`, acentos luminosos `#0D75FF` (Azul Elétrico) e `#00E5FF` (Ciano Neon).
- **Glassmorphism de Alta Precisão**: Cards com `backdrop-blur-2xl`, bordas finas com brilho responsivo `border border-[#00E5FF]/20 hover:border-[#00E5FF]/60` e iluminação volumétrica.
- **Zero Imagens Genéricas ou Placeholders**: Todas as autopeças e veículos devem utilizar fotografias reais ou geradas com qualidade foto-realista via ferramentas de IA.

### 🔹 Micro-Interações & Animações 60 FPS
- **GSAP & Framer Motion**: Animações fluidas em transições de páginas, revelação de dados em cascata (*stagger reveals*), modais de triagem e visualizadores WMS 3D.
- **Performance Mobile-First**: Layouts totalmente responsivos e otimizados para smartphones, tablets e desktops industriais de galpões WMS.

---

## ⚡ 2. Arquitetura Backend Scalable & Performance Extrema

### 🔹 Clean Architecture & DDD (Domínio SaaS Multi-Tenant)
- **Isolamento de Dados no Supabase RLS**: Toda tabela de produção deve manter índice e política RLS filtrada por `tenant_id`.
- **Transações Atômicas**: Baixa de estoque no balcão e sincronização em tempo real no marketplace com consistência atômica.
- **Cache de Alta Frequência (Upstash Redis)**: Respostas instantâneas em rotas de busca de autopeças e leitura de dados públicos.

### 🔹 APIs B2B & Segurança Shift-Left
- **Endpoints REST/GraphQL**: Validação estrita de tipos via TypeScript / Zod e respostas padronizadas com tratamento de exceções.
- **Rate Limiting & Protection**: Throttling em rotas públicas contra scrapers e brute force.

---

## 💎 3. Pilares de Inovação para Elevação do Valuation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   PILARES DE VALORIZAÇÃO COMERCIAL DAIG                     │
├───────────────────────┬─────────────────────────────────────────────────────┤
│ RECURSO DE ALTO VALOR │ IMPACTO NO VALUATION DA PLATAFORMA                  │
├───────────────────────┼─────────────────────────────────────────────────────┤
│ 👁️ Visão Computacional│ Cadastro automático de peças em 30s por foto com IA  │
├───────────────────────┼─────────────────────────────────────────────────────┤
│ 🧬 Intercambiabilidade│ Vinculação de 1 peça a dezenas de veículos JDM      │
├───────────────────────┼─────────────────────────────────────────────────────┤
│ 🏷️ WMS Geográfico     │ Endereçamento por Galpão/Corredor com QR Code 3D    │
├───────────────────────┼─────────────────────────────────────────────────────┤
│ 💴 Compliance Japão   │ Suporte nato a JCT 10%, Invoice System e Zengin DB  │
└───────────────────────┴─────────────────────────────────────────────────────┘
```

---

## 🔍 4. Protocolo de Code Review & Auditoria Contínua

Antes de qualquer entrega ou release de produção, execute a auditoria quadrimestral de qualidade:

1. **Beleza & Encantamento (Design Review)**: A interface impressiona visualmente o usuário no primeiro segundo?
2. **Performance & Estabilidade**: A compilação TypeScript está em **0 erros** (`npx tsc --noEmit`) e os tempos de resposta estão abaixo de 200ms?
3. **Segurança & Compliance**: As políticas RLS e regras fiscais (JCT 10% / Invoice System) estão 100% ativas?
4. **Impacto de Negócio**: A nova funcionalidade aumenta a eficiência operacional do desmanche ou eleva o valor percebido do software?
