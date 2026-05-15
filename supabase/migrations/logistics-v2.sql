-- =============================================================================
-- PHASE 1: LOGISTICS V2 - WMS / TMS / OMS Tables
-- Shopee-like logistics system
-- =============================================================================

-- 1. SHIPMENTS (agrupamento logístico)
CREATE TABLE IF NOT EXISTS public.admin_shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(50) UNIQUE NOT NULL,
  pedido_id UUID REFERENCES public.admin_pedidos(id),
  cliente_id UUID REFERENCES public.admin_clientes(id),
  armazem_origem_id UUID REFERENCES public.admin_armazens(id),
  armazem_destino_id UUID REFERENCES public.admin_armazens(id),
  etapa VARCHAR(50) DEFAULT 'CREATED',
  status VARCHAR(50) DEFAULT 'pending',
  rota_id UUID,
  motorista_id UUID REFERENCES public.profiles(id),
  transportadora VARCHAR(100),
  peso_kg DECIMAL(10,3),
  comprimento_cm DECIMAL(10,2),
  largura_cm DECIMAL(10,2),
  altura_cm DECIMAL(10,2),
  volume_m3 DECIMAL(10,4),
  sla_horas INT,
  data_prazo TIMESTAMPTZ,
  data_coleta TIMESTAMPTZ,
  data_entregue TIMESTAMPTZ,
  dropoff_agencia_id UUID REFERENCES public.admin_armazens(id),
  dropoff_data TIMESTAMPTZ,
  dropoff_confirmado_por UUID REFERENCES public.profiles(id),
  prova_foto_url TEXT,
  prova_recebedor VARCHAR(255),
  prova_data TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PACKAGES (itens dentro do shipment)
CREATE TABLE IF NOT EXISTS public.admin_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID NOT NULL REFERENCES public.admin_shipments(id),
  codigo_barras VARCHAR(100) NOT NULL,
  pedido_id UUID REFERENCES public.admin_pedidos(id),
  descricao VARCHAR(255),
  peso_kg DECIMAL(10,3),
  status VARCHAR(50) DEFAULT 'created',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. DROP-OFF (vendedor entrega na agência)
CREATE TABLE IF NOT EXISTS public.admin_dropoffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID NOT NULL REFERENCES public.admin_shipments(id),
  agencia_id UUID NOT NULL REFERENCES public.admin_armazens(id),
  codigo_agencia VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  data_recebimento TIMESTAMPTZ,
  recebido_por VARCHAR(255),
  data_coleta TIMESTAMPTZ,
  coletado_por UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ROTAS
CREATE TABLE IF NOT EXISTS public.admin_rotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(50) UNIQUE NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  origem_id UUID NOT NULL REFERENCES public.admin_armazens(id),
  destino_id UUID NOT NULL REFERENCES public.admin_armazens(id),
  distancia_km DECIMAL(10,2),
  tempo_estimado_min INT,
  transportadora VARCHAR(100),
  motorista_id UUID REFERENCES public.profiles(id),
  veiculo_id UUID REFERENCES public.admin_transportes(id),
  data_programada DATE,
  hora_partida TIME,
  hora_prevista_chegada TIME,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PARADAS DA ROTA
CREATE TABLE IF NOT EXISTS public.admin_rotas_paradas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rota_id UUID NOT NULL REFERENCES public.admin_rotas(id),
  ordem INT NOT NULL,
  armazem_id UUID REFERENCES public.admin_armazens(id),
  cliente_id UUID REFERENCES public.admin_clientes(id),
  shipment_id UUID REFERENCES public.admin_shipments(id),
  endereco TEXT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  previsao_chegada TIMESTAMPTZ,
  chegada_real TIMESTAMPTZ,
  status VARCHAR(50) DEFAULT 'pending',
  observacao TEXT
);

