-- =============================================
-- SEED DATA: 30 SAMPLE PARTS LISTINGS
-- Execute no Supabase SQL Editor
-- =============================================

-- =============================================
-- 1. CRIAR PERFIS DE VENDEDORES ADICIONAIS
-- =============================================

DO $$
DECLARE
  new_profile_id UUID;
BEGIN
  -- Vendedor 1
  INSERT INTO public.profiles (id, email, full_name, phone, address, cep, role, rating, is_verified, bio)
  VALUES 
    (gen_random_uuid(), 'tanaka.motors@example.com', 'Tanaka Motors', '090-1111-1111', 'Tokyo, Shibuya 1-1-1', '150-0001', 'seller', 4.8, true, 'Specialized in Nissan and Toyota parts since 2005')
  ON CONFLICT (email) DO NOTHING;

  -- Vendedor 2
  INSERT INTO public.profiles (id, email, full_name, phone, address, cep, role, rating, is_verified, bio)
  VALUES 
    (gen_random_uuid(), 'jdm.speed@example.com', 'JDM Speed Shop', '090-2222-2222', 'Osaka, Dotonbori 2-2-2', '542-0076', 'seller', 4.6, true, 'Quality JDM parts at competitive prices')
  ON CONFLICT (email) DO NOTHING;

  -- Vendedor 3
  INSERT INTO public.profiles (id, email, full_name, phone, address, cep, role, rating, is_verified, bio)
  VALUES 
    (gen_random_uuid(), 'hiroshi.racing@example.com', 'Hiroshi Racing', '090-3333-3333', 'Nagoya, Sakae 3-3-3', '460-0003', 'seller', 4.9, true, 'Professional racing parts specialist')
  ON CONFLICT (email) DO NOTHING;

  -- Vendedor 4
  INSERT INTO public.profiles (id, email, full_name, phone, address, cep, role, rating, is_verified, bio)
  VALUES 
    (gen_random_uuid(), 'tokyo.turbo@example.com', 'Tokyo Turbo Center', '090-4444-4444', 'Tokyo, Setagaya 4-4-4', '154-0014', 'seller', 4.7, true, 'Turbochargers and engine components专家')
  ON CONFLICT (email) DO NOTHING;

  -- Vendedor 5
  INSERT INTO public.profiles (id, email, full_name, phone, address, cep, role, rating, is_verified, bio)
  VALUES 
    (gen_random_uuid(), 'kyushu.motors@example.com', 'Kyushu Motors', '090-5555-5555', 'Fukuoka, Hakata 5-5-5', '812-0012', 'seller', 4.5, false, 'Southern Japan JDM parts dealer')
  ON CONFLICT (email) DO NOTHING;
END $$;

-- =============================================
-- 2. INSERIR 30 PEÇAS DE EXEMPLO
-- =============================================

INSERT INTO public.parts (id, seller_id, brand_id, model_id, category_id, title, description, condition, price, images, status, views, featured, created_at, updated_at) VALUES

-- 1. NISSAN GT-R PARTS
(gen_random_uuid(), 
  (SELECT id FROM public.profiles WHERE email = 'tanaka.motors@example.com' LIMIT 1),
  '11111111-1111-1111-1111-111111111111',
  (SELECT id FROM public.car_models WHERE slug = 'gt-r-r35' LIMIT 1),
  (SELECT id FROM public.categories WHERE slug = 'engine' LIMIT 1),
  'Nissan GT-R R35 RB26DETT Engine Block Complete',
  'Complete RB26DETT engine block from R35 GT-R. Low mileage, removed from accident vehicle. Includes all internals. Professionally inspected and tested. Perfect for engine swap or rebuild.',
  'excellent', 45000.00,
  ARRAY['https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400'],
  'active', 245, true, NOW() - INTERVAL '2 days', NOW()),

