-- Seed: Zonas para todos os CDs e Agências
-- Gera zonas RECEBIMENTO, PICKING, SEPARACAO, EXPEDICAO, ARMAZENAGEM

INSERT INTO public.admin_zonas (armazem_id, nome, tipo, capacidade, ocupacao, ativo, pos_x, pos_y, tipo_visual)
SELECT * FROM (VALUES
  -- CD Yokohama - Porto (8x15)
  ('a0000001-0000-0000-0000-000000000001'::uuid, 'RECEBIMENTO', 'RECEBIMENTO', 1200, 480, true, 0, 0, 'dock'),
  ('a0000001-0000-0000-0000-000000000001'::uuid, 'PICKING A', 'PICKING', 2000, 920, true, 1, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000001'::uuid, 'PICKING B', 'PICKING', 2000, 1100, true, 2, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000001'::uuid, 'SEPARACAO', 'SEPARACAO', 800, 340, true, 0, 1, 'rack'),
  ('a0000001-0000-0000-0000-000000000001'::uuid, 'EXPEDICAO', 'EXPEDICAO', 1000, 560, true, 1, 1, 'dock'),
  ('a0000001-0000-0000-0000-000000000001'::uuid, 'RESERVA', 'ARMAZENAGEM', 1000, 180, true, 7, 0, 'rack'),

  -- CD Tóquio - Adachi (6x12)
  ('a0000001-0000-0000-0000-000000000002'::uuid, 'RECEBIMENTO', 'RECEBIMENTO', 1000, 410, true, 0, 0, 'dock'),
  ('a0000001-0000-0000-0000-000000000002'::uuid, 'PICKING A', 'PICKING', 1800, 820, true, 1, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000002'::uuid, 'PICKING B', 'PICKING', 1800, 960, true, 2, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000002'::uuid, 'SEPARACAO', 'SEPARACAO', 600, 280, true, 3, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000002'::uuid, 'EXPEDICAO', 'EXPEDICAO', 800, 430, true, 0, 1, 'dock'),
  ('a0000001-0000-0000-0000-000000000002'::uuid, 'RESERVA', 'ARMAZENAGEM', 800, 200, true, 5, 0, 'rack'),

  -- CD Osaka - Porto Sul (6x10)
  ('a0000001-0000-0000-0000-000000000003'::uuid, 'RECEBIMENTO', 'RECEBIMENTO', 800, 320, true, 0, 0, 'dock'),
  ('a0000001-0000-0000-0000-000000000003'::uuid, 'PICKING A', 'PICKING', 1500, 680, true, 1, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000003'::uuid, 'PICKING B', 'PICKING', 1500, 790, true, 2, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000003'::uuid, 'SEPARACAO', 'SEPARACAO', 500, 210, true, 3, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000003'::uuid, 'EXPEDICAO', 'EXPEDICAO', 700, 380, true, 0, 1, 'dock'),
  ('a0000001-0000-0000-0000-000000000003'::uuid, 'RESERVA', 'ARMAZENAGEM', 600, 110, true, 5, 0, 'rack'),

  -- CD Nagoya - Toyota (8x14)
  ('a0000001-0000-0000-0000-000000000004'::uuid, 'RECEBIMENTO', 'RECEBIMENTO', 1100, 480, true, 0, 0, 'dock'),
  ('a0000001-0000-0000-0000-000000000004'::uuid, 'PICKING A', 'PICKING', 2000, 960, true, 1, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000004'::uuid, 'PICKING B', 'PICKING', 2000, 1100, true, 2, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000004'::uuid, 'SEPARACAO', 'SEPARACAO', 700, 310, true, 3, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000004'::uuid, 'EXPEDICAO', 'EXPEDICAO', 900, 540, true, 7, 0, 'dock'),
  ('a0000001-0000-0000-0000-000000000004'::uuid, 'RESERVA', 'ARMAZENAGEM', 800, 220, true, 4, 0, 'rack'),

  -- CD Kobe - Porto Leste (6x10)
  ('a0000001-0000-0000-0000-000000000005'::uuid, 'RECEBIMENTO', 'RECEBIMENTO', 700, 290, true, 0, 0, 'dock'),
  ('a0000001-0000-0000-0000-000000000005'::uuid, 'PICKING A', 'PICKING', 1300, 580, true, 1, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000005'::uuid, 'PICKING B', 'PICKING', 1300, 680, true, 2, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000005'::uuid, 'SEPARACAO', 'SEPARACAO', 500, 190, true, 3, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000005'::uuid, 'EXPEDICAO', 'EXPEDICAO', 600, 320, true, 4, 0, 'dock'),
  ('a0000001-0000-0000-0000-000000000005'::uuid, 'RESERVA', 'ARMAZENAGEM', 500, 100, true, 5, 0, 'rack'),

  -- CD Fukuoka - Hakata (5x8)
  ('a0000001-0000-0000-0000-000000000006'::uuid, 'RECEBIMENTO', 'RECEBIMENTO', 500, 180, true, 0, 0, 'dock'),
  ('a0000001-0000-0000-0000-000000000006'::uuid, 'PICKING A', 'PICKING', 1000, 450, true, 1, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000006'::uuid, 'PICKING B', 'PICKING', 1000, 520, true, 2, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000006'::uuid, 'SEPARACAO', 'SEPARACAO', 400, 150, true, 3, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000006'::uuid, 'EXPEDICAO', 'EXPEDICAO', 400, 210, true, 0, 1, 'dock'),
  ('a0000001-0000-0000-0000-000000000006'::uuid, 'RESERVA', 'ARMAZENAGEM', 300, 80, true, 4, 0, 'rack'),

  -- CD Sapporo - Atsubetsu (4x7)
  ('a0000001-0000-0000-0000-000000000007'::uuid, 'RECEBIMENTO', 'RECEBIMENTO', 400, 120, true, 0, 0, 'dock'),
  ('a0000001-0000-0000-0000-000000000007'::uuid, 'PICKING', 'PICKING', 800, 350, true, 1, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000007'::uuid, 'SEPARACAO', 'SEPARACAO', 300, 110, true, 2, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000007'::uuid, 'EXPEDICAO', 'EXPEDICAO', 300, 160, true, 3, 0, 'dock'),
  ('a0000001-0000-0000-0000-000000000007'::uuid, 'ARMAZENAGEM', 'ARMAZENAGEM', 500, 200, true, 0, 1, 'rack'),

  -- CD Haneda (6x10)
  ('a0000001-0000-0000-0000-000000000008'::uuid, 'RECEBIMENTO', 'RECEBIMENTO', 600, 310, true, 0, 0, 'dock'),
  ('a0000001-0000-0000-0000-000000000008'::uuid, 'PICKING A', 'PICKING', 1200, 580, true, 1, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000008'::uuid, 'PICKING B', 'PICKING', 1200, 680, true, 2, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000008'::uuid, 'SEPARACAO', 'SEPARACAO', 400, 200, true, 3, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000008'::uuid, 'EXPEDICAO', 'EXPEDICAO', 500, 310, true, 4, 0, 'dock'),
  ('a0000001-0000-0000-0000-000000000008'::uuid, 'RESERVA', 'ARMAZENAGEM', 400, 120, true, 5, 0, 'rack'),

  -- CD Yamato - Tokyo Hub (10x18)
  ('a0000001-0000-0000-0000-000000000009'::uuid, 'RECEBIMENTO', 'RECEBIMENTO', 1800, 840, true, 0, 0, 'dock'),
  ('a0000001-0000-0000-0000-000000000009'::uuid, 'PICKING A', 'PICKING', 3000, 1500, true, 1, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000009'::uuid, 'PICKING B', 'PICKING', 3000, 1800, true, 2, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000009'::uuid, 'SEPARACAO A', 'SEPARACAO', 1200, 540, true, 3, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000009'::uuid, 'SEPARACAO B', 'SEPARACAO', 1200, 620, true, 4, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000009'::uuid, 'EXPEDICAO A', 'EXPEDICAO', 1500, 900, true, 5, 0, 'dock'),
  ('a0000001-0000-0000-0000-000000000009'::uuid, 'EXPEDICAO B', 'EXPEDICAO', 1500, 860, true, 6, 0, 'dock'),
  ('a0000001-0000-0000-0000-000000000009'::uuid, 'ARMAZENAGEM A', 'ARMAZENAGEM', 2000, 700, true, 7, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000009'::uuid, 'ARMAZENAGEM B', 'ARMAZENAGEM', 2000, 640, true, 8, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000009'::uuid, 'RESERVA', 'ARMAZENAGEM', 1500, 300, true, 9, 0, 'rack'),

  -- CD Yamato - Osaka Hub (8x14)
  ('a0000001-0000-0000-0000-000000000010'::uuid, 'RECEBIMENTO', 'RECEBIMENTO', 1400, 540, true, 0, 0, 'dock'),
  ('a0000001-0000-0000-0000-000000000010'::uuid, 'PICKING A', 'PICKING', 2500, 1100, true, 1, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000010'::uuid, 'PICKING B', 'PICKING', 2500, 1300, true, 2, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000010'::uuid, 'SEPARACAO', 'SEPARACAO', 1000, 420, true, 3, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000010'::uuid, 'EXPEDICAO A', 'EXPEDICAO', 1200, 660, true, 4, 0, 'dock'),
  ('a0000001-0000-0000-0000-000000000010'::uuid, 'EXPEDICAO B', 'EXPEDICAO', 1200, 600, true, 5, 0, 'dock'),
  ('a0000001-0000-0000-0000-000000000010'::uuid, 'ARMAZENAGEM', 'ARMAZENAGEM', 1800, 780, true, 6, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000010'::uuid, 'RESERVA', 'ARMAZENAGEM', 1200, 300, true, 7, 0, 'rack'),

  -- CD Yamato - Nagoya Hub (8x12)
  ('a0000001-0000-0000-0000-000000000011'::uuid, 'RECEBIMENTO', 'RECEBIMENTO', 1100, 480, true, 0, 0, 'dock'),
  ('a0000001-0000-0000-0000-000000000011'::uuid, 'PICKING A', 'PICKING', 2000, 920, true, 1, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000011'::uuid, 'PICKING B', 'PICKING', 2000, 1050, true, 2, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000011'::uuid, 'SEPARACAO', 'SEPARACAO', 800, 360, true, 3, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000011'::uuid, 'EXPEDICAO', 'EXPEDICAO', 1000, 560, true, 4, 0, 'dock'),
  ('a0000001-0000-0000-0000-000000000011'::uuid, 'ARMAZENAGEM', 'ARMAZENAGEM', 1500, 600, true, 5, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000011'::uuid, 'RESERVA', 'ARMAZENAGEM', 900, 230, true, 6, 0, 'rack'),

  -- CD Sagawa - Tokyo Hub (10x16)
  ('a0000001-0000-0000-0000-000000000012'::uuid, 'RECEBIMENTO', 'RECEBIMENTO', 1600, 720, true, 0, 0, 'dock'),
  ('a0000001-0000-0000-0000-000000000012'::uuid, 'PICKING A', 'PICKING', 2800, 1400, true, 1, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000012'::uuid, 'PICKING B', 'PICKING', 2800, 1600, true, 2, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000012'::uuid, 'SEPARACAO A', 'SEPARACAO', 1000, 500, true, 3, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000012'::uuid, 'SEPARACAO B', 'SEPARACAO', 1000, 480, true, 4, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000012'::uuid, 'EXPEDICAO A', 'EXPEDICAO', 1400, 810, true, 5, 0, 'dock'),
  ('a0000001-0000-0000-0000-000000000012'::uuid, 'EXPEDICAO B', 'EXPEDICAO', 1400, 760, true, 6, 0, 'dock'),
  ('a0000001-0000-0000-0000-000000000012'::uuid, 'ARMAZENAGEM', 'ARMAZENAGEM', 2500, 900, true, 7, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000012'::uuid, 'RESERVA A', 'ARMAZENAGEM', 1500, 400, true, 8, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000012'::uuid, 'RESERVA B', 'ARMAZENAGEM', 1500, 350, true, 9, 0, 'rack'),

  -- CD Sagawa - Osaka Hub (8x13)
  ('a0000001-0000-0000-0000-000000000013'::uuid, 'RECEBIMENTO', 'RECEBIMENTO', 1200, 510, true, 0, 0, 'dock'),
  ('a0000001-0000-0000-0000-000000000013'::uuid, 'PICKING A', 'PICKING', 2300, 1100, true, 1, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000013'::uuid, 'PICKING B', 'PICKING', 2300, 1250, true, 2, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000013'::uuid, 'SEPARACAO', 'SEPARACAO', 900, 400, true, 3, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000013'::uuid, 'EXPEDICAO', 'EXPEDICAO', 1100, 620, true, 4, 0, 'dock'),
  ('a0000001-0000-0000-0000-000000000013'::uuid, 'ARMAZENAGEM', 'ARMAZENAGEM', 2000, 800, true, 5, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000013'::uuid, 'RESERVA', 'ARMAZENAGEM', 1000, 280, true, 6, 0, 'rack'),

  -- CD Sagawa - Nagoya Hub (7x12)
  ('a0000001-0000-0000-0000-000000000014'::uuid, 'RECEBIMENTO', 'RECEBIMENTO', 1000, 420, true, 0, 0, 'dock'),
  ('a0000001-0000-0000-0000-000000000014'::uuid, 'PICKING A', 'PICKING', 1800, 810, true, 1, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000014'::uuid, 'PICKING B', 'PICKING', 1800, 960, true, 2, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000014'::uuid, 'SEPARACAO', 'SEPARACAO', 700, 310, true, 3, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000014'::uuid, 'EXPEDICAO', 'EXPEDICAO', 900, 490, true, 4, 0, 'dock'),
  ('a0000001-0000-0000-0000-000000000014'::uuid, 'ARMAZENAGEM', 'ARMAZENAGEM', 1200, 480, true, 5, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000014'::uuid, 'RESERVA', 'ARMAZENAGEM', 600, 140, true, 6, 0, 'rack'),

  -- CD SENIO - Gifu Hub (10x16)
  ('a0000001-0000-0000-0000-000000000015'::uuid, 'RECEBIMENTO', 'RECEBIMENTO', 1500, 650, true, 0, 0, 'dock'),
  ('a0000001-0000-0000-0000-000000000015'::uuid, 'PICKING A', 'PICKING', 2600, 1300, true, 1, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000015'::uuid, 'PICKING B', 'PICKING', 2600, 1450, true, 2, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000015'::uuid, 'SEPARACAO A', 'SEPARACAO', 1000, 470, true, 3, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000015'::uuid, 'SEPARACAO B', 'SEPARACAO', 1000, 430, true, 4, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000015'::uuid, 'EXPEDICAO A', 'EXPEDICAO', 1300, 750, true, 5, 0, 'dock'),
  ('a0000001-0000-0000-0000-000000000015'::uuid, 'EXPEDICAO B', 'EXPEDICAO', 1300, 700, true, 6, 0, 'dock'),
  ('a0000001-0000-0000-0000-000000000015'::uuid, 'ARMAZENAGEM A', 'ARMAZENAGEM', 2000, 850, true, 7, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000015'::uuid, 'ARMAZENAGEM B', 'ARMAZENAGEM', 2000, 780, true, 8, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000015'::uuid, 'RESERVA', 'ARMAZENAGEM', 1300, 250, true, 9, 0, 'rack'),

  -- CD SENIO - Tokyo Hub (8x14)
  ('a0000001-0000-0000-0000-000000000016'::uuid, 'RECEBIMENTO', 'RECEBIMENTO', 1200, 480, true, 0, 0, 'dock'),
  ('a0000001-0000-0000-0000-000000000016'::uuid, 'PICKING A', 'PICKING', 2200, 1000, true, 1, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000016'::uuid, 'PICKING B', 'PICKING', 2200, 1150, true, 2, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000016'::uuid, 'SEPARACAO', 'SEPARACAO', 800, 360, true, 3, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000016'::uuid, 'EXPEDICAO', 'EXPEDICAO', 1000, 560, true, 4, 0, 'dock'),
  ('a0000001-0000-0000-0000-000000000016'::uuid, 'ARMAZENAGEM', 'ARMAZENAGEM', 1600, 640, true, 5, 0, 'rack'),
  ('a0000001-0000-0000-0000-000000000016'::uuid, 'RESERVA', 'ARMAZENAGEM', 1000, 250, true, 6, 0, 'rack')
) AS src(armazem_id, nome, tipo, capacidade, ocupacao, ativo, pos_x, pos_y, tipo_visual)
WHERE NOT EXISTS (
  SELECT 1 FROM public.admin_zonas z
  WHERE z.armazem_id = src.armazem_id AND z.nome = src.nome
);

-- Zonas básicas para Agências (drop-off points)
INSERT INTO public.admin_zonas (armazem_id, nome, tipo, capacidade, ocupacao, ativo, pos_x, pos_y, tipo_visual)
SELECT a.id, 'RECEBIMENTO', 'RECEBIMENTO', 200, 50, true, 0, 0, 'dock'
FROM public.admin_armazens a
WHERE a.nome LIKE 'Ag %'
AND NOT EXISTS (SELECT 1 FROM public.admin_zonas z WHERE z.armazem_id = a.id AND z.nome = 'RECEBIMENTO');

INSERT INTO public.admin_zonas (armazem_id, nome, tipo, capacidade, ocupacao, ativo, pos_x, pos_y, tipo_visual)
SELECT a.id, 'EXPEDICAO', 'EXPEDICAO', 200, 40, true, 0, 1, 'dock'
FROM public.admin_armazens a
WHERE a.nome LIKE 'Ag %'
AND NOT EXISTS (SELECT 1 FROM public.admin_zonas z WHERE z.armazem_id = a.id AND z.nome = 'EXPEDICAO');

INSERT INTO public.admin_zonas (armazem_id, nome, tipo, capacidade, ocupacao, ativo, pos_x, pos_y, tipo_visual)
SELECT a.id, 'ARMAZENAGEM', 'ARMAZENAGEM', 300, 80, true, 1, 0, 'rack'
FROM public.admin_armazens a
WHERE a.nome LIKE 'Ag %'
AND NOT EXISTS (SELECT 1 FROM public.admin_zonas z WHERE z.armazem_id = a.id AND z.nome = 'ARMAZENAGEM');

SELECT '✅ Zonas criadas com sucesso!' AS status;
