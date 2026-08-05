-- =============================================================================
-- PARTE 9 - HARDENING DE RLS
--
-- Aplicado MANUALMENTE via psql no pooler (porta 6543), como o postgres.
-- NAO usar `supabase db push` (evitaria aplicar migrations pendentes como
-- 20260803_multitenant_isolation.sql e 20260729_japan_bank_info...).
--
-- 1. Habilita RLS em car_models, favorites e reviews (estavam expostas)
-- 2. Reviews: UPDATE/DELETE da propria avaliacao (ou admin)
-- 3. Remove as 7 policies abertas "Allow all admin_*"
-- 4. Adiciona policies admin-gated nas 11 tabelas admin_* sem policy
-- 5. Reescreve as 30 policies que referenciavam profiles.role para is_admin()
-- 6. Coluna-grants em profiles: revoga SELECT das colunas sensiveis
-- 7. Views SECURITY DEFINER (owner=postgres): my_profile e admin_profiles
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. HABILITAR RLS EM TABELAS SEM PROTECAO
-- ---------------------------------------------------------------------------
ALTER TABLE public.car_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 2. REVIEWS: editar/excluir a propria avaliacao (ou admin)
--    (mantidas as policies existentes: SELECT publico, INSERT do reviewer)
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can update own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = reviewer_id OR public.is_admin());

CREATE POLICY "Users can delete own reviews"
  ON public.reviews FOR DELETE
  USING (auth.uid() = reviewer_id OR public.is_admin());

-- ---------------------------------------------------------------------------
-- 3. REMOVER POLICIES ABERTAS "Allow all admin_*"
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow all admin_armazens" ON public.admin_armazens;
DROP POLICY IF EXISTS "Allow all admin_auditoria" ON public.admin_auditoria;
DROP POLICY IF EXISTS "Allow all admin_clientes" ON public.admin_clientes;
DROP POLICY IF EXISTS "Allow all admin_configuracoes" ON public.admin_configuracoes;
DROP POLICY IF EXISTS "Allow all admin_pedidos" ON public.admin_pedidos;
DROP POLICY IF EXISTS "Allow all admin_rastreamento" ON public.admin_rastreamento;
DROP POLICY IF EXISTS "Allow all admin_setores" ON public.admin_setores;

-- ---------------------------------------------------------------------------
-- 4. POLICIES ADMIN-GATED NAS 11 TABELAS admin_* SEM POLICY
-- ---------------------------------------------------------------------------
CREATE POLICY "Admin full access admin_dropoffs" ON public.admin_dropoffs
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admin full access admin_gps_log" ON public.admin_gps_log
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admin full access admin_inventario" ON public.admin_inventario
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admin full access admin_motoristas" ON public.admin_motoristas
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admin full access admin_packages" ON public.admin_packages
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admin full access admin_rotas" ON public.admin_rotas
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admin full access admin_rotas_paradas" ON public.admin_rotas_paradas
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admin full access admin_shipments" ON public.admin_shipments
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admin full access admin_sla_config" ON public.admin_sla_config
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admin full access admin_sla_log" ON public.admin_sla_log
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admin full access admin_zonas" ON public.admin_zonas
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- 5. REESCREVER AS 30 POLICIES QUE USAVAM profiles.role = 'admin'
--    (todas sao USING-only; is_admin() e SECURITY DEFINER)
-- ---------------------------------------------------------------------------
ALTER POLICY "Admin full access admin_armazens" ON public.admin_armazens
  USING (public.is_admin()) WITH CHECK (public.is_admin());
ALTER POLICY "Admin full access admin_auditoria" ON public.admin_auditoria
  USING (public.is_admin()) WITH CHECK (public.is_admin());
ALTER POLICY "Admin full access admin_clientes" ON public.admin_clientes
  USING (public.is_admin()) WITH CHECK (public.is_admin());
ALTER POLICY "Admin full access admin_configuracoes" ON public.admin_configuracoes
  USING (public.is_admin()) WITH CHECK (public.is_admin());
ALTER POLICY "Admin full access admin_pedidos" ON public.admin_pedidos
  USING (public.is_admin()) WITH CHECK (public.is_admin());
ALTER POLICY "Admin full access admin_rastreamento" ON public.admin_rastreamento
  USING (public.is_admin()) WITH CHECK (public.is_admin());
ALTER POLICY "Admin full access admin_setores" ON public.admin_setores
  USING (public.is_admin()) WITH CHECK (public.is_admin());
ALTER POLICY "Admin full access armazens" ON public.admin_armazens
  USING (public.is_admin()) WITH CHECK (public.is_admin());
ALTER POLICY "Admin full access auditoria" ON public.admin_auditoria
  USING (public.is_admin()) WITH CHECK (public.is_admin());
ALTER POLICY "Admin full access b2b_api_keys" ON public.b2b_api_keys
  USING (public.is_admin()) WITH CHECK (public.is_admin());
ALTER POLICY "Admin full access b2b_request_logs" ON public.b2b_request_logs
  USING (public.is_admin()) WITH CHECK (public.is_admin());
ALTER POLICY "Admin full access b2b_webhooks" ON public.b2b_webhooks
  USING (public.is_admin()) WITH CHECK (public.is_admin());
ALTER POLICY "Admin full access cargos" ON public.admin_cargos
  USING (public.is_admin()) WITH CHECK (public.is_admin());