-- 6. MOTORISTAS
CREATE TABLE IF NOT EXISTS public.admin_motoristas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES public.profiles(id) UNIQUE,
  nome VARCHAR(255) NOT NULL,
  telefone VARCHAR(50),
  cnh VARCHAR(50),
  transportadora VARCHAR(100),
  veiculo_id UUID REFERENCES public.admin_transportes(id),
  ativo BOOLEAN DEFAULT true,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  ultima_atualizacao TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ZONAS DO ARMAZÉM
CREATE TABLE IF NOT EXISTS public.admin_zonas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  armazem_id UUID NOT NULL REFERENCES public.admin_armazens(id),
  nome VARCHAR(100) NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  capacidade INT DEFAULT 0,
  ocupacao INT DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. INVENTÁRIO DETALHADO
CREATE TABLE IF NOT EXISTS public.admin_inventario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  armazem_id UUID NOT NULL REFERENCES public.admin_armazens(id),
  zona_id UUID REFERENCES public.admin_zonas(id),
  produto VARCHAR(255) NOT NULL,
  sku VARCHAR(100),
  quantidade INT NOT NULL DEFAULT 0,
  reservado INT NOT NULL DEFAULT 0,
  lote VARCHAR(100),
  data_entrada TIMESTAMPTZ DEFAULT NOW(),
  data_validade TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. SLA CONFIG
CREATE TABLE IF NOT EXISTS public.admin_sla_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo VARCHAR(50) NOT NULL,
  origem_cep_prefix VARCHAR(10),
  destino_cep_prefix VARCHAR(10),
  horas_prazo INT NOT NULL,
  prioridade INT DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. SLA LOG
CREATE TABLE IF NOT EXISTS public.admin_sla_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID NOT NULL REFERENCES public.admin_shipments(id),
  sla_horas INT NOT NULL,
  horas_gastas DECIMAL(10,2),
  no_prazo BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_shipments_codigo ON public.admin_shipments(codigo);
