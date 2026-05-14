-- =============================================================================
-- SEED DATA - Centros de Distribuição Reais do Japão
-- Primeiro garante colunas, depois popula dados
-- =============================================================================

-- 1. ARMAZÉNS - Adicionar colunas novas se não existirem
ALTER TABLE public.admin_armazens ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE public.admin_armazens ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
ALTER TABLE public.admin_armazens ADD COLUMN IF NOT EXISTS endereco TEXT;
ALTER TABLE public.admin_armazens ADD COLUMN IF NOT EXISTS telefone TEXT;
ALTER TABLE public.admin_armazens ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.admin_armazens ADD COLUMN IF NOT EXISTS pais TEXT DEFAULT 'JP';

INSERT INTO public.admin_armazens (id, nome, cidade, estado, pais, latitude, longitude, capacidade, ocupacao, responsavel, endereco, telefone, email, ativo)
SELECT * FROM (VALUES
  ('a0000001-0000-0000-0000-000000000001'::uuid, 'CD Yokohama - Porto', 'Yokohama', 'Kanagawa', 'JP', 35.4437, 139.6380, 8000, 5200, 'Takeshi Yamamoto', '2-1-1 Minami Honmoku, Naka-ku, Yokohama-shi, Kanagawa 231-0811', '+81-45-663-1100', 'yokohama@logistix.jp', true),
  ('a0000001-0000-0000-0000-000000000002'::uuid, 'CD Tóquio - Adachi', 'Tóquio', 'Tokyo', 'JP', 35.7752, 139.8047, 6500, 4100, 'Kenji Tanaka', '3-12-18 Senju, Adachi-ku, Tokyo 120-0034', '+81-3-3870-5511', 'tokyo-adachi@logistix.jp', true),
  ('a0000001-0000-0000-0000-000000000003'::uuid, 'CD Osaka - Porto Sul', 'Osaka', 'Osaka', 'JP', 34.6586, 135.4310, 5500, 3200, 'Yuki Sato', '1-5-20 Chikko, Minato-ku, Osaka-shi, Osaka 552-0021', '+81-6-6572-3300', 'osaka@logistix.jp', true),
  ('a0000001-0000-0000-0000-000000000004'::uuid, 'CD Nagoya - Toyota', 'Nagoya', 'Aichi', 'JP', 35.1815, 136.9066, 7200, 4800, 'Hiroshi Suzuki', '4-7-1 Meieki, Nakamura-ku, Nagoya-shi, Aichi 450-0002', '+81-52-561-2200', 'nagoya@logistix.jp', true),
  ('a0000001-0000-0000-0000-000000000005'::uuid, 'CD Kobe - Porto Leste', 'Kobe', 'Hyogo', 'JP', 34.6764, 135.1927, 4800, 2900, 'Akira Watanabe', '12-1 Minatojima, Chuo-ku, Kobe-shi, Hyogo 650-0041', '+81-78-302-7700', 'kobe@logistix.jp', true),
  ('a0000001-0000-0000-0000-000000000006'::uuid, 'CD Fukuoka - Hakata', 'Fukuoka', 'Fukuoka', 'JP', 33.5903, 130.4206, 3500, 1800, 'Masaru Ito', '2-1-1 Hakataeki Higashi, Hakata-ku, Fukuoka-shi, Fukuoka 812-0013', '+81-92-433-8800', 'fukuoka@logistix.jp', true),
  ('a0000001-0000-0000-0000-000000000007'::uuid, 'CD Sapporo - Atsubetsu', 'Sapporo', 'Hokkaido', 'JP', 43.0340, 141.4330, 2800, 1200, 'Daisuke Mori', '1-1-1 Atsubetsu Chuo, Atsubetsu-ku, Sapporo-shi, Hokkaido 004-0051', '+81-11-892-4400', 'sapporo@logistix.jp', true),
  ('a0000001-0000-0000-0000-000000000008'::uuid, 'CD Tokyo - Haneda Aeroporto', 'Tóquio', 'Tokyo', 'JP', 35.5494, 139.7798, 4200, 3100, 'Shinichi Kato', '3-3-2 Haneda, Ota-ku, Tokyo 144-0041', '+81-3-5756-6600', 'haneda@logistix.jp', true)
) AS src(id, nome, cidade, estado, pais, latitude, longitude, capacidade, ocupacao, responsavel, endereco, telefone, email, ativo)
WHERE NOT EXISTS (SELECT 1 FROM public.admin_armazens WHERE id = src.id);

