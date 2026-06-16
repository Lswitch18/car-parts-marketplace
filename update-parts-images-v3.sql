-- =============================================
-- ATUALIZAÇÃO DE IMAGENS V2 — IMAGENS REAIS DE PEÇAS
-- Geradas por IA + URLs específicas de peças automotivas
-- Execute no SQL Editor do Supabase Dashboard
-- =============================================

-- ► Imagens geradas por IA (servidas localmente pelo app)
-- Arquivos em: /public/parts-images/

-- ► URLs de peças reais (Wikimedia Commons / domínio público)
-- Substituem imagens genéricas de carros por fotos de peças reais

-- --------------------------------------------------
-- MOTORES
-- --------------------------------------------------

-- GT-R RB26DETT
UPDATE parts
SET images = ARRAY['https://clqubcryhbrjlupkgeva.supabase.co/storage/v1/object/public/parts-images/engine-rb26dett.png'],
    updated_at = NOW()
WHERE title ILIKE '%RB26DETT%' OR (title ILIKE '%GT-R%' AND title ILIKE '%Motor%');

-- Supra 2JZ-GTE
UPDATE parts
SET images = ARRAY['https://clqubcryhbrjlupkgeva.supabase.co/storage/v1/object/public/parts-images/engine-2jzgte.png'],
    updated_at = NOW()
WHERE title ILIKE '%2JZ-GTE%' OR (title ILIKE '%Supra%' AND title ILIKE '%Motor%');

-- Turbo genérico (Garrett / HKS)
UPDATE parts
SET images = ARRAY['https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Turbocharger.jpg/800px-Turbocharger.jpg'],
    updated_at = NOW()
WHERE (title ILIKE '%Turbo%' OR title ILIKE '%GTX%' OR title ILIKE '%GT3582%' OR title ILIKE '%TD06%')
  AND (images[1] IS NULL OR images[1] NOT ILIKE '%parts-images%');

-- Alternador
UPDATE parts
SET images = ARRAY['https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Lichtmaschine_01_KMJ.jpg/800px-Lichtmaschine_01_KMJ.jpg'],
    updated_at = NOW()
WHERE title ILIKE '%Alternator%' OR title ILIKE '%Alternador%';

-- Filtro de óleo
UPDATE parts
SET images = ARRAY['https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/OilFilter.jpg/640px-OilFilter.jpg'],
    updated_at = NOW()
WHERE (title ILIKE '%Oil Filter%' OR title ILIKE '%Filtro de %leo%')
  AND (images[1] IS NULL OR images[1] NOT ILIKE '%parts-images%');

-- Velas de ignição
UPDATE parts
SET images = ARRAY['https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Four_spark_plugs.jpg/800px-Four_spark_plugs.jpg'],
    updated_at = NOW()
WHERE title ILIKE '%Spark Plug%' OR title ILIKE '%Vela%';

-- Correia dentada / timing belt
UPDATE parts
SET images = ARRAY['https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Timing_belt.jpg/800px-Timing_belt.jpg'],
    updated_at = NOW()
WHERE title ILIKE '%Timing Belt%' OR title ILIKE '%Correia%';

-- Rampa de combustível
UPDATE parts
SET images = ARRAY['https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Fuel_rail.jpg/800px-Fuel_rail.jpg'],
    updated_at = NOW()
WHERE title ILIKE '%Fuel Rail%' OR title ILIKE '%Rampa%';

-- Oil Cooler / radiador de óleo
UPDATE parts
SET images = ARRAY['https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Oil_cooler_Pratt_%26_Whitney_R-2800.jpg/800px-Oil_cooler_Pratt_%26_Whitney_R-2800.jpg'],
    updated_at = NOW()
WHERE title ILIKE '%Oil Cooler%' OR title ILIKE '%Radiador%leo%';

-- --------------------------------------------------
-- SUSPENSÃO
-- --------------------------------------------------

UPDATE parts
SET images = ARRAY['https://clqubcryhbrjlupkgeva.supabase.co/storage/v1/object/public/parts-images/engine-rb26dett.png'],
    updated_at = NOW()
WHERE (title ILIKE '%Coilover%' OR title ILIKE '%TEIN%' OR title ILIKE '%KW V3%')
  AND (images[1] IS NULL OR images[1] NOT ILIKE '%parts-images%');

-- Suspensão / coilovers — imagem específica
UPDATE parts
SET images = ARRAY['https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Coilover_shock_absorber.jpg/640px-Coilover_shock_absorber.jpg'],
    updated_at = NOW()
WHERE (title ILIKE '%Coilover%' OR title ILIKE '%Amortecedor%' OR title ILIKE '%Shock%' OR title ILIKE '%Suspensão%' OR title ILIKE '%Suspension%')
  AND (images[1] IS NULL OR images[1] NOT ILIKE '%parts-images%');

-- --------------------------------------------------
-- FREIOS
-- --------------------------------------------------

UPDATE parts
SET images = ARRAY['https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Disc_brake_dsc03682.jpg/800px-Disc_brake_dsc03682.jpg'],
    updated_at = NOW()
WHERE (title ILIKE '%Brembo%' OR title ILIKE '%Brake%' OR title ILIKE '%Freio%' OR title ILIKE '%Disco%')
  AND (images[1] IS NULL OR images[1] NOT ILIKE '%parts-images%');

-- Pastilha de freio
UPDATE parts
SET images = ARRAY['https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Brake_pads.jpg/800px-Brake_pads.jpg'],
    updated_at = NOW()
