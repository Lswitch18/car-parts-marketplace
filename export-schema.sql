-- =============================================
-- EXPORT: SCHEMA COMPLETO + DADOS ATUAIS
-- Execute no Supabase SQL Editor para exportar
-- =============================================

-- =============================================
-- 1. EXPORTAR TABELAS - SCHEMA + DADOS
-- =============================================

-- 1.1 PROFILES (usuários/vendedores)
SELECT '=== PUBLIC.PROFILES ===' as info;
SELECT * FROM public.profiles ORDER BY created_at DESC;

-- 1.2 BRANDS (marcas)
SELECT '=== PUBLIC.BRANDS ===' as info;
SELECT * FROM public.brands ORDER BY name;

-- 1.3 CATEGORIES (categorias)
SELECT '=== PUBLIC.CATEGORIES ===' as info;
SELECT * FROM public.categories ORDER BY name;

-- 1.4 CAR_MODELS (modelos de carros)
SELECT '=== PUBLIC.CAR_MODELS ===' as info;
SELECT * FROM public.car_models ORDER BY brand_id, name;

-- 1.5 PARTS (anúncios/produtos)
SELECT '=== PUBLIC.PARTS ===' as info;
SELECT 
  p.id,
  p.title,
  p.description,
  p.condition,
  p.price,
  p.status,
  p.views,
  p.featured,
  p.created_at,
  b.name as brand_name,
  c.name as category_name,
  pr.full_name as seller_name
FROM public.parts p
LEFT JOIN public.brands b ON p.brand_id = b.id
LEFT JOIN public.categories c ON p.category_id = c.id
LEFT JOIN public.profiles pr ON p.seller_id = pr.id
ORDER BY p.created_at DESC;

-- 1.6 FAVORITES
SELECT '=== PUBLIC.FAVORITES ===' as info;
SELECT * FROM public.favorites ORDER BY created_at DESC;

-- 1.7 MESSAGES
SELECT '=== PUBLIC.MESSAGES ===' as info;
SELECT * FROM public.messages ORDER BY created_at DESC;

-- 1.8 TRANSACTIONS
SELECT '=== PUBLIC.TRANSACTIONS ===' as info;
SELECT * FROM public.transactions ORDER BY created_at DESC;

-- =============================================
-- 2. RESUMO/ESTATÍSTICAS
-- =============================================

SELECT '=== RESUMO DO BANCO ===' as info;

SELECT 
  'Total Usuários' as metric, 
  COUNT(*) as value 
FROM public.profiles
UNION ALL
SELECT 
  'Total Vendedores', 
  COUNT(*) 
FROM public.profiles WHERE role = 'seller'
UNION ALL
SELECT 
  'Total Marcas', 
  COUNT(*) 
FROM public.brands
UNION ALL
SELECT 
  'Total Categorias', 
  COUNT(*) 
FROM public.categories
UNION ALL
SELECT 
  'Total Modelos', 
  COUNT(*) 
FROM public.car_models
UNION ALL
SELECT 
  'Total Anúncios', 
  COUNT(*) 
FROM public.parts
UNION ALL
SELECT 
  'Anúncios Ativos', 
  COUNT(*) 
FROM public.parts WHERE status = 'active'
UNION ALL
SELECT 
  'Anúncios Vendidos', 
  COUNT(*) 
FROM public.parts WHERE status = 'sold'
UNION ALL
SELECT 
  'Total Favoritos', 
  COUNT(*) 
FROM public.favorites
UNION ALL
SELECT 
  'Total Mensagens', 
  COUNT(*) 
FROM public.messages
UNION ALL
SELECT 
  'Total Transações', 
  COUNT(*) 
FROM public.transactions;

-- =============================================
-- 3. GERAR SQL DE BACKUP (CREATE TABLE + INSERT)
-- =============================================

-- Este comando gera statements CREATE TABLE
SELECT 
  'CREATE TABLE IF NOT EXISTS ' || tablename || ' (' ||
  string_agg(column_name || ' ' || data_type, ', ') ||
  ');' as create_statement
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('profiles', 'brands', 'categories', 'car_models', 'parts', 'favorites', 'messages', 'transactions')
GROUP BY tablename;

-- =============================================
-- 4. VERIFICAR RELAÇÕES
-- =============================================

SELECT '=== VERIFICAÇÃO DE RELAÇÕES ===' as info;

-- Parts sem marca
SELECT COUNT(*) as parts_sem_marca FROM public.parts WHERE brand_id IS NULL;

-- Parts sem categoria
SELECT COUNT(*) as parts_sem_categoria FROM public.parts WHERE category_id IS NULL;

-- Parts sem vendedor
SELECT COUNT(*) as parts_sem_vendedor FROM public.parts WHERE seller_id IS NULL;

-- Parts sem modelo
SELECT COUNT(*) as parts_sem_modelo FROM public.parts WHERE model_id IS NULL;

-- =============================================
-- 5. ANÚNCIOS POR MARCA
-- =============================================

SELECT 
  b.name as marca,
  COUNT(p.id) as total_anuncios,
  ROUND(AVG(p.price), 2) as preco_medio,
  MIN(p.price) as menor_preco,
  MAX(p.price) as maior_preco
FROM public.parts p
JOIN public.brands b ON p.brand_id = b.id
GROUP BY b.name
ORDER BY total_anuncios DESC;

-- =============================================
-- 6. ANÚNCIOS POR CATEGORIA
-- =============================================

SELECT 
  c.name as categoria,
  COUNT(p.id) as total_anuncios,
  ROUND(AVG(p.price), 2) as preco_medio
FROM public.parts p
JOIN public.categories c ON p.category_id = c.id
GROUP BY c.name
ORDER BY total_anuncios DESC;

-- =============================================
-- 7. VENDEDORES COM MAIS ANÚNCIOS
-- =============================================

SELECT 
  pr.full_name as vendedor,
  pr.email,
  pr.rating,
  COUNT(p.id) as total_anuncios,
  SUM(p.price) as valor_total_anuncios
FROM public.parts p
JOIN public.profiles pr ON p.seller_id = pr.id
GROUP BY pr.id, pr.full_name, pr.email, pr.rating
ORDER BY total_anuncios DESC;