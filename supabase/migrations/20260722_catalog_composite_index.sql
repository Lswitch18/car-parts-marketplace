-- Migration: Composite index for high-performance catalog searches
-- Optimizes queries filtering by status, brand_id, category_id and ordering by created_at

CREATE INDEX IF NOT EXISTS idx_parts_catalog_search 
ON public.parts (status, brand_id, category_id, created_at DESC) 
WHERE status = 'active';
