import { useState, useMemo, useRef } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuthStore } from '@/modules/identity/store/authStore'
import { useTenantCore } from '@/modules/shared/hooks/useTenantCore'
import { supabase } from '@/modules/shared/lib/supabase'
import QRStickerPrint from '@/modules/backoffice/components/QRStickerPrint'
import { 
  Menu, Car, Search, Moon, Bell, MessageSquare, Plus, 
  LayoutDashboard, Package, Tag, ShoppingCart, Users, Building2, 
  Box, Activity, FileText, Eye, Globe, AlertCircle, Settings, 
  DollarSign, AlertTriangle, ArrowRight, Upload, SlidersHorizontal, 
  X, Check, Printer, Filter, RefreshCw, ShieldCheck, ChevronRight, LogOut,
  Sparkles, CheckCircle2, ArrowUpRight
} from 'lucide-react'

type TabType = 
  | 'dashboard'
  | 'pecas'
  | 'categorias'
  | 'veiculos'
  | 'pedidos'
  | 'clientes'
  | 'fornecedores'
  | 'estoque'
  | 'movimentacoes'
  | 'relatorios'
  | 'visao-ia'
  | 'marketplace'
  | 'alertas'
  | 'configuracoes'

/**
 * 🛒 PAINEL DO VENDEDOR / COMPRADOR DO MARKETPLACE DAIG
 * Tela clara, limpa e moderna ("AutoParts Gestão Inteligente") focada em vendas do Marketplace.
 */