-- 2. TRANSPORTES - colunas reais: modelo, placa, capacidade_kg, armazem_id, motorista
INSERT INTO public.admin_transportes (id, modelo, placa, armazem_id, capacidade_kg, motorista)
SELECT * FROM (VALUES
  ('b0000001-0000-0000-0000-000000000001'::uuid, 'Yamato Transport - Caminhão 4t', 'Y-1052', 'a0000001-0000-0000-0000-000000000001'::uuid, 4000, 'Takashi Mori'),
  ('b0000001-0000-0000-0000-000000000002'::uuid, 'Yamato Transport - Caminhão 4t', 'Y-2031', 'a0000001-0000-0000-0000-000000000002'::uuid, 4000, 'Hiroshi Nakamura'),
  ('b0000001-0000-0000-0000-000000000003'::uuid, 'Sagawa Express - Caminhão 6t', 'S-3017', 'a0000001-0000-0000-0000-000000000003'::uuid, 6000, 'Kenji Watanabe'),
  ('b0000001-0000-0000-0000-000000000004'::uuid, 'Sagawa Express - Caminhão 6t', 'S-4022', 'a0000001-0000-0000-0000-000000000004'::uuid, 6000, 'Shinichi Sato'),
  ('b0000001-0000-0000-0000-000000000005'::uuid, 'Nippon Express - Caminhão 8t', 'N-5058', 'a0000001-0000-0000-0000-000000000005'::uuid, 8000, 'Yuji Tanaka'),
  ('b0000001-0000-0000-0000-000000000006'::uuid, 'Nippon Express - Caminhão 8t', 'N-6093', 'a0000001-0000-0000-0000-000000000006'::uuid, 8000, 'Masahiro Ito'),
  ('b0000001-0000-0000-0000-000000000007'::uuid, 'Seino Transportation - Caminhão 5t', 'SE-7045', 'a0000001-0000-0000-0000-000000000007'::uuid, 5000, 'Ryo Suzuki'),
  ('b0000001-0000-0000-0000-000000000008'::uuid, 'Yamato Transport - Van 1.5t', 'Y-8079', 'a0000001-0000-0000-0000-000000000008'::uuid, 1500, 'Tatsuya Kimura'),
  ('b0000001-0000-0000-0000-000000000009'::uuid, 'Sagawa Express - Moto 200kg', 'S-9012', 'a0000001-0000-0000-0000-000000000002'::uuid, 200, 'Kazuki Yoshida'),
  ('b0000001-0000-0000-0000-000000000010'::uuid, 'Nippon Express - Van 1.5t', 'N-1004', 'a0000001-0000-0000-0000-000000000003'::uuid, 1500, 'Daiki Kobayashi')
) AS src(id, modelo, placa, armazem_id, capacidade_kg, motorista)
WHERE NOT EXISTS (SELECT 1 FROM public.admin_transportes WHERE id = src.id);

