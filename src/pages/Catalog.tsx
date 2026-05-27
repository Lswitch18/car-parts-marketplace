import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Filter, X, Search, Heart, Wrench, ChevronDown, ChevronRight, SlidersHorizontal } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { BRANDS, CATEGORIES, CONDITIONS, YEARS, BRAND_UUIDS } from '../lib/constants'
import { useFavoriteStore } from '../stores/favoriteStore'

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { toggleFavorite, isFavorite } = useFavoriteStore()
  
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
  
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [expandedBrand, setExpandedBrand] = useState<string | null>(filters.brand || null)
  const [sortBy, setSortBy] = useState('created_at')

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', 'catalog', filters],
    queryFn: async () => {
      let query = supabase
        .from('parts')
        .select('*, brands(name), categories(name), profiles(full_name, avatar_url, rating, is_verified)')
        .eq('status', 'active')

      if (filters.brand) {
        const brandUuid = BRAND_UUIDS[filters.brand] || filters.brand
        query = query.eq('brand_id', brandUuid)
      }
      if (filters.model) query = query.eq('model_id', filters.model)
      if (filters.category) query = query.eq('category_id', filters.category)
      if (filters.condition) query = query.eq('condition', filters.condition)
      if (filters.minPrice) query = query.gte('price', parseFloat(filters.minPrice))
      if (filters.maxPrice) query = query.lte('price', parseFloat(filters.maxPrice))
      if (filters.search) query = query.ilike('title', `%${filters.search}%`)

      query = query.order(sortBy, { ascending: false })
      
      const { data, error } = await query.limit(50)
      
      if (error) throw error
      return data || []
    }
  })

  const selectedBrand = BRANDS.find(b => b.id === filters.brand)

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

  const activeFiltersCount = Object.values(filters).filter(v => v).length

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-surface border-b border-border py-6">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="font-display text-4xl font-bold text-text mb-4">
            Catálogo de Peças
          </h1>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar peças..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white placeholder-gray-500 focus:border-[#ff3d00]"
              />
            </div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-center space-x-2 bg-[#1a1a1a] border border-[#2a2a2a] px-6 py-3 rounded-lg text-white hover:border-[#ff3d00] transition-colors"
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span>Filtros Avançados</span>
              {activeFiltersCount > 0 && (
                <span className="bg-[#ff3d00] text-white text-xs px-2 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {Object.entries(filters).filter(([, v]) => v).map(([key, val]) => (
                <span key={key} className="inline-flex items-center gap-1 bg-[#ff3d00]/10 text-[#ff3d00] text-xs px-3 py-1 rounded-full border border-[#ff3d00]/30">
                  {key === 'brand' && 'Marca'}
                  {key === 'model' && 'Modelo'}
                  {key === 'category' && 'Categoria'}
                  {key === 'condition' && 'Condição'}
                  {key === 'minPrice' && 'Preço min'}
                  {key === 'maxPrice' && 'Preço max'}
                  {key === 'search' && 'Busca'}
                  : {val}
                  <button onClick={() => updateFilter(key, '')}><X className="w-3 h-3" /></button>
                </span>
              ))}
              <button onClick={clearFilters} className="text-gray-500 text-xs hover:text-white px-2">
                Limpar tudo
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar - Marcas & Modelos */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="card p-4 sticky top-24">
              <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#ff3d00]" />
                Marcas
              </h3>
              <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
                {BRANDS.map(brand => (
                  <div key={brand.id}>
                    <button
                      onClick={() => setBrand(brand.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                        filters.brand === brand.id
                          ? 'bg-[#ff3d00]/10 text-[#ff3d00] border border-[#ff3d00]/30'
                          : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a] border border-transparent'
                      }`}
                    >
                      <span>{brand.name}</span>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${
                        expandedBrand === brand.id ? 'rotate-90' : ''
                      }`} />
                    </button>
                    {expandedBrand === brand.id && (
                      <div className="ml-3 mt-1 mb-1 space-y-0.5 border-l border-[#2a2a2a] pl-2">
                        <button
                          onClick={() => { setBrand(brand.id); updateFilter('model', ''); }}
                          className={`w-full text-left px-3 py-1.5 rounded text-xs transition-colors ${
                            !filters.model ? 'text-[#ff3d00]' : 'text-gray-500 hover:text-white'
                          }`}
                        >
                          Todos os modelos
                        </button>
                        {brand.models.map(model => (
                          <button
                            key={model}
                            onClick={() => { setBrand(brand.id); setModelFilter(model); }}
                            className={`w-full text-left px-3 py-1.5 rounded text-xs transition-colors ${
                              filters.model === model
                                ? 'text-[#ff3d00] bg-[#ff3d00]/5'
                                : 'text-gray-500 hover:text-white hover:bg-[#1a1a1a]'
                            }`}
                          >
                            {model}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {(activeFiltersCount > 0) && (
                <button
                  onClick={clearFilters}
                  className="w-full mt-3 text-xs text-gray-500 hover:text-white py-2 border-t border-[#2a2a2a] pt-3"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Advanced Filters Panel */}
            {showAdvanced && (
              <div className="card p-4 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Marca</label>
                    <select
                      value={filters.brand}
                      onChange={(e) => { updateFilter('brand', e.target.value); updateFilter('model', ''); setExpandedBrand(e.target.value || null); }}
                      className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm"
                    >
                      <option value="">Todas</option>
                      {BRANDS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  {filters.brand && selectedBrand && (
                    <div>
                      <label className="block text-gray-400 text-xs mb-1">Modelo</label>
                      <select
                        value={filters.model}
                        onChange={(e) => updateFilter('model', e.target.value)}
                        className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm"
                      >
                        <option value="">Todos</option>
                        {selectedBrand.models.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Categoria</label>
                    <select
                      value={filters.category}
                      onChange={(e) => updateFilter('category', e.target.value)}
                      className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm"
                    >
                      <option value="">Todas</option>
                      {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Condição</label>
                    <select
                      value={filters.condition}
                      onChange={(e) => updateFilter('condition', e.target.value)}
                      className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm"
                    >
                      <option value="">Todas</option>
                      {CONDITIONS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Ano início</label>
                    <select
                      value={filters.yearStart}
                      onChange={(e) => updateFilter('yearStart', e.target.value)}
                      className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm"
                    >
                      <option value="">Qualquer</option>
                      {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Ano fim</label>
                    <select
                      value={filters.yearEnd}
                      onChange={(e) => updateFilter('yearEnd', e.target.value)}
                      className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm"
                    >
                      <option value="">Qualquer</option>
                      {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Preço mín.</label>
                    <input type="number" placeholder="¥ 0" value={filters.minPrice}
                      onChange={(e) => updateFilter('minPrice', e.target.value)}
                      className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs mb-1">Preço máx.</label>
                    <input type="number" placeholder="¥ 999999" value={filters.maxPrice}
                      onChange={(e) => updateFilter('maxPrice', e.target.value)}
                      className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm" />
                  </div>
                </div>
              </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-text-secondary text-sm">
                {products?.length || 0} peças encontradas
              </p>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-xs">Ordenar:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm"
                >
                  <option value="created_at">Mais recentes</option>
                  <option value="price">Menor preço</option>
                  <option value="-price">Maior preço</option>
                  <option value="views">Mais visualizados</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin w-8 h-8 border-2 border-[#ff3d00] border-t-transparent rounded-full" />
              </div>
            ) : products?.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-text-secondary text-lg">Nenhuma peça encontrada</p>
                <button onClick={clearFilters} className="text-[#ff3d00] hover:underline mt-2 text-sm">
                  Limpar filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products?.map((product) => (
                  <Link 
                    key={product.id} 
                    to={`/product/${product.id}`}
                    className="card overflow-hidden group"
                  >
                    <div className="aspect-square bg-background relative overflow-hidden">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                          <Wrench className="w-12 h-12" />
                        </div>
                      )}
                      <button
                        onClick={(e) => { e.preventDefault(); toggleFavorite(product.id) }}
                        className="absolute top-3 right-3 p-2 rounded-full bg-[#0a0a0a]/80 hover:bg-[#ff3d00] transition-colors"
                      >
                        <Heart className={`w-5 h-5 ${isFavorite(product.id) ? 'fill-[#ff3d00] text-[#ff3d00]' : 'text-white'}`} />
                      </button>
                      <div className="absolute top-3 left-3">
                        <span className="badge">
                          {product.condition === 'new' ? 'Novo' : product.condition === 'used' ? 'Usado' : 'Reformado'}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-[#ff3d00] text-sm mb-1">{product.brands?.name || 'JDM'}</p>
                      <h3 className="text-white font-semibold mb-2 truncate group-hover:text-[#ff3d00] transition-colors">
                        {product.title}
                      </h3>
                      <p className="text-gray-500 text-sm mb-3">{product.categories?.name}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-[#ff3d00] font-bold text-xl">
                          ¥ {product.price.toLocaleString('ja-JP')}
                        </p>
                        {product.profiles && (
                          <div className="flex items-center space-x-1 text-xs text-gray-400 bg-background/50 px-1.5 py-0.5 rounded border border-border/20">
                            <span className="text-[#ffd700]">★</span>
                            <span className="font-bold text-gray-300">
                              {product.profiles.rating ? product.profiles.rating.toFixed(1) : '5.0'}
                            </span>
                            {product.profiles.is_verified && (
                              <span className="text-[#00e5ff] font-extrabold ml-0.5" title="Verificado">✓</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}