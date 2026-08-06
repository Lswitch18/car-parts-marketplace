import React, { useState, useEffect } from 'react';
import { supabase } from '@/modules/shared/lib/supabase';
import { 
  Building2, Search, FileText, CheckCircle, XCircle, Key, 
  Plus, AlertTriangle, ShieldCheck, Briefcase, ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import { useAuthStore } from '@/modules/identity/store/authStore';
import { Navigate } from 'react-router';

export default function ContactsManagement() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'empresas' | 'contratos' | 'api_keys'>('empresas');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [empresas, setEmpresas] = useState<any[]>([]);
  const [contratos, setContratos] = useState<any[]>([]);
  const [apiKeys, setApiKeys] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch pending/active B2B companies
      const { data: b2bData } = await supabase
        .from('admin_profiles')
        .select('id, full_name, email, role, is_store, store_verified, status, created_at')
        .eq('is_store', true)
        .order('created_at', { ascending: false });
        
      setEmpresas(b2bData || []);

      // Fetch Contracts
      const { data: contractsData } = await supabase
        .from('legal_contracts')
        .select('*')
        .order('created_at', { ascending: false });
        
      setContratos(contractsData || []);

      // Fetch API Keys
      const { data: keysData } = await supabase
        .from('b2b_api_keys')
        .select('*')
        .order('created_at', { ascending: false });
        
      setApiKeys(keysData || []);

    } catch (error) {
      console.error("Error fetching CRM data", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStoreVerification = async (profileId: string, currentStatus: boolean) => {
    try {
      setActionLoading(true);
      await supabase
        .from('profiles')
        .update({ store_verified: !currentStatus })
        .eq('id', profileId);
      
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const activateContract = async (contractId: string) => {
    try {
      setActionLoading(true);
      await supabase
        .from('legal_contracts')
        .update({ status: 'active', signed_at: new Date().toISOString() })
        .eq('id', contractId);
      
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const formatMoney = (val: number) => new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(val);

  const filteredEmpresas = empresas.filter(e => 
    (e.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (e.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-[1200px] mx-auto p-4 md:p-6 space-y-6 md:space-y-8 text-[#EDEDED] font-sans pb-20 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Building2 className="text-blue-500" /> B2B CRM &amp; Contratos Corporativos
          </h1>
          <p className="text-[#888] text-sm mt-1">
            Mesa de operações para validação de CNPJ, contratos logísticos e parceiros via API.
          </p>
        </div>
        
        <div className="flex gap-2">
           <div className="flex items-center h-10 bg-[#0A0A0A] border border-[#222] rounded-md px-3 focus-within:border-[#444] transition-colors w-full sm:w-64">
             <Search size={16} className="text-[#888]" />
             <input 
               type="text" 
               placeholder="Pesquisar parceiros..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="bg-transparent border-none outline-none text-[14px] ml-2 w-full placeholder:text-[#666]"
             />
           </div>
           <button className="h-10 px-4 bg-white text-black font-medium text-[14px] rounded-md hover:bg-[#EAEAEA] transition-colors flex items-center gap-2 shrink-0">
             <Plus size={16} /> Novo Parceiro
           </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-5 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5"><Building2 size={80} /></div>
           <h3 className="text-[13px] text-[#888] uppercase tracking-wider font-semibold mb-2">Empresas (Lojas B2B)</h3>
           <div className="text-3xl font-mono text-white mb-1">{empresas.length}</div>
           <div className="text-[12px] text-orange-400 font-medium">
             {empresas.filter(e => !e.store_verified).length} aguardando aprovação
           </div>
        </div>
        <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-5 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5"><FileText size={80} /></div>
           <h3 className="text-[13px] text-[#888] uppercase tracking-wider font-semibold mb-2">Contratos Ativos</h3>
           <div className="text-3xl font-mono text-white mb-1">{contratos.filter(c => c.status === 'active').length}</div>
           <div className="text-[12px] text-blue-400 font-medium">
             {contratos.filter(c => c.status === 'pending_signature').length} pendentes de assinatura
           </div>
        </div>
        <div className="bg-[#0A0A0A] border border-[#222] rounded-xl p-5 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5"><Key size={80} /></div>
           <h3 className="text-[13px] text-[#888] uppercase tracking-wider font-semibold mb-2">Acessos API (Tokens)</h3>
           <div className="text-3xl font-mono text-white mb-1">{apiKeys.filter(k => k.is_active).length}</div>
           <div className="text-[12px] text-green-400 font-medium">
             Tokens ativos operando
           </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#222] gap-6 mt-8">
        <button
          onClick={() => setActiveTab('empresas')}
          className={`pb-3 text-[14px] font-medium transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'empresas' ? 'border-white text-white' : 'border-transparent text-[#888] hover:text-[#CCC]'
          }`}
        >
          <Building2 size={16} /> Aprovação de Empresas
        </button>
        <button
          onClick={() => setActiveTab('contratos')}
          className={`pb-3 text-[14px] font-medium transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'contratos' ? 'border-white text-white' : 'border-transparent text-[#888] hover:text-[#CCC]'
          }`}
        >
          <FileText size={16} /> Contratos (Legal)
        </button>
        <button
          onClick={() => setActiveTab('api_keys')}
          className={`pb-3 text-[14px] font-medium transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'api_keys' ? 'border-white text-white' : 'border-transparent text-[#888] hover:text-[#CCC]'
          }`}
        >
          <Key size={16} /> API Keys
        </button>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="py-20 flex flex-col items-center justify-center text-[#888]">
           <div className="animate-spin w-8 h-8 border-2 border-[#555] border-t-white rounded-full mb-3" />
           <p className="text-[12px] uppercase tracking-widest font-semibold">Carregando CRM...</p>
        </div>
      )}

      {/* TAB 1: EMPRESAS */}
      {!loading && activeTab === 'empresas' && (
        <div className="bg-[#0A0A0A] border border-[#222] rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#111] border-b border-[#222]">
              <tr>
                <th className="px-5 py-4 text-[12px] font-semibold text-[#888] uppercase tracking-wider">Empresa (Loja)</th>
                <th className="px-5 py-4 text-[12px] font-semibold text-[#888] uppercase tracking-wider">Email B2B</th>
                <th className="px-5 py-4 text-[12px] font-semibold text-[#888] uppercase tracking-wider">Validação Comercial</th>
                <th className="px-5 py-4 text-[12px] font-semibold text-[#888] uppercase tracking-wider text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {filteredEmpresas.length === 0 ? (
                 <tr><td colSpan={4} className="p-8 text-center text-[#666]">Nenhuma empresa B2B encontrada.</td></tr>
              ) : (
                filteredEmpresas.map(emp => (
                  <tr key={emp.id} className="hover:bg-[#111] transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-md bg-[#222] border border-[#333] flex items-center justify-center">
                             <Briefcase size={14} className="text-[#888]" />
                          </div>
                          <div>
                            <div className="text-[14px] font-medium text-white">{emp.full_name || 'Sem nome (Pendente)'}</div>
                            <div className="text-[11px] text-[#666] uppercase tracking-widest">ID: {emp.id.substring(0,8)}</div>
                          </div>
                       </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-[13px] text-[#AAA]">{emp.email}</td>
                    <td className="px-5 py-4 whitespace-nowrap">
                       {emp.store_verified ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
                            <ShieldCheck size={12} /> Aprovada
                          </span>
                       ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-md">
                            <AlertTriangle size={12} /> Avaliação Pendente
                          </span>
                       )}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-right">
                       <button
                         disabled={actionLoading}
                         onClick={() => toggleStoreVerification(emp.id, emp.store_verified)}
                         className={`px-3 py-1.5 text-[12px] font-semibold rounded-md border transition-colors ${
                           emp.store_verified 
                             ? 'bg-transparent border-[#333] text-[#888] hover:bg-[#222]' 
                             : 'bg-white text-black border-transparent hover:bg-[#EAEAEA]'
                         }`}
                       >
                         {emp.store_verified ? 'Revogar Licença' : 'Aprovar Vendas'}
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: CONTRATOS */}
      {!loading && activeTab === 'contratos' && (
        <div className="bg-[#0A0A0A] border border-[#222] rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#111] border-b border-[#222]">
              <tr>
                <th className="px-5 py-4 text-[12px] font-semibold text-[#888] uppercase tracking-wider">Nº Contrato</th>
                <th className="px-5 py-4 text-[12px] font-semibold text-[#888] uppercase tracking-wider">Parceiro</th>
                <th className="px-5 py-4 text-[12px] font-semibold text-[#888] uppercase tracking-wider">Valor / Setup</th>
                <th className="px-5 py-4 text-[12px] font-semibold text-[#888] uppercase tracking-wider">Status Jurídico</th>
                <th className="px-5 py-4 text-[12px] font-semibold text-[#888] uppercase tracking-wider text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {contratos.length === 0 ? (
                 <tr><td colSpan={5} className="p-8 text-center text-[#666]">Nenhum contrato B2B registrado.</td></tr>
              ) : (
                contratos.map(ct => (
                  <tr key={ct.id} className="hover:bg-[#111] transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap text-[13px] font-mono text-blue-400 font-medium">
                      {ct.contract_number}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                       <div className="text-[14px] font-medium text-white">{ct.partner_name}</div>
                       <div className="text-[12px] text-[#666]">{ct.partner_email}</div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-[13px] font-mono text-[#AAA]">
                      {formatMoney(ct.contract_value)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                       {ct.status === 'active' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md">
                            <CheckCircle size={12} /> Ativo & Assinado
                          </span>
                       ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-md">
                            <FileText size={12} /> Assinatura Pendente
                          </span>
                       )}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-right">
                       {ct.status !== 'active' && (
                         <button
                           disabled={actionLoading}
                           onClick={() => activateContract(ct.id)}
                           className="px-3 py-1.5 text-[12px] font-semibold bg-[#222] border border-[#444] text-[#EDEDED] rounded-md hover:bg-[#333] transition-colors"
                         >
                           Forçar Ativação
                         </button>
                       )}
                       {ct.status === 'active' && (
                         <button className="p-1.5 text-[#666] hover:text-[#EDEDED] transition-colors">
                           <MoreHorizontal size={18} />
                         </button>
                       )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: API KEYS */}
      {!loading && activeTab === 'api_keys' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {apiKeys.length === 0 ? (
              <div className="md:col-span-2 bg-[#0A0A0A] border border-[#222] rounded-xl p-8 text-center text-[#666]">
                 Nenhum token de API gerado.
              </div>
           ) : (
             apiKeys.map(key => (
               <div key={key.id} className="bg-[#0A0A0A] border border-[#222] rounded-xl p-5 relative">
                  <div className="flex justify-between items-start mb-4">
                     <div>
                       <div className="text-[14px] font-semibold text-white">{key.partner_name}</div>
                       <div className="text-[12px] text-[#666]">Prefixo: <span className="font-mono">{key.api_key_prefix}</span></div>
                     </div>
                     <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-full border ${
                        key.is_active ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                     }`}>
                        {key.is_active ? 'Live' : 'Revogado'}
                     </span>
                  </div>
                  <div className="text-[12px] text-[#888] bg-[#111] p-3 rounded-lg border border-[#222] font-mono mb-4 flex items-center justify-between">
                     <span>sk_live_*******************</span>
                     <button className="text-blue-400 hover:text-blue-300">Rotate</button>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#666] uppercase tracking-wider font-semibold">
                     <span>Rate Limit: {key.rate_limit} req/s</span>
                     <button className="text-white bg-[#222] border border-[#333] px-3 py-1 rounded hover:bg-[#333]">Gerenciar Webhooks <ChevronRight size={12} className="inline ml-1"/></button>
                  </div>
               </div>
             ))
           )}
        </div>
      )}

    </div>
  );
}
