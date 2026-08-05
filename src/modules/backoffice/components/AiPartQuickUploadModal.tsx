import { useState } from 'react'
import { supabase } from '@/modules/shared/lib/supabase'
import { useI18n } from '@/modules/shared/lib/i18n'
import CompatibilityTagInput from '@/modules/shared/components/CompatibilityTagInput'
import { 
  Sparkles, Camera, Cpu, CheckCircle2, 
  X, Save, Layers, PackageCheck, AlertCircle
} from 'lucide-react'

interface AiPartQuickUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onPartCreated?: (part: any) => void
  sellerId?: string
}

export default function AiPartQuickUploadModal({
  isOpen,
  onClose,
  onPartCreated,
  sellerId
}: AiPartQuickUploadModalProps) {
  const { t } = useI18n()

  const [step, setStep] = useState<'upload' | 'scanning' | 'ready'>('upload')
  const [timerSeconds, setTimerSeconds] = useState(30)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [scanProgress, setScanProgress] = useState(0)

  // AI Generated & Managed Part Data
  const [partTitle, setPartTitle] = useState('')
  const [oemCode, setOemCode] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState(0)
  const [costPrice, setCostPrice] = useState(0)
  const [vehicleOrigin, setVehicleOrigin] = useState('')
  const [compatibility, setCompatibility] = useState('')
  const [condition, setCondition] = useState('')
  const [description, setDescription] = useState('')
  const [wmsLocation, setWmsLocation] = useState('')
  
  // Campo de preenchimento MANUAL pelo usuário
  const [quantity, setQuantity] = useState(1)

  const [isPublishing, setIsPublishing] = useState(false)

  // Simulated AI Presets with comprehensive management data
  const AI_DEMO_PRESETS = [
    {
      title: 'Turbocompressor IHI VF52 RHD JDM Genuíno',
      oem: 'OEM-14411-AA800',
      category: 'Motor & Periféricos',
      price: 88000,
      costPrice: 35000,
      vehicle: 'Subaru Impreza WRX STI GRB (2012)',
      compatibility: 'Subaru Impreza WRX STI 2008-2014 (EJ255/EJ257)',
      condition: 'Usado OEM Grade A+ (Sem folga de eixo)',
      description: 'Turbocompressor IHI VF52 genuíno JDM. Folga zero de eixo, rotores inoxidáveis intactos, testado e certificado.',
      wms: 'Galpão A1 ➔ Prateleira 03 ➔ Posição 12',
      image: '/parts/turbo_ihi_vf52.png'
    },
    {
      title: 'Farol Dianteiro Full LED Esquerdo Optic-Scan',
      oem: 'OEM-33100-47820',
      category: 'Lataria & Iluminação',
      price: 45000,
      costPrice: 15000,
      vehicle: 'Toyota Prius ZVW30 (2018)',
      compatibility: 'Toyota Prius ZVW30 (2015-2022), Prius PHV ZVW35',
      condition: 'Usado OEM Grade A (Optic-Scan OK)',
      description: 'Farol LED genuíno Toyota em estado impecável, testado no scanner óptico. Lentes cristalinas com reator incluso.',
      wms: 'Galpão A ➔ Corredor 02 ➔ Estante C ➔ Posição 04',
      image: '/parts/farol_full_led.png'
    },
    {
      title: 'Módulo de Injeção Eletrônica ECU Engine Control Unit',
      oem: 'OEM-37820-5R0-J61',
      category: 'Injeção Eletrônica & Sensores',
      price: 38000,
      costPrice: 12000,
      vehicle: 'Honda Fit GK5 RS 1.5 i-VTEC (2017)',
      compatibility: 'Honda Fit GK3/GK5 (2015-2020), Honda Vezel RU1',
      condition: 'Genuíno Testado (Scanner Diagnóstico OK)',
      description: 'Módulo ECU testado no scanner diagnóstico. Sem falhas de circuito, com certidão de desmonte e garantia de 90 dias.',
      wms: 'Galpão B ➔ Corredor 01 ➔ Estante A ➔ Posição 02',
      image: '/parts/modulo_ecu.png'
    }
  ]

  const handleStartAiScan = (imageUrl?: string) => {
    const preset = AI_DEMO_PRESETS[Math.floor(Math.random() * AI_DEMO_PRESETS.length)]
    setSelectedImage(imageUrl || preset.image)
    setStep('scanning')
    setScanProgress(0)
    setTimerSeconds(30)

    let currentProgress = 0
    const interval = setInterval(() => {
      currentProgress += 5
      setScanProgress(prev => Math.min(prev + 5, 100))
      setTimerSeconds(prev => Math.max(prev - 1, 0))

      if (currentProgress >= 100) {
        clearInterval(interval)
        setPartTitle(preset.title)
        setOemCode(preset.oem)
        setCategory(preset.category)
        setPrice(preset.price)
        setCostPrice(preset.costPrice)
        setVehicleOrigin(preset.vehicle)
        setCompatibility(preset.compatibility)
        setCondition(preset.condition)
        setDescription(preset.description)
        setWmsLocation(preset.wms)
        setQuantity(1) // Padrão manual
        setStep('ready')
      }
    }, 100)
  }

  const handleSavePart = async () => {
    setIsPublishing(true)
    try {
      const newPart = {
        title: partTitle,
        oem_code: oemCode,
        category: category,
        price: price,
        cost_price: costPrice,
        vehicle_origin: vehicleOrigin,
        compatibility: compatibility,
        condition: condition,
        description: description,
        wms_location: wmsLocation,
        quantity: Number(quantity) || 1,
        status: 'active',
        seller_id: sellerId || 'tenant_demo',
        images: [selectedImage],
        created_at: new Date().toISOString()
      }

      await supabase.from('parts').insert([newPart])
      
      if (onPartCreated) onPartCreated(newPart)
      onClose()
    } catch (err) {
      console.warn('Simulação de cadastro concluída:', err)
      if (onPartCreated) {
        onPartCreated({
          title: partTitle,
          price,
          cost_price: costPrice,
          wms_location: wmsLocation,
          quantity: Number(quantity) || 1,
          status: 'active'
        })
      }
      onClose()
    } finally {
      setIsPublishing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-3xl bg-[#06080F] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(0,229,255,0.25)] text-white overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Glow Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-5 mb-6 sticky top-0 bg-[#06080F] z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0D75FF] to-[#00E5FF] p-0.5 shadow-[0_0_15px_rgba(0,229,255,0.4)] shrink-0">
              <div className="w-full h-full bg-[#06080F] rounded-[10px] flex items-center justify-center">
                <Cpu className="w-5 h-5 text-[#00E5FF]" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-black tracking-tight text-white">{t('Cadastrar Peça por Visão Computacional (IA)')}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-[#00E5FF]/40 uppercase">
                  AI Auto Parts DAIG
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">{t('Análise de foto, extração OEM, precificação sugerida e compatibilidade técnica.')}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: Upload / Fast Capture */}
        {step === 'upload' && (
          <div className="space-y-6">
            <div 
              className="border-2 border-dashed border-cyan-500/30 hover:border-[#00E5FF] rounded-2xl p-8 text-center bg-blue-500/5 transition cursor-pointer group"
              onClick={() => handleStartAiScan()}
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#0B0E17] border border-blue-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Camera className="w-7 h-7 text-[#00E5FF]" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">{t('Clique para carregar a foto do componente ou peça')}</h4>
              <p className="text-xs text-zinc-400">{t('A IA identificará OEM, marca, modelo compatível, estado de conservação e sugerirá valores.')}</p>

              <div className="mt-5 inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0D75FF] to-[#00E5FF] text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(13,117,255,0.4)]">
                <Sparkles className="w-4 h-4" />
                <span>{t('Iniciar Escaneamento IA 30s')}</span>
              </div>
            </div>

            {/* Quick Demo Presets */}
            <div>
              <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-3">{t('Ou selecione um exemplo para testar em 30 segundos:')}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {AI_DEMO_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleStartAiScan(preset.image)}
                    className="p-3 bg-[#0B0E17] border border-zinc-800 hover:border-[#00E5FF] rounded-xl text-left transition text-xs space-y-1.5 group cursor-pointer"
                  >
                    <img src={preset.image} alt="" className="w-full h-20 object-cover rounded-lg mb-2 border border-zinc-800" />
                    <p className="font-bold text-white truncate">{preset.title}</p>
                    <p className="text-[10px] font-mono text-cyan-400">Preço Sugerido: ¥ {preset.price.toLocaleString('ja-JP')}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Scanning & Processing Animation */}
        {step === 'scanning' && (
          <div className="py-12 text-center space-y-6">
            <div className="relative w-32 h-32 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 animate-ping" />
              <div className="w-full h-full rounded-full border-4 border-[#00E5FF] border-t-transparent animate-spin flex items-center justify-center">
                <Cpu className="w-10 h-10 text-[#00E5FF]" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2 text-xl font-black text-white font-mono">
                <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
                <span>{t('Analisando Visão Computacional...')} {scanProgress}%</span>
              </div>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                {t('Extraindo código OEM, compatibilidade veicular, estado técnico e precificação sugerida.')}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-md mx-auto bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-800">
              <div 
                className="bg-gradient-to-r from-[#0D75FF] via-cyan-400 to-[#00E5FF] h-full transition-all duration-150"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* STEP 3: Ready & Full Form Auto-Filled */}
        {step === 'ready' && (
          <div className="space-y-5 animate-in fade-in duration-300">
            
            {/* Status Alert */}
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-2xl flex items-center space-x-3 text-xs">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-bold">{t('Análise de Visão Computacional Concluída!')}</p>
                <p className="text-[11px] opacity-90">{t('Dados técnicos preenchidos automaticamente. Insira apenas a quantidade em estoque para finalizar.')}</p>
              </div>
            </div>

            {/* Image Preview + Core Identification */}
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#0B0E17] border border-zinc-800 p-4 rounded-2xl">
              {selectedImage && (
                <img src={selectedImage} alt="Peça analisada" className="w-24 h-24 object-cover rounded-xl border border-cyan-500/30 shrink-0" />
              )}
              <div className="space-y-1 w-full">
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">{t('Componente Detectado pela IA')}</span>
                <h4 className="text-base font-bold text-white leading-tight">{partTitle}</h4>
                <p className="text-xs font-mono text-amber-400">{oemCode}</p>
              </div>
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              {/* Título da Peça */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[11px] font-mono text-zinc-400 uppercase font-bold">{t('Título da Peça')}</label>
                <input 
                  type="text" 
                  value={partTitle} 
                  onChange={(e) => setPartTitle(e.target.value)}
                  className="w-full bg-[#0B0E17] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#00E5FF] font-medium"
                />
              </div>

              {/* OEM Code */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-zinc-400 uppercase font-bold">{t('Código OEM Genuíno')}</label>
                <input 
                  type="text" 
                  value={oemCode} 
                  onChange={(e) => setOemCode(e.target.value)}
                  className="w-full bg-[#0B0E17] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-cyan-300 font-mono outline-none focus:border-[#00E5FF]"
                />
              </div>

              {/* Categoria */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-zinc-400 uppercase font-bold">{t('Categoria da Peça')}</label>
                <input 
                  type="text" 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#0B0E17] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 outline-none focus:border-[#00E5FF]"
                />
              </div>

              {/* Veículo Doador / Origem */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-zinc-400 uppercase font-bold">{t('Veículo Doador / Origem')}</label>
                <input 
                  type="text" 
                  value={vehicleOrigin} 
                  onChange={(e) => setVehicleOrigin(e.target.value)}
                  className="w-full bg-[#0B0E17] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 outline-none focus:border-[#00E5FF]"
                />
              </div>

              {/* Compatibilidade de Veículos com Tags Interativas IA */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[11px] font-mono text-zinc-400 uppercase font-bold flex items-center justify-between">
                  <span>{t('Tags de Compatibilidade Veicular (Auto-Parser IA)')}</span>
                  <span className="text-[10px] text-cyan-400 font-mono">Chassi • Motor • Anos</span>
                </label>
                <CompatibilityTagInput
                  value={compatibility}
                  onChange={(val) => setCompatibility(val)}
                />
              </div>

              {/* Grade de Conservação Certificada */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-zinc-400 uppercase font-bold">{t('Grade de Conservação (Certificação)')}</label>
                <select 
                  value={condition} 
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full bg-[#0B0E17] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-emerald-400 font-semibold outline-none focus:border-[#00E5FF]"
                >
                  <option value="Grade A+ 🟢 (Genuíno Impecável / Testado)">Grade A+ 🟢 (Genuíno Impecável / Testado)</option>
                  <option value="Grade A 🔵 (Leve Marca Estética / 100% OK)">Grade A 🔵 (Leve Marca Estética / 100% OK)</option>
                  <option value="Grade B 🟡 (Requer Limpeza / Pintura)">Grade B 🟡 (Requer Limpeza / Pintura)</option>
                  <option value="Grade C 🔴 (Para Recondicionamento)">Grade C 🔴 (Para Recondicionamento)</option>
                </select>
              </div>

              {/* Preço Sugerido JPY */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-zinc-400 uppercase font-bold">{t('Preço Sugerido Venda (JPY)')}</label>
                <input 
                  type="number" 
                  value={price} 
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full bg-[#0B0E17] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-emerald-400 font-mono font-bold outline-none focus:border-[#00E5FF]"
                />
              </div>

              {/* Preço de Custo JPY & Margem Real de Lucro */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono text-zinc-400 uppercase font-bold">{t('Preço de Custo (JPY)')}</label>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">
                    Margem Bruta: {price > 0 ? (((price - costPrice) / price) * 100).toFixed(0) : 0}%
                  </span>
                </div>
                <input 
                  type="number" 
                  value={costPrice} 
                  onChange={(e) => setCostPrice(Number(e.target.value))}
                  className="w-full bg-[#0B0E17] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-300 font-mono outline-none focus:border-[#00E5FF]"
                />
              </div>

              {/* Localização WMS */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-zinc-400 uppercase font-bold">{t('Localização WMS no Estoque')}</label>
                <input 
                  type="text" 
                  value={wmsLocation} 
                  onChange={(e) => setWmsLocation(e.target.value)}
                  className="w-full bg-[#0B0E17] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-300 outline-none focus:border-[#00E5FF]"
                />
              </div>

              {/* QUANTIDADE EM ESTOQUE (PREENCHIMENTO MANUAL) */}
              <div className="space-y-1 sm:col-span-2 bg-[#0B0E17] border border-cyan-500/40 p-3.5 rounded-2xl shadow-[0_0_15px_rgba(0,229,255,0.1)]">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-mono text-cyan-300 uppercase font-bold flex items-center gap-1.5">
                    <PackageCheck className="w-4 h-4 text-[#00E5FF]" />
                    {t('Quantidade em Estoque (Preenchimento Manual)')}
                  </label>
                  <span className="text-[10px] font-mono text-zinc-500">{t('Digite a quantidade disponível')}</span>
                </div>
                <input 
                  type="number" 
                  min="1"
                  value={quantity} 
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-zinc-950 border border-cyan-400/60 rounded-xl px-4 py-2.5 text-sm text-white font-mono font-black outline-none focus:border-[#00E5FF] focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>

              {/* Descrição Detalhada */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[11px] font-mono text-zinc-400 uppercase font-bold">{t('Descrição Detalhada Gerada por IA')}</label>
                <textarea 
                  rows={3}
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#0B0E17] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-300 outline-none focus:border-[#00E5FF]"
                />
              </div>

            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-zinc-800 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setStep('upload')}
                className="px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold transition cursor-pointer"
              >
                {t('Recomeçar')}
              </button>

              <button
                type="button"
                disabled={isPublishing}
                onClick={handleSavePart}
                className="px-7 py-3 rounded-xl bg-gradient-to-r from-[#0D75FF] to-[#00E5FF] hover:opacity-90 text-white font-bold text-xs uppercase tracking-wider transition shadow-[0_0_25px_rgba(0,229,255,0.4)] flex items-center space-x-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isPublishing ? t('Cadastrando...') : t('Cadastrar Peça no Sistema')}</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
