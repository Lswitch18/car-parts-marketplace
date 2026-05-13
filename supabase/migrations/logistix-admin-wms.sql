-- =====================================================================
-- LOGISTIX — ADMIN WMS (Warehouse Management System)
-- Migração completa para o Supabase do marketplace
--
-- Como executar:
--   supabase db execute --file supabase/migrations/logistix-admin-wms.sql
--   ou cole no SQL Editor do Supabase Dashboard
-- =====================================================================

-- =====================================================================
-- 1. SETORES (Departamentos)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.admin_setores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  descricao TEXT,
  cor TEXT DEFAULT '#6366F1',
  icon TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================================
-- 2. CARGOS (Roles/Papeis por setor)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.admin_cargos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setor_id UUID NOT NULL REFERENCES public.admin_setores(id),
  nome TEXT NOT NULL,
  descricao TEXT,
  nivel INTEGER DEFAULT 1,
  permissoes JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================================
-- 3. PERMISSÕES DISPONÍVEIS
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.admin_permissoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setor_id UUID NOT NULL REFERENCES public.admin_setores(id),
  chave TEXT NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT
);

-- =====================================================================
-- 4. ARMAZÉNS / CDs
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.admin_armazens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cidade TEXT NOT NULL,
  estado TEXT NOT NULL,
  capacidade INTEGER DEFAULT 1000,
  ocupacao INTEGER DEFAULT 0,
  responsavel TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================================
-- 5. EXTENDER PROFILES (campos admin)
-- =====================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='cargo_id') THEN
    ALTER TABLE public.profiles ADD COLUMN cargo_id UUID REFERENCES public.admin_cargos(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='setor_id') THEN
    ALTER TABLE public.profiles ADD COLUMN setor_id UUID REFERENCES public.admin_setores(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='telefone') THEN
    ALTER TABLE public.profiles ADD COLUMN telefone TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='ultimo_login') THEN
    ALTER TABLE public.profiles ADD COLUMN ultimo_login TIMESTAMPTZ;
  END IF;
END;
$$;

-- =====================================================================
-- 6. USUÁRIOS X ARMAZÉNS
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.admin_usuarios_armazens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  armazem_id UUID NOT NULL REFERENCES public.admin_armazens(id) ON DELETE CASCADE,
  acesso_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(usuario_id, armazem_id)
);

-- =====================================================================
-- 7. CLIENTES
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.admin_clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cnpj TEXT,
  email TEXT,
  telefone TEXT,
  cidade TEXT,
  estado TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================================
