-- =====================================================================
-- LOGISTIX - Tabelas de Rastreamento, Envio e Recebimento
-- Execute este arquivo no Supabase SQL Editor
-- =====================================================================

-- =====================================================================
-- 18. RASTREAMENTO (Tracking de pedidos)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.admin_rastreamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID NOT NULL REFERENCES public.admin_pedidos(id),
  tipo TEXT NOT NULL,
  descricao TEXT,
  local TEXT,
  status TEXT DEFAULT 'pendente',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS para rastreamento
ALTER TABLE public.admin_rastreamento ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access rastreamento" ON public.admin_rastreamento FOR ALL USING (
  auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- =====================================================================
-- 19. RECEBIMENTOS
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.admin_recebimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID NOT NULL REFERENCES public.admin_pedidos(id),
  armazem_id UUID REFERENCES public.admin_armazens(id),
  status TEXT DEFAULT 'pendente',
  observacoes TEXT,
  recebido_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS para recebimentos
ALTER TABLE public.admin_recebimentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access recebimentos" ON public.admin_recebimentos FOR ALL USING (
  auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- =====================================================================
-- ÍNDICES
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_rastreamento_pedido_id ON public.admin_rastreamento(pedido_id);
CREATE INDEX IF NOT EXISTS idx_rastreamento_created_at ON public.admin_rastreamento(created_at);
CREATE INDEX IF NOT EXISTS idx_recebimentos_pedido_id ON public.admin_recebimentos(pedido_id);
CREATE INDEX IF NOT EXISTS idx_recebimentos_armazem_id ON public.admin_recebimentos(armazem_id);

-- =====================================================================
-- SEED DATA - Eventos de rastreamento de exemplo
-- =====================================================================
-- Inserir alguns eventos de rastreamento para testes
INSERT INTO public.admin_rastreamento (pedido_id, tipo, descricao, local, status, created_at)
SELECT 
  p.id,
  CASE (random() * 4)::int
    WHEN 0 THEN 'CRIACAO'
    WHEN 1 THEN 'PROCESSAMENTO'
    WHEN 2 THEN 'ENVIO'
    WHEN 3 THEN 'ENTREGA'
    ELSE 'CRIACAO'
  END,
  CASE (random() * 4)::int
    WHEN 0 THEN 'Pedido criado no sistema'
    WHEN 1 THEN 'Pedido em processamento no armazém'
    WHEN 2 THEN 'Pedido remetido para transportadora'
    WHEN 3 THEN 'Pedido entregue ao destinatário'
    ELSE 'Pedido criado no sistema'
  END,
  'CD São Paulo',
  'pendente',
  p.created_at + (random() * interval '2 days')
FROM public.admin_pedidos p
WHERE p.status IN ('pendente', 'em_transito')
LIMIT 50
ON CONFLICT DO NOTHING;

-- =====================================================================
-- SEED DATA - Recebimentos de exemplo
-- =====================================================================
INSERT INTO public.admin_recebimentos (pedido_id, armazem_id, status, observacoes, recebido_em, created_at)
SELECT 
  p.id,
  p.armazem_origem_id,
  'recebido',
  'Recebimento confirmado via sistema',
  p.created_at + interval '1 day',
  p.created_at + interval '1 day'
FROM public.admin_pedidos p
WHERE p.status = 'recebido'
LIMIT 20
ON CONFLICT DO NOTHING;

-- =====================================================================
-- CONFIGURAÇÕES ADICIONAIS
-- =====================================================================
INSERT INTO public.admin_configuracoes (chave, valor) VALUES
  ('rastreamento_enabled', 'true'),
  ('etiqueta_formato', 'pdf'),
  ('codigo_barras_tipo', 'code128')
ON CONFLICT (chave) DO NOTHING;

-- =====================================================================
-- MENSAGEM DE SUCESSO
-- =====================================================================
SELECT 'Tabelas de rastreamento criadas com sucesso!' AS mensagem;