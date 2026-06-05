-- ============================================
-- Auctions Schema Fix — Foreign Keys + Refresh
-- 1. Cria tabela bids (se não existir)
-- 2. Adiciona FKs: bids.part_id → parts, bids.bidder_id → profiles
-- 3. Garante FK parts.winning_bid_id → bids(id)
-- 4. Cria índices essenciais
-- 5. Recarrega schema cache do PostgREST
-- ============================================

-- ═══════════════════════════════════════════════
-- 1. Cria tabela bids (caso não exista)
-- ═══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.bids (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  part_id UUID NOT NULL REFERENCES public.parts(id) ON DELETE CASCADE,
  bidder_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  is_winning BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════
-- 2. Garante FKs (caso tabela já existisse sem elas)
-- ═══════════════════════════════════════════════
ALTER TABLE public.bids
  DROP CONSTRAINT IF EXISTS fk_bids_part,
  ADD CONSTRAINT fk_bids_part
  FOREIGN KEY (part_id) REFERENCES public.parts(id)
  ON DELETE CASCADE;

ALTER TABLE public.bids
  DROP CONSTRAINT IF EXISTS fk_bids_bidder,
  ADD CONSTRAINT fk_bids_bidder
  FOREIGN KEY (bidder_id) REFERENCES public.profiles(id)
  ON DELETE CASCADE;

-- ═══════════════════════════════════════════════
-- 3. Garante FK parts.winning_bid_id → bids(id)
-- ═══════════════════════════════════════════════
ALTER TABLE public.parts
  DROP CONSTRAINT IF EXISTS fk_parts_winning_bid,
  ADD CONSTRAINT fk_parts_winning_bid
  FOREIGN KEY (winning_bid_id) REFERENCES public.bids(id)
  ON DELETE SET NULL;

-- ═══════════════════════════════════════════════
-- 4. Índices
-- ═══════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_bids_part_id ON public.bids(part_id);
CREATE INDEX IF NOT EXISTS idx_bids_bidder_id ON public.bids(bidder_id);
CREATE INDEX IF NOT EXISTS idx_bids_created_at ON public.bids(created_at DESC);

-- ═══════════════════════════════════════════════
-- 5. Recarrega schema cache do PostgREST
-- (permite join bids(count) nas queries)
-- ═══════════════════════════════════════════════
NOTIFY pgrst, 'reload schema';
