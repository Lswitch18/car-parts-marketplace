-- ============================================================================
-- DAIG SAAS MULTI-TENANT ENTERPRISE SCHEMA (POSTGRESQL + SUPABASE RLS)
-- Data da Criação: 2026-07-29
-- Descrição: Estrutura completa para gestão ERP/WMS multi-empresa isolada por
--            tenant_id + Row Level Security (RLS) + Chave de 1-Clique para Marketplace.
-- ============================================================================

-- Habilitar Extensão UUID se necessário
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. TABELA DE TENANTS (EMPRESAS / ORGANIZAÇÕES)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                           -- Ex: "Desmanche & Auto Peças Tokyo"
  slug TEXT UNIQUE NOT NULL,                    -- Ex: "desmanche-tokyo" (usado no subdomínio)
  custom_domain TEXT UNIQUE,                    -- Ex: "peças.desmanchetokyo.com"
  tax_id TEXT,                                  -- CNPJ / Houjin Number (Japão)
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  address_prefecture TEXT,                      -- Ex: "Kanagawa", "Tokyo"
  address_city TEXT,
  address_line TEXT,
  postal_code TEXT,                             -- Ex: "220-0012"
  plan_type TEXT NOT NULL DEFAULT 'pro',        -- 'starter', 'pro', 'enterprise'
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index para busca rápida de subdomínios/slugs
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON public.tenants(slug);

-- ----------------------------------------------------------------------------
-- 2. TABELA DE MEMBROS E FUNÇÕES DO TENANT (RBAC)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tenant_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'operator',        -- 'tenant_admin', 'manager', 'mechanic', 'operator'
  is_primary_owner BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_tenant_users_user ON public.tenant_users(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant ON public.tenant_users(tenant_id);

-- ----------------------------------------------------------------------------
-- 3. FUNÇÃO AUXILIAR PARA OBTER O TENANT_ID ATUAL DO JWT
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS UUID AS $$
BEGIN
  RETURN COALESCE(
    (NULLIF(current_setting('request.jwt.claims', true), '')::jsonb -> 'app_metadata' ->> 'tenant_id')::uuid,
    (NULLIF(current_setting('request.jwt.claims', true), '')::jsonb -> 'user_metadata' ->> 'tenant_id')::uuid
  );
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 4. ADICIONAR SUPORTE MULTI-TENANT E DIVULGAÇÃO 1-CLIQUE NA TABELA DE PEÇAS
-- ----------------------------------------------------------------------------
DO $$ 
BEGIN
  -- 4.1 Adicionar tenant_id na tabela parts se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'parts' AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE public.parts ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
  END IF;

  -- 4.2 Adicionar flag de divulgação em 1-clique
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'parts' AND column_name = 'is_published_to_marketplace'
  ) THEN
    ALTER TABLE public.parts ADD COLUMN is_published_to_marketplace BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;

  -- 4.3 Adicionar etiqueta física QR Code
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'parts' AND column_name = 'qr_code_label'
  ) THEN
    ALTER TABLE public.parts ADD COLUMN qr_code_label TEXT;
  END IF;

  -- 4.4 Adicionar preço de custo privado
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'parts' AND column_name = 'cost_price'
  ) THEN
    ALTER TABLE public.parts ADD COLUMN cost_price NUMERIC(12, 2);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_parts_tenant_id ON public.parts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_parts_published ON public.parts(is_published_to_marketplace) WHERE is_published_to_marketplace = TRUE;

-- ----------------------------------------------------------------------------
-- 5. TABELA DE ARMAZÉM E PRATELEIRAS WMS DO TENANT
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tenant_warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                           -- Ex: "Galpão A - Desmonte Principal"
  code TEXT NOT NULL,                           -- Ex: "GLP-A"
  aisle_code TEXT,                              -- Corredor (Ex: "B-03")
  shelf_code TEXT,                              -- Prateleira (Ex: "PR-04")
  bin_code TEXT,                                -- Caçamba/Nível (Ex: "NV-02")
  qr_code_location TEXT UNIQUE,                 -- QR Code colado na prateleira
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_warehouses_tenant ON public.tenant_warehouses(tenant_id);

