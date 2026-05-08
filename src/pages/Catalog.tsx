import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Filter, X, Search, Heart, Wrench } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { BRANDS, CATEGORIES, CONDITIONS, YEARS } from '../lib/constants'
import { Product } from '../types'
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
  
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('created_at')

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', 'catalog', filters],
    queryFn: async () => {
      let query = supabase
        .from('parts')
        .select('*, profiles(id, name, avatar_url)')
        .eq('status', 'active')

      if (filters.brand) query = query.eq('brand', filters.brand)
      if (filters.model) query = query.eq('model', filters.model)
      if (filters.category) query = query.eq('category', filters.category)
      if (filters.condition) query = query.eq('condition', filters.condition)
      if (filters.yearStart) query = query.gte('year_start', parseInt(filters.yearStart))
      if (filters.yearEnd) query = query.lte('year_end', parseInt(filters.yearEnd))
      if (filters.minPrice) query = query.gte('price', parseFloat(filters.minPrice))
      if (filters.maxPrice) query = query.lte('price', parseFloat(filters.maxPrice))
      if (filters.search) query = query.ilike('title', `%${filters.search}%`)

      query = query.order(sortBy, { ascending: false })
      
      const { data, error } = await query.limit(50)
      
      if (error) throw error
      return data as (Product & { profiles: { id: string; name: string; avatar_url: string } })[]
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

  const clearFilters = () => {
    setFilters({
      brand: '', model: '', category: '', condition: '',
      yearStart: '', yearEnd: '', minPrice: '', maxPrice: '', search: ''
    })
    setSearchParams({})
  }

  const activeFiltersCount = Object.values(filters).filter(v => v).length

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-surface border-b border-border py-8">
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
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center space-x-2 bg-[#1a1a1a] border border-[#2a2a2a] px-6 py-3 rounded-lg text-white hover:border-[#ff3d00] transition-colors"
            >
              <Filter className="w-5 h-5" />
              <span>Filtros</span>
              {activeFiltersCount > 0 && (
                <span className="bg-[#ff3d00] text-white text-xs px-2 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

{showFilters && (
  <div className="bg-surface border-b border-border py-6">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Marca</label>
                <select
                  value={filters.brand}
                  onChange={(e) => {
                    updateFilter('brand', e.target.value)
                    updateFilter('model', '')
                  }}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-2 text-white"
                >
                  <option value="">Todas as marcas</option>
                  {BRANDS.map(brand => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
              </div>

              {filters.brand && selectedBrand && (
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Modelo</label>
                  <select
                    value={filters.model}
                    onChange={(e) => updateFilter('model', e.target.value)}
className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text"
                  >
                    <option value="">Todos os modelos</option>
                    {selectedBrand.models.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-gray-400 text-sm mb-2">Categoria</label>
                <select
                  value={filters.category}
                  onChange={(e) => updateFilter('category', e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-2 text-white"
                >
                  <option value="">Todas as categorias</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Condição</label>
                <select
                  value={filters.condition}
                  onChange={(e) => updateFilter('condition', e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-2 text-white"
                >
                  <option value="">Todas</option>
                  {CONDITIONS.map(cond => (
                    <option key={cond.id} value={cond.id}>{cond.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Ano inicial</label>
                <select
                  value={filters.yearStart}
                  onChange={(e) => updateFilter('yearStart', e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-2 text-white"
                >
                  <option value="">Qualquer</option>
                  {YEARS.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Ano final</label>
                <select
                  value={filters.yearEnd}
                  onChange={(e) => updateFilter('yearEnd', e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-2 text-white"
                >
                  <option value="">Qualquer</option>
                  {YEARS.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Preço mín.</label>
                <input
                  type="number"
                  placeholder="R$ 0"
                  value={filters.minPrice}
                  onChange={(e) => updateFilter('minPrice', e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Preço máx.</label>
                <input
                  type="number"
                  placeholder="R$ 999999"
                  value={filters.maxPrice}
                  onChange={(e) => updateFilter('maxPrice', e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-2 text-white"
                />
              </div>
            </div>

            <div className="flex justify-between items-center mt-6">
<button
  onClick={clearFilters}
  className="text-text-secondary hover:text-text flex items-center space-x-2"
>
  <X className="w-4 h-4" />
  <span>Limpar filtros</span>
</button>
<button
  onClick={() => setShowFilters(false)}
  className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg"
>
  Aplicar
</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
<p className="text-text-secondary">
          {products?.length || 0} peças encontradas
        </p>
          <div className="flex items-center space-x-2">
            <span className="text-gray-400 text-sm">Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-2 text-white text-sm"
            >
              <option value="created_at">Mais recentes</option>
              <option value="price">Menor preço</option>
              <option value="-price">Maior preço</option>
              <option value="views">Mais visualizados</option>
            </select>
          </div>
        </div>

{isLoading ? (
  <div className="flex items-center justify-center py-20">
    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
  </div>
        ) : products?.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-text-secondary text-lg">Nenhuma peça encontrada</p>
            <button
              onClick={clearFilters}
              className="text-[#ff3d00] hover:underline mt-2"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products?.map((product) => (
              <div key={product.id} className="card overflow-hidden group">
                <div className="aspect-square bg-background relative overflow-hidden">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                      <Wrench className="w-12 h-12" />
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      toggleFavorite(product.id)
                    }}
                    className="absolute top-3 right-3 p-2 rounded-full bg-[#0a0a0a]/80 hover:bg-[#ff3d00] transition-colors"
                  >
                    <Heart
                      className={`w-5 h-5 ${isFavorite(product.id) ? 'fill-[#ff3d00] text-[#ff3d00]' : 'text-white'}`}
                    />
                  </button>
                  <div className="absolute top-3 left-3">
                    <span className="badge">
                      {product.condition === 'new' ? 'Novo' : product.condition === 'used' ? 'Usado' : 'Reformado'}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-[#ff3d00] text-sm mb-1">
                    {BRANDS.find(b => b.id === product.brand)?.name} {product.model}
                  </p>
                  <h3 className="text-white font-semibold mb-2 truncate group-hover:text-[#ff3d00] transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-gray-500 text-sm mb-3">
                    {product.year_start} - {product.year_end}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-[#ff3d00] font-bold text-xl">
                      R$ {product.price.toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}