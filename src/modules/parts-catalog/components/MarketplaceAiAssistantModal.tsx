import { useState } from 'react'
import { Sparkles, Camera, Search, Cpu, X, CheckCircle2, ArrowRight, Package, Tag, Building2, Globe } from 'lucide-react'
import { identifyPartInformation, IdentifiedPartInfo } from '@/modules/shared/lib/aiPartIdentifier'
import { Link } from 'react-router-dom'

interface MarketplaceAiAssistantModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function MarketplaceAiAssistantModal({ isOpen, onClose }: MarketplaceAiAssistantModalProps) {
  const [activeTab, setActiveTab] = useState<'photo' | 'text' | 'ocr'>('photo')
  const [textQuery, setTextQuery] = useState('')
  const [ocrInput, setOcrInput] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<IdentifiedPartInfo | null>(null)

  if (!isOpen) return null

  const handleSimulateAnalyze = (type: 'photo' | 'text' | 'ocr') => {
    setAnalyzing(true)
    setResult(null)
    setTimeout(() => {
      let res: IdentifiedPartInfo
      if (type === 'photo') {
        res = identifyPartInformation({ imageUrl: 'photo_part.jpg' })
      } else if (type === 'ocr') {
        res = identifyPartInformation({ ocrMetalString: ocrInput || 'RB26-778192-N' })
      } else {
        res = identifyPartInformation({ rawTextQuery: textQuery || 'farol prius zvw30' })
      }
      setResult(res)
      setAnalyzing(false)
    }, 1200)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0D0D12] border border-blue-500/30 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header do Assistente de IA */}
        <div className="p-6 bg-gradient-to-r from-blue-950/80 via-indigo-950/80 to-purple-950/80 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/30">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-base text-white">Assistente de IA do Marketplace</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  VISÃO & OEM
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Uso exclusivo para identificação precisa de informações e códigos de peças automotivas.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas de Identificação */}
        <div className="p-6 space-y-6">
          <div className="flex border-b border-zinc-800 space-x-2">
            {[
              { id: 'photo', label: '📸 Identificar por Foto', icon: Camera },
              { id: 'text', label: '💬 Identificar por Texto / Voz', icon: Search },
              { id: 'ocr', label: '⚙️ OCR Gravura Metálica', icon: Cpu },
            ].map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-3 px-4 text-xs font-semibold flex items-center space-x-2 border-b-2 transition ${
                    isActive
                      ? 'border-blue-500 text-blue-400 font-bold'
                      : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* TAB 1: FOTO */}
          {activeTab === 'photo' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-zinc-800 hover:border-blue-500/60 rounded-2xl p-8 text-center bg-zinc-950/60 transition cursor-pointer">
                <Camera className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                <p className="font-bold text-xs text-white">Carregue ou tire a foto da peça danificada/necessária</p>
                <p className="text-[11px] text-zinc-500 mt-1">A IA identificará o nome exato, código OEM e carros compatíveis no marketplace</p>
              </div>

              <button
                onClick={() => handleSimulateAnalyze('photo')}
                disabled={analyzing}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/25 transition flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{analyzing ? 'Analisando Imagem com IA...' : 'Analisar Foto da Peça'}</span>
              </button>
            </div>
          )}

          {/* TAB 2: TEXTO */}
          {activeTab === 'text' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                  Descreva o que você precisa ou cole a pergunta do cliente:
                </label>
                <input
                  type="text"
                  placeholder='Ex: "Preciso do farol direito de um Gol 2018" ou "Inversor Prius 2019"'
                  value={textQuery}
                  onChange={(e) => setTextQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSimulateAnalyze('text') }}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 transition"
                />
              </div>

              <button
                onClick={() => handleSimulateAnalyze('text')}
                disabled={analyzing}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/25 transition flex items-center justify-center space-x-2"
              >
                <Search className="w-4 h-4" />
                <span>{analyzing ? 'Consultando Banco de IA...' : 'Identificar Peça por Descrição'}</span>
              </button>
            </div>
          )}

          {/* TAB 3: OCR */}
          {activeTab === 'ocr' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                  Digite a gravura em metal ou código parcial gravado no bloco/peça:
                </label>
                <input
                  type="text"
                  placeholder='Ex: "RB26-778192-N", "2JZ-881920", "33100-47820"'
                  value={ocrInput}
                  onChange={(e) => setOcrInput(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-mono text-amber-300 focus:border-blue-500 transition"
                />
              </div>

              <button
                onClick={() => handleSimulateAnalyze('ocr')}
                disabled={analyzing}
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/25 transition flex items-center justify-center space-x-2"
              >
                <Cpu className="w-4 h-4" />
                <span>{analyzing ? 'Decodificando OCR...' : 'Decodificar Código em Metal'}</span>
              </button>
            </div>
          )}

          {/* RESULTADO DA IDENTIFICAÇÃO DA IA */}
          {result && (
            <div className="p-5 bg-gradient-to-br from-blue-950/40 via-zinc-950 to-indigo-950/40 border border-blue-500/40 rounded-2xl space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-white text-sm">Peça Identificada com Sucesso!</span>
                </div>
                <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Precisão: {(result.confidenceScore * 100).toFixed(1)}%
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-zinc-900/90 p-3 rounded-xl border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px]">Nome da Peça</span>
                  <span className="font-bold text-white leading-tight block mt-0.5">{result.title}</span>
                </div>
                <div className="bg-zinc-900/90 p-3 rounded-xl border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px]">Código OEM</span>
                  <span className="font-mono font-bold text-amber-300 block mt-0.5">{result.oemCode}</span>
                </div>
                <div className="bg-zinc-900/90 p-3 rounded-xl border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px]">Veículo Compatível</span>
                  <span className="font-bold text-zinc-200 block mt-0.5">{result.vehicleBrand} {result.vehicleModel} ({result.yearCompatibility})</span>
                </div>
                <div className="bg-zinc-900/90 p-3 rounded-xl border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px]">Preço Sugerido de Mercado</span>
                  <span className="font-extrabold text-emerald-400 block mt-0.5">¥ {result.suggestedPriceJpy.toLocaleString('ja-JP')} JPY</span>
                </div>
              </div>

              <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 text-xs">
                <span className="text-zinc-400 block text-[10px]">Modelos Compatíveis:</span>
                <p className="font-mono text-zinc-300 text-[11px] mt-0.5">{result.compatibilityList.join(' • ')}</p>
              </div>

              <div className="pt-2 flex justify-end">
                <Link
                  to={`/catalog?search=${encodeURIComponent(result.title)}`}
                  onClick={onClose}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition flex items-center space-x-2"
                >
                  <span>Ver Ofertas no Marketplace</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
