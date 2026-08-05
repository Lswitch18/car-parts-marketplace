import React, { useState } from 'react'
import { Car, Sparkles, CheckCircle2, DollarSign, X, ArrowRight, ShieldCheck, Wrench } from 'lucide-react'
import { useI18n } from '@/modules/shared/lib/i18n'

interface VehicleStrippingYieldModalProps {
  isOpen: boolean
  onClose: () => void
  onGeneratePartList?: (parts: any[]) => void
}

export default function VehicleStrippingYieldModal({
  isOpen,
  onClose,
  onGeneratePartList
}: VehicleStrippingYieldModalProps) {
  const { t } = useI18n()

  const [vinInput, setVinInput] = useState('')
  const [modelInput, setModelInput] = useState('Toyota Prius ZVW30 (2018)')
  const [licensePlate, setLicensePlate] = useState('品川 300 な 45-89')
  const [analyzingYield, setAnalyzingYield] = useState(false)
  const [yieldResult, setYieldResult] = useState<any | null>(null)

  const handleCalculateYield = () => {
    setAnalyzingYield(true)
    setTimeout(() => {
      setAnalyzingYield(false)
      setYieldResult({
        totalPartsCount: 28,
        estimatedTotalValueJpy: 1450000,
        vehicleName: modelInput,
        vin: vinInput || 'JTDKN3DU0J0198421',
        topPriorityParts: [
          { name: 'Módulo Inversor Híbrido OEM', oem: 'G9200-47140', estimatedValue: 120000, difficulty: 'Médio', demand: 'Alta 🔥' },
          { name: 'Bateria Híbrida de Níquel NiMH', oem: 'G9510-47060', estimatedValue: 180000, difficulty: 'Alto', demand: 'Altíssima ⚡' },
          { name: 'Farol Dianteiro Full LED Esquerdo', oem: '33100-47820', estimatedValue: 45000, difficulty: 'Fácil', demand: 'Alta 🔥' },
          { name: 'Caixa de Direção Elétrica EPS', oem: '45510-47050', estimatedValue: 38000, difficulty: 'Médio', demand: 'Média' },
          { name: 'Compressor do Ar Condicionado Elétrico', oem: '88370-47010', estimatedValue: 52000, difficulty: 'Fácil', demand: 'Alta 🔥' },
          { name: 'Conjunto do Quadro de Instrumentos HUD', oem: '83800-47A10', estimatedValue: 28000, difficulty: 'Fácil', demand: 'Média' }
        ]
      })
    }, 800)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#06080F] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,229,255,0.25)] text-white">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 p-0.5 shadow-lg">
              <div className="w-full h-full bg-[#06080F] rounded-[10px] flex items-center justify-center">
                <Car className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-black text-white">{t('Calculadora de Rendimento por Veículo Doador')}</h3>
              <p className="text-xs text-zinc-400">{t('Identificação IA das peças prioritárias para desmonte e estimativa financeira.')}</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário do Veículo Doador */}
        {!yieldResult && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-zinc-400 uppercase font-bold">{t('Modelo do Veículo Doador')}</label>
                <input
                  type="text"
                  value={modelInput}
                  onChange={(e) => setModelInput(e.target.value)}
                  className="w-full bg-[#0B0E17] border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-[#00E5FF]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-zinc-400 uppercase font-bold">{t('Número de Chassi / VIN')}</label>
                <input
                  type="text"
                  placeholder="ex: JTDKN3DU0J0198421"
                  value={vinInput}
                  onChange={(e) => setVinInput(e.target.value)}
                  className="w-full bg-[#0B0E17] border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-cyan-300 font-mono outline-none focus:border-[#00E5FF]"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleCalculateYield}
                disabled={analyzingYield}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg flex items-center space-x-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-purple-300" />
                <span>{analyzingYield ? t('Analisando Rendimento IA...') : t('Calcular Prioridades de Desmonte')}</span>
              </button>
            </div>
          </div>
        )}

        {/* Resultado do Rendimento Esperado */}
        {yieldResult && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-gradient-to-r from-purple-950/40 to-blue-950/40 border border-purple-500/30 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400 font-mono">{yieldResult.vehicleName}</p>
                <h4 className="text-xl font-black text-white font-mono mt-0.5">
                  Retorno Estimado: <span className="text-emerald-400">¥ {yieldResult.estimatedTotalValueJpy.toLocaleString('ja-JP')} JPY</span>
                </h4>
                <p className="text-[11px] text-purple-300 font-mono mt-1">
                  {yieldResult.totalPartsCount} componentes recuperáveis identificados por IA
                </p>
              </div>
              <ShieldCheck className="w-8 h-8 text-emerald-400 opacity-80" />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {yieldResult.topPriorityParts.map((part: any, idx: number) => (
                <div key={idx} className="p-3 bg-[#0B0E17] border border-zinc-800 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-white">{part.name}</p>
                    <p className="text-[10px] font-mono text-cyan-300">OEM: {part.oem} • Demanda: {part.demand}</p>
                  </div>
                  <span className="font-mono font-bold text-emerald-400">¥ {part.estimatedValue.toLocaleString('ja-JP')} JPY</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
              <button
                onClick={() => setYieldResult(null)}
                className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white text-xs font-bold transition"
              >
                {t('Novo Veículo')}
              </button>

              <button
                onClick={onClose}
                className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase transition shadow-md"
              >
                {t('Concluir Triagem')}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