-- 2. TOYOTA SUPRA PARTS
(gen_random_uuid(),
  (SELECT id FROM public.profiles WHERE email = 'jdm.speed@example.com' LIMIT 1),
  '22222222-2222-2222-2222-222222222222',
  (SELECT id FROM public.car_models WHERE slug = 'supra-a80' LIMIT 1),
  (SELECT id FROM public.categories WHERE slug = 'turbo-boost' LIMIT 1),
  'Toyota Supra A80 2JZ-GTE Turbocharger HKS GT3540',
  'HKS GT3540 turbocharger in excellent condition. Upgraded from stock, perfect for 600+ HP builds. Includes gaskets and oil lines. Professionally balanced.',
  'like_new', 12500.00,
  ARRAY['https://images.unsplash.com/photo-1626668893632-6f393e3f7208?w=400'],
  'active', 189, true, NOW() - INTERVAL '5 days', NOW()),

-- 3. HONDA NSX PARTS
(gen_random_uuid(),
  (SELECT id FROM public.profiles WHERE email = 'hiroshi.racing@example.com' LIMIT 1),
  '33333333-3333-3333-3333-333333333333',
  (SELECT id FROM public.car_models WHERE slug = 'nsx-na1' LIMIT 1),
  (SELECT id FROM public.categories WHERE slug = 'suspension' LIMIT 1),
  'Honda NSX NA1 TEIN Mono Coilover System',
  'TEIN Mono Sport coilover suspension system. Fully adjustable damping, height adjustable. Great condition with service records. Perfect for street and track use.',
  'excellent', 8500.00,
  ARRAY['https://images.unsplash.com/photo-1607108838042-5249d803a856?w=400'],
  'active', 156, false, NOW() - INTERVAL '3 days', NOW()),

-- 4. MAZDA RX-7 PARTS
(gen_random_uuid(),
  (SELECT id FROM public.profiles WHERE email = 'tokyo.turbo@example.com' LIMIT 1),
  '44444444-4444-4444-4444-444444444444',
  (SELECT id FROM public.car_models WHERE slug = 'rx7-fd3s' LIMIT 1),
  (SELECT id FROM public.categories WHERE slug = 'engine' LIMIT 1),
  'Mazda RX-7 FD3S 13B-REW Rotary Engine Low Mileage',
  '13B-REW twin rotary engine with only 45,000 miles. Complete with all accessories. Perfect for swap or restoration. Includes comprehensive service history.',
  'excellent', 18000.00,
  ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'],
  'active', 312, true, NOW() - INTERVAL '1 day', NOW()),

-- 5. SUBARU WRX STI PARTS
(gen_random_uuid(),
  (SELECT id FROM public.profiles WHERE email = 'tanaka.motors@example.com' LIMIT 1),
  '55555555-5555-5555-5555-555555555555',
  (SELECT id FROM public.car_models WHERE slug = 'wrx-sti-gdb' LIMIT 1),
  (SELECT id FROM public.categories WHERE slug = 'turbo-boost' LIMIT 1),
  'Subaru WRX STI GDB VF35 Turbocharger Garrett',
  'Garrett GT35R turbocharger from GDB WRX STI. Excellent condition, low miles. Includes up-pipe and turbo manifold. Ready for installation.',
  'excellent', 7500.00,
  ARRAY['https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=400'],
  'active', 98, false, NOW() - INTERVAL '7 days', NOW()),

-- 6. TOYOTA AE86 PARTS
(gen_random_uuid(),
  (SELECT id FROM public.profiles WHERE email = 'jdm.speed@example.com' LIMIT 1),
  '22222222-2222-2222-2222-222222222222',
  (SELECT id FROM public.car_models WHERE slug = 'ae86' LIMIT 1),
  (SELECT id FROM public.categories WHERE slug = 'suspension' LIMIT 1),
  'Toyota AE86 Sprinter Trueno Cusco Sway Bars Complete Set',
  'Complete Cusco sway bar set (front and rear) for AE86. Great for improving handling. Minimal rust, all hardware included. Perfect for drift or track build.',
  'good', 1200.00,
  ARRAY['https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=400'],
  'active', 67, false, NOW() - INTERVAL '10 days', NOW()),

