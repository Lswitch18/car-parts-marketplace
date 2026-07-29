-- ============================================================================
-- 🚀 MIGRATION INCREMENTAL (NON-DESTRUCTIVE / NON-BREAKING)
-- DAIG Platform - Japanese Bank Info & WMS Thermal Stickers
-- ============================================================================

-- 1. Adicionar coluna bank_info na tabela profiles de forma não destrutiva
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bank_info JSONB DEFAULT '{}'::jsonb;

-- 2. Adicionar coluna wms_qr_code_hash na tabela parts de forma não destrutiva
ALTER TABLE public.parts 
ADD COLUMN IF NOT EXISTS wms_qr_code_hash TEXT DEFAULT NULL;

-- 3. Adicionar coluna wms_location na tabela parts de forma não destrutiva
ALTER TABLE public.parts 
ADD COLUMN IF NOT EXISTS wms_location JSONB DEFAULT '{"aisle":"A","shelf":"01","bin":"01"}'::jsonb;

-- 4. Garantir permissões de leitura/escrita RLS para usuários autenticados em seu próprio perfil
DROP POLICY IF EXISTS "Users can update their own bank info" ON public.profiles;
CREATE POLICY "Users can update their own bank info"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 5. Comentários explicativos
COMMENT ON COLUMN public.profiles.bank_info IS 'Dados de conta bancária japonesa (Furikomi / Zengin) criptografados para repasses Stripe Connect';
COMMENT ON COLUMN public.parts.wms_qr_code_hash IS 'Código Hash exclusivo gerado para etiqueta térmica QR Code do armazém WMS';
