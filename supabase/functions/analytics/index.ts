import { supabase, successResponse, errorResponse, corsHeaders, requireAuth } from '../utils/base.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  // Security: Require admin auth for financial and analytics data
  const { user, response: authRes } = await requireAuth(req);
  if (authRes) return authRes;

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') {
    return new Response(JSON.stringify(errorResponse('Acesso negado. Requer privilégios de administrador.')), {
      status: 403,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const analyticsType = pathParts[pathParts.length - 1] || 'all';

    const days = parseInt(url.searchParams.get('days') || '7');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '5'), 20);

    let data;

    switch (analyticsType) {
      case 'sales':
        data = await getSalesByDate(days);
        break;
      case 'sellers':
        data = await getTopSellers(limit);
        break;
      case 'categories':
        data = await getPartsByCategory();
        break;
      case 'users':
        data = await getUserGrowth();
        break;
      case 'brands':
        data = await getPopularBrands(limit);
        break;
      case 'status':
        data = await getTransactionStatus();
        break;
      case 'daily':
        data = await getDailyStats();
        break;
      case 'recent':
        data = await getRecentTransactions(limit);
        break;
      case 'all':
        data = await getAllAnalytics();
        break;
      default:
        return new Response(JSON.stringify(errorResponse('Tipo de analytics inválido')), {
          status: 400,
          headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
        });
    }

    return new Response(JSON.stringify(successResponse(data)), {
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Erro interno no servidor';
    return new Response(JSON.stringify(errorResponse(errorMessage)), {
      status: 500,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }
});

async function getSalesByDate(days: number) {
  const { data, error } = await supabase
    .rpc('get_sales_by_date', { days });

  if (error) {
    console.error('get_sales_by_date error:', error);
    return { sales: [], period: days };
  }

  return {
    sales: data || [],
    period: days,
    total: (data || []).reduce((sum: number, item: { revenue: string }) => sum + parseFloat(item.revenue || '0'), 0),
  };
}

async function getTopSellers(limit: number) {
  const { data, error } = await supabase
    .rpc('get_top_sellers', { limit_count: limit });

  if (error) {
    console.error('get_top_sellers error:', error);
    return { sellers: [] };
  }

  return { sellers: data || [] };
}

async function getPartsByCategory() {
  const { data, error } = await supabase
    .rpc('get_parts_by_category');

  if (error) {
    console.error('get_parts_by_category error:', error);
    return { categories: [] };
  }

  return { categories: data || [] };
}

async function getUserGrowth() {
  const { data, error } = await supabase
    .rpc('get_user_growth', { months: 6 });

  if (error) {
    console.error('get_user_growth error:', error);
    return { growth: [], months: 6 };
  }

  return {
    growth: data || [],
    months: 6,
    total: (data || []).slice(-1)[0]?.total_users || 0,
  };
}

async function getPopularBrands(limit: number) {
  const { data, error } = await supabase
    .rpc('get_popular_brands', { limit_count: limit });

  if (error) {
    console.error('get_popular_brands error:', error);
    return { brands: [] };
  }

  return { brands: data || [] };
}

async function getTransactionStatus() {
  const { data, error } = await supabase
    .rpc('get_transaction_status');

  if (error) {
    console.error('get_transaction_status error:', error);
    return { status: [] };
  }

  return { status: data || [] };
}

async function getDailyStats() {
  const { data, error } = await supabase
    .rpc('get_daily_stats');

  if (error) {
    console.error('get_daily_stats error:', error);
    return null;
  }

  return data?.[0] || null;
}

async function getRecentTransactions(limit: number) {
  const { data, error } = await supabase
    .rpc('get_recent_transactions', { limit_count: limit });

  if (error) {
    console.error('get_recent_transactions error:', error);
    return { transactions: [] };
  }

  return { transactions: data || [] };
}

async function getFinancialStats() {
  const { data, error } = await supabase
    .rpc('get_advanced_financial_stats');

  if (error) {
    console.error('get_advanced_financial_stats error:', error);
    return null;
  }

  return data?.[0] || null;
}

async function getAllAnalytics() {
  const [sales, sellers, categories, users, brands, status, daily, recent, financial] = await Promise.all([
    getSalesByDate(7),
    getTopSellers(5),
    getPartsByCategory(),
    getUserGrowth(),
    getPopularBrands(5),
    getTransactionStatus(),
    getDailyStats(),
    getRecentTransactions(10),
    getFinancialStats(),
  ]);

  return {
    sales,
    sellers,
    categories,
    users,
    brands,
    status,
    daily,
    recent,
    financial,
  };
}
