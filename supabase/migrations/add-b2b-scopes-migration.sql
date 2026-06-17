-- Add scoping/isolation fields to B2B API Keys
ALTER TABLE public.b2b_api_keys 
ADD COLUMN IF NOT EXISTS partner_carrier TEXT,
ADD COLUMN IF NOT EXISTS partner_warehouse_id UUID REFERENCES public.admin_armazens(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.b2b_api_keys.partner_carrier IS 'Limits this partner to see only shipments and orders for this carrier (e.g. Yamato Transport)';
COMMENT ON COLUMN public.b2b_api_keys.partner_warehouse_id IS 'Limits this partner to see only inventory and warehouses matching this ID';
