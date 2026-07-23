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
  ArrowRight, ChevronDown, Download, Calendar, Search, Loader2
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[#0D0D14] border border-[#00E5FF]/30 rounded-2xl w-full max-w-lg shadow-2xl shadow-[#00E5FF]/10 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Eye size={16} className="text-[#00E5FF]" /> Detalhes da Transação
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-5 space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-black/40 border border-white/10 overflow-hidden shrink-0">
              <SafeImage src={tx.part?.images?.[0]} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <p className="text-white font-bold text-sm truncate">{tx.part?.title || 'Peça Automotiva JDM'}</p>
              <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1">
                <Calendar size={10} /> {createdAt}
              </p>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-3">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Breakdown Financeiro</p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Valor Bruto</span>
                <span className="font-mono font-bold text-white">{formatMoney(amount)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Taxa DAIG ({commissionRate}%)</span>
                <span className="font-mono font-bold text-[#00E5FF]">-{formatMoney(fee)}</span>
              </div>
              <div className="border-t border-white/5 pt-2 flex justify-between text-gray-300">
                <span className="font-semibold">Líquido p/ Vendedor</span>
                <span className="font-mono font-bold text-white">{formatMoney(sellerNet)}</span>
              </div>
            </div>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 space-y-1">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Comprador</p>
              <p className="text-xs text-white font-semibold truncate">{tx.buyer?.full_name || tx.buyer?.email || 'N/A'}</p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 space-y-1">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Vendedor</p>
              <p className="text-xs text-white font-semibold truncate">{tx.seller?.full_name || tx.seller?.email || 'N/A'}</p>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="space-y-1">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Pagamento</p>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 inline-block">
                {tx.payment_status === 'pending' ? '⏳ Pendente' : tx.payment_status === 'escrow' ? '🔒 Escrow' : tx.payment_status === 'completed' ? '✅ Concluído' : tx.payment_status}
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Entrega</p>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/5 text-white border border-white/10 inline-block">
                {tx.fulfillment_status === 'pending' ? '⏳ Pendente' : tx.fulfillment_status === 'shipped' ? '🚚 Enviado' : tx.fulfillment_status === 'received' ? '📦 Recebido' : '✅ Concluído'}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-5 border-t border-white/5 flex items-center gap-3">
          {tx.payment_status === 'escrow' && (
            <button
              onClick={() => { onAction(tx.id, 'completed', 'payment'); onClose(); }}
              className="flex-1 bg-[#00E5FF] hover:bg-[#00E5FF]/80 text-black py-2.5 rounded-xl text-xs font-extrabold transition-all shadow-md shadow-[#00E5FF]/20 flex items-center justify-center gap-2"
            >
              <ShieldCheck size={14} />
              Liberar Repasse ao Vendedor
            </button>
          )}
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition-all">
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
  const [custoTerceiros, setCustoTerceiros] = useState<number>(152000);

  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    fetchTransactions();
    fetchConfig();
    fetchTerceiros();
  }, []);

  const fetchTerceiros = async () => {
    try {
      const { data } = await supabase
        .from('admin_logistica_terceiros')
        .select('valor_contrato')
        .eq('ativo', true);
      if (data && data.length > 0) {
        const sum = data.reduce((acc, curr) => acc + Number(curr.valor_contrato), 0);
        setCustoTerceiros(sum);
      } else {
        setCustoTerceiros(152000);
      }
    } catch (e) {
      setCustoTerceiros(152000);
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

    // Ledger filter
    if (activeLedgerFilter === 'receber') {
      list = list.filter(t => t.payment_status === 'pending' || t.payment_status === 'processing');
    } else if (activeLedgerFilter === 'retido') {
      list = list.filter(t => t.payment_status === 'escrow' || (t.payment_status === 'paid' && t.fulfillment_status !== 'delivered' && t.fulfillment_status !== 'completed'));
    } else if (activeLedgerFilter === 'pagos') {
      list = list.filter(t => t.payment_status === 'paid' && (t.fulfillment_status === 'delivered' || t.fulfillment_status === 'completed'));
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(t => 
        (t.part?.title || '').toLowerCase().includes(q) ||
        (t.buyer?.full_name || '').toLowerCase().includes(q) ||
        (t.seller?.full_name || '').toLowerCase().includes(q) ||
        (t.buyer?.email || '').toLowerCase().includes(q)
      );
    }

    // Sort
    list.sort((a, b) => {
      const da = new Date(a.created_at).getTime();
      const db = new Date(b.created_at).getTime();
      return sortOrder === 'desc' ? db - da : da - db;
    });

    return list;
  }, [transactions, activeLedgerFilter, searchQuery, sortOrder]);

  const formatMoney = (val: number) => new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(val);

  // Ledger calculations (always from full transactions list)
  const aReceberVal = transactions
    .filter(t => t.payment_status === 'pending' || t.payment_status === 'processing')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const retidoVal = transactions
    .filter(t => t.payment_status === 'escrow' || (t.payment_status === 'paid' && t.fulfillment_status !== 'delivered' && t.fulfillment_status !== 'completed'))
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const pagosVal = transactions
    .filter(t => t.payment_status === 'paid' && (t.fulfillment_status === 'delivered' || t.fulfillment_status === 'completed'))
    .reduce((sum, t) => sum + parseFloat(t.amount || 0) * (1 - commissionRate / 100), 0);

  const lucroBruto = transactions
    .filter(t => t.payment_status === 'paid' || t.payment_status === 'escrow')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0) * (commissionRate / 100), 0);

  const lucroLiquido = lucroBruto - custoTerceiros;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 min-h-[60vh]">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#00E5FF] animate-spin mx-auto" />
          <p className="text-xs text-gray-500">Carregando transações...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4 text-white">
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
          <p className="font-semibold">{error}</p>
        </div>
        <button 
          onClick={() => { setError(null); fetchTransactions(); }}
          className="bg-[#00E5FF] text-black font-bold px-4 py-2 rounded-xl text-sm hover:bg-[#00E5FF]/80 transition-all"
        >
          {t('Tentar novamente')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-6 space-y-6 text-[#EDEDED] font-sans pb-20">
      
      {/* ═══ HEADER ═══ */}
      <div className="relative overflow-hidden bg-[#0D0D14]/80 p-6 md:p-8 rounded-2xl border border-[#00E5FF]/20 backdrop-blur-xl">
        <div className="absolute -left-20 -top-20 w-60 h-60 bg-[#00E5FF]/5 rounded-full blur-3xl" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 shadow-lg shadow-[#00E5FF]/10">
              <GaidLogo size={42} animated />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] text-xs font-bold mb-1.5">
                <Sparkles className="w-3 h-3 animate-pulse" /> Financial Escrow Center
              </div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-cyan-200 to-[#00E5FF] bg-clip-text text-transparent">
                Transações & Custódia JPY
              </h1>
            </div>
          </div>

          {/* Taxa Controller */}
          <div className="flex items-center gap-3 bg-[#07070A] border border-[#00E5FF]/20 rounded-xl px-4 py-2.5 shrink-0">
            <span className="text-gray-400 text-xs font-semibold">{t('Taxa DAIG:')}</span>
            <input
              type="number"
              value={tempRate}
              onChange={(e) => setTempRate(e.target.value)}
              className="bg-[#0D0D14] border border-[#00E5FF]/30 rounded-lg px-2.5 py-1 text-white font-mono font-bold text-sm w-14 text-center focus:outline-none focus:border-[#00E5FF]"
              min="0"
              max="100"
            />
            <span className="text-[#00E5FF] font-bold text-sm">%</span>
            <button
              onClick={handleSaveCommissionRate}
              disabled={savingRate}
              className="px-3 py-1.5 bg-[#00E5FF] hover:bg-[#00E5FF]/80 text-black rounded-lg text-xs font-extrabold transition-all disabled:opacity-50 shadow-md shadow-[#00E5FF]/20 flex items-center gap-1"
            >
              <Save size={12} />
              <span>{savingRate ? '...' : t('Salvar')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ═══ 4 LEDGER CARDS ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: A Receber */}
        <div 
          onClick={() => setActiveLedgerFilter(activeLedgerFilter === 'receber' ? null : 'receber')}
          className={`bg-[#0D0D14] border rounded-2xl p-5 shadow-xl cursor-pointer transition-all hover:scale-[1.02] group relative overflow-hidden ${
            activeLedgerFilter === 'receber' ? 'border-[#00E5FF] ring-1 ring-[#00E5FF]/30' : 'border-[#00E5FF]/15 hover:border-[#00E5FF]/60'
          }`}
        >
          <div className="absolute -right-8 -top-8 w-28 h-28 bg-[#00E5FF]/5 rounded-full blur-2xl group-hover:bg-[#00E5FF]/15 transition-all duration-500" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/20 flex items-center justify-center text-[#00E5FF]">
                <Clock size={18} />
              </div>
              <span className="text-[10px] font-bold text-[#00E5FF] bg-[#00E5FF]/10 border border-[#00E5FF]/20 px-2 py-0.5 rounded-full">
                Pendente
              </span>
            </div>
            <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider">{t('A RECEBER')}</p>
            <p className="text-xl font-black text-white mt-1 group-hover:text-[#00E5FF] transition-colors font-mono">
              {formatMoney(aReceberVal)}
            </p>
          </div>
        </div>

        {/* Card 2: Escrow */}
        <div 
          onClick={() => setActiveLedgerFilter(activeLedgerFilter === 'retido' ? null : 'retido')}
          className={`bg-[#0D0D14] border rounded-2xl p-5 shadow-xl cursor-pointer transition-all hover:scale-[1.02] group relative overflow-hidden ${
            activeLedgerFilter === 'retido' ? 'border-[#00E5FF] ring-1 ring-[#00E5FF]/30' : 'border-[#00E5FF]/15 hover:border-[#00E5FF]/60'
          }`}
        >
          <div className="absolute -right-8 -top-8 w-28 h-28 bg-[#00E5FF]/5 rounded-full blur-2xl group-hover:bg-[#00E5FF]/15 transition-all duration-500" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/20 flex items-center justify-center text-[#00E5FF]">
                <ShieldCheck size={18} />
              </div>
              <span className="text-[10px] font-bold text-[#00E5FF] bg-[#00E5FF]/10 border border-[#00E5FF]/20 px-2 py-0.5 rounded-full">
                Escrow 🔒
              </span>
            </div>
            <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider">{t('CUSTÓDIA RETIDA')}</p>
            <p className="text-xl font-black text-[#00E5FF] mt-1 font-mono">
              {formatMoney(retidoVal)}
            </p>
          </div>
        </div>

        {/* Card 3: Pagos */}
        <div 
          onClick={() => setActiveLedgerFilter(activeLedgerFilter === 'pagos' ? null : 'pagos')}
          className={`bg-[#0D0D14] border rounded-2xl p-5 shadow-xl cursor-pointer transition-all hover:scale-[1.02] group relative overflow-hidden ${
            activeLedgerFilter === 'pagos' ? 'border-[#00E5FF] ring-1 ring-[#00E5FF]/30' : 'border-[#00E5FF]/15 hover:border-[#00E5FF]/60'
          }`}
        >
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/20 flex items-center justify-center text-[#00E5FF]">
                <Wallet size={18} />
              </div>
              <span className="text-[10px] font-bold text-[#00E5FF] bg-[#00E5FF]/10 border border-[#00E5FF]/20 px-2 py-0.5 rounded-full">
                Repassado
              </span>
            </div>
            <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider">{t('PAGOS AO VENDEDOR')}</p>
            <p className="text-xl font-black text-white mt-1 group-hover:text-[#00E5FF] transition-colors font-mono">
              {formatMoney(pagosVal)}
            </p>
          </div>
        </div>

        {/* Card 4: Lucro */}
        <div className="bg-[#0D0D14] border border-[#00E5FF]/15 rounded-2xl p-5 shadow-xl space-y-2 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-28 h-28 bg-[#00E5FF]/5 rounded-full blur-2xl" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider">{t('LUCRO PLATAFORMA')}</p>
              <DollarSign size={14} className="text-[#00E5FF]" />
            </div>
            <p className={`text-xl font-black font-mono mt-1 ${lucroLiquido >= 0 ? 'text-[#00E5FF]' : 'text-red-400'}`}>
              {formatMoney(lucroLiquido)}
            </p>
            <div className="pt-2 mt-2 border-t border-white/5 space-y-1 text-[11px] text-gray-500">
              <div className="flex justify-between">
                <span>Bruto ({commissionRate}%):</span>
                <span className="font-mono text-white">{formatMoney(lucroBruto)}</span>
              </div>
              <div className="flex justify-between">
                <span>Contratos:</span>
                <span className="font-mono text-red-400">-{formatMoney(custoTerceiros)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ═══ TOOLBAR (Search + Filter + Sort) ═══ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search size={13} className="text-[#00E5FF] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('Buscar peça, comprador...')}
              className="pl-8 pr-4 py-2 bg-[#0D0D14] border border-white/10 focus:border-[#00E5FF]/40 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none w-56 transition-colors"
            />
          </div>

          {/* Active Filter Banner */}
          {activeLedgerFilter && (
            <div className="flex items-center gap-2 bg-[#00E5FF]/10 border border-[#00E5FF]/20 rounded-xl px-3 py-1.5">
              <Filter size={12} className="text-[#00E5FF]" />
              <span className="text-[11px] text-[#00E5FF] font-bold uppercase">{activeLedgerFilter === 'receber' ? 'A Receber' : activeLedgerFilter === 'retido' ? 'Escrow Retido' : 'Pagos'}</span>
              <button onClick={() => setActiveLedgerFilter(null)} className="ml-1 p-0.5 rounded hover:bg-white/10 text-[#00E5FF]">
                <X size={12} />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Sort Toggle */}
          <button
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0D0D14] border border-white/10 text-xs text-gray-400 hover:text-white hover:border-white/20 transition-all"
          >
            <ArrowUpDown size={12} />
            <span>{sortOrder === 'desc' ? 'Mais recentes' : 'Mais antigas'}</span>
          </button>

          {/* Refresh */}
          <button
            onClick={fetchTransactions}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0D0D14] border border-white/10 text-xs text-[#00E5FF] hover:border-[#00E5FF]/30 transition-all"
          >
            <RefreshCw size={12} />
            <span>Atualizar</span>
          </button>

          {/* Counter */}
          <span className="px-3 py-2 rounded-xl bg-[#0D0D14] border border-white/10 text-xs text-gray-500 font-mono">
            {filteredTransactions.length} de {transactions.length}
          </span>
        </div>
      </div>

      {/* ═══ TRANSACTION LIST ═══ */}
      <div className="bg-[#0D0D14] border border-[#00E5FF]/15 rounded-2xl overflow-hidden shadow-xl">
        
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/5 text-[10px] text-gray-500 uppercase tracking-wider font-bold">
          <div className="col-span-5">Produto</div>
          <div className="col-span-2">Comprador</div>
          <div className="col-span-1 text-right">Valor</div>
          <div className="col-span-1 text-center">Taxa</div>
          <div className="col-span-1 text-center">Status</div>
          <div className="col-span-2 text-right">Ações</div>
        </div>

        {filteredTransactions.length > 0 ? (
          <div className="divide-y divide-white/[0.03]">
            {filteredTransactions.map((tx) => (
              <div 
                key={tx.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-5 md:px-6 py-4 hover:bg-white/[0.015] transition-colors group items-center"
              >
                {/* Product */}
                <div className="col-span-5 flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-black/40 border border-white/10 overflow-hidden shrink-0">
                    <SafeImage src={tx.part?.images?.[0]} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-white font-semibold truncate group-hover:text-[#00E5FF] transition-colors">
                      {tx.part?.title || 'Peça JDM'}
                    </p>
                    <p className="text-[10px] text-gray-600">
                      {tx.created_at ? new Date(tx.created_at).toLocaleDateString('ja-JP') : '—'}
                    </p>
                  </div>
                </div>

                {/* Buyer */}
                <div className="col-span-2 text-[11px] text-gray-400 truncate">
                  {tx.buyer?.full_name || tx.buyer?.email || 'N/A'}
                </div>

                {/* Amount */}
                <div className="col-span-1 text-right">
                  <span className="text-xs font-black text-[#00E5FF] font-mono">
                    {formatMoney(tx.amount || 0)}
                  </span>
                </div>

                {/* Fee */}
                <div className="col-span-1 text-center">
                  <span className="text-[10px] text-gray-500 font-mono">
                    {formatMoney((tx.amount || 0) * (commissionRate / 100))}
                  </span>
                </div>

                {/* Status */}
                <div className="col-span-1 text-center">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    tx.payment_status === 'escrow' 
                      ? 'bg-[#00E5FF]/10 text-[#00E5FF] border-[#00E5FF]/30' 
                      : tx.payment_status === 'pending'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    {tx.payment_status === 'pending' ? '⏳' : tx.payment_status === 'escrow' ? '🔒' : '✅'}
                    <span className="hidden sm:inline">{tx.payment_status === 'pending' ? 'Pend.' : tx.payment_status === 'escrow' ? 'Escrow' : 'OK'}</span>
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-2 flex items-center gap-2 justify-end">
                  {tx.payment_status === 'escrow' && (
                    <button
                      onClick={() => updateTransactionStatus(tx.id, 'completed', 'payment')}
                      className="px-2.5 py-1 rounded-lg bg-[#00E5FF] hover:bg-[#00E5FF]/80 text-black text-[10px] font-extrabold shadow-sm shadow-[#00E5FF]/20 transition-all"
                    >
                      Liberar 💸
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedTransaction(tx)}
                    className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/10 border border-white/5 text-gray-400 hover:text-[#00E5FF] transition-all"
                    title="Detalhes"
                  >
                    <Eye size={14} />
                  </button>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 space-y-3">
            <ShieldCheck size={32} className="text-[#00E5FF]/30 mx-auto" />
            <p className="text-gray-500 text-xs">{searchQuery ? t('Nenhuma transação encontrada para esta busca.') : t('Nenhuma transação registrada.')}</p>
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