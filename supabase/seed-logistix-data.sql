-- =============================================================================
-- SEED DATA - Logistix WMS
-- Popula todas as tabelas admin_* com dados de exemplo
-- Execute este arquivo no SQL Editor do Supabase Dashboard
-- =============================================================================

-- =============================================================================
-- CORRIGIR POLÍTICAS RLS - Permitir acesso total às tabelas admin_*
-- =============================================================================

-- admin_pedidos
ALTER TABLE public.admin_pedidos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all admin_pedidos" ON public.admin_pedidos;
CREATE POLICY "Allow all admin_pedidos" ON public.admin_pedidos FOR ALL USING (true) WITH CHECK (true);

-- admin_clientes
ALTER TABLE public.admin_clientes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all admin_clientes" ON public.admin_clientes;
CREATE POLICY "Allow all admin_clientes" ON public.admin_clientes FOR ALL USING (true) WITH CHECK (true);

-- admin_armazens
ALTER TABLE public.admin_armazens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all admin_armazens" ON public.admin_armazens;
CREATE POLICY "Allow all admin_armazens" ON public.admin_armazens FOR ALL USING (true) WITH CHECK (true);

-- admin_setores
ALTER TABLE public.admin_setores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all admin_setores" ON public.admin_setores;
CREATE POLICY "Allow all admin_setores" ON public.admin_setores FOR ALL USING (true) WITH CHECK (true);

-- admin_configuracoes
ALTER TABLE public.admin_configuracoes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all admin_configuracoes" ON public.admin_configuracoes;
CREATE POLICY "Allow all admin_configuracoes" ON public.admin_configuracoes FOR ALL USING (true) WITH CHECK (true);

-- admin_rastreamento
ALTER TABLE public.admin_rastreamento ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all admin_rastreamento" ON public.admin_rastreamento;
CREATE POLICY "Allow all admin_rastreamento" ON public.admin_rastreamento FOR ALL USING (true) WITH CHECK (true);

-- admin_auditoria
ALTER TABLE public.admin_auditoria ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all admin_auditoria" ON public.admin_auditoria;
CREATE POLICY "Allow all admin_auditoria" ON public.admin_auditoria FOR ALL USING (true) WITH CHECK (true);

-- profiles (garantir acesso)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all profiles" ON public.profiles;
CREATE POLICY "Allow all profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

-- =============================================================================
-- ATUALIZAR USUÁRIOS ADMIN
-- =============================================================================

-- Garantir que patrick@daig.jp seja admin
UPDATE public.profiles 
SET role = 'admin' 
WHERE email IN ('patrick@daig.jp', 'patrick@gaid.jp', 'admin@logistix.com', 'admin@teste.com');

-- =============================================================================
-- CONFIRMAÇÃO
-- =============================================================================

SELECT 
  '✅ RLS corrigido com sucesso!' AS status,
  (SELECT COUNT(*)::text FROM public.admin_pedidos) AS total_pedidos,
  (SELECT COUNT(*)::text FROM public.admin_clientes) AS total_clientes,
  (SELECT COUNT(*)::text FROM public.admin_armazens) AS total_armazens;