-- 7. NISSAN SILVIA PARTS
(gen_random_uuid(),
  (SELECT id FROM public.profiles WHERE email = 'hiroshi.racing@example.com' LIMIT 1),
  '11111111-1111-1111-1111-111111111111',
  (SELECT id FROM public.car_models WHERE slug = 'silvia-s15' LIMIT 1),
  (SELECT id FROM public.categories WHERE slug = 'body-kits' LIMIT 1),
  'Nissan Silvia S15 Top Secret Carbon Body Kit',
  'Top Secret style carbon fiber body kit. Includes front lip, side skirts, rear diffuser, and GT wing. Excellent condition, minor wear. Direct fitment.',
  'excellent', 8500.00,
  ARRAY['https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9?w=400'],
  'active', 234, true, NOW() - INTERVAL '4 days', NOW()),

-- 8. MITSUBISHI LANCER EVO PARTS
(gen_random_uuid(),
  (SELECT id FROM public.profiles WHERE email = 'kyushu.motors@example.com' LIMIT 1),
  '66666666-6666-6666-6666-666666666666',
  (SELECT id FROM public.car_models WHERE slug = 'lancer-evo-6' LIMIT 1),
  (SELECT id FROM public.categories WHERE slug = 'exhaust' LIMIT 1),
  'Mitsubishi Lancer Evo VI HKS Titanium Exhaust System',
  'HKS Titanium Championship exhaust system. Cat-back, valvetronic included. Excellent condition, no dents or scratches. Dramatic sound improvement.',
  'excellent', 6200.00,
  ARRAY['https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400'],
  'active', 145, false, NOW() - INTERVAL '6 days', NOW()),

-- 9. TOYOTA MR2 PARTS
(gen_random_uuid(),
  (SELECT id FROM public.profiles WHERE email = 'tanaka.motors@example.com' LIMIT 1),
  '22222222-2222-2222-2222-222222222222',
  (SELECT id FROM public.car_models WHERE slug = 'mr2-sw20' LIMIT 1),
  (SELECT id FROM public.categories WHERE slug = 'wheels-rims' LIMIT 1),
  'Toyota MR2 SW20 Rays Engineering CE28N Wheels Set',
  'Rays CE28N 3-piece wheels. 16x7 front, 16x8 rear. Excellent condition, no curb rash. Includes tires with 70% tread remaining. Perfect for track or street.',
  'excellent', 4500.00,
  ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'],
  'active', 89, false, NOW() - INTERVAL '8 days', NOW()),

-- 10. HONDA S2000 PARTS
(gen_random_uuid(),
  (SELECT id FROM public.profiles WHERE email = 'tokyo.turbo@example.com' LIMIT 1),
  '33333333-3333-3333-3333-333333333333',
  (SELECT id FROM public.car_models WHERE slug = 's2000-ap1' LIMIT 1),
  (SELECT id FROM public.categories WHERE slug = 'engine' LIMIT 1),
  'Honda S2000 AP1 K20A Engine Swap Complete',
  'Complete K20A engine from JDM S2000. 60k miles, perfect compression. Includes wiring harness, ECU, and all accessories. Perfect for S2000 swap.',
  'excellent', 15000.00,
  ARRAY['https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400'],
  'active', 278, true, NOW() - INTERVAL '3 days', NOW()),

-- 11. NISSAN SKYLINE PARTS
(gen_random_uuid(),
  (SELECT id FROM public.profiles WHERE email = 'jdm.speed@example.com' LIMIT 1),
  '11111111-1111-1111-1111-111111111111',
  (SELECT id FROM public.car_models WHERE slug = 'skyline-r34' LIMIT 1),
  (SELECT id FROM public.categories WHERE slug = 'brakes' LIMIT 1),
  'Nissan Skyline R34 Nismo Brake Kit AP Racing',
  'AP Racing big brake kit for R34 GT-R. 6-piston front, 4-piston rear. Includes rotors, pads, and lines. Excellent condition with spare pads.',
  'like_new', 7500.00,
  ARRAY['https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400'],
  'active', 167, false, NOW() - INTERVAL '5 days', NOW()),

