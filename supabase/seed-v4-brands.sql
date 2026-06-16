-- ============================================================
-- SEED V3 — FABRICANTES DE PEÇAS AUTOMOTIVAS (OEM + AFTERMARKET)
-- Dados reais de marcas, peças com part numbers, specs e anúncios
-- Execute no SQL Editor do Supabase Dashboard
-- Projeto: DAIG — Digital A.I. Garage
-- ============================================================

-- ============================================================
-- PARTE 1: MARCAS (OEM japonesas + aftermarket globais)
-- ============================================================

INSERT INTO public.brands (id, name, slug, logo_url, country, created_at)
VALUES
  -- OEM Japonesas
  ('10000001-0000-0000-0000-000000000001'::uuid, 'Toyota',           'toyota',         'https://logo.clearbit.com/toyota.com',         'JP', NOW()),
  ('10000001-0000-0000-0000-000000000002'::uuid, 'Nissan',           'nissan',         'https://logo.clearbit.com/nissan.com',         'JP', NOW()),
  ('10000001-0000-0000-0000-000000000003'::uuid, 'Honda',            'honda',          'https://logo.clearbit.com/honda.com',          'JP', NOW()),
  ('10000001-0000-0000-0000-000000000004'::uuid, 'Mazda',            'mazda',          'https://logo.clearbit.com/mazda.com',          'JP', NOW()),
  ('10000001-0000-0000-0000-000000000005'::uuid, 'Subaru',           'subaru',         'https://logo.clearbit.com/subaru.com',         'JP', NOW()),
  ('10000001-0000-0000-0000-000000000006'::uuid, 'Mitsubishi',       'mitsubishi',     'https://logo.clearbit.com/mitsubishicars.com', 'JP', NOW()),
  ('10000001-0000-0000-0000-000000000007'::uuid, 'Suzuki',           'suzuki',         'https://logo.clearbit.com/suzuki.com',         'JP', NOW()),
  ('10000001-0000-0000-0000-000000000008'::uuid, 'Lexus',            'lexus',          'https://logo.clearbit.com/lexus.com',          'JP', NOW()),
  ('10000001-0000-0000-0000-000000000009'::uuid, 'Daihatsu',         'daihatsu',       'https://logo.clearbit.com/daihatsu.com',       'JP', NOW()),
  ('10000001-0000-0000-0000-000000000010'::uuid, 'Isuzu',            'isuzu',          'https://logo.clearbit.com/isuzu.com',          'JP', NOW()),
  -- OEM Europeias
  ('10000001-0000-0000-0000-000000000011'::uuid, 'BMW',              'bmw',            'https://logo.clearbit.com/bmw.com',            'DE', NOW()),
  ('10000001-0000-0000-0000-000000000012'::uuid, 'Mercedes-Benz',    'mercedes-benz',  'https://logo.clearbit.com/mercedes-benz.com',  'DE', NOW()),
  ('10000001-0000-0000-0000-000000000013'::uuid, 'Porsche',          'porsche',        'https://logo.clearbit.com/porsche.com',        'DE', NOW()),
  ('10000001-0000-0000-0000-000000000014'::uuid, 'Audi',             'audi',           'https://logo.clearbit.com/audi.com',           'DE', NOW()),
  ('10000001-0000-0000-0000-000000000015'::uuid, 'Volkswagen',       'volkswagen',     'https://logo.clearbit.com/vw.com',             'DE', NOW()),
  ('10000001-0000-0000-0000-000000000016'::uuid, 'Tesla',            'tesla',          'https://logo.clearbit.com/tesla.com',          'US', NOW()),
  -- Aftermarket JDM
  ('10000001-0000-0000-0000-000000000020'::uuid, 'HKS',              'hks',            'https://logo.clearbit.com/hks-power.com',      'JP', NOW()),
  ('10000001-0000-0000-0000-000000000021'::uuid, 'GReddy',           'greddy',         'https://logo.clearbit.com/greddy.com',        'JP', NOW()),
  ('10000001-0000-0000-0000-000000000022'::uuid, 'Tein',             'tein',           'https://logo.clearbit.com/tein.co.jp',        'JP', NOW()),
  ('10000001-0000-0000-0000-000000000023'::uuid, 'Cusco',            'cusco',          'https://logo.clearbit.com/cusco.co.jp',       'JP', NOW()),
  ('10000001-0000-0000-0000-000000000024'::uuid, 'Rays Engineering', 'rays',           'https://logo.clearbit.com/rayswheels.co.jp',  'JP', NOW()),
  ('10000001-0000-0000-0000-000000000025'::uuid, 'Work Wheels',      'work',           'https://logo.clearbit.com/work-wheels.jp',    'JP', NOW()),
  ('10000001-0000-0000-0000-000000000026'::uuid, 'Nismo',            'nismo',          'https://logo.clearbit.com/nismo.co.jp',       'JP', NOW()),
  ('10000001-0000-0000-0000-000000000027'::uuid, 'TRD',              'trd',            'https://logo.clearbit.com/trd.co.jp',         'JP', NOW()),
  ('10000001-0000-0000-0000-000000000028'::uuid, 'Mugen',            'mugen',          'https://logo.clearbit.com/mugen-power.com',   'JP', NOW()),
  ('10000001-0000-0000-0000-000000000029'::uuid, 'Blitz',            'blitz',          'https://logo.clearbit.com/blitz.co.jp',       'JP', NOW()),
  ('10000001-0000-0000-0000-000000000030'::uuid, 'Apexi',            'apexi',          'https://logo.clearbit.com/apexi.co.jp',       'JP', NOW()),
  ('10000001-0000-0000-0000-000000000031'::uuid, 'Fujitsubo',        'fujitsubo',      'https://logo.clearbit.com/fujitsubo.co.jp',   'JP', NOW()),
  ('10000001-0000-0000-0000-000000000032'::uuid, 'Tomei Powered',    'tomei',          'https://logo.clearbit.com/tomei-powered.com', 'JP', NOW()),
  ('10000001-0000-0000-0000-000000000033'::uuid, 'Toda Racing',      'toda',           'https://logo.clearbit.com/toda-racing.co.jp', 'JP', NOW()),
  ('10000001-0000-0000-0000-000000000034'::uuid, 'ARC Brazing',      'arc',            'https://logo.clearbit.com/arc-brazing.com',   'JP', NOW()),
  ('10000001-0000-0000-0000-000000000035'::uuid, 'Exedy',            'exedy',          'https://logo.clearbit.com/exedy.com',         'JP', NOW()),
  ('10000001-0000-0000-0000-000000000036'::uuid, 'Endless',          'endless',        'https://logo.clearbit.com/endless.co.jp',     'JP', NOW()),
  ('10000001-0000-0000-0000-000000000037'::uuid, 'Bride',            'bride',          'https://logo.clearbit.com/bride-jp.com',      'JP', NOW()),
  ('10000001-0000-0000-0000-000000000038'::uuid, 'Recaro',           'recaro',         'https://logo.clearbit.com/recaro.com',        'DE', NOW()),
  ('10000001-0000-0000-0000-000000000039'::uuid, 'Sparco',           'sparco',         'https://logo.clearbit.com/sparco.com',        'IT', NOW()),
  ('10000001-0000-0000-0000-000000000040'::uuid, 'Enkei',            'enkei',          'https://logo.clearbit.com/enkei.com',         'JP', NOW()),
  ('10000001-0000-0000-0000-000000000041'::uuid, 'SSR Wheels',       'ssr',            'https://logo.clearbit.com/ssr-wheels.jp',     'JP', NOW()),
  -- Aftermarket Global
  ('10000001-0000-0000-0000-000000000050'::uuid, 'Garrett',          'garrett',        'https://logo.clearbit.com/garrettmotion.com', 'US', NOW()),
  ('10000001-0000-0000-0000-000000000051'::uuid, 'Borg Warner',      'borgwarner',     'https://logo.clearbit.com/borgwarner.com',    'US', NOW()),
  ('10000001-0000-0000-0000-000000000052'::uuid, 'Brembo',           'brembo',         'https://logo.clearbit.com/brembo.com',        'IT', NOW()),
  ('10000001-0000-0000-0000-000000000053'::uuid, 'Bilstein',         'bilstein',       'https://logo.clearbit.com/bilstein.com',      'DE', NOW()),
  ('10000001-0000-0000-0000-000000000054'::uuid, 'KW Suspensions',   'kw',             'https://logo.clearbit.com/kwsuspensions.com', 'DE', NOW()),
  ('10000001-0000-0000-0000-000000000055'::uuid, 'Öhlins',           'ohlins',         'https://logo.clearbit.com/ohlins.com',        'SE', NOW()),
  ('10000001-0000-0000-0000-000000000056'::uuid, 'Bosch',            'bosch',          'https://logo.clearbit.com/bosch.com',         'DE', NOW()),
  ('10000001-0000-0000-0000-000000000057'::uuid, 'NGK',              'ngk',            'https://logo.clearbit.com/ngkntk.com',       'JP', NOW()),
  ('10000001-0000-0000-0000-000000000058'::uuid, 'Denso',            'denso',          'https://logo.clearbit.com/denso.com',         'JP', NOW()),
  ('10000001-0000-0000-0000-000000000059'::uuid, 'Haltech',          'haltech',        'https://logo.clearbit.com/haltech.com',       'AU', NOW()),
  ('10000001-0000-0000-0000-000000000060'::uuid, 'AEM Electronics',  'aem',            'https://logo.clearbit.com/aemelectronics.com','US', NOW()),
  ('10000001-0000-0000-0000-000000000061'::uuid, 'Motul',            'motul',          'https://logo.clearbit.com/motul.com',         'FR', NOW()),
  ('10000001-0000-0000-0000-000000000062'::uuid, 'Castrol',          'castrol',        'https://logo.clearbit.com/castrol.com',       'GB', NOW()),
  ('10000001-0000-0000-0000-000000000063'::uuid, 'APR Performance',  'apr',            'https://logo.clearbit.com/aprperformance.com','US', NOW()),
  ('10000001-0000-0000-0000-000000000064'::uuid, 'Mishimoto',        'mishimoto',      'https://logo.clearbit.com/mishimoto.com',     'US', NOW()),
  ('10000001-0000-0000-0000-000000000065'::uuid, 'Ikeya Formula',    'ikeya',          'https://logo.clearbit.com/ikeyaformula.com',  'JP', NOW()),
  ('10000001-0000-0000-0000-000000000066'::uuid, 'Nardi',            'nardi',          'https://logo.clearbit.com/nardiitalia.it',    'IT', NOW()),
  ('10000001-0000-0000-0000-000000000067'::uuid, 'Momo',             'momo',           'https://logo.clearbit.com/momo.it',           'IT', NOW()),
  ('10000001-0000-0000-0000-000000000068'::uuid, 'Wilwood',          'wilwood',        'https://logo.clearbit.com/wilwood.com',       'US', NOW()),
  ('10000001-0000-0000-0000-000000000069'::uuid, 'Stoptech',         'stoptech',       'https://logo.clearbit.com/stoptech.com',      'US', NOW()),
  ('10000001-0000-0000-0000-000000000070'::uuid, 'BC Racing',        'bc-racing',      'https://logo.clearbit.com/bcracing.com',      'TW', NOW())
