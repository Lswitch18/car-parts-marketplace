-- ============================================
-- Script SQL para associar imagens a anúncios sem fotos
-- Executar no Dashboard do Supabase > SQL Editor
-- ============================================

-- URL base do Unsplash (imagens royalty-free)
-- https://unsplash.com/photos/{photo_id}

-- Mapeamento de categorias para URLs de imagens do Unsplash
-- Estas são imagens reais de peças/marcas japonesas

DO $$
DECLARE
    part_record RECORD;
    image_url TEXT;
    parts_updated INTEGER := 0;
BEGIN
    -- Loop por todos os anúncios sem imagens
    FOR part_record IN 
        SELECT p.id, p.title, p.brand_id, b.name as brand_name
        FROM parts p
        LEFT JOIN brands b ON p.brand_id = b.id
        WHERE p.images IS NULL OR p.images = '{}'::text[] OR array_length(p.images, 1) IS NULL
    LOOP
        -- Seleciona imagem baseada na marca
        CASE 
            WHEN part_record.brand_name ILIKE '%nissan%' OR part_record.title ILIKE '%gt-r%' OR part_record.title ILIKE '%skyline%' OR part_record.title ILIKE '%silvia%' THEN
                image_url := 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&q=80';
            
            WHEN part_record.brand_name ILIKE '%toyota%' OR part_record.title ILIKE '%supra%' OR part_record.title ILIKE '%ae86%' OR part_record.title ILIKE '%gt86%' THEN
                image_url := 'https://images.unsplash.com/photo-1612825173281-9a193378527e?w=600&q=80';
            
            WHEN part_record.brand_name ILIKE '%honda%' OR part_record.title ILIKE '%nsx%' OR part_record.title ILIKE '%s2000%' OR part_record.title ILIKE '%civic%' THEN
                image_url := 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&q=80';
            
            WHEN part_record.brand_name ILIKE '%mazda%' OR part_record.title ILIKE '%rx-7%' OR part_record.title ILIKE '%rx-8%' OR part_record.title ILIKE '%mx-5%' OR part_record.title ILIKE '%miata%' THEN
                image_url := 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&q=80';
            
            WHEN part_record.brand_name ILIKE '%subaru%' OR part_record.title ILIKE '%wrx%' OR part_record.title ILIKE '%brz%' OR part_record.title ILIKE '%impreza%' THEN
                image_url := 'https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?w=600&q=80';
            
            WHEN part_record.brand_name ILIKE '%mitsubishi%' OR part_record.title ILIKE '%evo%' OR part_record.title ILIKE '%lancer%' THEN
                image_url := 'https://images.unsplash.com/photo-1597007061818-53e5c8f5e2a8?w=600&q=80';
            
            WHEN part_record.brand_name ILIKE '%lexus%' OR part_record.title ILIKE '%lfa%' OR part_record.title ILIKE '%rc f%' THEN
                image_url := 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&q=80';
            
            -- Body kits e aero
            WHEN part_record.title ILIKE '%body kit%' OR part_record.title ILIKE '%aero%' OR part_record.title ILIKE '%spoiler%' OR part_record.title ILIKE '%wing%' THEN
                image_url := 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80';
            
            -- Rodas
            WHEN part_record.title ILIKE '%wheel%' OR part_record.title ILIKE '%rim%' OR part_record.title ILIKE '%roda%' THEN
                image_url := 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80';
            
            -- Motor
            WHEN part_record.title ILIKE '%engine%' OR part_record.title ILIKE '%motor%' OR part_record.title ILIKE '%turbo%' THEN
                image_url := 'https://images.unsplash.com/photo-1606554077452-6218c21c94f7?w=600&q=80';
            
            -- Freios
            WHEN part_record.title ILIKE '%brake%' OR part_record.title ILIKE '%freio%' THEN
                image_url := 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80';
            
            -- Escape
            WHEN part_record.title ILIKE '%exhaust%' OR part_record.title ILIKE '%escape%' THEN
                image_url := 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=600&q=80';
            
            -- Suspensão
            WHEN part_record.title ILIKE '%suspension%' OR part_record.title ILIKE '%suspensão%' THEN
                image_url := 'https://images.unsplash.com/photo-1619684177489-06f4e77c7f41?w=600&q=80';
            
            -- Interior
            WHEN part_record.title ILIKE '%interior%' OR part_record.title ILIKE '%volante%' OR part_record.title ILIKE '%seat%' THEN
                image_url := 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80';
            
            -- Default - carro genérico JDM
            ELSE
                image_url := 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80';
        END CASE;
        
        -- Atualiza o anúncio
        UPDATE parts 
        SET images = ARRAY[image_url], updated_at = NOW()
        WHERE id = part_record.id;
        
        parts_updated := parts_updated + 1;
        
    END LOOP;
    
    RAISE NOTICE 'Anúncios atualizados: %', parts_updated;
END $$;

-- Verificação: lista anúncios atualizados
SELECT id, title, images[1] as image_url 
FROM parts 
WHERE images IS NOT NULL AND array_length(images, 1) > 0
LIMIT 20;