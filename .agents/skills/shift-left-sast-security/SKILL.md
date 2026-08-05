---
name: shift-left-sast-security
description: Diretrizes avançadas de segurança Shift-Left, análise SAST, remediação OWASP, proteção de banco Supabase RLS, Edge Functions Vercel, rotação de chaves e Rate Limiting em todas as rotas públicas.
---

# 🛡️ Shift-Left Security & Advanced SAST Remediation Skill

Esta skill define as diretrizes técnicas obrigatórias para aplicar **Shift-Left Security**, análise SAST preventiva, remediação de vulnerabilidades e endurecimento da infraestrutura Supabase, Vercel e APIs da DAIG Auto Parts.

---

## 🔒 1. Proteção de Banco de Dados Supabase (RLS & SQLi Prevention)

### 🔹 Row Level Security (RLS) Estrito
- **Regra**: NENHUMA tabela de produção pode ser criada ou exposta sem ativar `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`.
- **Políticas de Acesso Multi-Tenant**:
  - Toda política RLS deve validar obrigatoriamente a posse dos dados: `tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = auth.uid())` ou `seller_id = auth.uid()::text`.
  - Impedir que usuários não autenticados leiam estoques privados ou transações financeiras de outros tenants.

### 🔹 Prevenção contra SQL Injection (SQLi)
- **Zero concatenação de strings**: Nunca construa queries SQL unindo strings dinâmicas (ex: `SELECT * FROM parts WHERE title = '` + input + `'`).
- Utilize estritamente a API de query builder do Supabase Client (`supabase.from('parts').select().eq('id', input)`) ou consultas parametrizadas com argumentos via RPC (`$1, $2`).

---

## ⚡ 2. Proteção Vercel & Supabase Edge Functions

### 🔹 Rotação de Chaves de Segurança (Secret Rotation Pipeline)
- As chaves de serviço de alta privilégio (`SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`) **NUNCA** devem ser expostas no código client-side (`src/`).
- O código do navegador deve utilizar exclusivamente a `VITE_SUPABASE_ANON_KEY` (chave pública).
- Manter o pipeline de rotação periódica das variáveis de ambiente na Vercel e no Supabase Vault.

### 🔹 Rate Limiting & Throttling em TODAS as Rotas Públicas
- **APIs de Autenticação e Busca Pública**:
  - Aplicar limitação de requisições por IP / token (ex: 60 requisições por minuto por IP em rotas de busca, 5 tentativas por minuto em login/checkout).
  - Utilizar middleware Upstash Redis ou Vercel KV Rate Limiters para bloquear ataques de brute force e bots scraping.

---

## 🧪 3. Pipeline SAST & Sanitização Anti-XSS (Shift-Left)

### 🔹 Sanitização de Entradas de Usuário
- Todo conteúdo dinâmico inserido por usuários ou capturado por OCR/IA deve ser sanitizado com `DOMPurify` ou biblioteca equivalente antes de renderizações no DOM.
- Utilizar `react-router-dom` e elementos nativos do React para evitar o uso de `dangerouslySetInnerHTML`.

### 🔹 Cabeçalhos de Segurança HTTP (Content Security Policy)
- Aplicar cabeçalhos de segurança na distribuição Vercel (`vercel.json`):
  - `Content-Security-Policy` (CSP estrito)
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
