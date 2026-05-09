-- =============================================
-- CRIAR 10 ANÚNCIOS DE TESTE
-- =============================================

INSERT INTO public.parts (seller_id, brand_id, model_id, category_id, title, description, condition, price, images, status, views, featured, created_at)
VALUES
('203ee131-797c-43a8-8a65-0df4a2cf3338', '11111111-1111-1111-1111-111111111111', '277a95db-c5f3-46f3-94bc-114f87d536e1', '0b069287-10e9-4ebc-af65-de6fbffc0373', 'Nissan GT-R R35 Motor RB26DETT Completo', 'Motor RB26DETT twin turbo completo para swap. Baixa quilometragem, inspecionado e pronto para instalação. Inclui ECU, fiação e todos os acessórios.', 'excellent', 45000.00, ARRAY['https://images.unsplash.com/photo-1616784033017-3ff1d56785b8?w=600'], 'active', 156, true, NOW() - INTERVAL '1 day'),

('e4fffabc-8616-4738-988b-952f492cfe68', '22222222-2222-2222-2222-222222222222', 'aa2776a3-7c47-4f48-98a6-03f0771a7b5d', '7b19af80-26f4-4346-b13b-33bdd7865bda', 'Toyota Supra A80 Turbo HKS GT3540', 'Turbo HKS GT3540 para Supra A80. Excelente condição, ideal para builds de 600+ HP. Com flanges, wastegate e kit de instalação completo.', 'like_new', 12500.00, ARRAY['https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600'], 'active', 89, false, NOW() - INTERVAL '2 days'),

('17f2a7c2-1c96-49b2-8d86-27719c1a004f', '33333333-3333-3333-3333-333333333333', 'c7678578-1446-49bd-834c-3a36e8f76b05', '098a67ef-a49f-4483-84dd-54175c51d971', 'Honda NSX NA1 Suspensão TEIN Mono Sport', 'Suspensão TEIN Mono Sport completa para NSX NA1. Totalmente ajustável em altura e damping. Inclui molas e amortecedores premium.', 'excellent', 8500.00, ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'], 'active', 234, true, NOW() - INTERVAL '3 days'),

('203ee131-797c-43a8-8a65-0df4a2cf3338', '44444444-4444-4444-4444-444444444444', '7424946e-4339-46b4-9273-d3c556202089', '0b069287-10e9-4ebc-af65-de6fbffc0373', 'Mazda RX-7 FD3S Motor 13B-REW Twin Turbo', 'Motor 13B-REW twin rotary completo. Baixa milhagem, inspecionado profissionalmente. Inclui ECU, fiação completa e turbo secundário.', 'excellent', 18000.00, ARRAY['https://images.unsplash.com/photo-1612544448445-b8232cff3b72?w=600'], 'active', 312, true, NOW() - INTERVAL '1 day'),

('e4fffabc-8616-4738-988b-952f492cfe68', '55555555-5555-5555-5555-555555555555', '0124026a-ae4f-493b-b6b1-c913168df07d', '8c01e7c1-adc9-474d-a88e-65dd5d089962', 'Subaru WRX STI Rodas BBS RI-A 18"', 'Rodas BBS RI-A 18 polegadas para WRX STI. Excelente estado, sem riscos ou curb rash. Offset 53, furação 5x100. PCD correto.', 'like_new', 3200.00, ARRAY['https://images.unsplash.com/photo-1568601127036-36a5d4f6c4f3?w=600'], 'active', 78, false, NOW() - INTERVAL '4 days'),

('17f2a7c2-1c96-49b2-8d86-27719c1a004f', '11111111-1111-1111-1111-111111111111', 'aa2776a3-7c47-4f48-98a6-03f0771a7b5d', 'f6c29df8-8eb9-4910-96e1-8e1c53d5276c', 'Nissan Silvia S15 Body Kit Top Secret Carbon', 'Body kit completo Top Secret em fibra de carbono para S15. Estado excelente, sem trincos. Kit completo com para-lamas, saias e difusor.', 'excellent', 8500.00, ARRAY['https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=600'], 'active', 167, false, NOW() - INTERVAL '5 days'),

('203ee131-797c-43a8-8a65-0df4a2cf3338', '22222222-2222-2222-2222-222222222222', 'aa2776a3-7c47-4f48-98a6-03f0771a7b5d', '53a6d6e9-b794-4d21-904d-b630161f3de6', 'Toyota Supra A80 Escape HKS Titanium Cat-Back', 'Escape HKS Titanium cat-back para Supra A80. Som excelente, qualidade premium. Inclui tubular de aço inox e ponteiras carbono.', 'excellent', 6200.00, ARRAY['https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600'], 'active', 145, false, NOW() - INTERVAL '2 days'),

('e4fffabc-8616-4738-988b-952f492cfe68', '33333333-3333-3333-3333-333333333333', 'e51bb1b7-87f6-4361-95e1-580a785b5856', '383dd03b-4cce-46dd-8bab-da273852e4a7', 'Honda S2000 Kit Freios Brembo GT 4 Pistões', 'Kit de freios Brembo GT para S2000. Melhora dramaticamente a frenagem. Inclui pinças dianteiras 4 pistões, discos ventilados e pastilhas.', 'excellent', 4200.00, ARRAY['https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=600'], 'active', 95, false, NOW() - INTERVAL '3 days'),

('17f2a7c2-1c96-49b2-8d86-27719c1a004f', '44444444-4444-4444-4444-444444444444', 'f0225e14-65e4-4bdd-9464-25e9d5434708', '8c01e7c1-adc9-474d-a88e-65dd5d089962', 'Mazda MX-5 ND Rodas Work Emotion XR5 3-Piece', 'Rodas Work Emotion XR5 para MX-5 ND. Conjunto 3 peças (face-split), tamanho 17x7.5. Excelente condição, semi-novas, pocos km.', 'good', 2800.00, ARRAY['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600'], 'active', 56, false, NOW() - INTERVAL '4 days'),

('203ee131-797c-43a8-8a65-0df4a2cf3338', '66666666-6666-6666-6666-666666666666', '1bcaf7f9-a64e-4f73-82eb-63bc9ecd244d', '7b19af80-26f4-4346-b13b-33bdd7865bda', 'Mitsubishi Lancer Evo Turbo TD06H-25G', 'Turbo TD06H-25G para Lancer Evo I-V. Bom estado, recentemente revisado. Ideal para builds de 400-500HP. Inclui kit de junta.', 'good', 4500.00, ARRAY['https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=600'], 'active', 78, false, NOW() - INTERVAL '5 days');

-- Verificar resultado
SELECT p.id, LEFT(p.title, 40) as title, p.price, b.name as brand, c.name as category
FROM public.parts p
JOIN public.brands b ON p.brand_id = b.id
JOIN public.categories c ON p.category_id = c.id
ORDER BY p.created_at DESC
LIMIT 10;