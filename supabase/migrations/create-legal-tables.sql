-- =============================================================================
-- JURÍDICO - Tabelas de Contratos e Automatização
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.legal_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_number TEXT NOT NULL UNIQUE,
    partner_name TEXT NOT NULL,
    partner_email TEXT NOT NULL,
    service_type TEXT NOT NULL DEFAULT 'b2b_logistix',
    status TEXT NOT NULL DEFAULT 'pending_signature',
    contract_value NUMERIC(15,2) DEFAULT 0.00,
    periodicity TEXT DEFAULT 'mensal',
    contract_terms TEXT,
    pdf_path TEXT,
    signed_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    api_key_id UUID REFERENCES public.b2b_api_keys(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE public.legal_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access legal_contracts" ON public.legal_contracts FOR ALL USING (
  auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Trigger: Quando status do contrato muda para 'active', ativa a API Key B2B associada
CREATE OR REPLACE FUNCTION public.fn_activate_b2b_key_on_contract_active()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'active' AND (OLD.status IS NULL OR OLD.status <> 'active') THEN
        IF NEW.api_key_id IS NOT NULL THEN
            UPDATE public.b2b_api_keys
            SET is_active = true
            WHERE id = NEW.api_key_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER tr_activate_b2b_key_on_contract_active
AFTER UPDATE ON public.legal_contracts
FOR EACH ROW
EXECUTE FUNCTION public.fn_activate_b2b_key_on_contract_active();
