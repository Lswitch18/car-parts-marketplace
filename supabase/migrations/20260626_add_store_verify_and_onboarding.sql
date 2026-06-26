-- Migração: Adicionar campos de onboarding e store verify ao profiles
-- Data: 2026-06-26

ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS account_type text DEFAULT 'pessoa_fisica',
  ADD COLUMN IF NOT EXISTS store_verified boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS store_type text,
  ADD COLUMN IF NOT EXISTS store_name text,
  ADD COLUMN IF NOT EXISTS store_document text,
  ADD COLUMN IF NOT EXISTS store_status text DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS store_requested_at timestamptz,
  ADD COLUMN IF NOT EXISTS store_approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS store_rejected_reason text;

-- Marcar usuários existentes como onboarding completo (não forçar wizard para quem já usa)
UPDATE profiles SET onboarding_completed = true WHERE onboarding_completed = false;

-- Index para admin buscar solicitações pendentes rapidamente
CREATE INDEX IF NOT EXISTS idx_profiles_store_status ON profiles(store_status) WHERE store_status = 'pending';

COMMENT ON COLUMN profiles.onboarding_completed IS 'Se o wizard de onboarding foi concluído';
COMMENT ON COLUMN profiles.account_type IS 'pessoa_fisica | oficina | desmanche | concessionaria | loja_pecas | importadora';
COMMENT ON COLUMN profiles.store_verified IS 'Se a loja/empresa foi verificada pelo admin';
COMMENT ON COLUMN profiles.store_type IS 'Tipo de loja: oficina, desmanche, concessionaria, loja_pecas, importadora';
COMMENT ON COLUMN profiles.store_name IS 'Nome comercial da loja';
COMMENT ON COLUMN profiles.store_document IS 'CNPJ ou registro comercial';
COMMENT ON COLUMN profiles.store_status IS 'none | pending | approved | rejected';
