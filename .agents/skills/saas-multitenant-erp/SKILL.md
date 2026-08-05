---
name: saas-multitenant-erp
description: Diretrizes avançadas de arquitetura multi-tenant, isolamento estrito de dados no Supabase RLS, eliminação de dados simulados e UX/UI Hi-Tech 21st.dev para o ERP de Desmanche e WMS.
---

# 🏢 SaaS Multi-Tenant ERP & WMS Architecture Guide

Esta skill estabelece os padrões obrigatórios para o desenvolvimento do **ERP Operacional e WMS Multi-Tenant da DAIG Auto Parts**.

## 1. Isolamento Estrito de Dados Multi-Tenant (Supabase RLS)
- **Todas as tabelas de negócio** (`parts`, `transactions`, `work_orders`, `nfe_invoices`, `bank_accounts`) DEVEM conter a coluna `tenant_id` indexada.
- **Row Level Security (RLS)**: Cada consulta ou modificação no banco de dados deve filtrar estritamente por `tenant_id = auth.uid()` ou pelo `tenant_id` vinculado ao usuário no perfil.
- **Zero Vazamento de Dados**: Nenhum tenant pode visualizar o estoque, vendas ou ordens de serviço de outro tenant.

## 2. Eliminação de Dados Simulados (Real-Data First)
- Nunca utilize arrays estáticos de mock ou fallbacks fictícios no ambiente de produção do parceiro.
- Toda métrica exibida nos KPI Cards (Estoque WMS Privado, Ordens de Serviço, Faturamento do Mês, Divulgação no Marketplace) deve ser calculada dinamicamente a partir dos registros reais do Supabase DB.
- Se o tenant não possuir registros cadastrados, exiba estados iniciais elegantes (Empty States) com botões de onboarding de 1-clique para adicionar o primeiro item real.

## 3. Padrão Estético 21st.dev Cyber Neon Professional
- Fundo escuro espacial `#06080F` e `#0B0E17`.
- Gradientes de acento: `#0D75FF` (Azul Elétrico) e `#00E5FF` (Ciano Neon).
- Cards com efeito glassmorphism `backdrop-blur-2xl`, bordas sutis `border border-blue-500/20 hover:border-[#00E5FF]/60` e iluminação interna com sombras neon.
- Tipografia de alta precisão com suporte a fontes mono para códigos OEM, CEP e valores em JPY (`¥`).
- Transições fluidas de estado (tabs, modais e formulários) sem saltos de layout.