ALTER POLICY "Admin full access clientes" ON public.admin_clientes
  USING (public.is_admin()) WITH CHECK (public.is_admin());
ALTER POLICY "Admin full access coletas" ON public.admin_coletas
  USING (public.is_admin()) WITH CHECK (public.is_admin());
ALTER POLICY "Admin full access configuracoes" ON public.admin_configuracoes
  USING (public.is_admin()) WITH CHECK (public.is_admin());
ALTER POLICY "Admin full access entregas" ON public.admin_entregas
  USING (public.is_admin()) WITH CHECK (public.is_admin());
ALTER POLICY "Admin full access estoque" ON public.admin_estoque
  USING (public.is_admin()) WITH CHECK (public.is_admin());
ALTER POLICY "Admin full access legal_contracts" ON public.legal_contracts
  USING (public.is_admin()) WITH CHECK (public.is_admin());
ALTER POLICY "Admin full access ocorrencias" ON public.admin_ocorrencias
  USING (public.is_admin()) WITH CHECK (public.is_admin());
ALTER POLICY "Admin full access pedidos" ON public.admin_pedidos
  USING (public.is_admin()) WITH CHECK (public.is_admin());
ALTER POLICY "Admin full access performance" ON public.admin_performance_diaria
  USING (public.is_admin()) WITH CHECK (public.is_admin());
ALTER POLICY "Admin full access permissoes" ON public.admin_permissoes
  USING (public.is_admin()) WITH CHECK (public.is_admin());
ALTER POLICY "Admin full access rastreamento" ON public.admin_rastreamento
  USING (public.is_admin()) WITH CHECK (public.is_admin());
ALTER POLICY "Admin full access recebimentos" ON public.admin_recebimentos
  USING (public.is_admin()) WITH CHECK (public.is_admin());
ALTER POLICY "Admin full access setores" ON public.admin_setores
  USING (public.is_admin()) WITH CHECK (public.is_admin());
ALTER POLICY "Admin full access transferencias" ON public.admin_transferencias
  USING (public.is_admin()) WITH CHECK (public.is_admin());
ALTER POLICY "Admin full access transportes" ON public.admin_transportes
  USING (public.is_admin()) WITH CHECK (public.is_admin());
ALTER POLICY "Admin full access usuarios_armazens" ON public.admin_usuarios_armazens
  USING (public.is_admin()) WITH CHECK (public.is_admin());
ALTER POLICY "Admin manage shipping_cities" ON public.shipping_cities
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- 6. COLUMN GRANTS EM PROFILES (revoga SELECT das colunas sensiveis)
--    Publicas: id, full_name, avatar_url, bio, rating, total_sales,
--               is_verified, created_at, updated_at, username
--    Restritas: email, phone, address, cep, role, cargo_id, setor_id,
--               telefone, ultimo_login, stripe_account_id,
--               stripe_onboarding_complete, onboarding_completed, account_type,
--               store_verified, store_type, store_name, store_document,
--               store_status, store_requested_at, store_approved_at,
--               store_rejected_reason
-- ---------------------------------------------------------------------------
REVOKE SELECT ON TABLE public.profiles FROM anon;
REVOKE SELECT ON TABLE public.profiles FROM authenticated;

GRANT SELECT (id, full_name, avatar_url, bio, rating, total_sales, is_verified, created_at, updated_at, username)
  ON TABLE public.profiles TO anon;
GRANT SELECT (id, full_name, avatar_url, bio, rating, total_sales, is_verified, created_at, updated_at, username)
  ON TABLE public.profiles TO authenticated;

-- ---------------------------------------------------------------------------
-- 7. VIEWS SECURITY (owner = postgres, faz bypass de RLS da tabela)
--    my_profile:     apenas a propria linha, todas as colunas
--    admin_profiles: todas as linhas, apenas para admin (is_admin)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.my_profile
WITH (security_invoker = false) AS
SELECT p.*
FROM public.profiles p
WHERE p.id = auth.uid();

CREATE OR REPLACE VIEW public.admin_profiles
WITH (security_invoker = false) AS
SELECT p.*
FROM public.profiles p
WHERE public.is_admin();

GRANT SELECT ON public.my_profile TO authenticated;
GRANT SELECT ON public.my_profile TO service_role;
GRANT SELECT ON public.admin_profiles TO authenticated;
GRANT SELECT ON public.admin_profiles TO service_role;

COMMIT;

-- =============================================================================
-- ROLLBACK (se necessario):
--
-- REVOKE SELECT ON public.my_profile FROM authenticated, service_role;
-- REVOKE SELECT ON public.admin_profiles FROM authenticated, service_role;
-- DROP VIEW public.my_profile;
-- DROP VIEW public.admin_profiles;
-- GRANT SELECT ON TABLE public.profiles TO anon;
-- GRANT SELECT ON TABLE public.profiles TO authenticated;
-- ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.favorites DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.car_models DISABLE ROW LEVEL SECURITY;
-- DROP POLICY "Users can update own reviews" ON public.reviews;
-- DROP POLICY "Users can delete own reviews" ON public.reviews;
-- (re-adicionar "Allow all admin_*" removidas, reverter os ALTER POLICY,
--  e DROP das policies criadas nas 11 admin_*)
-- =============================================================================
