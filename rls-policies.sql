-- =============================================
-- GAID - POLÍTICAS RLS (Row Level Security)
-- Execute este script no SQL Editor do Supabase
-- =============================================

-- =============================================
-- ATIVAR RLS EM TODAS AS TABELAS
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PROFILES (usuários)
-- =============================================

-- Qualquer um pode ler informações públicas do perfil
CREATE POLICY "profiles_read_public" ON profiles
  FOR SELECT
  USING (true);

-- Apenas o próprio usuário pode atualizar seu perfil
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Apenas o usuário pode inserir (via trigger de auth)
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =============================================
-- BRANDS (marcas)
-- =============================================

-- Público total para leitura
CREATE POLICY "brands_read_public" ON brands
  FOR SELECT
  USING (true);

-- Apenas admin pode criar/editar
CREATE POLICY "brands_manage_admin" ON brands
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role LIKE '%admin%'
    )
  );

-- =============================================
-- CAR_MODELS (modelos de carros)
-- =============================================

-- Público total para leitura
CREATE POLICY "car_models_read_public" ON car_models
  FOR SELECT
  USING (true);

-- Apenas admin pode criar/editar
CREATE POLICY "car_models_manage_admin" ON car_models
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role LIKE '%admin%'
    )
  );

-- =============================================
-- CATEGORIES (categorias de peças)
-- =============================================

-- Público total para leitura
CREATE POLICY "categories_read_public" ON categories
  FOR SELECT
  USING (true);

-- Apenas admin pode criar/editar
CREATE POLICY "categories_manage_admin" ON categories
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role LIKE '%admin%'
    )
  );

-- =============================================
-- PARTS (anúncios de peças)
-- =============================================

-- Todos podem ver anúncios ativos
CREATE POLICY "parts_read_active" ON parts
  FOR SELECT
  USING (status = 'active' OR seller_id = auth.uid());

-- Apenas vendedores podem criar seus próprios anúncios
CREATE POLICY "parts_insert_own" ON parts
  FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

-- Apenas vendedores podem editar seus próprios anúncios
CREATE POLICY "parts_update_own" ON parts
  FOR UPDATE
  USING (auth.uid() = seller_id);

-- Apenas vendedores podem deletar (soft delete)
CREATE POLICY "parts_delete_own" ON parts
  FOR DELETE
  USING (auth.uid() = seller_id);

-- =============================================
-- BIDS (lances de leilões)
-- =============================================

-- Participantes do leilão e vendedor podem ver
CREATE POLICY "bids_read_parties" ON bids
  FOR SELECT
  USING (
    bidder_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM parts
      WHERE id = part_id AND seller_id = auth.uid()
    )
  );

-- Apenas usuários logados podem dar lance
CREATE POLICY "bids_insert_own" ON bids
  FOR INSERT
  WITH CHECK (
    auth.uid() = bidder_id AND
    EXISTS (
      SELECT 1 FROM parts
      WHERE id = part_id
      AND status = 'active'
      AND seller_id != auth.uid()
    )
  );

-- =============================================
-- TRANSACTIONS (transações/vendas)
-- =============================================

-- Apenas comprador, vendedor e admin podem ver
CREATE POLICY "transactions_read_parties" ON transactions
  FOR SELECT
  USING (
    buyer_id = auth.uid() OR
    seller_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role LIKE '%admin%'
    )
  );

-- Sistema cria transações automaticamente
CREATE POLICY "transactions_insert_system" ON transactions
  FOR INSERT
  WITH CHECK (true);

-- Apenas participantes e admin podem atualizar
CREATE POLICY "transactions_update_parties" ON transactions
  FOR UPDATE
  USING (
    buyer_id = auth.uid() OR
    seller_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role LIKE '%admin%'
    )
  );

-- =============================================
-- MESSAGES (mensagens)
-- =============================================

-- Apenas remetente e destinatário podem ver
CREATE POLICY "messages_read_parties" ON messages
  FOR SELECT
  USING (
    sender_id = auth.uid() OR
    receiver_id = auth.uid()
  );

-- Apenas remetente pode enviar
CREATE POLICY "messages_insert_own" ON messages
  FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- =============================================
-- FAVORITES (favoritos)
-- =============================================

-- Apenas dono pode ver/adicionar/remover
CREATE POLICY "favorites_own" ON favorites
  FOR ALL
  USING (user_id = auth.uid());

-- =============================================
-- REVIEWS (avaliações)
-- =============================================

-- Público para leitura
CREATE POLICY "reviews_read_public" ON reviews
  FOR SELECT
  USING (true);

-- Apenas compradores podem criar reviews (via transaction)
CREATE POLICY "reviews_insert_buyer" ON reviews
  FOR INSERT
  WITH CHECK (
    reviewer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM transactions
      WHERE id = transaction_id
      AND buyer_id = auth.uid()
      AND fulfillment_status = 'completed'
    )
  );

-- =============================================
-- VERIFICAR POLÍTICAS ATIVAS
-- =============================================

-- Listar todas as políticas
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =============================================
-- TESTAR POLÍTICAS
-- =============================================

-- Verificar se usuário atual tem acesso a parts
SELECT 
  'Parts ativos: ' || COUNT(*) as parts_count
FROM parts
WHERE status = 'active';

-- Verificar se RLS está ativo em cada tabela
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = true;