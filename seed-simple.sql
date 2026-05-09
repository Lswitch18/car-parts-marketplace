-- =============================================
-- SEED: 30 PEÇAS JDM - VERSÃO SIMPLES
-- Execute no Supabase SQL Editor
-- =============================================

-- 1. Criar vendedores (se não existirem)
INSERT INTO public.profiles (id, email, full_name, phone, address, cep, role, rating, is_verified, bio)
SELECT gen_random_uuid(), 'tanaka.jdm@example.com', 'Tanaka JDM', '090-1111-1111', 'Tokyo', '150-0001', 'seller', 4.8, true, 'JDM Parts Specialist'
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'tanaka.jdm@example.com');

INSERT INTO public.profiles (id, email, full_name, phone, address, cep, role, rating, is_verified, bio)
SELECT gen_random_uuid(), 'tokyo.racing@example.com', 'Tokyo Racing', '090-2222-2222', 'Osaka', '530-0001', 'seller', 4.6, true, 'Racing Parts Expert'
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'tokyo.racing@example.com');

INSERT INTO public.profiles (id, email, full_name, phone, address, cep, role, rating, is_verified, bio)
SELECT gen_random_uuid(), 'jdm.kyushu@example.com', 'Kyushu JDM', '090-3333-3333', 'Fukuoka', '812-0001', 'seller', 4.9, true, 'Quality JDM Parts'
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'jdm.kyushu@example.com');

-- Verificar vendedores criados
SELECT id, email, full_name FROM public.profiles WHERE role = 'seller';

-- 2. Pegar IDs necessários
-- Execute estas queries separadamente e anote os IDs:
-- SELECT id FROM public.brands WHERE name = 'Nissan';
-- SELECT id FROM public.brands WHERE name = 'Toyota';
-- SELECT id FROM public.brands WHERE name = 'Honda';
-- SELECT id FROM public.brands WHERE name = 'Mazda';
-- SELECT id FROM public.brands WHERE name = 'Subaru';
-- SELECT id FROM public.brands WHERE name = 'Mitsubishi';

-- SELECT id FROM public.categories WHERE slug = 'engine';
-- SELECT id FROM public.categories WHERE slug = 'turbo-boost';
-- SELECT id FROM public.categories WHERE slug = 'suspension';

-- SELECT id FROM public.profiles WHERE email = 'tanaka.jdm@example.com';
-- SELECT id FROM public.profiles WHERE email = 'tokyo.racing@example.com';
-- SELECT id FROM public.profiles WHERE email = 'jdm.kyushu@example.com';

-- 3. Inserir peças - Substitua os IDs abaixo pelos valores corretos
-- Execute este INSERT com os IDs que você obteve

-- Exemplo (substitua os IDs):
-- INSERT INTO public.parts (seller_id, brand_id, model_id, category_id, title, description, condition, price, images, status, views, featured, created_at)
-- VALUES 
-- ((SELECT id FROM public.profiles WHERE email = 'tanaka.jdm@example.com'), 
--  (SELECT id FROM public.brands WHERE name = 'Nissan'),
--  (SELECT id FROM public.car_models WHERE slug = 'gt-r-r35'),
--  (SELECT id FROM public.categories WHERE slug = 'engine'),
--  'Nissan GT-R R35 RB26DETT Engine',
--  'Complete RB26DETT engine from GT-R R35. Low mileage, inspected.',
--  'excellent', 45000.00, ARRAY['https://via.placeholder.com/400'], 'active', 245, true, NOW());