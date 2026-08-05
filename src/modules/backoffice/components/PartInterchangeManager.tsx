import React, { useState } from 'react'
import { Layers, Plus, X, Check, Sparkles, ShieldCheck, Car, Cpu } from 'lucide-react'
import { useI18n } from '@/modules/shared/lib/i18n'

export interface InterchangeMapping {
  id: string
  chassisCode: string
  engineCode: string
  yearRange: string
  fitmentGrade: 'Direct Fit 🟢' | 'Modificação Requerida 🟡' | 'Universal 🔵'
}

interface PartInterchangeManagerProps {
  mappings: InterchangeMapping[]
  onChange: (updatedMappings: InterchangeMapping[]) => void
  readOnly?: boolean
}

export default function PartInterchangeManager({
  mappings,
  onChange,
  readOnly = false
}: PartInterchangeManagerProps) {
  const { t } = useI18n()

  const [chassisInput, setChassisInput] = useState('')
  const [engineInput, setEngineInput] = useState('')
  const [yearInput, setYearInput] = useState('')
  const [fitmentGrade, setFitmentGrade] = useState<'Direct Fit 🟢' | 'Modificação Requerida 🟡' | 'Universal 🔵'>('Direct Fit 🟢')

  const handleAddMapping = () => {
    if (!chassisInput.trim() && !engineInput.trim()) return

    const newMapping: InterchangeMapping = {
      id: `ic-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      chassisCode: chassisInput.trim().toUpperCase(),
      engineCode: engineInput.trim().toUpperCase(),
      yearRange: yearInput.trim() || 'Todos os anos',
      fitmentGrade
    }

    const updated = [...mappings, newMapping]
    onChange(updated)

    setChassisInput('')
    setEngineInput('')
    setYearInput('')
  }

  const handleRemoveMapping = (idToRemove: string) => {
    const updated = mappings.filter(m => m.id !== idToRemove)
    onChange(updated)
  }

  return (
    <div className="space-y-3 bg-[#0B0E17] border border-zinc-800 rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-mono font-bold text-cyan-300">
          <Layers className="w-4 h-4 text-[#00E5FF]" />
          <span>{t('Cruzamento de Intercambiabilidade (Cross-Fitment)')}</span>
        </div>
        <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Isolamento Multi-tenant RLS</span>
        </span>
      </div>

      {/* Inputs para adicionar novo vínculo */}
      {!readOnly && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
          <div>
            <label className="text-[10px] font-mono text-zinc-400 block mb-1">{t('Código Chassi')}</label>
            <input
              type="text"
              placeholder="ex: ZVW30, BNR34"
              value={chassisInput}
              onChange={(e) => setChassisInput(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#00E5FF] rounded-xl px-2.5 py-1.5 text-xs text-white font-mono outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono text-zinc-400 block mb-1">{t('Código Motor')}</label>
            <input
              type="text"
              placeholder="ex: 2ZR-FE, K20A"
              value={engineInput}
              onChange={(e) => setEngineInput(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#00E5FF] rounded-xl px-2.5 py-1.5 text-xs text-amber-300 font-mono outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono text-zinc-400 block mb-1">{t('Anos Compatíveis')}</label>
            <input
              type="text"
              placeholder="ex: 2015-2022"
              value={yearInput}
              onChange={(e) => setYearInput(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#00E5FF] rounded-xl px-2.5 py-1.5 text-xs text-zinc-200 font-mono outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleAddMapping}
              className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center justify-center space-x-1 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('Vincular')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Lista de Cruzamentos Cadastrados */}
      <div className="space-y-1.5">
        {mappings.length === 0 ? (
          <p className="text-[11px] text-zinc-500 font-mono italic text-center py-2">
            {t('Nenhum cruzamento de intercambiabilidade vinculado. Esta peça ficará vinculada apenas ao veículo principal.')}
          </p>
        ) : (
          mappings.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between p-2 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs font-mono"
            >
              <div className="flex items-center space-x-3">
                <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[10px]">
                  Chassi: {m.chassisCode || 'N/A'}
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px]">
                  Motor: {m.engineCode || 'N/A'}
                </span>
                <span className="text-zinc-400 text-[11px]">{m.yearRange}</span>
                <span className="text-[10px] text-emerald-400">{m.fitmentGrade}</span>
              </div>

              {!readOnly && (
                <button
                  type="button"
                  onClick={() => handleRemoveMapping(m.id)}
                  className="p-1 text-zinc-500 hover:text-red-400 transition cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