-- 3. CLIENTES
INSERT INTO public.admin_clientes (id, nome, cnpj, email, telefone, cidade, estado, ativo)
SELECT * FROM (VALUES
  ('c0000001-0000-0000-0000-000000000001'::uuid, 'Nismo (Nissan Motorsport)', '12.345.678/0001-90', 'comercial@nismo.co.jp', '+81-50-1234-5678', 'Yokohama', 'Kanagawa', true),
  ('c0000001-0000-0000-0000-000000000002'::uuid, 'TRD (Toyota Racing Development)', '23.456.789/0001-01', 'vendas@trd.toyota.jp', '+81-50-2345-6789', 'Nagoya', 'Aichi', true),
  ('c0000001-0000-0000-0000-000000000003'::uuid, 'Mugen Motorsports (Honda)', '34.567.890/0001-12', 'info@mugen-power.jp', '+81-50-3456-7890', 'Tóquio', 'Tokyo', true),
  ('c0000001-0000-0000-0000-000000000004'::uuid, 'Mazdaspeed (Mazda)', '45.678.901/0001-23', 'sales@mazdaspeed.jp', '+81-50-4567-8901', 'Hiroshima', 'Hiroshima', true),
  ('c0000001-0000-0000-0000-000000000005'::uuid, 'Subaru Tecnica International (STI)', '56.789.012/0001-34', 'sti@subaru.jp', '+81-50-5678-9012', 'Mitaka', 'Tokyo', true),
  ('c0000001-0000-0000-0000-000000000006'::uuid, 'HKS Co., Ltd.', '67.890.123/0001-45', 'export@hks-power.co.jp', '+81-50-6789-0123', 'Fuji', 'Shizuoka', true),
  ('c0000001-0000-0000-0000-000000000007'::uuid, 'GReddy / Trust Co., Ltd.', '78.901.234/0001-56', 'info@greddy.co.jp', '+81-50-7890-1234', 'Osaka', 'Osaka', true),
  ('c0000001-0000-0000-0000-000000000008'::uuid, 'Apexi Co., Ltd.', '89.012.345/0001-67', 'sales@apexi.co.jp', '+81-50-8901-2345', 'Tóquio', 'Tokyo', true),
  ('c0000001-0000-0000-0000-000000000009'::uuid, 'Blitz Co., Ltd.', '90.123.456/0001-78', 'export@blitz.co.jp', '+81-50-9012-3456', 'Tóquio', 'Tokyo', true),
  ('c0000001-0000-0000-0000-000000000010'::uuid, 'Tein (Suspension)', '01.234.567/0001-89', 'info@tein.jp', '+81-50-0123-4567', 'Yokohama', 'Kanagawa', true),
  ('c0000001-0000-0000-0000-000000000011'::uuid, 'Endless (Freios)', '11.222.333/0001-90', 'overseas@endless.co.jp', '+81-50-1112-2233', 'Tóquio', 'Tokyo', true),
  ('c0000001-0000-0000-0000-000000000012'::uuid, 'Rays Engineering (Rodas)', '22.333.444/0001-01', 'info@rayswheels.co.jp', '+81-50-2223-3344', 'Osaka', 'Osaka', true),
  ('c0000001-0000-0000-0000-000000000013'::uuid, 'Bride (Bancos)', '33.444.555/0001-12', 'order@bride-jp.com', '+81-50-3334-4455', 'Tóquio', 'Tokyo', true),
  ('c0000001-0000-0000-0000-000000000014'::uuid, 'Mine''s (Nissan Especialista)', '44.555.666/0001-23', 'info@mines-jp.com', '+81-50-4445-5566', 'Yokohama', 'Kanagawa', true),
  ('c0000001-0000-0000-0000-000000000015'::uuid, 'Top Secret (JUN)', '55.666.777/0001-34', 'contact@topsecret-jpn.com', '+81-50-5556-6677', 'Chiba', 'Chiba', true)
) AS src(id, nome, cnpj, email, telefone, cidade, estado, ativo)
WHERE NOT EXISTS (SELECT 1 FROM public.admin_clientes WHERE id = src.id);

