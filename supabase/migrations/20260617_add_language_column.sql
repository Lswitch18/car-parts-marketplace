-- Add language column to legal_contracts
ALTER TABLE public.legal_contracts ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'pt';
