-- =============================================
-- CRIAR 10 ANÚNCIOS COM USUÁRIOS EXISTENTES
-- Execute no Supabase SQL Editor
-- =============================================

-- Primeiro, verificar IDs existentes
DO $$
DECLARE
  v_seller1 UUID;
  v_seller2 UUID;
  v_seller3 UUID;
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
  v_exhaust UUID;
  v_model1 UUID;
  v_model2 UUID;
  v_model3 UUID;
  v_model4 UUID;
  v_model5 UUID;
BEGIN
  -- Pegar vendedores (pegar os 3 primeiros)
  SELECT id INTO v_seller1 FROM public.profiles WHERE role IN ('seller', 'user') LIMIT 1 OFFSET 0;
  SELECT id INTO v_seller2 FROM public.profiles WHERE role IN ('seller', 'user') LIMIT 1 OFFSET 1;
  SELECT id INTO v_seller3 FROM public.profiles WHERE role IN ('seller', 'user') LIMIT 1 OFFSET 2;

  -- Pegar marcas
  SELECT id INTO v_nissan FROM public.brands WHERE name = 'Nissan';
  SELECT id INTO v_toyota FROM public.brands WHERE name = 'Toyota';
  SELECT id INTO v_honda FROM public.brands WHERE name = 'Honda';
  SELECT id INTO v_mazda FROM public.brands WHERE name = 'Mazda';
  SELECT id INTO v_subaru FROM public.brands WHERE name = 'Subaru';
  SELECT id INTO v_mitsubishi FROM public.brands WHERE name = 'Mitsubishi';

  -- Pegar categorias
  SELECT id INTO v_engine FROM public.categories WHERE slug = 'engine';
  SELECT id INTO v_turbo FROM public.categories WHERE slug = 'turbo-boost';
  SELECT id INTO v_suspension FROM public.categories WHERE slug = 'suspension';
  SELECT id INTO v_bodykits FROM public.categories WHERE slug = 'body-kits';
  SELECT id INTO v_wheels FROM public.categories WHERE slug = 'wheels-rims';
  SELECT id INTO v_brakes FROM public.categories WHERE slug = 'brakes';
  SELECT id INTO v_exhaust FROM public.categories WHERE slug = 'exhaust';

  -- Pegar modelos (primeiro de cada marca)
  SELECT id INTO v_model1 FROM public.car_models WHERE brand_id = v_nissan LIMIT 1;
  SELECT id INTO v_model2 FROM public.car_models WHERE brand_id = v_toyota LIMIT 1;
  SELECT id INTO v_model3 FROM public.car_models WHERE brand_id = v_honda LIMIT 1;
  SELECT id INTO v_model4 FROM public.car_models WHERE brand_id = v_mazda LIMIT 1;
  SELECT id INTO v_model5 FROM public.car_models WHERE brand_id = v_subaru LIMIT 1;

  -- Se não encontrou vendedores, criar um perfil temporário
  IF v_seller1 IS NULL THEN
    INSERT INTO public.profiles (id, email, full_name, role, rating, is_verified)
    VALUES (gen_random_uuid(), 'vendedor1@teste.com', 'Vendedor 1', 'seller', 4.5, true)
    RETURNING id INTO v_seller1;
  END IF;
  
  IF v_seller2 IS NULL THEN
    INSERT INTO public.profiles (id, email, full_name, role, rating, is_verified)
    VALUES (gen_random_uuid(), 'vendedor2@teste.com', 'Vendedor 2', 'seller', 4.0, false)
    RETURNING id INTO v_seller2;
  END IF;

  IF v_seller3 IS NULL THEN
    INSERT INTO public.profiles (id, email, full_name, role, rating, is_verified)
    VALUES (gen_random_uuid(), 'vendedor3@teste.com', 'Vendedor 3', 'seller', 4.8, true)
    RETURNING id INTO v_seller3;
  END IF;

  -- Inserir 10 anúncios
  -- Anúncio 1 - Nissan
  INSERT INTO public.parts (seller_id, brand_id, model_id, category_id, title, description, condition, price, images, status, views, featured, created_at)
  VALUES (v_seller1, v_nissan, v_model1, v_engine, 'Nissan GT-R Motor RB26DETT', 'Motor RB26DETT completo, baixa quilometragem, inspecionado. Perfeito para swap.', 'excellent', 45000.00, ARRAY['https://via.placeholder.com/400'], 'active', 156, true, NOW() - INTERVAL '1 day');

  -- Anúncio 2 - Toyota
  INSERT INTO public.parts (seller_id, brand_id, model_id, category_id, title, description, condition, price, images, status, views, featured, created_at)
  VALUES (v_seller2, v_toyota, v_model2, v_turbo, 'Toyota Supra Turbo HKS GT3540', 'Turbo HKS GT3540 para Supra A80. Excelente condição, ideal para 600+ HP.', 'like_new', 12500.00, ARRAY['https://via.placeholder.com/400'], 'active', 89, false, NOW() - INTERVAL '2 days');

  -- Anúncio 3 - Honda
  INSERT INTO public.parts (seller_id, brand_id, model_id, category_id, title, description, condition, price, images, status, views, featured, created_at)
  VALUES (v_seller3, v_honda, v_model3, v_suspension, 'Honda NSX Suspenção TEIN Mono', 'Suspensão TEIN Mono Sport para NSX NA1. Totalmente ajustável, grande condição.', 'excellent', 8500.00, ARRAY['https://via.placeholder.com/400'], 'active', 234, true, NOW() - INTERVAL '3 days');

  -- Anúncio 4 - Mazda
  INSERT INTO public.parts (seller_id, brand_id, model_id, category_id, title, description, condition, price, images, status, views, featured, created_at)
  VALUES (v_seller1, v_mazda, v_model4, v_engine, 'Mazda RX-7 Motor 13B-REW', 'Motor 13B-REW twin rotary completo. Baixa milhagem, inspecionado profissionalmente.', 'excellent', 18000.00, ARRAY['https://via.placeholder.com/400'], 'active', 312, true, NOW() - INTERVAL '1 day');

  -- Anúncio 5 - Subaru
  INSERT INTO public.parts (seller_id, brand_id, model_id, category_id, title, description, condition, price, images, status, views, featured, created_at)
  VALUES (v_seller2, v_subaru, v_model5, v_wheels, 'Subaru WRX STI Rodas BBS', 'Rodas BBS RI-A 18 polegadas para WRX STI. Excelente estado, sem riscos.', 'like_new', 3200.00, ARRAY['https://via.placeholder.com/400'], 'active', 78, false, NOW() - INTERVAL '4 days');

  -- Anúncio 6 - Nissan Body Kit
  INSERT INTO public.parts (seller_id, brand_id, model_id, category_id, title, description, condition, price, images, status, views, featured, created_at)
  VALUES (v_seller3, v_nissan, v_model1, v_bodykits, 'Nissan Silvia S15 Body Kit Carbon', 'Body kit completo Top Secret em fibra de carbono para S15. Estado excelente.', 'excellent', 8500.00, ARRAY['https://via.placeholder.com/400'], 'active', 167, false, NOW() - INTERVAL '5 days');

  -- Anúncio 7 - Toyota Escape
  INSERT INTO public.parts (seller_id, brand_id, model_id, category_id, title, description, condition, price, images, status, views, featured, created_at)
  VALUES (v_seller1, v_toyota, v_model2, v_exhaust, 'Toyota Supra Escape Titanium HKS', 'Escape HKS Titanium cat-back para Supra A80. Som excelente, qualidade premium.', 'excellent', 6200.00, ARRAY['https://via.placeholder.com/400'], 'active', 145, false, NOW() - INTERVAL '2 days');

  -- Anúncio 8 - Honda Freios
  INSERT INTO public.parts (seller_id, brand_id, model_id, category_id, title, description, condition, price, images, status, views, featured, created_at)
  VALUES (v_seller2, v_honda, v_model3, v_brakes, 'Honda S2000 Kit de Freios Brembo', 'Kit de freios Brembo para S2000. Melhora dramaticamente a frenagem.', 'excellent', 4200.00, ARRAY['https://via.placeholder.com/400'], 'active', 95, false, NOW() - INTERVAL '3 days');

  -- Anúncio 9 - Mazda Rodas
  INSERT INTO public.parts (seller_id, brand_id, model_id, category_id, title, description, condition, price, images, status, views, featured, created_at)
  VALUES (v_seller3, v_mazda, v_model4, v_wheels, 'Mazda RX-7 Rodas Work Emotion', 'Rodas Work Emotion XR5 para RX-7. Conjunto 3 peças, excelente condição.', 'good', 2800.00, ARRAY['https://via.placeholder.com/400'], 'active', 56, false, NOW() - INTERVAL '4 days');

  -- Anúncio 10 - Mitsubishi Turbo
  INSERT INTO public.parts (seller_id, brand_id, model_id, category_id, title, description, condition, price, images, status, views, featured, created_at)
  VALUES (v_seller1, v_mitsubishi, v_model1, v_turbo, 'Mitsubishi Lancer Evo Turbo TD06', 'Turbo TD06H-25G para Lancer Evo. Bom estado, recentemente revisado.', 'good', 4500.00, ARRAY['https://via.placeholder.com/400'], 'active', 78, false, NOW() - INTERVAL '5 days');

  -- Mostrar resultado
  RAISE NOTICE '✅ 10 anúncios criados com sucesso!';
  RAISE NOTICE 'Vendedores usados: % - % - %', v_seller1, v_seller2, v_seller3;
END $$;

-- Verificar os anúncios criados
SELECT 
  p.title,
  p.price,
  p.condition,
  p.status,
  b.name as marca,
  c.name as categoria,
  pr.full_name as vendedor
FROM public.parts p
LEFT JOIN public.brands b ON p.brand_id = b.id
LEFT JOIN public.categories c ON p.category_id = c.id
LEFT JOIN public.profiles pr ON p.seller_id = pr.id
ORDER BY p.created_at DESC
LIMIT 10;