ON CONFLICT (slug) DO UPDATE SET
  logo_url = EXCLUDED.logo_url,
  country  = EXCLUDED.country;

-- ============================================================
-- PARTE 2: CATEGORIAS DE PEÇAS (hierarquia completa)
-- ============================================================

INSERT INTO public.categories (id, name, slug, icon, created_at)
VALUES
  ('20000001-0000-0000-0000-000000000001'::uuid, 'Motor',              'engine',          '⚙️',  NOW()),
  ('20000001-0000-0000-0000-000000000002'::uuid, 'Turbo / Compressor', 'turbo-boost',     '💨',  NOW()),
  ('20000001-0000-0000-0000-000000000003'::uuid, 'Escape',             'exhaust',         '🔧',  NOW()),
  ('20000001-0000-0000-0000-000000000004'::uuid, 'Freios',             'brakes',          '🛑',  NOW()),
  ('20000001-0000-0000-0000-000000000005'::uuid, 'Suspensão',          'suspension',      '🔩',  NOW()),
  ('20000001-0000-0000-0000-000000000006'::uuid, 'Rodas',              'wheels',          '⭕',  NOW()),
  ('20000001-0000-0000-0000-000000000007'::uuid, 'Transmissão',        'transmission',    '⚡',  NOW()),
  ('20000001-0000-0000-0000-000000000008'::uuid, 'Body Kit / Aero',    'body-kits',       '🏎️',  NOW()),
  ('20000001-0000-0000-0000-000000000009'::uuid, 'Interior',           'interior',        '🪑',  NOW()),
  ('20000001-0000-0000-0000-000000000010'::uuid, 'Eletrônica',         'electronics',     '💻',  NOW()),
  ('20000001-0000-0000-0000-000000000011'::uuid, 'Iluminação',         'lighting',        '💡',  NOW()),
  ('20000001-0000-0000-0000-000000000012'::uuid, 'Resfriamento',       'cooling',         '🌡️',  NOW()),
  ('20000001-0000-0000-0000-000000000013'::uuid, 'Combustível',        'fuel',            '⛽',  NOW()),
  ('20000001-0000-0000-0000-000000000014'::uuid, 'Aerofólio / Wing',   'wings-spoilers',  '🏁',  NOW()),
  ('20000001-0000-0000-0000-000000000015'::uuid, 'Fluidos e Óleos',    'fluids',          '🛢️',  NOW()),
  ('20000001-0000-0000-0000-000000000016'::uuid, 'Filtros',            'filters',         '🔽',  NOW()),
  ('20000001-0000-0000-0000-000000000017'::uuid, 'Embreagem',          'clutch',          '🔄',  NOW()),
  ('20000001-0000-0000-0000-000000000018'::uuid, 'Intercooler',        'intercooler',     '❄️',  NOW()),
  ('20000001-0000-0000-0000-000000000019'::uuid, 'Volante / Direção',  'steering',        '🎯',  NOW()),
  ('20000001-0000-0000-0000-000000000020'::uuid, 'Peças de Carroceria','bodywork',        '🚗',  NOW())
ON CONFLICT (slug) DO NOTHING;

