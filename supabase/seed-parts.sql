-- Seed de peças JDM para teste do catálogo
-- Rode no SQL Editor do Supabase: https://supabase.com/dashboard/project/clqubcryhbrjlupkgeva/sql/new

-- Primeiro pega um user existente como vendedor (ou cria um seed)
DO $$
DECLARE
  seller_id UUID;
BEGIN
  -- Tenta pegar o primeiro user disponível
  SELECT id INTO seller_id FROM public.profiles LIMIT 1;

  -- Se não existir profiles, usa um UUID fixo para demo
  IF seller_id IS NULL THEN
    seller_id := '00000000-0000-0000-0000-000000000001'::uuid;
  END IF;

  INSERT INTO public.parts (title, description, price, condition, brand_id, category_id, images, status, seller_id, year, model_id)
  SELECT * FROM (VALUES
    ('GT-R RB26DETT Twin Turbo Motor Completo', 'Motor RB26DETT original Nissan Skyline GT-R R34. 2.6L inline-6 biturbo, 280cv. Compleo com turbos, intercooler e ECU. Ideal para restauração ou swap.', 450000, 'used', '11111111-1111-1111-1111-111111111111', 'engine', ARRAY['https://images.unsplash.com/photo-1601369820466-67de64cedcc8?w=800'], 'active', seller_id, 1999, 'GT-R'),
    ('Supra 2JZ-GTE Motor Completo', 'Motor 2JZ-GTE do Toyota Supra MKIV. 3.0L inline-6 biturbo. Bloco e cabeçote originais, com turbos Greddy T67-25G. Acompanha aranha de admissão e injeção.', 380000, 'used', '22222222-2222-2222-2222-222222222222', 'engine', ARRAY['https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800'], 'active', seller_id, 1997, 'Supra'),
    ('JDM Body Kit Completo Veilside RX-7', 'Kit aerodinâmico Veilside Fortune para Mazda RX-7 FD3S. Para-choques dianteiro e traseiro, saias laterais e aerofólio. Material: FRP de alta qualidade. Pintura cinza escuro.', 125000, 'new', '44444444-4444-4444-4444-444444444444', 'body-kits', ARRAY['https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800'], 'active', seller_id, 2002, 'RX-7'),
    ('JDM Rodas Work Meister S1 18"', 'Jogo de rodas Work Meister S1 18x9.5 +22 5x114.3. Cor Bronze polido. Acompanha calotas center lock e válvulas. Estado excelente, sem amassados ou riscos profundos.', 89000, 'used', '44444444-4444-4444-4444-444444444444', 'wheels', ARRAY['https://images.unsplash.com/photo-1561211970-ff16e0a16360?w=800'], 'active', seller_id, 2020, 'RX-7'),
    ('HKS Hi-Power Exhaust Supra MKIV', 'Sistema de escape completo HKS Hi-Power para Toyota Supra MKIV (JZA80). Downpipe, mid-pipe e silenciador traseiro em aço inoxidável. Som grave e agressivo. Certificado JASMA.', 65000, 'new', '22222222-2222-2222-2222-222222222222', 'exhaust', ARRAY['https://images.unsplash.com/photo-1611016186353-9af58c069a7a?w=800'], 'active', seller_id, 1997, 'Supra'),
    ('TEIN Flex Z Coilovers Nissan GT-R R35', 'Suspensão coilover TEIN Flex Z para Nissan GT-R R35. Ajuste de altura 32 níveis, amortecedor rebitável. Molas progressivas. Melhor custo-benefício para track day.', 32000, 'new', '11111111-1111-1111-1111-111111111111', 'suspension', ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800'], 'active', seller_id, 2020, 'GT-R'),
    ('Brembo GT Brake Kit 6 pistões', 'Kit de freio Brembo Gran Turismo 6 pistões dianteiro para Subaru WRX STI. Discos 355mm x 32mm flutuantes. Pastilhas esportivas. Linhas de freio trançadas inclusas.', 78000, 'new', '55555555-5555-5555-5555-555555555555', 'brakes', ARRAY['https://images.unsplash.com/photo-1600701246674-dc14837c7a81?w=800'], 'active', seller_id, 2010, 'WRX STI'),
    ('Recaro Pole Position Bucket Seat', 'Banco concha Recaro Pole Position ABE. Estrutura em fibra de vidro, estofamento em Alcântara preto. Certificado FIA. Sliders e suportes inclusos. Peso: 7.5kg.', 24000, 'used', '33333333-3333-3333-3333-333333333333', 'interior', ARRAY['https://images.unsplash.com/photo-1595597275035-3ad24c4fdc5c?w=800'], 'active', seller_id, 2022, 'NSX'),
    ('Garrett GTX3582R Gen II Turbo', 'Turbocompressor Garrett GTX3582R Gen II. 58mm indutor, 82mm exaustor. Dual ball bearing. Suporta até 850hp. Ideal para 2JZ, RB26, 4G63.', 52000, 'new', '66666666-6666-6666-6666-666666666666', 'turbo', ARRAY['https://images.unsplash.com/photo-1600710972000-6f9aad0e6b19?w=800'], 'active', seller_id, 2024, 'Lancer Evo'),
    ('APR Performance GT-250 Wing', 'Aerofólio universal APR Performance GT-250. Banda de carbono 250mm, altura ajustável. Base de alumínio anodizado. Produz mais de 200kg de downforce a 200km/h.', 45000, 'new', '77777777-7777-7777-7777-777777777777', 'wings-spoilers', ARRAY['https://images.unsplash.com/photo-1617469767053-d3b7f2922cff?w=800'], 'active', seller_id, 2024, 'LFA'),
    ('Greddy Oil Cooler Kit 19 rows', 'Kit de radiador de óleo Greddy 19 fileiras com suporte de montagem. Ideal para track days e drift. Acompanha mangueiras AN-10, adaptadores e termostato Mocal.', 18000, 'new', '11111111-1111-1111-1111-111111111111', 'cooling', ARRAY['https://images.unsplash.com/photo-1605414521750-15aa49a9c54e?w=800'], 'active', seller_id, 2023, 'Silvia'),
    ('Haltech Elite 2500 ECU', 'Central Haltech Elite 2500. Plug-and-play para Nissan RB e Toyota JZ. Controle de ignição e injeção individual, launch control, flat shift, data logging. Suporte a flex fuel.', 35000, 'new', '22222222-2222-2222-2222-222222222222', 'electronics', ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800'], 'active', seller_id, 2024, 'AE86'),
    ('Cusco LSD Tipo RS 1.5 Way', 'Diferencial de deslizamento limitado Cusco Tipo RS 1.5 way para Nissan Silvia S15. Ideal para drift e track. Discos de carbono de alto torque. Inclui óleo Cusco.', 22000, 'used', '11111111-1111-1111-1111-111111111111', 'transmission', ARRAY['https://images.unsplash.com/photo-1600701246674-dc14837c7a81?w=800'], 'active', seller_id, 2002, 'Silvia'),
    ('JDM LED Tail Lights Toyota AE86', 'Lanternas traseiras LED estilo originais para Toyota AE86 Trueno. Efeito sequencial nas setas. Plug and play. Acabamento smoke black. Homologadas.', 12000, 'new', '22222222-2222-2222-2222-222222222222', 'lighting', ARRAY['https://images.unsplash.com/photo-1617469767053-d3b7f2922cff?w=800'], 'active', seller_id, 1988, 'AE86'),
    ('HKS Fuel Rail Kit RB26', 'Rampa de combustível HKS para Nissan RB26DETT. Aço inoxidável polido. Regulador de pressão incluso. Suporta até 1000hp. Injetores e linhas AN-6 inclusos.', 25000, 'new', '11111111-1111-1111-1111-111111111111', 'fuel', ARRAY['https://images.unsplash.com/photo-1605414521750-15aa49a9c54e?w=800'], 'active', seller_id, 1999, 'GT-R'),
    ('Carbon Fiber Hood Subaru WRX STI', 'Capô em fibra de carbono para Subaru WRX STI GD/GH. Peso 4.5kg (original 12kg). Entradas de ar NACA funcionais. Acabamento em carbon twill 2x2. Pinças de aço inoxidável.', 28000, 'new', '55555555-5555-5555-5555-555555555555', 'body-kits', ARRAY['https://images.unsplash.com/photo-1601369820466-67de64cedcc8?w=800'], 'active', seller_id, 2008, 'WRX STI'),
    ('Blitz Nur Spec R Catback Exhaust', 'Escape Blitz Nur Spec R para Nissan GT-R R34. Silenciador traseiro em titânio com ponteira de 115mm. Nota de escape agressiva. Sistema completo catback.', 48000, 'new', '11111111-1111-1111-1111-111111111111', 'exhaust', ARRAY['https://images.unsplash.com/photo-1611016186353-9af58c069a7a?w=800'], 'active', seller_id, 1999, 'GT-R'),
    ('KW V3 Coilovers Honda NSX', 'Suspensão coilover KW Variant 3 para Honda NSX NA1/NA2. Amortecedores ajustáveis em compressão e extensão. Molas progressivas. Altura ajustável. Certificado TÜV.', 38000, 'new', '33333333-3333-3333-3333-333333333333', 'suspension', ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800'], 'active', seller_id, 1997, 'NSX')
  ) AS src(title, description, price, condition, brand_id, category_id, images, status, seller_id, year, model_id)
  WHERE NOT EXISTS (SELECT 1 FROM public.parts LIMIT 1);

  RAISE NOTICE 'Seed de peças concluído!';
END $$;
