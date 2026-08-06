import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { useI18n } from '@/modules/shared/lib/i18n'
import { api } from '@/modules/transactions/api/api'
import { PartCatalogItem } from '@/modules/shared/types'
import PartsLookupHeader from '@/modules/parts-catalog/components/parts-lookup/PartsLookupHeader'
import VehicleSelector from '@/modules/parts-catalog/components/parts-lookup/VehicleSelector'
import SearchInput from '@/modules/parts-catalog/components/parts-lookup/SearchInput'
import CategoryGrid from '@/modules/parts-catalog/components/parts-lookup/CategoryGrid'
import PartCard from '@/modules/parts-catalog/components/parts-lookup/PartCard'
import PartDetailDrawer from '@/modules/parts-catalog/components/parts-lookup/PartDetailDrawer'

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="rounded-2xl overflow-hidden border border-white/5 bg-[#0A0A0F]">
          <div className="aspect-[4/3] skeleton" />
          <div className="p-4 space-y-2.5">
            <div className="skeleton h-4 w-3/4 rounded-lg" />
            <div className="skeleton h-3 w-1/2 rounded-full" />
            <div className="skeleton h-3 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function PartsLookup() {
  const { t } = useI18n()
  const [searchParams, setSearchParams] = useSearchParams()
  const mode = (searchParams.get('mode') as 'vehicle' | 'number' | 'category') || 'vehicle'
  const q = searchParams.get('q') || ''
  const searchBrandId = searchParams.get('brand_id') || ''
  const searchCategoryId = searchParams.get('category_id') || ''
  const page = parseInt(searchParams.get('page') || '1')

  const [selectedVehicleId, setSelectedVehicleId] = useState('')
  const [detailPartNumber, setDetailPartNumber] = useState('')

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value) { next.set(key, value) } else { next.delete(key) }
    if (key !== 'page') next.delete('page')
    setSearchParams(next, { replace: true })
  }

  const { data: vehicleParts, isLoading: vehicleLoading } = useQuery({
    queryKey: ['parts-lookup', 'vehicle-parts', selectedVehicleId],
    queryFn: () => api.partsLookup.vehicleParts(selectedVehicleId),
    enabled: mode === 'vehicle' && !!selectedVehicleId,
    staleTime: 60000,
  })

  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['parts-lookup', 'search', q, searchCategoryId, searchBrandId, page],
    queryFn: () => api.partsLookup.search({
      q: q || undefined,
      category_id: searchCategoryId || undefined,
      brand_id: searchBrandId || undefined,
      page,
      limit: 20,
    }),
    enabled: mode === 'number' && q.length > 0,
    staleTime: 30000,
  })

  const { data: categoryParts, isLoading: categoryLoading } = useQuery({
    queryKey: ['parts-lookup', 'category-parts', searchCategoryId, searchBrandId, page],
    queryFn: () => api.partsLookup.search({
      category_id: searchCategoryId || undefined,
      brand_id: searchBrandId || undefined,
      page,
      limit: 20,
    }),
    enabled: mode === 'category' && !!searchCategoryId,
    staleTime: 60000,
  })

  const { data: brands } = useQuery({
    queryKey: ['parts-lookup', 'brands'],
    queryFn: () => api.partsLookup.brands(),
    staleTime: 60000,
  })

  const handleModeChange = (newMode: 'vehicle' | 'number' | 'category') => {
    const next = new URLSearchParams()
    next.set('mode', newMode)
    setSearchParams(next, { replace: true })
    setSelectedVehicleId('')
    setDetailPartNumber('')
  }

  const handlePartSelect = (part: PartCatalogItem) => {
    setDetailPartNumber(part.part_number)
  }

  const handleSearchChange = (value: string) => {
    setParam('q', value)
  }

  const renderContent = () => {
    switch (mode) {
      case 'vehicle':
        return (
          <>
            <VehicleSelector onVehicleSelect={setSelectedVehicleId} />
            {vehicleLoading && <SkeletonGrid />}
            {!vehicleLoading && vehicleParts && vehicleParts.length > 0 ? (
              <div className="space-y-8">
                {vehicleParts.map((group) => (
                  <div key={group.category.id}>
                    <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-5 rounded-full bg-[#00E5FF]" />
                      {group.category.name}
                      <span className="text-gray-500 text-sm font-normal">
                        ({group.parts.length} {t('peças')})
                      </span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {group.parts.map((part) => (
                        <PartCard key={part.id} part={part} onSelect={handlePartSelect} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : !vehicleLoading && selectedVehicleId ? (
              <div className="text-center py-12 text-gray-500">
                {t('Nenhuma peça cadastrada para este veículo ainda.')}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                {t('Selecione um veículo acima para ver as peças compatíveis.')}
              </div>
            )}
          </>
        )

      case 'number':
        return (
          <>
            <div className="mb-6">
              <SearchInput value={q} onChange={handleSearchChange} />
            </div>
            {searchLoading && <SkeletonGrid />}
            {!searchLoading && searchResults && searchResults.parts.length > 0 ? (
              <>
                <p className="text-gray-400 text-sm mb-4">
                  {searchResults.total} {searchResults.total !== 1 ? t('resultados') : t('resultado')} {t('para')} "{q}"
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {searchResults.parts.map((part) => (
                    <PartCard key={part.id} part={part} onSelect={handlePartSelect} />
                  ))}
                </div>
                {searchResults.total_pages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <button
                      onClick={() => setParam('page', String(page - 1))}
                      disabled={page <= 1}
                      className="px-4 py-2 rounded-lg bg-[#0A0A0F] border border-white/10 text-white text-sm disabled:opacity-30 hover:border-[#00E5FF]/30 transition-colors"
                    >
                      {t('Anterior')}
                    </button>
                    <span className="px-4 py-2 text-gray-400 text-sm">
                      {page} / {searchResults.total_pages}
                    </span>
                    <button
                      onClick={() => setParam('page', String(page + 1))}
                      disabled={page >= searchResults.total_pages}
                      className="px-4 py-2 rounded-lg bg-[#0A0A0F] border border-white/10 text-white text-sm disabled:opacity-30 hover:border-[#00E5FF]/30 transition-colors"
                    >
                      {t('Próximo')}
                    </button>
                  </div>
                )}
              </>
            ) : !searchLoading && q ? (
              <div className="text-center py-12 text-gray-500">
                {t('Nenhuma peça encontrada para')} "{q}". {t('Tente outro termo.')}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                {t('Digite um número OEM, part number ou nome da peça para buscar.')}
              </div>
            )}
          </>
        )

      case 'category':
        return (
          <>
            <CategoryGrid
              selectedCategory={searchCategoryId}
              onSelectCategory={(catId) => setParam('category_id', catId)}
            />
            {searchCategoryId && (
              <div className="mt-6">
                <div className="flex items-center gap-4 mb-4">
                  <h3 className="text-white font-semibold text-lg">{t('Peças')}</h3>
                  <select
                    value={searchBrandId}
                    onChange={(e) => setParam('brand_id', e.target.value)}
                    className="bg-[#0A0A0F] border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-[#00E5FF]"
                  >
                    <option value="">{t('Todas as marcas')}</option>
                    {brands?.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                {categoryLoading && <SkeletonGrid />}
                {!categoryLoading && categoryParts && categoryParts.parts.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {categoryParts.parts.map((part) => (
                        <PartCard key={part.id} part={part} onSelect={handlePartSelect} />
                      ))}
                    </div>
                    {categoryParts.total_pages > 1 && (
                      <div className="flex justify-center gap-2 mt-8">
                        <button
                          onClick={() => setParam('page', String(page - 1))}
                          disabled={page <= 1}
                          className="px-4 py-2 rounded-lg bg-[#0A0A0F] border border-white/10 text-white text-sm disabled:opacity-30 hover:border-[#00E5FF]/30 transition-colors"
                        >
                          {t('Anterior')}
                        </button>
                        <span className="px-4 py-2 text-gray-400 text-sm">
                          {page} / {categoryParts.total_pages}
                        </span>
                        <button
                          onClick={() => setParam('page', String(page + 1))}
                          disabled={page >= categoryParts.total_pages}
                          className="px-4 py-2 rounded-lg bg-[#0A0A0F] border border-white/10 text-white text-sm disabled:opacity-30 hover:border-[#00E5FF]/30 transition-colors"
                        >
                          {t('Próximo')}
                        </button>
                      </div>
                    )}
                  </>
                ) : !categoryLoading ? (
                  <div className="text-center py-12 text-gray-500">
                    {t('Nenhuma peça encontrada nesta categoria.')}
                  </div>
                ) : null}
              </div>
            )}
          </>
        )
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PartsLookupHeader mode={mode} onModeChange={handleModeChange} />
        {renderContent()}
      </div>
      {detailPartNumber && (
        <PartDetailDrawer
          partNumber={detailPartNumber}
          onClose={() => setDetailPartNumber('')}
        />
      )}
    </div>
  )
}