-- 4. ESTOQUE
INSERT INTO public.admin_estoque (id, armazem_id, produto, sku, quantidade)
SELECT * FROM (VALUES
  ('e0000001-0000-0000-0000-000000000001'::uuid, 'a0000001-0000-0000-0000-000000000001'::uuid, 'Kit Turbo HKS GT-R R34', 'HKS-T04Z-R34', 8),
  ('e0000001-0000-0000-0000-000000000002'::uuid, 'a0000001-0000-0000-0000-000000000001'::uuid, 'Suspensão Tein Super Street - Nissan Silvia S15', 'TEIN-SS-S15', 15),
  ('e0000001-0000-0000-0000-000000000003'::uuid, 'a0000001-0000-0000-0000-000000000001'::uuid, 'Freio Endless Racing ME20 - Brembo', 'END-ME20-4POT', 12),
  ('e0000001-0000-0000-0000-000000000004'::uuid, 'a0000001-0000-0000-0000-000000000002'::uuid, 'Roda Rays TE37 18x9.5 - 4 unidades', 'RAYS-TE37-1895', 20),
  ('e0000001-0000-0000-0000-000000000005'::uuid, 'a0000001-0000-0000-0000-000000000002'::uuid, 'Banco Bride Stradia III - Couro Preto', 'BRD-ST3-BLK', 6),
  ('e0000001-0000-0000-0000-000000000006'::uuid, 'a0000001-0000-0000-0000-000000000002'::uuid, 'Downpipe GReddy - Subaru WRX STI EJ20', 'GRD-DP-EJ20', 10),
  ('e0000001-0000-0000-0000-000000000007'::uuid, 'a0000001-0000-0000-0000-000000000003'::uuid, 'Intercooler ARC - Mitsubishi Lancer Evo IX', 'ARC-IC-EVO9', 5),
  ('e0000001-0000-0000-0000-000000000008'::uuid, 'a0000001-0000-0000-0000-000000000003'::uuid, 'Válvula Blow-off GReddy Type R', 'GRD-BOV-R-BLK', 25),
  ('e0000001-0000-0000-0000-000000000009'::uuid, 'a0000001-0000-0000-0000-000000000004'::uuid, 'Kit Embreagem Exedy Stage 2 - Toyota Supra JZA80', 'EXD-STG2-2JZ', 7),
  ('e0000001-0000-0000-0000-000000000010'::uuid, 'a0000001-0000-0000-0000-000000000004'::uuid, 'Escape Fujitsubo Legalis R - Mazda RX-7 FD3S', 'FJB-LR-FD3S', 4),
  ('e0000001-0000-0000-0000-000000000011'::uuid, 'a0000001-0000-0000-0000-000000000005'::uuid, 'Óleo de Motor Motul 300V 5W-40 (20L)', 'MTL-300V-5W40', 30),
  ('e0000001-0000-0000-0000-000000000012'::uuid, 'a0000001-0000-0000-0000-000000000005'::uuid, 'Filtro de óleo HKS Super Oil Filter', 'HKS-OF-001', 50),
  ('e0000001-0000-0000-0000-000000000013'::uuid, 'a0000001-0000-0000-0000-000000000006'::uuid, 'Pastilha de Freio Endless MX72 - Todos', 'END-MX72-ALL', 40),
  ('e0000001-0000-0000-0000-000000000014'::uuid, 'a0000001-0000-0000-0000-000000000006'::uuid, 'Roda Work Meister S1 3P 18x10', 'WRK-MS1-1810', 8),
  ('e0000001-0000-0000-0000-000000000015'::uuid, 'a0000001-0000-0000-0000-000000000007'::uuid, 'Turbo IHI RHF55 - Subaru WRX', 'IHI-RHF55', 3),
  ('e0000001-0000-0000-0000-000000000016'::uuid, 'a0000001-0000-0000-0000-000000000008'::uuid, 'Suspensão HKS Hipermax IV GT - Nissan GT-R R35', 'HKS-HM4-R35', 6)
) AS src(id, armazem_id, produto, sku, quantidade)
WHERE NOT EXISTS (SELECT 1 FROM public.admin_estoque WHERE id = src.id);

