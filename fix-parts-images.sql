-- =============================================
-- ATUALIZAR IMAGENS DOS ANÚNCIOS COM URLs VÁLIDAS DO UNSPLASH
-- Executar no SQL Editor do Supabase Dashboard
-- =============================================

-- UPDATE 1: Nissan GT-R R35 Motor RB26DETT Completo
UPDATE parts 
SET images = ARRAY['https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&q=80'], 
    updated_at = NOW()
WHERE title ILIKE '%GT-R%' AND title ILIKE '%RB26DETT%';

-- UPDATE 2: Toyota Supra A80 Turbo HKS GT3540
UPDATE parts 
SET images = ARRAY['https://images.unsplash.com/photo-1612825173281-9a193378527e?w=600&q=80'], 
    updated_at = NOW()
WHERE title ILIKE '%Supra%' AND title ILIKE '%GT3540%';

-- UPDATE 3: Honda NSX NA1 Suspensão TEIN Mono Sport
UPDATE parts 
SET images = ARRAY['https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&q=80'], 
    updated_at = NOW()
WHERE title ILIKE '%NSX%' AND title ILIKE '%Suspensão%';

-- UPDATE 4: Mazda RX-7 FD3S Motor 13B-REW Twin Turbo
UPDATE parts 
SET images = ARRAY['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&q=80'], 
    updated_at = NOW()
WHERE title ILIKE '%RX-7%' AND title ILIKE '%13B-REW%';

-- UPDATE 5: Subaru WRX STI Rodas BBS RI-A 18"
UPDATE parts 
SET images = ARRAY['https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?w=600&q=80'], 
    updated_at = NOW()
WHERE title ILIKE '%WRX%' AND title ILIKE '%BBS%';

-- UPDATE 6: Nissan Silvia S15 Body Kit Top Secret Carbon
UPDATE parts 
SET images = ARRAY['https://images.unsplash.com/photo-1597007061818-53e5c8f5e2a8?w=600&q=80'], 
    updated_at = NOW()
WHERE title ILIKE '%Silvia%' AND title ILIKE '%Body Kit%';

-- UPDATE 7: Toyota Supra A80 Escape HKS Titanium Cat-Back
UPDATE parts 
SET images = ARRAY['https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=600&q=80'], 
    updated_at = NOW()
WHERE title ILIKE '%Supra%' AND title ILIKE '%Escape%';

-- UPDATE 8: Honda S2000 Kit Freios Brembo GT 4 Pistões
UPDATE parts 
SET images = ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80'], 
    updated_at = NOW()
WHERE title ILIKE '%S2000%' AND title ILIKE '%Brembo%';

-- UPDATE 9: Mazda MX-5 ND Rodas Work Emotion XR5 3-Piece
UPDATE parts 
SET images = ARRAY['https://images.unsplash.com/photo-1609752747034-5962bfb4fb4b?w=600&q=80'], 
    updated_at = NOW()
WHERE title ILIKE '%MX-5%' AND title ILIKE '%Work%';

-- UPDATE 10: Mitsubishi Lancer Evo Turbo TD06H-25G
UPDATE parts 
SET images = ARRAY['https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=600&q=80'], 
    updated_at = NOW()
WHERE title ILIKE '%Evo%' AND title ILIKE '%TD06%';

-- =============================================
-- VERIFICAR RESULTADO
-- =============================================
SELECT 
    p.id,
    LEFT(p.title, 45) as title,
    p.images[1] as image_url,
    p.updated_at
FROM parts p
ORDER BY p.updated_at DESC
LIMIT 10;