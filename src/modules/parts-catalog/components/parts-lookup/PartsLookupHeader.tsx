import { Search } from 'lucide-react'
import { useI18n } from '@/modules/shared/lib/i18n'

interface Props {
  mode: 'vehicle' | 'number' | 'category'
  onModeChange: (mode: 'vehicle' | 'number' | 'category') => void
}

export default function PartsLookupHeader({ mode, onModeChange }: Props) {
  const { t } = useI18n()
  const tabs = [
    { id: 'vehicle' as const, label: t('Por Veículo') },
    { id: 'number' as const, label: t('Por Número') },
    { id: 'category' as const, label: t('Por Categoria') },
  ]

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <Search className="w-6 h-6 text-[#00E5FF]" />
        <h1 className="text-2xl font-bold text-white">{t('Catálogo de Peças')}</h1>
      </div>
      <p className="text-gray-400 text-sm mb-6">
        {t('Consulte peças compatíveis com seu veículo. Busque por número OEM, part number ou navegue por categoria.')}
      </p>
      <div className="flex gap-1 bg-[#0A0A0F] rounded-xl p-1 border border-white/5 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onModeChange(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === tab.id
                ? 'bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}
