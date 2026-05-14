-- =============================================================================
-- CORRIGIR DEFINITIVAMENTE RECURSÃO INFINITA EM profiles
-- =============================================================================

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Allow all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin full access profiles" ON public.profiles;

-- Desabilitar RLS temporariamente
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Reabilitar com política simples
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_public_read" ON public.profiles FOR SELECT USING (true);

SELECT '✅ profiles corrigido - teste novamente!' AS status;