-- 5. PEDIDOS
INSERT INTO public.admin_pedidos (id, codigo, cliente_id, armazem_origem_id, destino_cidade, destino_estado, status, peso_kg, valor, previsao)
SELECT * FROM (VALUES
  ('d0000001-0000-0000-0000-000000000001'::uuid, '#JP-PED-001', 'c0000001-0000-0000-0000-000000000007'::uuid, 'a0000001-0000-0000-0000-000000000003'::uuid, 'Yokohama', 'Kanagawa', 'pendente', 25.0, 380000, NOW() + INTERVAL '7 days'),
  ('d0000001-0000-0000-0000-000000000002'::uuid, '#JP-PED-002', 'c0000001-0000-0000-0000-000000000006'::uuid, 'a0000001-0000-0000-0000-000000000001'::uuid, 'Fuji', 'Shizuoka', 'pendente', 8.5, 185000, NOW() + INTERVAL '5 days'),
  ('d0000001-0000-0000-0000-000000000003'::uuid, '#JP-PED-003', 'c0000001-0000-0000-0000-000000000012'::uuid, 'a0000001-0000-0000-0000-000000000003'::uuid, 'Osaka', 'Osaka', 'em_transito', 32.0, 520000, NOW() + INTERVAL '3 days'),
  ('d0000001-0000-0000-0000-000000000004'::uuid, '#JP-PED-004', 'c0000001-0000-0000-0000-000000000005'::uuid, 'a0000001-0000-0000-0000-000000000002'::uuid, 'Mitaka', 'Tokyo', 'pendente', 2.5, 95000, NOW() + INTERVAL '4 days'),
  ('d0000001-0000-0000-0000-000000000005'::uuid, '#JP-PED-005', 'c0000001-0000-0000-0000-000000000011'::uuid, 'a0000001-0000-0000-0000-000000000006'::uuid, 'Tóquio', 'Tokyo', 'em_transito', 15.0, 280000, NOW() + INTERVAL '2 days'),
  ('d0000001-0000-0000-0000-000000000006'::uuid, '#JP-PED-006', 'c0000001-0000-0000-0000-000000000010'::uuid, 'a0000001-0000-0000-0000-000000000001'::uuid, 'Yokohama', 'Kanagawa', 'entregue', 18.0, 220000, NOW() - INTERVAL '2 days'),
  ('d0000001-0000-0000-0000-000000000007'::uuid, '#JP-PED-007', 'c0000001-0000-0000-0000-000000000003'::uuid, 'a0000001-0000-0000-0000-000000000008'::uuid, 'Tóquio', 'Tokyo', 'entregue', 12.0, 145000, NOW() - INTERVAL '5 days')
) AS src(id, codigo, cliente_id, armazem_origem_id, destino_cidade, destino_estado, status, peso_kg, valor, previsao)
WHERE NOT EXISTS (SELECT 1 FROM public.admin_pedidos WHERE id = src.id);