WHERE (title ILIKE '%Brake Pad%' OR title ILIKE '%Pastilha%')
  AND (images[1] IS NULL OR images[1] NOT ILIKE '%parts-images%');

-- --------------------------------------------------
-- RODAS
-- --------------------------------------------------

UPDATE parts
SET images = ARRAY['https://clqubcryhbrjlupkgeva.supabase.co/storage/v1/object/public/parts-images/wheels-work-meister.png'],
    updated_at = NOW()
WHERE (title ILIKE '%Work Meister%' OR title ILIKE '%BBS%' OR title ILIKE '%Rodas%' OR title ILIKE '%Wheel%' OR title ILIKE '%Rim%');

-- --------------------------------------------------
-- ESCAPAMENTO
-- --------------------------------------------------

UPDATE parts
SET images = ARRAY['https://clqubcryhbrjlupkgeva.supabase.co/storage/v1/object/public/parts-images/exhaust-hks-hipower.png'],
    updated_at = NOW()
WHERE (title ILIKE '%Exhaust%' OR title ILIKE '%Escape%' OR title ILIKE '%Catback%' OR title ILIKE '%HKS%' OR title ILIKE '%Blitz%');

-- --------------------------------------------------
-- BODY KITS / AERO
-- --------------------------------------------------

UPDATE parts
SET images = ARRAY['https://clqubcryhbrjlupkgeva.supabase.co/storage/v1/object/public/parts-images/bodykit-veilside-rx7.png'],
    updated_at = NOW()
WHERE (title ILIKE '%Body Kit%' OR title ILIKE '%Veilside%' OR title ILIKE '%Aero%')
  AND (title ILIKE '%RX-7%' OR title ILIKE '%Mazda%');

-- Capô de carbono
UPDATE parts
SET images = ARRAY['https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Carbon_fibre_hood.jpg/800px-Carbon_fibre_hood.jpg'],
    updated_at = NOW()
WHERE (title ILIKE '%Carbon%Hood%' OR title ILIKE '%Cap%Carbono%' OR title ILIKE '%Capô%')
  AND (images[1] IS NULL OR images[1] NOT ILIKE '%parts-images%');

-- --------------------------------------------------
-- AEROFÓLIO / WING
-- --------------------------------------------------

UPDATE parts
SET images = ARRAY['https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/GT_wing_spoiler.jpg/800px-GT_wing_spoiler.jpg'],
    updated_at = NOW()
WHERE (title ILIKE '%Wing%' OR title ILIKE '%Spoiler%' OR title ILIKE '%Aerof%lio%' OR title ILIKE '%APR%')
  AND (images[1] IS NULL OR images[1] NOT ILIKE '%parts-images%');

-- --------------------------------------------------
-- INTERIOR
-- --------------------------------------------------

UPDATE parts
SET images = ARRAY['https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Recaro_Pole_Position_seat.jpg/640px-Recaro_Pole_Position_seat.jpg'],
    updated_at = NOW()
WHERE (title ILIKE '%Recaro%' OR title ILIKE '%Seat%' OR title ILIKE '%Banco%' OR title ILIKE '%Interior%')
  AND (images[1] IS NULL OR images[1] NOT ILIKE '%parts-images%');

-- --------------------------------------------------
-- ELETRÔNICA / ECU
-- --------------------------------------------------

UPDATE parts
SET images = ARRAY['https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/ECU_Engine_Control_Unit.jpg/800px-ECU_Engine_Control_Unit.jpg'],
    updated_at = NOW()
WHERE (title ILIKE '%ECU%' OR title ILIKE '%Haltech%' OR title ILIKE '%Electronics%' OR title ILIKE '%Eletr%')
  AND (images[1] IS NULL OR images[1] NOT ILIKE '%parts-images%');

-- --------------------------------------------------
-- TRANSMISSÃO / LSD
-- --------------------------------------------------

UPDATE parts
SET images = ARRAY['https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Limited_slip_differential.jpg/800px-Limited_slip_differential.jpg'],
    updated_at = NOW()
WHERE (title ILIKE '%LSD%' OR title ILIKE '%Diferencial%' OR title ILIKE '%Transmission%' OR title ILIKE '%Transmissão%' OR title ILIKE '%Cusco%')
  AND (images[1] IS NULL OR images[1] NOT ILIKE '%parts-images%');

-- --------------------------------------------------
-- ILUMINAÇÃO
-- --------------------------------------------------

UPDATE parts
SET images = ARRAY['https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/LED_tail_lights.jpg/800px-LED_tail_lights.jpg'],
    updated_at = NOW()
WHERE (title ILIKE '%Tail Light%' OR title ILIKE '%Lanterna%' OR title ILIKE '%Headlight%' OR title ILIKE '%Farol%' OR title ILIKE '%LED%')
  AND (images[1] IS NULL OR images[1] NOT ILIKE '%parts-images%');

-- --------------------------------------------------
-- FALLBACK: qualquer peça ainda sem imagem específica
-- --------------------------------------------------

UPDATE parts
SET images = ARRAY['https://clqubcryhbrjlupkgeva.supabase.co/storage/v1/object/public/parts-images/engine-rb26dett.png'],
    updated_at = NOW()
WHERE images IS NULL OR images = '{}'::text[] OR array_length(images, 1) IS NULL;

-- --------------------------------------------------
-- VERIFICAÇÃO FINAL
-- --------------------------------------------------

SELECT
    LEFT(title, 50) AS titulo,
    images[1]       AS imagem_url,
    updated_at
FROM parts
ORDER BY updated_at DESC
LIMIT 30;
