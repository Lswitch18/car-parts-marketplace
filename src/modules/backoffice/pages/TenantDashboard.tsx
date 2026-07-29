import { Link, useNavigate } from 'react'
import { useAuthStore } from '@/modules/identity/store/authStore'
import { useTenantCore } from '@/modules/shared/hooks/useTenantCore'
import { 
  Building2, Package, QrCode, Wrench, Globe, Sparkles, 
  Search, ShieldCheck, AlertCircle, RefreshCw
} from 'lucide-react'

export default function TenantDashboard() {
  const navigate = useNavigate()
  const { user, initialized, loading: authLoading } = useAuthStore()
  
  // Clean Architecture Hook - Sem duplicação de lógica ou queries inline!
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

  // Redirecionar se não estiver autenticado
  if (initialized && !authLoading && !user) {
    navigate('/login', { replace: true })
    return null
  }

  const tenantName = user?.name || 'Oficina & Autopeças Partner'
  const tenantId = user?.id ? `tenant_${user.id.slice(0, 8)}` : 'tenant_demo_01'

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
      <div className="max-w-7xl mx-auto mb-8">
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
                <span>Painel de Gestão ERP/WMS Privado</span>
                <span>•</span>
                <span className="text-emerald-400 font-medium flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Multi-Tenant Isolado (Clean Architecture)
                </span>
              </p>
            </div>
          </div>

          {/* Botões de Ação Rápida no Header */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => refetch()}
              className="p-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition border border-zinc-700/60"
              title="Atualizar Estoque"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link
              to="/parts"
              className="px-4 py-2.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-sm font-semibold flex items-center space-x-2 transition"
            >
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Catalogar com IA (30s)</span>
            </Link>
            <Link
              to="/catalog"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold flex items-center space-x-2 transition shadow-lg shadow-emerald-600/20"
            >
              <Globe className="w-4 h-4" />
              <span>Ver Marketplace Público</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards de Gestão ERP */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Card 1: SKUs do Estoque Privado */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-zinc-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Estoque Privado</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-white">{stats.totalSKUs} <span className="text-sm font-normal text-zinc-500">peças</span></div>
            <p className="text-xs text-blue-400 font-mono mt-1">
              Valor Total: ¥ {stats.totalPrivateValue.toLocaleString('ja-JP')} JPY
            </p>
          </div>
        </div>

        {/* Card 2: Armazém & Prateleiras WMS */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-zinc-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Armazém WMS</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <QrCode className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-white">{stats.wmsShelvesCount} <span className="text-sm font-normal text-zinc-500">prateleiras</span></div>
            <p className="text-xs text-amber-400 mt-1">
              Etiquetas QR Mapeadas e Prontas
            </p>
          </div>
        </div>

        {/* Card 3: Ordens de Serviço (O.S.) */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-zinc-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Ordens de Serviço</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-white">{stats.activeOSCount} <span className="text-sm font-normal text-zinc-500">O.S. ativas</span></div>
            <p className="text-xs text-purple-400 mt-1">
              Peças vinculadas à manutenção da oficina
            </p>
          </div>
        </div>

        {/* Card 4: Divulgação Marketplace (1-Clique) */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-zinc-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Publicadas no DAIG</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <Globe className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-emerald-400">{stats.publishedCount} <span className="text-sm font-normal text-zinc-500">online</span></div>
            <p className="text-xs text-zinc-400 mt-1">
              {stats.privateCount} mantidas 100% privadas
            </p>
          </div>
        </div>
      </div>

      {/* Tabela de Gestão de Estoque & Chave de 1-Clique */}
      <div className="max-w-7xl mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
        {/* Barra de Filtros e Busca */}
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
              Apenas Gestão Privada ({stats.privateCount})
            </button>
          </div>
        </div>

        {/* Ações em Lote quando há selecionados */}
        {selectedPartIds.length > 0 && (
          <div className="mb-4 p-3 bg-blue-950/60 border border-blue-800/80 rounded-xl flex items-center justify-between animate-fadeIn">
            <span className="text-xs font-medium text-blue-300">
              {selectedPartIds.length} peça(s) selecionada(s)
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => batchPublish('available')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition"
              >
                Publicar no Marketplace em 1 Clique
              </button>
              <button
                onClick={() => batchPublish('draft')}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-lg transition border border-zinc-700"
              >
                Reverter para Privado
              </button>
            </div>
          </div>
        )}

        {/* Tabela de Peças */}
        {isLoading ? (
          <div className="py-12 text-center text-zinc-400">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
            <p className="text-sm">Carregando estoque do tenant...</p>
          </div>
        ) : filteredParts.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-zinc-800 rounded-xl">
            <AlertCircle className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-zinc-300">Nenhuma peça encontrada no estoque do tenant</p>
            <p className="text-xs text-zinc-500 mt-1">Use a IA de catalogação para adicionar peças em segundos.</p>
          </div>
        ) : (
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
                  <th className="py-3 px-4">Código OEM / VIN</th>
                  <th className="py-3 px-4">Local WMS (Prateleira)</th>
                  <th className="py-3 px-4">Preço no Estoque</th>
                  <th className="py-3 px-4 text-center">Divulgação no Marketplace</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-200">
                {filteredParts.map((part) => {
                  const isPublished = part.status === 'available'
                  const isSelected = selectedPartIds.includes(part.id)

                  return (
                    <tr 
                      key={part.id} 
                      className={`hover:bg-zinc-800/40 transition ${isSelected ? 'bg-blue-950/20' : ''}`}
                    >
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
                            <img 
                              src={part.images[0]} 
                              alt={part.title} 
                              className="w-10 h-10 rounded-lg object-cover bg-zinc-800 border border-zinc-700 flex-shrink-0"
                            />
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
                      <td className="py-3.5 px-4 font-mono text-xs text-zinc-300">
                        {part.oem_code || 'OEM-PENDENTE'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono bg-zinc-800 text-amber-300 border border-zinc-700">
                          <QrCode className="w-3 h-3 mr-1 text-amber-400" />
                          Prateleira B-04
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white">
                        ¥ {Number(part.price || 0).toLocaleString('ja-JP')} JPY
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => togglePublish(part.id, isPublished)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                            isPublished ? 'bg-emerald-500' : 'bg-zinc-700'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              isPublished ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
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
        )}
      </div>
    </div>
  )
}
