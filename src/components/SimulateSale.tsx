import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { ShoppingCart, Package, Check, X, DollarSign } from 'lucide-react'

interface Part {
  id: string
  title: string
  price: number
  images: string[]
  seller_id: string
  status: string
  brands?: { name: string } | { name: string }[]
  profiles?: { full_name: string } | { full_name: string }[]
}

interface Props {
  onComplete?: () => void
}

export default function SimulateSale({ onComplete }: Props) {
  const { user } = useAuthStore()
  const [parts, setParts] = useState<Part[]>([])
  const [loading, setLoading] = useState(false)
  const [saleResult, setSaleResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    fetchActiveParts()
  }, [])

  const fetchActiveParts = async () => {
    const { data } = await supabase
      .from('parts')
      .select('id, title, price, images, seller_id, status, brands(name), profiles(full_name)')
      .eq('status', 'active')
      .limit(10)
    
    if (data) setParts(data)
  }

  const simulatePurchase = async (part: Part) => {
    if (!user) {
      alert('Por favor, faça login para simular uma compra')
      return
    }

    if (part.seller_id === user.id) {
      alert('Você não pode comprar seu próprio produto')
      return
    }

    setLoading(true)

    try {
      const fees = calculateFees(part.price)

      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          part_id: part.id,
          buyer_id: user.id,
          seller_id: part.seller_id,
          amount: part.price,
          commission_rate: 0.10,
          commission_amount: fees.commission,
          platform_fee: fees.platformFee,
          seller_net: fees.sellerNet,
          payment_status: 'paid',
          fulfillment_status: 'pending',
          paid_at: new Date().toISOString()
        })
        .select()
        .single()

      if (transactionError) throw transactionError

      await supabase
        .from('parts')
        .update({ status: 'sold', sold_at: new Date().toISOString() })
        .eq('id', part.id)

      await supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id: part.seller_id,
        product_id: part.id,
        content: `Olá! Acabei de comprar "${part.title}" por ¥${part.price.toLocaleString('ja-JP')}. Por favor, prepare o envio!`
      })

      await supabase.from('messages').insert({
        sender_id: part.seller_id,
        receiver_id: user.id,
        product_id: part.id,
        content: `Obrigado pela compra! Vou preparar a peça e enviar o código de rastreamento em breve. 🚚`
      })

      setSaleResult({
        success: true,
        message: `Compra simulada com sucesso! ¥${part.price.toLocaleString('ja-JP')} - Transação: ${transaction.id}`
      })

      fetchActiveParts()
      onComplete?.()
    } catch (err: any) {
      setSaleResult({
        success: false,
        message: err.message || 'Erro ao simular compra'
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateFees = (amount: number) => {
    const commissionRate = 0.10
    const stripeRate = 0.029
    const stripeFixed = 30
    
    const commission = amount * commissionRate
    const stripeFee = (amount * stripeRate) + stripeFixed
    const sellerNet = amount - commission - stripeFee
    
    return { commission, stripeFee, platformFee: 0, sellerNet }
  }

  if (!user) {
    return (
      <div className="card p-6 text-center">
        <ShoppingCart className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">Faça login para simular vendas</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <h3 className="text-white font-semibold mb-2 flex items-center">
          <ShoppingCart className="w-5 h-5 mr-2 text-[#ff3d00]" />
          Simular Compra (Demo)
        </h3>
        <p className="text-gray-400 text-sm">
          Clique em uma peça abaixo para simular uma compra instantânea. 
          Uma transação será criada e uma conversa será iniciada com o vendedor.
        </p>
      </div>

      {parts.length === 0 ? (
        <div className="card p-6 text-center">
          <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Nenhuma peça disponível para compra</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {parts.map(part => (
            <div key={part.id} className="card p-4 flex items-center space-x-4">
              <div className="w-16 h-16 bg-[#0a0a0a] rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                {part.images?.[0] ? (
                  <img src={part.images[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Package className="w-8 h-8 text-gray-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{part.title}</p>
                <p className="text-gray-400 text-sm">
                  {Array.isArray(part.brands) ? part.brands[0]?.name : part.brands?.name}
                </p>
                <p className="text-[#ff3d00] font-bold">¥ {part.price.toLocaleString('ja-JP')}</p>
              </div>
              <button
                onClick={() => simulatePurchase(part)}
                disabled={loading || part.seller_id === user.id}
                className="bg-[#ff3d00] hover:bg-[#dd2c00] text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50 flex items-center"
              >
                <DollarSign className="w-4 h-4 mr-1" />
                Comprar
              </button>
            </div>
          ))}
        </div>
      )}

      {saleResult && (
        <div className={`card p-4 flex items-center ${saleResult.success ? 'border-green-500' : 'border-red-500'}`}>
          {saleResult.success ? (
            <Check className="w-6 h-6 text-green-500 mr-3" />
          ) : (
            <X className="w-6 h-6 text-red-500 mr-3" />
          )}
          <p className={`${saleResult.success ? 'text-green-400' : 'text-red-400'}`}>
            {saleResult.message}
          </p>
        </div>
      )}
    </div>
  )
}