-- 12. MAZDA MX-5 PARTS
(gen_random_uuid(),
  (SELECT id FROM public.profiles WHERE email = 'kyushu.motors@example.com' LIMIT 1),
  '44444444-4444-4444-4444-444444444444',
  (SELECT id FROM public.car_models WHERE slug = 'mx5-nd' LIMIT 1),
  (SELECT id FROM public.categories WHERE slug = 'interior' LIMIT 1),
  'Mazda MX-5 ND Bride Zeta III Seats Black',
  'Pair of Bride Zeta III bucket seats in black. Perfect condition, no tears or wear. Includes rails and sliders. Ideal for track or street build.',
  'excellent', 2800.00,
  ARRAY['https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=400'],
  'active', 45, false, NOW() - INTERVAL '12 days', NOW()),

-- 13. SUBARU BRZ PARTS
(gen_random_uuid(),
  (SELECT id FROM public.profiles WHERE email = 'hiroshi.racing@example.com' LIMIT 1),
  '55555555-5555-5555-5555-555555555555',
  (SELECT id FROM public.car_models WHERE slug = 'brz-zc6' LIMIT 1),
  (SELECT id FROM public.categories WHERE slug = 'wings-spoilers' LIMIT 1),
  'Subaru BRZ Voltex Type 5 GT Wing Carbon',
  'Voltex Type 5 GT wing in genuine carbon fiber. Adjustable angle. Perfect fitment for BRZ/86. Includes stand and all mounting hardware.',
  'excellent', 3800.00,
  ARRAY['https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=400'],
  'active', 112, false, NOW() - INTERVAL '9 days', NOW()),

-- 14. TOYOTA CHASER PARTS
(gen_random_uuid(),
  (SELECT id FROM public.profiles WHERE email = 'tanaka.motors@example.com' LIMIT 1),
  '22222222-2222-2222-2222-222222222222',
  (SELECT id FROM public.car_models WHERE slug = 'chaser' LIMIT 1),
  (SELECT id FROM public.categories WHERE slug = 'engine' LIMIT 1),
  'Toyota Chaser JZX100 1JZ-GTE VVT-i Engine',
  'Complete 1JZ-GTE VVT-i engine from Chaser. 80k miles, all working perfectly. Includes AC compressor, alternator, and starter. Perfect for swap.',
  'good', 8500.00,
  ARRAY['https://images.unsplash.com/photo-1607108838042-5249d803a856?w=400'],
  'active', 198, false, NOW() - INTERVAL '4 days', NOW()),

-- 15. HONDA CIVIC PARTS
(gen_random_uuid(),
  (SELECT id FROM public.profiles WHERE email = 'tokyo.turbo@example.com' LIMIT 1),
  '33333333-3333-3333-3333-333333333333',
  (SELECT id FROM public.car_models WHERE slug = 'civic-type-r-ek9' LIMIT 1),
  (SELECT id FROM public.categories WHERE slug = 'suspension' LIMIT 1),
  'Honda Civic Type R EK9 Buddy Club Racing Spec Coilovers',
  'Buddy Club Racing Spec coilovers for EK9. Full adjustable, originally from Japan. Excellent condition with adjustable damping knobs. Perfect for circuit.',
  'excellent', 4500.00,
  ARRAY['https://images.unsplash.com/photo-1593055491718-64b187514a8b?w=400'],
  'active', 134, false, NOW() - INTERVAL '6 days', NOW()),

-- 16. NISSAN 350Z PARTS
(gen_random_uuid(),
  (SELECT id FROM public.profiles WHERE email = 'jdm.speed@example.com' LIMIT 1),
  '11111111-1111-1111-1111-111111111111',
  (SELECT id FROM public.car_models WHERE slug = '350z' LIMIT 1),
  (SELECT id FROM public.categories WHERE slug = 'wheels-rims' LIMIT 1),
  'Nissan 350Z Work Emotion XR5 3-Piece Wheels',
  'Work Emotion XR5 wheels 18x9.5 front, 18x10.5 rear. Good condition with minor curb rash on 2 wheels. Includes tires 80% tread. Great value!',
  'good', 2800.00,
  ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'],
  'active', 56, false, NOW() - INTERVAL '11 days', NOW()),

