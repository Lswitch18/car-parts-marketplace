-- Add currency column to transactions table if missing
ALTER TABLE public.transactions 
  ADD COLUMN IF NOT EXISTS currency text DEFAULT 'jpy';
