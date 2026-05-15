-- =============================================================================
-- MIGRATION: Custos Logísticos
-- Tabela de parâmetros de custo + logs de cálculo
-- =============================================================================

-- Parâmetros de custo configuráveis por armazém
CREATE TABLE IF NOT EXISTS public.admin_custos_parametros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  armazem_id UUID REFERENCES public.admin_armazens(id) ON DELETE CASCADE,
  custo_por_entrega DECIMAL(10,2) NOT NULL DEFAULT 25.00,
  custo_mensal_motorista DECIMAL(10,2) NOT NULL DEFAULT 2500.00,
  custo_por_km DECIMAL(8,2) NOT NULL DEFAULT 1.50,
  custo_por_dropoff DECIMAL(8,2) NOT NULL DEFAULT 8.00,
  custo_fixo_mensal_armazem DECIMAL(12,2) NOT NULL DEFAULT 50000.00,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Log de cálculos de custo (histórico)
CREATE TABLE IF NOT EXISTS public.admin_custos_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  periodo TEXT NOT NULL, -- 'YYYY-MM'
  custo_entregas DECIMAL(12,2) DEFAULT 0,
  custo_motoristas DECIMAL(12,2) DEFAULT 0,
  custo_deslocamento DECIMAL(12,2) DEFAULT 0,
  custo_dropoffs DECIMAL(12,2) DEFAULT 0,
  custo_fixo_armazens DECIMAL(12,2) DEFAULT 0,
  custo_total DECIMAL(12,2) DEFAULT 0,
  qtd_entregas INT DEFAULT 0,
  qtd_motoristas INT DEFAULT 0,
  qtd_dropoffs INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Inserir parâmetros padrão para cada CD
INSERT INTO public.admin_custos_parametros (armazem_id, custo_por_entrega, custo_mensal_motorista, custo_por_km, custo_por_dropoff, custo_fixo_mensal_armazem)
SELECT id, 25.00, 2500.00, 1.50, 8.00, 50000.00
FROM public.admin_armazens
WHERE nome NOT LIKE 'Ag %'
AND NOT EXISTS (SELECT 1 FROM public.admin_custos_parametros WHERE armazem_id = admin_armazens.id);

SELECT '✅ Custos logísticos configurados' AS status;
