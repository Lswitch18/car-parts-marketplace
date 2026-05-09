-- =============================================
-- SEED DATA: 30 ANÚNCIOS JDM - COMPLETO
-- Execute tudo de uma vez no Supabase SQL Editor
-- =============================================

-- 1. CRIAR VENDEDORES
INSERT INTO public.profiles (id, email, full_name, phone, address, cep, role, rating, is_verified, bio)
VALUES 
  (gen_random_uuid(), 'tanaka.jdm@example.com', 'Tanaka JDM Parts', '090-1111-1111', 'Tokyo, Shibuya', '150-0001', 'seller', 4.8, true, 'Especialista em peças Nissan e Toyota'),
  (gen_random_uuid(), 'tokyo.racing@example.com', 'Tokyo Racing Shop', '090-2222-2222', 'Osaka, Osaka', '530-0001', 'seller', 4.6, true, 'Peças JDM de qualidade com preço justo'),
  (gen_random_uuid(), 'jdm.kyushu@example.com', 'Kyushu JDM Motors', '090-3333-3333', 'Fukuoka, Hakata', '812-0001', 'seller', 4.9, true, 'Revendedor profissional de peças japonesas')
ON CONFLICT (email) DO NOTHING;

-- 2. PEGAR IDs
DO $$
DECLARE
  v_nissan UUID;
  v_toyota UUID;
  v_honda UUID;
  v_mazda UUID;
  v_subaru UUID;
  v_mitsubishi UUID;
  v_engine UUID;
  v_turbo UUID;
  v_suspension UUID;
  v_bodykits UUID;
  v_wheels UUID;
  v_brakes UUID;
  v_aero UUID;
  v_exhaust UUID;
  v_cooling UUID;
  v_interior UUID;
  v_lighting UUID;
  v_tanaka UUID;
  v_tokyo UUID;
  v_kyushu UUID;
  v_gt_r35 UUID;
  v_supra_a80 UUID;
  v_nsx_na1 UUID;
  v_rx7_fd3s UUID;
  v_rx8 UUID;
  v_wrxb_sti_gdb UUID;
  v_brz_zc6 UUID;
  v_evo_vi UUID;
