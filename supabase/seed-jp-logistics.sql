-- Remove Centros de Distribuição brasileiros
DELETE FROM public.admin_armazens WHERE estado IN ('SP', 'RJ', 'MG', 'PR', 'BA');

-- Adiciona hubs da Yamato Transport, Sagawa Express e Seino (SENIO)
INSERT INTO public.admin_armazens (id, nome, cidade, estado, pais, latitude, longitude, capacidade, ocupacao, responsavel, endereco, telefone, email, ativo)
SELECT * FROM (VALUES
  -- Yamato Transport - Hub Tokyo (sede principal)
  ('a0000001-0000-0000-0000-000000000009'::uuid, 'CD Yamato - Tokyo Hub', 'Tóquio', 'Tokyo', 'JP', 35.6895, 139.6917, 12000, 8400, 'Koji Matsumoto', '2-12-1 Minami Senju, Arakawa-ku, Tokyo 116-0003', '+81-3-3801-1234', 'yamato-tokyo@logistix.jp', true),
  -- Yamato Transport - Hub Osaka (Kansai)
  ('a0000001-0000-0000-0000-000000000010'::uuid, 'CD Yamato - Osaka Hub', 'Osaka', 'Osaka', 'JP', 34.6937, 135.5023, 9000, 5400, 'Takeshi Nomura', '1-3-18 Nishinakajima, Yodogawa-ku, Osaka-shi, Osaka 532-0011', '+81-6-6309-5678', 'yamato-osaka@logistix.jp', true),
  -- Yamato Transport - Hub Nagoya (Chubu)
  ('a0000001-0000-0000-0000-000000000011'::uuid, 'CD Yamato - Nagoya Hub', 'Nagoya', 'Aichi', 'JP', 35.1815, 136.9066, 7500, 4800, 'Yoshihiro Suzuki', '3-15-1 Meieki, Nakamura-ku, Nagoya-shi, Aichi 450-0002', '+81-52-541-9012', 'yamato-nagoya@logistix.jp', true),

  -- Sagawa Express - Hub Tokyo (Kanto)
  ('a0000001-0000-0000-0000-000000000012'::uuid, 'CD Sagawa - Tokyo Hub', 'Tóquio', 'Tokyo', 'JP', 35.7146, 139.7968, 11000, 7200, 'Hideo Tanaka', '1-10-1 Yokoami, Sumida-ku, Tokyo 130-0015', '+81-3-3625-3456', 'sagawa-tokyo@logistix.jp', true),
  -- Sagawa Express - Hub Osaka (Kansai)
  ('a0000001-0000-0000-0000-000000000013'::uuid, 'CD Sagawa - Osaka Hub', 'Osaka', 'Osaka', 'JP', 34.7025, 135.4896, 8500, 5100, 'Makoto Yamamoto', '2-5-20 Minami Horie, Nishi-ku, Osaka-shi, Osaka 550-0015', '+81-6-6531-7890', 'sagawa-osaka@logistix.jp', true),
  -- Sagawa Express - Hub Nagoya (Chubu)
  ('a0000001-0000-0000-0000-000000000014'::uuid, 'CD Sagawa - Nagoya Hub', 'Nagoya', 'Aichi', 'JP', 35.1702, 136.8816, 7000, 4200, 'Kenichi Watanabe', '4-10-1 Sakae, Naka-ku, Nagoya-shi, Aichi 460-0008', '+81-52-264-5678', 'sagawa-nagoya@logistix.jp', true),

  -- Seino Transportation (SENIO) - Hub Gifu (sede)
  ('a0000001-0000-0000-0000-000000000015'::uuid, 'CD SENIO - Gifu Hub', 'Gifu', 'Gifu', 'JP', 35.4233, 136.7606, 10000, 6500, 'Shigeru Ito', '1-1-1 Kanou Shintomachi, Gifu-shi, Gifu 500-8818', '+81-58-271-9012', 'senio-gifu@logistix.jp', true),
  -- Seino Transportation (SENIO) - Hub Tokyo
  ('a0000001-0000-0000-0000-000000000016'::uuid, 'CD SENIO - Tokyo Hub', 'Tóquio', 'Tokyo', 'JP', 35.7478, 139.8170, 8000, 4800, 'Takayuki Kato', '5-12-8 Shinbashi, Minato-ku, Tokyo 105-0004', '+81-3-3437-1234', 'senio-tokyo@logistix.jp', true)
) AS src(id, nome, cidade, estado, pais, latitude, longitude, capacidade, ocupacao, responsavel, endereco, telefone, email, ativo)
WHERE NOT EXISTS (SELECT 1 FROM public.admin_armazens WHERE id = src.id);

SELECT '✅ JAPAN LOGISTICS HUBS INSERTED' AS status;
SELECT json_agg(json_build_object('nome', nome, 'cidade', cidade, 'estado', estado, 'pct', ROUND(ocupacao * 100.0 / NULLIF(capacidade, 0))) ORDER BY nome) AS armazens FROM public.admin_armazens WHERE nome LIKE 'CD%' AND pais = 'JP';
