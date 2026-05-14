-- =============================================================================
-- B2B API - Tabelas para gerenciamento de API Keys e Webhooks
-- =============================================================================

-- Tabela de API Keys para parceiros B2B
CREATE TABLE IF NOT EXISTS public.b2b_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_name TEXT NOT NULL,
    partner_email TEXT NOT NULL,
    api_key_hash TEXT NOT NULL UNIQUE,
    api_key_prefix TEXT NOT NULL,
    scopes TEXT[] DEFAULT ARRAY['read'],
    rate_limit INTEGER DEFAULT 100,
    ip_whitelist TEXT[],
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ,
    created_by TEXT
);

-- Tabela de Webhooks B2B
CREATE TABLE IF NOT EXISTS public.b2b_webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_key_id UUID NOT NULL REFERENCES public.b2b_api_keys(id) ON DELETE CASCADE,
    webhook_url TEXT NOT NULL,
    events TEXT[] NOT NULL,
    secret_hash TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de log de requisições B2B
CREATE TABLE IF NOT EXISTS public.b2b_request_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_key_id UUID REFERENCES public.b2b_api_keys(id) ON DELETE SET NULL,
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL,
    status_code INTEGER,
    response_time_ms INTEGER,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_b2b_api_keys_active ON public.b2b_api_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_b2b_api_keys_prefix ON public.b2b_api_keys(api_key_prefix);
CREATE INDEX IF NOT EXISTS idx_b2b_webhooks_key ON public.b2b_webhooks(api_key_id);
CREATE INDEX IF NOT EXISTS idx_b2b_request_logs_api_key ON public.b2b_request_logs(api_key_id, created_at);

-- RLS policies
ALTER TABLE public.b2b_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_request_logs ENABLE ROW LEVEL SECURITY;

-- Política: apenas admins podem gerenciar
CREATE POLICY "Admin full access b2b_api_keys" ON public.b2b_api_keys FOR ALL USING (
  auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin full access b2b_webhooks" ON public.b2b_webhooks FOR ALL USING (
  auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin full access b2b_request_logs" ON public.b2b_request_logs FOR ALL USING (
  auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

SELECT '✅ Tabelas B2B criadas com sucesso!' AS status;