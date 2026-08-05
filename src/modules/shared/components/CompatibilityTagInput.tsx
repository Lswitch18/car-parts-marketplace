import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Sparkles, Tag as TagIcon, Check, Layers, Cpu } from 'lucide-react'
import { useI18n } from '@/modules/shared/lib/i18n'

export type CompatibilityTagType = 'model' | 'chassis' | 'engine' | 'fitment' | 'year'

export interface CompatibilityTagItem {
  id: string
  label: string
  type: CompatibilityTagType
}

// ── Smart Auto-Parser de Texto para Tags ───────────────────
export function parseCompatibilityTextToTags(rawText: string): CompatibilityTagItem[] {
  if (!rawText || !rawText.trim()) return []

  const tags: CompatibilityTagItem[] = []
  const items = rawText.split(/[,•;/|\n]+/).map(s => s.trim()).filter(Boolean)

  items.forEach((item, index) => {
    let tagType: CompatibilityTagType = 'model'

    // Detectar Chassi JDM (ex: ZVW30, BNR34, GK3, GK5, FD3S, CT9A, GRB, ZN6, S15, AP1, JZX100, Z33)
    if (/\b(ZVW\d+|BNR\d+|GK[35]|FD3S|CT9A|GRB|GVB|ZN6|ZC6|S1[45]|AP[12]|JZX\d+|Z33|Z34|EPR\d+)\b/i.test(item)) {
      tagType = 'chassis'
    }
    // Detectar Motores (ex: 2ZR-FE, RB26DETT, K20A, EJ25, SR20DET, 1JZ-GTE, 2JZ-GTE, F20C, 4G63, K14C)
    else if (/\b(2ZR-FE|RB26DETT|K20[A-Z0-9]*|EJ25[0-9]*|SR20DET|1JZ-GTE|2JZ-GTE|F20C|4G63|K14C|V35|VR38)\b/i.test(item)) {
      tagType = 'engine'
    }
    // Detectar Plug & Play / Fitment
    else if (/plug & play|direct fit|genuíno|encaixe direto|testado/i.test(item)) {
      tagType = 'fitment'
    }
    // Detectar Anos (ex: 2015-2022, 2018)
    else if (/\b(19\d\d|20\d\d)(-(19\d\d|20\d\d))?\b/.test(item)) {
      tagType = 'year'
    }

    tags.push({
      id: `tag-${index}-${Date.now()}`,
      label: item,
      type: tagType,
    })
  })

  return tags
}

interface CompatibilityTagInputProps {
  value: string | string[]
  onChange: (value: string, tags: CompatibilityTagItem[]) => void
  readOnly?: boolean
}

export default function CompatibilityTagInput({
  value,
  onChange,
  readOnly = false,
}: CompatibilityTagInputProps) {
  const { t } = useI18n()
  const [tags, setTags] = useState<CompatibilityTagItem[]>([])
  const [inputValue, setInputValue] = useState('')

  // Sugestões Rápidas de Chassis JDM populares
  const QUICK_SUGGESTIONS = [
    { label: 'Toyota ZVW30', type: 'chassis' },
    { label: 'Subaru EJ255', type: 'engine' },
    { label: 'Honda K20A', type: 'engine' },
    { label: 'Nissan BNR34', type: 'chassis' },
    { label: 'Plug & Play Direct Fit 🟢', type: 'fitment' },
  ] as const

  useEffect(() => {
    const rawString = Array.isArray(value) ? value.join(', ') : (value || '')
    const parsed = parseCompatibilityTextToTags(rawString)
    setTags(parsed)
  }, [value])

  const notifyChange = (updatedTags: CompatibilityTagItem[]) => {
    const joinedString = updatedTags.map(t => t.label).join(', ')
    onChange(joinedString, updatedTags)
  }

  const handleAddTag = (labelToAdd?: string, typeToAdd: CompatibilityTagType = 'model') => {
    const text = (labelToAdd || inputValue).trim()
    if (!text) return

    // Evitar duplicados
    if (tags.some(t => t.label.toLowerCase() === text.toLowerCase())) {
      setInputValue('')
      return
    }

    const newTag: CompatibilityTagItem = {
      id: `tag-${Date.now()}-${Math.random()}`,
      label: text,
      type: typeToAdd !== 'model' ? typeToAdd : parseCompatibilityTextToTags(text)[0]?.type || 'model',
    }

    const updated = [...tags, newTag]
    setTags(updated)
    notifyChange(updated)
    setInputValue('')
  }

  const handleRemoveTag = (idToRemove: string) => {
    const updated = tags.filter(t => t.id !== idToRemove)
    setTags(updated)
    notifyChange(updated)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const getTagBadgeStyle = (type: CompatibilityTagType) => {
    switch (type) {
      case 'chassis':
        return 'bg-[#00E5FF]/10 text-cyan-300 border-[#00E5FF]/40 shadow-[0_0_10px_rgba(0,229,255,0.15)]'
      case 'engine':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
      case 'fitment':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
      case 'year':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.15)]'
      default:
        return 'bg-blue-500/10 text-blue-300 border-blue-500/40 shadow-[0_0_10px_rgba(59,130,246,0.15)]'
    }
  }

  const getTagTypePrefix = (type: CompatibilityTagType) => {
    switch (type) {
      case 'chassis': return 'Chassi'
      case 'engine': return 'Motor'
      case 'fitment': return 'Fitment'
      case 'year': return 'Anos'
      default: return 'Modelo'
    }
  }

  return (
    <div className="space-y-2.5">
      {/* Visual Input Field + Rendered Badges */}
      <div className="min-h-[46px] p-2.5 bg-[#0B0E17] border border-zinc-800 focus-within:border-[#00E5FF] rounded-2xl flex flex-wrap items-center gap-2 transition duration-200">
        
        <AnimatePresence>
          {tags.map((tag) => (
            <motion.span
              key={tag.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono font-bold border ${getTagBadgeStyle(tag.type)}`}
            >
              <span className="opacity-60 text-[10px] font-normal uppercase">[{getTagTypePrefix(tag.type)}]</span>
              <span>{tag.label}</span>
              
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag.id)}
                  className="hover:bg-white/20 rounded-full p-0.5 transition cursor-pointer"
                  title={t('Remover tag')}
                >
                  <X size={12} />
                </button>
              )}
            </motion.span>
          ))}
        </AnimatePresence>

        {!readOnly && (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? t('Digite modelos, chassis (ex: ZVW30, K20A) ou aperte Enter...') : '+ Tag...'}
            className="flex-1 min-w-[140px] bg-transparent text-xs text-white outline-none placeholder-zinc-500 font-mono py-1"
          />
        )}

      </div>

      {/* Quick Suggestion Chips */}
      {!readOnly && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
            <Sparkles size={11} className="text-cyan-400 animate-pulse" /> {t('Atalhos JDM Rápidos')}:
          </span>
          {QUICK_SUGGESTIONS.map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleAddTag(item.label, item.type as any)}
              className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-cyan-400 transition cursor-pointer"
            >
              + {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
