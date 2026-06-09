import { useState } from 'react'
import { PartCatalogItem } from '../../types'
import FitmentBadge from './FitmentBadge'

interface Props {
  part: PartCatalogItem
  onSelect: (part: PartCatalogItem) => void
}

export default function PartCard({ part, onSelect }: Props) {
  const [showCompatible, setShowCompatible] = useState(false)

  return (
    <div
      className="rounded-2xl overflow-hidden border border-white/5 bg-[#0A0A0F] hover:border-[#00E5FF]/20 transition-all cursor-pointer group"
      onClick={() => onSelect(part)}
    >
      <div className="aspect-[4/3] bg-gradient-to-br from-[#00E5FF]/5 to-transparent flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-[#00E5FF]/10 flex items-center justify-center">
          <span className="text-2xl">🔧</span>
        </div>
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-white font-medium text-sm leading-tight line-clamp-2 flex-1">
            {part.name}
          </h3>
          {part.price_reference && (
            <span className="text-[#00E5FF] text-sm font-semibold whitespace-nowrap">
              ¥{part.price_reference.toLocaleString()}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {part.part_number && (
            <span className="text-xs bg-white/5 text-gray-300 px-2 py-0.5 rounded-md font-mono">
              {part.part_number}
            </span>
          )}
          {part.oem_number && (
            <span className="text-xs bg-[#ff3d00]/10 text-[#ff3d00] px-2 py-0.5 rounded-md font-mono">
              OEM: {part.oem_number}
            </span>
          )}
        </div>

        {part.position && (
          <span className="text-xs text-gray-500 block">
            Posição: {part.position}
          </span>
        )}

        {part.brand && (
          <span className="text-xs text-gray-400 block">
            {part.brand.name}
          </span>
        )}

        {part.compatible_vehicles && part.compatible_vehicles.length > 0 && (
          <div onClick={(e) => e.stopPropagation()}>
            <FitmentBadge
              count={part.compatible_vehicles.length}
              expanded={showCompatible}
              onToggle={() => setShowCompatible(!showCompatible)}
            />
            {showCompatible && (
              <div className="mt-2 space-y-1">
                {part.compatible_vehicles.slice(0, 5).map((f) => (
                  <div key={f.id} className="text-xs text-gray-500 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-gray-500" />
                    {f.vehicle?.brand?.name} {f.vehicle?.name} {f.vehicle?.generation && `(${f.vehicle.generation})`}
                    {f.position && ` - ${f.position}`}
                  </div>
                ))}
                {part.compatible_vehicles.length > 5 && (
                  <div className="text-xs text-gray-600">
                    +{part.compatible_vehicles.length - 5} mais...
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
