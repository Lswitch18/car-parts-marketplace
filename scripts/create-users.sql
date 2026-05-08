-- Script correto para criar usuários de teste
-- Execute este SQL no Supabase SQL Editor

-- Inserir perfis de usuários
INSERT INTO public.profiles (id, email, full_name, phone, rating, total_sales, is_verified)
VALUES 
  (gen_random_uuid(), 'wellynton@teste.com', 'Wellynton Jeronimo', '4199626043', 0, 0, false),
  (gen_random_uuid(), 'admin@japancarparts.com', 'Admin JAPANCAR', '11999999999', 0, 0, true),
  (gen_random_uuid(), 'vendedor@japancarparts.com', 'Vendedor Teste', '11988887777', 0, 0, false)
RETURNING id, email, full_name;