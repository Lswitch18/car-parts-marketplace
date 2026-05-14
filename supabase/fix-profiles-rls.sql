-- =============================================================================
-- CORRIGIR RECURSÃO INFINITA NA POLÍTICA DE profiles
-- =============================================================================

DROP POLICY IF EXISTS "Allow all profiles" ON public.profiles;

-- Nova política que não causa recursão
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated profiles" ON public.profiles 
  FOR ALL 
  USING (auth.role() IN ('authenticated', 'anon')) 
  WITH CHECK (auth.role() IN ('authenticated', 'anon'));

SELECT '✅ profiles RLS corrigido!' AS status;