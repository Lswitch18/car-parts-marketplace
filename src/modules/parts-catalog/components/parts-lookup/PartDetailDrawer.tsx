import { PartCatalogItem } from '@/modules/shared/types'
import { X, Wrench } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/modules/transactions/api/api'
import { useI18n } from '@/modules/shared/lib/i18n'

interface Props {
  partNumber: string
  onClose: () => void
}

export default function PartDetailDrawer({ partNumber, onClose }: Props) {
  const { t } = useI18n()
  const { data: part, isLoading } = useQuery({
    queryKey: ['parts-lookup', 'detail', partNumber],
    queryFn: () => api.partsLookup.partDetail(partNumber),
    enabled: !!partNumber,
    staleTime: 60000,
  })

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-[#0A0A0F] border-l border-white/10 z-50 overflow-y-auto">
        <div className="sticky top-0 bg-[#0A0A0F] border-b border-white/5 p-4 flex items-center justify-between">
          <h2 className="text-white font-semibold">{t('Detalhes da Peça')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton h-4 rounded w-full" />
            ))}
          </div>
        ) : part ? (
          <div className="p-6 space-y-6">
            <div className="aspect-video bg-gradient-to-br from-[#00E5FF]/5 to-transparent rounded-xl flex items-center justify-center">
              <Wrench className="w-12 h-12 text-gray-600" />
            </div>

            <div>
              <h3 className="text-white text-lg font-semibold">{part.name}</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-sm bg-white/5 text-gray-300 px-2.5 py-1 rounded-md font-mono">
                  {part.part_number}
                </span>
                {part.oem_number && (
                  <span className="text-sm bg-[#ff3d00]/10 text-[#ff3d00] px-2.5 py-1 rounded-md font-mono">
                    OEM: {part.oem_number}
                  </span>
                )}
              </div>
            </div>

            {part.price_reference && (
              <div className="flex items-center justify-between bg-black rounded-xl p-4">
                <span className="text-gray-400 text-sm">{t('Preço de referência')}</span>
                <span className="text-[#00E5FF] text-xl font-bold">¥{part.price_reference.toLocaleString()}</span>
              </div>
            )}

            {part.description && (
              <div>
                <h4 className="text-gray-300 text-sm font-medium mb-2">{t('Descrição')}</h4>
                <p className="text-gray-400 text-sm">{part.description}</p>
              </div>
            )}

            {part.specs && Object.keys(part.specs).length > 0 && (
              <div>
                <h4 className="text-gray-300 text-sm font-medium mb-2">{t('Especificações')}</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(part.specs).map(([k, v]) => (
                    <div key={k} className="bg-black rounded-lg px-3 py-2">
                      <span className="text-xs text-gray-500 block">{k}</span>
                      <span className="text-sm text-white">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {part.brand && (
              <div className="flex items-center gap-3 bg-black rounded-xl p-4">
                <div className="w-8 h-8 rounded-full bg-[#00E5FF]/10 flex items-center justify-center text-sm">
                  {part.brand.name[0]}
                </div>
                <div>
                  <span className="text-gray-400 text-xs">{t('Marca')}</span>
                  <p className="text-white text-sm">{part.brand.name}</p>
                </div>
              </div>
            )}

            {part.compatible_vehicles && part.compatible_vehicles.length > 0 && (
              <div>
                <h4 className="text-gray-300 text-sm font-medium mb-2">
                  {t('Veículos Compatíveis')} ({part.compatible_vehicles.length})
                </h4>
                <div className="space-y-2">
                  {part.compatible_vehicles.map((f) => (
                    <div key={f.id} className="bg-black rounded-xl px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white text-sm">
                            {f.vehicle?.brand?.name} {f.vehicle?.name}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {f.vehicle?.generation && `${f.vehicle.generation} · `}
                            {f.vehicle?.chassis_code && `Chassis: ${f.vehicle.chassis_code} · `}
                            {f.vehicle?.engine_code && `Motor: ${f.vehicle.engine_code}`}
                          </p>
                        </div>
                        {f.position && (
                          <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded">
                            {f.position}
                          </span>
                        )}
                      </div>
                      {f.notes && (
                        <p className="text-gray-600 text-xs mt-1">{f.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            {t('Peça não encontrada')}
          </div>
        )}
      </div>
    </>
  )
}
