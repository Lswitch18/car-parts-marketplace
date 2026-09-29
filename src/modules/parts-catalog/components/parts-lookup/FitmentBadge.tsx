import { ChevronDown, Car } from 'lucide-react'

interface Props {
  count: number
  expanded: boolean
  onToggle: () => void
}

export default function FitmentBadge({ count, expanded, onToggle }: Props) {
  if (count === 0) return null

  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-1.5 text-xs text-[#00E5FF] hover:text-[#00E5FF]/80 transition-colors font-medium"
    >
      <Car className="w-3.5 h-3.5 text-[#00E5FF]" />
      <span>Compatível com {count} veículo{count !== 1 ? 's' : ''}</span>
      <ChevronDown
        className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`}
      />
    </button>
  )
}
