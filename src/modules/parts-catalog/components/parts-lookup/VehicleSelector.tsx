import { useQuery } from '@tanstack/react-query'
import { api } from '@/modules/transactions/api/api'
import { useState, useEffect } from 'react'
import { useI18n } from '@/modules/shared/lib/i18n'

interface Props {
  onVehicleSelect: (vehicleId: string) => void
}

export default function VehicleSelector({ onVehicleSelect }: Props) {
  const { t } = useI18n()
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedVehicleId, setSelectedVehicleId] = useState('')

  const { data: brands } = useQuery({
    queryKey: ['parts-lookup', 'brands'],
    queryFn: () => api.partsLookup.brands(),
    staleTime: 60000,
  })

  const { data: models } = useQuery({
    queryKey: ['parts-lookup', 'models', selectedBrand],
    queryFn: () => api.partsLookup.models(selectedBrand),
    enabled: !!selectedBrand,
    staleTime: 60000,
  })

  const selectedModelData = models?.find((m) => m.name === selectedModel)
  const years: number[] = []
  if (selectedModelData) {
    const minYear = Math.min(...selectedModelData.generations.map((g) => g.year_start))
    const maxYear = Math.max(...selectedModelData.generations.map((g) => g.year_end || new Date().getFullYear()))
    for (let y = maxYear; y >= minYear; y--) years.push(y)
  }

  const { data: vehicles } = useQuery({
    queryKey: ['parts-lookup', 'vehicles', selectedModel, selectedYear],
    queryFn: () => api.partsLookup.vehicles(selectedModel, selectedYear ? parseInt(selectedYear) : undefined),
    enabled: !!selectedModel && !!selectedYear,
    staleTime: 60000,
  })

  useEffect(() => {
    setSelectedModel('')
    setSelectedYear('')
    setSelectedVehicleId('')
    onVehicleSelect('')
  }, [selectedBrand])

  useEffect(() => {
    setSelectedYear('')
    setSelectedVehicleId('')
    onVehicleSelect('')
  }, [selectedModel])

  useEffect(() => {
    setSelectedVehicleId('')
    onVehicleSelect('')
  }, [selectedYear])

  useEffect(() => {
    if (vehicles && vehicles.length > 0 && !selectedVehicleId) {
      const vid = vehicles[0].id
      setSelectedVehicleId(vid)
      onVehicleSelect(vid)
    }
  }, [vehicles])

  const handleVehicleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const vid = e.target.value
    setSelectedVehicleId(vid)
    onVehicleSelect(vid)
  }

  return (
    <div className="bg-[#0A0A0F] border border-white/5 rounded-2xl p-5 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">{t('Marca')}</label>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="w-full bg-black border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00E5FF] transition-colors"
          >
            <option value="">{t('Selecione uma marca')}</option>
            {brands?.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1.5">{t('Modelo')}</label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            disabled={!selectedBrand}
            className="w-full bg-black border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00E5FF] transition-colors disabled:opacity-40"
          >
            <option value="">{t('Selecione um modelo')}</option>
            {models?.map((m) => (
              <option key={m.name} value={m.name}>{m.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1.5">{t('Ano')}</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            disabled={!selectedModel}
            className="w-full bg-black border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00E5FF] transition-colors disabled:opacity-40"
          >
            <option value="">{t('Selecione o ano')}</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1.5">{t('Versão')}</label>
          <select
            value={selectedVehicleId}
            onChange={handleVehicleChange}
            disabled={!vehicles || vehicles.length === 0}
            className="w-full bg-black border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00E5FF] transition-colors disabled:opacity-40"
          >
            <option value="">{t('Selecione a versão')}</option>
            {vehicles?.map((v) => (
              <option key={v.id} value={v.id}>
                {v.generation || v.name} {v.chassis_code ? `(${v.chassis_code})` : ''} {v.engine_code || ''}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
