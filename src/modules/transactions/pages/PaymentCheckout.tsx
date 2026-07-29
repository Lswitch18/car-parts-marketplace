import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { supabase } from '@/modules/shared/lib/supabase'
import { useAuthStore } from '@/modules/identity/store/authStore'
import { api } from '@/modules/transactions/api/api'
import { calculateFees, formatJPY } from '@/modules/transactions/api/fees'
import { 
  CreditCard, Lock, ShieldCheck, Package, 
  ArrowLeft, Check, AlertCircle, Loader2
} from 'lucide-react'
import SafeImage from '@/modules/parts-catalog/components/SafeImage'
import { fetchPostal } from '@/modules/shared/lib/postal'

interface Part {
  id: string
  title: string
  price: number
  images: string[]
  seller_id: string
  status: string
  brands?: { name: string }
  categories?: { name: string }
}

interface Seller {
  id: string
  full_name: string
  avatar_url: string
  rating: number
  is_verified: boolean
  total_sales: number
}

export default function PaymentCheckout() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  
  const [step, setStep] = useState<'details' | 'payment' | 'processing' | 'success' | 'error'>('details')
  const [errorMessage, setErrorMessage] = useState('')
  const [shippingInfo, setShippingInfo] = useState({
    name: '', email: '', phone: '', address: '', number: '', complement: '', city: '', state: '', zipCode: '',
  })
  const [postalLoading, setPostalLoading] = useState(false)

  const handlePostalBlur = useCallback(async () => {
    const raw = shippingInfo.zipCode.replace(/\D/g, '')
    if (raw.length < 5) return
    setPostalLoading(true)
    const result = await fetchPostal(raw)
    if (result) {
      setShippingInfo(prev => ({
        ...prev,
        address: result.fullAddress || prev.address,
        city: result.city || prev.city,
        state: result.state || prev.state,
      }))
    }
    setPostalLoading(false)
  }, [shippingInfo.zipCode])

  const { data: part, isLoading } = useQuery({
    queryKey: ['part', id],
    queryFn: async () => {
      const { data } = await supabase
        .from('parts')
        .select('*, brands(name), categories(name)')
        .eq('id', id)
        .single()
      return data as Part
    }
  })

  const { data: seller } = useQuery({
    queryKey: ['seller', part?.seller_id],
    queryFn: async () => {
      if (!part?.seller_id) return null
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, rating, is_verified, total_sales')
        .eq('id', part.seller_id)
        .single()
      return data as Seller
    },
    enabled: !!part?.seller_id
  })

  const urlParams = new URLSearchParams(window.location.search)
  const negotiatedPrice = urlParams.get('price')
  /** ID da mensagem de proposta confirmada — enviado ao backend para validar o preço real */
  const confirmedMessageId = urlParams.get('msg') || undefined
  const finalPrice = negotiatedPrice ? Number(negotiatedPrice) : part?.price
  const fees = part ? calculateFees(finalPrice || part.price) : null

  /** Ref para garantir que a mutation só dispare uma vez mesmo com duplo clique */
  const isSubmitting = useRef(false)

  /** Gera uma chave de idempotência determinística para (comprador, peça, proposta) */
  const buildIdempotencyKey = useCallback(async (): Promise<string | undefined> => {
    if (!user || !id) return undefined
    const raw = [user.id, id, confirmedMessageId ?? 'direct'].join('|')
    try {
      const encoded = new TextEncoder().encode(raw)
      const hashBuffer = await crypto.subtle.digest('SHA-256', encoded)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    } catch {
      // Fallback para browsers sem Web Crypto (não esperado, mas seguro)
      return btoa(raw).replace(/[^a-zA-Z0-9]/g, '').slice(0, 64)
    }
  }, [user, id, confirmedMessageId])

  const createTransaction = useMutation({
    mutationFn: async () => {
      if (!user || !part) throw new Error('Usuário não autenticado')

      // Lock de idempotência no cliente: impede duplo clique
      if (isSubmitting.current) throw new Error('Pagamento já em processamento')
      isSubmitting.current = true

      try {
        const idempotencyKey = await buildIdempotencyKey()

        const fullAddress = [
          shippingInfo.address,
          shippingInfo.number && `Nº ${shippingInfo.number}`,
          shippingInfo.complement,
        ].filter(Boolean).join(', ')

        const tx: any = await api.transactions.create({
          part_id: part.id,
          amount: finalPrice || part.price,
          shipping: { ...shippingInfo, address: fullAddress },
          idempotency_key: idempotencyKey,
          confirmed_message_id: confirmedMessageId,
        })

        return tx.transaction || tx
      } catch (err) {
        isSubmitting.current = false
        throw err
      }
    },
    onSuccess: async (transaction) => {
      setStep('processing')

      const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY

      if (!stripePublicKey || !stripePublicKey.startsWith('pk_')) {
        throw new Error("Pagamento via Stripe não configurado. Por favor, contate o suporte.")
      }

      const fullAddress = [
        shippingInfo.address,
        shippingInfo.number && `Nº ${shippingInfo.number}`,
        shippingInfo.complement,
      ].filter(Boolean).join(', ')

      const result = await api.stripe.createCheckout({
        transaction_id: transaction.id,
        part_id: part!.id,
        buyer_id: user!.id,
        seller_id: part!.seller_id,
        amount: finalPrice || part!.price,
        shipping: { ...shippingInfo, address: fullAddress },
      })

      if (result.url) {
        window.location.href = result.url
        return
      } else {
        throw new Error("Não foi possível gerar a sessão de pagamento do Stripe.")
      }
    },
    onError: (err: any) => {
      isSubmitting.current = false
      setErrorMessage(err.message)
      setStep('error')
    }
  })

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/checkout/' + id)
    }
  }, [user, navigate, id])

  if (isLoading || !part || !fees) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-daig-blue animate-spin" />
      </div>
    )
  }

  if (part.status === 'sold') {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Produto Indisponível</h1>
          <p className="text-gray-400 mb-6">Este produto já foi vendido.</p>
          <Link to="/catalog" className="text-daig-blue hover:underline">Voltar ao catálogo</Link>
        </div>
      </div>
    )
  }

  if (part.seller_id === user?.id) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Compra Inválida</h1>
          <p className="text-gray-400 mb-6">Você não pode comprar seu próprio produto.</p>
          <Link to={`/product/${id}`} className="text-daig-blue hover:underline">Voltar ao produto</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-400 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </button>

        <h1 className="text-2xl font-bold text-white mb-6">Finalizar Compra</h1>

        {step === 'details' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Informações de Entrega</h2>
                <div className="space-y-4">
                  <input type="text" placeholder="Nome completo" value={shippingInfo.name} onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })} className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white" />
                  <input type="email" placeholder="E-mail" value={shippingInfo.email} onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })} className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white" />
                  <input type="tel" placeholder="Telefone" value={shippingInfo.phone} onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })} className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white" />
                  <div className="relative">
                    <input type="text" placeholder="CEP (ex: 01001-000)" value={shippingInfo.zipCode} onChange={(e) => setShippingInfo({ ...shippingInfo, zipCode: e.target.value })} onBlur={handlePostalBlur} className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white" />
                    {postalLoading && <Loader2 className="w-4 h-4 text-daig-blue animate-spin absolute right-3 top-1/2 -translate-y-1/2" />}
                  </div>
                    <input type="text" placeholder="Endereço (Rua, Avenida, etc.)" value={shippingInfo.address} onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })} className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white" />
                  <div className="grid grid-cols-4 gap-4">
                    <input type="text" placeholder="Número" value={shippingInfo.number} onChange={(e) => setShippingInfo({ ...shippingInfo, number: e.target.value })} className="bg-background border border-border rounded-lg px-4 py-3 text-white" />
                    <input type="text" placeholder="Complemento (Apto, bloco, etc.)" value={shippingInfo.complement} onChange={(e) => setShippingInfo({ ...shippingInfo, complement: e.target.value })} className="col-span-3 bg-background border border-border rounded-lg px-4 py-3 text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Cidade" value={shippingInfo.city} onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })} className="bg-background border border-border rounded-lg px-4 py-3 text-white" />
                    <input type="text" placeholder="Estado" value={shippingInfo.state} onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })} className="bg-background border border-border rounded-lg px-4 py-3 text-white" />
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Pagamento Seguro via Stripe</h2>
                <div className="flex items-start space-x-3 p-4 border border-daig-blue/30 bg-daig-blue/5 rounded-lg">
                  <CreditCard className="w-6 h-6 text-daig-blue mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">Métodos de Pagamento JDM</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Aceita Cartão de Crédito, Lojas de Conveniência (Konbini), Google Pay e Apple Pay. O método de cobrança final em Iene (JPY) será selecionado de forma segura na tela oficial do Stripe.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Resumo do Pedido</h2>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-20 h-20 bg-background rounded-lg flex items-center justify-center overflow-hidden">
                    <SafeImage src={part.images?.[0]} alt="" className="w-full h-full object-cover" fallback={<Package className="w-10 h-10 text-gray-600" />} />
                  </div>
                  <div><p className="text-white font-medium">{part.title}</p><p className="text-gray-400 text-sm">{part.brands?.name}</p></div>
                </div>
                <div className="border-t border-border pt-4 space-y-2">
                  {negotiatedPrice && (
                    <div className="flex justify-between text-green-400 text-sm">
                      <span>Preço original</span>
                      <span className="line-through">{formatJPY(part.price)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-400">
                    <span>{negotiatedPrice ? 'Preço negociado' : 'Subtotal'}</span>
                    <span>{formatJPY(finalPrice || part.price)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Envio (Yamato/Sagawa)</span>
                    <span className="text-daig-cyan">Grátis</span>
                  </div>
                  <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-border">
                    <span>Total a Pagar</span>
                    <span className="text-daig-blue font-display">{formatJPY(finalPrice || part.price)}</span>
                  </div>
                  <p className="text-gray-500 text-xs mt-2">* Taxas de serviço e processamento inclusas (cobertas pelo vendedor).</p>
                </div>
              </div>

              {seller && (
                <div className="card p-6">
                  <h2 className="text-lg font-semibold text-white mb-4">Vendedor</h2>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-daig-blue to-daig-cyan flex items-center justify-center">
                      {seller.avatar_url ? <img src={seller.avatar_url} alt="" className="w-full h-full rounded-full" /> : <span className="text-white font-bold">{seller.full_name?.[0]?.toUpperCase()}</span>}
                    </div>
                    <div>
                      <p className="text-white font-medium flex items-center">{seller.full_name}{seller.is_verified && <ShieldCheck className="w-4 h-4 text-daig-cyan ml-1" />}</p>
                      <p className="text-gray-400 text-sm">{seller.total_sales || 0} vendas</p>
                    </div>
                  </div>
                </div>
              )}

              <button onClick={() => createTransaction.mutate()} disabled={createTransaction.isPending || !shippingInfo.name || !shippingInfo.email}
                className="w-full bg-daig-blue hover:bg-daig-blue/80 text-white py-4 rounded-lg font-semibold flex items-center justify-center disabled:opacity-50">
                {createTransaction.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Lock className="w-5 h-5 mr-2" /> Pagar {formatJPY(fees.gross_amount)}</>}
              </button>

              <p className="text-gray-500 text-sm text-center flex items-center justify-center"><ShieldCheck className="w-4 h-4 mr-1" /> Pagamento seguro e garantido</p>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-16 h-16 text-daig-blue animate-spin mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">Processando Pagamento</h2>
            <p className="text-gray-400">Aguarde, estamos processando sua transação...</p>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"><Check className="w-10 h-10 text-white" /></div>
            <h2 className="text-2xl font-bold text-white mb-2">Pagamento Confirmado!</h2>
            <p className="text-gray-400 mb-6">Sua compra foi processada com sucesso.</p>
            <div className="card p-6 max-w-md mx-auto mb-8 text-left">
              <h3 className="text-white font-semibold mb-4">Próximos passos:</h3>
              <ol className="list-decimal list-inside text-gray-400 space-y-2">
                <li>Vendedor japonês foi notificado e preparará a peça</li>
                <li>Envio direto feito pelo próprio vendedor (Direct Ship)</li>
                <li>Você receberá o código de rastreamento no seu painel</li>
                <li>Acompanhe a entrega em Minhas Compras</li>
                <li>Após receber a peça, confirme a entrega no painel para concluir a transação</li>
              </ol>
            </div>
            <div className="flex gap-4 justify-center">
              <Link to="/dashboard" className="bg-daig-blue px-6 py-3 rounded-lg text-white">Ver minhas compras</Link>
              <Link to="/catalog" className="border border-border px-6 py-3 rounded-lg text-white hover:border-daig-blue">Continuar comprando</Link>
            </div>
          </div>
        )}

        {step === 'error' && (
          <div className="text-center py-20">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">Erro no Pagamento</h2>
            <p className="text-gray-400 mb-6">{errorMessage}</p>
            <button onClick={() => setStep('details')} className="bg-daig-blue px-6 py-3 rounded-lg text-white">Tentar novamente</button>
          </div>
        )}
      </div>
    </div>
  )
}
