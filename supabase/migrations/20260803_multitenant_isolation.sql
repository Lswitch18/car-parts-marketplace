-- 🏢 MULTI-TENANT ISOLATION MIGRATION & RLS POLICIES (DAIG SAAS)
-- Author: DAIG Architecture Team

-- 1. Tabela de Tenants (Empresas/Desmanches Cadastrados)
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subdomain TEXT UNIQUE,
  plan TEXT DEFAULT 'enterprise',
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index para buscas rápidas por owner_id
CREATE INDEX IF NOT EXISTS idx_tenants_owner ON public.tenants(owner_id);

-- 2. Garantir coluna tenant_id no perfil do usuário
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tenant_role TEXT DEFAULT 'tenant_admin';

-- 3. Garantir coluna tenant_id nas Peças de Estoque WMS
ALTER TABLE public.parts ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_parts_tenant ON public.parts(tenant_id);

-- 4. Garantir coluna tenant_id nas Transações
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_tenant ON public.transactions(tenant_id);

-- 5. Tabela de Ordens de Serviço da Oficina (Work Orders)
CREATE TABLE IF NOT EXISTS public.work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  client TEXT NOT NULL,
  vehicle TEXT NOT NULL,
  mechanic TEXT DEFAULT 'Técnico Responsável',
  status TEXT DEFAULT 'aguardando', -- 'aguardando', 'em_manutencao', 'testes', 'pronto'
  amount NUMERIC(12,2) DEFAULT 0,
  parts_used TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_work_orders_tenant ON public.work_orders(tenant_id);

-- 6. Tabela de Compras & NF-e XML
CREATE TABLE IF NOT EXISTS public.nfe_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  access_key TEXT UNIQUE NOT NULL,
  supplier TEXT NOT NULL,
  invoice_value NUMERIC(12,2) NOT NULL,
  status TEXT DEFAULT 'Processada',
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nfe_invoices_tenant ON public.nfe_invoices(tenant_id);

-- 7. ATIVAR ROW LEVEL SECURITY (RLS) PARA ISOLAMENTO ESTRITO
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nfe_invoices ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE ACESSO (PARTS)
DROP POLICY IF EXISTS "Tenant pode visualizar seu estoque privado" ON public.parts;
CREATE POLICY "Tenant pode visualizar seu estoque privado" ON public.parts
  FOR SELECT USING (
    status = 'active' OR seller_id = auth.uid()::text OR tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Tenant pode gerenciar seu estoque" ON public.parts;
CREATE POLICY "Tenant pode gerenciar seu estoque" ON public.parts
  FOR ALL USING (
    seller_id = auth.uid()::text OR tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = auth.uid()
    )
  );

-- POLÍTICAS DE ACESSO (WORK ORDERS)
DROP POLICY IF EXISTS "Tenant gerencia apenas suas Ordens de Serviço" ON public.work_orders;
CREATE POLICY "Tenant gerencia apenas suas Ordens de Serviço" ON public.work_orders
  FOR ALL USING (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = auth.uid()
    )
  );

-- POLÍTICAS DE ACESSO (NFE INVOICES)
DROP POLICY IF EXISTS "Tenant gerencia suas compras NFe" ON public.nfe_invoices;
CREATE POLICY "Tenant gerencia suas compras NFe" ON public.nfe_invoices
  FOR ALL USING (
    tenant_id IN (
      SELECT id FROM public.tenants WHERE owner_id = auth.uid()
    )
  );
