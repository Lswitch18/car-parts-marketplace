-- =============================================
-- SEED DATA: PEÇAS JDM - VERSÃO SIMPLES
-- Execute no Supabase SQL Editor
-- =============================================

-- 1. Verificar se existem vendedores
SELECT id, email, full_name FROM public.profiles WHERE role = 'seller' LIMIT 5;

-- 2. Verificar marcas disponíveis
SELECT id, name FROM public.brands;

-- 3. Verificar categorias disponíveis  
SELECT id, name FROM public.categories;

-- 4. Verificar modelos disponíveis
SELECT id, name, slug FROM public.car_models LIMIT 10;