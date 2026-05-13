-- =====================================================================
-- DAIG — Digital A.I. Garage
-- Schema Verification & Missing Tables Migration
-- Gerado em: 2026-05-13
-- Executar no Supabase SQL Editor (Dashboard > SQL Editor)
-- =====================================================================

-- =====================================================================
-- TABELAS EXISTENTES (confirmadas via API em 2026-05-13)
-- =====================================================================
-- ✅ profiles        (8 registros)   — usuários
-- ✅ parts           (10 registros)  — anúncios de peças
-- ✅ brands          (9 registros)   — marcas
-- ✅ car_models      (51 registros)  — modelos de carros
-- ✅ categories      (12 registros)  — categorias
-- ✅ messages        (4 registros)   — mensagens entre usuários
-- ✅ transactions    (1 registro)    — transações de venda
-- ✅ reviews         (0 registros)   — avaliações
-- ✅ favorites       (0 registros)   — favoritos
-- =====================================================================

-- =====================================================================
-- PROBLEMA DETECTADO: coluna 'username' faltando em profiles
-- A função get_top_sellers usa profiles.username, mas a tabela usa
-- full_name. Isso causa erro na analytics. CORRIGIR:
-- =====================================================================

-- Fix: garantir coluna username (alias de full_name) ou adicionar coluna
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'username'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN username TEXT GENERATED ALWAYS AS (full_name) STORED;
    RAISE NOTICE 'Coluna username adicionada como coluna gerada de full_name';
  ELSE
    RAISE NOTICE 'Coluna username já existe';
  END IF;
END;
$$;

-- =====================================================================
-- PROBLEMA DETECTADO: transactions não tem payment_status / fulfillment_status
-- A tabela usa apenas 'status'. O código frontend espera payment_status.
-- =====================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'transactions'
      AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE public.transactions ADD COLUMN payment_status TEXT DEFAULT 'pending';
    -- Copiar status existente
    UPDATE public.transactions SET payment_status = status WHERE payment_status IS NULL;
    RAISE NOTICE 'Coluna payment_status adicionada';
  ELSE
    RAISE NOTICE 'payment_status já existe';
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'transactions'
      AND column_name = 'fulfillment_status'
  ) THEN
    ALTER TABLE public.transactions ADD COLUMN fulfillment_status TEXT DEFAULT 'pending';
    RAISE NOTICE 'Coluna fulfillment_status adicionada';
  ELSE
    RAISE NOTICE 'fulfillment_status já existe';
  END IF;
END;
$$;

-- =====================================================================
-- ATUALIZAR FUNÇÕES ANALYTICS (corrigindo referências a username)
-- =====================================================================

