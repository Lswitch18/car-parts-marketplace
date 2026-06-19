import { Search } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useI18n } from '@/modules/shared/lib/i18n'

interface Props {
  value: string
  onChange: (value: string) => void
}

export default function SearchInput({ value, onChange }: Props) {
  const { t } = useI18n()
  const [local, setLocal] = useState(value)

  useEffect(() => {
    setLocal(value)
  }, [value])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (local !== value) onChange(local)
    }, 300)
    return () => clearTimeout(timer)
  }, [local])

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
      <input
        type="text"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={t('Buscar por número OEM, part number ou nome da peça...')}
        className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-[#00E5FF] transition-colors placeholder:text-gray-600"
      />
    </div>
  )
}