-- 17. MITSUBISHI FTO PARTS
(gen_random_uuid(),
  (SELECT id FROM public.profiles WHERE email = 'kyushu.motors@example.com' LIMIT 1),
  '66666666-6666-6666-6666-666666666666',
  (SELECT id FROM public.car_models WHERE slug = 'fto' LIMIT 1),
  (SELECT id FROM public.categories WHERE slug = 'cooling' LIMIT 1),
  'Mitsubishi FTO GSR ARC Radiator Upgrade',
  'ARC aluminum radiator for FTO GPX/MK2. Maintains temps even on track. Excellent condition with no damage. Direct bolt-on replacement.',
  'like_new', 1200.00,
  ARRAY['https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400'],
  'active', 23, false, NOW() - INTERVAL '14 days', NOW()),

-- 18. MAZDA RX-8 PARTS
(gen_random_uuid(),
  (SELECT id FROM public.profiles WHERE email = 'hiroshi.racing@example.com' LIMIT 1),
  '44444444-4444-4444-4444-444444444444',
  (SELECT id FROM public.car_models WHERE slug = 'rx8' LIMIT 1),
  (SELECT id FROM public.categories WHERE slug = 'engine' LIMIT 1),
  'Mazda RX-8 13B-MSP Renesis Engine Long Block',
  'Renesis 13B-MSP long block engine. 50k miles. No compression issues, all good. Includes exhaust manifolds. Great for swap or rebuild.',
  'good', 9500.00,
  ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'],
  'active', 87, false, NOW() - INTERVAL '7 days', NOW()),

-- 19. TOYOTA ALTEZZA PARTS
(gen_random_uuid(),
  (SELECT id FROM public.profiles WHERE email = 'tanaka.motors@example.com' LIMIT 1),
  '22222222-2222-2222-2222-222222222222',
  (SELECT id FROM public.car_models WHERE slug = 'altezza' LIMIT 1),
  (SELECT id FROM public.categories WHERE slug = 'exhaust' LIMIT 1),
  'Toyota Altezza RS200 Vertex Revolution Exhaust',
  'Vertex Revolution cat-back exhaust for Altezza. Titanium finish, excellent condition. Great sound, no drone. Includes all gaskets and hardware.',
  'excellent', 3200.00,
  ARRAY['https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400'],
  'active', 76, false, NOW() - INTERVAL '8 days', NOW()),

-- 20. SUBARU IMPREZA PARTS
(gen_random_uuid(),
  (SELECT id FROM public.profiles WHERE email = 'tokyo.turbo@example.com' LIMIT 1),
  '55555555-5555-5555-5555-555555555555',
  (SELECT id FROM public.car_models WHERE slug = 'wrx-sti-gc8' LIMIT 1),
  (SELECT id FROM public.categories WHERE slug = 'lighting' LIMIT 1),
  'Subaru Impreza GC8 STi JDM Headlights Set',
  'Complete set of JDM STi headlights for GC8 Impreza. Excellent condition, no cracks or moisture. Includes bulbs and wiring harness. Direct fit.',
  'excellent', 1800.00,
  ARRAY['https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400'],
  'active', 92, false, NOW() - INTERVAL '5 days', NOW()),

-- 21. NISSAN FAIRLADY Z PARTS
(gen_random_uuid(),
  (SELECT id FROM public.profiles WHERE email = 'jdm.speed@example.com' LIMIT 1),
  '11111111-1111-1111-1111-111111111111',
  (SELECT id FROM public.car_models WHERE slug = 'fairlady-z-z33' LIMIT 1),
  (SELECT id FROM public.categories WHERE slug = 'aero' LIMIT 1),
  'Nissan Fairlady Z Z33 Varis Carbon Side Skirts',
  'Varis genuine carbon fiber side skirts for Z33. Perfect fitment, excellent condition. Minor wear from use. Adds aggressive look to any Z.',
  'good', 2200.00,
  ARRAY['https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9?w=400'],
  'active', 68, false, NOW() - INTERVAL '10 days', NOW()),

