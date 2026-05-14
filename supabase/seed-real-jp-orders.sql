-- =============================================================================
-- LIMPA DADOS MOCKADOS DO BRASIL E CRIA DADOS REAIS DO JAPÃO
-- =============================================================================

-- 1. Remove rastreamento de pedidos mockados
DELETE FROM public.admin_rastreamento WHERE pedido_id IN (
  SELECT id FROM public.admin_pedidos WHERE codigo NOT LIKE '#JP%'
);

-- 2. Remove entregas de pedidos mockados
DELETE FROM public.admin_entregas WHERE pedido_id IN (
  SELECT id FROM public.admin_pedidos WHERE codigo NOT LIKE '#JP%'
);

-- 3. Remove ocorrências de pedidos mockados
DELETE FROM public.admin_ocorrencias WHERE pedido_id IN (
  SELECT id FROM public.admin_pedidos WHERE codigo NOT LIKE '#JP%'
);

-- 4. Remove coletas de pedidos mockados
DELETE FROM public.admin_coletas WHERE pedido_id IN (
  SELECT id FROM public.admin_pedidos WHERE codigo NOT LIKE '#JP%'
);

-- 5. Remove os pedidos mockados
DELETE FROM public.admin_pedidos WHERE codigo NOT LIKE '#JP%';

-- 6. Remove clientes brasileiros
DELETE FROM public.admin_clientes WHERE nome IN (
  'Amazon', 'Americanas', 'Casas Bahia', 'Magazine Luiza',
  'Mercado Livre', 'Netshoes', 'Shopee'
);

-- =============================================================================
-- CRIA PEDIDOS REAIS NO JAPÃO
-- =============================================================================

-- Entrega 1: Nismo (Yokohama) compra do CD Yokohama - Porto
INSERT INTO public.admin_pedidos (id, codigo, cliente_id, armazem_origem_id, destino_cidade, destino_estado, status, peso_kg, valor, previsao)
SELECT * FROM (VALUES
  ('d0000001-0000-0000-0000-000000000101'::uuid, '#JP-PED-101', 'c0000001-0000-0000-0000-000000000001'::uuid, 'a0000001-0000-0000-0000-000000000001'::uuid, 'Yokohama', 'Kanagawa', 'pendente', 45.0, 1250000, NOW() + INTERVAL '3 days'),
  ('d0000001-0000-0000-0000-000000000102'::uuid, '#JP-PED-102', 'c0000001-0000-0000-0000-000000000002'::uuid, 'a0000001-0000-0000-0000-000000000004'::uuid, 'Nagoya', 'Aichi', 'pendente', 32.0, 980000, NOW() + INTERVAL '2 days'),
  ('d0000001-0000-0000-0000-000000000103'::uuid, '#JP-PED-103', 'c0000001-0000-0000-0000-000000000003'::uuid, 'a0000001-0000-0000-0000-000000000002'::uuid, 'Tóquio', 'Tokyo', 'pendente', 18.5, 750000, NOW() + INTERVAL '4 days'),
  ('d0000001-0000-0000-0000-000000000104'::uuid, '#JP-PED-104', 'c0000001-0000-0000-0000-000000000004'::uuid, 'a0000001-0000-0000-0000-000000000003'::uuid, 'Hiroshima', 'Hiroshima', 'pendente', 28.0, 420000, NOW() + INTERVAL '5 days'),
  ('d0000001-0000-0000-0000-000000000105'::uuid, '#JP-PED-105', 'c0000001-0000-0000-0000-000000000005'::uuid, 'a0000001-0000-0000-0000-000000000002'::uuid, 'Mitaka', 'Tokyo', 'pendente', 12.0, 620000, NOW() + INTERVAL '2 days'),
  ('d0000001-0000-0000-0000-000000000106'::uuid, '#JP-PED-106', 'c0000001-0000-0000-0000-000000000006'::uuid, 'a0000001-0000-0000-0000-000000000001'::uuid, 'Fuji', 'Shizuoka', 'pendente', 55.0, 2100000, NOW() + INTERVAL '6 days'),
  ('d0000001-0000-0000-0000-000000000107'::uuid, '#JP-PED-107', 'c0000001-0000-0000-0000-000000000007'::uuid, 'a0000001-0000-0000-0000-000000000003'::uuid, 'Osaka', 'Osaka', 'pendente', 9.5, 385000, NOW() + INTERVAL '1 day'),
  ('d0000001-0000-0000-0000-000000000108'::uuid, '#JP-PED-108', 'c0000001-0000-0000-0000-000000000008'::uuid, 'a0000001-0000-0000-0000-000000000002'::uuid, 'Tóquio', 'Tokyo', 'pendente', 22.0, 890000, NOW() + INTERVAL '3 days'),
  ('d0000001-0000-0000-0000-000000000109'::uuid, '#JP-PED-109', 'c0000001-0000-0000-0000-000000000009'::uuid, 'a0000001-0000-0000-0000-000000000002'::uuid, 'Tóquio', 'Tokyo', 'pendente', 15.0, 510000, NOW() + INTERVAL '4 days'),
  ('d0000001-0000-0000-0000-000000000110'::uuid, '#JP-PED-110', 'c0000001-0000-0000-0000-000000000010'::uuid, 'a0000001-0000-0000-0000-000000000001'::uuid, 'Yokohama', 'Kanagawa', 'pendente', 40.0, 1550000, NOW() + INTERVAL '3 days'),
  ('d0000001-0000-0000-0000-000000000111'::uuid, '#JP-PED-111', 'c0000001-0000-0000-0000-000000000011'::uuid, 'a0000001-0000-0000-0000-000000000011'::uuid, 'Tóquio', 'Tokyo', 'pendente', 65.0, 2800000, NOW() + INTERVAL '5 days'),
  ('d0000001-0000-0000-0000-000000000112'::uuid, '#JP-PED-112', 'c0000001-0000-0000-0000-000000000012'::uuid, 'a0000001-0000-0000-0000-000000000003'::uuid, 'Osaka', 'Osaka', 'pendente', 75.0, 3200000, NOW() + INTERVAL '7 days'),
  ('d0000001-0000-0000-0000-000000000113'::uuid, '#JP-PED-113', 'c0000001-0000-0000-0000-000000000013'::uuid, 'a0000001-0000-0000-0000-000000000009'::uuid, 'Tóquio', 'Tokyo', 'pendente', 8.0, 290000, NOW() + INTERVAL '2 days'),
  ('d0000001-0000-0000-0000-000000000114'::uuid, '#JP-PED-114', 'c0000001-0000-0000-0000-000000000014'::uuid, 'a0000001-0000-0000-0000-000000000001'::uuid, 'Yokohama', 'Kanagawa', 'pendente', 35.0, 1100000, NOW() + INTERVAL '4 days'),
  ('d0000001-0000-0000-0000-000000000115'::uuid, '#JP-PED-115', 'c0000001-0000-0000-0000-000000000015'::uuid, 'a0000001-0000-0000-0000-000000000012'::uuid, 'Chiba', 'Chiba', 'pendente', 20.0, 680000, NOW() + INTERVAL '3 days')
) AS src(id, codigo, cliente_id, armazem_origem_id, destino_cidade, destino_estado, status, peso_kg, valor, previsao)
WHERE NOT EXISTS (SELECT 1 FROM public.admin_pedidos WHERE id = src.id);

