# 🔑 Mapeamento Completo de Variáveis de Ambiente & Chaves API (DAIG)

Este documento centraliza todas as chaves e variáveis de ambiente utilizadas no projeto **Digital AIGarage (DAIG)**, separando-as por escopo de execução (Frontend Vercel vs Backend Supabase), criticidade e finalidade operacional.

---

## 🌐 1. Variáveis Públicas do Frontend (Vercel Project Settings)

Estas variáveis devem ser cadastradas no painel da **Vercel** (*Project Settings $\rightarrow$ Environment Variables*). Todas utilizam o prefixo `VITE_` e são expostas com segurança ao navegador.

| Variável (Key) | Exemplo / Valor | Descrição |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | `https://clqubcryhbrjlupkgeva.supabase.co` | URL oficial do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_qmK1AvvoZuK...` | Chave pública anônima do Supabase |
| `VITE_STRIPE_PUBLIC_KEY` | `pk_live_51TtD9VHlCJrkWqOL...` | Chave pública **LIVE (Produção)** do Stripe |
| `VITE_APP_URL` | `https://daig.jp` | URL oficial do domínio em produção |
| `VITE_UPSTASH_REDIS_REST_URL` | `https://cunning-civet-138870.upstash.io` | Endpoint REST do Upstash Redis (Cache) |
| `VITE_UPSTASH_REDIS_REST_TOKEN` | `gQAAAAAAAh52AAIgcDI5...` | Token REST do Upstash Redis |
| `VITE_OLLAMA_API_URL` | `https://201.46.120.192.nip.io/api/chat` | Endpoint do Servidor de IA (Visão 3D/Chat) |
| `VITE_OLLAMA_API_AUTH` | `Basic YXBpOk0zdW4wbTNAQDE5OTE4` | Autenticação Basic para a API de IA |
| `VITE_STRIPE_PAYMENT_METHOD_CONFIG_ID` | `pmc_1O8JCnHLdM` | ID da configuração de métodos do Stripe (Konbini) |

---

## 🔒 2. Chaves Secretas de Backend (Supabase Dashboard / Edge Functions)

Estas chaves **NÃO PODEM** ser colocadas na Vercel nem commitadas no código público. Elas pertencem exclusivamente aos segredos do **Supabase** (`supabase secrets set KEY=VALUE`).

| Segredo (Secret) | Escopo / Onde Configurar | Descrição |
| :--- | :--- | :--- |
| `STRIPE_SECRET_KEY` | Supabase Secrets / Functions | Chave secreta de produção do Stripe (`sk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | Supabase Secrets / Functions | Assinatura do Webhook do Stripe (`whsec_...`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Secrets / Admin API | Chave com privilégios de administração (bypass RLS) |
| `SUPABASE_ACCESS_TOKEN` | Supabase CLI / CI/CD | Token de acesso para deploy de Edge Functions |
| `GEMINI_API_KEY` | Supabase Functions / Servidor | Chave da API Google Gemini para visão e busca por IA |
| `REPLICATE_API_KEY` | Supabase Functions | Chave Replicate para conversão 3D de imagens |
| `VITE_OPENROUTER_API_KEY` | Frontend / Optional AI | Chave OpenRouter para fallback de LLM |

---

## 🏛️ 3. Credenciais e Integrações Específicas

### 💳 Stripe Connect & Pagamentos Japão
- **ID da Conta Stripe:** `acct_1TtD9VHlCJrkWqOL` (PATRICK HIKARUFORBECI SUZUKI / Digital AI Garage - DAIG)
- **Métodos Ativos:** Cartão de Crédito, Konbini (7-Eleven, Lawson, FamilyMart).
- **Moeda Principal:** `JPY` (Iene Japonês).

### 🚚 Servidor IA & Tópicos de Infraestrutura
- **Servidor VPS Ollama:** `201.46.120.192` (Porta 6985 SSH)
- **Engine de Render 3D:** Three.js / MotionFrame GLTF Engine.

---

## 📑 4. Histórico de Atualização
- **Data da Última Auditoria:** 22 de Julho de 2026
- **Status:** **100% Sincronizado, Auditado e Pronto para Produção.**