BEGIN
  -- Brands
  SELECT id INTO v_nissan FROM public.brands WHERE name = 'Nissan';
  SELECT id INTO v_toyota FROM public.brands WHERE name = 'Toyota';
  SELECT id INTO v_honda FROM public.brands WHERE name = 'Honda';
  SELECT id INTO v_mazda FROM public.brands WHERE name = 'Mazda';
  SELECT id INTO v_subaru FROM public.brands WHERE name = 'Subaru';
  SELECT id INTO v_mitsubishi FROM public.brands WHERE name = 'Mitsubishi';

  -- Categories
  SELECT id INTO v_engine FROM public.categories WHERE slug = 'engine';
  SELECT id INTO v_turbo FROM public.categories WHERE slug = 'turbo-boost';
  SELECT id INTO v_suspension FROM public.categories WHERE slug = 'suspension';
  SELECT id INTO v_bodykits FROM public.categories WHERE slug = 'body-kits';
  SELECT id INTO v_wheels FROM public.categories WHERE slug = 'wheels-rims';
  SELECT id INTO v_brakes FROM public.categories WHERE slug = 'brakes';
  SELECT id INTO v_aero FROM public.categories WHERE slug = 'aero';
  SELECT id INTO v_exhaust FROM public.categories WHERE slug = 'exhaust';
  SELECT id INTO v_cooling FROM public.categories WHERE slug = 'cooling';
  SELECT id INTO v_interior FROM public.categories WHERE slug = 'interior';
  SELECT id INTO v_lighting FROM public.categories WHERE slug = 'lighting';

  -- Sellers
  SELECT id INTO v_tanaka FROM public.profiles WHERE email = 'tanaka.jdm@example.com';
  SELECT id INTO v_tokyo FROM public.profiles WHERE email = 'tokyo.racing@example.com';
  SELECT id INTO v_kyushu FROM public.profiles WHERE email = 'jdm.kyushu@example.com';

  -- Models
  SELECT id INTO v_gt_r35 FROM public.car_models WHERE slug = 'gt-r-r35' AND brand_id = v_nissan;
  SELECT id INTO v_supra_a80 FROM public.car_models WHERE slug = 'supra-a80' AND brand_id = v_toyota;
  SELECT id INTO v_nsx_na1 FROM public.car_models WHERE slug = 'nsx-na1' AND brand_id = v_honda;
  SELECT id INTO v_rx7_fd3s FROM public.car_models WHERE slug = 'rx7-fd3s' AND brand_id = v_mazda;
  SELECT id INTO v_rx8 FROM public.car_models WHERE slug = 'rx8' AND brand_id = v_mazda;
  SELECT id INTO v_wrxb_sti_gdb FROM public.car_models WHERE slug = 'wrx-sti-gdb' AND brand_id = v_subaru;
  SELECT id INTO v_brz_zc6 FROM public.car_models WHERE slug = 'brz-zc6' AND brand_id = v_subaru;
  SELECT id INTO v_evo_vi FROM public.car_models WHERE slug = 'lancer-evo-6' AND brand_id = v_mitsubishi;

  -- INSERT PARTS - NISSAN (5)
  INSERT INTO public.parts (seller_id, brand_id, model_id, category_id, title, description, condition, price, images, status, views, featured, created_at)
  VALUES 
    (v_tanaka, v_nissan, v_gt_r35, v_engine, 'Nissan GT-R R35 RB26DETT Motor Completo', 'Motor RB26DETT completo de GT-R R35. Baixa quilometragem, inspecionado profissionalmente.', 'excellent', 45000.00, ARRAY['https://via.placeholder.com/400?text=RB26DETT'], 'active', 245, true, NOW() - INTERVAL '2 days'),
    (v_tokyo, v_nissan, v_gt_r35, v_turbo, 'Nissan GT-R R34 Turbo HKS GT3540', 'Turbo HKS GT3540 para R34. Ideal para builds de 600+ HP.', 'like_new', 12500.00, ARRAY['https://via.placeholder.com/400?text=HKS+Turbo'], 'active', 189, true, NOW() - INTERVAL '5 days'),
    (v_kyushu, v_nissan, v_gt_r35, v_bodykits, 'Nissan GT-R R35 Body Kit Carbon', 'Body kit completo em fibra de carbono para R35.', 'excellent', 8500.00, ARRAY['https://via.placeholder.com/400?text=Body+Kit'], 'active', 234, true, NOW() - INTERVAL '4 days'),
    (v_tanaka, v_nissan, v_gt_r35, v_brakes, 'Nissan GT-R R34 Kit de Freios AP Racing', 'Kit de freios AP Racing para R34 GT-R.', 'like_new', 7500.00, ARRAY['https://via.placeholder.com/400?text=Brakes'], 'active', 167, false, NOW() - INTERVAL '5 days'),
    (v_tokyo, v_nissan, v_gt_r35, v_aero, 'Nissan Fairlady Z Z33 Aero Kit', 'Kit aero para Fairlady Z Z33.', 'good', 2200.00, ARRAY['https://via.placeholder.com/400?text=Aero'], 'active', 68, false, NOW() - INTERVAL '10 days');

  -- INSERT PARTS - TOYOTA (5)
  INSERT INTO public.parts (seller_id, brand_id, model_id, category_id, title, description, condition, price, images, status, views, featured, created_at)
  VALUES 
    (v_kyushu, v_toyota, v_supra_a80, v_turbo, 'Toyota Supra A80 Turbo 2JZ HKS', 'Turbocompressor HKS GT3540 para Supra A80.', 'like_new', 12500.00, ARRAY['https://via.placeholder.com/400?text=Supra+Turbo'], 'active', 198, true, NOW() - INTERVAL '3 days'),
    (v_tanaka, v_toyota, v_supra_a80, v_suspension, 'Toyota Supra A80 Suspenção TEIN', 'Suspensão TEIN Mono para Supra A80.', 'excellent', 8500.00, ARRAY['https://via.placeholder.com/400?text=Suspension'], 'active', 156, false, NOW() - INTERVAL '6 days'),
    (v_tokyo, v_toyota, v_supra_a80, v_wheels, 'Toyota Supra Rodas Rays CE28N', 'Rodas Rays CE28N para Supra A80.', 'excellent', 4500.00, ARRAY['https://via.placeholder.com/400?text=Wheels'], 'active', 89, false, NOW() - INTERVAL '7 days'),
    (v_kyushu, v_toyota, v_supra_a80, v_exhaust, 'Toyota Supra A80 Escape Titanium', 'Escape titanium HKS para Supra.', 'excellent', 6200.00, ARRAY['https://via.placeholder.com/400?text=Exhaust'], 'active', 145, false, NOW() - INTERVAL '4 days'),
    (v_tanaka, v_toyota, v_supra_a80, v_engine, 'Toyota Supra A80 Motor 2JZ-GTE', 'Motor 2JZ-GTE completo para Supra A80.', 'good', 15000.00, ARRAY['https://via.placeholder.com/400?text=2JZ+Engine'], 'active', 278, true, NOW() - INTERVAL '2 days');

  -- INSERT PARTS - HONDA (5)
  INSERT INTO public.parts (seller_id, brand_id, model_id, category_id, title, description, condition, price, images, status, views, featured, created_at)
  VALUES 
    (v_tokyo, v_honda, v_nsx_na1, v_suspension, 'Honda NSX NA1 Suspenção TEIN', 'Suspensão TEIN Mono para NSX NA1.', 'excellent', 8500.00, ARRAY['https://via.placeholder.com/400?text=NSX+Coilovers'], 'active', 156, true, NOW() - INTERVAL '3 days'),
    (v_kyushu, v_honda, v_nsx_na1, v_engine, 'Honda NSX NA1 Motor C30A', 'Motor C30A completo para NSX NA1.', 'excellent', 18000.00, ARRAY['https://via.placeholder.com/400?text=NSX+Engine'], 'active', 234, true, NOW() - INTERVAL '1 day'),
    (v_tanaka, v_honda, v_nsx_na1, v_brakes, 'Honda NSX NA1 Kit de Freios', 'Kit de freios Brembo para NSX.', 'excellent', 4200.00, ARRAY['https://via.placeholder.com/400?text=NSX+Brakes'], 'active', 95, false, NOW() - INTERVAL '5 days'),
    (v_tokyo, v_honda, v_nsx_na1, v_wheels, 'Honda NSX NA1 Rodas Volk', 'Rodas Volk TE37 para NSX.', 'like_new', 3200.00, ARRAY['https://via.placeholder.com/400?text=NSX+Wheels'], 'active', 78, false, NOW() - INTERVAL '8 days'),
    (v_kyushu, v_honda, v_nsx_na1, v_interior, 'Honda NSX NA1 Volante Bride', 'Volante Bride para NSX.', 'excellent', 1800.00, ARRAY['https://via.placeholder.com/400?text=NSX+Steering'], 'active', 62, false, NOW() - INTERVAL '12 days');

  -- INSERT PARTS - MAZDA (5)
  INSERT INTO public.parts (seller_id, brand_id, model_id, category_id, title, description, condition, price, images, status, views, featured, created_at)
  VALUES 
    (v_tanaka, v_mazda, v_rx7_fd3s, v_engine, 'Mazda RX-7 FD3S Motor 13B-REW', 'Motor 13B-REW twin rotary para RX-7 FD3S.', 'excellent', 18000.00, ARRAY['https://via.placeholder.com/400?text=13B+REW'], 'active', 312, true, NOW() - INTERVAL '1 day'),
    (v_tokyo, v_mazda, v_rx7_fd3s, v_turbo, 'Mazda RX-7 FC3S Turbo Trust TD06', 'Kit turbo Trust TD06 para FC3S.', 'excellent', 7500.00, ARRAY['https://via.placeholder.com/400?text=TD06+Turbo'], 'active', 189, true, NOW() - INTERVAL '2 days'),
    (v_kyushu, v_mazda, v_rx8, v_suspension, 'Mazda RX-8 Suspenção Ohlins', 'Suspensão Ohlins para RX-8.', 'excellent', 5800.00, ARRAY['https://via.placeholder.com/400?text=RX8+Ohlins'], 'active', 112, false, NOW() - INTERVAL '6 days'),
    (v_tanaka, v_mazda, v_rx8, v_interior, 'Mazda RX-8 Assentos Bride', 'Assentos桶 Bride Zeta III para RX-8.', 'excellent', 2800.00, ARRAY['https://via.placeholder.com/400?text=Bride+Seats'], 'active', 45, false, NOW() - INTERVAL '10 days'),
    (v_tokyo, v_mazda, v_rx8, v_wheels, 'Mazda RX-8 Rodas Work', 'Rodas Work Emotion para RX-8.', 'good', 2800.00, ARRAY['https://via.placeholder.com/400?text=Work+Wheels'], 'active', 56, false, NOW() - INTERVAL '9 days');

  -- INSERT PARTS - SUBARU (5)
  INSERT INTO public.parts (seller_id, brand_id, model_id, category_id, title, description, condition, price, images, status, views, featured, created_at)
  VALUES 
    (v_kyushu, v_subaru, v_wrxb_sti_gdb, v_turbo, 'Subaru WRX STI GDB Turbo Garrett', 'Turbocompressor Garrett para WRX STI GDB.', 'excellent', 7500.00, ARRAY['https://via.placeholder.com/400?text=Garrett+Turbo'], 'active', 98, false, NOW() - INTERVAL '5 days'),
    (v_tanaka, v_subaru, v_brz_zc6, v_suspension, 'Subaru BRZ Suspenção TEIN', 'Suspensão TEIN para BRZ/86.', 'excellent', 4500.00, ARRAY['https://via.placeholder.com/400?text=BRZ+Coilovers'], 'active', 134, false, NOW() - INTERVAL '6 days'),
    (v_tokyo, v_subaru, v_brz_zc6, v_wheels, 'Subaru BRZ Rodas BBS', 'Rodas BBS RI-A para BRZ.', 'like_new', 3200.00, ARRAY['https://via.placeholder.com/400?text=BBS+Wheels'], 'active', 78, false, NOW() - INTERVAL '7 days'),
    (v_kyushu, v_subaru, v_wrxb_sti_gdb, v_lighting, 'Subaru WRX STI Faróis STi', 'Faróis originais STi para WRX STI.', 'excellent', 1800.00, ARRAY['https://via.placeholder.com/400?text=STi+Headlights'], 'active', 92, false, NOW() - INTERVAL '4 days'),
    (v_tanaka, v_subaru, v_brz_zc6, v_aero, 'Subaru BRZ Asa GT Carbono', 'Asa GT Voltex carbon para BRZ.', 'excellent', 3800.00, ARRAY['https://via.placeholder.com/400?text=GT+Wing'], 'active', 112, false, NOW() - INTERVAL '7 days');

  -- INSERT PARTS - MITSUBISHI (5)
  INSERT INTO public.parts (seller_id, brand_id, model_id, category_id, title, description, condition, price, images, status, views, featured, created_at)
  VALUES 
    (v_tokyo, v_mitsubishi, v_evo_vi, v_exhaust, 'Mitsubishi Lancer Evo VI Escape HKS', 'Escape titanium HKS para Evo VI.', 'excellent', 6200.00, ARRAY['https://via.placeholder.com/400?text=HKS+Exhaust'], 'active', 145, false, NOW() - INTERVAL '4 days'),
    (v_tanaka, v_mitsubishi, v_evo_vi, v_suspension, 'Mitsubishi Lancer Evo VI Ohlins', 'Suspensão Ohlins para Evo VI.', 'excellent', 5800.00, ARRAY['https://via.placeholder.com/400?text=Ohlins+Evo'], 'active', 112, false, NOW() - INTERVAL '6 days'),
    (v_kyushu, v_mitsubishi, v_evo_vi, v_turbo, 'Mitsubishi Lancer Evo Turbo TD06', 'Turbocompressor TD06 para Evo.', 'good', 4500.00, ARRAY['https://via.placeholder.com/400?text=TD06+Evo'], 'active', 78, false, NOW() - INTERVAL '8 days'),
    (v_tokyo, v_mitsubishi, v_evo_vi, v_cooling, 'Mitsubishi Lancer Evo Radiador ARC', 'Radiador aluminum ARC para Evo.', 'like_new', 1200.00, ARRAY['https://via.placeholder.com/400?text=ARC+Radiator'], 'active', 23, false, NOW() - INTERVAL '12 days'),
    (v_tanaka, v_mitsubishi, v_evo_vi, v_wheels, 'Mitsubishi Lancer Evo Rodas Enkei', 'Rodas Enkei para Lancer Evo.', 'good', 2200.00, ARRAY['https://via.placeholder.com/400?text=Enkei+Wheels'], 'active', 67, false, NOW() - INTERVAL '10 days');

  -- RESULTADO
  RAISE NOTICE 'Peças inseridas com sucesso!';
  RAISE NOTICE 'Total de partes: %', (SELECT COUNT(*) FROM public.parts);
END $$;