CREATE INDEX IF NOT EXISTS idx_shipments_etapa ON public.admin_shipments(etapa);
CREATE INDEX IF NOT EXISTS idx_shipments_motorista ON public.admin_shipments(motorista_id);
CREATE INDEX IF NOT EXISTS idx_shipments_rota ON public.admin_shipments(rota_id);
CREATE INDEX IF NOT EXISTS idx_packages_codigo_barras ON public.admin_packages(codigo_barras);
CREATE INDEX IF NOT EXISTS idx_rotas_tipo_data ON public.admin_rotas(tipo, data_programada);
CREATE INDEX IF NOT EXISTS idx_rotas_paradas_rota_ordem ON public.admin_rotas_paradas(rota_id, ordem);
CREATE INDEX IF NOT EXISTS idx_dropoffs_agencia ON public.admin_dropoffs(agencia_id);
CREATE INDEX IF NOT EXISTS idx_inventario_armazem_zona ON public.admin_inventario(armazem_id, zona_id);
CREATE INDEX IF NOT EXISTS idx_motoristas_gps ON public.admin_motoristas(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_shipments_cliente ON public.admin_shipments(cliente_id);
CREATE INDEX IF NOT EXISTS idx_zonas_armazem ON public.admin_zonas(armazem_id);

-- =============================================================================
-- RLS POLICIES
-- =============================================================================
ALTER TABLE public.admin_shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_dropoffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_rotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_rotas_paradas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_motoristas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_zonas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_inventario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sla_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sla_log ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admin_shipments') THEN
    CREATE POLICY "Allow all on admin_shipments" ON public.admin_shipments FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admin_packages') THEN
    CREATE POLICY "Allow all on admin_packages" ON public.admin_packages FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admin_dropoffs') THEN
    CREATE POLICY "Allow all on admin_dropoffs" ON public.admin_dropoffs FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admin_rotas') THEN
    CREATE POLICY "Allow all on admin_rotas" ON public.admin_rotas FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admin_rotas_paradas') THEN
    CREATE POLICY "Allow all on admin_rotas_paradas" ON public.admin_rotas_paradas FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admin_motoristas') THEN
    CREATE POLICY "Allow all on admin_motoristas" ON public.admin_motoristas FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admin_zonas') THEN
    CREATE POLICY "Allow all on admin_zonas" ON public.admin_zonas FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admin_inventario') THEN
    CREATE POLICY "Allow all on admin_inventario" ON public.admin_inventario FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admin_sla_config') THEN
    CREATE POLICY "Allow all on admin_sla_config" ON public.admin_sla_config FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admin_sla_log') THEN
    CREATE POLICY "Allow all on admin_sla_log" ON public.admin_sla_log FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- =============================================================================
-- SEED DATA: SLA Config (Japão)
-- =============================================================================
INSERT INTO public.admin_sla_config (tipo, destino_cep_prefix, horas_prazo, prioridade) VALUES
  ('FIRST_MILE', NULL, 24, 1),
  ('SORTING', NULL, 12, 2),
  ('LINE_HAUL', NULL, 48, 3),
  ('LAST_MILE', NULL, 24, 4)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- SEED DATA: Motoristas (vinculados a perfis existentes)
-- =============================================================================
INSERT INTO public.admin_motoristas (id, nome, telefone, transportadora, ativo)
SELECT * FROM (VALUES
  ('m0000001-0000-0000-0000-000000000001'::uuid, 'Takeshi Yamada', '+81-80-1111-0001', 'YAMATO', true),
  ('m0000001-0000-0000-0000-000000000002'::uuid, 'Kenji Tanaka', '+81-80-1111-0002', 'YAMATO', true),
  ('m0000001-0000-0000-0000-000000000003'::uuid, 'Hiroshi Sato', '+81-80-1111-0003', 'YAMATO', true),
  ('m0000001-0000-0000-0000-000000000004'::uuid, 'Akio Suzuki', '+81-80-1111-0004', 'SAGAWA', true),
  ('m0000001-0000-0000-0000-000000000005'::uuid, 'Yuki Watanabe', '+81-80-1111-0005', 'SAGAWA', true),
  ('m0000001-0000-0000-0000-000000000006'::uuid, 'Shinichi Kobayashi', '+81-80-1111-0006', 'SAGAWA', true),
  ('m0000001-0000-0000-0000-000000000007'::uuid, 'Daisuke Yamamoto', '+81-80-1111-0007', 'SENIO', true),
  ('m0000001-0000-0000-0000-000000000008'::uuid, 'Ryo Nakamura', '+81-80-1111-0008', 'SENIO', true),
  ('m0000001-0000-0000-0000-000000000009'::uuid, 'Kazuki Ito', '+81-80-1111-0009', 'DAIG', true),
  ('m0000001-0000-0000-0000-000000000010'::uuid, 'Shohei Kato', '+81-80-1111-0010', 'DAIG', true)
) AS src(id, nome, telefone, transportadora, ativo)
WHERE NOT EXISTS (SELECT 1 FROM public.admin_motoristas WHERE id = src.id);

-- =============================================================================
-- ADD COLUMNS TO EXISTING admin_rastreamento
-- =============================================================================
ALTER TABLE public.admin_rastreamento ADD COLUMN IF NOT EXISTS foto_url TEXT;
ALTER TABLE public.admin_rastreamento ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,7);
ALTER TABLE public.admin_rastreamento ADD COLUMN IF NOT EXISTS longitude DECIMAL(10,7);
ALTER TABLE public.admin_rastreamento ADD COLUMN IF NOT EXISTS responsavel VARCHAR(255);

SELECT json_agg(json_build_object('table', table_name, 'rows', (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name)))
FROM (SELECT unnest(ARRAY[
  'admin_shipments','admin_packages','admin_dropoffs','admin_rotas',
  'admin_rotas_paradas','admin_motoristas','admin_zonas','admin_inventario',
  'admin_sla_config','admin_sla_log'
]) AS table_name) t;
