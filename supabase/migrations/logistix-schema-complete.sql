-- =============================================================================
-- SCHEMA MÍNIMO - Apenaspolíticas e seed (sem criar tabelas)
-- =============================================================================

-- Verifica se as tabelas existem e adiciona dados apenas se existirem

-- =============================================================================
-- POLÍTICAS ADMIN (apenas para tabelas que já existem)
-- =============================================================================

-- profiles (já deve existir)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access profiles" ON public.profiles;
CREATE POLICY "Admin full access profiles" ON public.profiles FOR ALL USING (
  auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- admin_setores
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'admin_setores') THEN
    ALTER TABLE public.admin_setores ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Admin full access admin_setores" ON public.admin_setores;
    CREATE POLICY "Admin full access admin_setores" ON public.admin_setores FOR ALL USING (
      auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;
END $$;

-- admin_armazens
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'admin_armazens') THEN
    ALTER TABLE public.admin_armazens ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Admin full access admin_armazens" ON public.admin_armazens;
    CREATE POLICY "Admin full access admin_armazens" ON public.admin_armazens FOR ALL USING (
      auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;
END $$;

-- admin_clientes
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'admin_clientes') THEN
    ALTER TABLE public.admin_clientes ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Admin full access admin_clientes" ON public.admin_clientes;
    CREATE POLICY "Admin full access admin_clientes" ON public.admin_clientes FOR ALL USING (
      auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;
END $$;

-- admin_pedidos
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'admin_pedidos') THEN
    ALTER TABLE public.admin_pedidos ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Admin full access admin_pedidos" ON public.admin_pedidos;
    CREATE POLICY "Admin full access admin_pedidos" ON public.admin_pedidos FOR ALL USING (
      auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;
END $$;

-- admin_configuracoes
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'admin_configuracoes') THEN
    ALTER TABLE public.admin_configuracoes ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Admin full access admin_configuracoes" ON public.admin_configuracoes;
    CREATE POLICY "Admin full access admin_configuracoes" ON public.admin_configuracoes FOR ALL USING (
      auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;
END $$;

-- admin_rastreamento
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'admin_rastreamento') THEN
    ALTER TABLE public.admin_rastreamento ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Admin full access admin_rastreamento" ON public.admin_rastreamento;
    CREATE POLICY "Admin full access admin_rastreamento" ON public.admin_rastreamento FOR ALL USING (
      auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;
END $$;

-- admin_auditoria
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'admin_auditoria') THEN
    ALTER TABLE public.admin_auditoria ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Admin full access admin_auditoria" ON public.admin_auditoria;
    CREATE POLICY "Admin full access admin_auditoria" ON public.admin_auditoria FOR ALL USING (
      auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;
END $$;

-- =============================================================================
-- SEED DATA (apenas INSERT, sem CREATE TABLE)
-- =============================================================================

-- Atualizar roles dos usuários para admin
UPDATE public.profiles SET role = 'admin' WHERE role != 'admin';

-- Insert setores (se a tabela existir)
INSERT INTO public.admin_setores (nome, descricao) VALUES
  ('Administração', 'Setor administrativo geral'),
  ('Logística', 'Gestão de armazéns e entregas'),
  ('Vendas', 'Setor de vendas e relacionamento')
ON CONFLICT DO NOTHING;

-- Insert admin_configuracoes (se a tabela existir)
INSERT INTO public.admin_configuracoes (chave, valor) VALUES
  ('empresa_nome', 'DAIG - Digital A.I. Garage'),
  ('rastreamento_enabled', 'true'),
  ('etiqueta_formato', 'pdf'),
  ('codigo_barras_tipo', 'code128')
ON CONFLICT (chave) DO NOTHING;

SELECT 
  'Políticas RLS aplicadas!' AS status,
  (SELECT COUNT(*)::text FROM information_schema.tables WHERE table_schema = 'public') AS total_tabelas;