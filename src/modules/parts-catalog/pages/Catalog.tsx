import { useState, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { Filter, X, Heart, Wrench, ChevronRight, SlidersHorizontal, Search, Zap, Star, BadgeCheck, LayoutGrid, List, Package, Plus } from 'lucide-react'
import SafeImage from '@/modules/parts-catalog/components/SafeImage'
import { supabase } from '@/modules/shared/lib/supabase'
import { CATEGORIES, CONDITIONS, YEARS, BRAND_UUIDS, MODEL_UUIDS, CATEGORY_UUIDS } from '@/modules/shared/lib/constants'
import { useFavoriteStore } from '@/modules/parts-catalog/store/favoriteStore'
import { fetchParts } from '@/modules/parts-catalog/api/partsApi'
import { Product } from '@/modules/shared/types'
import { getCountryFlag, getCountryOrder, getCountryDisplayName, resolveBrandCountry } from '@/modules/shared/lib/countryFlags'
import { useI18n } from '@/modules/shared/lib/i18n'
import { localizeProductTitle, resolveProductBrandName } from '@/modules/parts-catalog/utils/catalogLocalizer'

// Extend product with relational fields used in UI
interface ProductUI extends Product {
  brands?: { name?: string }
  categories?: { name?: string }
  profiles?: { rating?: number; is_verified?: boolean }
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden border border-white/5 bg-[#0A0A0F]">
      <div className="aspect-[4/3] skeleton" />
      <div className="p-4 space-y-2.5">
        <div className="skeleton h-3 w-16 rounded-full" />
        <div className="skeleton h-4 w-3/4 rounded-lg" />
        <div className="skeleton h-3 w-1/2 rounded-full" />
        <div className="skeleton h-5 w-24 rounded-lg mt-3" />
      </div>
    </div>
  )
}

export default function Catalog() {
  const { t, language } = useI18n()
  const [searchParams, setSearchParams] = useSearchParams()
  const { toggleFavorite, isFavorite } = useFavoriteStore()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')


  const [filters, setFilters] = useState({
    brand: searchParams.get('brand') || '',
    model: searchParams.get('model') || '',
    category: searchParams.get('category') || '',
    condition: searchParams.get('condition') || '',
    yearStart: searchParams.get('yearStart') || '',
    yearEnd: searchParams.get('yearEnd') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    search: searchParams.get('search') || ''
  })

  const [expandedBrand, setExpandedBrand] = useState<string | null>(filters.brand || null)
  const [showBrands, setShowBrands] = useState(true)
  const [collapsedCountries, setCollapsedCountries] = useState<Set<string>>(new Set())

  const { data: dbBrands = [] } = useQuery<{ id: string; name: string; slug: string; country: string | null }[]>({
    queryKey: ['brands'],
    staleTime: 300_000,
    queryFn: async () => {
      const { data } = await supabase
        .from('brands')
        .select('id, name, slug, country')
        .not('slug', 'is', null)
        .order('name')
      return data || []
    },
  })

  const brandsByCountry = useMemo(() => {
    const grouped: Record<string, { id: string; name: string; slug: string; country: string | null }[]> = {}
    for (const b of dbBrands) {
      const key = resolveBrandCountry(b.name, b.slug, b.country)
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(b)
    }
    return Object.entries(grouped).sort(
      ([a], [b]) => getCountryOrder(a) - getCountryOrder(b)
    )
  }, [dbBrands])

  const toggleCountry = (country: string) => {
    setCollapsedCountries(prev => {
      const next = new Set(prev)
      if (next.has(country)) next.delete(country)
      else next.add(country)
      return next
    })
  }
  const [sortBy, setSortBy] = useState('created_at')
  const [searchInput, setSearchInput] = useState(filters.search)

  const activeFiltersCount = useMemo(() => Object.values(filters).filter(v => v).length, [filters])

  const { data: products = [], isLoading } = useQuery<ProductUI[]>({
    queryKey: ['products', 'catalog', filters, sortBy],
    staleTime: 300_000,
    gcTime: 300_000,
    queryFn: async () => {
      try {
        const result = await fetchParts({
          sort: sortBy,
          order: 'desc',
          limit: 20,
          filters: {
            brand_id: filters.brand ? (BRAND_UUIDS[filters.brand] || filters.brand) : undefined,
            model_id: filters.model ? (MODEL_UUIDS[filters.model] || filters.model) : undefined,
            category_id: filters.category ? (CATEGORY_UUIDS[filters.category] || filters.category) : undefined,
            condition: filters.condition || undefined,
            min_price: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
            max_price: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
            search: filters.search || undefined,
          },
        })
        return result.parts
      } catch {
        let query = supabase
          .from('parts')
          .select('*, brands(name), categories(name), profiles!parts_seller_id_fkey(full_name, avatar_url, rating, is_verified)')
          .eq('status', 'active')

        if (filters.brand) {
          const brandUuid = BRAND_UUIDS[filters.brand] || filters.brand
          query = query.eq('brand_id', brandUuid)
        }
        if (filters.model) {
          const modelUuid = MODEL_UUIDS[filters.model] || filters.model
          query = query.eq('model_id', modelUuid)
        }
        if (filters.category) {
          const catUuid = CATEGORY_UUIDS[filters.category] || filters.category
          query = query.eq('category_id', catUuid)
        }
        if (filters.condition) query = query.eq('condition', filters.condition)
        if (filters.minPrice) query = query.gte('price', parseFloat(filters.minPrice))
        if (filters.maxPrice) query = query.lte('price', parseFloat(filters.maxPrice))
        if (filters.search) query = query.ilike('title', `%${filters.search.replace(/[\\%_*]/g, (m) => `\\${m}`)}%`)

        query = query.order(sortBy, { ascending: false })

        const { data, error } = await query.limit(20)
        if (error) throw error
        return data || []
      }
    },
  })

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    if (value) {
      searchParams.set(key, value)
    } else {
      searchParams.delete(key)
    }
    setSearchParams(searchParams)
  }

  const setBrand = (brandId: string) => {
    const newBrand = filters.brand === brandId ? '' : brandId
    updateFilter('brand', newBrand)
    updateFilter('model', '')
    setExpandedBrand(newBrand || null)
  }

  const setModelFilter = (model: string) => {
    updateFilter('model', filters.model === model ? '' : model)
  }

  const clearFilters = () => {
    setFilters({
      brand: '', model: '', category: '', condition: '',
      yearStart: '', yearEnd: '', minPrice: '', maxPrice: '', search: ''
    })
    setSearchParams({})
    setExpandedBrand(null)
  }

  const handleSearch = (query: string) => {
    updateFilter('search', query)
  }

  const conditionLabel = (c: string) => {
    if (c === 'new') return t('Novo')
    if (c === 'used') return t('Usado')
    return t('Reformado')
  }

  const conditionColor = (c: string) => {
    if (c === 'new') return { bg: 'rgba(0,217,126,0.15)', color: '#00D97E', border: 'rgba(0,217,126,0.3)' }
    if (c === 'used') return { bg: 'rgba(255,184,0,0.15)', color: '#FFB800', border: 'rgba(255,184,0,0.3)' }
    return { bg: 'rgba(13,117,255,0.15)', color: '#0D75FF', border: 'rgba(13,117,255,0.3)' }
  }

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* ── Hero Header ── */}
      <div
        className="relative overflow-hidden border-b"
        style={{ borderColor: 'rgba(13,117,255,0.12)', background: 'linear-gradient(180deg, #0A0A1A 0%, #050505 100%)' }}
      >
        {/* Background grid */}
        <div className="absolute inset-0 grid-overlay opacity-40 pointer-events-none" />
        {/* Glow accent */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(13,117,255,0.12) 0%, transparent 70%)' }}
        />

        <div className="relative max-w-7xl mx-auto px-4 pt-10 pb-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(13,117,255,0.15)', border: '1px solid rgba(13,117,255,0.3)' }}
                >
                  <Zap className="w-3.5 h-3.5" style={{ color: '#0D75FF' }} />
                </div>
                <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#0D75FF' }}>
                  {t('Catálogo JDM')}
                </span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight">
                {t('Encontre sua')}{' '}
                <span
                  style={{
                    background: 'linear-gradient(135deg, #0D75FF 0%, #7000FF 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {t('Peça Ideal')}
                </span>
              </h1>
              {!isLoading && (
                <p className="mt-2 text-sm" style={{ color: '#6B7280' }}>
                  <span className="font-semibold" style={{ color: '#B0B5C0' }}>{products?.length || 0}</span> {t('peças disponíveis no estoque')}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
              <Link
                to="/create-listing"
                className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs md:text-sm rounded-xl shadow-lg shadow-blue-600/30 flex items-center space-x-2 border border-blue-400/30 transition hover:scale-105 shrink-0"
              >
                <Plus className="w-4 h-4 text-blue-200" />
                <span>{t('Anunciar Peça')}</span>
              </Link>

              {/* Search bar */}
              <SearchBar initialValue={filters.search} onSearch={handleSearch} t={t} />
            </div>
          </div>

          {/* Active filter chips */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-5">
              {Object.entries(filters).filter(([, v]) => v).map(([key, val]) => (
                <span
                  key={key}
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium transition-all"
                  style={{
                    background: 'rgba(13,117,255,0.1)',
                    color: '#4d9cff',
                    border: '1px solid rgba(13,117,255,0.25)',
                  }}
                >
                  <span style={{ color: '#6B7280' }}>
                    {key === 'brand' && t('catalog.brand')}
                    {key === 'model' && t('Modelo')}
                    {key === 'category' && t('Categoria')}
                    {key === 'condition' && t('catalog.condition')}
                    {key === 'minPrice' && t('Preço mín')}
                    {key === 'maxPrice' && t('Preço máx')}
                    {key === 'search' && t('Busca')}
                    {key === 'yearStart' && t('catalog.yearFrom')}
                    {key === 'yearEnd' && t('catalog.yearTo')}
                  </span>
                  {key === 'condition' ? conditionLabel(val) : (key === 'category' || key === 'brand') ? t(val) : val}
                  <button
                    onClick={() => updateFilter(key, '')}
                    className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-white/10"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <button
                onClick={clearFilters}
                className="flex items-center justify-center w-7 h-7 rounded-full transition-colors hover:bg-blue-500/20"
                style={{ color: '#0D75FF', background: 'rgba(13, 117, 255, 0.1)', border: '1px solid rgba(13, 117, 255, 0.2)' }}
                title={t('Limpar Filtros')}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-7">

          {/* ── Sidebar ── */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div
              className="sticky top-24 rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(10,10,15,0.9)',
                border: '1px solid rgba(255,255,255,0.05)',
                backdropFilter: 'blur(12px)',
              }}
            >
              {/* Sidebar header */}
              <div
                className="px-4 py-3 flex items-center gap-2"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
              >
                <SlidersHorizontal className="w-4 h-4" style={{ color: '#0D75FF' }} />
                <span className="text-sm font-semibold text-white">{t('Filtros')}</span>
                {activeFiltersCount > 0 && (
                  <span
                    className="ml-auto text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full"
                    style={{ background: '#0D75FF', color: '#fff' }}
                  >
                    {activeFiltersCount}
                  </span>
                )}
              </div>

              <div className="p-3 space-y-1">
                {/* Brands section */}
                <button
                  onClick={() => setShowBrands(!showBrands)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors hover:bg-white/5"
                >
                  <Filter className="w-3.5 h-3.5" style={{ color: '#0D75FF' }} />
                  {t('catalog.brands')}
                  <ChevronRight
                    className="w-3.5 h-3.5 ml-auto transition-transform duration-200"
                    style={{ transform: showBrands ? 'rotate(90deg)' : 'rotate(0deg)', color: '#6B7280' }}
                  />
                </button>

                {showBrands && (
                  <div className="space-y-1 max-h-[50vh] overflow-y-auto pr-1 scrollbar-thin ml-1">
                    {brandsByCountry.map(([country, brands]) => {
                      const isCollapsed = collapsedCountries.has(country)
                      const flag = getCountryFlag(country)
                      return (
                        <div key={country}>
                          <button
                            onClick={() => toggleCountry(country)}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors hover:bg-white/5"
                            style={{ color: '#6B7280' }}
                          >
                            <span className="text-base">{flag}</span>
                            <span className="uppercase tracking-wider">{getCountryDisplayName(country, t)}</span>
                            <span className="ml-auto text-[10px] opacity-50">{brands.length}</span>
                            <ChevronRight
                              className="w-3 h-3 transition-transform duration-200"
                              style={{
                                transform: isCollapsed ? 'rotate(0deg)' : 'rotate(90deg)',
                                color: '#4B5563',
                              }}
                            />
                          </button>
                          {!isCollapsed && (
                            <div className="space-y-0.5 ml-1">
                              {brands.map(brand => (
                                <div key={brand.id}>
                                  <button
                                    onClick={() => setBrand(brand.slug)}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all"
                                    style={
                                      filters.brand === brand.slug
                                        ? {
                                            background: 'rgba(13,117,255,0.12)',
                                            color: '#4d9cff',
                                            border: '1px solid rgba(13,117,255,0.25)',
                                          }
                                        : {
                                            color: '#6B7280',
                                            border: '1px solid transparent',
                                          }
                                    }
                                  >
                                    <span className="text-xs opacity-50">{flag}</span>
                                    <span className="truncate">{t(brand.name)}</span>
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Divider */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', margin: '8px 0' }} />

                {/* Filters */}
                <div className="space-y-3 px-1">
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#6B7280' }}>{t('Categoria')}</label>
                    <select
                      value={filters.category}
                      onChange={e => updateFilter('category', e.target.value)}
                      className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
                      style={{
                        background: 'rgba(17,17,22,0.9)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        color: filters.category ? '#fff' : '#6B7280',
                      }}
                    >
                      <option value="">{t('Todas')}</option>
                      {CATEGORIES.map(c => <option key={c.id} value={c.id}>{t(c.name)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#6B7280' }}>{t('catalog.condition')}</label>
                    <select
                      value={filters.condition}
                      onChange={e => updateFilter('condition', e.target.value)}
                      className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
                      style={{
                        background: 'rgba(17,17,22,0.9)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        color: filters.condition ? '#fff' : '#6B7280',
                      }}
                    >
                      <option value="">{t('Todas')}</option>
                      {CONDITIONS.map(c => <option key={c.id} value={c.id}>{t(c.label)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#6B7280' }}>{t('Ano')}</label>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={filters.yearStart}
                        onChange={e => updateFilter('yearStart', e.target.value)}
                        className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                        style={{
                          background: 'rgba(17,17,22,0.9)',
                          border: '1px solid rgba(255,255,255,0.07)',
                          color: filters.yearStart ? '#fff' : '#6B7280',
                        }}
                      >
                        <option value="">{t('De')}</option>
                        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                      <select
                        value={filters.yearEnd}
                        onChange={e => updateFilter('yearEnd', e.target.value)}
                        className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                        style={{
                          background: 'rgba(17,17,22,0.9)',
                          border: '1px solid rgba(255,255,255,0.07)',
                          color: filters.yearEnd ? '#fff' : '#6B7280',
                        }}
                      >
                        <option value="">{t('Até')}</option>
                        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#6B7280' }}>{t('Faixa de Preço (¥)')}</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder={t('Mín')}
                        value={filters.minPrice}
                        onChange={e => updateFilter('minPrice', e.target.value)}
                        className="w-full rounded-xl px-3 py-2.5 text-sm outline-none text-white"
                        style={{
                          background: 'rgba(17,17,22,0.9)',
                          border: '1px solid rgba(255,255,255,0.07)',
                        }}
                      />
                      <input
                        type="number"
                        placeholder={t('Máx')}
                        value={filters.maxPrice}
                        onChange={e => updateFilter('maxPrice', e.target.value)}
                        className="w-full rounded-xl px-3 py-2.5 text-sm outline-none text-white"
                        style={{
                          background: 'rgba(17,17,22,0.9)',
                          border: '1px solid rgba(255,255,255,0.07)',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {activeFiltersCount > 0 && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px', marginTop: '8px' }}>
                    <button
                      onClick={clearFilters}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all hover:bg-blue-500/20"
                      style={{ color: '#0D75FF', background: 'rgba(13, 117, 255, 0.1)', border: '1px solid rgba(13, 117, 255, 0.2)' }}
                    >
                      <X className="w-4 h-4" />
                      {t('Limpar Filtros')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* ── Main Content ── */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                {!isLoading && (
                  <p className="text-sm" style={{ color: '#6B7280' }}>
                    <span className="font-semibold text-white">{products?.length || 0}</span> {t('catalog.results')}
                  </p>
                )}
                {/* View mode toggle */}
                <div
                  className="hidden sm:flex items-center p-1 rounded-xl gap-1"
                  style={{ background: 'rgba(10,10,15,0.9)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <button
                    onClick={() => setViewMode('grid')}
                    className="p-1.5 rounded-lg transition-all"
                    style={
                      viewMode === 'grid'
                        ? { background: 'rgba(13,117,255,0.15)', color: '#4d9cff' }
                        : { color: '#6B7280' }
                    }
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className="p-1.5 rounded-lg transition-all"
                    style={
                      viewMode === 'list'
                        ? { background: 'rgba(13,117,255,0.15)', color: '#4d9cff' }
                        : { color: '#6B7280' }
                    }
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: '#6B7280' }}>{t('Ordenar:')}</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="rounded-xl px-3 py-2 text-sm outline-none text-white"
                  style={{
                    background: 'rgba(10,10,15,0.9)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <option value="created_at">{t('Mais recentes')}</option>
                  <option value="price">{t('Menor preço')}</option>
                  <option value="-price">{t('Maior preço')}</option>
                  <option value="views">{t('Mais vistos')}</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className={viewMode === 'grid'
                ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                : 'flex flex-col gap-3'
              }>
                {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : products?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div
                  className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
                  style={{ background: 'rgba(10,10,15,0.8)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <Wrench className="w-9 h-9" style={{ color: '#6B7280' }} />
                </div>
                <p className="text-lg font-semibold text-white mb-1">{t('Nenhuma peça encontrada')}</p>
                <p className="text-sm mb-5" style={{ color: '#6B7280' }}>{t('Tente ajustar os filtros ou a busca')}</p>
                <button
                  onClick={clearFilters}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: 'rgba(13,117,255,0.15)', color: '#4d9cff', border: '1px solid rgba(13,117,255,0.25)' }}
                >
                  {t('Limpar filtros')}
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products?.map((product) => {
                  const cond = conditionColor(product.condition)
                  return (
                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
                      className="group block rounded-2xl overflow-hidden transition-all duration-300"
                      style={{
                        background: 'rgba(10,10,15,0.9)',
                        border: '1px solid rgba(255,255,255,0.05)',
                      }}
                    >
                      {/* Image */}
                      <div className="aspect-[4/3] bg-[#050505] relative overflow-hidden">
                        <SafeImage
                          src={product.images?.[0]}
                          alt={product.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          fallback={<div className="w-full h-full flex items-center justify-center"><Package className="w-10 h-10" style={{ color: '#374151' }} /></div>}
                        />
                        {/* Gradient overlay */}
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                          style={{ background: 'linear-gradient(0deg, rgba(13,117,255,0.12) 0%, transparent 60%)' }}
                        />
                        {/* Favorite */}
                        <button
                          onClick={e => { e.preventDefault(); toggleFavorite(product.id) }}
                          className="absolute top-2.5 right-2.5 p-2 rounded-xl transition-all"
                          style={{
                            background: 'rgba(0,0,0,0.6)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255,255,255,0.1)',
                          }}
                        >
                          <Heart
                            className="w-3.5 h-3.5 transition-colors"
                            style={
                              isFavorite(product.id)
                                ? { fill: '#FF4B4B', color: '#FF4B4B' }
                                : { color: '#fff' }
                            }
                          />
                        </button>
                        {/* Condition badge */}
                        <div className="absolute top-2.5 left-2.5">
                          <span
                            className="text-[10px] font-bold px-2 py-1 rounded-lg"
                            style={{ background: cond.bg, color: cond.color, border: `1px solid ${cond.border}` }}
                          >
                            {conditionLabel(product.condition)}
                          </span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-3.5">
                        <p className="text-[11px] font-semibold mb-0.5 uppercase tracking-wider" style={{ color: '#0D75FF' }}>
                          {resolveProductBrandName(product.brands?.name, product.title, t)}
                        </p>
                        <h3
                          className="text-sm font-semibold text-white mb-1 truncate transition-colors group-hover:text-[#4d9cff]"
                        >
                          {localizeProductTitle(product.title, language)}
                        </h3>
                        <p className="text-xs mb-3 truncate" style={{ color: '#6B7280' }}>
                          {t(product.categories?.name || '')}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-base font-bold" style={{ color: '#0D75FF' }}>
                            ¥ {product.price.toLocaleString('ja-JP')}
                          </p>
                          {product.profiles && (
                            <div
                              className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs"
                              style={{
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.06)',
                              }}
                            >
                              <Star className="w-3 h-3" style={{ fill: '#FFB800', color: '#FFB800' }} />
                              <span className="font-semibold text-white">
                                {product.profiles.rating ? product.profiles.rating.toFixed(1) : '5.0'}
                              </span>
                              {product.profiles.is_verified && (
                                <BadgeCheck className="w-3 h-3 ml-0.5" style={{ color: '#0D75FF' }} />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              /* List View */
              <div className="flex flex-col gap-3">
                {products?.map((product) => {
                  const cond = conditionColor(product.condition)
                  return (
                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
                      className="group flex gap-4 p-4 rounded-2xl transition-all duration-300"
                      style={{
                        background: 'rgba(10,10,15,0.9)',
                        border: '1px solid rgba(255,255,255,0.05)',
                      }}
                    >
                      <div className="w-28 h-20 rounded-xl bg-[#050505] overflow-hidden flex-shrink-0 relative">
                        <SafeImage
                          src={product.images?.[0]}
                          alt={product.title}
                          className="w-full h-full object-cover"
                          fallback={<div className="w-full h-full flex items-center justify-center"><Package className="w-6 h-6" style={{ color: '#374151' }} /></div>}
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#0D75FF' }}>
                            {resolveProductBrandName(product.brands?.name, product.title, t)}
                          </span>
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                            style={{ background: cond.bg, color: cond.color }}
                          >
                            {conditionLabel(product.condition)}
                          </span>
                        </div>
                        <h3 className="text-sm font-semibold text-white truncate group-hover:text-[#4d9cff] transition-colors">
                          {localizeProductTitle(product.title, language)}
                        </h3>
                        <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{t(product.categories?.name || '')}</p>
                      </div>
                      <div className="flex flex-col items-end justify-center gap-2 flex-shrink-0">
                        <p className="text-lg font-bold" style={{ color: '#0D75FF' }}>
                          ¥ {product.price.toLocaleString('ja-JP')}
                        </p>
                        <button
                          onClick={e => { e.preventDefault(); toggleFavorite(product.id) }}
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ background: 'rgba(255,255,255,0.04)' }}
                        >
                          <Heart
                            className="w-4 h-4"
                            style={isFavorite(product.id) ? { fill: '#FF4B4B', color: '#FF4B4B' } : { color: '#6B7280' }}
                          />
                        </button>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}

// Otimização: Componente isolado para evitar re-render da página inteira ao digitar
const SearchBar = ({ initialValue, onSearch, t }: { initialValue: string, onSearch: (q: string) => void, t: any }) => {
  const [localSearch, setLocalSearch] = useState(initialValue)

  // Sincroniza se o filtro for apagado globalmente
  useMemo(() => {
    setLocalSearch(initialValue)
  }, [initialValue])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(localSearch)
  }

  return (
    <form onSubmit={handleSubmit} className="flex-1 min-w-[280px] max-w-md">
      <div
        className="flex items-center gap-3 px-4 h-12 rounded-2xl transition-all"
        style={{
          background: 'rgba(10,10,15,0.8)',
          border: '1px solid rgba(13,117,255,0.2)',
          boxShadow: '0 0 0 0 rgba(13,117,255,0)',
        }}
      >
        <Search className="w-4 h-4 flex-shrink-0" style={{ color: '#6B7280' }} />
        <input
          type="text"
          placeholder={t('Buscar peças, marcas...')}
          value={localSearch}
          onChange={e => setLocalSearch(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-[#6B7280]"
        />
        {localSearch && (
          <button type="button" onClick={() => { setLocalSearch(''); onSearch(''); }}>
            <X className="w-4 h-4" style={{ color: '#6B7280' }} />
          </button>
        )}
      </div>
    </form>
  )
}