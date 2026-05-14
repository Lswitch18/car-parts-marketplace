-- Adicionar transaction_id na tabela messages para vincular negociação → venda
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL;

-- Índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_messages_transaction_id ON public.messages(transaction_id);

-- Atualizar RLS para permitir leitura por comprador/vendedor da transação
DROP POLICY IF EXISTS "Messages transaction access" ON public.messages;
CREATE POLICY "Messages transaction access" ON public.messages FOR SELECT USING (
  transaction_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.transactions
    WHERE id = transaction_id
    AND (buyer_id = auth.uid() OR seller_id = auth.uid())
  )
);

-- Trigger para notificar criação de rastreamento via webhook (futuro)
-- CREATE OR REPLACE FUNCTION notify_tracking_update()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   PERFORM net.http_post(
--     url := current_setting('app.settings.notification_webhook'),
--     body := json_build_object('type', 'tracking_update', 'data', row_to_json(NEW))::text
--   );
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;
