import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { 
  Key, Webhook, BarChart, Server, Plus, 
  Trash2, ToggleLeft, ToggleRight, Check, 
  Play, Eye, ShieldCheck, HelpCircle, RefreshCw,
  FileText, Mail, DollarSign, Download
} from 'lucide-react';

interface ApiKey {
  id: string;
  partner_name: string;
  partner_email: string;
  api_key_prefix: string;
  is_active: boolean;
  created_at: string;
  partner_carrier?: string | null;
  partner_warehouse_id?: string | null;
}

interface WebhookItem {
  id: string;
  api_key_id: string;
  webhook_url: string;
  events: string[];
  is_active: boolean;
  created_at: string;
}

interface RequestLog {
  id: string;
  endpoint: string;
  method: string;
  status_code: number;
  response_time_ms: number;
  ip_address: string;
  created_at: string;
  api_key?: {
    partner_name: string;
  } | null;
}

interface LegalContract {
  id: string;
  contract_number: string;
  partner_name: string;
  partner_email: string;
  service_type: string;
  status: 'pending_signature' | 'signed' | 'active' | 'suspended' | 'terminated';
  contract_value: number;
  periodicity: string;
  contract_terms: string;
  signed_at?: string;
  paid_at?: string;
  api_key_id?: string;
  language?: string;
  pdf_path?: string;
  created_at: string;
}

