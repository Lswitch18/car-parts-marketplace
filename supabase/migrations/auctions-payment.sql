-- ============================================
-- Auctions Payment Architecture
-- Adds auction_id to transactions, winner tracking
-- on parts, and RLS policies for bids
-- ============================================

-- Add auction columns to parts (if missing)
ALTER TABLE public.parts ADD COLUMN IF NOT EXISTS winning_bid_id UUID REFERENCES public.bids(id);
ALTER TABLE public.parts ADD COLUMN IF NOT EXISTS winner_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.parts ADD COLUMN IF NOT EXISTS winner_notified BOOLEAN DEFAULT false;
ALTER TABLE public.parts ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;
ALTER TABLE public.parts ADD COLUMN IF NOT EXISTS buy_now_enabled BOOLEAN DEFAULT true;

-- Add auction_id to transactions
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS auction_id UUID REFERENCES public.parts(id);
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS bid_id UUID REFERENCES public.bids(id);

-- Index for auction resolution queries
CREATE INDEX IF NOT EXISTS idx_parts_auction_end ON public.parts(auction_end) WHERE auction_enabled = true AND status = 'active';
CREATE INDEX IF NOT EXISTS idx_parts_winner ON public.parts(winner_id) WHERE winner_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_auction ON public.transactions(auction_id) WHERE auction_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bids_part_winning ON public.bids(part_id, is_winning) WHERE is_winning = true;

-- Enable RLS on bids
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

-- RLS: anyone can read bids
CREATE POLICY "Bids são públicas para leitura"
  ON public.bids FOR SELECT
  USING (true);

-- RLS: authenticated users can insert bids (validated by edge function)
CREATE POLICY "Usuários autenticados podem criar lances"
  ON public.bids FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- RLS: only edge function (service role) can update bids
CREATE POLICY "Apenas service role pode atualizar lances"
  ON public.bids FOR UPDATE
  USING (auth.role() = 'service_role');
