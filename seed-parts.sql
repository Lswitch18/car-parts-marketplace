-- =============================================
-- SEED DATA: 30 ANÚNCIOS DE PEÇAS JDM
-- Execute no Supabase SQL Editor
-- =============================================

-- =============================================
-- 1. CRIAR PERFIS DE VENDEDORES (se não existirem)
-- =============================================

INSERT INTO public.profiles (id, email, full_name, phone, address, cep, role, rating, is_verified, bio)
VALUES 
  (gen_random_uuid(), 'tanaka.jdm@example.com', 'Tanaka JDM Parts', '090-1111-1111', 'Tokyo, Shibuya', '150-0001', 'seller', 4.8, true, 'Especialista em peças Nissan e Toyota'),
  (gen_random_uuid(), 'tokyo.racing@example.com', 'Tokyo Racing Shop', '090-2222-2222', 'Osaka, Osaka', '530-0001', 'seller', 4.6, true, 'Peças JDM de qualidade com preço justo'),
  (gen_random_uuid(), 'jdm.kyushu@example.com', 'Kyushu JDM Motors', '090-3333-3333', 'Fukuoka, Hakata', '812-0001', 'seller', 4.9, true, 'Revendedor profissional de peças japonesas')
ON CONFLICT (email) DO NOTHING;

-- =============================================
-- 2. INSERIR 30 ANÚNCIOS VARIADOS
-- =============================================

INSERT INTO public.parts (seller_id, brand_id, model_id, category_id, title, description, condition, price, images, status, views, featured, created_at) VALUES

-- NISSAN GT-R & SKYLINE (5 anúncios)
((SELECT id FROM public.profiles WHERE email = 'tanaka.jdm@example.com' LIMIT 1), '11111111-1111-1111-1111-111111111111', (SELECT id FROM public.car_models WHERE slug = 'gt-r-r35' LIMIT 1), (SELECT id FROM public.categories WHERE slug = 'engine' LIMIT 1), 'Nissan GT-R R35 RB26DETT Motor Completo', 'Motor RB26DETT completo de GT-R R35. Baixa quilometragem, inspecionado profissionalmente. Perfeito para swap ou reconstrução. Inclui todos os acessórios.', 'excellent', 45000.00, ARRAY['https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400'], 'active', 245, true, NOW() - INTERVAL '2 days'),

((SELECT id FROM public.profiles WHERE email = 'tokyo.racing@example.com' LIMIT 1), '11111111-1111-1111-1111-111111111111', (SELECT id FROM public.car_models WHERE slug = 'skyline-r34' LIMIT 1), (SELECT id FROM public.categories WHERE slug = 'turbo-boost' LIMIT 1), 'Nissan Skyline R34 Turbo HKS GT3540', 'Turbo HKS GT3540 para Skyline R34. Estado excelente, baixa milhagem. Ideal para builds de 600+ HP. Inclui juntas e linhas de óleo.', 'like_new', 12500.00, ARRAY['https://images.unsplash.com/photo-1626668893632-6f393e3f7208?w=400'], 'active', 189, true, NOW() - INTERVAL '5 days'),

((SELECT id FROM public.profiles WHERE email = 'jdm.kyushu@example.com' LIMIT 1), '11111111-1111-1111-1111-111111111111', (SELECT id FROM public.car_models WHERE slug = 'silvia-s15' LIMIT 1), (SELECT id FROM public.categories WHERE slug = 'body-kits' LIMIT 1), 'Nissan Silvia S15 Body Kit Top Secret Carbon', 'Body kit completo Top Secret em fibra de carbono. Incluye frente, saias laterais, difusor traseiro e asa GT. Estado excelente.', 'excellent', 8500.00, ARRAY['https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9?w=400'], 'active', 234, true, NOW() - INTERVAL '4 days'),

