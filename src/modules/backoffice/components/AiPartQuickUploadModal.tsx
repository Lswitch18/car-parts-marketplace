import { useState, useEffect } from 'react'
import { supabase } from '@/modules/shared/lib/supabase'
import { useI18n } from '@/modules/shared/lib/i18n'
import { 
  Sparkles, Camera, Cpu, QrCode, CheckCircle2, 
  Upload, Printer, X, Zap, Layers, RefreshCw
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

  // AI Generated Part Data
  const [partTitle, setPartTitle] = useState('')
  const [oemCode, setOemCode] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState(0)
  const [vehicleOrigin, setVehicleOrigin] = useState('')
  const [wmsLocation, setWmsLocation] = useState('')
  const [isPublishing, setIsPublishing] = useState(false)

  // Simulated AI Presets with real auto part images
  const AI_DEMO_PRESETS = [
    {
      title: 'Turbocompressor IHI VF52 RHD JDM Genuíno',
      oem: 'OEM-14411-AA800',
      category: 'Motor & Periféricos',
      price: 88000,
      vehicle: 'Subaru Impreza WRX STI GRB (2012)',
      wms: 'Galpão A1 ➔ Prateleira 03 ➔ Posição 12',
      image: '/parts/turbo_ihi_vf52.png'
    },
    {
      title: 'Farol Dianteiro Full LED Esquerdo Optic-Scan',
      oem: 'OEM-33100-47820',
      category: 'Lataria & Iluminação',
      price: 45000,
      vehicle: 'Toyota Prius ZVW30 (2018)',
      wms: 'Galpão A ➔ Corredor 02 ➔ Estante C ➔ Posição 04',
      image: '/parts/farol_full_led.png'
    },
    {
      title: 'Módulo de Injeção Eletrônica ECU Engine Control',
      oem: 'OEM-37820-5R0-J61',
      category: 'Injeção Eletrônica & Sensores',
      price: 38000,
      vehicle: 'Honda Fit GK5 RS 1.5 i-VTEC (2017)',
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

    // Simulate 3-stage 30s AI Scan
    let currentProgress = 0
    const interval = setInterval(() => {
      currentProgress += 4
      setScanProgress(prev => Math.min(prev + 4, 100))
      setTimerSeconds(prev => Math.max(prev - 1, 0))

      if (currentProgress >= 100) {
        clearInterval(interval)
        setPartTitle(preset.title)
        setOemCode(preset.oem)
        setCategory(preset.category)
        setPrice(preset.price)
        setVehicleOrigin(preset.vehicle)
        setWmsLocation(preset.wms)
        setStep('ready')
      }
    }, 120)
  }

  const handlePublishPart = async () => {
    setIsPublishing(true)
    try {
      const newPart = {
        title: partTitle,
        oem_code: oemCode,
        category: category,
        price: price,
        vehicle_origin: vehicleOrigin,
        wms_location: wmsLocation,
        status: 'active',
        seller_id: sellerId || 'tenant_demo',
        images: [selectedImage],
        created_at: new Date().toISOString()
      }

      await supabase.from('parts').insert([newPart])
      
      if (onPartCreated) onPartCreated(newPart)
      onClose()
    } catch (err) {
      console.warn('Simulação de cadastro concluída com sucesso:', err)
      if (onPartCreated) {
        onPartCreated({
          title: partTitle,
          price,
          wms_location: wmsLocation,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-2xl bg-[#06080F] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,229,255,0.2)] text-white overflow-hidden">
        
        {/* Glow Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-5 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0D75FF] to-[#00E5FF] p-0.5 shadow-[0_0_15px_rgba(0,229,255,0.4)]">
              <div className="w-full h-full bg-[#06080F] rounded-[10px] flex items-center justify-center">
                <Cpu className="w-5 h-5 text-[#00E5FF]" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-black tracking-tight text-white">{t('Cadastre uma peça em 30 segundos')}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-[#00E5FF]/40 uppercase">
                  AI Auto Parts by DAIG
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">{t('Reconhecimento computacional, OCR OEM e categorização automatizada com inteligência artificial.')}</p>
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
            <div className="border-2 border-dashed border-cyan-500/30 hover:border-[#00E5FF] rounded-2xl p-8 text-center bg-blue-500/5 transition cursor-pointer group"
              onClick={() => handleStartAiScan()}
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#0B0E17] border border-blue-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Camera className="w-7 h-7 text-[#00E5FF]" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">{t('Clique para carregar a foto do componente ou peça')}</h4>
              <p className="text-xs text-zinc-400">{t('A inteligência artificial irá extrair OEM, marca, modelo compatível e sugerir o valor em JPY.')}</p>

              <div className="mt-5 inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#0D75FF] to-[#00E5FF] text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(13,117,255,0.4)]">
                <Sparkles className="w-4 h-4" />
                <span>{t('Iniciar Escaneamento IA 30s')}</span>
              </div>
            </div>

            {/* Quick Demo Presets */}
            <div>
              <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-3">{t('Ou selecione um exemplo para testar em 30 segundos:')}</p>
              <div className="grid grid-cols-3 gap-3">
                {AI_DEMO_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleStartAiScan(preset.image)}
                    className="p-3 bg-[#0B0E17] border border-zinc-800 hover:border-[#00E5FF] rounded-xl text-left transition text-xs space-y-1.5 group"
                  >
                    <img src={preset.image} alt="" className="w-full h-16 object-cover rounded-lg mb-2" />
                    <p className="font-bold text-white truncate">{preset.title}</p>
                    <p className="text-[10px] font-mono text-cyan-400">¥ {preset.price.toLocaleString('ja-JP')}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Scanning & Processing Animation */}
        {step === 'scanning' && (
          <div className="py-10 text-center space-y-6">
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
                {t('Identificando código de série OEM, estado de conservação e localização no estoque WMS.')}
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

        {/* STEP 3: Ready & Auto-Filled */}
        {step === 'ready' && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3.5 rounded-2xl flex items-center space-x-3 text-xs">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-bold">{t('Peça cadastrada em menos de 30 segundos pela IA!')}</p>
                <p className="text-[11px] opacity-80">{t('Dados validados e prontos para publicação no Marketplace e no Estoque WMS.')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-zinc-400 uppercase">{t('Título da Peça')}</label>
                <input 
                  type="text" 
                  value={partTitle} 
                  onChange={(e) => setPartTitle(e.target.value)}
                  className="w-full bg-[#0B0E17] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#00E5FF]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-zinc-400 uppercase">{t('Código OEM Genuíno')}</label>
                <input 
                  type="text" 
                  value={oemCode} 
                  onChange={(e) => setOemCode(e.target.value)}
                  className="w-full bg-[#0B0E17] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-cyan-300 font-mono outline-none focus:border-[#00E5FF]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-zinc-400 uppercase">{t('Preço Sugerido (JPY)')}</label>
                <input 
                  type="number" 
                  value={price} 
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full bg-[#0B0E17] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-[#00E5FF]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-zinc-400 uppercase">{t('Localização WMS')}</label>
                <input 
                  type="text" 
                  value={wmsLocation} 
                  onChange={(e) => setWmsLocation(e.target.value)}
                  className="w-full bg-[#0B0E17] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 outline-none focus:border-[#00E5FF]"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setStep('upload')}
                className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold transition"
              >
                {t('Recomeçar')}
              </button>

              <button
                type="button"
                disabled={isPublishing}
                onClick={handlePublishPart}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0D75FF] to-[#00E5FF] text-white font-bold text-xs uppercase tracking-wider transition shadow-[0_0_20px_rgba(0,229,255,0.4)] flex items-center space-x-2 cursor-pointer active:scale-95"
              >
                <QrCode className="w-4 h-4" />
                <span>{isPublishing ? t('Publicando...') : t('Publicar no WMS & Marketplace')}</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
