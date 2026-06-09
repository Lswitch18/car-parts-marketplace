import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../logistics/_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify({ success: true, data }), {
    status,
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  })
}

function fail(msg: string, status = 400) {
  return new Response(JSON.stringify({ success: false, error: msg }), {
    status,
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() })
  }

  const url = new URL(req.url)
  const path = url.pathname.replace('/parts-lookup', '')

  try {
    if (path === '/brands') return await getBrands()
    if (path === '/models') return await getModels(url)
    if (path === '/vehicles') return await getVehicles(url)
    if (path === '/categories') return await getCategories()
    if (path === '/search') return await searchParts(url)
    if (path.startsWith('/part/')) return await getPartDetail(path)
    if (path.startsWith('/vehicle/') && path.endsWith('/parts')) return await getVehicleParts(path)

    return fail('Not found', 404)
  } catch (err) {
    return fail(err.message, 500)
  }
})

async function getBrands() {
  const { data, error } = await supabase
    .from('brands')
    .select('id, name, slug, logo_url')
    .order('name')

  if (error) return fail(error.message)

  const brands = await Promise.all(data.map(async (b) => {
    const { count } = await supabase
      .from('parts_catalog')
      .select('*', { count: 'exact', head: true })
      .eq('brand_id', b.id)
    return { ...b, parts_count: count || 0 }
  }))

  return json(brands)
}

async function getModels(url: URL) {
  const brandId = url.searchParams.get('brand_id')
  if (!brandId) return fail('brand_id required')

  const { data, error } = await supabase
    .from('vehicle_models')
    .select('name, generation, year_start, year_end')
    .eq('brand_id', brandId)
    .order('name')

  if (error) return fail(error.message)

  const grouped = data.reduce((acc, row) => {
    const existing = acc.find((g) => g.name === row.name)
    if (existing) {
      existing.generations.push({
        name: row.generation,
        year_start: row.year_start,
        year_end: row.year_end,
      })
    } else {
      acc.push({
        name: row.name,
        generations: [{
          name: row.generation,
          year_start: row.year_start,
          year_end: row.year_end,
        }],
      })
    }
    return acc
  }, [] as { name: string; generations: { name: string | null; year_start: number; year_end: number | null }[] }[])

  return json(grouped)
}

async function getVehicles(url: URL) {
  const modelName = url.searchParams.get('model')
  const year = url.searchParams.get('year') ? parseInt(url.searchParams.get('year')!) : null

  let query = supabase
    .from('vehicle_models')
    .select('*, brand:brands(id, name, slug, logo_url)')

  if (modelName) {
    query = query.ilike('name', modelName)
  }

  if (year) {
    query = query.lte('year_start', year).or(`year_end.gte.${year},year_end.is.null`)
  }

  const { data, error } = await query.order('name').limit(50)
  if (error) return fail(error.message)
  return json(data)
}

async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name')

  if (error) return fail(error.message)

  const cats = await Promise.all(data.map(async (c) => {
    const { count } = await supabase
      .from('parts_catalog')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', c.id)
    return { ...c, parts_count: count || 0 }
  }))

  return json(cats)
}

async function searchParts(url: URL) {
  const q = url.searchParams.get('q') || ''
  const vehicleId = url.searchParams.get('vehicle_id')
  const categoryId = url.searchParams.get('category_id')
  const brandId = url.searchParams.get('brand_id')
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20')))
  const offset = (page - 1) * limit

  let countQuery = supabase.from('parts_catalog').select('*', { count: 'exact', head: true })
  let dataQuery = supabase
    .from('parts_catalog')
    .select('*, brand:brands(id, name, slug, logo_url), category:categories(id, name, slug)')

  if (q) {
    const filter = `part_number.ilike.%${q}%,oem_number.ilike.%${q}%,name.ilike.%${q}%`
    countQuery = countQuery.or(filter)
    dataQuery = dataQuery.or(filter)
  }

  if (brandId) {
    countQuery = countQuery.eq('brand_id', brandId)
    dataQuery = dataQuery.eq('brand_id', brandId)
  }

  if (categoryId) {
    countQuery = countQuery.eq('category_id', categoryId)
    dataQuery = dataQuery.eq('category_id', categoryId)
  }

  if (vehicleId) {
    const fitParts = supabase
      .from('fitment')
      .select('part_id')
      .eq('vehicle_id', vehicleId)

    countQuery = countQuery.in('id', fitParts)
    dataQuery = dataQuery.in('id', fitParts)
  }

  const { count } = await countQuery
  const { data, error } = await dataQuery
    .order('name')
    .range(offset, offset + limit - 1)

  if (error) return fail(error.message)

  return json({
    parts: data,
    total: count || 0,
    page,
    total_pages: Math.ceil((count || 0) / limit),
  })
}

async function getPartDetail(path: string) {
  const partNumber = decodeURIComponent(path.replace('/part/', ''))
  if (!partNumber) return fail('part_number required')

  const { data, error } = await supabase
    .from('parts_catalog')
    .select('*, brand:brands(id, name, slug, logo_url), category:categories(id, name, slug)')
    .or(`part_number.ilike.${partNumber},oem_number.ilike.${partNumber}`)
    .limit(1)
    .maybeSingle()

  if (error) return fail(error.message)
  if (!data) return fail('Part not found', 404)

  const { data: fitments } = await supabase
    .from('fitment')
    .select('*, vehicle:vehicle_models(*, brand:brands(id, name, slug, logo_url))')
    .eq('part_id', data.id)

  return json({ ...data, compatible_vehicles: fitments || [] })
}

async function getVehicleParts(path: string) {
  const vehicleId = path.replace('/vehicle/', '').replace('/parts', '')
  if (!vehicleId) return fail('vehicle_id required')

  const { data, error } = await supabase
    .from('fitment')
    .select('*, part:parts_catalog(*, brand:brands(id, name, slug, logo_url), category:categories(id, name, slug))')
    .eq('vehicle_id', vehicleId)

  if (error) return fail(error.message)

  const grouped = (data || []).reduce((acc, f) => {
    const catName = f.part?.category?.name || 'Other'
    const catId = f.part?.category?.id || 'other'
    const catSlug = f.part?.category?.slug || 'other'
    const existing = acc.find((g) => g.category.id === catId)
    const item = {
      ...f.part,
      position: f.position,
      notes: f.notes,
      oem_ref: f.oem_ref,
    }
    if (existing) {
      existing.parts.push(item)
    } else {
      acc.push({
        category: { id: catId, name: catName, slug: catSlug },
        parts: [item],
      })
    }
    return acc
  }, [] as { category: { id: string; name: string; slug: string }; parts: any[] }[])

  return json(grouped)
}
