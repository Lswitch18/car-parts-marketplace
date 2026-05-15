-- =============================================================================
-- MIGRATION: Dimensões físicas para Armazém 3D
-- Adiciona colunas de dimensão e posicionamento para visualização 3D
-- =============================================================================

-- Dimensões físicas dos galpões
ALTER TABLE public.admin_armazens ADD COLUMN IF NOT EXISTS largura_m DECIMAL(6,1);
ALTER TABLE public.admin_armazens ADD COLUMN IF NOT EXISTS comprimento_m DECIMAL(6,1);
ALTER TABLE public.admin_armazens ADD COLUMN IF NOT EXISTS altura_m DECIMAL(4,1);
ALTER TABLE public.admin_armazens ADD COLUMN IF NOT EXISTS racks_linhas INT DEFAULT 6;
ALTER TABLE public.admin_armazens ADD COLUMN IF NOT EXISTS racks_colunas INT DEFAULT 10;

-- Posicionamento 3D das zonas dentro do armazém
ALTER TABLE public.admin_zonas ADD COLUMN IF NOT EXISTS pos_x INT;
ALTER TABLE public.admin_zonas ADD COLUMN IF NOT EXISTS pos_y INT;
ALTER TABLE public.admin_zonas ADD COLUMN IF NOT EXISTS tipo_visual VARCHAR(20) DEFAULT 'rack';

-- Atualizar dimensões dos 16 CDs japoneses
UPDATE public.admin_armazens SET
  largura_m = 80, comprimento_m = 120, altura_m = 12, racks_linhas = 8, racks_colunas = 15
WHERE id = 'a0000001-0000-0000-0000-000000000001';

UPDATE public.admin_armazens SET
  largura_m = 65, comprimento_m = 100, altura_m = 10, racks_linhas = 6, racks_colunas = 12
WHERE id = 'a0000001-0000-0000-0000-000000000002';

UPDATE public.admin_armazens SET
  largura_m = 70, comprimento_m = 80, altura_m = 10, racks_linhas = 6, racks_colunas = 10
WHERE id = 'a0000001-0000-0000-0000-000000000003';

UPDATE public.admin_armazens SET
  largura_m = 75, comprimento_m = 110, altura_m = 12, racks_linhas = 8, racks_colunas = 14
WHERE id = 'a0000001-0000-0000-0000-000000000004';

UPDATE public.admin_armazens SET
  largura_m = 60, comprimento_m = 90, altura_m = 10, racks_linhas = 6, racks_colunas = 10
WHERE id = 'a0000001-0000-0000-0000-000000000005';

UPDATE public.admin_armazens SET
  largura_m = 55, comprimento_m = 70, altura_m = 8, racks_linhas = 5, racks_colunas = 8
WHERE id = 'a0000001-0000-0000-0000-000000000006';

UPDATE public.admin_armazens SET
  largura_m = 50, comprimento_m = 60, altura_m = 8, racks_linhas = 4, racks_colunas = 7
WHERE id = 'a0000001-0000-0000-0000-000000000007';

UPDATE public.admin_armazens SET
  largura_m = 60, comprimento_m = 80, altura_m = 10, racks_linhas = 6, racks_colunas = 10
WHERE id = 'a0000001-0000-0000-0000-000000000008';

UPDATE public.admin_armazens SET
  largura_m = 90, comprimento_m = 140, altura_m = 14, racks_linhas = 10, racks_colunas = 18
WHERE id = 'a0000001-0000-0000-0000-000000000009';

UPDATE public.admin_armazens SET
  largura_m = 85, comprimento_m = 110, altura_m = 12, racks_linhas = 8, racks_colunas = 14
WHERE id = 'a0000001-0000-0000-0000-000000000010';

UPDATE public.admin_armazens SET
  largura_m = 75, comprimento_m = 100, altura_m = 12, racks_linhas = 8, racks_colunas = 12
WHERE id = 'a0000001-0000-0000-0000-000000000011';

UPDATE public.admin_armazens SET
  largura_m = 85, comprimento_m = 130, altura_m = 14, racks_linhas = 10, racks_colunas = 16
WHERE id = 'a0000001-0000-0000-0000-000000000012';

UPDATE public.admin_armazens SET
  largura_m = 80, comprimento_m = 105, altura_m = 12, racks_linhas = 8, racks_colunas = 13
WHERE id = 'a0000001-0000-0000-0000-000000000013';

UPDATE public.admin_armazens SET
  largura_m = 70, comprimento_m = 95, altura_m = 10, racks_linhas = 7, racks_colunas = 12
WHERE id = 'a0000001-0000-0000-0000-000000000014';

UPDATE public.admin_armazens SET
  largura_m = 90, comprimento_m = 130, altura_m = 14, racks_linhas = 10, racks_colunas = 16
WHERE id = 'a0000001-0000-0000-0000-000000000015';

UPDATE public.admin_armazens SET
  largura_m = 80, comprimento_m = 110, altura_m = 12, racks_linhas = 8, racks_colunas = 14
WHERE id = 'a0000001-0000-0000-0000-000000000016';

-- Posicionar zonas existentes em grid (distribuição automática)
UPDATE public.admin_zonas z SET
  pos_x = (row_num - 1) % COALESCE(a.racks_colunas, 10),
  pos_y = (row_num - 1) / COALESCE(a.racks_colunas, 10)
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY armazem_id ORDER BY nome) AS row_num
  FROM public.admin_zonas
) sub
JOIN public.admin_armazens a ON a.id = z.armazem_id
WHERE z.id = sub.id AND z.pos_x IS NULL;

SELECT '✅ Dimensões 3D aplicadas com sucesso!' AS status;
