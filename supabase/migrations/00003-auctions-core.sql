-- ============================================
-- Auctions Core Schema
-- Cria as colunas de auction na tabela parts
-- e uma function RPC para lances atômicos
-- ============================================

-- Adiciona colunas de auction core (caso não existam)
ALTER TABLE public.parts ADD COLUMN IF NOT EXISTS auction_enabled BOOLEAN DEFAULT false;
ALTER TABLE public.parts ADD COLUMN IF NOT EXISTS auction_start TIMESTAMPTZ;
ALTER TABLE public.parts ADD COLUMN IF NOT EXISTS auction_end TIMESTAMPTZ;
ALTER TABLE public.parts ADD COLUMN IF NOT EXISTS starting_bid NUMERIC;
ALTER TABLE public.parts ADD COLUMN IF NOT EXISTS current_bid NUMERIC;
ALTER TABLE public.parts ADD COLUMN IF NOT EXISTS buy_now_price NUMERIC;

-- ============================================
-- Function: place_bid (atômica, sem race condition)
-- Uso: SELECT * FROM place_bid(p_part_id, p_bidder_id, p_amount);
-- ============================================
CREATE OR REPLACE FUNCTION public.place_bid(
  p_part_id UUID,
  p_bidder_id UUID,
  p_amount NUMERIC
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_auction RECORD;
  v_min_bid NUMERIC;
  v_bid_id UUID;
  v_recent_bids JSONB;
BEGIN
  -- 1. Lock the auction row to prevent concurrent bids
  SELECT id, seller_id, current_bid, auction_end, status, starting_bid, buy_now_price
  INTO v_auction
  FROM public.parts
  WHERE id = p_part_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Leilão não encontrado');
  END IF;

  -- 2. Validate
  IF v_auction.status != 'active' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Leilão não está ativo');
  END IF;

  IF v_auction.auction_end < NOW() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Leilão encerrado');
  END IF;

  IF v_auction.seller_id = p_bidder_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Você não pode dar lance no seu próprio leilão');
  END IF;

  v_min_bid := v_auction.current_bid * 1.05;
  IF p_amount < v_min_bid THEN
    RETURN jsonb_build_object('success', false, 'error',
      'Lance mínimo: ¥' || ceil(v_min_bid)::TEXT);
  END IF;

  -- 3. Mark previous winning bid as not winning
  UPDATE public.bids SET is_winning = false
  WHERE part_id = p_part_id AND is_winning = true;

  -- 4. Insert new bid
  INSERT INTO public.bids (part_id, bidder_id, amount, is_winning)
  VALUES (p_part_id, p_bidder_id, p_amount, true)
  RETURNING id INTO v_bid_id;

  -- 5. Update auction current_bid (NO watchers column — removed)
  UPDATE public.parts SET current_bid = p_amount WHERE id = p_part_id;

  -- 6. Fetch recent bids
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', b.id,
      'amount', b.amount,
      'created_at', b.created_at,
      'bidder', jsonb_build_object(
        'id', p.id,
        'full_name', p.full_name,
        'avatar_url', p.avatar_url
      )
    ) ORDER BY b.created_at DESC
  ) INTO v_recent_bids
  FROM public.bids b
  LEFT JOIN public.profiles p ON p.id = b.bidder_id
  WHERE b.part_id = p_part_id
  LIMIT 10;

  RETURN jsonb_build_object(
    'success', true,
    'bid', jsonb_build_object('id', v_bid_id, 'amount', p_amount, 'is_winning', true),
    'current_bid', p_amount,
    'recent_bids', COALESCE(v_recent_bids, '[]'::jsonb)
  );
END;
$$;

-- ============================================
-- Function: resolve_auction (resolve um leilão expirado)
-- ============================================
CREATE OR REPLACE FUNCTION public.resolve_auction(p_part_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_auction RECORD;
  v_winning_bid RECORD;
  v_tx_id UUID;
  v_result JSONB;
BEGIN
  -- Lock and fetch
  SELECT id, seller_id, title, current_bid, starting_bid, status
  INTO v_auction
  FROM public.parts
  WHERE id = p_part_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Leilão não encontrado');
  END IF;

  IF v_auction.status != 'active' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Leilão já foi resolvido');
  END IF;

  -- Find winning bid
  SELECT id, bidder_id, amount
  INTO v_winning_bid
  FROM public.bids
  WHERE part_id = p_part_id AND is_winning = true
  LIMIT 1;

  IF FOUND THEN
    -- Create transaction
    INSERT INTO public.transactions (
      part_id, auction_id, bid_id, buyer_id, seller_id,
      amount, commission_rate, commission_amount,
      platform_fee, seller_net,
      payment_status, fulfillment_status
    ) VALUES (
      p_part_id, p_part_id, v_winning_bid.id, v_winning_bid.bidder_id, v_auction.seller_id,
      v_winning_bid.amount, 0.10, v_winning_bid.amount * 0.10,
      (v_winning_bid.amount * 0.10) + (v_winning_bid.amount * 0.029) + 30,
      v_winning_bid.amount - ((v_winning_bid.amount * 0.10) + (v_winning_bid.amount * 0.029) + 30),
      'pending', 'pending'
    )
    RETURNING id INTO v_tx_id;

    -- Update part with winner
    UPDATE public.parts SET
      status = 'ended',
      winning_bid_id = v_winning_bid.id,
      winner_id = v_winning_bid.bidder_id,
      resolved_at = NOW(),
      current_bid = v_winning_bid.amount
    WHERE id = p_part_id;

    -- Notify winner (silent fail)
    BEGIN
      INSERT INTO public.messages (sender_id, receiver_id, product_id, transaction_id, content, message_type)
      VALUES (v_auction.seller_id, v_winning_bid.bidder_id, p_part_id, v_tx_id,
        'Você venceu o leilão "' || v_auction.title || '"! Complete o pagamento.', 'system');
    EXCEPTION WHEN OTHERS THEN
      -- ignore
    END;

    RETURN jsonb_build_object(
      'success', true,
      'data', jsonb_build_object(
        'winner', jsonb_build_object('id', v_winning_bid.id, 'bidder_id', v_winning_bid.bidder_id, 'amount', v_winning_bid.amount),
        'transaction_id', v_tx_id,
        'status', 'ended'
      )
    );
  ELSE
    -- No bids — just mark as ended
    UPDATE public.parts SET status = 'ended', resolved_at = NOW()
    WHERE id = p_part_id;

    RETURN jsonb_build_object(
      'success', true,
      'data', jsonb_build_object('winner', null, 'status', 'ended_no_bids')
    );
  END IF;
END;
$$;
