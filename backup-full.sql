-- =============================================
-- BACKUP COMPLETO DO BANCO - SUPABASE JAPANCAR
-- Execute no SQL Editor do Supabase
-- =============================================

-- =============================================
-- PARTE 1: EXPORTAR TODAS AS TABELAS
-- =============================================

-- 1. PROFILES (usuários)
SELECT 'EXPORT: profiles' as info;
COPY (SELECT * FROM public.profiles ORDER BY created_at) TO STDOUT WITH CSV HEADER;

-- 2. BRANDS (marcas)
SELECT 'EXPORT: brands' as info;
COPY (SELECT * FROM public.brands ORDER BY name) TO STDOUT WITH CSV HEADER;

-- 3. CATEGORIES (categorias)
SELECT 'EXPORT: categories' as info;
COPY (SELECT * FROM public.categories ORDER BY name) TO STDOUT WITH CSV HEADER;

-- 4. CAR_MODELS (modelos)
SELECT 'EXPORT: car_models' as info;
COPY (SELECT * FROM public.car_models ORDER BY brand_id, name) TO STDOUT WITH CSV HEADER;

-- 5. PARTS (anúncios)
SELECT 'EXPORT: parts' as info;
COPY (SELECT * FROM public.parts ORDER BY created_at DESC) TO STDOUT WITH CSV HEADER;

-- 6. FAVORITES
SELECT 'EXPORT: favorites' as info;
COPY (SELECT * FROM public.favorites ORDER BY created_at) TO STDOUT WITH CSV HEADER;

-- 7. MESSAGES
SELECT 'EXPORT: messages' as info;
COPY (SELECT * FROM public.messages ORDER BY created_at) TO STDOUT WITH CSV HEADER;

-- 8. TRANSACTIONS
SELECT 'EXPORT: transactions' as info;
COPY (SELECT * FROM public.transactions ORDER BY created_at) TO STDOUT WITH CSV HEADER;

-- =============================================
-- PARTE 2: GERAR INSERT STATEMENTS
-- =============================================

-- Gerar INSERT para profiles
SELECT 
  'INSERT INTO public.profiles (id, email, full_name, phone, address, cep, avatar_url, bio, rating, total_sales, is_verified, created_at, updated_at) VALUES (' ||
  ''' || id || '''', ' ||
  '''' || email || ''', ' ||
  '''' || full_name || ''', ' ||
  COALESCE('''' || phone || ''', 'NULL, ') ||
  COALESCE('''' || address || ''', 'NULL, ') ||
  COALESCE('''' || cep || ''', 'NULL, ') ||
  COALESCE('''' || avatar_url || ''', 'NULL, ') ||
  COALESCE('''' || bio || ''', 'NULL, ') ||
  COALESCE(rating::text, 'NULL') || ', ' ||
  COALESCE(total_sales::text, 'NULL') || ', ' ||
  is_verified::text || ', ' ||
  '''' || created_at || ''', ' ||
  '''' || updated_at || ''');' as insert_statement
FROM public.profiles;

-- Gerar INSERT para brands
SELECT 
  'INSERT INTO public.brands (id, name, slug, logo_url, country, created_at) VALUES (' ||
  ''' || id || '''', ' ||
  '''' || name || ''', ' ||
  '''' || slug || ''', ' ||
  COALESCE('''' || logo_url || ''', 'NULL, ') ||
  COALESCE('''' || country || '''', 'NULL, ') ||
  '''' || created_at || ''');' as insert_statement
FROM public.brands;

-- Gerar INSERT para categories
SELECT 
  'INSERT INTO public.categories (id, name, slug, icon, created_at) VALUES (' ||
  ''' || id || '''', ' ||
  '''' || name || ''', ' ||
  '''' || slug || ''', ' ||
  COALESCE('''' || icon || ''', 'NULL, ') ||
  '''' || created_at || ''');' as insert_statement
FROM public.categories;

-- =============================================
-- PARTE 3: ESTATÍSTICAS COMPLETAS
-- =============================================

