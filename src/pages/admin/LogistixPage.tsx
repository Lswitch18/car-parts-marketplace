import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface KPIs {
  total: number;
  concluidas: number;
  atrasos: number;
  emTransito: number;
  taxa: string;
  custo: string;
}

interface Pedido {
  id: string;
  codigo: string;
  status: string;
  destino_cidade: string;
  destino_estado: string;
  previsao: string;
  created_at: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://clqubcryhbrjlupkgeva.supabase.co';
const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1/admin`;

async function apiCall(endpoint: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const res = await fetch(`${FUNCTIONS_URL}/${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      'apikey': SUPABASE_URL + '/rest/v1/'
    }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error');
  return data.success ? data.data : data;
}

export default function LogistixPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = '/login';
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profile?.role !== 'admin') {
        window.location.href = '/dashboard';
        return;
      }

      loadData();
    } catch (err) {
      setError('Erro ao verificar autenticação');
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      const [kpisData, pedidosData] = await Promise.all([
        apiCall('dashboard/kpis'),
        apiCall('pedidos?limit=10')
      ]);
      setKpis(kpisData);
      setPedidos(pedidosData.rows || []);
      setLoading(false);
    } catch (err) {
      setError('Erro ao carregar dados');
      setLoading(false);
    }
  };

  const statusColor = (status: string) => {
    const colors: Record<string, string> = {
      pendente: 'bg-yellow-500',
      em_transito: 'bg-blue-500',
      entregue: 'bg-green-500',
      atrasado: 'bg-red-500',
      cancelado: 'bg-gray-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando Logistix...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-gray-800 border-r border-gray-700 p-4">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <div className="font-bold text-lg">LOGISTIX</div>
            <div className="text-xs text-gray-400">Smart Logistics</div>
          </div>
        </div>

        <nav className="space-y-2">
          {[
            { id: 'dashboard', icon: '📊', label: 'Dashboard' },
            { id: 'pedidos', icon: '📦', label: 'Pedidos' },
            { id: 'clientes', icon: '👥', label: 'Clientes' },
            { id: 'armazens', icon: '🏭', label: 'Armazéns' },
            { id: 'transportes', icon: '🚚', label: 'Transportes' },
            { id: 'entregas', icon: '📍', label: 'Entregas' },
            { id: 'estoque', icon: '📋', label: 'Estoque' },
            { id: 'rastreamento', icon: '🔍', label: 'Rastreamento' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Logistix WMS</h1>
          <p className="text-gray-400">Painel de Gestão Logística</p>
        </header>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-6 gap-4 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="text-gray-400 text-sm">Pedidos Totais</div>
            <div className="text-3xl font-bold text-white">{kpis?.total || 0}</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="text-gray-400 text-sm">Concluídos</div>
            <div className="text-3xl font-bold text-green-500">{kpis?.concluidas || 0}</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="text-gray-400 text-sm">Em Trânsito</div>
            <div className="text-3xl font-bold text-blue-500">{kpis?.emTransito || 0}</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="text-gray-400 text-sm">Atrasados</div>
            <div className="text-3xl font-bold text-red-500">{kpis?.atrasos || 0}</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="text-gray-400 text-sm">Taxa de Entrega</div>
            <div className="text-3xl font-bold text-yellow-500">{kpis?.taxa || 0}%</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="text-gray-400 text-sm">Custo Logístico</div>
            <div className="text-3xl font-bold text-purple-500">R$ {kpis?.custo || '0'}</div>
          </div>
        </div>

        {/* Pedidos Recentes */}
        <div className="bg-gray-800 rounded-xl border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold">Pedidos Recentes</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Código</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Destino</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Previsão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {pedidos.map(pedido => (
                  <tr key={pedido.id} className="hover:bg-gray-700/30">
                    <td className="px-6 py-4 font-mono">{pedido.codigo}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${statusColor(pedido.status)}`}>
                        {pedido.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">{pedido.destino_cidade} - {pedido.destino_estado}</td>
                    <td className="px-6 py-4">{pedido.previsao || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex gap-4">
          <button 
            onClick={() => alert('Funcionalidade de rastreamento em desenvolvimento')}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium flex items-center space-x-2"
          >
            <span>🔍</span>
            <span>Rastrear Pedido</span>
          </button>
          <button 
            onClick={() => alert('Funcionalidade de envio em desenvolvimento')}
            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-medium flex items-center space-x-2"
          >
            <span>📤</span>
            <span>Novo Envio</span>
          </button>
          <button 
            onClick={() => alert('Funcionalidade de recebimento em desenvolvimento')}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-medium flex items-center space-x-2"
          >
            <span>📥</span>
            <span>Recebimento</span>
          </button>
        </div>
      </main>
    </div>
  );
}