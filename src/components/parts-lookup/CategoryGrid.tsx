import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import {
  Wrench, Zap, Disc, Thermometer, Wind, Lightbulb,
  Triangle, Circle, ArrowUpDown, Armchair, Waves, Cylinder,
} from 'lucide-react'

const iconMap: Record<string, React.ReactNode> = {
  'engine': <Cylinder className="w-6 h-6" />,
  'brakes': <Disc className="w-6 h-6" />,
  'suspension': <ArrowUpDown className="w-6 h-6" />,
  'exhaust': <Wind className="w-6 h-6" />,
  'cooling': <Thermometer className="w-6 h-6" />,
  'lighting': <Lightbulb className="w-6 h-6" />,
  'wings-spoilers': <Triangle className="w-6 h-6" />,
  'wheels-rims': <Circle className="w-6 h-6" />,
  'interior': <Armchair className="w-6 h-6" />,
  'aero': <Waves className="w-6 h-6" />,
  'turbo-boost': <Zap className="w-6 h-6" />,
  'body-kits': <Wrench className="w-6 h-6" />,
}

const defaultIcon = <Wrench className="w-6 h-6" />

interface Props {
  onSelectCategory: (categoryId: string) => void
  selectedCategory: string
}

export default function CategoryGrid({ onSelectCategory, selectedCategory }: Props) {
  const { data: categories } = useQuery({
    queryKey: ['parts-lookup', 'categories'],
    queryFn: () => api.partsLookup.categories(),
    staleTime: 60000,
  })

  if (!categories) return null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelectCategory(selectedCategory === cat.id ? '' : cat.id)}
          className={`rounded-2xl border p-4 text-center transition-all hover:border-[#00E5FF]/30 ${
            selectedCategory === cat.id
              ? 'bg-[#00E5FF]/10 border-[#00E5FF]/40'
              : 'bg-[#0A0A0F] border-white/5'
          }`}
        >
          <div className="flex justify-center mb-2 text-gray-400">
            {iconMap[cat.id] || defaultIcon}
          </div>
          <p className="text-white text-sm font-medium">{cat.name}</p>
          <p className="text-gray-500 text-xs mt-1">{cat.parts_count} peças</p>
        </button>
      ))}
    </div>
  )
}