((SELECT id FROM public.profiles WHERE email = 'tanaka.jdm@example.com' LIMIT 1), '11111111-1111-1111-1111-111111111111', (SELECT id FROM public.car_models WHERE slug = 'skyline-r34' LIMIT 1), (SELECT id FROM public.categories WHERE slug = 'brakes' LIMIT 1), 'Nissan Skyline R34 Kit de Freios AP Racing', 'Kit de freios AP Racing para R34 GT-R. 6 pistões dianteiro, 4 traseiro. Inclui rotores, pastilhas e linhas. Estado excelente.', 'like_new', 7500.00, ARRAY['https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400'], 'active', 167, false, NOW() - INTERVAL '5 days'),

((SELECT id FROM public.profiles WHERE email = 'tokyo.racing@example.com' LIMIT 1), '11111111-1111-1111-1111-111111111111', (SELECT id FROM public.car_models WHERE slug = 'fairlady-z-z33' LIMIT 1), (SELECT id FROM public.categories WHERE slug = 'aero' LIMIT 1), 'Nissan Fairlady Z Z33 Side Skirts Varis Carbon', 'Saias laterais genuínas Varis em fibra de carbono para Z33. Ajuste perfeito, excelente condição. Adiciona visual agressivo.', 'good', 2200.00, ARRAY['https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9?w=400'], 'active', 68, false, NOW() - INTERVAL '10 days'),

-- TOYOTA SUPRA & AE86 (5 anúncios)
((SELECT id FROM public.profiles WHERE email = 'jdm.kyushu@example.com' LIMIT 1), '22222222-2222-2222-2222-222222222222', (SELECT id FROM public.car_models WHERE slug = 'supra-a80' LIMIT 1), (SELECT id FROM public.categories WHERE slug = 'turbo-boost' LIMIT 1), 'Toyota Supra A80 Turbo 2JZ-GTE HKS GT3540', 'Turbocompressor HKS GT3540 para Supra A80. Estado excelente. Perfeito para builds de 600+ HP. Inclui gomas e linhas de óleo.', 'like_new', 12500.00, ARRAY['https://images.unsplash.com/photo-1626668893632-6f393e3f7208?w=400'], 'active', 198, true, NOW() - INTERVAL '3 days'),

((SELECT id FROM public.profiles WHERE email = 'tanaka.jdm@example.com' LIMIT 1), '22222222-2222-2222-2222-222222222222', (SELECT id FROM public.car_models WHERE slug = 'ae86' LIMIT 1), (SELECT id FROM public.categories WHERE slug = 'suspension' LIMIT 1), 'Toyota AE86 Cusco Barra Estabilizadora Dianteira', 'Barra estabilizadora Cusco dianteira para AE86. Ótimo para melhorar a dirigibilidade. Mínima oxidação, todo hardware incluído.', 'good', 1200.00, ARRAY['https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=400'], 'active', 67, false, NOW() - INTERVAL '8 days'),