-- =============================================================================
-- RASTREAMENTO EM JAPONÊS
-- =============================================================================

INSERT INTO public.admin_rastreamento (id, pedido_id, tipo, descricao, local, status, created_at)
SELECT * FROM (VALUES
  -- PED-101: Nismo (Yokohama)
  ('d0000002-0000-0000-0000-000000000101'::uuid, 'd0000001-0000-0000-0000-000000000101'::uuid, 'COLETA', 'Coleta realizada no CD Yokohama - Porto', 'Yokohama, Kanagawa', 'coletado', NOW() - INTERVAL '1 day'),
  ('d0000002-0000-0000-0000-000000000102'::uuid, 'd0000001-0000-0000-0000-000000000101'::uuid, 'TRIAGEM', 'Pedido em triagem no centro de distribuição', 'Yokohama, Kanagawa', 'em_triagem', NOW() - INTERVAL '12 hours'),

  -- PED-102: TRD (Nagoya)
  ('d0000002-0000-0000-0000-000000000103'::uuid, 'd0000001-0000-0000-0000-000000000102'::uuid, 'COLETA', 'Coleta realizada no CD Nagoya - Toyota', 'Nagoya, Aichi', 'coletado', NOW() - INTERVAL '2 days'),
  ('d0000002-0000-0000-0000-000000000104'::uuid, 'd0000001-0000-0000-0000-000000000102'::uuid, 'ENVIO', 'Saiu para entrega - Yamato Transport', 'Nagoya → Toyota', 'em_transito', NOW() - INTERVAL '1 day'),

  -- PED-103: Mugen (Honda) - Tóquio
  ('d0000002-0000-0000-0000-000000000105'::uuid, 'd0000001-0000-0000-0000-000000000103'::uuid, 'COLETA', 'Coleta no CD Tóquio - Adachi', 'Adachi, Tokyo', 'coletado', NOW() - INTERVAL '3 days'),
  ('d0000002-0000-0000-0000-000000000106'::uuid, 'd0000001-0000-0000-0000-000000000103'::uuid, 'TRIAGEM', 'Em processamento no hub Yamato Tokyo', 'Arakawa, Tokyo', 'em_triagem', NOW() - INTERVAL '2 days'),
  ('d0000002-0000-0000-0000-000000000107'::uuid, 'd0000001-0000-0000-0000-000000000103'::uuid, 'ENVIO', 'Saiu para entrega final', 'Tokyo', 'em_transito', NOW() - INTERVAL '6 hours'),

  -- PED-107: GReddy (Osaka) - entrega rápida local
  ('d0000002-0000-0000-0000-000000000108'::uuid, 'd0000001-0000-0000-0000-000000000107'::uuid, 'COLETA', 'Coleta no CD Osaka - Porto Sul', 'Osaka', 'coletado', NOW() - INTERVAL '5 hours'),
  ('d0000002-0000-0000-0000-000000000109'::uuid, 'd0000001-0000-0000-0000-000000000107'::uuid, 'ENVIO', 'Saiu para entrega - Sagawa Express', 'Osaka', 'em_transito', NOW() - INTERVAL '2 hours'),

  -- PED-112: Rays Engineering (Osaka) - carga grande
  ('d0000002-0000-0000-0000-000000000110'::uuid, 'd0000001-0000-0000-0000-000000000112'::uuid, 'COLETA', 'Coleta no CD Osaka - Porto Sul', 'Osaka', 'coletado', NOW() - INTERVAL '4 days'),
  ('d0000002-0000-0000-0000-000000000111'::uuid, 'd0000001-0000-0000-0000-000000000112'::uuid, 'TRIAGEM', 'Em processamento -包裹 triagem', 'Osaka', 'em_triagem', NOW() - INTERVAL '3 days'),
  ('d0000002-0000-0000-0000-000000000112'::uuid, 'd0000001-0000-0000-0000-000000000112'::uuid, 'ENVIO', 'Saiu para entrega - Nippon Express', 'Osaka', 'em_transito', NOW() - INTERVAL '1 day'),

  -- PED-111: Endless (Freios) - Tóquio via Yamato
  ('d0000002-0000-0000-0000-000000000113'::uuid, 'd0000001-0000-0000-0000-000000000111'::uuid, 'COLETA', 'Coleta no CD Yamato - Nagoya Hub', 'Nagoya, Aichi', 'coletado', NOW() - INTERVAL '5 days'),
  ('d0000002-0000-0000-0000-000000000114'::uuid, 'd0000001-0000-0000-0000-000000000111'::uuid, 'TRIAGEM', 'Em processamento no hub Yamato Nagoya', 'Nagoya, Aichi', 'em_triagem', NOW() - INTERVAL '4 days'),
  ('d0000002-0000-0000-0000-000000000115'::uuid, 'd0000001-0000-0000-0000-000000000111'::uuid, 'ENVIO', 'Saiu para entrega - Yamato Transport', 'Nagoya → Tokyo', 'em_transito', NOW() - INTERVAL '2 days'),

  -- PED-106: HKS (Fuji/Shizuoka)
  ('d0000002-0000-0000-0000-000000000116'::uuid, 'd0000001-0000-0000-0000-000000000106'::uuid, 'COLETA', 'Coleta no CD Yokohama - Porto', 'Yokohama, Kanagawa', 'coletado', NOW() - INTERVAL '6 days'),

  -- PED-115: Top Secret (Chiba)
  ('d0000002-0000-0000-0000-000000000117'::uuid, 'd0000001-0000-0000-0000-000000000115'::uuid, 'COLETA', 'Coleta no CD Sagawa - Tokyo Hub', 'Tokyo', 'coletado', NOW() - INTERVAL '2 days'),
  ('d0000002-0000-0000-0000-000000000118'::uuid, 'd0000001-0000-0000-0000-000000000115'::uuid, 'ENVIO', 'Saiu para entrega - Sagawa Express', 'Tokyo → Chiba', 'em_transito', NOW() - INTERVAL '1 day')
) AS src(id, pedido_id, tipo, descricao, local, status, created_at)
WHERE NOT EXISTS (SELECT 1 FROM public.admin_rastreamento WHERE id = src.id);

SELECT '✅ DADOS LIMPOS E REAIS DO JAPÃO' AS status;
SELECT COUNT(*) AS total_pedidos FROM public.admin_pedidos WHERE codigo LIKE '#JP%';
SELECT COUNT(*) AS total_rastreamento FROM public.admin_rastreamento;
SELECT json_agg(json_build_object('codigo', codigo, 'cliente', c.nome, 'origem', a.nome, 'destino', destino_cidade || '/' || destino_estado, 'status', p.status) ORDER BY codigo)
FROM public.admin_pedidos p
LEFT JOIN public.admin_clientes c ON c.id = p.cliente_id
LEFT JOIN public.admin_armazens a ON a.id = p.armazem_origem_id
WHERE p.codigo LIKE '#JP%';
