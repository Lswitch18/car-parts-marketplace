import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/modules/identity/store/authStore'
import { useTenantCore } from '@/modules/shared/hooks/useTenantCore'
import { 
  Building2, Package, QrCode, Wrench, Globe, Sparkles, 
  Search, ShieldCheck, AlertCircle, RefreshCw, Car, FileText, 
  ShoppingCart, DollarSign, Key, Cpu, Tag, CheckCircle2, 
  Plus, Eye, Filter, ArrowRight, Layers, Smartphone, Upload, Camera, Check
} from 'lucide-react'

type TabType = 
  | 'overview' 
  | 'ai-cataloger' 
  | 'vin-lookup' 
  | 'vehicles' 
  | 'inventory' 
  | 'purchases' 
  | 'sales' 
  | 'finance' 
  | 'b2b-network' 
  | 'api-integrations'

export default function TenantDashboard() {
  const navigate = useNavigate()
  const { user, initialized, loading: authLoading } = useAuthStore()
  
  // Clean Architecture Hook
  const {
    filteredParts,
    stats,
    isLoading,
    refetch,
    searchQuery,
    setSearchQuery,
    filterCategory,
    setFilterCategory,
    selectedPartIds,
    handleSelectAll,
    handleSelectOne,
    toastMessage,
    togglePublish,
    batchPublish,
  } = useTenantCore()

  const [activeTab, setActiveTab] = useState<TabType>('overview')

  // Estado do Módulo: Cadastro Automático por IA
  const [aiForm, setAiForm] = useState({
    title: '',
    oem_code: '',
    category: 'Motor & Periféricos',
    price: '',
    cost_price: '',
    compatibility_tags: 'Honda Fit (2015-2020), Toyota Prius ZVW30, Nissan Note E12',
    description: '',
    is_published_to_marketplace: false,
  })
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false)
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null)

  // Estado do Módulo: Pesquisa por Placa / VIN
  const [vinSearchQuery, setVinSearchQuery] = useState('')

  // Estado do Módulo: Cadastro de Veículo para Desmonte
  const [vehicleForm, setVehicleForm] = useState({
    brand: 'Toyota',
    model: 'Prius ZVW30',
    year: '2018',
    license_plate: '品川 300 な 45-89',
    vin: 'JTDKN3DU0J0129845',
    mileage: '85.000 km',
    dismantle_status: 'em_desmonte'
  })
  const [vehiclesList, setVehiclesList] = useState([
    { id: 'v1', brand: 'Toyota', model: 'Prius ZVW30', year: '2018', plate: '品川 300 な 45-89', vin: 'JTDKN3DU0J0129845', parts_count: 34, status: 'Em Desmonte' },
    { id: 'v2', brand: 'Honda', model: 'Fit GK3', year: '2017', plate: '横浜 501 き 12-34', vin: 'HGK31004589', parts_count: 22, status: 'Concluído' },
    { id: 'v3', brand: 'Nissan', model: 'Skyline R34 GT-R', year: '2001', plate: '大宮 330 さ 99-88', vin: 'BNR34001928', parts_count: 18, status: 'Aguardando Doca' },
  ])

  // Estado do Módulo: Compras & NF-e
  const [purchaseInvoices, setPurchaseInvoices] = useState([
    { id: 'nfe-1092', key: '35260710049284000192550010000010921', supplier: 'Leilão Automotivo Tokyo Bay', date: '2026-07-22', value: 450000, status: 'Processada' },
    { id: 'nfe-1093', key: '35260710049284000192550010000010932', supplier: 'Seguradora Sompo Japan', date: '2026-07-26', value: 890000, status: 'Aguardando Estoque' },
  ])

  // Estado do Módulo: Vendas & PDV Balcão
  const [salesList, setSalesList] = useState([
    { id: 'venda-881', customer: 'Oficina Takahashi Auto', items: 'Farol LED Prius ZVW30', total: 45000, date: 'Hoje, 14:30', channel: 'Balcão / PDV' },
    { id: 'venda-882', customer: 'Hiroshi Tanaka (Cliente B2C)', items: 'Turbo RB26DETT Nismo', total: 185000, date: 'Hoje, 11:15', channel: 'Marketplace DAIG (1-Clique)' },
  ])

  // Estado do Módulo: API Integrações ERP
  const [apiKey, setApiKey] = useState('daig_live_sk_tenant_99482710398412')
  const [copiedKey, setCopiedKey] = useState(false)

  // Redirecionar se não estiver autenticado
  if (initialized && !authLoading && !user) {
    navigate('/login', { replace: true })
    return null
  }

  const tenantName = user?.name || 'Tokyo Auto Parts & Dismantler'
  const tenantId = user?.id ? `tenant_${user.id.slice(0, 8)}` : 'tenant_demo_01'

  // Simular Cadastro Automático por IA
  const handleSimulateAiScan = () => {
    setIsAiAnalyzing(true)
    setAiSuccessMessage(null)
    setTimeout(() => {
      setAiForm({
        title: 'Módulo de Injeção Eletrônica ECU Engine Control Unit',
        oem_code: 'OEM-37820-5R0-J61',
        category: 'Injeção Eletrônica & Sensores',
        price: '38000',
        cost_price: '12000',
        compatibility_tags: 'Honda Fit GK3 (2015-2020), Honda Vezel RU1, Honda Shuttle GP7',
        description: 'Módulo ECU testado no scanner diagnóstico. Sem falhas de circuito, com certidão de desmonte e garantia de 90 dias.',
        is_published_to_marketplace: true,
      })
      setIsAiAnalyzing(false)
      setAiSuccessMessage('IA identificou a peça e preencheu o formulário completo com tags de compatibilidade!')
    }, 1500)
  }

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault()
    setVehiclesList(prev => [
      {
        id: `v_${Date.now()}`,
        brand: vehicleForm.brand,
        model: vehicleForm.model,
        year: vehicleForm.year,
        plate: vehicleForm.license_plate,
        vin: vehicleForm.vin,
        parts_count: 0,
        status: 'Em Desmonte'
      },
      ...prev
    ])
    setVehicleForm({
      brand: '',
      model: '',
      year: '',
      license_plate: '',
      vin: '',
      mileage: '',
      dismantle_status: 'em_desmonte'
    })
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 sm:p-6 lg:p-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-xl flex items-center space-x-2 animate-bounce">
          <ShieldCheck className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header do Tenant / Organização */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
          <div className="flex items-center space-x-4">
            <div className="p-3.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl text-white shadow-lg shadow-blue-500/20">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">{tenantName}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {tenantId}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1 flex items-center space-x-2">
                <span>Sistema de Gestão SaaS ERP/WMS Multi-Tenant</span>
                <span>•</span>
                <span className="text-emerald-400 font-medium flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Banco de Dados Isolado
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('ai-cataloger')}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm flex items-center space-x-2 shadow-lg shadow-blue-600/20 transition"
            >
              <Sparkles className="w-4 h-4 text-blue-200 animate-spin" />
              <span>Novo Cadastro com IA (30s)</span>
            </button>
            <Link
              to="/catalog"
              className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-sm font-semibold flex items-center space-x-2 transition border border-zinc-700"
            >
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Ver Marketplace DAIG</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Navegação por Abas dos 10 Módulos do SaaS */}
      <div className="max-w-7xl mx-auto mb-8 overflow-x-auto">
        <div className="flex items-center space-x-1.5 bg-zinc-900/90 border border-zinc-800 p-1.5 rounded-2xl min-w-max">
          {[
            { id: 'overview', label: '📊 Visão Geral', icon: Package },
            { id: 'ai-cataloger', label: '🤖 Cadastro IA Automático', icon: Sparkles },
            { id: 'vin-lookup', label: '🔎 Busca Placa/VIN', icon: Search },
            { id: 'vehicles', label: '🚗 Veículos & Desmonte', icon: Car },
            { id: 'inventory', label: '📦 Estoque & Fotos HD', icon: Layers },
            { id: 'purchases', label: '📑 Compras & NF-e', icon: FileText },
            { id: 'sales', label: '🛒 Vendas & PDV', icon: ShoppingCart },
            { id: 'finance', label: '💰 Módulo Financeiro', icon: DollarSign },
            { id: 'b2b-network', label: '🤝 Rede Desmanches B2B', icon: Building2 },
            { id: 'api-integrations', label: '🔌 API & Integrações ERP', icon: Key },
          ].map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* CONTEÚDO DAS ABAS */}
      <div className="max-w-7xl mx-auto">
        
        {/* ABA 1: VISÃO GERAL / KPIS */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Estoque Privado</span>
                  <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg"><Package className="w-5 h-5" /></div>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-extrabold text-white">{stats.totalSKUs} <span className="text-sm font-normal text-zinc-500">peças</span></div>
                  <p className="text-xs text-blue-400 font-mono mt-1">Valor: ¥ {stats.totalPrivateValue.toLocaleString('ja-JP')} JPY</p>
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Veículos em Desmonte</span>
                  <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg"><Car className="w-5 h-5" /></div>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-extrabold text-white">{vehiclesList.length} <span className="text-sm font-normal text-zinc-500">veículos</span></div>
                  <p className="text-xs text-purple-400 mt-1">74 peças catalogadas este mês</p>
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Vendas do Mês</span>
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg"><ShoppingCart className="w-5 h-5" /></div>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-extrabold text-emerald-400">¥ 1.420.000 <span className="text-sm font-normal text-zinc-500">JPY</span></div>
                  <p className="text-xs text-zinc-400 mt-1">Balcão (65%) • Marketplace (35%)</p>
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Divulgação 1-Clique</span>
                  <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg"><Globe className="w-5 h-5" /></div>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-extrabold text-white">{stats.publishedCount} <span className="text-sm font-normal text-zinc-500">online</span></div>
                  <p className="text-xs text-amber-400 mt-1">{stats.privateCount} mantidas privadas</p>
                </div>
              </div>
            </div>

            {/* Ações de Atalho Rápido */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4">Atalhos Operacionais da Empresa</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('ai-cataloger')}
                  className="p-4 bg-zinc-950 border border-zinc-800 hover:border-blue-500/50 rounded-xl text-left transition group"
                >
                  <Sparkles className="w-6 h-6 text-blue-400 mb-2 group-hover:scale-110 transition" />
                  <p className="font-semibold text-white text-sm">Cadastro Automático por IA</p>
                  <p className="text-xs text-zinc-500 mt-1">Preenchimento com foto e tags de compatibilidade</p>
                </button>

                <button
                  onClick={() => setActiveTab('vin-lookup')}
                  className="p-4 bg-zinc-950 border border-zinc-800 hover:border-purple-500/50 rounded-xl text-left transition group"
                >
                  <Search className="w-6 h-6 text-purple-400 mb-2 group-hover:scale-110 transition" />
                  <p className="font-semibold text-white text-sm">Pesquisa Placa / VIN</p>
                  <p className="text-xs text-zinc-500 mt-1">Localização instantânea de peças por chassi ou placa</p>
                </button>

                <button
                  onClick={() => setActiveTab('vehicles')}
                  className="p-4 bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 rounded-xl text-left transition group"
                >
                  <Car className="w-6 h-6 text-emerald-400 mb-2 group-hover:scale-110 transition" />
                  <p className="font-semibold text-white text-sm">Entrada de Veículos</p>
                  <p className="text-xs text-zinc-500 mt-1">Registro de carros recebidos para desmonte</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: CADASTRO AUTOMÁTICO COM IA */}
        {activeTab === 'ai-cataloger' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl max-w-4xl mx-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                  Cadastro Automático de Peças com IA
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  A IA analisa a foto, preenche o formulário completo e adiciona tags de compatibilidade automáticas.
                </p>
              </div>
              <button
                onClick={handleSimulateAiScan}
                disabled={isAiAnalyzing}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 transition shadow-lg shadow-blue-600/20"
              >
                <Camera className="w-4 h-4" />
                <span>{isAiAnalyzing ? 'Analisando Imagem com IA...' : 'Escanear Foto de Peça'}</span>
              </button>
            </div>

            {aiSuccessMessage && (
              <div className="mb-6 p-4 bg-emerald-950/60 border border-emerald-800 rounded-xl text-emerald-300 text-xs font-medium flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span>{aiSuccessMessage}</span>
              </div>
            )}

            <form className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Nome da Peça / Produto *</label>
                  <input
                    type="text"
                    value={aiForm.title}
                    onChange={(e) => setAiForm({ ...aiForm, title: e.target.value })}
                    placeholder="Ex: Farol Dianteiro LED Esquerdo"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Código OEM / Part Number</label>
                  <input
                    type="text"
                    value={aiForm.oem_code}
                    onChange={(e) => setAiForm({ ...aiForm, oem_code: e.target.value })}
                    placeholder="Ex: OEM-33100-T9A-T21"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Categoria</label>
                  <select
                    value={aiForm.category}
                    onChange={(e) => setAiForm({ ...aiForm, category: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-blue-500 transition"
                  >
                    <option>Motor & Periféricos</option>
                    <option>Transmissão & Câmbio</option>
                    <option>Lataria & Iluminação</option>
                    <option>Suspensão & Freios</option>
                    <option>Injeção Eletrônica & Sensores</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Preço de Venda (JPY ¥) *</label>
                  <input
                    type="number"
                    value={aiForm.price}
                    onChange={(e) => setAiForm({ ...aiForm, price: e.target.value })}
                    placeholder="38000"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-white focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Preço de Custo Privado (JPY ¥)</label>
                  <input
                    type="number"
                    value={aiForm.cost_price}
                    onChange={(e) => setAiForm({ ...aiForm, cost_price: e.target.value })}
                    placeholder="12000"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-300 focus:border-blue-500 transition"
                  />
                </div>
              </div>

              {/* Tags de Compatibilidade Automáticas da IA */}
              <div>
                <label className="block text-xs font-semibold text-amber-400 mb-1 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  Tags de Compatibilidade Veicular (Geradas pela IA)
                </label>
                <input
                  type="text"
                  value={aiForm.compatibility_tags}
                  onChange={(e) => setAiForm({ ...aiForm, compatibility_tags: e.target.value })}
                  placeholder="Ex: Honda Fit GK3, Toyota Prius ZVW30, Nissan Note E12"
                  className="w-full bg-zinc-950 border border-amber-500/30 rounded-xl px-4 py-2.5 text-sm font-mono text-amber-200 focus:border-amber-500 transition"
                />
                <p className="text-[11px] text-zinc-500 mt-1">Essas tags permitem encontrar a peça ao pesquisar por qualquer modelo ou ano compatível.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Descrição Técnica da Peça</label>
                <textarea
                  rows={3}
                  value={aiForm.description}
                  onChange={(e) => setAiForm({ ...aiForm, description: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:border-blue-500 transition"
                />
              </div>

              {/* Chave de Publicação em 1-Clique */}
              <div className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-xs font-bold text-white">Publicar Simultaneamente no Marketplace DAIG</p>
                    <p className="text-[11px] text-zinc-500">Expor esta peça com 1 clique para compradores públicos do Japão</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={aiForm.is_published_to_marketplace}
                  onChange={(e) => setAiForm({ ...aiForm, is_published_to_marketplace: e.target.checked })}
                  className="w-5 h-5 rounded bg-zinc-900 border-zinc-700 text-emerald-500 focus:ring-0 cursor-pointer"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    alert('Peça salva no estoque privado com sucesso!')
                    refetch()
                  }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl transition shadow-lg shadow-emerald-600/20"
                >
                  Salvar Peça no Estoque Privado do Tenant
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ABA 3: PESQUISA POR PLACA / VIN */}
        {activeTab === 'vin-lookup' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Search className="w-5 h-5 text-purple-400" />
              Pesquisa Avançada por Placa, Chassi (VIN) ou Modelo
            </h2>
            <p className="text-xs text-zinc-400 mb-6">
              Localize instantaneamente qualquer peça no seu armazém digitando o Chassi, Placa ou Modelo do carro desmontado.
            </p>

            <div className="flex gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={vinSearchQuery}
                  onChange={(e) => setVinSearchQuery(e.target.value)}
                  placeholder="Digite a Placa (ex: 品川 300 な 45-89), VIN (ex: JTDKN3DU0J) ou Modelo (ex: Prius)..."
                  className="w-full bg-zinc-950 border border-zinc-800 text-sm text-white pl-10 pr-4 py-3 rounded-xl focus:border-purple-500 transition"
                />
              </div>
              <button className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-purple-600/20">
                Buscar Peças
              </button>
            </div>

            <div className="border border-dashed border-zinc-800 rounded-xl p-8 text-center">
              <Car className="w-10 h-10 text-purple-400 mx-auto mb-2 opacity-60" />
              <p className="text-sm font-semibold text-white">Pronto para Busca por Placa/VIN</p>
              <p className="text-xs text-zinc-500 mt-1">Digite os dados acima para filtrar componentes vinculados aos veículos em desmonte.</p>
            </div>
          </div>
        )}

        {/* ABA 4: CADASTRO DE VEÍCULOS PARA DESMONTE */}
        {activeTab === 'vehicles' && (
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Car className="w-5 h-5 text-emerald-400" />
                Entrada de Veículos para Desmonte
              </h2>

              <form onSubmit={handleAddVehicle} className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-6">
                <input
                  type="text"
                  placeholder="Marca (ex: Toyota)"
                  value={vehicleForm.brand}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, brand: e.target.value })}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                  required
                />
                <input
                  type="text"
                  placeholder="Modelo (ex: Prius ZVW30)"
                  value={vehicleForm.model}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                  required
                />
                <input
                  type="text"
                  placeholder="Ano (ex: 2018)"
                  value={vehicleForm.year}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, year: e.target.value })}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Placa Japonesa"
                  value={vehicleForm.license_plate}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, license_plate: e.target.value })}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Chassi / VIN"
                  value={vehicleForm.vin}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, vin: e.target.value })}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl px-4 py-2 transition"
                >
                  Registrar Veículo
                </button>
              </form>

              {/* Lista de Veículos em Desmonte */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400 text-xs">
                      <th className="py-2.5 px-3">Veículo</th>
                      <th className="py-2.5 px-3">Placa Japão</th>
                      <th className="py-2.5 px-3">Chassi / VIN</th>
                      <th className="py-2.5 px-3">Peças Catalogadas</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-zinc-200">
                    {vehiclesList.map(v => (
                      <tr key={v.id} className="hover:bg-zinc-800/40">
                        <td className="py-3 px-3 font-semibold text-white">{v.brand} {v.model} ({v.year})</td>
                        <td className="py-3 px-3 font-mono text-xs">{v.plate}</td>
                        <td className="py-3 px-3 font-mono text-xs text-zinc-400">{v.vin}</td>
                        <td className="py-3 px-3 text-emerald-400 font-bold">{v.parts_count} peças</td>
                        <td className="py-3 px-3">
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {v.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ABA 5: CONTROLE DE ESTOQUE & FOTOS HD (COM CHAVE 1-CLIQUE) */}
        {activeTab === 'inventory' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome, código OEM ou categoria..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setFilterCategory('all')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                    filterCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  Todas ({stats.totalSKUs})
                </button>
                <button
                  onClick={() => setFilterCategory('published')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                    filterCategory === 'published' ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  Publicadas no DAIG ({stats.publishedCount})
                </button>
                <button
                  onClick={() => setFilterCategory('private')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                    filterCategory === 'private' ? 'bg-zinc-700 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  Gestão Privada ({stats.privateCount})
                </button>
              </div>
            </div>

            {/* Ações em Lote */}
            {selectedPartIds.length > 0 && (
              <div className="mb-4 p-3 bg-blue-950/60 border border-blue-800/80 rounded-xl flex items-center justify-between">
                <span className="text-xs font-medium text-blue-300">{selectedPartIds.length} peça(s) selecionada(s)</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => batchPublish('available')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition"
                  >
                    Publicar no Marketplace em 1 Clique
                  </button>
                  <button
                    onClick={() => batchPublish('draft')}
                    className="px-3 py-1.5 bg-zinc-800 text-zinc-300 text-xs font-semibold rounded-lg transition border border-zinc-700"
                  >
                    Reverter para Privado
                  </button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 font-medium text-xs">
                    <th className="py-3 px-3 w-10">
                      <input
                        type="checkbox"
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        checked={selectedPartIds.length === filteredParts.length && filteredParts.length > 0}
                        className="rounded bg-zinc-950 border-zinc-700 text-blue-600 focus:ring-0"
                      />
                    </th>
                    <th className="py-3 px-4">Peça / Produto</th>
                    <th className="py-3 px-4">OEM / Código</th>
                    <th className="py-3 px-4">Local WMS (Prateleira)</th>
                    <th className="py-3 px-4">Preço Estoque</th>
                    <th className="py-3 px-4 text-center">Divulgação no Marketplace</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-200">
                  {filteredParts.map((part) => {
                    const isPublished = part.status === 'available'
                    const isSelected = selectedPartIds.includes(part.id)

                    return (
                      <tr key={part.id} className={`hover:bg-zinc-800/40 transition ${isSelected ? 'bg-blue-950/20' : ''}`}>
                        <td className="py-3.5 px-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectOne(part.id)}
                            className="rounded bg-zinc-950 border-zinc-700 text-blue-600 focus:ring-0"
                          />
                        </td>
                        <td className="py-3.5 px-4 font-medium text-white">
                          <div className="flex items-center space-x-3">
                            {part.images?.[0] ? (
                              <img src={part.images[0]} alt={part.title} className="w-10 h-10 rounded-lg object-cover bg-zinc-800 border border-zinc-700 flex-shrink-0" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-500 flex-shrink-0">
                                <Package className="w-5 h-5" />
                              </div>
                            )}
                            <div>
                              <p className="line-clamp-1 font-semibold text-white">{part.title}</p>
                              <p className="text-xs text-zinc-400">{part.category || 'Peça Automotiva'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-zinc-300">{part.oem_code || 'OEM-PENDENTE'}</td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono bg-zinc-800 text-amber-300 border border-zinc-700">
                            <QrCode className="w-3 h-3 mr-1 text-amber-400" /> Prateleira B-04
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-white">¥ {Number(part.price || 0).toLocaleString('ja-JP')} JPY</td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => togglePublish(part.id, isPublished)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                              isPublished ? 'bg-emerald-500' : 'bg-zinc-700'
                            }`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPublished ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                          <span className={`block text-[11px] mt-1 font-medium ${isPublished ? 'text-emerald-400' : 'text-zinc-500'}`}>
                            {isPublished ? 'Publicado no DAIG' : 'Estoque Privado'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 6: COMPRAS & ENTRADA POR NF-E */}
        {activeTab === 'purchases' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Compras & Entrada por Nota Fiscal (NF-e / XML)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 text-xs">
                    <th className="py-2.5 px-3">Nota Fiscal / Chave</th>
                    <th className="py-2.5 px-3">Fornecedor / Leilão</th>
                    <th className="py-2.5 px-3">Data de Entrada</th>
                    <th className="py-2.5 px-3">Valor Total (JPY)</th>
                    <th className="py-2.5 px-3">Status NF-e</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-200">
                  {purchaseInvoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-zinc-800/40">
                      <td className="py-3 px-3 font-mono text-xs text-white">{inv.id}</td>
                      <td className="py-3 px-3 font-semibold text-white">{inv.supplier}</td>
                      <td className="py-3 px-3 text-xs text-zinc-400">{inv.date}</td>
                      <td className="py-3 px-3 font-bold text-white">¥ {inv.value.toLocaleString('ja-JP')} JPY</td>
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 7: VENDAS & PDV BALCÃO */}
        {activeTab === 'sales' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-emerald-400" />
              Vendas & PDV Balcão
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 text-xs">
                    <th className="py-2.5 px-3">Pedido / Venda</th>
                    <th className="py-2.5 px-3">Cliente / Destino</th>
                    <th className="py-2.5 px-3">Itens</th>
                    <th className="py-2.5 px-3">Canal de Venda</th>
                    <th className="py-2.5 px-3">Total (JPY)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-zinc-200">
                  {salesList.map(sale => (
                    <tr key={sale.id} className="hover:bg-zinc-800/40">
                      <td className="py-3 px-3 font-mono text-xs text-white">{sale.id}</td>
                      <td className="py-3 px-3 font-semibold text-white">{sale.customer}</td>
                      <td className="py-3 px-3 text-xs text-zinc-300">{sale.items}</td>
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {sale.channel}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-extrabold text-emerald-400">¥ {sale.total.toLocaleString('ja-JP')} JPY</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 8: MÓDULO FINANCEIRO */}
        {activeTab === 'finance' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              Módulo Financeiro & Repasses Stripe Connect
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                <span className="text-xs text-zinc-400">Faturamento Bruto</span>
                <p className="text-2xl font-bold text-white mt-1">¥ 1.420.000 JPY</p>
              </div>
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                <span className="text-xs text-zinc-400">Saldo em Custódia (Escrow Aprovado)</span>
                <p className="text-2xl font-bold text-sky-400 mt-1">¥ 185.000 JPY</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">Aguardando confirmação de entrega do comprador</p>
              </div>
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                <span className="text-xs text-zinc-400">Repassado via Stripe Connect</span>
                <p className="text-2xl font-bold text-emerald-400 mt-1">¥ 755.000 JPY</p>
                <p className="text-[11px] text-emerald-400/80 mt-0.5">Depositado na conta bancária vinculada</p>
              </div>
            </div>

            {/* Painel Stripe Connect Express / Custom */}
            <div className="p-5 bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-800/60 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-white text-sm">Conta Stripe Connect Express (Japão)</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Ativa & Conectada
                  </span>
                </div>
                <p className="text-xs text-zinc-300">
                  Sua conta bancária japonesa (Furikomi) está configurada para receber repasses automáticos de 90% do valor de cada venda assim que a entrega for confirmada.
                </p>
              </div>

              <div className="flex items-center space-x-3 flex-shrink-0">
                <Link
                  to="/admin/transactions"
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition shadow-lg shadow-indigo-600/20 flex items-center space-x-2"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Gerenciar Repasses Escrow</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ABA 9: REDE B2B DE DESMANCHES */}
        {activeTab === 'b2b-network' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              Marketplace Interno entre Desmanches (Rede B2B)
            </h2>
            <p className="text-xs text-zinc-400 mb-6">
              Compre e troque peças raras direto com outros desmanches parceiros cadastrados na rede privada DAIG.
            </p>
            <div className="border border-dashed border-zinc-800 rounded-xl p-8 text-center">
              <Building2 className="w-10 h-10 text-blue-400 mx-auto mb-2 opacity-60" />
              <p className="text-sm font-semibold text-white">Rede B2B Ativa no Japão</p>
              <p className="text-xs text-zinc-500 mt-1">50 oficinas e desmanches em Kanagawa e Tóquio conectados.</p>
            </div>
          </div>
        )}

        {/* ABA 10: API & INTEGRAÇÃO COM ERPS */}
        {activeTab === 'api-integrations' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-400" />
              API para Integração com ERPs Externos
            </h2>
            <p className="text-xs text-zinc-400 mb-6">
              Conecte seu sistema legado via API REST para sincronizar estoque, peças e Ordens de Serviço (O.S.).
            </p>

            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 mb-6">
              <label className="block text-xs text-zinc-400 mb-2">Chave Secreta da API (API Key)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={apiKey}
                  readOnly
                  className="w-full bg-zinc-900 border border-zinc-700 text-xs font-mono text-amber-300 p-2.5 rounded-lg"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(apiKey)
                    setCopiedKey(true)
                    setTimeout(() => setCopiedKey(false), 2000)
                  }}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg transition"
                >
                  {copiedKey ? 'Copiado!' : 'Copiar Key'}
                </button>
              </div>
            </div>

            <div className="space-y-2 text-xs font-mono text-zinc-400 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
              <p className="text-zinc-200 font-bold text-sm mb-1">Endpoints da API REST:</p>
              <p><span className="text-emerald-400">GET</span> /api/v1/tenant/inventory</p>
              <p><span className="text-blue-400">POST</span> /api/v1/tenant/parts</p>
              <p><span className="text-purple-400">POST</span> /api/v1/tenant/work-orders</p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