-- ----------------------------------------------------------------------------
-- 6. TABELA DE ORDENS DE SERVIÇO (O.S.) DA OFICINA DO TENANT
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  os_number SERIAL,                             -- Número sequencial da O.S. (Ex: O.S. #1042)
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  vehicle_brand TEXT NOT NULL,                  -- Ex: "Toyota"
  vehicle_model TEXT NOT NULL,                  -- Ex: "Prius ZVW30"
  vehicle_license_plate TEXT,                   -- Placa (Ex: "品川 300 な 12-34")
  vehicle_vin TEXT,                             -- Número de Chassi / VIN
  status TEXT NOT NULL DEFAULT 'open',          -- 'open', 'in_progress', 'waiting_parts', 'completed', 'cancelled'
  total_parts_amount NUMERIC(12, 2) DEFAULT 0,
  total_labor_amount NUMERIC(12, 2) DEFAULT 0,
  total_grand_amount NUMERIC(12, 2) DEFAULT 0,
  assigned_mechanic_id UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_work_orders_tenant ON public.work_orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON public.work_orders(status);

-- ----------------------------------------------------------------------------
-- 7. ITENS DE PEÇAS VINCULADAS À ORDEM DE SERVIÇO (O.S.)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.work_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id UUID NOT NULL REFERENCES public.work_orders(id) ON DELETE CASCADE,
  part_id UUID REFERENCES public.parts(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 8. POLÍTICAS DE SEGURANÇA ROW LEVEL SECURITY (RLS)
-- ----------------------------------------------------------------------------

-- Habilitar RLS em todas as tabelas multi-tenant
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_order_items ENABLE ROW LEVEL SECURITY;

-- 8.1 Políticas para TABELA TENANTS
CREATE POLICY tenants_member_read ON public.tenants
  FOR SELECT
  USING (
    id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid())
    OR auth.role() = 'service_role'
  );

-- 8.2 Políticas para TABELA PARTS (Visão Privada do Tenant VS Marketplace Público)
-- A) Membros do Tenant enxergam TODO o estoque privado do Tenant
CREATE POLICY parts_tenant_private_access ON public.parts
  FOR ALL
  USING (
    tenant_id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid())
    OR seller_id = auth.uid()
    OR auth.role() = 'service_role'
  );

-- B) Qualquer Comprador Público enxerga APENAS peças com a chave 1-Clique ATIVADA
CREATE POLICY parts_public_marketplace_feed ON public.parts
  FOR SELECT
  USING (
    is_published_to_marketplace = TRUE 
    OR status = 'available'
  );

-- 8.3 Políticas para WMS WAREHOUSES
CREATE POLICY warehouses_tenant_isolation ON public.tenant_warehouses
  FOR ALL
  USING (
    tenant_id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid())
    OR auth.role() = 'service_role'
  );

-- 8.4 Políticas para WORK ORDERS (O.S.)
CREATE POLICY work_orders_tenant_isolation ON public.work_orders
  FOR ALL
  USING (
    tenant_id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid())
    OR auth.role() = 'service_role'
  );

-- ----------------------------------------------------------------------------
-- 8.5 FUNÇÃO DE VALIDAÇÃO DE PERMISSÕES DO TENANT (RBAC)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.has_tenant_permission(
  target_tenant_id UUID,
  required_permission TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.tenant_users
  WHERE tenant_id = target_tenant_id AND user_id = auth.uid();

  IF user_role IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Admin do Tenant tem acesso total
  IF user_role = 'tenant_admin' THEN
    RETURN TRUE;
  END IF;

  -- Gerente de Estoque
  IF user_role = 'tenant_manager' AND required_permission IN ('manage_inventory', 'publish_marketplace', 'print_qr_labels', 'manage_work_orders') THEN
    RETURN TRUE;
  END IF;

  -- Mecânico da Oficina
  IF user_role = 'tenant_mechanic' AND required_permission IN ('manage_work_orders') THEN
    RETURN TRUE;
  END IF;

  -- Operador de Balcão
  IF user_role = 'tenant_operator' AND required_permission IN ('print_qr_labels') THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 9. TRIGGER DE BAIXA AUTOMÁTICA DE ESTOQUE APÓS VENDA NO MARKETPLACE
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.auto_decrement_tenant_stock_on_sale()
RETURNS TRIGGER AS $$
BEGIN
  -- Quando a transação for paga no Marketplace, altera o status da peça no estoque privado para 'sold'
  IF (NEW.payment_status = 'paid' OR NEW.payment_status = 'escrow') AND OLD.payment_status != NEW.payment_status THEN
    UPDATE public.parts
    SET status = 'sold',
        is_published_to_marketplace = FALSE
    WHERE id = NEW.part_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_auto_decrement_tenant_stock ON public.transactions;
CREATE TRIGGER trg_auto_decrement_tenant_stock
  AFTER UPDATE OF payment_status ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_decrement_tenant_stock_on_sale();

-- ============================================================================
-- MIGRAÇÃO CONCLUÍDA COM SUCESSO
-- ============================================================================
