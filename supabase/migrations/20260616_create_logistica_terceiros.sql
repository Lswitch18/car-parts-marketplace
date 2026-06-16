-- =============================================================================
-- MIGRATION: Cadastro de Terceiros e Valores de Contrato
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.admin_logistica_terceiros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'transportadora', -- 'transportadora', 'motoboy', 'armazem_terceirizado', 'outro'
  valor_contrato DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  periodo TEXT NOT NULL DEFAULT 'mensal', -- 'mensal', 'anual'
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_logistica_terceiros ENABLE ROW LEVEL SECURITY;

-- Permissive policy for administration & development
DROP POLICY IF EXISTS "Allow all on admin_logistica_terceiros" ON public.admin_logistica_terceiros;
CREATE POLICY "Allow all on admin_logistica_terceiros" ON public.admin_logistica_terceiros FOR ALL USING (true) WITH CHECK (true);

-- Seed initial data
INSERT INTO public.admin_logistica_terceiros (nome, tipo, valor_contrato, periodo, ativo)
VALUES 
  ('Sagawa Express', 'transportadora', 45000.00, 'mensal', true),
  ('Yamato Transport', 'transportadora', 60000.00, 'mensal', true),
  ('JP Post (Japan Post)', 'transportadora', 35000.00, 'mensal', true),
  ('Motoboys Locais Tokyo', 'motoboy', 12000.00, 'mensal', true)
ON CONFLICT DO NOTHING;