-- 22. TOYOTA GT86 PARTS
(gen_random_uuid(),
  (SELECT id FROM public.profiles WHERE email = 'kyushu.motors@example.com' LIMIT 1),
  '22222222-2222-2222-2222-222222222222',
  (SELECT id FROM public.car_models WHERE slug = 'gt86' LIMIT 1),
  (SELECT id FROM public.categories WHERE slug = 'turbo-boost' LIMIT 1),
  'Toyota GT86 / Subaru BRZ GReddy Turbo Kit Complete',
  'GReddy turbo kit for 86/BRZ. Includes turbo, manifold, downpipe, and all piping. Ready to install. Great for 300+ HP builds.',
  'excellent', 8500.00,
  ARRAY['https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=400'],
  'active', 145, false, NOW() - INTERVAL '3 days', NOW()),

-- 23. HONDA PRELUDE PARTS
(gen_random_uuid(),
  (SELECT id FROM public.profiles WHERE email = 'hiroshi.racing@example.com' LIMIT 1),
  '33333333-3333-3333-3333-333333333333',
  (SELECT id FROM public.car_models WHERE slug = 'prelude' LIMIT 1),
  (SELECT id FROM public.categories WHERE slug = 'engine' LIMIT 1),
  'Honda Prelude H22A Engine Complete JDM',
  'H22A 4th generation engine from JDM Prelude. Complete with all accessories. 75k miles, runs perfectly. Great for swap or upgrade.',
  'good', 5500.00,
  ARRAY['https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400'],
  'active', 54, false, NOW() - INTERVAL '15 days', NOW()),

-- 24. MAZDA 180SX PARTS
(gen_random_uuid(),
  (SELECT id FROM public.profiles WHERE email = 'tanaka.motors@example.com' LIMIT 1),
  '11111111-1111-1111-1111-111111111111',
  (SELECT id FROM public.car_models WHERE slug = '180sx' LIMIT 1),
  (SELECT id FROM public.categories WHERE slug = 'body-kits' LIMIT 1),
  'Nissan 180SX Vertex Type 2 Body Kit Complete',
  'Vertex Type 2 complete body kit for 180SX. Includes front bumper, side skirts, rear bumper, and rear spats. Some minor wear, good overall condition.',
  'fair', 2500.00,
  ARRAY['https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9?w=400'],
  'active', 34, false, NOW() - INTERVAL '20 days', NOW()),

-- 25. MITSUBISHI LANCER EVO PARTS
(gen_random_uuid(),
  (SELECT id FROM public.profiles WHERE email = 'jdm.speed@example.com' LIMIT 1),
  '66666666-6666-6666-6666-666666666666',
  (SELECT id FROM public.car_models WHERE slug = 'lancer-evo-7-9' LIMIT 1),
  (SELECT id FROM public.categories WHERE slug = 'suspension' LIMIT 1),
  'Mitsubishi Lancer Evo VII-IX Öhlins Road & Track Coilovers',
  'Öhlins Road & Track coilovers for Evo 7-9. Fully adjustable, originally from Japan. Excellent condition. Perfect for street and track.',
  'excellent', 5800.00,
  ARRAY['https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400'],
  'active', 112, false, NOW() - INTERVAL '6 days', NOW()),

-- 26. SUBARU WRX PARTS
(gen_random_uuid(),
  (SELECT id FROM public.profiles WHERE email = 'tokyo.turbo@example.com' LIMIT 1),
  '55555555-5555-5555-5555-555555555555',
  (SELECT id FROM public.car_models WHERE slug = 'wrx-sti-vab' LIMIT 1),
  (SELECT id FROM public.categories WHERE slug = 'wheels-rims' LIMIT 1),
  'Subaru WRX STI VAB BBS RI-A Wheels 18inch',
  'BBS RI-A wheels in gunmetal for STI VAB. 18x8.5 set. Excellent condition, no curb rash. Includes center caps. Perfect for street build.',
  'like_new', 3200.00,
  ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'],
  'active', 78, false, NOW() - INTERVAL '9 days', NOW()),

