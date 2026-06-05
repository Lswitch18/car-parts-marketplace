-- ============================================
-- Auctions Mitigation — Race Condition Fixes
-- 1. Unique index p/ impedir transactions duplicadas
-- 2. resolve_auction: lock transactions antes de INSERT
-- 3. RPC buy_now: atômica com FOR UPDATE
-- ============================================

-- ═══════════════════════════════════════════════
-- 1. Unique index (rede de segurança no banco)
-- ═══════════════════════════════════════════════
CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_auction_bid
  ON public.transactions(auction_id, bid_id)
  WHERE auction_id IS NOT NULL;

-- ═══════════════════════════════════════════════
-- 2. resolve_auction — versão com lock preventivo
-- ═══════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.resolve_auction(p_part_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_auction RECORD;
  v_winning_bid RECORD;
  v_existing_tx RECORD;
  v_tx_id UUID;
BEGIN
  -- Lock the auction row
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

  -- Pre-check: já existe transação? (anti-race)
  SELECT id INTO v_existing_tx
  FROM public.transactions
  WHERE auction_id = p_part_id
  LIMIT 1
  FOR UPDATE;

  IF FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Leilão já possui transação');
  END IF;

  -- Find winning bid
  SELECT id, bidder_id, amount
  INTO v_winning_bid
  FROM public.bids
  WHERE part_id = p_part_id AND is_winning = true
  LIMIT 1;

  IF FOUND THEN
    -- Create transaction (unique index garante não duplicar)
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

-- ═══════════════════════════════════════════════
-- 3. RPC buy_now — atômica com FOR UPDATE
-- Uso: SELECT * FROM buy_now(p_part_id, p_buyer_id);
-- ═══════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.buy_now(
  p_part_id UUID,
  p_buyer_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_auction RECORD;
  v_existing_tx RECORD;
  v_tx_id UUID;
  v_commission NUMERIC;
  v_stripe_fee NUMERIC;
  v_platform_fee NUMERIC;
  v_seller_net NUMERIC;
BEGIN
  -- Lock the auction row
  SELECT id, seller_id, buy_now_price, buy_now_enabled, status, title
  INTO v_auction
  FROM public.parts
  WHERE id = p_part_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Leilão não encontrado');
  END IF;

  -- Validações
  IF v_auction.status != 'active' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Leilão não está ativo');
  END IF;

  IF v_auction.buy_now_price IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Este leilão não tem preço de compra imediata');
  END IF;

  IF v_auction.buy_now_enabled IS FALSE THEN
    RETURN jsonb_build_object('success', false, 'error', 'Compra imediata não disponível');
  END IF;

  IF v_auction.seller_id = p_buyer_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Você não pode comprar sua própria peça');
  END IF;

  -- Pre-check: já existe transação?
  SELECT id INTO v_existing_tx
  FROM public.transactions
  WHERE auction_id = p_part_id
  LIMIT 1
  FOR UPDATE;

  IF FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Este leilão já foi comprado');
  END IF;

  -- Calcula fees
  v_commission := v_auction.buy_now_price * 0.10;
  v_stripe_fee := (v_auction.buy_now_price * 0.029) + 30;
  v_platform_fee := v_commission + v_stripe_fee;
  v_seller_net := v_auction.buy_now_price - v_platform_fee;

  -- Insere transaction
  INSERT INTO public.transactions (
    part_id, auction_id, buyer_id, seller_id,
    amount, commission_rate, commission_amount,
    platform_fee, seller_net,
    payment_status, fulfillment_status
  ) VALUES (
    p_part_id, p_part_id, p_buyer_id, v_auction.seller_id,
    v_auction.buy_now_price, 0.10, v_commission,
    v_platform_fee, v_seller_net,
    'pending', 'pending'
  )
  RETURNING id INTO v_tx_id;

  -- Marca como sold (não 'pending' — não some do histórico)
  UPDATE public.parts SET
    status = 'sold',
    winner_id = p_buyer_id,
    resolved_at = NOW()
  WHERE id = p_part_id;

  RETURN jsonb_build_object(
    'success', true,
    'transaction', jsonb_build_object('id', v_tx_id, 'amount', v_auction.buy_now_price),
    'fees', jsonb_build_object(
      'gross_amount', v_auction.buy_now_price,
      'commission_amount', v_commission,
      'stripe_fee', v_stripe_fee,
      'platform_fee', v_platform_fee,
      'seller_net', v_seller_net
    )
  );
END;
$$;
