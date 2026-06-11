-- ============================================================
-- Idempotência no fluxo de pagamento pós-proposta
-- Criado: 2026-06-11
-- ============================================================

-- 1. Coluna de chave de idempotência (hash determinístico gerado pelo frontend)
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

-- Garantia de unicidade: a mesma chave nunca gera duas transações
CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_idempotency_key
  ON public.transactions (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

-- 2. Referência à mensagem de proposta confirmada (auditoria + validação de preço)
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS confirmed_message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL;

-- 3. Índice parcial: impede segunda transação ativa para o mesmo (comprador, peça)
--    Apenas transações com status relevante são contadas (ignora falhas/canceladas)
CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_active_buyer_part
  ON public.transactions (buyer_id, part_id)
  WHERE payment_status IN ('pending', 'paid');

-- 4. Comentários de documentação
COMMENT ON COLUMN public.transactions.idempotency_key IS
  'Chave determinística gerada pelo frontend (hash de buyer_id+part_id+confirmed_message_id). Garante que reenvios/duplos cliques não criem transações duplicadas.';

COMMENT ON COLUMN public.transactions.confirmed_message_id IS
  'ID da mensagem de price_proposal confirmada que originou esta transação. Usado para validar o preço real negociado no backend.';