-- Recriar get_top_sellers usando full_name em vez de username
CREATE OR REPLACE FUNCTION get_top_sellers(limit_count INTEGER DEFAULT 5)
RETURNS TABLE(
  seller_id UUID,
  username TEXT,
  avatar_url TEXT,
  total_sales NUMERIC,
  transaction_count INTEGER,
  rating DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id as seller_id,
    COALESCE(p.full_name, p.email, 'Anônimo') as username,
    p.avatar_url,
    COALESCE(SUM(t.amount), 0)::NUMERIC as total_sales,
    COUNT(t.id)::INTEGER as transaction_count,
    p.rating
  FROM profiles p
  LEFT JOIN transactions t ON t.seller_id = p.id
    AND (t.payment_status = 'completed' OR t.status = 'completed')
  WHERE p.role IN ('seller', 'admin', 'buyer')
  GROUP BY p.id, p.full_name, p.email, p.avatar_url, p.rating
  ORDER BY total_sales DESC
  LIMIT limit_count;
END;
$$;

-- Recriar get_recent_transactions usando full_name
CREATE OR REPLACE FUNCTION get_recent_transactions(limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
  id UUID,
  buyer_name TEXT,
  seller_name TEXT,
  part_title TEXT,
  amount NUMERIC,
  payment_status TEXT,
  fulfillment_status TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    COALESCE(buyer.full_name, buyer.email, 'N/A') as buyer_name,
    COALESCE(seller.full_name, seller.email, 'N/A') as seller_name,
    p.title as part_title,
    t.amount::NUMERIC,
    COALESCE(t.payment_status, t.status, 'pending') as payment_status,
    COALESCE(t.fulfillment_status, 'pending') as fulfillment_status,
    t.created_at
  FROM transactions t
  LEFT JOIN profiles buyer ON buyer.id = t.buyer_id
  LEFT JOIN profiles seller ON seller.id = t.seller_id
  LEFT JOIN parts p ON p.id = t.part_id
  ORDER BY t.created_at DESC
  LIMIT limit_count;
END;
$$;

-- Recriar get_daily_stats compatível com colunas atuais
CREATE OR REPLACE FUNCTION get_daily_stats()
RETURNS TABLE(
  today_revenue NUMERIC,
  today_transactions INTEGER,
  yesterday_revenue NUMERIC,
  yesterday_transactions INTEGER,
  active_listings INTEGER,
  total_users INTEGER,
  total_parts INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE((
      SELECT SUM(t.amount) FROM transactions t
      WHERE (t.payment_status = 'completed' OR t.status = 'completed')
        AND DATE(t.created_at) = CURRENT_DATE
    ), 0)::NUMERIC,

    COALESCE((
      SELECT COUNT(*) FROM transactions t
      WHERE (t.payment_status = 'completed' OR t.status = 'completed')
        AND DATE(t.created_at) = CURRENT_DATE
    ), 0)::INTEGER,

    COALESCE((
      SELECT SUM(t.amount) FROM transactions t
      WHERE (t.payment_status = 'completed' OR t.status = 'completed')
        AND DATE(t.created_at) = CURRENT_DATE - 1
    ), 0)::NUMERIC,

    COALESCE((
      SELECT COUNT(*) FROM transactions t
      WHERE (t.payment_status = 'completed' OR t.status = 'completed')
        AND DATE(t.created_at) = CURRENT_DATE - 1
    ), 0)::INTEGER,

    (SELECT COUNT(*) FROM parts WHERE status = 'active')::INTEGER,
    (SELECT COUNT(*) FROM profiles)::INTEGER,
    (SELECT COUNT(*) FROM parts)::INTEGER;
END;
$$;

-- =====================================================================
-- TABELA DE CIDADES / ROTAS (nova — para o mapa do admin dashboard)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.shipping_cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  state_code CHAR(2) NOT NULL,
  lat DECIMAL(9,6) NOT NULL,
  lng DECIMAL(9,6) NOT NULL,
  is_hub BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir cidades principais (sem duplicar)
INSERT INTO public.shipping_cities (name, state_code, lat, lng, is_hub) VALUES
  ('São Paulo',      'SP', -23.5505, -46.6333, true),
  ('Rio de Janeiro', 'RJ', -22.9068, -43.1729, true),
  ('Belo Horizonte', 'MG', -19.9167, -43.9345, true),
  ('Curitiba',       'PR', -25.4297, -49.2711, true),
  ('Porto Alegre',   'RS', -30.0346, -51.2177, false),
  ('Salvador',       'BA', -12.9714, -38.5014, false),
  ('Brasília',       'DF', -15.7801, -47.9292, false),
  ('Manaus',         'AM', -3.1190,  -60.0217, false),
  ('Recife',         'PE', -8.0476,  -34.8770, false),
  ('Fortaleza',      'CE', -3.7172,  -38.5433, false),
  ('Campinas',       'SP', -22.9099, -47.0626, false),
  ('Goiânia',        'GO', -16.6869, -49.2648, false)
ON CONFLICT DO NOTHING;

-- =====================================================================
-- RLS POLICIES (garantir que admins podem ler tudo)
-- =====================================================================
ALTER TABLE public.shipping_cities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read shipping_cities" ON public.shipping_cities;
CREATE POLICY "Public read shipping_cities"
  ON public.shipping_cities FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin manage shipping_cities" ON public.shipping_cities;
CREATE POLICY "Admin manage shipping_cities"
  ON public.shipping_cities FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================================
-- FIX: RLS em profiles para garantir que o authStore pode criar perfis
-- =====================================================================
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- =====================================================================
-- VERIFICAÇÃO FINAL
-- =====================================================================
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns c
   WHERE c.table_schema = 'public' AND c.table_name = t.table_name) as col_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