SELECT '=== RESUMO GERAL ===' as info;

SELECT 
  'USUARIOS_TOTAL' as metric,
  COUNT(*)::text as value
FROM public.profiles
UNION ALL
SELECT 
  'VENDEDORES',
  COUNT(*)::text
FROM public.profiles WHERE role = 'seller'
UNION ALL
SELECT 
  'MARCAS',
  COUNT(*)::text
FROM public.brands
UNION ALL
SELECT 
  'CATEGORIAS',
  COUNT(*)::text
FROM public.categories
UNION ALL
SELECT 
  'MODELOS',
  COUNT(*)::text
FROM public.car_models
UNION ALL
SELECT 
  'ANUNCIOS_TOTAL',
  COUNT(*)::text
FROM public.parts
UNION ALL
SELECT 
  'ANUNCIOS_ATIVOS',
  COUNT(*)::text
FROM public.parts WHERE status = 'active'
UNION ALL
SELECT 
  'ANUNCIOS_VENDIDOS',
  COUNT(*)::text
FROM public.parts WHERE status = 'sold'
UNION ALL
SELECT 
  'VALOR_TOTAL_ANUNCIOS',
  SUM(price)::text
FROM public.parts WHERE status = 'active'
UNION ALL
SELECT 
  'FAVORITOS',
  COUNT(*)::text
FROM public.favorites
UNION ALL
SELECT 
  'MENSAGENS',
  COUNT(*)::text
FROM public.messages
UNION ALL
SELECT 
  'TRANSACOES',
  COUNT(*)::text
FROM public.transactions;

-- =============================================
-- PARTE 4: RELATÓRIOS DETALHADOS
-- =============================================

-- Anúncios por marca
SELECT 
  b.name as marca,
  COUNT(p.id)::text as total,
  ROUND(AVG(p.price), 2)::text as preco_medio,
  MIN(p.price)::text as menor,
  MAX(p.price)::text as maior
FROM public.parts p
JOIN public.brands b ON p.brand_id = b.id
GROUP BY b.name
ORDER BY COUNT(p.id) DESC;

-- Anúncios por categoria
SELECT 
  c.name as categoria,
  COUNT(p.id)::text as total,
  ROUND(AVG(p.price), 2)::text as preco_medio
FROM public.parts p
JOIN public.categories c ON p.category_id = c.id
GROUP BY c.name
ORDER BY COUNT(p.id) DESC;

-- Vendedores com anúncios
SELECT 
  pr.full_name as vendedor,
  pr.email,
  pr.rating::text,
  pr.total_sales::text,
  COUNT(p.id)::text as anuncios,
  SUM(p.price)::text as valor_total
FROM public.parts p
JOIN public.profiles pr ON p.seller_id = pr.id
GROUP BY pr.id, pr.full_name, pr.email, pr.rating, pr.total_sales
ORDER BY COUNT(p.id) DESC;

-- Condições dos anúncios
SELECT 
  condition as condicao,
  COUNT(*)::text as total
FROM public.parts
GROUP BY condition
ORDER BY COUNT(*) DESC;

-- Status dos anúncios
SELECT 
  status as status_anuncio,
  COUNT(*)::text as total
FROM public.parts
GROUP BY status
ORDER BY COUNT(*) DESC;

-- =============================================
-- PARTE 5: VERIFICAR DADOS ATUAIS
-- =============================================

-- Ver último anúncio criado
SELECT 
  p.title,
  p.price,
  p.condition,
  p.status,
  p.created_at,
  pr.full_name as vendedor
FROM public.parts p
LEFT JOIN public.profiles pr ON p.seller_id = pr.id
ORDER BY p.created_at DESC
LIMIT 5;

-- Ver vendedores
SELECT 
  email,
  full_name,
  role,
  rating,
  is_verified,
  total_sales,
  created_at
FROM public.profiles
WHERE role IN ('seller', 'admin')
ORDER BY created_at DESC;