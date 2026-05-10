-- Analytics Functions for JAPANCAR PARTS
-- Executar no Supabase SQL Editor

-- =====================================================
-- 1. Revenue by Date (últimos 7 dias)
-- =====================================================
CREATE OR REPLACE FUNCTION get_sales_by_date(days INTEGER DEFAULT 7)
RETURNS TABLE(date DATE, revenue NUMERIC, transactions_count INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(t.created_at) as date,
    COALESCE(SUM(t.amount), 0)::NUMERIC as revenue,
    COUNT(t.id)::INTEGER as transactions_count
  FROM transactions t
  WHERE t.payment_status = 'completed'
    AND t.created_at >= NOW() - (days || ' days')::INTERVAL
  GROUP BY DATE(t.created_at)
  ORDER BY date;
END;
$$;

-- =====================================================
-- 2. Top Sellers
-- =====================================================
CREATE OR REPLACE FUNCTION get_top_sellers(limit_count INTEGER DEFAULT 5)
RETURNS TABLE(
  seller_id UUID,
  username TEXT,
  avatar_url TEXT,
  total_sales NUMERIC,
  transaction_count INTEGER,
  rating DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as seller_id,
    p.username,
    p.avatar_url,
    COALESCE(SUM(t.amount), 0)::NUMERIC as total_sales,
    COUNT(t.id)::INTEGER as transaction_count,
    p.rating
  FROM profiles p
  LEFT JOIN transactions t ON t.seller_id = p.id AND t.payment_status = 'completed'
  WHERE p.role = 'seller'
  GROUP BY p.id, p.username, p.avatar_url, p.rating
  ORDER BY total_sales DESC
  LIMIT limit_count;
END;
$$;

-- =====================================================
-- 3. Parts by Category
-- =====================================================
CREATE OR REPLACE FUNCTION get_parts_by_category()
RETURNS TABLE(category_id UUID, category_name TEXT, part_count INTEGER, total_value NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as category_id,
    c.name as category_name,
    COUNT(p.id)::INTEGER as part_count,
    COALESCE(SUM(p.price), 0)::NUMERIC as total_value
  FROM categories c
  LEFT JOIN parts p ON p.category_id = c.id AND p.status = 'sold'
  GROUP BY c.id, c.name
  ORDER BY part_count DESC;
END;
$$;

-- =====================================================
-- 4. User Growth (últimos 6 meses)
-- =====================================================
CREATE OR REPLACE FUNCTION get_user_growth(months INTEGER DEFAULT 6)
RETURNS TABLE(month_date DATE, new_users INTEGER, total_users INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH monthly_users AS (
    SELECT 
      DATE_TRUNC('month', created_at) as month_date,
      COUNT(*) as new_users
    FROM profiles
    WHERE created_at >= NOW() - (months || ' months')::INTERVAL
    GROUP BY DATE_TRUNC('month', created_at)
  )
  SELECT 
    mu.month_date,
    mu.new_users,
    SUM(mu.new_users) OVER (ORDER BY mu.month_date)::INTEGER as total_users
  FROM monthly_users mu
  ORDER BY mu.month_date;
END;
$$;

-- =====================================================
-- 5. Popular Brands
-- =====================================================
CREATE OR REPLACE FUNCTION get_popular_brands(limit_count INTEGER DEFAULT 5)
RETURNS TABLE(brand_id UUID, brand_name TEXT, logo_url TEXT, part_count INTEGER, total_value NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id as brand_id,
    b.name as brand_name,
    b.logo_url,
    COUNT(p.id)::INTEGER as part_count,
    COALESCE(SUM(p.price), 0)::NUMERIC as total_value
  FROM brands b
  LEFT JOIN parts p ON p.brand_id = b.id AND p.status = 'sold'
  GROUP BY b.id, b.name, b.logo_url
  ORDER BY part_count DESC
  LIMIT limit_count;
END;
$$;

-- =====================================================
-- 6. Transaction Status Summary
-- =====================================================
CREATE OR REPLACE FUNCTION get_transaction_status()
RETURNS TABLE(status TEXT, count INTEGER, total_amount NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.payment_status as status,
    COUNT(t.id)::INTEGER as count,
    COALESCE(SUM(t.amount), 0)::NUMERIC as total_amount
  FROM transactions t
  GROUP BY t.payment_status
  ORDER BY count DESC;
END;
$$;

-- =====================================================
-- 7. Daily Stats (dashboard overview)
-- =====================================================
CREATE OR REPLACE FUNCTION get_daily_stats()
RETURNS TABLE(
  today_revenue NUMERIC,
  today_transactions INTEGER,
  yesterday_revenue NUMERIC,
  yesterday_transactions INTEGER,
  active_listings INTEGER,
  total_users INTEGER,
  total_parts INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE((
      SELECT SUM(t.amount) FROM transactions t 
      WHERE t.payment_status = 'completed' 
        AND DATE(t.created_at) = CURRENT_DATE
    ), 0)::NUMERIC as today_revenue,
    
    COALESCE((
      SELECT COUNT(*) FROM transactions t 
      WHERE t.payment_status = 'completed' 
        AND DATE(t.created_at) = CURRENT_DATE
    ), 0)::INTEGER as today_transactions,
    
    COALESCE((
      SELECT SUM(t.amount) FROM transactions t 
      WHERE t.payment_status = 'completed' 
        AND DATE(t.created_at) = CURRENT_DATE - 1
    ), 0)::NUMERIC as yesterday_revenue,
    
    COALESCE((
      SELECT COUNT(*) FROM transactions t 
      WHERE t.payment_status = 'completed' 
        AND DATE(t.created_at) = CURRENT_DATE - 1
    ), 0)::INTEGER as yesterday_transactions,
    
    (SELECT COUNT(*) FROM parts WHERE status = 'active')::INTEGER as active_listings,
    (SELECT COUNT(*) FROM profiles)::INTEGER as total_users,
    (SELECT COUNT(*) FROM parts)::INTEGER as total_parts;
END;
$$;

-- =====================================================
-- 8. Recent Transactions
-- =====================================================
CREATE OR REPLACE FUNCTION get_recent_transactions(limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
  id UUID,
  buyer_name TEXT,
  seller_name TEXT,
  part_title TEXT,
  amount NUMERIC,
  payment_status TEXT,
  fulfillment_status TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    buyer.username as buyer_name,
    seller.username as seller_name,
    p.title as part_title,
    t.amount::NUMERIC,
    t.payment_status,
    t.fulfillment_status,
    t.created_at
  FROM transactions t
  LEFT JOIN profiles buyer ON buyer.id = t.buyer_id
  LEFT JOIN profiles seller ON seller.id = t.seller_id
  LEFT JOIN parts p ON p.id = t.part_id
  ORDER BY t.created_at DESC
  LIMIT limit_count;
END;
$$;
-- =====================================================
-- 9. Advanced Financial Stats
-- =====================================================
CREATE OR REPLACE FUNCTION get_advanced_financial_stats()
RETURNS TABLE(
  total_gmv NUMERIC,
  completed_revenue NUMERIC,
  retained_escrow NUMERIC,
  current_month_revenue NUMERIC,
  previous_month_revenue NUMERIC,
  total_transactions_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(t.amount), 0)::NUMERIC as total_gmv,
    
    COALESCE(SUM(t.amount) FILTER (WHERE t.payment_status = 'completed'), 0)::NUMERIC as completed_revenue,
    
    COALESCE(SUM(t.amount) FILTER (WHERE t.payment_status = 'pending'), 0)::NUMERIC as retained_escrow,
    
    COALESCE(SUM(t.amount) FILTER (
      WHERE t.payment_status = 'completed' 
      AND t.created_at >= DATE_TRUNC('month', CURRENT_DATE)
    ), 0)::NUMERIC as current_month_revenue,

    COALESCE(SUM(t.amount) FILTER (
      WHERE t.payment_status = 'completed' 
      AND t.created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
      AND t.created_at < DATE_TRUNC('month', CURRENT_DATE)
    ), 0)::NUMERIC as previous_month_revenue,

    COUNT(*)::INTEGER as total_transactions_count
  FROM transactions t;
END;
$$;
