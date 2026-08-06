import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/modules/identity/store/authStore'
import { supabase } from '@/modules/shared/lib/supabase'
import { BRANDS, CATEGORIES, CONDITIONS, YEARS, BRAND_UUIDS, MODEL_UUIDS, CATEGORY_UUIDS } from '@/modules/shared/lib/constants'
import { Upload, X, Loader2, Sparkles, Gavel, Box, CheckCircle, AlertTriangle } from 'lucide-react'
import { useI18n } from '@/modules/shared/lib/i18n'
import { api } from '@/modules/transactions/api/api'
import { manufacturerApi } from '@/modules/parts-catalog/api/manufacturerApi'

export default function CreateListing() {
  const { t, language } = useI18n()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [images, setImages] = useState<string[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [generating3D, setGenerating3D] = useState(false)
  const [model3DUrl, setModel3DUrl] = useState<string | null>(null)
  const checkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [aiProgress, setAiProgress] = useState(0)
  const [aiError, setAiError] = useState<string | null>(null)
  const [partNumber, setPartNumber] = useState<string | null>(null)
  const [isOfficialData, setIsOfficialData] = useState(false)
  const [brandMismatch, setBrandMismatch] = useState(false)
  const [vin, setVin] = useState('')
  
  const [aiEnabled, setAiEnabled] = useState(true)
  const [isAuction, setIsAuction] = useState(false)
  const [partsCount, setPartsCount] = useState<number | null>(null)
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [showUnverifiedModal, setShowUnverifiedModal] = useState(false)

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current)
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    }
  }, [])

  // Fetch count when user loads
  useEffect(() => {
    if (!user) return
    
    if (user.account_type === 'pessoa_fisica') {
      // Pessoa física: contar no mês atual (limite de 50)
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
      supabase
        .from('parts')
        .select('id', { count: 'exact' })
        .eq('seller_id', user.id)
        .gte('created_at', startOfMonth)
        .then(({ count, error }) => {
          if (!error && count !== null) {
            setPartsCount(count)
            if (count >= 50) {
              setShowLimitModal(true)
            }
          }
        })
      return
    }

    if ((user.account_type as string) !== 'pessoa_fisica' && !user.store_verified) {
      // Empresa não verificada: contar total (limite de 20)
      supabase
        .from('parts')
        .select('id', { count: 'exact' })
        .eq('seller_id', user.id)
        .then(({ count, error }) => {
          if (!error && count !== null) {
            setPartsCount(count)
            if (count >= 20) {
              setShowUnverifiedModal(true)
            }
          }
        })
      return
    }
  }, [user])

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    brand: '',
    model: '',
    yearStart: '',
    yearEnd: '',
    category: '',
    condition: '',
    startingBid: '',
    buyNowPrice: '',
    auctionDurationHours: '72',
  })

  const [compatibilityTags, setCompatibilityTags] = useState<string[]>([])
  const [newTagInput, setNewTagInput] = useState('')

  const poll3DStatus = (predictionId: string, title: string) => {
    let attempts = 0
    if (checkIntervalRef.current) clearInterval(checkIntervalRef.current)

    checkIntervalRef.current = setInterval(async () => {
      try {
        attempts++
        if (attempts > 60) { // Timeout 3 mins
          if (checkIntervalRef.current) clearInterval(checkIntervalRef.current)
          setGenerating3D(false)
          return
        }
        
        const res = await api.ai.check3DStatus(predictionId) as any
        if (res.status === 'succeeded' && res.output) {
          if (checkIntervalRef.current) clearInterval(checkIntervalRef.current)
          setModel3DUrl(res.output)
          setGenerating3D(false)
          
          // Save to Google Drive automatically
          try {
            await api.ai.saveToDrive(res.output, title)
          } catch (err) {
            console.error('Falha ao salvar no Google Drive:', err)
          }
        } else if (res.status === 'failed' || res.status === 'canceled') {
          if (checkIntervalRef.current) clearInterval(checkIntervalRef.current)
          setGenerating3D(false)
          console.error("Geração 3D falhou", res.error)
        }
      } catch (err) {
        console.error('Erro no check3D:', err)
      }
    }, 3000)
  }

  const analyzeWithAI = async () => {
    if (images.length === 0) return
    
    try {
      setAiError(null)
      setAnalyzing(true)
      setAiProgress(0)
      setBrandMismatch(false)
      progressIntervalRef.current = setInterval(() => {
        setAiProgress(prev => (prev < 95 ? prev + (Math.random() * 1.5) : prev))
      }, 1500)
      
      const data = await api.ai.analyzePart(images[0], language, vin) as any
      
      setAnalyzing(false)

      console.log('[analyzeWithAI] Raw AI response:', data)

      if (data.is_car_part === false) {
        console.warn('[analyzeWithAI] AI determined this is not a car part.')
        setAiError(t('A imagem não parece ser uma peça automotiva válida. O cadastro foi bloqueado e a imagem removida.'))
        removeImage(0)
        return
      }

      const newTitle = data.title || formData.title
      
      let newFormData = {
        title: newTitle,
        description: data.description || formData.description,
        price: data.estimated_price?.toString() || formData.price,
        brand: data.brand || formData.brand,
        model: data.model || formData.model,
        category: data.category || formData.category,
      }

      if (data.part_number) {
        setPartNumber(data.part_number)
        console.log('[analyzeWithAI] Código OEM / Part Number detectado:', data.part_number)
        
        setIsOfficialData(data.is_verified || false)
        setBrandMismatch(data.brand_mismatch || false)
        
        console.log('[analyzeWithAI] Dados cruzados no backend:', {
          is_verified: data.is_verified,
          brand_mismatch: data.brand_mismatch,
          source: data.source
        })
      } else {
        setPartNumber(null)
        setIsOfficialData(false)
        setBrandMismatch(false)
      }

      if (data.compatibility_tags && Array.isArray(data.compatibility_tags)) {
        setCompatibilityTags(data.compatibility_tags)
      } else {
        setCompatibilityTags([])
      }
      
      console.log('[analyzeWithAI] Preenchendo campos com:', newFormData)
      
      setFormData(prev => ({
        ...prev,
        ...newFormData
      }))

      // 3D Generation is temporarily disabled.
      /*
      setGenerating3D(true)
      
      // Resize image specifically for 3D generation to avoid 400 Bad Request (Payload Too Large)
      // The 1024px image is great for OCR, but too heavy for the Edge Function / Replicate API payload.
      const resizeFor3D = async (base64Str: string): Promise<string> => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_3D_SIZE = 512;
            let width = img.width;
            let height = img.height;
            if (width > height) {
              if (width > MAX_3D_SIZE) {
                height *= MAX_3D_SIZE / width;
                width = MAX_3D_SIZE;
              }
            } else {
              if (height > MAX_3D_SIZE) {
                width *= MAX_3D_SIZE / height;
                height = MAX_3D_SIZE;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.7));
          };
          img.src = base64Str;
        });
      };

      try {
        const imageFor3D = await resizeFor3D(images[0]);
        const gen3DData = await api.ai.generate3D(imageFor3D).catch(e => {
          console.error("3D init fail", e);
          return null;
        }) as any;
        
        if (gen3DData?.id) {
           poll3DStatus(gen3DData.id, newTitle);
        } else {
           setGenerating3D(false);
        }
      } catch (err) {
        console.error("Failed to resize image for 3D", err);
        setGenerating3D(false);
      }
      */
    } catch (error) {
      console.error('Erro na análise de IA:', error)
      alert(t('Não foi possível analisar a imagem. Tente preencher manualmente.'))
      setGenerating3D(false)
    } finally {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
      setAiProgress(100)
      setTimeout(() => {
        setAnalyzing(false)
        setAiProgress(0)
      }, 800)
    }
  }

  const createListing = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Must be logged in')
      
      setUploading(true)
      let uploadedUrls: string[] = []

      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          const { error } = await supabase.storage
            .from('parts-images')
            .upload(fileName, file)
          
          if (error) throw error
          
          const { data: { publicUrl } } = supabase.storage
            .from('parts-images')
            .getPublicUrl(fileName)
          
          uploadedUrls.push(publicUrl)
        }
      }

      if (isAuction) {
        // Modo Leilão — usa a Edge Function completa
        await api.auctions.create({
          title: formData.title,
          description: formData.description,
          starting_bid: parseFloat(formData.startingBid),
          buy_now_price: formData.buyNowPrice ? parseFloat(formData.buyNowPrice) : undefined,
          auction_duration_hours: parseInt(formData.auctionDurationHours),
          condition: formData.condition,
          brand_id: BRAND_UUIDS[formData.brand],
          category_id: CATEGORY_UUIDS[formData.category],
          model_id: MODEL_UUIDS[formData.model],
          images: uploadedUrls,
        });
      } else {
        // Modo Preço Fixo — insere direto na tabela parts
        const { error } = await supabase.from('parts').insert({
          seller_id: user.id,
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          brand_id: BRAND_UUIDS[formData.brand],
          model_id: MODEL_UUIDS[formData.model],
          year_start: parseInt(formData.yearStart),
          year_end: parseInt(formData.yearEnd),
          category_id: CATEGORY_UUIDS[formData.category],
          condition: formData.condition,
          images: uploadedUrls,
          model_3d_url: model3DUrl,
          status: 'active',
          compatibility_tags: compatibilityTags,
        });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      navigate('/tenant-dashboard')
    },
    onSettled: () => setUploading(false)
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setImageFiles(prev => [...prev, ...files])
      
      files.forEach(file => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          setImages(prev => [...prev, base64]);
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImageFiles(prev => prev.filter((_, i) => i !== index))
  }

  const selectedBrand = BRANDS.find(b => b.id === formData.brand)

  if (!user) {
    navigate('/login')
    return null
  }

  // --- Regras de Bloqueio Modal ---
  if (showUnverifiedModal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="card max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-[#0D75FF]/10 text-[#0D75FF] rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-text mb-2">{t('Valide sua Empresa')}</h2>
          <p className="text-text-secondary mb-6">
            {t('Você atingiu o limite de 20 peças gratuitas para teste. Para continuar vendendo de forma ilimitada, valide sua empresa através do nosso plano Premium (¥ 4.500 JPY/mês).')}
          </p>
          <div className="space-y-3">
            <button onClick={() => navigate('/subscription')} className="w-full bg-[#0D75FF] hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition-colors">
              {t('Ver Planos')}
            </button>
            <button onClick={() => navigate('/catalog')} className="w-full bg-surface border border-border hover:bg-surface-hover text-text py-3 rounded-lg font-medium transition-colors">
              {t('Voltar ao Catálogo')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (showLimitModal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="card max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-[#ff3d00]/10 text-[#ff3d00] rounded-full flex items-center justify-center mx-auto mb-4">
            <Gavel className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-text mb-2">{t('Limite Mensal Atingido')}</h2>
          <p className="text-text-secondary mb-6">
            {t('Como usuário comum (pessoa física), você atingiu o limite de 50 peças gratuitas deste mês. Tente novamente no próximo mês.')}
          </p>
          <div className="space-y-3">
            <button onClick={() => navigate('/dashboard')} className="w-full bg-surface border border-border hover:bg-surface-hover text-text py-3 rounded-lg font-medium transition-colors">
              {t('Voltar ao Dashboard')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-bold text-text">
            {t('Nova Listagem')}
          </h1>
          
          <div className="flex items-center space-x-3 bg-surface/50 border border-border px-4 py-2 rounded-full shadow-sm">
            <Sparkles className={`w-4 h-4 ${aiEnabled ? 'text-primary' : 'text-text-secondary'}`} />
            <span className="text-sm font-medium text-text">{t('Assistente de IA')}</span>
            <button
              type="button"
              onClick={() => setAiEnabled(!aiEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                aiEnabled ? 'bg-primary' : 'bg-border'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  aiEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* BANNER PROPOSTA IA: CADASTRO EM 30 SEGUNDOS VIA VISÃO COMPUTACIONAL */}
        <div className="bg-gradient-to-r from-blue-950/80 via-indigo-950/80 to-purple-950/80 border border-blue-500/40 rounded-2xl p-5 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/30">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-sm text-white">Cadastro por Visão Computacional em 30s</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  REDUÇÃO DE 90% DO TEMPO
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Fotografe a peça ou selecione a imagem: nossa IA lê o código OEM, reconhece a marca/modelo e autopreenche 100% do formulário em 30 segundos!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setImages(['/parts/farol_full_led.png'])
              setAnalyzing(true)
              setAiProgress(10)
              setTimeout(() => setAiProgress(60), 300)
              setTimeout(() => {
                setAiProgress(100)
                setAnalyzing(false)
                setPartNumber('OEM-33100-47820')
                setIsOfficialData(true)
                setFormData({
                  title: 'Farol Dianteiro Full LED Esquerdo Prius ZVW30',
                  description: 'Farol LED genuíno Toyota em estado impecável, testado no scanner óptico com encaixes e reator intactos.',
                  price: '45000',
                  brand: 'toyota',
                  model: 'prius',
                  yearStart: '2015',
                  yearEnd: '2022',
                  category: 'lataria',
                  condition: 'Usado - Excelente Estado (Grau A+)',
                  startingBid: '35000',
                  buyNowPrice: '45000',
                  auctionDurationHours: '72'
                })
              }, 800)
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center space-x-2 shrink-0 transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>⚡ Autopreencher Formulário em 30s (IA Vision)</span>
          </button>
        </div>

        <div className="card p-8">
          <form onSubmit={(e) => { e.preventDefault(); createListing.mutate() }} className="space-y-6">
            <div>
              <label className="block text-text-secondary text-sm mb-2">{t('Fotos do produto')}</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {images.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-border">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-2 right-2 p-1 bg-error rounded-full text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <label className="aspect-square border-2 border-dashed border-border rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                  <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                  <Upload className="w-6 h-6 text-text-secondary" />
                </label>
              </div>

              {aiError && (
                <div className="mt-4 p-4 bg-error/10 border border-error/20 rounded-lg flex items-start gap-3 text-error">
                  <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{aiError}</p>
                </div>
              )}

              {images.length > 0 && aiEnabled && (
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="block text-text-secondary text-xs mb-1">
                      {t('Número do Chassi / VIN (Opcional - Ajuda a IA a ser 98% precisa)')}
                    </label>
                    <input
                      type="text"
                      value={vin}
                      onChange={(e) => setVin(e.target.value.toUpperCase())}
                      className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-text text-sm focus:border-primary focus:outline-none"
                      placeholder="Ex: JTD123456789..."
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    {!analyzing ? (
                      <button
                        type="button"
                        onClick={analyzeWithAI}
                        disabled={generating3D}
                        className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-primary/20 to-primary/5 hover:from-primary/30 hover:to-primary/10 text-primary border border-primary/30 px-4 py-3 rounded-lg transition-all"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span className="text-sm font-medium">{t('Análise de IA (Auto Preenchimento)')}</span>
                      </button>
                    ) : (
                      <div className="flex-1 relative overflow-hidden bg-surface border border-primary/30 px-4 py-3 rounded-lg flex flex-col justify-center transition-all">
                        <div className="flex justify-between items-center mb-2 relative z-10">
                          <div className="flex items-center space-x-2">
                            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                            <span className="text-sm font-medium text-primary">
                              {aiProgress < 20 ? t('Lendo imagem e textura...') : 
                               aiProgress < 45 ? t('Identificando peça e montadora...') : 
                               aiProgress < 75 ? t('Buscando especificações...') : 
                               aiProgress < 96 ? t('Consultando valor de mercado...') :
                               t('Finalizando...')}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-primary">{Math.min(100, Math.round(aiProgress))}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden relative z-10 shadow-inner">
                          <div 
                            className="h-full bg-gradient-to-r from-[#0D75FF] to-[#00f0ff] transition-all duration-500 ease-out shadow-[0_0_8px_rgba(0,240,255,0.8)]"
                            style={{ width: `${Math.min(100, aiProgress)}%` }}
                          ></div>
                        </div>
                        <div className="absolute inset-0 bg-primary/5 animate-pulse rounded-lg"></div>
                      </div>
                    )}
                    
                    {/* Status do 3D Engine */}
                    {(generating3D || model3DUrl) && (
                      <div className="flex-1 flex items-center justify-center space-x-2 bg-surface border border-border px-4 py-3 rounded-lg">
                        {generating3D ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                            <span className="text-sm font-medium text-purple-400">{t('Renderizando 3D (TripoSR)...')}</span>
                          </>
                        ) : (
                          <>
                            <Box className="w-4 h-4 text-green-500" />
                            <span className="text-sm font-medium text-green-400">{t('Modelo 3D Gerado com Sucesso!')}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {partNumber && (
                <div className="space-y-3 mt-4">
                  <div className={`p-4 rounded-lg border flex items-start gap-3 transition-colors ${isOfficialData ? 'bg-[#00f0ff]/10 border-[#00f0ff]/30 text-[#00f0ff]' : 'bg-surface border-border text-text'}`}>
                    {isOfficialData ? (
                      <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Sparkles className="w-5 h-5 flex-shrink-0 mt-0.5 text-primary" />
                    )}
                    <div>
                      <h3 className="text-sm font-semibold mb-1">
                        {isOfficialData ? t('Dados Oficiais do Fabricante') : t('Part Number Identificado')}
                      </h3>
                      <p className="text-sm opacity-80">
                        {isOfficialData 
                          ? t(`O código OEM ${partNumber} foi validado no catálogo do fabricante. As especificações abaixo são 100% precisas.`) 
                          : t(`O código ${partNumber} foi lido pela IA, porém não foi encontrado na base oficial. Os dados abaixo são estimativas.`)}
                      </p>
                    </div>
                  </div>

                  {brandMismatch && (
                    <div className="p-4 rounded-lg border flex items-start gap-3 bg-red-500/10 border-red-500/30 text-red-500">
                      <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-semibold mb-1">
                          {t('Divergência de Marca Detectada')}
                        </h3>
                        <p className="text-sm opacity-80">
                          {t(`Atenção: A marca identificada visualmente na peça não condiz com os dados oficiais do fabricante para o código ${partNumber}. Por favor, verifique os dados antes de prosseguir.`)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-text-secondary text-sm mb-2">{t('Título')} *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text"
                placeholder="Ex: Turbina Garrett GT35 para Nissan GT-R"
                required
              />
            </div>

            <div>
              <label className="block text-text-secondary text-sm mb-2">{t('Descrição')} *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text h-32"
                placeholder="Descreva o estado, procedência, etc."
                required
              />
            </div>

            {/* ─── Modo Leilão toggle ─────────────────────────── */}
            <div className="flex items-center space-x-3 py-2">
              <button
                type="button"
                onClick={() => setIsAuction(!isAuction)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
                  isAuction
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-surface text-text-secondary'
                }`}
              >
                <Gavel className="w-4 h-4" />
                <span className="text-sm font-medium">{t('Modo Leilão')}</span>
              </button>
              {isAuction && (
                <span className="text-xs text-text-muted">
                  {t('Lances por tempo limitado')}
                </span>
              )}
            </div>

            {isAuction ? (
              /* ─── Campos de Leilão ─────────────────────────── */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-text-secondary text-sm mb-2">
                    {t('Lance Inicial (¥)')} *
                  </label>
                  <input
                    type="number"
                    value={formData.startingBid}
                    onChange={(e) => setFormData({ ...formData, startingBid: e.target.value })}
                    className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text"
                    placeholder="10000"
                    required
                  />
                </div>
                <div>
                  <label className="block text-text-secondary text-sm mb-2">
                    {t('Preço Fixo (¥)')}
                  </label>
                  <input
                    type="number"
                    value={formData.buyNowPrice}
                    onChange={(e) => setFormData({ ...formData, buyNowPrice: e.target.value })}
                    className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text"
                    placeholder="Opcional"
                  />
                </div>
                <div>
                  <label className="block text-text-secondary text-sm mb-2">
                    {t('Duração (horas)')} *
                  </label>
                  <select
                    value={formData.auctionDurationHours}
                    onChange={(e) => setFormData({ ...formData, auctionDurationHours: e.target.value })}
                    className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text"
                    required
                  >
                    <option value="24">24 h</option>
                    <option value="48">48 h</option>
                    <option value="72">72 h (3 dias)</option>
                    <option value="168">168 h (7 dias)</option>
                    <option value="336">336 h (14 dias)</option>
                  </select>
                </div>
              </div>
              ) : (
              /* ─── Preço Fixo ───────────────────────────────── */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-text-secondary text-sm mb-2">{t('Preço (R$)')} *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text"
                    placeholder="0,00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-text-secondary text-sm mb-2">{t('Categoria')} *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text"
                    required
                  >
                    <option value="">{t('Selecione')}</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-text-secondary text-sm mb-2">{t('Marca')} *</label>
                <select
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value, model: '' })}
                  className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text"
                  required
                >
                  <option value="">{t('Selecione')}</option>
                  {BRANDS.map(brand => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
              </div>

              {formData.brand && selectedBrand && (
                <div>
                  <label className="block text-text-secondary text-sm mb-2">{t('Modelo')} *</label>
                  <select
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text"
                    required
                  >
                    <option value="">{t('Selecione')}</option>
                    {selectedBrand.models.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Compatibility Tags Selection */}
            <div className="card p-5 border border-border/60 bg-surface/50">
              <label className="block text-text-secondary text-sm font-semibold mb-2">
                {t('Tags de Compatibilidade')} (Kei Cars, JDM, Variantes)
              </label>
              <p className="text-xs text-gray-500 mb-3">
                {t('Adicione outros veículos que também aceitam essa peça. A IA adiciona sugestões automaticamente baseada em códigos OEM.')}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {compatibilityTags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20 px-3 py-1.5 rounded-full text-xs font-semibold">
                    {tag}
                    <button
                      type="button"
                      onClick={() => setCompatibilityTags(prev => prev.filter(t => t !== tag))}
                      className="hover:text-red-400 font-bold ml-1 text-sm focus:outline-none"
                    >
                      &times;
                    </button>
                  </span>
                ))}
                {compatibilityTags.length === 0 && (
                  <span className="text-gray-500 text-xs py-1.5">{t('Nenhuma tag de compatibilidade adicionada.')}</span>
                )}
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={t('Adicione um veículo (Ex: Honda N-BOX)')}
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-background border border-border rounded-lg text-text text-sm focus:border-daig-blue"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (newTagInput.trim()) {
                        const val = newTagInput.trim();
                        if (!compatibilityTags.includes(val)) {
                          setCompatibilityTags(prev => [...prev, val]);
                        }
                        setNewTagInput('');
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newTagInput.trim()) {
                      const val = newTagInput.trim();
                      if (!compatibilityTags.includes(val)) {
                        setCompatibilityTags(prev => [...prev, val]);
                      }
                      setNewTagInput('');
                    }
                  }}
                  className="bg-daig-blue/20 text-daig-blue hover:bg-daig-blue/30 border border-daig-blue/30 px-4 rounded-lg text-sm font-semibold"
                >
                  {t('Adicionar')}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-text-secondary text-sm mb-2">{t('Ano Inicial')} *</label>
                <select
                  value={formData.yearStart}
                  onChange={(e) => setFormData({ ...formData, yearStart: e.target.value })}
                  className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text"
                  required
                >
                  <option value="">{t('Selecione')}</option>
                  {YEARS.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-text-secondary text-sm mb-2">{t('Ano Final')} *</label>
                <select
                  value={formData.yearEnd}
                  onChange={(e) => setFormData({ ...formData, yearEnd: e.target.value })}
                  className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text"
                  required
                >
                  <option value="">{t('Selecione')}</option>
                  {YEARS.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-text-secondary text-sm mb-2">{t('Condição')} *</label>
              <div className="grid grid-cols-3 gap-4">
                {CONDITIONS.map(cond => (
                  <label
                    key={cond.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      formData.condition === cond.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-surface'
                    }`}
                  >
                    <input
                      type="radio"
                      name="condition"
                      value={cond.id}
                      checked={formData.condition === cond.id}
                      onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                      className="hidden"
                    />
                    <p className="text-text font-medium text-center">{cond.label}</p>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={createListing.isPending || uploading}
              className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-lg font-semibold transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {createListing.isPending || uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{t('Publicando...')}</span>
                </>
              ) : (
                <span>{t('Publicar Anúncio')}</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}