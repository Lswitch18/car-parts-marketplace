import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/modules/identity/store/authStore'
import { supabase } from '@/modules/shared/lib/supabase'
import { BRANDS, CATEGORIES, CONDITIONS, YEARS, BRAND_UUIDS, MODEL_UUIDS, CATEGORY_UUIDS } from '@/modules/shared/lib/constants'
import { Upload, X, Loader2, Sparkles, Gavel, Box } from 'lucide-react'
import { useI18n } from '@/modules/shared/lib/i18n'
import { api } from '@/modules/transactions/api/api'

export default function CreateListing() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [images, setImages] = useState<string[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [generating3D, setGenerating3D] = useState(false)
  const [model3DUrl, setModel3DUrl] = useState<string | null>(null)
  const checkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  
  const [aiEnabled, setAiEnabled] = useState(true)
  const [isAuction, setIsAuction] = useState(false)
  const [partsCount, setPartsCount] = useState<number | null>(null)
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [showUnverifiedModal, setShowUnverifiedModal] = useState(false)

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current)
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
        .select('*', { count: 'exact', head: true })
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
        .select('*', { count: 'exact', head: true })
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

  const poll3DStatus = (predictionId: string) => {
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
      setAnalyzing(true)
      
      const data = await api.ai.analyzePart(images[0])
      
      setFormData(prev => ({
        ...prev,
        title: data.title || prev.title,
        description: data.description || prev.description,
        price: data.estimated_price?.toString() || prev.price,
        brand: data.brand || prev.brand,
        model: data.model || prev.model,
        category: data.category || prev.category,
      }))
      
      setAnalyzing(false)

      if (data.is_car_part === false) {
        alert(t('A imagem não parece ser uma peça automotiva válida. O modelo 3D não será gerado.'))
        return
      }

      setGenerating3D(true)
      const gen3DData = await api.ai.generate3D(images[0]).catch(e => {
        console.error("3D init fail", e)
        return null
      })
      
      if (gen3DData?.id) {
         poll3DStatus(gen3DData.id)
      } else {
         setGenerating3D(false)
      }
    } catch (error) {
      console.error('Erro na análise de IA:', error)
      alert(t('Não foi possível analisar a imagem. Tente preencher manualmente.'))
      setGenerating3D(false)
    } finally {
      setAnalyzing(false)
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
        });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      navigate('/dashboard')
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
          setImages(prev => [...prev, e.target?.result as string])
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

              {images.length > 0 && aiEnabled && (
                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={analyzeWithAI}
                    disabled={analyzing || generating3D}
                    className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-primary/20 to-primary/5 hover:from-primary/30 hover:to-primary/10 text-primary border border-primary/30 px-4 py-3 rounded-lg transition-all"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm font-medium">{t('Gemini Pro Analisando...')}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span className="text-sm font-medium">{t('Análise Gemini + Geração 3D')}</span>
                      </>
                    )}
                  </button>
                  
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