export default function Dashboard() {
  const navigate = useNavigate()
  const { user, initialized, loading: authLoading } = useAuthStore()
  
  // Hook de Dados Core
  const {
    filteredParts,
    refetch,
  } = useTenantCore()

  // Tab Ativa no Menu Lateral
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')

  // Estados de Pesquisa e Filtro
  const [headerSearch, setHeaderSearch] = useState('')
  const [tableCategory, setTableCategory] = useState('all')
  const [tableSearch, setTableSearch] = useState('')
  const [darkMode, setDarkMode] = useState(false)

  // Visão Computacional IA Mock & Upload State
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [aiImagePreview, setAiImagePreview] = useState<string>(
    '/parts/turbo_ihi_vf52.png'
  )
  const [aiConfidence, setAiConfidence] = useState<number>(98.7)
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false)

  // Modais
  const [showNovaPecaModal, setShowNovaPecaModal] = useState(false)
  const [showNovoPedidoModal, setShowNovoPedidoModal] = useState(false)
  const [showEntradaEstoqueModal, setShowEntradaEstoqueModal] = useState(false)
  const [printingStickerPart, setPrintingStickerPart] = useState<any | null>(null)

  // Form State: Nova Peça
  const [novaPecaForm, setNovaPecaForm] = useState({
    title: '',
    oem_code: '',
    category: 'Motor & Periféricos',
    price: '',
    cost_price: '',
    stock: '1',
    compatibility: '',
    description: '',
    location: 'Galpão A - Prateleira 02'
  })
  const [savingPart, setSavingPart] = useState(false)

  // Peças de demonstração do Marketplace
  const defaultDemoParts = [
    {
      id: 'demo-1',
      title: 'Kit Tampas de Válvula de Pneu AutoParts Premium',
      oem_code: 'OEM-VALVE-991',
      category: 'Acessórios & Tuning',
      compatibility: 'Universal (Todos os modelos)',
      stock: 45,
      price: 89.90,
      status: 'Em Estoque',
      wms_location: 'Corredor A • Estante 01'
    },
    {
      id: 'demo-2',
      title: 'Farol Dianteiro Full LED Esquerdo ZVW30',
      oem_code: 'OEM-33100-47820',
      category: 'Lataria & Iluminação',
      compatibility: 'Toyota Prius ZVW30 (2015-2022)',
      stock: 12,
      price: 1450.00,
      status: 'Em Estoque',
      wms_location: 'Corredor B • Estante 04'
    },
    {
      id: 'demo-3',
      title: 'Módulo ECU de Injeção Eletrônica GK3',
      oem_code: 'OEM-37820-5R0-J61',
      category: 'Injeção & Sensores',
      compatibility: 'Honda Fit GK3 (2015-2020)',
      stock: 3,
      price: 2380.00,
      status: 'Baixo Estoque',
      wms_location: 'Corredor C • Estante 02'
    },
    {
      id: 'demo-4',
      title: 'Conjunto Twin-Turbo RB26DETT Nismo Spec-R',
      oem_code: 'OEM-14411-AA300',
      category: 'Motor & Periféricos',
      compatibility: 'Nissan Skyline GT-R R32/R33/R34',
      stock: 2,
      price: 8500.00,
      status: 'Em Estoque',
      wms_location: 'Corredor A • Estante 05'
    },
    {
      id: 'demo-5',
      title: 'Pastilhas de Freio Cerâmica Brembo Frontal',
      oem_code: 'OEM-BRM-008912',
      category: 'Freios & Suspensão',
      compatibility: 'Subaru Impreza WRX STI (2011-2020)',
      stock: 28,
      price: 640.00,
      status: 'Em Estoque',
      wms_location: 'Corredor D • Estante 01'
    }
  ]

  // Lista combinada de peças
  const displayParts = useMemo(() => {
    const sourceParts = (filteredParts && filteredParts.length > 0) ? filteredParts : defaultDemoParts
    return sourceParts.filter(part => {
      const titleMatches = (part.title || '').toLowerCase().includes(tableSearch.toLowerCase()) ||
                           (part.oem_code || '').toLowerCase().includes(tableSearch.toLowerCase())
      const catMatches = tableCategory === 'all' || part.category === tableCategory
      return titleMatches && catMatches
    })
  }, [filteredParts, tableSearch, tableCategory])

  // Upload para Visão Computacional
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsAiAnalyzing(true)
    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setAiImagePreview(event.target.result as string)
        setTimeout(() => {
          setIsAiAnalyzing(false)
          setAiConfidence(99.4)
        }, 1200)
      }
    }
    reader.readAsDataURL(file)
  }

  // Cadastrar Nova Peça
  const handleSaveNovaPeca = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingPart(true)
    try {
      if (user) {
        await supabase.from('parts').insert({
          title: novaPecaForm.title,
          oem_code: novaPecaForm.oem_code,
          category: novaPecaForm.category,
          price: parseFloat(novaPecaForm.price) || 0,
          cost_price: parseFloat(novaPecaForm.cost_price) || 0,
          stock: parseInt(novaPecaForm.stock) || 1,
          compatibility: novaPecaForm.compatibility,
          description: novaPecaForm.description,
          location: novaPecaForm.location,
          seller_id: user.id,
          status: 'active'
        })
      }
      refetch()
      setShowNovaPecaModal(false)
      setNovaPecaForm({
        title: '', oem_code: '', category: 'Motor & Periféricos',
        price: '', cost_price: '', stock: '1', compatibility: '', description: '', location: 'Galpão A'
      })
    } catch (err) {
      console.error(err)
    } finally {
      setSavingPart(false)
    }
  }

  if (initialized && !authLoading && !user) {
    navigate('/login', { replace: true })
    return null
  }

  return (
    <div className={`min-h-screen font-sans ${darkMode ? 'bg-slate-900 text-white' : 'bg-[#f8fafc] text-slate-800'} flex flex-col`}>
      
      {/* ════════════════ HEADER BAR ════════════════ */}
      <header className="bg-white border-b border-slate-100 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        
        {/* Left: Hamburger & Logo */}
        <div className="flex items-center gap-4">
          <button 
            type="button"
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo Brand: AutoParts Gestão Inteligente */}
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              <Car className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-slate-900 leading-none tracking-tight">AutoParts</span>
              <span className="text-xs text-slate-400 font-medium leading-tight mt-0.5">Gestão Inteligente</span>
            </div>
          </Link>
        </div>

        {/* Center: Search Input Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-lg mx-8">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input 
              type="text" 
              value={headerSearch}
              onChange={(e) => setHeaderSearch(e.target.value)}
              placeholder="Buscar por peça, código, modelo ou veículo..."
              className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-slate-200/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl pl-10 pr-20 py-2 text-sm text-slate-700 placeholder:text-slate-400 transition focus:outline-none"
            />
            <div className="absolute right-3 top-2.5 flex items-center">
              <span className="bg-white border border-slate-200 text-slate-400 text-[10px] font-mono px-1.5 py-0.5 rounded shadow-2xs font-semibold">
                ctrl + k
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions, SaaS ERP Switch & Primary Button */}
        <div className="flex items-center gap-3">
          
          {/* Botão de Atalho para o SaaS ERP */}
          <Link
            to="/tenant-dashboard"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
            title="Ir para o Painel ERP SaaS (WMS & Kanban)"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Abrir SaaS ERP</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          {/* Dark Mode Toggle */}
          <button 
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition cursor-pointer"
            title="Alternar Modo Escuro"
          >
            <Moon className="w-5 h-5" />
          </button>

          {/* Notifications Bell */}
          <button 
            type="button"
            className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition relative cursor-pointer"
            title="Notificações"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center border-2 border-white">
              12
            </span>
          </button>

          {/* Chat Messages */}
          <button 
            type="button"
            onClick={() => navigate('/messages')}
            className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition cursor-pointer"
            title="Mensagens"
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          {/* Primary Action: + Nova Peça */}
          <button
            type="button"
            onClick={() => setShowNovaPecaModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm shadow-indigo-600/30 transition cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nova Peça</span>
          </button>

        </div>
      </header>

      {/* ════════════════ MAIN BODY WRAPPER ════════════════ */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* ──────────────── LEFT SIDEBAR NAVIGATION ──────────────── */}
        <aside className="w-64 bg-white border-r border-slate-100 p-4 flex flex-col justify-between hidden md:flex shrink-0">
          
          <nav className="space-y-1">
            
            {/* Dashboard (Active Highlight) */}
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition cursor-pointer ${
                activeTab === 'dashboard' 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </button>

            {/* Peças */}
            <button
              type="button"
              onClick={() => setActiveTab('pecas')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition cursor-pointer ${
                activeTab === 'pecas' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Package className="w-5 h-5 text-slate-400" />
              <span>Peças</span>
            </button>

            {/* Categorias */}
            <button
              type="button"
              onClick={() => setActiveTab('categorias')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition cursor-pointer ${
                activeTab === 'categorias' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Tag className="w-5 h-5 text-slate-400" />
              <span>Categorias</span>
            </button>

            {/* Veículos */}
            <button
              type="button"
              onClick={() => setActiveTab('veiculos')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition cursor-pointer ${
                activeTab === 'veiculos' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Car className="w-5 h-5 text-slate-400" />
              <span>Veículos</span>
            </button>

            {/* Pedidos */}
            <button
              type="button"
              onClick={() => setActiveTab('pedidos')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition cursor-pointer ${
                activeTab === 'pedidos' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ShoppingCart className="w-5 h-5 text-slate-400" />
              <span>Pedidos</span>
            </button>

            {/* Clientes */}
            <button
              type="button"
              onClick={() => setActiveTab('clientes')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition cursor-pointer ${
                activeTab === 'clientes' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Users className="w-5 h-5 text-slate-400" />
              <span>Clientes</span>
            </button>

            {/* Fornecedores */}
            <button
              type="button"
              onClick={() => setActiveTab('fornecedores')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition cursor-pointer ${
                activeTab === 'fornecedores' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Building2 className="w-5 h-5 text-slate-400" />
              <span>Fornecedores</span>
            </button>

            {/* Estoque */}
            <button
              type="button"
              onClick={() => setActiveTab('estoque')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition cursor-pointer ${
                activeTab === 'estoque' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Box className="w-5 h-5 text-slate-400" />
              <span>Estoque</span>
            </button>

            {/* Movimentações */}
            <button
              type="button"
              onClick={() => setActiveTab('movimentacoes')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition cursor-pointer ${
                activeTab === 'movimentacoes' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Activity className="w-5 h-5 text-slate-400" />
              <span>Movimentações</span>
            </button>

            {/* Relatórios */}
            <button
              type="button"
              onClick={() => setActiveTab('relatorios')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition cursor-pointer ${
                activeTab === 'relatorios' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-5 h-5 text-slate-400" />
              <span>Relatórios</span>
            </button>

            {/* Visão Computacional (IA Badge) */}
            <button
              type="button"
              onClick={() => setActiveTab('visao-ia')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-medium text-sm transition cursor-pointer ${
                activeTab === 'visao-ia' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-slate-400" />
                <span>Visão Computacional</span>
              </div>
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md">
                IA
              </span>
            </button>

            {/* Marketplace (Novo Badge) */}
            <button
              type="button"
              onClick={() => setActiveTab('marketplace')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-medium text-sm transition cursor-pointer ${
                activeTab === 'marketplace' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-slate-400" />
                <span>Marketplace</span>
              </div>
              <span className="bg-indigo-100 text-indigo-700 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md">
                Novo
              </span>
            </button>

            {/* Alertas (6 Badge) */}
            <button
              type="button"
              onClick={() => setActiveTab('alertas')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-medium text-sm transition cursor-pointer ${
                activeTab === 'alertas' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-slate-400" />
                <span>Alertas</span>
              </div>
              <span className="bg-rose-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                6
              </span>
            </button>

            {/* Configurações */}
            <button
              type="button"
              onClick={() => setActiveTab('configuracoes')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition cursor-pointer ${
                activeTab === 'configuracoes' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Settings className="w-5 h-5 text-slate-400" />
              <span>Configurações</span>
            </button>

          </nav>

          {/* Bottom Card in Sidebar: Marketplace Promo */}
          <div className="bg-indigo-50/70 border border-indigo-100/80 rounded-2xl p-4 mt-6">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block mb-1">
              VENDA MAIS COM O
            </span>
            <h4 className="font-extrabold text-slate-900 text-base leading-tight">
              Marketplace
            </h4>
          </div>

        </aside>

        {/* ──────────────── DASHBOARD MAIN CONTENT ──────────────── */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* ════ TOP 4 STAT CARDS ════ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Card 1: Estoque Total */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-slate-200 transition">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs font-semibold tracking-wide">Estoque Total</span>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Box className="w-5 h-5" />
                </div>
              </div>
              <div className="my-2">
                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">8.472</h3>
                <p className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-1">
                  <span>+12.5%</span>
                  <span className="text-slate-400 font-normal">vs mês anterior</span>
                </p>
              </div>
              {/* Blue Sparkline SVG */}
              <div className="h-8 w-full mt-2">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 200 40">
                  <path 
                    d="M 0,30 Q 50,38 100,20 T 200,10" 
                    fill="none" 
                    stroke="#3b82f6" 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                  />
                </svg>
              </div>
            </div>

            {/* Card 2: Valor do Estoque */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-slate-200 transition">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs font-semibold tracking-wide">Valor do Estoque</span>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 stroke-[2.5]" />
                </div>
              </div>
              <div className="my-2">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  R$ 1.246.890,50
                </h3>
                <p className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-1">
                  <span>+8,3%</span>
                  <span className="text-slate-400 font-normal">vs mês anterior</span>
                </p>
              </div>
              {/* Green Sparkline SVG */}
              <div className="h-8 w-full mt-2">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 200 40">
                  <path 
                    d="M 0,35 Q 60,15 120,25 T 200,8" 
                    fill="none" 
                    stroke="#10b981" 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                  />
                </svg>
              </div>
            </div>

            {/* Card 3: Pedidos (Mês) */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-slate-200 transition">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs font-semibold tracking-wide">Pedidos (Mês)</span>
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5" />
                </div>
              </div>
              <div className="my-2">
                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">320</h3>
                <p className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-1">
                  <span>+15,2%</span>
                  <span className="text-slate-400 font-normal">vs mês anterior</span>
                </p>
              </div>
              {/* Purple Sparkline SVG */}
              <div className="h-8 w-full mt-2">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 200 40">
                  <path 
                    d="M 0,28 Q 70,36 140,16 T 200,12" 
                    fill="none" 
                    stroke="#a855f7" 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                  />
                </svg>
              </div>
            </div>

            {/* Card 4: Peças em Falta */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-slate-200 transition">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs font-semibold tracking-wide">Peças em Falta</span>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
              <div className="my-2">
                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">24</h3>
                <p className="text-xs font-bold text-rose-500 flex items-center gap-1 mt-1">
                  <span>-5,1%</span>
                  <span className="text-slate-400 font-normal">vs mês anterior</span>
                </p>
              </div>
              {/* Amber Sparkline SVG */}
              <div className="h-8 w-full mt-2">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 200 40">
                  <path 
                    d="M 0,15 Q 60,10 120,30 T 200,22" 
                    fill="none" 
                    stroke="#f59e0b" 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                  />
                </svg>
              </div>
            </div>

          </div>

          {/* ════ MIDDLE ROW: ACESSO RÁPIDO & VISÃO COMPUTACIONAL IA ════ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Box: Acesso Rápido (col-span-2) */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-4">Acesso rápido</h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                
                {/* 1. Nova Peça */}
                <button
                  type="button"
                  onClick={() => setShowNovaPecaModal(true)}
                  className="bg-indigo-50/70 hover:bg-indigo-100/80 border border-indigo-100 rounded-2xl p-4 text-center transition cursor-pointer flex flex-col items-center justify-center gap-2 group active:scale-95"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shadow-indigo-600/30 group-hover:scale-110 transition-transform">
                    <Plus className="w-5 h-5 stroke-[3]" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900">Nova Peça</span>
                </button>

                {/* 2. Novo Pedido */}
                <button
                  type="button"
                  onClick={() => setShowNovoPedidoModal(true)}
                  className="bg-sky-50/70 hover:bg-sky-100/80 border border-sky-100 rounded-2xl p-4 text-center transition cursor-pointer flex flex-col items-center justify-center gap-2 group active:scale-95"
                >
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900">Novo Pedido</span>
                </button>

                {/* 3. Buscar Peça */}
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('inventory-search-input')
                    el?.focus()
                  }}
                  className="bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-100 rounded-2xl p-4 text-center transition cursor-pointer flex flex-col items-center justify-center gap-2 group active:scale-95"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Search className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900">Buscar Peça</span>
                </button>

                {/* 4. Entrada no Estoque */}
                <button
                  type="button"
                  onClick={() => setShowEntradaEstoqueModal(true)}
                  className="bg-amber-50/70 hover:bg-amber-100/80 border border-amber-100 rounded-2xl p-4 text-center transition cursor-pointer flex flex-col items-center justify-center gap-2 group active:scale-95"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900">Entrada no Estoque</span>
                </button>

                {/* 5. Relatórios */}
                <button
                  type="button"
                  onClick={() => setActiveTab('relatorios')}
                  className="bg-purple-50/70 hover:bg-purple-100/80 border border-purple-100 rounded-2xl p-4 text-center transition cursor-pointer flex flex-col items-center justify-center gap-2 group active:scale-95"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900">Relatórios</span>
                </button>

                {/* 6. Marketplace */}
                <button
                  type="button"
                  onClick={() => setActiveTab('marketplace')}
                  className="bg-rose-50/70 hover:bg-rose-100/80 border border-rose-100 rounded-2xl p-4 text-center transition cursor-pointer flex flex-col items-center justify-center gap-2 group active:scale-95"
                >
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Globe className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900">Marketplace</span>
                </button>

              </div>
            </div>

            {/* Right Box: Visão Computacional IA (col-span-1) */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col gap-4">
              
              {/* Header Title */}
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-slate-900">Visão Computacional</h3>
                <span className="bg-indigo-100 text-indigo-700 text-xs font-extrabold px-2 py-0.5 rounded-md">
                  IA
                </span>
              </div>

              {/* Upload Drag & Drop Area */}
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/30 hover:bg-indigo-50/60 rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 group"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-800">Arraste uma imagem aqui </span>
                  <span className="text-slate-500">ou clique para selecionar</span>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                  JPG, PNG, WEBP até 10MB
                </span>
              </div>

              {/* Image Preview Box with Confidence Badge */}
              <div className="relative rounded-xl overflow-hidden shadow-xs border border-slate-100 group">
                <img 
                  src={aiImagePreview} 
                  alt="Previa Visão Computacional" 
                  className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 left-2">
                  <span className="bg-emerald-500 text-white font-bold text-[11px] px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {aiConfidence}% confiança
                  </span>
                </div>
                {isAiAnalyzing && (
                  <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center text-white font-bold text-xs gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Analisando peça...
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* ════ BOTTOM SECTION: PEÇAS EM ESTOQUE TABLE ════ */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-4">
            
            {/* Header Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-lg font-bold text-slate-900">Peças em Estoque</h3>
              
              <div className="flex flex-wrap items-center gap-3">
                
                {/* Select Category */}
                <select 
                  value={tableCategory}
                  onChange={(e) => setTableCategory(e.target.value)}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="all">Todas categorias</option>
                  <option value="Acessórios & Tuning">Acessórios & Tuning</option>
                  <option value="Lataria & Iluminação">Lataria & Iluminação</option>
                  <option value="Injeção & Sensores">Injeção & Sensores</option>
                  <option value="Motor & Periféricos">Motor & Periféricos</option>
                  <option value="Freios & Suspensão">Freios & Suspensão</option>
                </select>

                {/* Table Search Input */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input 
                    id="inventory-search-input"
                    type="text" 
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    placeholder="Buscar..."
                    className="pl-9 bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-44 sm:w-56"
                  />
                </div>

                {/* Filtros Button */}
                <button 
                  type="button"
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 flex items-center gap-2 transition cursor-pointer"
                >
                  <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                  <span>Filtros</span>
                </button>

              </div>
            </div>

            {/* Inventory Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
                    <th className="py-3 px-4">PEÇA</th>
                    <th className="py-3 px-4">CÓDIGO</th>
                    <th className="py-3 px-4">CATEGORIA</th>
                    <th className="py-3 px-4">COMPATIBILIDADE</th>
                    <th className="py-3 px-4">ESTOQUE</th>
                    <th className="py-3 px-4">PREÇO</th>
                    <th className="py-3 px-4">STATUS</th>
                    <th className="py-3 px-4 text-right">ETIQUETA WMS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {displayParts.map((part) => (
                    <tr key={part.id} className="hover:bg-slate-50/80 transition">
                      
                      {/* PEÇA */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs truncate">
                        {part.title}
                      </td>

                      {/* CÓDIGO */}
                      <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                        {part.oem_code || 'OEM-778-912'}
                      </td>

                      {/* CATEGORIA */}
                      <td className="py-3.5 px-4 text-slate-600">
                        {part.category || 'Peças Gerais'}
                      </td>

                      {/* COMPATIBILIDADE */}
                      <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                        {(part as any).compatibility || 'Universal'}
                      </td>

                      {/* ESTOQUE */}
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {(part as any).stock || 1} un
                      </td>

                      {/* PREÇO */}
                      <td className="py-3.5 px-4 font-extrabold text-slate-900">
                        R$ {(part.price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>

                      {/* STATUS */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          part.status === 'Baixo Estoque' 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {part.status || 'Em Estoque'}
                        </span>
                      </td>

                      {/* ETIQUETA WMS PRINT BUTTON */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setPrintingStickerPart(part)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition inline-flex items-center gap-1.5 font-semibold text-xs cursor-pointer"
                          title="Imprimir Etiqueta WMS QR"
                        >
                          <Printer className="w-4 h-4" />
                          <span className="hidden sm:inline">Etiqueta</span>
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

        </main>
      </div>

      {/* ════════════════ MODAL: NOVA PEÇA ════════════════ */}
      {showNovaPecaModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-600" />
                Cadastrar Nova Peça
              </h3>
              <button 
                onClick={() => setShowNovaPecaModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNovaPeca} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Título da Peça</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Farol Dianteiro Full LED Esquerdo"
                  value={novaPecaForm.title}
                  onChange={(e) => setNovaPecaForm({...novaPecaForm, title: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Código OEM</label>
                  <input 
                    type="text" 
                    placeholder="OEM-33100-47820"
                    value={novaPecaForm.oem_code}
                    onChange={(e) => setNovaPecaForm({...novaPecaForm, oem_code: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Categoria</label>
                  <select 
                    value={novaPecaForm.category}
                    onChange={(e) => setNovaPecaForm({...novaPecaForm, category: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Motor & Periféricos">Motor & Periféricos</option>
                    <option value="Lataria & Iluminação">Lataria & Iluminação</option>
                    <option value="Injeção & Sensores">Injeção & Sensores</option>
                    <option value="Freios & Suspensão">Freios & Suspensão</option>
                    <option value="Acessórios & Tuning">Acessórios & Tuning</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Preço Venda (R$)</label>
                  <input 
                    type="number" 
                    required
                    placeholder="1450"
                    value={novaPecaForm.price}
                    onChange={(e) => setNovaPecaForm({...novaPecaForm, price: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Custo (R$)</label>
                  <input 
                    type="number" 
                    placeholder="500"
                    value={novaPecaForm.cost_price}
                    onChange={(e) => setNovaPecaForm({...novaPecaForm, cost_price: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Estoque Quantidade</label>
                  <input 
                    type="number" 
                    value={novaPecaForm.stock}
                    onChange={(e) => setNovaPecaForm({...novaPecaForm, stock: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Compatibilidade de Veículos</label>
                <input 
                  type="text" 
                  placeholder="Ex: Toyota Prius ZVW30 (2015-2022)"
                  value={novaPecaForm.compatibility}
                  onChange={(e) => setNovaPecaForm({...novaPecaForm, compatibility: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNovaPecaModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingPart}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition shadow-sm"
                >
                  {savingPart ? 'Salvando...' : 'Salvar Peça'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════ MODAL: NOVO PEDIDO / PDV BALCÃO ════════════════ */}
      {showNovoPedidoModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-sky-600" />
                Registrar Novo Pedido / PDV
              </h3>
              <button onClick={() => setShowNovoPedidoModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Venda rápida no balcão ou emissão de pedido instantâneo com redução automática de estoque.
            </p>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Cliente</label>
                <input type="text" placeholder="Oficina Takahashi Auto / Cliente Balcão" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Valor Total (R$)</label>
                <input type="number" placeholder="1450.00" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold" />
              </div>
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button onClick={() => setShowNovoPedidoModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold">
                Cancelar
              </button>
              <button onClick={() => setShowNovoPedidoModal(false)} className="px-5 py-2 bg-sky-600 text-white rounded-xl font-bold shadow-sm">
                Concluir Pedido 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════ MODAL: ENTRADA NO ESTOQUE ════════════════ */}
      {showEntradaEstoqueModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-amber-600" />
                Entrada no Estoque
              </h3>
              <button onClick={() => setShowEntradaEstoqueModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Importação via NF-e XML ou entrada manual de novo lote de desmonte.
            </p>
            <div className="border-2 border-dashed border-amber-200 bg-amber-50/30 rounded-2xl p-6 text-center text-xs">
              <Upload className="w-6 h-6 text-amber-600 mx-auto mb-2" />
              <span className="font-bold text-slate-800">Arraste a Nota Fiscal XML aqui</span>
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button onClick={() => setShowEntradaEstoqueModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════ MODAL: QR ETIQUETA PRINT WMS ════════════════ */}
      {printingStickerPart && (
        <QRStickerPrint
          partTitle={printingStickerPart.title}
          oemCode={printingStickerPart.oem_code}
          price={printingStickerPart.price}
          wmsLocation={printingStickerPart.wms_location}
          partId={printingStickerPart.id}
          onClose={() => setPrintingStickerPart(null)}
        />
      )}

    </div>
  )
}