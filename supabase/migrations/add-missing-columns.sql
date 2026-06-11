-- ============================================================
-- Add missing columns to transactions table
-- Colunas necessárias para o Edge Function transactions/index.ts
-- e migrations anteriores não aplicadas
-- ============================================================

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS commission_rate NUMERIC,
  ADD COLUMN IF NOT EXISTS commission_amount NUMERIC,
  ADD COLUMN IF NOT EXISTS platform_fee NUMERIC,
  ADD COLUMN IF NOT EXISTS seller_net NUMERIC;

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS shipping_name TEXT,
  ADD COLUMN IF NOT EXISTS shipping_email TEXT,
  ADD COLUMN IF NOT EXISTS shipping_phone TEXT,
  ADD COLUMN IF NOT EXISTS shipping_address TEXT,
  ADD COLUMN IF NOT EXISTS shipping_city TEXT,
  ADD COLUMN IF NOT EXISTS shipping_state TEXT,
  ADD COLUMN IF NOT EXISTS shipping_zip TEXT;

ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS auction_id UUID REFERENCES public.parts(id),
  ADD COLUMN IF NOT EXISTS bid_id UUID REFERENCES public.bids(id);

-- Stripe account columns on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_account_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_onboarding_complete BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.transactions.commission_rate IS 'Taxa de comissão aplicada (ex: 0.10 = 10%%)';
COMMENT ON COLUMN public.transactions.commission_amount IS 'Valor da comissão em yen';
COMMENT ON COLUMN public.transactions.platform_fee IS 'Taxa total da plataforma (comissão + stripe fee)';
COMMENT ON COLUMN public.transactions.seller_net IS 'Valor líquido que o vendedor recebe';
