import { useState, useEffect } from 'react';
import { supabase } from '@/modules/shared/lib/supabase';
import { useI18n } from '@/modules/shared/lib/i18n';
import { useAuthStore } from '@/modules/identity/store/authStore';
import { Navigate } from 'react-router-dom';
import GaidLogo from '@/modules/shared/components/GaidLogo';
import SafeImage from '@/modules/parts-catalog/components/SafeImage';
import { adminApi } from '@/modules/transactions/api/adminApi';
import { api } from '@/modules/transactions/api/api';
import { 
  ShieldCheck, DollarSign, Wallet, ArrowUpRight, Filter, 
  CheckCircle2, Clock, Eye, Sparkles, Save, X, ExternalLink, RefreshCw
} from 'lucide-react';

export default function TransactionManagement() {
  const { user: currentUser } = useAuthStore();
  const { t } = useI18n();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [activeLedgerFilter, setActiveLedgerFilter] = useState<string | null>(null);

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
      setFilteredTransactions(data || []);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!activeLedgerFilter) {
      setFilteredTransactions(transactions);
      return;
    }
    
    const filtered = transactions.filter(t => {
      if (activeLedgerFilter === 'receber') {
        return t.payment_status === 'pending' || t.payment_status === 'processing';
      }
      if (activeLedgerFilter === 'retido') {
        return t.payment_status === 'escrow' || (t.payment_status === 'paid' && t.fulfillment_status !== 'delivered' && t.fulfillment_status !== 'completed');
      }
      if (activeLedgerFilter === 'pagos') {
        return t.payment_status === 'paid' && (t.fulfillment_status === 'delivered' || t.fulfillment_status === 'completed');
      }
      return true;
    });
    setFilteredTransactions(filtered);
  }, [activeLedgerFilter, transactions]);

  const updateTransactionStatus = async (transactionId: string, status: string, type: 'payment' | 'fulfillment') => {
    try {
      const updateData = type === 'payment' 
        ? { payment_status: status } 
        : { fulfillment_status: status };
        
      await api.transactions.update(transactionId, updateData);
      
      const updateList = (prev: any[]) =>
        prev.map(t => 
          t.id === transactionId 
            ? {...t, [type === 'payment' ? 'payment_status' : 'fulfillment_status']: status} 
            : t
        );
      setTransactions(updateList);
      if (selectedTransaction && selectedTransaction.id === transactionId) {
        setSelectedTransaction((prev: any) => prev ? { ...prev, [type === 'payment' ? 'payment_status' : 'fulfillment_status']: status } : null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update transaction status');
    }
  };

  const formatMoney = (val: number) => new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(val);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 min-h-screen bg-[#07070A]">
        <div className="animate-spin w-8 h-8 border-2 border-[#00E5FF] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4 text-white">
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl">
          <p className="font-semibold">{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-[#00E5FF] text-black font-bold px-4 py-2 rounded-xl text-sm hover:bg-[#00E5FF]/80 transition-all"
        >
          {t('Tentar novamente')}
        </button>
      </div>
    );
  }

  // Cálculos do Ledger Financeiro
  const aReceberVal = filteredTransactions
    .filter(t => t.payment_status === 'pending' || t.payment_status === 'processing')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const retidoVal = filteredTransactions
    .filter(t => t.payment_status === 'escrow' || (t.payment_status === 'paid' && t.fulfillment_status !== 'delivered' && t.fulfillment_status !== 'completed'))
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const pagosVal = filteredTransactions
    .filter(t => t.payment_status === 'paid' && (t.fulfillment_status === 'delivered' || t.fulfillment_status === 'completed'))
    .reduce((sum, t) => sum + parseFloat(t.amount || 0) * (1 - commissionRate / 100), 0);

  const lucroBruto = filteredTransactions
    .filter(t => t.payment_status === 'paid' || t.payment_status === 'escrow')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0) * (commissionRate / 100), 0);

  const lucroLiquido = lucroBruto - custoTerceiros;

  return (
    <div className="max-w-[1400px] mx-auto p-4 md:p-6 space-y-6 text-[#EDEDED] font-sans pb-20">
      
      {/* Header Oficial com GaidLogo e Controle da Taxa em Neon Azul (#00E5FF) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#00E5FF]/20 pb-6 bg-[#0D0D14]/60 p-6 rounded-2xl border border-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-2xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 shadow-lg shadow-[#00E5FF]/10">
            <GaidLogo size={46} animated />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] text-xs font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> DAIG Financial Escrow Center
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-cyan-200 to-[#00E5FF] bg-clip-text text-transparent">
              Gerenciamento de Transações & Custódia JPY
            </h1>
            <p className="text-gray-400 text-xs mt-0.5">
              Fluxo financeiro, retenção em custódia segura (*Escrow*) e controle de saídas para vendedores.
            </p>
          </div>
        </div>

        {/* Controller de Taxa DAIG */}
        <div className="flex items-center gap-3 bg-[#07070A] border border-[#00E5FF]/30 rounded-xl px-4 py-2.5 shadow-lg shadow-[#00E5FF]/5 shrink-0">
          <span className="text-gray-300 text-xs font-semibold">{t('Taxa DAIG:')}</span>
          <input
            type="number"
            value={tempRate}
            onChange={(e) => setTempRate(e.target.value)}
            className="bg-[#0D0D14] border border-[#00E5FF]/40 rounded-lg px-2.5 py-1 text-white font-mono font-bold text-sm w-16 text-center focus:outline-none focus:border-[#00E5FF]"
            min="0"
            max="100"
          />
          <span className="text-[#00E5FF] font-bold text-sm">%</span>
          <button
            onClick={handleSaveCommissionRate}
            disabled={savingRate}
            className="px-3.5 py-1.5 bg-[#00E5FF] hover:bg-[#00E5FF]/80 text-black rounded-lg text-xs font-extrabold transition-all disabled:opacity-50 shadow-md shadow-[#00E5FF]/20 flex items-center gap-1"
          >
            <Save size={12} />
            <span>{savingRate ? t('Salvando...') : t('Salvar')}</span>
          </button>
        </div>
      </div>

      {/* 4 Cards de Métricas Financeiras - Estética Neon Azul Unificada (#00E5FF) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: A Receber */}
        <div 
          onClick={() => setActiveLedgerFilter(activeLedgerFilter === 'receber' ? null : 'receber')}
          className={`bg-[#0D0D14] border rounded-2xl p-5 shadow-xl backdrop-blur-md cursor-pointer transition-all hover:scale-[1.02] group relative overflow-hidden ${
            activeLedgerFilter === 'receber' ? 'border-[#00E5FF] bg-[#00E5FF]/10' : 'border-[#00E5FF]/20 hover:border-[#00E5FF]'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF]">
              <Clock size={20} />
            </div>
            <span className="text-[11px] font-bold text-[#00E5FF] bg-[#00E5FF]/10 border border-[#00E5FF]/30 px-2 py-0.5 rounded-full">
              Pendente
            </span>
          </div>

          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{t('A RECEBER (COMPRADOR)')}</p>
          <p className="text-2xl font-black text-white mt-1 group-hover:text-[#00E5FF] transition-colors font-mono">
            {formatMoney(aReceberVal)}
          </p>
          <p className="text-xs text-gray-500 mt-2">Transações pendentes/processando</p>
        </div>

        {/* Card 2: Valore Retidos (Custódia Escrow) */}
        <div 
          onClick={() => setActiveLedgerFilter(activeLedgerFilter === 'retido' ? null : 'retido')}
          className={`bg-[#0D0D14] border rounded-2xl p-5 shadow-xl backdrop-blur-md cursor-pointer transition-all hover:scale-[1.02] group relative overflow-hidden ${
            activeLedgerFilter === 'retido' ? 'border-[#00E5FF] bg-[#00E5FF]/10' : 'border-[#00E5FF]/20 hover:border-[#00E5FF]'
          }`}
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#00E5FF]/10 rounded-full blur-2xl group-hover:bg-[#00E5FF]/25 transition-all" />
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF]">
              <ShieldCheck size={20} />
            </div>
            <span className="text-[11px] font-bold text-[#00E5FF] bg-[#00E5FF]/10 border border-[#00E5FF]/30 px-2 py-0.5 rounded-full">
              Escrow Retido 🔒
            </span>
          </div>

          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{t('VALORES RETIDOS (CUSTÓDIA)')}</p>
          <p className="text-2xl font-black text-[#00E5FF] mt-1 transition-colors font-mono">
            {formatMoney(retidoVal)}
          </p>
          <p className="text-xs text-gray-500 mt-2">Garantia segura aguardando entrega</p>
        </div>

        {/* Card 3: Valores Pagos aos Vendedores */}
        <div 
          onClick={() => setActiveLedgerFilter(activeLedgerFilter === 'pagos' ? null : 'pagos')}
          className={`bg-[#0D0D14] border rounded-2xl p-5 shadow-xl backdrop-blur-md cursor-pointer transition-all hover:scale-[1.02] group relative overflow-hidden ${
            activeLedgerFilter === 'pagos' ? 'border-[#00E5FF] bg-[#00E5FF]/10' : 'border-[#00E5FF]/20 hover:border-[#00E5FF]'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF]">
              <Wallet size={20} />
            </div>
            <span className="text-[11px] font-bold text-[#00E5FF] bg-[#00E5FF]/10 border border-[#00E5FF]/30 px-2 py-0.5 rounded-full">
              Repassado
            </span>
          </div>

          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{t('VALORES PAGOS (VENDEDOR)')}</p>
          <p className="text-2xl font-black text-white mt-1 group-hover:text-[#00E5FF] transition-colors font-mono">
            {formatMoney(pagosVal)}
          </p>
          <p className="text-xs text-gray-500 mt-2">{(100 - commissionRate)}% de repasse líquido liberado</p>
        </div>

        {/* Card 4: Lucro da Plataforma */}
        <div className="bg-[#0D0D14] border border-[#00E5FF]/20 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{t('LUCRO DA PLATAFORMA')}</p>
            <DollarSign size={16} className="text-[#00E5FF]" />
          </div>
          
          <p className="text-2xl font-black text-[#00E5FF] font-mono">
            {formatMoney(lucroLiquido)}
          </p>

          <div className="pt-2 border-t border-white/5 space-y-1 text-xs text-gray-400">
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

      {/* Filtro Ativo Banner */}
      {activeLedgerFilter && (
        <div className="flex items-center justify-between bg-[#00E5FF]/10 border border-[#00E5FF]/30 rounded-xl px-4 py-2.5">
          <span className="text-xs text-gray-300 font-semibold flex items-center gap-2">
            <Filter size={14} className="text-[#00E5FF]" />
            {t('Filtrando por:')} <strong className="text-[#00E5FF] uppercase font-bold">{activeLedgerFilter === 'receber' ? 'A Receber' : activeLedgerFilter === 'retido' ? 'Valores Retidos' : 'Valores Pagos'}</strong>
          </span>
          <button
            onClick={() => setActiveLedgerFilter(null)}
            className="text-xs font-bold text-[#00E5FF] hover:underline uppercase tracking-wider flex items-center gap-1"
          >
            <X size={14} /> {t('Limpar Filtro')}
          </button>
        </div>
      )}

      {/* Tabela de Transações com Thumbs das Peças JDM e Botões Neon Azul */}
      <div className="bg-[#0D0D14] border border-[#00E5FF]/20 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00E5FF]" /> {t('Lista de Transações de Peças JDM')}
          </h2>
          <button onClick={fetchTransactions} className="text-xs text-[#00E5FF] font-bold flex items-center gap-1 hover:underline">
            <RefreshCw size={12} /> {t('Atualizar')}
          </button>
        </div>

        {filteredTransactions.length > 0 ? (
          <div className="space-y-3">
            {filteredTransactions.map((tx) => (
              <div 
                key={tx.id}
                className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-[#00E5FF]/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                {/* Produto / Peça JDM */}
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-14 h-14 rounded-lg bg-black/40 border border-white/10 overflow-hidden shrink-0">
                    <SafeImage src={tx.part?.images?.[0]} alt={tx.part?.title || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <p className="text-white font-semibold text-sm truncate group-hover:text-[#00E5FF] transition-colors">
                      {tx.part?.title || 'Peça Automotiva JDM'}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>Comprador: <strong className="text-white">{tx.buyer?.full_name || tx.buyer?.email || 'N/A'}</strong></span>
                      <span>•</span>
                      <span>Vendedor: <strong className="text-white">{tx.seller?.full_name || tx.seller?.email || 'N/A'}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Valor & Status */}
                <div className="flex items-center gap-4 justify-between md:justify-end shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-white/5">
                  <div className="text-left md:text-right">
                    <span className="text-base font-black text-[#00E5FF] font-mono block">
                      {formatMoney(tx.amount || 0)}
                    </span>
                    <span className="text-[11px] font-bold text-gray-400 uppercase">
                      Taxa DAIG: {formatMoney((tx.amount || 0) * (commissionRate / 100))}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30">
                    {tx.payment_status === 'pending' ? '⏳ Pendente' : tx.payment_status === 'escrow' ? '🔒 Escrow Retido' : '✅ Concluído'}
                  </span>

                  {/* Ações Diretas */}
                  <div className="flex items-center gap-2">
                    {tx.payment_status === 'escrow' && (
                      <button
                        onClick={() => updateTransactionStatus(tx.id, 'paid', 'payment')}
                        className="px-3.5 py-1.5 rounded-xl bg-[#00E5FF] hover:bg-[#00E5FF]/80 text-black text-xs font-extrabold shadow-md shadow-[#00E5FF]/20 transition-all"
                      >
                        Liberar Repasse 💸
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedTransaction(tx)}
                      className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition-all flex items-center gap-1"
                    >
                      <Eye size={14} className="text-[#00E5FF]" />
                      <span>Detalhes</span>
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 space-y-3">
            <ShieldCheck size={36} className="text-[#00E5FF] mx-auto" />
            <p className="text-gray-400 text-sm">{t('Nenhuma transação encontrada.')}</p>
          </div>
        )}
      </div>

    </div>
  );
}