-- Remove centros de distribuição brasileiros
DELETE FROM public.admin_armazens WHERE nome LIKE 'CD %' AND estado IN ('SP', 'RJ', 'MG', 'PR', 'BA', 'RS', 'SC', 'PE', 'CE', 'GO');

-- Remove qualquer outro que não seja japonês (se já rodou seed-jp-data.sql, latitude preenchida = JP)
DELETE FROM public.admin_armazens WHERE latitude IS NULL;

-- Confirmação
SELECT id, nome, cidade, estado, pais, latitude FROM public.admin_armazens ORDER BY nome;