-- 8. TRANSPORTES
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.admin_transportes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  placa TEXT NOT NULL,
  modelo TEXT,
  motorista TEXT,
  status TEXT DEFAULT 'disponivel',
  capacidade_kg NUMERIC,
  armazem_id UUID REFERENCES public.admin_armazens(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================================
-- 9. PEDIDOS
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.admin_pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT UNIQUE NOT NULL,
  cliente_id UUID REFERENCES public.admin_clientes(id),
  armazem_origem_id UUID REFERENCES public.admin_armazens(id),
  destino_cidade TEXT,
  destino_estado TEXT,
  status TEXT DEFAULT 'pendente',
  peso_kg NUMERIC,
  valor NUMERIC,
  previsao TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================================
-- 10. ENTREGAS
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.admin_entregas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID NOT NULL REFERENCES public.admin_pedidos(id),
  transporte_id UUID REFERENCES public.admin_transportes(id),
  status TEXT DEFAULT 'pendente',
  entregue_em TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================================
-- 11. COLETAS
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.admin_coletas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID NOT NULL REFERENCES public.admin_pedidos(id),
  armazem_id UUID REFERENCES public.admin_armazens(id),
  data_coleta TEXT,
  status TEXT DEFAULT 'agendada',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================================
-- 12. TRANSFERÊNCIAS
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.admin_transferencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  armazem_origem_id UUID REFERENCES public.admin_armazens(id),
  armazem_destino_id UUID REFERENCES public.admin_armazens(id),
  descricao TEXT,
  quantidade INTEGER,
  status TEXT DEFAULT 'pendente',
  data TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================================
-- 13. ESTOQUE
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.admin_estoque (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  armazem_id UUID REFERENCES public.admin_armazens(id),
  produto TEXT NOT NULL,
  sku TEXT,
  quantidade INTEGER DEFAULT 0,
  unidade TEXT DEFAULT 'un',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================================
-- 14. OCORRÊNCIAS
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.admin_ocorrencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID REFERENCES public.admin_pedidos(id),
  tipo TEXT,
  descricao TEXT,
  status TEXT DEFAULT 'aberta',
  prioridade TEXT DEFAULT 'media',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================================
-- 15. PERFORMANCE DIÁRIA
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.admin_performance_diaria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data TEXT NOT NULL,
  no_prazo INTEGER DEFAULT 0,
  atrasadas INTEGER DEFAULT 0
);

-- =====================================================================
-- 16. CONFIGURAÇÕES DO SISTEMA
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.admin_configuracoes (
  chave TEXT PRIMARY KEY,
  valor TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================================
-- 17. AUDITORIA
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.admin_auditoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES public.profiles(id),
  acao TEXT NOT NULL,
  tabela TEXT,
  registro_id TEXT,
  detalhes TEXT,
  ip TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================================
-- 18. RASTREAMENTO (Tracking de pedidos)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.admin_rastreamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID NOT NULL REFERENCES public.admin_pedidos(id),
  tipo TEXT NOT NULL,
  descricao TEXT,
  local TEXT,
  status TEXT DEFAULT 'pendente',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================================
-- 19. RECEBIMENTOS
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.admin_recebimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID NOT NULL REFERENCES public.admin_pedidos(id),
  armazem_id UUID REFERENCES public.admin_armazens(id),
  status TEXT DEFAULT 'pendente',
  observacoes TEXT,
  recebido_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================================
-- ÍNDICES
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_admin_pedidos_status ON public.admin_pedidos(status);
CREATE INDEX IF NOT EXISTS idx_admin_pedidos_codigo ON public.admin_pedidos(codigo);
CREATE INDEX IF NOT EXISTS idx_admin_pedidos_cliente ON public.admin_pedidos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_admin_auditoria_usuario ON public.admin_auditoria(usuario_id);
CREATE INDEX IF NOT EXISTS idx_admin_auditoria_acao ON public.admin_auditoria(acao);
CREATE INDEX IF NOT EXISTS idx_admin_estoque_armazem ON public.admin_estoque(armazem_id);
CREATE INDEX IF NOT EXISTS idx_admin_entregas_pedido ON public.admin_entregas(pedido_id);

-- =====================================================================
-- RLS POLICIES
-- =====================================================================
ALTER TABLE public.admin_setores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_cargos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_armazens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_usuarios_armazens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_transportes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_entregas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_coletas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_transferencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_ocorrencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_performance_diaria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_auditoria ENABLE ROW LEVEL SECURITY;

-- Admin full access (role='admin')
CREATE POLICY "Admin full access setores" ON public.admin_setores FOR ALL USING (
  auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin full access cargos" ON public.admin_cargos FOR ALL USING (
  auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin full access permissoes" ON public.admin_permissoes FOR ALL USING (
  auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin full access armazens" ON public.admin_armazens FOR ALL USING (
  auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin full access usuarios_armazens" ON public.admin_usuarios_armazens FOR ALL USING (
  auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin full access clientes" ON public.admin_clientes FOR ALL USING (
  auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin full access transportes" ON public.admin_transportes FOR ALL USING (
  auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin full access pedidos" ON public.admin_pedidos FOR ALL USING (
  auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin full access entregas" ON public.admin_entregas FOR ALL USING (
  auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin full access coletas" ON public.admin_coletas FOR ALL USING (
  auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin full access transferencias" ON public.admin_transferencias FOR ALL USING (
  auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin full access estoque" ON public.admin_estoque FOR ALL USING (
  auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin full access ocorrencias" ON public.admin_ocorrencias FOR ALL USING (
  auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin full access performance" ON public.admin_performance_diaria FOR ALL USING (
  auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin full access configuracoes" ON public.admin_configuracoes FOR ALL USING (
  auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin full access auditoria" ON public.admin_auditoria FOR ALL USING (
  auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- =====================================================================
-- SEED DATA
-- Executar APÓS criar as tabelas, se for primeira vez
-- =====================================================================
INSERT INTO public.admin_setores (nome, descricao, cor, icon) VALUES
  ('Admin', 'Administração do Sistema', '#6366F1', 'shield'),
  ('Operacoes', 'Operações Logísticas', '#F59E0B', 'truck'),
  ('Estoque', 'Gestão de Estoque', '#10B981', 'boxes'),
  ('Comercial', 'Vendas e Clientes', '#EC4899', 'users'),
  ('Financeiro', 'Financeiro e Custos', '#8B5CF6', 'dollar-sign'),
  ('Sac', 'Atendimento ao Cliente', '#06B6D4', 'headphones')
ON CONFLICT (nome) DO NOTHING;

-- Cargos
INSERT INTO public.admin_cargos (setor_id, nome, descricao, nivel, permissoes)
SELECT s.id, c.nome, c.descricao, c.nivel, c.permissoes::jsonb
FROM (VALUES
  ('Admin', 'Administrador Global', 'Acesso total ao sistema', 10, '["*"]'),
  ('Operacoes', 'Gerente de Operações', 'Gestão de operações', 10, '["*"]'),
  ('Operacoes', 'Supervisor de Operações', 'Supervisão de equipe', 8, '["PEDIDOS","COLETAS","ENTREGAS","TRANSPORTES"]'),
  ('Operacoes', 'Operador de Campo', 'Execução de operações', 3, '["PEDIDOS_LEITURA","COLETAS_LEITURA"]'),
  ('Estoque', 'Gerente de Estoque', 'Gestão de armazém', 10, '["*"]'),
  ('Estoque', 'Analista de Estoque', 'Controle de inventário', 5, '["ESTOQUE","ESTOQUE_ALTERAR","TRANSFERENCIAS"]'),
  ('Estoque', 'Auxiliar de Estoque', 'Apoio ao estoque', 2, '["ESTOQUE_LEITURA"]'),
  ('Comercial', 'Gerente Comercial', 'Gestão de vendas', 10, '["*"]'),
  ('Comercial', 'Vendedor', 'Atendimento comercial', 5, '["CLIENTES","PEDIDOS"]'),
  ('Comercial', 'Assistente Comercial', 'Suporte administrativo', 2, '["CLIENTES_LEITURA"]'),
  ('Financeiro', 'Gerente Financeiro', 'Gestão financeira', 10, '["*"]'),
  ('Financeiro', 'Analista Financeiro', 'Análise de custos', 5, '["RELATORIOS","CUSTOS"]'),
  ('Sac', 'Gerente de Atendimento', 'Gestão SAC', 10, '["*"]'),
  ('Sac', 'Atendente SAC', 'Suporte ao cliente', 5, '["OCORRENCIAS","PEDIDOS"]')
) AS c(setor_nome, nome, descricao, nivel, permissoes)
JOIN public.admin_setores s ON s.nome = c.setor_nome
WHERE NOT EXISTS (SELECT 1 FROM public.admin_cargos WHERE nome = c.nome AND setor_id = s.id);

-- Permissões
INSERT INTO public.admin_permissoes (setor_id, chave, nome, descricao)
SELECT s.id, p.chave, p.nome, p.descricao
FROM (VALUES
  ('Admin', 'USUARIOS', 'Gerenciar Usuários', 'Criar, editar e excluir usuários'),
  ('Admin', 'USUARIOS_LEITURA', 'Ver Usuários', 'Apenas visualizar usuários'),
  ('Admin', 'SETORES', 'Gerenciar Setores', 'Criar e editar setores'),
  ('Admin', 'CARGOS', 'Gerenciar Cargos', 'Criar e editar cargos'),
  ('Admin', 'CONFIG', 'Configurações', 'Acessar configurações'),
  ('Admin', 'AUDITORIA', 'Ver Logs de Auditoria', 'Acessar logs'),
  ('Operacoes', 'PEDIDOS', 'Gerenciar Pedidos', 'Criar, editar pedidos'),
  ('Operacoes', 'PEDIDOS_LEITURA', 'Ver Pedidos', 'Apenas visualizar pedidos'),
  ('Operacoes', 'COLETAS', 'Gerenciar Coletas', 'Gerenciar coletas'),
  ('Operacoes', 'ENTREGAS', 'Gerenciar Entregas', 'Gerenciar entregas'),
  ('Operacoes', 'TRANSPORTES', 'Gerenciar Transportes', 'Gerenciar fretes'),
  ('Estoque', 'ESTOQUE', 'Gerenciar Estoque', 'Controle de estoque'),
  ('Estoque', 'ESTOQUE_ALTERAR', 'Alterar Estoque', 'Movimentar estoque'),
  ('Estoque', 'ESTOQUE_LEITURA', 'Ver Estoque', 'Apenas visualizar'),
  ('Estoque', 'TRANSFERENCIAS', 'Transferências', 'Criar transferências'),
  ('Comercial', 'CLIENTES', 'Gerenciar Clientes', 'Cadastrar clientes'),
  ('Comercial', 'CLIENTES_LEITURA', 'Ver Clientes', 'Apenas visualizar'),
  ('Financeiro', 'RELATORIOS', 'Relatórios Financeiros', 'Acessar relatórios'),
  ('Financeiro', 'CUSTOS', 'Análise de Custos', 'Ver custos'),
  ('Sac', 'OCORRENCIAS', 'Gerenciar Ocorrências', 'Registrar ocorrências')
) AS p(setor_nome, chave, nome, descricao)
JOIN public.admin_setores s ON s.nome = p.setor_nome
ON CONFLICT DO NOTHING;

-- Armazéns
INSERT INTO public.admin_armazens (nome, cidade, estado, capacidade, ocupacao, responsavel) VALUES
  ('CD São Paulo', 'São Paulo', 'SP', 5000, 4250, 'Roberto Alves'),
  ('CD Rio de Janeiro', 'Rio de Janeiro', 'RJ', 3000, 2280, 'Patricia Lima'),
  ('CD Belo Horizonte', 'Belo Horizonte', 'MG', 2000, 1240, 'Carlos Mota'),
  ('CD Curitiba', 'Curitiba', 'PR', 2500, 1450, 'Ana Ferreira'),
  ('CD Salvador', 'Salvador', 'BA', 1500, 570, 'Marcos Souza')
ON CONFLICT DO NOTHING;

-- Configurações
INSERT INTO public.admin_configuracoes (chave, valor) VALUES
  ('empresa_nome', 'Logistix'),
  ('jwt_expira', '24h'),
  ('session_timeout', '86400')
ON CONFLICT (chave) DO NOTHING;

-- Clientes
INSERT INTO public.admin_clientes (nome, cnpj, email, telefone, cidade, estado) VALUES
  ('Magazine Luiza', '47.960.950/0001-21', 'contato@magazineluiza.com.br', '(11) 3504-2000', 'São Paulo', 'SP'),
  ('Mercado Livre', '03.007.331/0001-41', 'suporte@mercadolivre.com', '(11) 4003-8182', 'Rio de Janeiro', 'RJ'),
  ('Americanas', '00.776.574/0001-56', 'sac@americanas.com', '(21) 3813-7000', 'Rio de Janeiro', 'RJ'),
  ('Netshoes', '13.574.594/0001-96', 'contato@netshoes.com', '(11) 3020-3030', 'São Paulo', 'SP'),
  ('Casas Bahia', '33.041.260/0652-90', 'sac@casasbahia.com.br', '(11) 3504-0500', 'Curitiba', 'PR'),
  ('Shopee', '36.490.062/0001-04', 'ajuda@shopee.com.br', '(11) 3003-5556', 'São Paulo', 'SP'),
  ('Amazon', '15.436.940/0001-03', 'cs@amazon.com.br', '(11) 4003-0404', 'São Paulo', 'SP')
ON CONFLICT DO NOTHING;

-- Pedidos (200 registros de exemplo)
INSERT INTO public.admin_pedidos (codigo, cliente_id, armazem_origem_id, destino_cidade, destino_estado, status, peso_kg, valor, previsao, created_at)
SELECT
  '#PED' || (12548 - gs)::TEXT,
  base_cliente.id,
  base_armazem.id,
  CASE gs % 10
    WHEN 0 THEN 'Campinas' WHEN 1 THEN 'Niteroi' WHEN 2 THEN 'Contagem'
    WHEN 3 THEN 'São José' WHEN 4 THEN 'Curitiba' WHEN 5 THEN 'Feira de Santana'
    WHEN 6 THEN 'Sorocaba' WHEN 7 THEN 'Petrópolis' WHEN 8 THEN 'Uberlândia'
    ELSE 'Londrina'
  END,
  CASE gs % 10
    WHEN 0 THEN 'SP' WHEN 1 THEN 'RJ' WHEN 2 THEN 'MG'
    WHEN 3 THEN 'SC' WHEN 4 THEN 'PR' WHEN 5 THEN 'BA'
    WHEN 6 THEN 'SP' WHEN 7 THEN 'RJ' WHEN 8 THEN 'MG'
    ELSE 'PR'
  END,
  CASE gs % 6
    WHEN 0 THEN 'entregue' WHEN 1 THEN 'em_transito' WHEN 2 THEN 'atrasado'
    WHEN 3 THEN 'entregue' WHEN 4 THEN 'entregue' ELSE 'cancelado'
  END,
  (10 + random() * 500)::NUMERIC(10,1),
  (100 + random() * 5000)::NUMERIC(10,2),
  (CURRENT_DATE - (gs / 50)::INTEGER * INTERVAL '1 day' + INTERVAL '3 days')::TEXT,
  CURRENT_DATE - (gs / 50)::INTEGER * INTERVAL '1 day'
FROM generate_series(0, 199) AS gs
CROSS JOIN LATERAL (SELECT id FROM public.admin_clientes ORDER BY random() LIMIT 1) base_cliente
CROSS JOIN LATERAL (SELECT id FROM public.admin_armazens ORDER BY random() LIMIT 1) base_armazem
WHERE NOT EXISTS (SELECT 1 FROM public.admin_pedidos LIMIT 1);

-- Transportes
INSERT INTO public.admin_transportes (placa, modelo, motorista, status, capacidade_kg, armazem_id)
SELECT t.placa, t.modelo, t.motorista, t.status, t.capacidade_kg, a.id
FROM (VALUES
  ('BRA-2E19', 'Truck Volvo FH', 'João Silva', 'em_rota', 15000, 'CD São Paulo'),
  ('RIO-7K44', 'Truck Scania R', 'Pedro Costa', 'em_rota', 12000, 'CD Rio de Janeiro'),
  ('MG-3P91', 'Van Mercedes', 'Lucas Martins', 'disponivel', 3000, 'CD Belo Horizonte'),
  ('PR-5A82', 'Truck DAF XF', 'Felipe Nunes', 'disponivel', 18000, 'CD Curitiba'),
  ('BA-1X30', 'Van Sprinter', 'Rafael Gomes', 'manutencao', 2500, 'CD Salvador'),
  ('SP-9F73', 'Truck Iveco', 'Thiago Reis', 'em_rota', 10000, 'CD São Paulo')
) AS t(placa, modelo, motorista, status, capacidade_kg, armazem_nome)
JOIN public.admin_armazens a ON a.nome = t.armazem_nome
WHERE NOT EXISTS (SELECT 1 FROM public.admin_transportes LIMIT 1);

-- Entregas
INSERT INTO public.admin_entregas (pedido_id, transporte_id, status, entregue_em)
SELECT p.id, t.id,
  CASE WHEN p.status = 'entregue' THEN 'entregue'
       WHEN p.status = 'em_transito' THEN 'em_transito'
       WHEN p.status = 'atrasado' THEN 'atrasado'
       ELSE 'cancelado'
  END,
  CASE WHEN p.status = 'entregue' THEN (CURRENT_DATE - INTERVAL '1 day')::TEXT ELSE NULL END
FROM (SELECT id, status FROM public.admin_pedidos ORDER BY id LIMIT 200) p
JOIN LATERAL (SELECT id FROM public.admin_transportes ORDER BY random() LIMIT 1) t ON true
WHERE NOT EXISTS (SELECT 1 FROM public.admin_entregas LIMIT 1);

-- Estoque
INSERT INTO public.admin_estoque (armazem_id, produto, sku, quantidade, unidade)
SELECT a.id, p.produto, 'SKU-' || SUBSTRING(a.id::TEXT, 1, 8) || '-' || p.sufixo, floor(random() * 500 + 50)::INTEGER, 'un'
FROM (SELECT unnest(ARRAY['Eletrônicos','Vestuário','Alimentos','Móveis','Ferramentas','Brinquedos','Cosméticos']) AS produto,
             unnest(ARRAY['EL','VE','AL','MO','FE','BR','CO']) AS sufixo) p
CROSS JOIN (SELECT id FROM public.admin_armazens) a
WHERE NOT EXISTS (SELECT 1 FROM public.admin_estoque LIMIT 1);

-- Performance diária
INSERT INTO public.admin_performance_diaria (data, no_prazo, atrasadas) VALUES
  ('01/05', 65, 18),
  ('05/05', 72, 14),
  ('10/05', 60, 22),
  ('15/05', 88, 9),
  ('20/05', 75, 16),
  ('25/05', 82, 12),
  ('31/05', 78, 19)
ON CONFLICT DO NOTHING;