-- 6. RASTREAMENTO
INSERT INTO public.admin_rastreamento (id, pedido_id, tipo, descricao, local, status, created_at)
SELECT * FROM (VALUES
  ('d0000002-0000-0000-0000-000000000001'::uuid, 'd0000001-0000-0000-0000-000000000003'::uuid, 'COLETA', 'Coleta realizada no CD Osaka', 'Osaka', 'coletado', NOW() - INTERVAL '2 days'),
  ('d0000002-0000-0000-0000-000000000002'::uuid, 'd0000001-0000-0000-0000-000000000003'::uuid, 'ENVIO', 'Saiu para entrega', 'Osaka - Tóquio', 'em_transito', NOW() - INTERVAL '1 day'),
  ('d0000002-0000-0000-0000-000000000003'::uuid, 'd0000001-0000-0000-0000-000000000003'::uuid, 'ATUALIZACAO', 'Em trânsito - Centro de Triagem Tóquio', 'Tóquio', 'em_transito', NOW() - INTERVAL '12 hours'),
  ('d0000002-0000-0000-0000-000000000004'::uuid, 'd0000001-0000-0000-0000-000000000005'::uuid, 'COLETA', 'Coleta no CD Fukuoka', 'Fukuoka', 'coletado', NOW() - INTERVAL '3 days'),
  ('d0000002-0000-0000-0000-000000000005'::uuid, 'd0000001-0000-0000-0000-000000000005'::uuid, 'ENVIO', 'Saiu para entrega', 'Fukuoka - Tóquio', 'em_transito', NOW() - INTERVAL '2 days'),
  ('d0000002-0000-0000-0000-000000000006'::uuid, 'd0000001-0000-0000-0000-000000000006'::uuid, 'COLETA', 'Coleta no CD Yokohama', 'Yokohama', 'coletado', NOW() - INTERVAL '5 days'),
  ('d0000002-0000-0000-0000-000000000007'::uuid, 'd0000001-0000-0000-0000-000000000006'::uuid, 'ENVIO', 'Saiu para entrega', 'Yokohama', 'em_transito', NOW() - INTERVAL '4 days'),
  ('d0000002-0000-0000-0000-000000000008'::uuid, 'd0000001-0000-0000-0000-000000000006'::uuid, 'ENTREGA', 'Entregue - Tein Suspension', 'Yokohama', 'entregue', NOW() - INTERVAL '2 days'),
  ('d0000002-0000-0000-0000-000000000009'::uuid, 'd0000001-0000-0000-0000-000000000007'::uuid, 'COLETA', 'Coleta no CD Haneda', 'Tóquio', 'coletado', NOW() - INTERVAL '7 days'),
  ('d0000002-0000-0000-0000-000000000010'::uuid, 'd0000001-0000-0000-0000-000000000007'::uuid, 'ENTREGA', 'Entregue - Mugen (Honda)', 'Tóquio', 'entregue', NOW() - INTERVAL '5 days')
) AS src(id, pedido_id, tipo, descricao, local, status, created_at)
WHERE NOT EXISTS (SELECT 1 FROM public.admin_rastreamento WHERE id = src.id);

-- 7. OCORRÊNCIAS
INSERT INTO public.admin_ocorrencias (id, pedido_id, tipo, descricao, status)
SELECT * FROM (VALUES
  ('d0000003-0000-0000-0000-000000000001'::uuid, 'd0000001-0000-0000-0000-000000000001'::uuid, 'atraso', 'Atraso na coleta devido a condições climáticas em Osaka', 'aberto'),
  ('d0000003-0000-0000-0000-000000000002'::uuid, 'd0000001-0000-0000-0000-000000000005'::uuid, 'avaria', 'Embalagem danificada durante transporte - verificação necessária', 'em_andamento')
) AS src(id, pedido_id, tipo, descricao, status)
WHERE NOT EXISTS (SELECT 1 FROM public.admin_ocorrencias WHERE id = src.id);

-- 8. CONFIGURAÇÕES
INSERT INTO public.admin_configuracoes (chave, valor)
SELECT * FROM (VALUES
  ('empresa_nome', 'TheDAIG Logistix Japan'),
  ('moeda_padrao', 'JPY'),
  ('idioma_padrao', 'pt-BR'),
  ('idiomas_disponiveis', '["pt-BR","ja-JP","en-US"]'),
  ('fuso_horario', 'Asia/Tokyo'),
  ('endereco_matriz', '2-1-1 Minami Honmoku, Naka-ku, Yokohama-shi, Kanagawa 231-0811'),
  ('telefone_matriz', '+81-45-663-1100'),
  ('email_suporte', 'suporte@logistix.jp'),
  ('horario_funcionamento', 'Seg-Sex 08:00-18:00 / Sab 08:00-12:00 JST')
) AS src(chave, valor)
WHERE NOT EXISTS (SELECT 1 FROM public.admin_configuracoes WHERE chave = src.chave);

SELECT '✅ Dados japoneses populados com sucesso!' AS status;
