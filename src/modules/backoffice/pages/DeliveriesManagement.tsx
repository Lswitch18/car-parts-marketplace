import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useAuthStore } from '@/modules/identity/store/authStore'
import { supabase } from '@/modules/shared/lib/supabase'
import GaidLogo from '@/modules/shared/components/GaidLogo'
import { useI18n } from '@/modules/shared/lib/i18n'
import { 
  Package, Truck, CheckCircle2, Clock, AlertTriangle, Search, 
  Filter, ShieldCheck, ArrowRight, ExternalLink, RefreshCw, Loader2, 
  MapPin, User, Building2, ChevronRight, Eye, Check, X, FileText
} from 'lucide-react'

export interface DeliveryTransaction {
  id: string
  created_at: string
  amount: number
  payment_status: 'pending' | 'escrow' | 'paid' | 'completed'
  fulfillment_status: 'pending' | 'shipped' | 'received' | 'completed'
  tracking_number?: string
  carrier_name?: string
  shipping_address?: string
  part_title?: string
  seller_name?: string
  buyer_name?: string
  confirmed_by_buyer_at?: string
}

export default function DeliveriesManagement() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'shipped' | 'received'>('all')
  const [deliveries, setDeliveries] = useState<DeliveryTransaction[] >([])
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryTransaction | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // Modal para Despacho pelo Vendedor
  const [dispatchModalTx, setDispatchModalTx] = useState<DeliveryTransaction | null>(null)
  const [trackingCodeInput, setTrackingCodeInput] = useState('')
  const [carrierInput, setCarrierInput] = useState('Japan Post (JP Post)')

  useEffect(() => {
    fetchDeliveries()
  }, [])

  const handleConfirmSellerDispatch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!dispatchModalTx) return

    try {
      setUpdatingId(dispatchModalTx.id)
      const trackCode = trackingCodeInput || `JP-${dispatchModalTx.id.substring(0, 8).toUpperCase()}`

      await supabase
        .from('transactions')
        .update({
          fulfillment_status: 'shipped',
          tracking_number: trackCode,
          carrier_name: carrierInput
        })
        .eq('id', dispatchModalTx.id)

      setDeliveries(prev => prev.map(d => d.id === dispatchModalTx.id ? {
        ...d,
        fulfillment_status: 'shipped',
        tracking_number: trackCode,
        carrier_name: carrierInput
      } : d))

      setDispatchModalTx(null)
    } catch (err) {
      console.error('Erro ao confirmar despacho do vendedor:', err)
    } finally {
      setUpdatingId(null)
    }
  }

  const fetchDeliveries = async () => {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('transactions')
        .select(`
          id,
          amount,
          payment_status,
          fulfillment_status,
          created_at,
          buyer:profiles!transactions_buyer_id_fkey(id, full_name),
          seller:profiles!transactions_seller_id_fkey(id, full_name),
          part:parts!transactions_part_id_fkey(title)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      let rows = data || []
      if (rows.length > 0) {
        const profileIds = Array.from(
          new Set(rows.flatMap((tx: any) => [tx.buyer?.id, tx.seller?.id]).filter(Boolean))
        )
        if (profileIds.length > 0) {
          const { data: profiles, error: profilesError } = await supabase
            .from('admin_profiles')
            .select('id, email, store_name')
            .in('id', profileIds)
          if (!profilesError) {
            const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]))
            rows = rows.map((tx: any) => {
              const buyer = tx.buyer ? { ...tx.buyer, email: profileMap.get(tx.buyer.id)?.email } : tx.buyer
              const seller = tx.seller ? { ...tx.seller, email: profileMap.get(tx.seller.id)?.email, store_name: profileMap.get(tx.seller.id)?.store_name } : tx.seller
              return { ...tx, buyer, seller }
            })
          }
        }
      }

      if (rows.length > 0) {
        const formatted: DeliveryTransaction[] = rows.map((tx: any) => ({
          id: tx.id,
          created_at: tx.created_at,
          amount: parseFloat(tx.amount || 0),
          payment_status: tx.payment_status || 'escrow',
          fulfillment_status: tx.fulfillment_status || 'shipped',
          tracking_number: tx.fulfillment_status === 'shipped' || tx.fulfillment_status === 'received' ? `JP-${tx.id.substring(0, 8).toUpperCase()}` : undefined,
          carrier_name: 'Japan Post (JP Post)',
          shipping_address: 'Tokyo, Minato-ku 106-0032',
          part_title: tx.part?.title || tx.parts?.title || 'Kit Tampas de Válvula JDM',
          seller_name: tx.seller?.store_name || tx.seller?.full_name || 'Vendedor JDM Japão',
          buyer_name: tx.buyer?.full_name || tx.buyer?.email || 'Comprador Marketplace',
          confirmed_by_buyer_at: tx.fulfillment_status === 'received' || tx.fulfillment_status === 'completed' ? tx.created_at : undefined
        }))
        setDeliveries(formatted)
      } else {
        // Fallback demo data
        setDeliveries([
          {
            id: '1b09683e-b511-4ae2-ab97-99d048f8c661',
            created_at: new Date().toISOString(),
            amount: 100,
            payment_status: 'paid',
            fulfillment_status: 'received',
            tracking_number: 'JP-1B09683E',
            carrier_name: 'Japan Post',
            shipping_address: 'Shibuya, Tokyo',
            part_title: 'Kit Tampas de Válvula de Pneu Alumínio Vermelho JDM (4 Unidades)',
            seller_name: 'Desmanche Tokyo JDM',
            buyer_name: 'Patrick DAIG',
            confirmed_by_buyer_at: new Date().toISOString()
          }
        ])
      }
    } catch (err) {
      console.error('Erro ao buscar entregas do marketplace:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmBuyerReceipt = async (txId: string) => {
    try {
      setUpdatingId(txId)

      // Update delivery and payment status in Supabase
      await supabase
        .from('transactions')
        .update({
          fulfillment_status: 'received',
          payment_status: 'completed'
        })
        .eq('id', txId)

      setDeliveries(prev => prev.map(d => d.id === txId ? {
        ...d,
        fulfillment_status: 'received',
        payment_status: 'completed',
        confirmed_by_buyer_at: new Date().toISOString()
      } : d))

      if (selectedDelivery?.id === txId) {
        setSelectedDelivery(prev => prev ? {
          ...prev,
          fulfillment_status: 'received',
          payment_status: 'completed',
          confirmed_by_buyer_at: new Date().toISOString()
        } : null)
      }
    } catch (err) {
      console.error('Erro ao confirmar recebimento:', err)
    } finally {
      setUpdatingId(null)
    }
  }

  const formatMoney = (val: number) => new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(val)

  const filteredDeliveries = deliveries.filter(d => {
    const matchSearch = 
      d.part_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.buyer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.seller_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.tracking_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.id.toLowerCase().includes(searchQuery.toLowerCase())

    const matchStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'pending' && d.fulfillment_status === 'pending') ||
      (statusFilter === 'shipped' && d.fulfillment_status === 'shipped') ||
      (statusFilter === 'received' && (d.fulfillment_status === 'received' || d.fulfillment_status === 'completed'))

    return matchSearch && matchStatus
  })

  const counts = {
    pending: deliveries.filter(d => d.fulfillment_status === 'pending').length,
    shipped: deliveries.filter(d => d.fulfillment_status === 'shipped').length,
    received: deliveries.filter(d => d.fulfillment_status === 'received' || d.fulfillment_status === 'completed').length,
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-6 space-y-6 text-zinc-200 font-sans pb-20 bg-[#09090b]">
      
      {/* ═══ TOP BRANDING BAR ═══ */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-3">
          <GaidLogo size={32} />
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
            <CheckCircle2 size={12} strokeWidth={2.5} /> Gestão de Entregas & Direct Ship
          </span>
        </div>
      </div>

      {/* ═══ HEADER ═══ */}
      <div className="bg-[#121215] border border-[#27272a] p-4 md:p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-400" />
            Marketplace Entregas & Rastreamento
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Fluxo Direct Ship: Envio direto pelo vendedor japonês e confirmação de recebimento efetuada pelo comprador.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-[#18181b] border border-[#27272a] px-3 py-1.5 rounded-lg text-xs">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span className="text-zinc-300 font-medium">Liberação Escrow via Confirmação do Comprador</span>
        </div>
      </div>

      {/* ═══ METRICS CARDS (3 CARDS) ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Card 1: Aguardando Envio Vendedor */}
        <div className="bg-[#121215] border border-[#27272a] rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Aguardando Envio Vendedor</span>
            <Clock size={14} className="text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white font-mono tracking-tight">
            {counts.pending} <span className="text-xs text-zinc-400 font-normal">pedidos</span>
          </p>
          <p className="text-[11px] text-zinc-500">Vendedor deve postar o item no Japão</p>
        </div>

        {/* Card 2: Em Trânsito Direct Ship */}
        <div className="bg-[#121215] border border-[#27272a] rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Em Trânsito (Direct Ship)</span>
            <Truck size={14} className="text-sky-400" />
          </div>
          <p className="text-2xl font-bold text-sky-400 font-mono tracking-tight">
            {counts.shipped} <span className="text-xs text-zinc-400 font-normal">em trânsito</span>
          </p>
          <p className="text-[11px] text-zinc-500">Postado via Japan Post / Transportadora</p>
        </div>

        {/* Card 3: Recebido & Confirmado Comprador */}
        <div className="bg-[#121215] border border-[#27272a] rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Confirmado pelo Comprador</span>
            <CheckCircle2 size={14} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 font-mono tracking-tight">
            {counts.received} <span className="text-xs text-zinc-400 font-normal">concluídos</span>
          </p>
          <p className="text-[11px] text-zinc-500">Comprador confirmou recebimento ➔ Escrow liberado</p>
        </div>

      </div>

      {/* ═══ FILTER BAR ═══ */}
      <div className="bg-[#121215] border border-[#27272a] p-4 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={13} className="text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar peça, comprador, vendedor ou código de rastreio..."
            className="w-full pl-9 pr-4 py-2 bg-[#18181b] border border-[#27272a] focus:border-zinc-500 rounded-lg text-xs text-white placeholder-zinc-500 outline-none transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#18181b] border border-[#27272a] rounded-lg px-2 py-1">
            <Filter size={12} className="text-zinc-400" />
            <span className="text-xs text-zinc-400 font-medium">Status da Entrega:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent text-xs text-white outline-none cursor-pointer"
            >
              <option value="all" className="bg-zinc-900">Todas as Entregas</option>
              <option value="pending" className="bg-zinc-900">Aguardando Envio ⏳</option>
              <option value="shipped" className="bg-zinc-900">Em Trânsito 🚚</option>
              <option value="received" className="bg-zinc-900">Recebido Comprador ✅</option>
            </select>
          </div>
        </div>
      </div>

      {/* ═══ TABLE OF DELIVERIES ═══ */}
      <div className="bg-[#121215] border border-[#27272a] rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#27272a] bg-[#18181b]/50 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                <th className="py-3 px-4">Peça / Produto</th>
                <th className="py-3 px-4">Vendedor (Japão)</th>
                <th className="py-3 px-4">Comprador</th>
                <th className="py-3 px-4">Rastreamento Direct Ship</th>
                <th className="py-3 px-4 text-center">Status da Entrega</th>
                <th className="py-3 px-4 text-right">Ação Suporte Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    <Loader2 className="w-6 h-6 text-emerald-400 animate-spin mx-auto mb-2" />
                    Carregando entregas do marketplace...
                  </td>
                </tr>
              ) : filteredDeliveries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    Nenhuma entrega encontrada para os filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredDeliveries.map((tx) => {
                  const isReceived = tx.fulfillment_status === 'received' || tx.fulfillment_status === 'completed'
                  const isShipped = tx.fulfillment_status === 'shipped'

                  return (
                    <tr key={tx.id} className="hover:bg-[#18181b]/40 transition-colors">
                      
                      {/* Peça */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-white max-w-xs truncate">{tx.part_title}</div>
                        <div className="text-[10px] font-mono text-zinc-500">ID: {tx.id.substring(0, 13)}...</div>
                      </td>

                      {/* Vendedor */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-zinc-200 flex items-center gap-1.5">
                          <Building2 size={13} className="text-zinc-400" />
                          <span>{tx.seller_name}</span>
                        </div>
                      </td>

                      {/* Comprador */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-zinc-200 flex items-center gap-1.5">
                          <User size={13} className="text-zinc-400" />
                          <span>{tx.buyer_name}</span>
                        </div>
                      </td>

                      {/* Rastreio */}
                      <td className="py-3 px-4 font-mono">
                        {tx.tracking_number ? (
                          <div className="space-y-0.5">
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <Truck size={12} /> {tx.tracking_number}
                            </span>
                            <span className="text-[10px] text-zinc-500 block">{tx.carrier_name}</span>
                          </div>
                        ) : (
                          <span className="text-zinc-500 italic">Pendente de postagem</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        {isReceived ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                            <CheckCircle2 size={10} /> Confirmado pelo Comprador ✅
                          </span>
                        ) : isShipped ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 inline-flex items-center gap-1">
                            <Truck size={10} /> Em Trânsito (Direct Ship) 🚚
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 inline-flex items-center gap-1">
                            <Clock size={10} /> Aguardando Postagem ⏳
                          </span>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedDelivery(tx)}
                          className="px-2.5 py-1 bg-[#18181b] hover:bg-[#27272a] text-zinc-300 rounded-lg text-xs font-semibold transition border border-[#27272a] inline-flex items-center gap-1"
                        >
                          <Eye size={12} /> Detalhes
                        </button>

                        {!isShipped && !isReceived && (
                          <button
                            onClick={() => {
                              setDispatchModalTx(tx)
                              setTrackingCodeInput(`JP-${tx.id.substring(0, 8).toUpperCase()}`)
                            }}
                            className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-lg text-xs font-bold transition inline-flex items-center gap-1"
                          >
                            <Truck size={12} /> Despachar (Vendedor)
                          </button>
                        )}

                        {isShipped && !isReceived && (
                          <button
                            onClick={() => handleConfirmBuyerReceipt(tx.id)}
                            disabled={updatingId === tx.id}
                            className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-bold transition inline-flex items-center gap-1 disabled:opacity-50"
                          >
                            {updatingId === tx.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                            <span>Confirmar Recebimento</span>
                          </button>
                        )}
                      </td>

                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══ MODAL DETALHES DA ENTREGA ═══ */}
      {selectedDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#121215] border border-[#27272a] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl space-y-4 p-6">
            
            <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-400" />
                Detalhes da Entrega Direct Ship
              </h3>
              <button onClick={() => setSelectedDelivery(null)} className="text-zinc-500 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-[#18181b] p-3 rounded-lg border border-[#27272a] space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase font-mono font-bold">Produto / Peça</span>
                <p className="font-bold text-white text-sm">{selectedDelivery.part_title}</p>
                <p className="font-mono text-emerald-400 font-bold">{formatMoney(selectedDelivery.amount)}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#18181b] p-3 rounded-lg border border-[#27272a]">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono font-bold">Vendedor (Japão)</span>
                  <p className="font-semibold text-zinc-200 mt-0.5">{selectedDelivery.seller_name}</p>
                </div>
                <div className="bg-[#18181b] p-3 rounded-lg border border-[#27272a]">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono font-bold">Comprador</span>
                  <p className="font-semibold text-zinc-200 mt-0.5">{selectedDelivery.buyer_name}</p>
                </div>
              </div>

              <div className="bg-[#18181b] p-3 rounded-lg border border-[#27272a] space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase font-mono font-bold">Rastreio Direct Ship</span>
                <p className="font-mono text-emerald-400 font-bold flex items-center gap-1">
                  <Truck size={13} /> {selectedDelivery.tracking_number || 'Sem rastreio'}
                </p>
                <p className="text-zinc-400 text-[11px]">{selectedDelivery.carrier_name}</p>
              </div>

              <div className="bg-[#18181b] p-3 rounded-lg border border-[#27272a] space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase font-mono font-bold">Status do Escrow</span>
                <p className="font-semibold text-white">
                  {selectedDelivery.fulfillment_status === 'received' || selectedDelivery.fulfillment_status === 'completed' ? (
                    <span className="text-emerald-400 font-bold">✅ Recebimento Confirmado pelo Comprador (Pagamento Repassado)</span>
                  ) : (
                    <span className="text-sky-400 font-bold">🔒 Retido em Escrow (Aguardando comprador confirmar recebimento)</span>
                  )}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#27272a] flex justify-end gap-2">
              <button
                onClick={() => setSelectedDelivery(null)}
                className="px-4 py-2 bg-[#18181b] hover:bg-[#27272a] text-zinc-300 rounded-xl font-semibold transition text-xs"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ═══ MODAL DESPACHO PELO VENDEDOR (DIRECT SHIP) ═══ */}
      {dispatchModalTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#121215] border border-[#27272a] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl space-y-4 p-6">
            
            <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-400" />
                Confirmar Despacho do Vendedor (Direct Ship)
              </h3>
              <button onClick={() => setDispatchModalTx(null)} className="text-zinc-500 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmSellerDispatch} className="space-y-4 text-xs">
              <div className="bg-[#18181b] p-3 rounded-lg border border-[#27272a] space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase font-mono font-bold">Produto / Peça</span>
                <p className="font-bold text-white">{dispatchModalTx.part_title}</p>
                <p className="text-[11px] text-zinc-400">Vendedor: <span className="text-zinc-200 font-semibold">{dispatchModalTx.seller_name}</span></p>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Código de Rastreamento (Japan Post / Transportadora)</label>
                <input
                  type="text"
                  required
                  value={trackingCodeInput}
                  onChange={(e) => setTrackingCodeInput(e.target.value)}
                  placeholder="Ex: JP-1B09683E ou 1234567890"
                  className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-white font-mono outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Transportadora Utilizada</label>
                <select
                  value={carrierInput}
                  onChange={(e) => setCarrierInput(e.target.value)}
                  className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-white outline-none focus:border-amber-500"
                >
                  <option value="Japan Post (JP Post)">Japan Post (Japan Post / 郵便局)</option>
                  <option value="Yamato Transport (Kuroneko)">Yamato Transport (ヤマト運輸)</option>
                  <option value="Sagawa Express">Sagawa Express (佐川急便)</option>
                  <option value="Outra Transportadora Direct Ship">Outra Transportadora</option>
                </select>
              </div>

              <div className="pt-3 border-t border-[#27272a] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDispatchModalTx(null)}
                  className="px-4 py-2 bg-[#18181b] hover:bg-[#27272a] text-zinc-300 rounded-xl font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={updatingId === dispatchModalTx.id}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl font-bold transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {updatingId === dispatchModalTx.id && <Loader2 size={14} className="animate-spin" />}
                  <span>Confirmar Despacho 🚚</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  )
}
