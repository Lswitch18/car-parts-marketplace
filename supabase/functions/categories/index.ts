import { supabase, successResponse, errorResponse, corsHeaders } from '../utils/base.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);

    const resource = pathParts[pathParts.length - 1];

    if (req.method === 'GET') {
      if (resource === 'categories') return await listCategories();
      if (resource === 'brands') return await listBrands();

      const id = pathParts[pathParts.length - 1];
      if (id.match(/^[0-9a-f-]{36}$/)) {
        if (pathParts[pathParts.length - 2] === 'categories') return await getCategory(id);
        if (pathParts[pathParts.length - 2] === 'brands') return await getBrand(id);
      }
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

async function listCategories() {
  const { data, error } = await supabase
    .from('categories')
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
    .select('category_id');

  const categoryCount: Record<string, number> = {};
  counts?.forEach(p => {
    if (p.category_id) {
      categoryCount[p.category_id] = (categoryCount[p.category_id] || 0) + 1;
    }
  });

  const categoriesWithCount = data?.map(cat => ({
    ...cat,
    parts_count: categoryCount[cat.id] || 0,
  })) || [];

  return new Response(JSON.stringify(successResponse(categoriesWithCount)), {
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}

async function getCategory(categoryId: string) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', categoryId)
    .single();

  if (error) {
    return new Response(JSON.stringify(errorResponse('Categoria não encontrada')), {
      status: 404,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
    });
  }

  const { data: parts } = await supabase
    .from('parts')
    .select('id')
    .eq('category_id', categoryId)
    .eq('status', 'active');

  return new Response(JSON.stringify(successResponse({
    ...data,
    parts_count: parts?.length || 0,
  })), {
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}

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
    .select('id, name, slug, generation')
    .eq('brand_id', brandId)
    .order('name');

  const { data: parts } = await supabase
    .from('parts')
    .select('id')
    .eq('brand_id', brandId)
    .eq('status', 'active');

  return new Response(JSON.stringify(successResponse({
    ...brand,
    models: models || [],
    parts_count: parts?.length || 0,
  })), {
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}