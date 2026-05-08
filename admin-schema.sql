-- =============================================
-- SCHEMA ATUALIZADO COM ADMIN E RASTREAMENTO
-- Execute este SQL no Supabase SQL Editor
-- =============================================

-- =============================================
-- 1. ADICIONAR COLUNAS NA TABELA PROFILES
-- =============================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'seller')),
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ip_address TEXT,
ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- =============================================
-- 2. CRIAR TABELA DE AUDITORIA
-- =============================================

CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para audit_log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view all audit logs" ON public.audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "System can insert audit logs" ON public.audit_log
  FOR INSERT WITH CHECK (true);

-- =============================================
-- 3. CRIAR TABELA DE ATIVIDADE DO USUÁRIO
-- =============================================

CREATE TABLE IF NOT EXISTS public.user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'login', 'logout', 'view_part', 'create_part', 'update_part', 
    'delete_part', 'create_favorite', 'remove_favorite',
    'send_message', 'receive_message', 'create_transaction',
    'update_profile', 'upload_image'
  )),
  activity_data JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para user_activity
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity" ON public.user_activity
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all activity" ON public.user_activity
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can create own activity" ON public.user_activity
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 4. CRIAR TABELA DE TRANSAÇÕES COMPLETA
-- =============================================

CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part_id UUID REFERENCES public.parts NOT NULL,
  buyer_id UUID REFERENCES public.profiles NOT NULL,
  seller_id UUID REFERENCES public.profiles NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  shipping_fee DECIMAL(10,2) DEFAULT 0,
  commission DECIMAL(10,2) DEFAULT 0,
  commission_rate DECIMAL(4,2) DEFAULT 0.10,
  platform_fee DECIMAL(10,2) DEFAULT 0,
  seller_net DECIMAL(10,2) DEFAULT 0,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN (
    'pending', 'processing', 'paid', 'failed', 'refunded', 'cancelled'
  )),
  fulfillment_status TEXT DEFAULT 'pending' CHECK (fulfillment_status IN (
    'pending', 'packed', 'shipped', 'delivered', 'completed', 'disputed', 'returned'
  )),
  tracking_number TEXT,
  shipping_carrier TEXT,
  shipping_address JSONB,
  buyer_rating INTEGER CHECK (buyer_rating >= 1 AND buyer_rating <= 5),
  seller_rating INTEGER CHECK (seller_rating >= 1 AND seller_rating <= 5),
  buyer_review TEXT,
  seller_review TEXT,
  notes TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Atualizar políticas de RLS para transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Sellers can view own transactions" ON public.transactions;

CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (
    auth.uid() = buyer_id OR 
    auth.uid() = seller_id OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Sellers can create transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = seller_id OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Sellers can update own transactions" ON public.transactions
  FOR UPDATE USING (
    auth.uid() = seller_id OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================
-- 5. CRIAR TABELA DE NOTIFICAÇÕES
-- =============================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'new_message', 'new_bid', 'bid_outbid', 'auction_ending',
    'sale_completed', 'purchase_completed', 'new_review',
    'account_update', 'system'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- 6. CRIAR TABELA DE MÉTRICAS DIÁRIAS
-- =============================================

CREATE TABLE IF NOT EXISTS public.daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  new_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  new_parts INTEGER DEFAULT 0,
  parts_sold INTEGER DEFAULT 0,
  total_gmv DECIMAL(12,2) DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  new_transactions INTEGER DEFAULT 0,
  completed_transactions INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 7. FUNÇÃO PARA REGISTRAR LOG DE AUDITORIA
-- =============================================

CREATE OR REPLACE FUNCTION public.log_audit(
  p_user_id UUID,
  p_action TEXT,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_old_data JSONB DEFAULT NULL,
  p_new_data JSONB DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.audit_log (
    user_id, action, entity_type, entity_id,
    old_data, new_data, ip_address, user_agent
  ) VALUES (
    p_user_id, p_action, p_entity_type, p_entity_id,
    p_old_data, p_new_data, p_ip_address, p_user_agent
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 8. FUNÇÃO PARA REGISTRAR ATIVIDADE
-- =============================================

CREATE OR REPLACE FUNCTION public.log_activity(
  p_user_id UUID,
  p_activity_type TEXT,
  p_activity_data JSONB DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_activity_id UUID;
BEGIN
  INSERT INTO public.user_activity (
    user_id, activity_type, activity_data, ip_address
  ) VALUES (
    p_user_id, p_activity_type, p_activity_data, p_ip_address
  ) RETURNING id INTO v_activity_id;
  
  RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 9. TRIGGER PARA UPDATE DE timestamps
-- =============================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================
-- 10. FUNÇÕES DE AGREGATE PARA DASHBOARD ADMIN
-- =============================================

-- Total de usuários
CREATE OR REPLACE FUNCTION public.get_total_users()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM public.profiles;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Total de vendas (GMV)
CREATE OR REPLACE FUNCTION public.get_total_gmv()
RETURNS DECIMAL AS $$
DECLARE
  v_total DECIMAL;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO v_total 
  FROM public.transactions 
  WHERE payment_status = 'paid';
  RETURN v_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Receita total da plataforma
CREATE OR REPLACE FUNCTION public.get_total_revenue()
RETURNS DECIMAL AS $$
DECLARE
  v_total DECIMAL;
BEGIN
  SELECT COALESCE(SUM(commission), 0) INTO v_total 
  FROM public.transactions 
  WHERE payment_status = 'paid';
  RETURN v_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 11. CRIAÇÃO DOS USUÁRIOS DE TESTE
-- =============================================

DO $$ 
DECLARE
  user1_id UUID;
  user2_id UUID;
BEGIN
  -- Criar usuario@teste.com
  INSERT INTO auth.users (
    id, email, encrypted_password, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data
  ) VALUES (
    gen_random_uuid(),
    'usuario@teste.com',
    crypt('teste123456', gen_salt('bf')),
    NOW(), NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Usuario Teste", "role": "user"}'
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO user1_id;
  
  -- Criar admin@teste.com
  INSERT INTO auth.users (
    id, email, encrypted_password, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data
  ) VALUES (
    gen_random_uuid(),
    'admin@teste.com',
    crypt('teste123456', gen_salt('bf')),
    NOW(), NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Admin JAPANCAR", "role": "admin"}'
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO user2_id;
  
  -- Criar perfil usuario@teste.com
  INSERT INTO public.profiles (
    id, email, full_name, phone, address, cep, role, rating, is_verified
  ) VALUES (
    (SELECT id FROM auth.users WHERE email = 'usuario@teste.com'),
    'usuario@teste.com',
    'Usuario Teste',
    '090-1234-5678',
    'Tokyo, Shibuya 1-2-3',
    '150-0001',
    'user',
    4.5,
    false
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Criar perfil admin@teste.com
  INSERT INTO public.profiles (
    id, email, full_name, phone, address, cep, role, rating, is_verified
  ) VALUES (
    (SELECT id FROM auth.users WHERE email = 'admin@teste.com'),
    'admin@teste.com',
    'Admin JAPANCAR',
    '090-9876-5432',
    'Tokyo, Minato 5-6-7',
    '107-0051',
    'admin',
    5.0,
    true
  )
  ON CONFLICT (id) DO NOTHING;
  
END $$;

-- =============================================
-- 12. HABILITAR REALTIME
-- =============================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