-- 27. TOYOTA CELICA PARTS
(gen_random_uuid(),
  (SELECT id FROM public.profiles WHERE email = 'kyushu.motors@example.com' LIMIT 1),
  '22222222-2222-2222-2222-222222222222',
  (SELECT id FROM public.car_models WHERE slug = 'celica-gt-four' LIMIT 1),
  (SELECT id FROM public.categories WHERE slug = 'engine' LIMIT 1),
  'Toyota Celica GT-Four ST205 Turbocharger TD05H',
  'TD05H-16G turbocharger from Celica GT-Four. Good condition, recently serviced. Includes gaskets and oil lines. Ready for installation.',
  'good', 2800.00,
  ARRAY['https://images.unsplash.com/photo-1607108838042-5249d803a856?w=400'],
  'active', 41, false, NOW() - INTERVAL '18 days', NOW()),

-- 28. HONDA INTEGRA PARTS
(gen_random_uuid(),
  (SELECT id FROM public.profiles WHERE email = 'hiroshi.racing@example.com' LIMIT 1),
  '33333333-3333-3333-3333-333333333333',
  (SELECT id FROM public.car_models WHERE slug = 'integra-type-r' LIMIT 1),
  (SELECT id FROM public.categories WHERE slug = 'brakes' LIMIT 1),
  'Honda Integra Type R DC2 Brembo Brake Kit',
  'Brembo brake kit for DC2 Integra Type R. 4-piston calipers, upgraded rotors, and performance pads. Excellent condition. Dramatically improves stopping.',
  'excellent', 4200.00,
  ARRAY['https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400'],
  'active', 95, false, NOW() - INTERVAL '7 days', NOW()),

-- 29. NISSAN 370Z PARTS
(gen_random_uuid(),
  (SELECT id FROM public.profiles WHERE email = 'tanaka.motors@example.com' LIMIT 1),
  '11111111-1111-1111-1111-111111111111',
  (SELECT id FROM public.car_models WHERE slug = '370z' LIMIT 1),
  (SELECT id FROM public.categories WHERE slug = 'interior' LIMIT 1),
  'Nissan 370Z Nismo Steering Wheel Carbon',
  'Genuine Nismo carbon fiber steering wheel for 370Z. Excellent condition, minimal wear. Direct fit, plug and play for Z34. Adds racing feel.',
  'excellent', 1800.00,
  ARRAY['https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=400'],
  'active', 62, false, NOW() - INTERVAL '12 days', NOW()),

-- 30. MAZDA RX-7 FC PARTS
(gen_random_uuid(),
  (SELECT id FROM public.profiles WHERE email = 'jdm.speed@example.com' LIMIT 1),
  '44444444-4444-4444-4444-444444444444',
  (SELECT id FROM public.car_models WHERE slug = 'rx7-fc3s' LIMIT 1),
  (SELECT id FROM public.categories WHERE slug = 'turbo-boost' LIMIT 1),
  'Mazda RX-7 FC3S Trust TD06 Turbo Kit Complete',
  'Trust TD06 turbo kit for FC3S RX-7. Includes turbo, manifold, dump pipe, and intercooler piping. Great for 400+ HP builds. Excellent condition.',
  'excellent', 7500.00,
  ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'],
  'active', 189, true, NOW() - INTERVAL '2 days', NOW());

-- =============================================
-- 3. ATUALIZAR ALGUMAS ESTATÍSTICAS
-- =============================================

-- Atualizar contagem de vendas de alguns vendedores
UPDATE public.profiles SET total_sales = 15 WHERE email = 'tanaka.motors@example.com';
UPDATE public.profiles SET total_sales = 23 WHERE email = 'jdm.speed@example.com';
UPDATE public.profiles SET total_sales = 8 WHERE email = 'hiroshi.racing@example.com';
UPDATE public.profiles SET total_sales = 31 WHERE email = 'tokyo.turbo@example.com';
UPDATE public.profiles SET total_sales = 5 WHERE email = 'kyushu.motors@example.com';

-- =============================================
-- VERIFICAR INSERÇÕES
-- =============================================

SELECT 
  p.title,
  p.price,
  p.condition,
  p.status,
  b.name as brand,
  c.name as category,
  pr.full_name as seller
FROM public.parts p
LEFT JOIN public.brands b ON p.brand_id = b.id
LEFT JOIN public.categories c ON p.category_id = c.id
LEFT JOIN public.profiles pr ON p.seller_id = pr.id
ORDER BY p.created_at DESC
LIMIT 30;