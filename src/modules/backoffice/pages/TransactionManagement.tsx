import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/modules/shared/lib/supabase';
import { useI18n } from '@/modules/shared/lib/i18n';
import { useAuthStore } from '@/modules/identity/store/authStore';
import { Navigate } from 'react-router-dom';
import GaidLogo from '@/modules/shared/components/GaidLogo';
import SafeImage from '@/modules/parts-catalog/components/SafeImage';
import { adminApi } from '@/modules/transactions/api/adminApi';
import { api } from '@/modules/transactions/api/api';
import { 
  ShieldCheck, DollarSign, Wallet, Filter, ArrowUpDown,
  CheckCircle2, Clock, Eye, Sparkles, Save, X, RefreshCw,
  Calendar, Search, Loader2, ArrowUpRight, Lock, Info, Mail, Send
} from 'lucide-react';

// ─── Transaction Detail Modal ──────────────────────────────────────────────────
function TransactionDetailModal({ tx, onClose, onAction, commissionRate, formatMoney }: {
  tx: any;
  onClose: () => void;
  onAction: (id: string, status: string, type: 'payment' | 'fulfillment') => void;
  commissionRate: number;
  formatMoney: (val: number) => string;
}) {
  if (!tx) return null;
  const amount = tx.amount || 0;
  const fee = amount * (commissionRate / 100);
  const sellerNet = amount - fee;
  const createdAt = tx.created_at ? new Date(tx.created_at).toLocaleString('ja-JP', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[#121215] border border-[#27272a] rounded-xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#27272a] bg-[#18181b]">
          <div className="flex items-center gap-2">
            <Eye size={16} className="text-zinc-400" />
            <h3 className="text-sm font-bold text-white">Detalhes da Transação</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3 bg-[#18181b] p-3 rounded-lg border border-[#27272a]">
            <div className="w-14 h-14 rounded-lg bg-black border border-zinc-800 overflow-hidden shrink-0">
              <SafeImage src={tx.part?.images?.[0]} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white font-bold text-sm truncate">{tx.part?.title || 'Peça Automotiva JDM'}</p>
              <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1">
                <Calendar size={11} /> {createdAt}
              </p>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-4 space-y-2.5">
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Detalhamento Financeiro & Taxas Stripe</p>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-zinc-300">
                <span>Valor Total Pago (Stripe):</span>
                <span className="font-bold text-white">{formatMoney(amount)}</span>
              </div>
              <div className="flex justify-between text-amber-400/90">
                <span>Taxa Cartão Stripe Japan (3.6%):</span>
                <span className="font-bold">-{formatMoney(amount * 0.036)}</span>
              </div>
              <div className="flex justify-between text-cyan-400">
                <span>Comissão DAIG ({commissionRate}%):</span>
                <span className="font-bold">+{formatMoney(fee)}</span>
              </div>
              <div className="border-t border-[#27272a] pt-2 flex justify-between text-zinc-200">
                <span className="font-sans font-semibold">Repasse Líquido Vendedor (90%):</span>
                <span className="font-bold text-emerald-400">{formatMoney(sellerNet)}</span>
              </div>
            </div>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-3 space-y-1">
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Comprador</p>
              <p className="text-xs text-white font-semibold truncate">{tx.buyer?.full_name || tx.buyer?.email || 'N/A'}</p>
            </div>
            <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-3 space-y-1">
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Vendedor</p>
              <p className="text-xs text-white font-semibold truncate">{tx.seller?.full_name || tx.seller?.email || 'N/A'}</p>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex items-center gap-3 pt-1">
            <div className="flex-1 space-y-1">
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Pagamento</p>
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold border block text-center ${
                tx.payment_status === 'pending'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : tx.payment_status === 'escrow'
                    ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}>
                {tx.payment_status === 'pending' ? '⏳ Pendente' : tx.payment_status === 'escrow' ? '🔒 Retido em Escrow' : '✅ Concluído'}
              </span>
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">Envio Vendedor (Direct Ship)</p>
              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-[#18181b] text-zinc-300 border border-[#27272a] block text-center">
                {tx.fulfillment_status === 'pending' ? '⏳ Pendente' : tx.fulfillment_status === 'shipped' ? '🚚 Em Trânsito' : tx.fulfillment_status === 'received' ? '📦 Entregue' : '✅ Concluído'}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-[#27272a] bg-[#18181b] flex items-center justify-end gap-3">
          {tx.payment_status === 'escrow' && (
            <button
              onClick={() => { onAction(tx.id, 'completed', 'payment'); onClose(); }}
              className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <ShieldCheck size={14} />
              Liberar Repasse
            </button>
          )}
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-white text-xs font-medium transition-all">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function TransactionManagement() {
  const { user: currentUser } = useAuthStore();
  const { t } = useI18n();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLedgerFilter, setActiveLedgerFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);
  const [commissionRate, setCommissionRate] = useState<number>(10);
  const [tempRate, setTempRate] = useState<string>('10');
  const [savingRate, setSavingRate] = useState(false);
  const [activeStoresCount, setActiveStoresCount] = useState<number>(0);
  const [saasRevenueTotal, setSaasRevenueTotal] = useState<number>(0);

  useEffect(() => {
    fetchTransactions();
    fetchConfig();
    fetchActiveStores();
  }, []);

  const fetchActiveStores = async () => {
    try {
      const { count, error } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' });
      
      if (error) {
        setActiveStoresCount(0);
        setSaasRevenueTotal(0);
        return;
      }

      const storeCount = count || 0;
      setActiveStoresCount(storeCount);
      setSaasRevenueTotal(storeCount * 30000);
    } catch {
      setActiveStoresCount(0);
      setSaasRevenueTotal(0);
    }
  };

  const fetchConfig = async () => {
    try {
      const config = await adminApi.configuracoes.list();
      const rateVal = config?.comissao_taxa || config?.commission_rate;
      if (rateVal) {
        const parsed = parseFloat(rateVal);
        if (!isNaN(parsed)) {
          setCommissionRate(parsed);
          setTempRate(parsed.toString());
        }
      }
    } catch (err) {
      console.error('Erro ao buscar taxa de comissão:', err);
    }
  };

  const handleSaveCommissionRate = async () => {
    const parsed = parseFloat(tempRate);
    if (isNaN(parsed) || parsed < 0 || parsed > 100) {
      alert('Por favor, insira uma taxa válida entre 0 e 100');
      return;
    }
    try {
      setSavingRate(true);
      await adminApi.configuracoes.update('comissao_taxa', parsed.toString());
      setCommissionRate(parsed);
      alert('Taxa de serviço atualizada com sucesso!');
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar taxa');
    } finally {
      setSavingRate(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          id,
          amount,
          payment_status,
          fulfillment_status,
          created_at,
          buyer:profiles!transactions_buyer_id_fkey(email, full_name, rating),
          seller:profiles!transactions_seller_id_fkey(email, full_name, rating),
          part:parts!transactions_part_id_fkey(title, description, price, images)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTransactions(data || []);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const [recoveringId, setRecoveringId] = useState<string | null>(null);

  const handleRecoverTransaction = async (transactionId: string) => {
    try {
      setRecoveringId(transactionId);
      await api.transactions.recover(transactionId);
      alert('📧 E-mail de lembrete de compra e notificação de recuperação de venda disparados com sucesso via Resend!');
    } catch (err: any) {
      alert(`Falha ao disparar e-mail de recuperação: ${err.message || 'Erro de comunicação'}`);
    } finally {
      setRecoveringId(null);
    }
  };

  const updateTransactionStatus = async (transactionId: string, status: string, type: 'payment' | 'fulfillment') => {
    try {
      const updateData = type === 'payment' 
        ? { payment_status: status } 
        : { fulfillment_status: status };
        
      await api.transactions.update(transactionId, updateData);
      
      setTransactions(prev =>
        prev.map(t => 
          t.id === transactionId 
            ? {...t, [type === 'payment' ? 'payment_status' : 'fulfillment_status']: status} 
            : t
        )
      );
    } catch (err: any) {
      setError(err.message || 'Failed to update transaction status');
    }
  };

  // Filtered + searched + sorted transactions
  const filteredTransactions = useMemo(() => {
    let list = [...transactions];

    if (activeLedgerFilter === 'receber') {
      list = list.filter(t => t.payment_status === 'pending' || t.payment_status === 'processing');
    } else if (activeLedgerFilter === 'retido') {
      list = list.filter(t => t.payment_status === 'escrow' || ((t.payment_status === 'paid' || t.payment_status === 'completed') && t.fulfillment_status !== 'delivered' && t.fulfillment_status !== 'completed' && t.fulfillment_status !== 'received'));
    } else if (activeLedgerFilter === 'pagos') {
      list = list.filter(t => (t.payment_status === 'paid' || t.payment_status === 'completed') && (t.fulfillment_status === 'delivered' || t.fulfillment_status === 'completed' || t.fulfillment_status === 'received'));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(t => 
        (t.part?.title || '').toLowerCase().includes(q) ||
        (t.buyer?.full_name || '').toLowerCase().includes(q) ||
        (t.seller?.full_name || '').toLowerCase().includes(q) ||
        (t.buyer?.email || '').toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      const da = new Date(a.created_at).getTime();
      const db = new Date(b.created_at).getTime();
      return sortOrder === 'desc' ? db - da : da - db;
    });

    return list;
  }, [transactions, activeLedgerFilter, searchQuery, sortOrder]);

  const formatMoney = (val: number) => new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(val);

  const aReceberVal = transactions
    .filter(t => t.payment_status === 'pending' || t.payment_status === 'processing')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const retidoValBruto = transactions
    .filter(t => t.payment_status === 'escrow' || ((t.payment_status === 'paid' || t.payment_status === 'completed') && t.fulfillment_status !== 'delivered' && t.fulfillment_status !== 'completed' && t.fulfillment_status !== 'received'))
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const retidoStripeFee = retidoValBruto * 0.036;
  const retidoValLiquido = retidoValBruto - retidoStripeFee;

  const pagosVal = transactions
    .filter(t => (t.payment_status === 'paid' || t.payment_status === 'completed') && (t.fulfillment_status === 'delivered' || t.fulfillment_status === 'completed' || t.fulfillment_status === 'received'))
    .reduce((sum, t) => sum + parseFloat(t.amount || 0) * (1 - commissionRate / 100), 0);

  const lucroBruto = transactions
    .filter(t => t.payment_status === 'paid' || t.payment_status === 'escrow' || t.payment_status === 'completed')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0) * (commissionRate / 100), 0);

  const totalStripeFees = transactions
    .filter(t => t.payment_status === 'paid' || t.payment_status === 'escrow' || t.payment_status === 'completed')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0) * 0.036, 0);

  const receitaSaaS = saasRevenueTotal;
  const lucroLiquidoPlataforma = (lucroBruto - totalStripeFees) + receitaSaaS;

  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 min-h-[60vh]">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-zinc-400 animate-spin mx-auto" />
          <p className="text-xs text-zinc-500">Carregando painel financeiro...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4 text-white">
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-sm">
          <p className="font-semibold">{error}</p>
        </div>
        <button 
          onClick={() => { setError(null); fetchTransactions(); }}
          className="bg-zinc-800 text-white font-bold px-4 py-2 rounded-lg text-sm hover:bg-zinc-700 transition-all"
        >
          {t('Tentar novamente')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-6 space-y-6 text-zinc-200 font-sans pb-20 bg-[#09090b]">
      
      {/* ═══ CLEAN OPERATIONAL HEADER ═══ */}
      <div className="bg-[#121215] border border-[#27272a] p-5 md:p-6 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-[#18181b] border border-[#27272a]">
            <GaidLogo size={36} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">Marketplace Ops • Vendas, Envios & Escrow</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">LIVE JPY</span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">Métricas operacionais exclusivas do Marketplace DAIG: volume de vendas JDM, rastreio de envios, custódia escrow e recebimentos</p>
          </div>
        </div>

        {/* Taxa DAIG Controller */}
        <div className="flex items-center gap-2.5 bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 shrink-0">
          <span className="text-zinc-400 text-xs font-medium">{t('Taxa DAIG:')}</span>
          <input
            type="number"
            value={tempRate}
            onChange={(e) => setTempRate(e.target.value)}
            className="bg-black border border-zinc-700 rounded px-2 py-0.5 text-white font-mono font-bold text-xs w-12 text-center focus:outline-none focus:border-zinc-500"
            min="0"
            max="100"
          />
          <span className="text-zinc-400 font-bold text-xs">%</span>
          <button
            onClick={handleSaveCommissionRate}
            disabled={savingRate}
            className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 text-white rounded text-xs font-semibold transition-all disabled:opacity-50 flex items-center gap-1 ml-1"
          >
            <Save size={12} />
            <span>{savingRate ? '...' : t('Salvar')}</span>
          </button>
        </div>
      </div>

      {/* ═══ CLEAN OPERATIONAL LEDGER CARDS ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: A Receber (Pendente / Abandonada) */}
        <div 
          onClick={() => setActiveLedgerFilter(activeLedgerFilter === 'receber' ? null : 'receber')}
          className={`bg-[#121215] border rounded-xl p-4 cursor-pointer transition-all hover:border-zinc-500 relative group ${
            activeLedgerFilter === 'receber' ? 'border-amber-500/60 bg-amber-500/[0.03]' : 'border-[#27272a]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">{t('A RECEBER')}</span>
              <div className="relative group/tooltip">
                <Info size={12} className="text-zinc-500 hover:text-amber-400 transition-colors" />
                <div className="absolute left-0 bottom-full mb-1 hidden group-hover/tooltip:block w-48 p-2 bg-black border border-zinc-700 text-[10px] text-zinc-300 rounded shadow-xl z-20">
                  Vendas pendentes ou abandonadas no checkout Stripe. Clique para filtrar e disparar e-mail de recuperação via Resend.
                </div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
              <Clock size={10} /> Pendente
            </span>
          </div>
          <p className="text-2xl font-bold text-white font-mono tracking-tight">
            {formatMoney(aReceberVal)}
          </p>
          <p className="text-[11px] text-zinc-500 mt-2">Clique para listar compras pendentes de recuperação</p>
        </div>

        {/* Card 2: Custódia Retida (Escrow no Stripe) */}
        <div 
          onClick={() => setActiveLedgerFilter(activeLedgerFilter === 'retido' ? null : 'retido')}
          className={`bg-[#121215] border rounded-xl p-4 cursor-pointer transition-all hover:border-zinc-500 relative group ${
            activeLedgerFilter === 'retido' ? 'border-sky-500/60 bg-sky-500/[0.03]' : 'border-[#27272a]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">{t('CUSTÓDIA RETIDA STRIPE')}</span>
              <div className="relative group/tooltip">
                <Info size={12} className="text-zinc-500 hover:text-sky-400 transition-colors" />
                <div className="absolute left-0 bottom-full mb-1 hidden group-hover/tooltip:block w-52 p-2 bg-black border border-zinc-700 text-[10px] text-zinc-300 rounded shadow-xl z-20">
                  Fundos retidos com segurança na conta Stripe Escrow JPY até confirmação de entrega pelo cliente.
                </div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center gap-1">
              <Lock size={10} /> Escrow 🔒
            </span>
          </div>
          <p className="text-2xl font-bold text-sky-400 font-mono tracking-tight">
            {formatMoney(retidoValLiquido)}
          </p>
          <div className="pt-2 border-t border-[#27272a] space-y-1 text-[11px] font-mono text-zinc-400">
            <div className="flex justify-between">
              <span>Vendas Brutas Retidas:</span>
              <span className="text-white font-bold">{formatMoney(retidoValBruto)}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxa Stripe (3.6%):</span>
              <span className="text-amber-400">-{formatMoney(retidoStripeFee)}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Pagos ao Vendedor */}
        <div 
          onClick={() => setActiveLedgerFilter(activeLedgerFilter === 'pagos' ? null : 'pagos')}
          className={`bg-[#121215] border rounded-xl p-4 cursor-pointer transition-all hover:border-zinc-500 relative group ${
            activeLedgerFilter === 'pagos' ? 'border-emerald-500/60 bg-emerald-500/[0.03]' : 'border-[#27272a]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">{t('PAGOS AO VENDEDOR')}</span>
              <div className="relative group/tooltip">
                <Info size={12} className="text-zinc-500 hover:text-emerald-400 transition-colors" />
                <div className="absolute left-0 bottom-full mb-1 hidden group-hover/tooltip:block w-48 p-2 bg-black border border-zinc-700 text-[10px] text-zinc-300 rounded shadow-xl z-20">
                  Repasses efetuados aos vendedores via Stripe Connect após conclusão da entrega do pedido.
                </div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <CheckCircle2 size={10} /> Repassado
            </span>
          </div>
          <p className="text-2xl font-bold text-white font-mono tracking-tight">
            {formatMoney(pagosVal)}
          </p>
          <p className="text-[11px] text-zinc-500 mt-2">{(100 - commissionRate)}% repassado via Stripe Connect</p>
        </div>

        {/* Card 4: Lucro Plataforma */}
        <div className="bg-[#121215] border border-[#27272a] rounded-xl p-4 space-y-2 relative group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">{t('LUCRO DA PLATAFORMA')}</span>
              <div className="relative group/tooltip">
                <Info size={12} className="text-zinc-500 hover:text-emerald-400 transition-colors" />
                <div className="absolute right-0 bottom-full mb-1 hidden group-hover/tooltip:block w-56 p-2 bg-black border border-zinc-700 text-[10px] text-zinc-300 rounded shadow-xl z-20">
                  Lucro líquido da DAIG (Comissão de {commissionRate}% sobre vendas - Taxas do Stripe 3.6% + Assinaturas SaaS).
                </div>
              </div>
            </div>
            <DollarSign size={14} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 font-mono tracking-tight">
            {formatMoney(lucroLiquidoPlataforma)}
          </p>
          <div className="pt-2 border-t border-[#27272a] space-y-1 text-[11px] font-mono text-zinc-400">
            <div className="flex justify-between">
              <span>Bruto ({commissionRate}%):</span>
              <span className="text-white">{formatMoney(lucroBruto)}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxas Stripe (3.6%):</span>
              <span className="text-amber-400">-{formatMoney(totalStripeFees)}</span>
            </div>
            <div className="flex justify-between">
              <span>Assinaturas SaaS ({activeStoresCount} Lojas):</span>
              <span className="text-emerald-400">+{formatMoney(receitaSaaS)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* ═══ OPERATIONAL TOOLBAR (Search + Filter + Actions) ═══ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search Bar */}
          <div className="relative">
            <Search size={13} className="text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('Buscar produto, comprador...')}
              className="pl-8 pr-4 py-1.5 bg-[#121215] border border-[#27272a] focus:border-zinc-500 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none w-64 transition-colors"
            />
          </div>

          {/* Active Filter Badge */}
          {activeLedgerFilter && (
            <div className="flex items-center gap-2 bg-[#18181b] border border-[#27272a] rounded-lg px-2.5 py-1">
              <Filter size={11} className="text-zinc-400" />
              <span className="text-[11px] text-white font-semibold uppercase">{activeLedgerFilter === 'receber' ? 'A Receber (Recuperação)' : activeLedgerFilter === 'retido' ? 'Escrow Retido' : 'Pagos'}</span>
              <button onClick={() => setActiveLedgerFilter(null)} className="ml-1 text-zinc-400 hover:text-white">
                <X size={12} />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Sort Order */}
          <button
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#121215] border border-[#27272a] text-xs text-zinc-300 hover:bg-[#18181b] transition-all"
          >
            <ArrowUpDown size={12} />
            <span>{sortOrder === 'desc' ? 'Mais recentes' : 'Mais antigas'}</span>
          </button>

          {/* Refresh */}
          <button
            onClick={fetchTransactions}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#121215] border border-[#27272a] text-xs text-zinc-300 hover:bg-[#18181b] transition-all"
          >
            <RefreshCw size={12} />
            <span>Atualizar</span>
          </button>

          {/* Counter */}
          <span className="px-3 py-1.5 rounded-lg bg-[#121215] border border-[#27272a] text-xs text-zinc-400 font-mono">
            {filteredTransactions.length} de {transactions.length}
          </span>
        </div>
      </div>

      {/* ═══ CLEAN OPERATIONAL TABLE ═══ */}
      <div className="bg-[#121215] border border-[#27272a] rounded-xl overflow-hidden shadow-lg">
        
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 border-b border-[#27272a] bg-[#18181b] text-[10px] text-zinc-400 uppercase tracking-wider font-bold">
          <div className="col-span-5">Peça / Produto</div>
          <div className="col-span-2">Comprador</div>
          <div className="col-span-1 text-right">Valor Total</div>
          <div className="col-span-1 text-center">Taxa DAIG</div>
          <div className="col-span-1 text-center">Status</div>
          <div className="col-span-2 text-right">Ações</div>
        </div>

        {filteredTransactions.length > 0 ? (
          <div className="divide-y divide-[#27272a]">
            {filteredTransactions.map((tx) => (
              <div 
                key={tx.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-5 py-3.5 hover:bg-[#18181b] transition-colors items-center text-xs"
              >
                {/* Product */}
                <div className="col-span-5 flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-md bg-black border border-zinc-800 overflow-hidden shrink-0">
                    <SafeImage src={tx.part?.images?.[0]} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-medium truncate">{tx.part?.title || 'Peça Automotiva JDM'}</p>
                    <p className="text-[10px] text-zinc-500 font-mono">
                      {tx.created_at ? new Date(tx.created_at).toLocaleDateString('ja-JP') : '—'}
                    </p>
                  </div>
                </div>

                {/* Buyer */}
                <div className="col-span-2 text-zinc-300 truncate">
                  {tx.buyer?.full_name || tx.buyer?.email || 'N/A'}
                </div>

                {/* Amount */}
                <div className="col-span-1 text-right font-mono font-bold text-white">
                  {formatMoney(tx.amount || 0)}
                </div>

                {/* Fee */}
                <div className="col-span-1 text-center font-mono text-zinc-400">
                  {formatMoney((tx.amount || 0) * (commissionRate / 100))}
                </div>

                {/* Status */}
                <div className="col-span-1 text-center">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${
                    tx.payment_status === 'pending'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : tx.payment_status === 'escrow'
                        ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    {tx.payment_status === 'pending' ? '⏳ Pendente' : tx.payment_status === 'escrow' ? '🔒 Escrow' : '✅ Concluído'}
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-2 flex items-center gap-2 justify-end">
                  {(tx.payment_status === 'pending' || tx.payment_status === 'processing') && (
                    <button
                      onClick={() => handleRecoverTransaction(tx.id)}
                      disabled={recoveringId === tx.id}
                      className="px-2 py-1 rounded bg-amber-500 hover:bg-amber-400 text-black text-[11px] font-bold transition-all shadow-sm flex items-center gap-1 disabled:opacity-50"
                      title="Disparar e-mail de recuperação de venda via Resend"
                    >
                      <Mail size={11} />
                      {recoveringId === tx.id ? '...' : 'Recuperar'}
                    </button>
                  )}
                  {tx.payment_status === 'escrow' && (
                    <button
                      onClick={() => updateTransactionStatus(tx.id, 'completed', 'payment')}
                      className="px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-black text-[11px] font-bold transition-all shadow-sm"
                    >
                      Liberar 💸
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedTransaction(tx)}
                    className="p-1 rounded bg-[#27272a] hover:bg-[#3f3f46] text-zinc-300 hover:text-white transition-all"
                    title="Ver detalhes"
                  >
                    <Eye size={13} />
                  </button>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 space-y-2">
            <ShieldCheck size={28} className="text-zinc-600 mx-auto" />
            <p className="text-zinc-500 text-xs">{searchQuery ? t('Nenhuma transação encontrada para esta busca.') : t('Nenhuma transação registrada.')}</p>
          </div>
        )}
      </div>

      {/* ═══ DETAIL MODAL ═══ */}
      {selectedTransaction && (
        <TransactionDetailModal
          tx={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          onAction={updateTransactionStatus}
          commissionRate={commissionRate}
          formatMoney={formatMoney}
        />
      )}

    </div>
  );
}