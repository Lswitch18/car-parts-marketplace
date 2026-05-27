-- Otimiza consulta do catálogo
CREATE INDEX IF NOT EXISTS idx_parts_status_created ON public.parts (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_parts_brand_id ON public.parts (brand_id);
CREATE INDEX IF NOT EXISTS idx_parts_category_id ON public.parts (category_id);