export default function B2BPage() {
  const [activeTab, setActiveTab] = useState<'keys' | 'contracts' | 'webhooks' | 'logs' | 'carriers'>('keys');
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [contracts, setContracts] = useState<LegalContract[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([]);
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [armazens, setArmazens] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [partnerName, setPartnerName] = useState('');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [partnerCarrier, setPartnerCarrier] = useState('');
  const [partnerWarehouseId, setPartnerWarehouseId] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  // Contract Modal Form
  const [showContractModal, setShowContractModal] = useState(false);
  const [newContractVal, setNewContractVal] = useState('60000');
  const [selectedServices, setSelectedServices] = useState<string[]>(['b2b_logistix']);
  const [contractPeriodicity, setContractPeriodicity] = useState('mensal');
  const [contractLanguage, setContractLanguage] = useState('pt');
  
  const [webhookUrl, setWebhookUrl] = useState('');
  const [selectedApiKeyId, setSelectedApiKeyId] = useState('');
  const [webhookEvents, setWebhookEvents] = useState<string[]>(['orders.updated']);

  // Carrier Integration Mock Configs (Yamato & Seino)
  const [yamatoConfig, setYamatoConfig] = useState({
    endpoint: 'https://api.kuronekoyamato.co.jp/v1/b2cloud',
    clientId: localStorage.getItem('yamato_client_id') || '',
    clientSecret: localStorage.getItem('yamato_client_secret') || '',
    customerCode: localStorage.getItem('yamato_customer_code') || '',
    serviceType: 'TA-Q-BIN'
  });

  const [seinoConfig, setSeinoConfig] = useState({
    endpoint: 'https://api.seino.co.jp/v2/kangaroo',
    clientId: localStorage.getItem('seino_client_id') || '',
    password: localStorage.getItem('seino_password') || '',
    customerCode: localStorage.getItem('seino_customer_code') || '',
    serviceType: 'KANGAROO_EXPRESS'
  });

  // Test Harness States
  const [testingCarrier, setTestingCarrier] = useState<'yamato' | 'seino' | null>(null);
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    fetchKeys();
    fetchLogs();
    fetchArmazens();
  }, []);

  useEffect(() => {
    if (activeTab === 'webhooks') {
      fetchWebhooks();
    } else if (activeTab === 'contracts') {
      fetchContracts();
    }
  }, [activeTab]);

  const fetchArmazens = async () => {
    try {
      const { data } = await supabase
        .from('admin_armazens')
        .select('id, nome')
        .order('nome');
      setArmazens(data || []);
    } catch (err) {
      console.error('Erro ao buscar armazéns:', err);
    }
  };

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('b2b_api_keys')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setKeys(data || []);
      if (data && data.length > 0) {
        setSelectedApiKeyId(data[0].id);
      }
    } catch (err) {
      console.error('Erro ao buscar API keys:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('legal_contracts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setContracts(data || []);
    } catch (err) {
      console.error('Erro ao buscar contratos:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWebhooks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('b2b_webhooks')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setWebhooks(data || []);
    } catch (err) {
      console.error('Erro ao buscar webhooks:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('b2b_request_logs')
        .select('*, api_key:b2b_api_keys(partner_name)')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      setLogs((data as any) || []);
    } catch (err) {
      console.error('Erro ao buscar logs:', err);
    }
  };

  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName || !partnerEmail) return;
    setLoading(true);
    setGeneratedKey(null);
    try {
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/logistix-b2b/auth/token`;
      const res = await fetch(functionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          partner_name: partnerName, 
          partner_email: partnerEmail,
          partner_carrier: partnerCarrier || null,
          partner_warehouse_id: partnerWarehouseId || null
        })
      });
      const data = await res.json();
      if (data.success && data.api_key) {
        setGeneratedKey(data.api_key);
        setPartnerName('');
        setPartnerEmail('');
        setPartnerCarrier('');
        setPartnerWarehouseId('');
        fetchKeys();
      } else {
        alert('Erro ao gerar chave: ' + (data.error || 'Erro desconhecido'));
      }
    } catch (err) {
      console.error('Erro de requisição:', err);
      alert('Erro de conexão ao criar chave.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContractAndKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName || !partnerEmail) return;
    setLoading(true);
    try {
      // 1. Generate API Key via Edge Function
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/logistix-b2b/auth/token`;
      const res = await fetch(functionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          partner_name: partnerName, 
          partner_email: partnerEmail,
          partner_carrier: partnerCarrier || null,
          partner_warehouse_id: partnerWarehouseId || null
        })
      });
      const data = await res.json();
      if (!data.success || !data.api_key) {
        throw new Error(data.error || 'Falha ao criar API key');
      }

      // Fetch the newly created key ID from DB
      const prefix = data.prefix;
      const { data: dbKeys } = await supabase
        .from('b2b_api_keys')
        .select('id')
        .eq('api_key_prefix', prefix);
      
      const keyId = dbKeys?.[0]?.id;
      if (!keyId) throw new Error('Não foi possível localizar o ID da chave recém-criada');

      // Set key to INACTIVE initially
      await supabase.from('b2b_api_keys').update({ is_active: false }).eq('id', keyId);

      // 2. Create legal contract record
      const contractNumber = `JDM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const terms = `CONTRATO DE PARCERIA B2B LOGISTIX\n\nPartes: JDM Logistix WMS e ${partnerName}.\nServiços selecionados: ${selectedServices.join(', ')}.\nValor acordado: ¥ ${newContractVal} / ${contractPeriodicity}.\n\nEste contrato de parceria logistica assegura o acesso aos dados logísticos japoneses respeitando escopos de privacidade configurados.`;
      const pdfPath = `/home/lswitch/car-parts-marketplce/artifacts/contrato-${partnerName.toLowerCase().replace(/\s+/g, '-')}-${contractLanguage}.pdf`;

      const { error: contractErr } = await supabase
        .from('legal_contracts')
        .insert({
          contract_number: contractNumber,
          partner_name: partnerName,
          partner_email: partnerEmail,
          service_type: selectedServices.join(','),
          status: 'pending_signature',
          contract_value: parseFloat(newContractVal),
          periodicity: contractPeriodicity,
          contract_terms: terms,
          api_key_id: keyId,
          language: contractLanguage,
          pdf_path: pdfPath
        });

      if (contractErr) throw contractErr;

      alert(`Contrato ${contractNumber} criado com sucesso! O acesso B2B continuará suspenso/inativo até a aprovação por e-mail e posterior confirmação do pagamento.`);
      
      // Reset forms
      setPartnerName('');
      setPartnerEmail('');
      setPartnerCarrier('');
      setPartnerWarehouseId('');
      setShowContractModal(false);
      setGeneratedKey(data.api_key); // Show raw key once so they can copy it
      
      fetchKeys();
      fetchContracts();
    } catch (err: any) {
      console.error(err);
      alert('Erro ao criar contrato/chave B2B: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateSignature = async (contractId: string) => {
    try {
      const { error } = await supabase
        .from('legal_contracts')
        .update({ status: 'signed', signed_at: new Date().toISOString() })
        .eq('id', contractId);
      if (error) throw error;
      fetchContracts();
      alert('Assinatura do contrato confirmada eletronicamente!');
    } catch (err) {
      console.error('Erro ao simular assinatura:', err);
    }
  };

  const handleSimulatePayment = async (contractId: string) => {
    try {
      const { error } = await supabase
        .from('legal_contracts')
        .update({ status: 'active', paid_at: new Date().toISOString() })
        .eq('id', contractId);
      if (error) throw error;
      fetchContracts();
      fetchKeys();
      alert('Pagamento aprovado com sucesso! A chave de acesso B2B correspondente foi habilitada automaticamente via trigger do banco de dados.');
    } catch (err) {
      console.error('Erro ao simular pagamento:', err);
    }
  };

  const toggleKeyStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('b2b_api_keys')
        .update({ is_active: !currentStatus })
        .eq('id', id);
      if (error) throw error;
      fetchKeys();
    } catch (err) {
      console.error('Erro ao alternar status da chave:', err);
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta chave API? Parceiros utilizando-a perderão o acesso.')) return;
    try {
      const { error } = await supabase
        .from('b2b_api_keys')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchKeys();
    } catch (err) {
      console.error('Erro ao excluir chave:', err);
    }
  };

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookUrl || !selectedApiKeyId) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('b2b_webhooks')
        .insert({
          api_key_id: selectedApiKeyId,
          webhook_url: webhookUrl,
          events: webhookEvents,
          is_active: true
        });
      if (error) throw error;
      setWebhookUrl('');
      fetchWebhooks();
    } catch (err) {
      console.error('Erro ao criar webhook:', err);
      alert('Erro ao criar webhook.');
    } finally {
      setLoading(false);
    }
  };

  const toggleWebhookStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('b2b_webhooks')
        .update({ is_active: !currentStatus })
        .eq('id', id);
      if (error) throw error;
      fetchWebhooks();
    } catch (err) {
      console.error('Erro ao alternar status do webhook:', err);
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    if (!confirm('Deseja deletar este webhook?')) return;
    try {
      const { error } = await supabase
        .from('b2b_webhooks')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchWebhooks();
    } catch (err) {
      console.error('Erro ao excluir webhook:', err);
    }
  };

  const handleSaveCarrier = (carrier: 'yamato' | 'seino') => {
    if (carrier === 'yamato') {
      localStorage.setItem('yamato_client_id', yamatoConfig.clientId);
      localStorage.setItem('yamato_client_secret', yamatoConfig.clientSecret);
      localStorage.setItem('yamato_customer_code', yamatoConfig.customerCode);
    } else {
      localStorage.setItem('seino_client_id', seinoConfig.clientId);
      localStorage.setItem('seino_password', seinoConfig.password);
      localStorage.setItem('seino_customer_code', seinoConfig.customerCode);
    }
    alert(`Configurações da ${carrier === 'yamato' ? 'Yamato Transport' : 'Seino Transportation'} salvas com sucesso!`);
  };

  const handleTestCarrier = async (carrier: 'yamato' | 'seino') => {
    setTestingCarrier(carrier);
    setTestResult(null);

    // Simulate carrier handshake & shipment creation API payload response
    setTimeout(() => {
      const config = carrier === 'yamato' ? yamatoConfig : seinoConfig;
      const success = !!config.clientId && !!config.customerCode;

      if (!success) {
        setTestResult({
          status: 'error',
          message: 'Falha na autenticação: Credenciais incompletas no painel administrativo.',
          payloadSent: null
        });
      } else {
        const mockTracking = carrier === 'yamato' 
          ? `YAM-TAQBIN-${Math.floor(1000000000 + Math.random() * 9000000000)}` 
          : `SEI-KNG-${Math.floor(100000000 + Math.random() * 900000000)}`;

        setTestResult({
          status: 'success',
          tracking: mockTracking,
          carrier: carrier === 'yamato' ? 'Yamato Transport (ヤマト運輸)' : 'Seino Transportation (西濃運輸)',
          timestamp: new Date().toISOString(),
          labelZpl: `^XA^LH10,10^FO50,50^ADN,36,20^FD${carrier.toUpperCase()} TEST^FS^FO50,110^BCN,80,Y,N,N^FD${mockTracking}^FS^XZ`,
          payloadSent: {
            auth: {
              client_id: config.clientId,
              customer_code: config.customerCode,
            },
            shipment: {
              shipper: 'CD Yamato Tokyo Hub',
              consignee: 'Toyota Motor Corp Main Depot',
              package_type: 'CAR_PARTS',
              weight_kg: 8.5
            }
          }
        });
      }
      setTestingCarrier(null);
    }, 1500);
  };

  return (
    <div className="space-y-6 p-6 bg-white min-h-screen text-black relative">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight">Integração B2B & Transportadoras</h2>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mt-1">
            Gerencie chaves de API externas, webhooks e credenciais de operadoras logísticas japonesas
          </p>
        </div>
        {activeTab === 'contracts' && (
          <button
            onClick={() => setShowContractModal(true)}
            className="flex items-center gap-2 h-10 px-4 bg-black text-white hover:bg-neutral-800 rounded-lg text-xs font-black uppercase tracking-widest transition-all"
          >
            <Plus size={14} /> Novo Contrato B2B
          </button>
        )}
      </div>

      {/* Tabs Menu */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'keys', label: 'Chaves API B2B', icon: Key },
          { id: 'contracts', label: 'Contratos Jurídicos', icon: FileText },
          { id: 'webhooks', label: 'Webhooks de Eventos', icon: Webhook },
          { id: 'logs', label: 'Logs de Tráfego', icon: BarChart },
          { id: 'carriers', label: 'Conexões (Yamato / Seino)', icon: Server },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all border-2 ${
              activeTab === t.id
                ? 'bg-black text-white border-black'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* API Keys Tab */}
      {activeTab === 'keys' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-50 border-2 border-black rounded-xl p-5">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-4">Parceiros Integrados</h3>
              {loading && <p className="text-xs text-slate-500 font-bold">Carregando...</p>}
              {!loading && keys.length === 0 && (
                <p className="text-xs text-slate-500 py-4 font-bold uppercase">Nenhum parceiro B2B cadastrado.</p>
              )}
              <div className="space-y-3">
                {keys.map(k => {
                  const whName = armazens.find(a => a.id === k.partner_warehouse_id)?.nome;
                  return (
                    <div key={k.id} className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between shadow-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black uppercase">{k.partner_name}</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${k.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {k.is_active ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-bold mt-0.5">{k.partner_email}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-1">Prefixo Key: {k.api_key_prefix}*********</p>
                        {(k.partner_carrier || k.partner_warehouse_id) && (
                          <div className="flex gap-2 mt-2">
                            {k.partner_carrier && (
                              <span className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-800 rounded text-[9px] font-black uppercase">
                                Transportadora: {k.partner_carrier}
                              </span>
                            )}
                            {k.partner_warehouse_id && (
                              <span className="px-2 py-0.5 bg-purple-50 border border-purple-200 text-purple-800 rounded text-[9px] font-black uppercase">
                                CD: {whName || 'Restrito'}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleKeyStatus(k.id, k.is_active)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                          {k.is_active ? <ToggleRight size={20} className="text-slate-800" /> : <ToggleLeft size={20} className="text-slate-400" />}
                        </button>
                        <button onClick={() => handleDeleteKey(k.id)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-red-600">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white border-2 border-black rounded-xl p-5">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-4">Gerar Chave de Parceiro</h3>
              <form onSubmit={handleGenerateKey} className="space-y-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Nome do Parceiro (Ex: Toyota WMS)</label>
                  <input
                    type="text" required value={partnerName} onChange={e => setPartnerName(e.target.value)}
                    className="w-full h-10 border-2 border-black rounded-lg px-3 text-xs font-bold outline-none focus:bg-slate-50"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">E-mail do Administrador</label>
                  <input
                    type="email" required value={partnerEmail} onChange={e => setPartnerEmail(e.target.value)}
                    className="w-full h-10 border-2 border-black rounded-lg px-3 text-xs font-bold outline-none focus:bg-slate-50"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Limitar por Transportadora (Opcional)</label>
                  <input
                    type="text" value={partnerCarrier} onChange={e => setPartnerCarrier(e.target.value)}
                    placeholder="Ex: Yamato Transport"
                    className="w-full h-10 border-2 border-black rounded-lg px-3 text-xs font-bold outline-none focus:bg-slate-50"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Limitar por Centro de Distribuição (Opcional)</label>
                  <select
                    value={partnerWarehouseId} onChange={e => setPartnerWarehouseId(e.target.value)}
                    className="w-full h-10 border-2 border-black rounded-lg px-3 text-xs font-bold outline-none bg-white"
                  >
                    <option value="">Acesso total (Todos os CDs)</option>
                    {armazens.map(a => (
                      <option key={a.id} value={a.id}>{a.nome}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit" disabled={loading}
                  className="w-full h-10 bg-black text-white hover:bg-neutral-800 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <Plus size={14} /> Criar API Key
                </button>
              </form>

              {generatedKey && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs">
                  <p className="font-black text-yellow-800 uppercase mb-1">⚠️ ATENÇÃO: Copie a chave abaixo agora</p>
                  <p className="text-[10px] text-yellow-700 font-bold mb-2">Por segurança, ela não será exibida novamente.</p>
                  <div className="p-2 bg-white border border-yellow-200 rounded font-mono break-all text-xs font-bold flex items-center justify-between">
                    <span>{generatedKey}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Contracts / Jurídico Tab */}
      {activeTab === 'contracts' && (
        <div className="bg-slate-50 border-2 border-black rounded-xl p-5">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-4">Contratos Jurídicos Logistix</h3>
          {loading && <p className="text-xs text-slate-500 font-bold">Carregando...</p>}
          {!loading && contracts.length === 0 && (
            <p className="text-xs text-slate-500 py-4 font-bold uppercase">Nenhum contrato gerado.</p>
          )}

          <div className="space-y-4">
            {contracts.map(c => (
              <div key={c.id} className="bg-white border-2 border-black rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between shadow-xs gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-widest">{c.contract_number}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                      c.status === 'active' ? 'bg-green-100 text-green-800' :
                      c.status === 'signed' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {c.status === 'active' ? 'Ativo (Pago)' :
                       c.status === 'signed' ? 'Assinado (Aguardando Pago)' : 'Aguardando Assinatura'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-bold mt-1">Parceiro: {c.partner_name} ({c.partner_email})</p>
                  <p className="text-xs text-slate-500 font-bold mt-0.5">Serviços: {c.service_type.replace(/,/g, ', ')}</p>
                  <p className="text-xs text-slate-500 mt-1 font-mono">Valor: ¥ {c.contract_value.toLocaleString()} / {c.periodicity}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {c.status === 'pending_signature' && (
                    <button
                      onClick={() => handleSimulateSignature(c.id)}
                      className="h-9 px-3 bg-blue-500 hover:bg-blue-600 text-white rounded text-[10px] font-black uppercase tracking-widest flex items-center gap-1"
                    >
                      <Mail size={12} /> Assinar p/ Email
                    </button>
                  )}

                  {c.status === 'signed' && (
                    <button
                      onClick={() => handleSimulatePayment(c.id)}
                      className="h-9 px-3 bg-green-500 hover:bg-green-600 text-white rounded text-[10px] font-black uppercase tracking-widest flex items-center gap-1"
                    >
                      <DollarSign size={12} /> Confirmar Pagamento (Liberar B2B)
                    </button>
                  )}

                  <a
                    href={c.pdf_path || `file:///home/lswitch/car-parts-marketplce/artifacts/contrato-yamato.pdf`}
                    target="_blank"
                    className="h-9 px-3 border border-black hover:bg-slate-50 rounded text-[10px] font-black uppercase tracking-widest flex items-center gap-1"
                  >
                    {c.language && (
                      <span className="px-1.5 py-0.5 bg-black text-white text-[8px] font-bold rounded mr-1">
                        {c.language.toUpperCase()}
                      </span>
                    )}
                    <Download size={12} /> Ver PDF
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Webhooks Tab */}
      {activeTab === 'webhooks' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-50 border-2 border-black rounded-xl p-5">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-4">Endpoints de Webhook Ativos</h3>
              {webhooks.length === 0 && (
                <p className="text-xs text-slate-500 py-4 font-bold uppercase">Nenhum webhook registrado.</p>
              )}
              <div className="space-y-3">
                {webhooks.map(w => (
                  <div key={w.id} className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between shadow-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold break-all">{w.webhook_url}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${w.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {w.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {w.events.map(ev => (
                          <span key={ev} className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded text-[9px] font-bold">
                            {ev}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleWebhookStatus(w.id, w.is_active)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        {w.is_active ? <ToggleRight size={20} className="text-slate-800" /> : <ToggleLeft size={20} className="text-slate-400" />}
                      </button>
                      <button onClick={() => handleDeleteWebhook(w.id)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white border-2 border-black rounded-xl p-5">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-4">Registrar Novo Webhook</h3>
              <form onSubmit={handleCreateWebhook} className="space-y-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Chave do Parceiro</label>
                  <select
                    value={selectedApiKeyId} onChange={e => setSelectedApiKeyId(e.target.value)}
                    className="w-full h-10 border-2 border-black rounded-lg px-3 text-xs font-bold outline-none bg-white"
                  >
                    <option value="">Selecione...</option>
                    {keys.map(k => (
                      <option key={k.id} value={k.id}>{k.partner_name} ({k.api_key_prefix}...)</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">URL de Destino</label>
                  <input
                    type="url" required value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)}
                    placeholder="https://seu-sistema.com/webhook"
                    className="w-full h-10 border-2 border-black rounded-lg px-3 text-xs font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Eventos Inscritos</label>
                  <div className="space-y-2 mt-2">
                    {['orders.updated', 'inventory.updated', 'shipments.delivered'].map(ev => (
                      <label key={ev} className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={webhookEvents.includes(ev)}
                          onChange={e => {
                            if (e.target.checked) {
                              setWebhookEvents([...webhookEvents, ev]);
                            } else {
                              setWebhookEvents(webhookEvents.filter(x => x !== ev));
                            }
                          }}
                          className="w-4 h-4 border-2 border-black rounded cursor-pointer accent-black"
                        />
                        <span>{ev}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <button
                  type="submit" disabled={loading || !selectedApiKeyId || !webhookUrl}
                  className="w-full h-10 bg-black text-white hover:bg-neutral-800 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <Plus size={14} /> Registrar Webhook
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Traffic Logs Tab */}
      {activeTab === 'logs' && (
        <div className="bg-slate-50 border-2 border-black rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Histórico de Requisições da API</h3>
            <button onClick={fetchLogs} className="flex items-center gap-1.5 h-8 px-3 border border-slate-300 hover:bg-slate-100 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors">
              <RefreshCw size={12} /> Atualizar Logs
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left divide-y divide-slate-200">
              <thead>
                <tr>
                  <th className="pb-3 text-xs font-black uppercase text-slate-500">Parceiro</th>
                  <th className="pb-3 text-xs font-black uppercase text-slate-500">Método/Endpoint</th>
                  <th className="pb-3 text-xs font-black uppercase text-slate-500">Status</th>
                  <th className="pb-3 text-xs font-black uppercase text-slate-500">Tempo de Resposta</th>
                  <th className="pb-3 text-xs font-black uppercase text-slate-500">IP de Origem</th>
                  <th className="pb-3 text-xs font-black uppercase text-slate-500">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-100 transition-colors">
                    <td className="py-3 font-bold">{log.api_key?.partner_name || 'Autenticação pública'}</td>
                    <td className="py-3">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-black uppercase mr-2 ${
                        log.method === 'GET' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {log.method}
                      </span>
                      <span className="font-mono">{log.endpoint}</span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        log.status_code >= 200 && log.status_code < 300 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {log.status_code}
                      </span>
                    </td>
                    <td className="py-3 font-mono font-bold text-slate-600">{log.response_time_ms} ms</td>
                    <td className="py-3 font-mono text-slate-500">{log.ip_address}</td>
                    <td className="py-3 text-slate-400 font-bold">
                      {new Date(log.created_at).toLocaleString('pt-BR')}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400 font-bold uppercase">Nenhum log registrado nas últimas 24h.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Carrier Integrations Tab */}
      {activeTab === 'carriers' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* YAMATO TRANSPORT SETTINGS */}
          <div className="bg-slate-50 border-2 border-black rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4 border-b border-slate-200 pb-2">
                <span className="text-lg">🐈⬛</span>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider">Yamato Transport (ヤマト運輸)</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Integração nativa B2 Cloud API</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">API Endpoint Url</label>
                  <input
                    type="text" value={yamatoConfig.endpoint} 
                    onChange={e => setYamatoConfig({...yamatoConfig, endpoint: e.target.value})}
                    className="w-full h-10 border-2 border-black rounded-lg px-3 text-xs font-bold outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Client ID</label>
                    <input
                      type="text" value={yamatoConfig.clientId} 
                      onChange={e => setYamatoConfig({...yamatoConfig, clientId: e.target.value})}
                      placeholder="client_id_******"
                      className="w-full h-10 border-2 border-black rounded-lg px-3 text-xs font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Client Secret</label>
                    <input
                      type="password" value={yamatoConfig.clientSecret} 
                      onChange={e => setYamatoConfig({...yamatoConfig, clientSecret: e.target.value})}
                      placeholder="••••••••••••••"
                      className="w-full h-10 border-2 border-black rounded-lg px-3 text-xs font-bold outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Customer Contract Code (顧客コード)</label>
                  <input
                    type="text" value={yamatoConfig.customerCode} 
                    onChange={e => setYamatoConfig({...yamatoConfig, customerCode: e.target.value})}
                    placeholder="12-digit Japanese Customer Code"
                    className="w-full h-10 border-2 border-black rounded-lg px-3 text-xs font-bold outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-200">
              <button 
                onClick={() => handleSaveCarrier('yamato')}
                className="h-10 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-black uppercase tracking-wider"
              >
                Salvar Configurações
              </button>
              <button 
                onClick={() => handleTestCarrier('yamato')}
                disabled={testingCarrier !== null}
                className="h-10 px-4 bg-black text-white hover:bg-neutral-800 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
              >
                <Play size={12} /> Testar Conexão
              </button>
            </div>
          </div>

          {/* SEINO TRANSPORTATION SETTINGS */}
          <div className="bg-slate-50 border-2 border-black rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4 border-b border-slate-200 pb-2">
                <span className="text-lg">🦘</span>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider">Seino Transportation (西濃運輸)</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Integração Kangaroo Web Service API</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">API Endpoint Url</label>
                  <input
                    type="text" value={seinoConfig.endpoint} 
                    onChange={e => setSeinoConfig({...seinoConfig, endpoint: e.target.value})}
                    className="w-full h-10 border-2 border-black rounded-lg px-3 text-xs font-bold outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Client ID / API Key</label>
                    <input
                      type="text" value={seinoConfig.clientId} 
                      onChange={e => setSeinoConfig({...seinoConfig, clientId: e.target.value})}
                      placeholder="seino_key_******"
                      className="w-full h-10 border-2 border-black rounded-lg px-3 text-xs font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Web Service Password</label>
                    <input
                      type="password" value={seinoConfig.password} 
                      onChange={e => setSeinoConfig({...seinoConfig, password: e.target.value})}
                      placeholder="••••••••••••••"
                      className="w-full h-10 border-2 border-black rounded-lg px-3 text-xs font-bold outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Customer Contract Code (顧客コード)</label>
                  <input
                    type="text" value={seinoConfig.customerCode} 
                    onChange={e => setSeinoConfig({...seinoConfig, customerCode: e.target.value})}
                    placeholder="Seino Contract Number"
                    className="w-full h-10 border-2 border-black rounded-lg px-3 text-xs font-bold outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-200">
              <button 
                onClick={() => handleSaveCarrier('seino')}
                className="h-10 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-black uppercase tracking-wider"
              >
                Salvar Configurações
              </button>
              <button 
                onClick={() => handleTestCarrier('seino')}
                disabled={testingCarrier !== null}
                className="h-10 px-4 bg-black text-white hover:bg-neutral-800 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
              >
                <Play size={12} /> Testar Conexão
              </button>
            </div>
          </div>

          {/* SIMULATION TEST RESULTS */}
          {(testingCarrier || testResult) && (
            <div className="lg:col-span-2 bg-slate-900 text-white border-2 border-black rounded-xl p-5 font-mono text-xs">
              <h4 className="text-xs font-black uppercase text-slate-400 mb-3 flex items-center gap-2">
                <ShieldCheck size={16} className="text-green-400" /> Console de Simulação Operacional
              </h4>

              {testingCarrier && (
                <div className="flex items-center gap-3 py-4">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Fazendo handshake de API com o servidor {testingCarrier === 'yamato' ? 'Yamato B2Cloud' : 'Seino Kangaroo Web Service'}...</span>
                </div>
              )}

              {testResult && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">STATUS:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      testResult.status === 'success' ? 'bg-green-500 text-black' : 'bg-red-500 text-white'
                    }`}>
                      {testResult.status === 'success' ? 'CONECTADO' : 'ERRO'}
                    </span>
                  </div>

                  {testResult.status === 'success' ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p><span className="text-slate-400">Transportadora:</span> {testResult.carrier}</p>
                          <p><span className="text-slate-400">Código Rastreamento:</span> <span className="font-black text-green-400">{testResult.tracking}</span></p>
                          <p><span className="text-slate-400">Timestamp:</span> {testResult.timestamp}</p>
                        </div>
                        <div className="border border-slate-700 rounded-lg p-3 bg-slate-950 flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] font-black text-slate-400 block mb-1 uppercase">Visualização da Etiqueta de Envio</span>
                            <div className="border-t border-dashed border-slate-700 my-1" />
                            <div className="py-2 flex items-center gap-2">
                              <FileText size={16} className="text-green-400" />
                              <div>
                                <span className="text-xs font-black text-white block">{testResult.tracking}</span>
                                <span className="text-[9px] text-slate-500 block">Formato ZPL gerado com sucesso</span>
                              </div>
                            </div>
                          </div>
                          <pre className="text-[8px] text-slate-500 overflow-x-auto bg-slate-900 p-2 rounded">{testResult.labelZpl}</pre>
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-400 block mb-1">Payload JSON Enviado (Simulação):</span>
                        <pre className="bg-slate-950 p-3 rounded-lg overflow-x-auto text-[10px] text-green-300 max-h-48">
                          {JSON.stringify(testResult.payloadSent, null, 2)}
                        </pre>
                      </div>
                    </>
                  ) : (
                    <p className="text-red-400 font-bold">{testResult.message}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* CREATE CONTRACT MODAL */}
      {showContractModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white border-2 border-black rounded-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <h3 className="text-base font-black uppercase">Gerar Novo Contrato B2B</h3>
              <button onClick={() => setShowContractModal(false)} className="text-slate-500 hover:text-black font-bold text-xs uppercase">Fechar</button>
            </div>

            <form onSubmit={handleCreateContractAndKey} className="space-y-3">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Nome da Empresa Parceira (Ex: Yamato Transport)</label>
                <input
                  type="text" required value={partnerName} onChange={e => setPartnerName(e.target.value)}
                  className="w-full h-10 border-2 border-black rounded-lg px-3 text-xs font-bold outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">E-mail Corporativo</label>
                <input
                  type="email" required value={partnerEmail} onChange={e => setPartnerEmail(e.target.value)}
                  className="w-full h-10 border-2 border-black rounded-lg px-3 text-xs font-bold outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Valor (¥)</label>
                  <input
                    type="number" required value={newContractVal} onChange={e => setNewContractVal(e.target.value)}
                    className="w-full h-10 border-2 border-black rounded-lg px-2 text-xs font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Periodicidade</label>
                  <select
                    value={contractPeriodicity} onChange={e => setContractPeriodicity(e.target.value)}
                    className="w-full h-10 border-2 border-black rounded-lg px-2 text-xs font-bold outline-none bg-white"
                  >
                    <option value="mensal">Mensal</option>
                    <option value="anual">Anual</option>
                    <option value="avulso">Avulso</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Idioma</label>
                  <select
                    value={contractLanguage} onChange={e => setContractLanguage(e.target.value)}
                    className="w-full h-10 border-2 border-black rounded-lg px-2 text-xs font-bold outline-none bg-white"
                  >
                    <option value="pt">Português</option>
                    <option value="en">English</option>
                    <option value="ja">日本語</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Restrição por Transportadora (Opcional)</label>
                <input
                  type="text" value={partnerCarrier} onChange={e => setPartnerCarrier(e.target.value)}
                  placeholder="Ex: Yamato Transport"
                  className="w-full h-10 border-2 border-black rounded-lg px-3 text-xs font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Restrição por CD (Opcional)</label>
                <select
                  value={partnerWarehouseId} onChange={e => setPartnerWarehouseId(e.target.value)}
                  className="w-full h-10 border-2 border-black rounded-lg px-3 text-xs font-bold outline-none bg-white"
                >
                  <option value="">Todos os Centros de Distribuição</option>
                  {armazens.map(a => (
                    <option key={a.id} value={a.id}>{a.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Serviços Habilitados</label>
                <div className="space-y-2 mt-1">
                  {[
                    { id: 'b2b_logistix', label: 'B2B Logistix API (Pedidos/Inventário)' },
                    { id: 'wms_gestor', label: 'Gestor de Armazém WMS' },
                    { id: 'tms_rotas', label: 'Roteamento Avançado TMS' }
                  ].map(srv => (
                    <label key={srv.id} className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(srv.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedServices([...selectedServices, srv.id]);
                          } else {
                            setSelectedServices(selectedServices.filter(x => x !== srv.id));
                          }
                        }}
                        className="w-4 h-4 border-2 border-black rounded cursor-pointer accent-black"
                      />
                      <span>{srv.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full h-11 bg-black text-white hover:bg-neutral-800 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
              >
                {loading ? 'Processando...' : 'Gerar Contrato Automático'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
