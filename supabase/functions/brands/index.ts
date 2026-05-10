import { supabase, successResponse, errorResponse, corsHeaders } from '../utils/base.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);

    if (req.method === 'GET') {
      const brandId = pathParts[pathParts.length - 1];
      if (brandId.match(/^[0-9a-f-]{36}$/)) {
        return await getBrand(brandId);
      }
      return await listBrands();
    }

    return new Response(JSON.stringify(errorResponse('Endpoint não encontrado')), {
      status: 404,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify(errorResponse(err.message)), {
      status: 500,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }
});

async function listBrands() {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('name');

  if (error) {
    return new Response(JSON.stringify(errorResponse(error.message)), {
      status: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  const { data: counts } = await supabase
    .from('parts')
    .select('brand_id');

  const brandCount: Record<string, number> = {};
  counts?.forEach(p => {
    if (p.brand_id) {
      brandCount[p.brand_id] = (brandCount[p.brand_id] || 0) + 1;
    }
  });

  const brandsWithCount = data?.map(brand => ({
    ...brand,
    parts_count: brandCount[brand.id] || 0,
  })) || [];

  return new Response(JSON.stringify(successResponse(brandsWithCount)), {
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}

async function getBrand(brandId: string) {
  const { data: brand, error } = await supabase
    .from('brands')
    .select('*')
    .eq('id', brandId)
    .single();

  if (error) {
    return new Response(JSON.stringify(errorResponse('Marca não encontrada')), {
      status: 404,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  const { data: models } = await supabase
    .from('car_models')
    .select('id, name, slug, generation, year_start, year_end')
    .eq('brand_id', brandId)
    .order('name');

  const { data: parts } = await supabase
    .from('parts')
    .select('id')
    .eq('brand_id', brandId)
    .eq('status', 'active');

  const { data: categories } = await supabase
    .from('parts')
    .select('category_id, categories(id, name)')
    .eq('brand_id', brandId)
    .eq('status', 'active');

  const categoryCount: Record<string, number> = {};
  categories?.forEach(p => {
    if (p.category_id) {
      categoryCount[p.category_id] = (categoryCount[p.category_id] || 0) + 1;
    }
  });

  const uniqueCategories = [...new Map(
    categories?.filter(p => p.categories).map(p => [p.category_id, p.categories]) || []
  ).values()].map(cat => ({
    ...cat,
    parts_count: categoryCount[cat.id] || 0,
  }));

  return new Response(JSON.stringify(successResponse({
    ...brand,
    models: models || [],
    categories: uniqueCategories,
    parts_count: parts?.length || 0,
  })), {
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}