((SELECT id FROM public.profiles WHERE email = 'tokyo.racing@example.com' LIMIT 1), '22222222-2222-2222-2222-222222222222', (SELECT id FROM public.car_models WHERE slug = 'mr2-sw20' LIMIT 1), (SELECT id FROM public.categories WHERE slug = 'wheels-rims' LIMIT 1), 'Toyota MR2 SW20 Rodas Rays CE28N 16 polegadas', 'Conjunto de rodas Rays CE28N 3 peças. 16x7 dianteira, 16x8 traseira. Excelente estado, sem riscos. Inclui pneus com 70% de banda.', 'excellent', 4500.00, ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'], 'active', 89, false, NOW() - INTERVAL '7 days'),

((SELECT id FROM public.profiles WHERE email = 'jdm.kyushu@example.com' LIMIT 1), '22222222-2222-2222-2222-222222222222', (SELECT id FROM public.car_models WHERE slug = 'chaser' LIMIT 1), (SELECT id FROM public.categories WHERE slug = 'engine' LIMIT 1), 'Toyota Chaser JZX100 1JZ-GTE VVT-i Motor', 'Motor 1JZ-GTE VVT-i completo do Chaser. 80k km, tudo funcionando perfeitamente. Inclui compressor de ar, alternador e motor de partida.', 'good', 8500.00, ARRAY['https://images.unsplash.com/photo-1607108838042-5249d803a856?w=400'], 'active', 156, false, NOW() - INTERVAL '4 days'),

((SELECT id FROM public.profiles WHERE email = 'tanaka.jdm@example.com' LIMIT 1), '22222222-2222-2222-2222-222222222222', (SELECT id FROM public.car_models WHERE slug = 'gt86' LIMIT 1), (SELECT id FROM public.categories WHERE slug = 'turbo-boost' LIMIT 1), 'Toyota GT86 Kit Turbo GReddy Completo', 'Kit turbo GReddy para GT86/BRZ. Inclui turbo, coletor, downpipe e toda tubulação. Pronto para instalar. Ideal para builds de 300+ HP.', 'excellent', 8500.00, ARRAY['https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=400'], 'active', 145, false, NOW() - INTERVAL '3 days'),

-- HONDA NSX & S2000 (5 anúncios)
((SELECT id FROM public.profiles WHERE email = 'tokyo.racing@example.com' LIMIT 1), '33333333-3333-3333-3333-333333333333', (SELECT id FROM public.car_models WHERE slug = 'nsx-na1' LIMIT 1), (SELECT id FROM public.categories WHERE slug = 'suspension' LIMIT 1), 'Honda NSX NA1 Suspenção TEIN Mono Coilover', 'Sistema de suspensão TEIN Mono Sport coilover para NSX NA1. Amortecimento totalmente ajustável, altura ajustável. Grande condição com registros de serviço.', 'excellent', 8500.00, ARRAY['https://images.unsplash.com/photo-1607108838042-5249d803a856?w=400'], 'active', 156, true, NOW() - INTERVAL '3 days'),

((SELECT id FROM public.profiles WHERE email = 'jdm.kyushu@example.com' LIMIT 1), '33333333-3333-3333-3333-333333333333', (SELECT id FROM public.car_models WHERE slug = 's2000-ap1' LIMIT 1), (SELECT id FROM public.categories WHERE slug = 'engine' LIMIT 1), 'Honda S2000 AP1 Motor K20A Completo Swap', 'Motor K20A completo de S2000 JDM. 60k milhas, compressão perfeita. Inclui chicote, ECU e todos os acessórios. Perfeito para swap em S2000.', 'excellent', 15000.00, ARRAY['https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400'], 'active', 278, true, NOW() - INTERVAL '2 days'),

((SELECT id FROM public.profiles WHERE email = 'tanaka.jdm@example.com' LIMIT 1), '33333333-3333-3333-3333-333333333333', (SELECT id FROM public.car_models WHERE slug = 'civic-type-r-ek9' LIMIT 1), (SELECT id FROM public.categories WHERE slug = 'suspension' LIMIT 1), 'Honda Civic EK9 Coilovers Buddy Club Racing', 'Coilovers Buddy Club Racing Spec para EK9. Totalmente ajustável, originais do Japão. Excelente condição com knobs de amortecimento ajustáveis.', 'excellent', 4500.00, ARRAY['https://images.unsplash.com/photo-1593055491718-64b187514a8b?w=400'], 'active', 134, false, NOW() - INTERVAL '6 days'),

((SELECT id FROM public.profiles WHERE email = 'tokyo.racing@example.com' LIMIT 1), '33333333-3333-3333-3333-333333333333', (SELECT id FROM public.car_models WHERE slug = 'integra-type-r' LIMIT 1), (SELECT id FROM public.categories WHERE slug = 'brakes' LIMIT 1), 'Honda Integra Type R DC2 Kit de Freios Brembo', 'Kit de freios Brembo para Integra Type R DC2. Calipers de 4 pistões, rotores upgraded e pastilhas de desempenho. Excelente condição. Melora dramaticamente a frenagem.', 'excellent', 4200.00, ARRAY['https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400'], 'active', 95, false, NOW() - INTERVAL '5 days'),

((SELECT id FROM public.profiles WHERE email = 'jdm.kyushu@example.com' LIMIT 1), '33333333-3333-3333-3333-333333333333', (SELECT id FROM public.car_models WHERE slug = 'prelude' LIMIT 1), (SELECT id FROM public.categories WHERE slug = 'engine' LIMIT 1), 'Honda Prelude H22A Motor JDM', 'Motor H22A 4ª geração do Prelude JDM. Completo com todos os acessórios. 75k milhas, funciona perfeitamente. Ótimo para swap ou upgrade.', 'good', 5500.00, ARRAY['https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400'], 'active', 54, false, NOW() - INTERVAL '12 days'),

-- MAZDA RX-7 & MX-5 (5 anúncios)
((SELECT id FROM public.profiles WHERE email = 'tanaka.jdm@example.com' LIMIT 1), '44444444-4444-4444-4444-444444444444', (SELECT id FROM public.car_models WHERE slug = 'rx7-fd3s' LIMIT 1), (SELECT id FROM public.categories WHERE slug = 'engine' LIMIT 1), 'Mazda RX-7 FD3S Motor 13B-REW Low Mileage', 'Motor 13B-REW twin rotary com apenas 45.000 milhas. Completo com todos os acessórios. Perfeito para swap ou restauração. Inclui histórico de serviço completo.', 'excellent', 18000.00, ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'], 'active', 312, true, NOW() - INTERVAL '1 day'),

((SELECT id FROM public.profiles WHERE email = 'tokyo.racing@example.com' LIMIT 1), '44444444-4444-4444-4444-444444444444', (SELECT id FROM public.car_models WHERE slug = 'rx7-fc3s' LIMIT 1), (SELECT id FROM public.categories WHERE slug = 'turbo-boost' LIMIT 1), 'Mazda RX-7 FC3S Turbo Trust TD06 Kit Completo', 'Kit turbo Trust TD06 para RX-7 FC3S. Inclui turbo, coletor, dump pipe e tubulação de intercooler. Ótimo para builds de 400+ HP. Estado excelente.', 'excellent', 7500.00, ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'], 'active', 189, true, NOW() - INTERVAL '2 days'),

((SELECT id FROM public.profiles WHERE email = 'jdm.kyushu@example.com' LIMIT 1), '44444444-4444-4444-4444-444444444444', (SELECT id FROM public.car_models WHERE slug = 'mx5-nd' LIMIT 1), (SELECT id FROM public.categories WHERE slug = 'interior' LIMIT 1), 'Mazda MX-5 ND Assentos Bride Zeta III Preto', 'Par de assentos桶 Bucket Bride Zeta III em preto. Condição perfeita, sem rasgos ou desgaste. Inclui trilhos e sliders. Ideal para track ou street build.', 'excellent', 2800.00, ARRAY['https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=400'], 'active', 45, false, NOW() - INTERVAL '10 days'),

((SELECT id FROM public.profiles WHERE email = 'tanaka.jdm@example.com' LIMIT 1), '44444444-4444-4444-4444-444444444444', (SELECT id FROM public.car_models WHERE slug = 'rx8' LIMIT 1), (SELECT id FROM public.categories WHERE slug = 'engine' LIMIT 1), 'Mazda RX-8 Motor 13B-MSP Renesis Long Block', 'Motor 13B-MSP Renesis long block. 50k milhas. Sem problemas de compressão, tudo bom. Inclui coletores de escape. Ótimo para swap ou reconstrução.', 'good', 9500.00, ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'], 'active', 87, false, NOW() - INTERVAL '6 days'),

((SELECT id FROM public.profiles WHERE email = 'tokyo.racing@example.com' LIMIT 1), '44444444-4444-4444-4444-444444444444', (SELECT id FROM public.car_models WHERE slug = 'mx5-nc' LIMIT 1), (SELECT id FROM public.categories WHERE slug = 'wheels-rims' LIMIT 1), 'Mazda MX-5 NC Rodas Work Emotion XR5', 'Rodas Work Emotion XR5 18x9.5 dianteira, 18x10.5 traseira. Boa condição com dano menor em 2 rodas. Inclui pneus 80% banda. Grande valor!', 'good', 2800.00, ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'], 'active', 56, false, NOW() - INTERVAL '9 days'),

-- SUBARU WRX STI & BRZ (5 anúncios)
((SELECT id FROM public.profiles WHERE email = 'jdm.kyushu@example.com' LIMIT 1), '55555555-5555-5555-5555-555555555555', (SELECT id FROM public.car_models WHERE slug = 'wrx-sti-gdb' LIMIT 1), (SELECT id FROM public.categories WHERE slug = 'turbo-boost' LIMIT 1), 'Subaru WRX STI GDB Turbo Garrett VF35', 'Turbocompressor Garrett GT35R do WRX STI GDB. Excelente condição, baixa milhagem. Inclui up-pipe e manifold do turbo. Pronto para instalação.', 'excellent', 7500.00, ARRAY['https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=400'], 'active', 98, false, NOW() - INTERVAL '5 days'),

((SELECT id FROM public.profiles WHERE email = 'tanaka.jdm@example.com' LIMIT 1), '55555555-5555-5555-5555-555555555555', (SELECT id FROM public.car_models WHERE slug = 'brz-zc6' LIMIT 1), (SELECT id FROM public.categories WHERE slug = 'wings-spoilers' LIMIT 1), 'Subaru BRZ Asa GT Voltex Type 5 Carbono', 'Asa GT Voltex Type 5 em fibra de carbono genuína. Ângulo ajustável. Ajuste perfeito para BRZ/86. Inclui suporte e todo hardware de montagem.', 'excellent', 3800.00, ARRAY['https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=400'], 'active', 112, false, NOW() - INTERVAL '7 days'),

((SELECT id FROM public.profiles WHERE email = 'tokyo.racing@example.com' LIMIT 1), '55555555-5555-5555-5555-555555555555', (SELECT id FROM public.car_models WHERE slug = 'wrx-sti-gc8' LIMIT 1), (SELECT id FROM public.categories WHERE slug = 'lighting' LIMIT 1), 'Subaru Impreza GC8 Faróis JDM STi Complete', 'Conjunto completo de faróis JDM STi para Impreza GC8. Excelente condição, sem rachaduras ou umidade. Inclui lâmpadas e chicote. Ajuste direto.', 'excellent', 1800.00, ARRAY['https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400'], 'active', 92, false, NOW() - INTERVAL '4 days'),

((SELECT id FROM public.profiles WHERE email = 'jdm.kyushu@example.com' LIMIT 1), '55555555-5555-5555-5555-555555555555', (SELECT id FROM public.car_models WHERE slug = 'wrx-sti-vab' LIMIT 1), (SELECT id FROM public.categories WHERE slug = 'wheels-rims' LIMIT 1), 'Subaru WRX STI VAB Rodas BBS RI-A 18pol', 'Rodas BBS RI-A em gunmetal para STI VAB. Conjunto 18x8.5. Excelente condição, sem riscos. Inclui tampas de centro. Perfeito para street build.', 'like_new', 3200.00, ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'], 'active', 78, false, NOW() - INTERVAL '7 days'),

((SELECT id FROM public.profiles WHERE email = 'tanaka.jdm@example.com' LIMIT 1), '55555555-5555-5555-5555-555555555555', (SELECT id FROM public.car_models WHERE slug = 'impreza-22b' LIMIT 1), (SELECT id FROM public.categories WHERE slug = 'suspension' LIMIT 1), 'Subaru Impreza 22B Suspenção Öhlins Road & Track', 'Suspensão Öhlins Road & Track para Impreza 22B. Totalmente ajustável, originais do Japão. Excelente condição. Perfeito para street e track.', 'excellent', 5800.00, ARRAY['https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400'], 'active', 112, false, NOW() - INTERVAL '5 days'),

-- MITSUBISHI LANCER EVO (5 anúncios)
((SELECT id FROM public.profiles WHERE email = 'tokyo.racing@example.com' LIMIT 1), '66666666-6666-6666-6666-666666666666', (SELECT id FROM public.car_models WHERE slug = 'lancer-evo-6' LIMIT 1), (SELECT id FROM public.categories WHERE slug = 'exhaust' LIMIT 1), 'Mitsubishi Lancer Evo VI Escape HKS Titânio', 'Sistema de escape HKS Championship em titânio. Cat-back, valvetronic incluído. Excelente condition, sem amassados ou riscos. Melhoria dramática no som.', 'excellent', 6200.00, ARRAY['https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400'], 'active', 145, false, NOW() - INTERVAL '4 days'),

((SELECT id FROM public.profiles WHERE email = 'tanaka.jdm@example.com' LIMIT 1), '66666666-6666-6666-6666-666666666666', (SELECT id FROM public.car_models WHERE slug = 'lancer-evo-7-9' LIMIT 1), (SELECT id FROM public.categories WHERE slug = 'suspension' LIMIT 1), 'Mitsubishi Lancer Evo VII-IX Coilovers Öhlins', 'Coilovers Öhlins Road & Track para Evo 7-9. Totalmente ajustável, originais do Japão. Excelente condição. Perfeito para street e track.', 'excellent', 5800.00, ARRAY['https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400'], 'active', 112, false, NOW() - INTERVAL '6 days'),

((SELECT id FROM public.profiles WHERE email = 'jdm.kyushu@example.com' LIMIT 1), '66666666-6666-6666-6666-666666666666', (SELECT id FROM public.car_models WHERE slug = 'lancer-evo-x' LIMIT 1), (SELECT id FROM public.categories WHERE slug = 'turbo-boost' LIMIT 1), 'Mitsubishi Lancer Evo X Turbo TD06H-25G', 'Turbo TD06H-25G para Lancer Evo X. Bom condition, recentemente revisado. Inclui gomas e linhas de óleo. Pronto para instalação.', 'good', 4500.00, ARRAY['https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=400'], 'active', 78, false, NOW() - INTERVAL '8 days'),

((SELECT id FROM public.profiles WHERE email = 'tanaka.jdm@example.com' LIMIT 1), '66666666-6666-6666-6666-666666666666', (SELECT id FROM public.car_models WHERE slug = 'fto' LIMIT 1), (SELECT id FROM public.categories WHERE slug = 'cooling' LIMIT 1), 'Mitsubishi FTO Radiador ARC Alumínio', 'Radiador de alumínio ARC para FTO GPX/MK2. Mantém temperaturas mesmo em track. Excelente condição sem danos. Substituição direta.', 'like_new', 1200.00, ARRAY['https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400'], 'active', 23, false, NOW() - INTERVAL '12 days'),

((SELECT id FROM public.profiles WHERE email = 'tokyo.racing@example.com' LIMIT 1), '66666666-6666-6666-6666-666666666666', (SELECT id FROM public.car_models WHERE slug = '3000gt' LIMIT 1), (SELECT id FROM public.categories WHERE slug = 'engine' LIMIT 1), 'Mitsubishi 3000GT Motor 6G72 V6 Twin Turbo', 'Motor 6G72 V6 twin turbo do 3000GT. Boa condição, 65k milhas. Completo com todos os acessórios. Perfeito para swap ou restauração.', 'good', 6500.00, ARRAY['https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400'], 'active', 67, false, NOW() - INTERVAL '10 days');

-- =============================================
-- 3. VERIFICAR INSERÇÕES
-- =============================================

SELECT 
  COUNT(*) as total_anuncios,
  COUNT(*) FILTER (WHERE status = 'active') as anuncios_ativos,
  COUNT(*) FILTER (WHERE featured = true) as anuncios_destaque
FROM public.parts;

-- Ver por marca
SELECT 
  b.name as marca,
  COUNT(p.id) as total
FROM public.parts p
JOIN public.brands b ON p.brand_id = b.id
GROUP BY b.name
ORDER BY total DESC;

-- Ver por categoria
SELECT 
  c.name as categoria,
  COUNT(p.id) as total
FROM public.parts p
JOIN public.categories c ON p.category_id = c.id
GROUP BY c.name
ORDER BY total DESC;