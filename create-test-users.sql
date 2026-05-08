-- =============================================
-- CRIAÇÃO DE USUÁRIOS DE TESTE (CORRIGIDO)
-- Execute no Supabase SQL Editor
-- =============================================

-- Verificar se os usuários já existem
DO $$ 
DECLARE
  user1_exists BOOLEAN;
  user2_exists BOOLEAN;
  user1_id UUID;
  user2_id UUID;
BEGIN
  -- Verificar se usuario@teste.com existe
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'usuario@teste.com') INTO user1_exists;
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'admin@teste.com') INTO user2_exists;
  
  RAISE NOTICE 'usuario@teste.com existe: %', user1_exists;
  RAISE NOTICE 'admin@teste.com existe: %', user2_exists;
  
  -- Se não existem, criar (mas não podemos criar em auth.users diretamente via SQL)
  -- A melhor forma é via Sign Up pela aplicação
  
END $$;

-- =============================================
-- MOSTRAR USUÁRIOS EXISTENTES
-- =============================================

SELECT 
  id,
  email,
  created_at,
  last_sign_in_at,
  raw_user_meta_data->>'full_name' as full_name,
  raw_user_meta_data->>'role' as role
FROM auth.users
ORDER BY created_at DESC;

-- =============================================
-- ATUALIZAR ROLE DE USUÁRIOS EXISTENTES
-- =============================================

-- Para atualizar o role de um usuário existente:
-- Substitua 'SEU_USER_ID' pelo ID do usuário

UPDATE public.profiles 
SET role = 'admin'
WHERE email = 'admin@teste.com';

UPDATE public.profiles 
SET role = 'user'
WHERE email = 'usuario@teste.com';

-- =============================================
-- CREDENCIAIS DE ACESSO (para testar Sign Up)
-- =============================================

-- Após criar conta via app, use:
-- Email: usuario@teste.com
-- Senha: teste123456

-- Email: admin@teste.com
-- Senha: teste123456

-- =============================================
-- NOTA IMPORTANTE
-- =============================================
-- O Supabase Auth não permite criar usuários diretamente
-- via SQL por segurança. 
--
-- OPÇÕES:
-- 1. Cadastre via interface da aplicação (Register page)
-- 2. Use o Supabase Dashboard > Authentication > Users > Add User
-- 3. Use a API do Supabase Admin
--
-- Depois de criar os usuários, execute:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@teste.com';
