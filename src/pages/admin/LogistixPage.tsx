import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { LogistixSidebar } from '../../components/logistix/LogistixSidebar';
import { NeonKPI, NeonKPIGrid } from '../../components/logistix/NeonKPI';
import { NeonDonutChart, NeonLineChart, NeonBarChart, NeonLegend } from '../../components/logistix/NeonCharts';
import { LogisticsMap, MapLegend } from '../../components/logistix/LogisticsMap';

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
  valor: number;
}

interface Warehouse {
  id: string;
  nome: string;
  cidade: string;
  pais: string;
  lat: number;
  lng: number;
  capacidade: number;
  ocupacao: number;
}

const WAREHOUSES_DATA: Warehouse[] = [
  // Brazil
  { id: '1', nome: 'CD São Paulo', cidade: 'São Paulo', pais: 'BR', lat: -23.5505, lng: -46.6333, capacidade: 5000, ocupacao: 4250 },
  { id: '2', nome: 'CD Rio de Janeiro', cidade: 'Rio de Janeiro', pais: 'BR', lat: -22.9068, lng: -43.1729, capacidade: 3000, ocupacao: 2280 },
  { id: '3', nome: 'CD Curitiba', cidade: 'Curitiba', pais: 'BR', lat: -25.4284, lng: -49.2733, capacidade: 2500, ocupacao: 1450 },
  { id: '4', nome: 'CD Belo Horizonte', cidade: 'Belo Horizonte', pais: 'BR', lat: -19.9167, lng: -43.9345, capacidade: 2000, ocupacao: 1240 },
  { id: '5', nome: 'CD Salvador', cidade: 'Salvador', pais: 'BR', lat: -12.9714, lng: -38.5014, capacidade: 1500, ocupacao: 570 },
  // Japan
  { id: '6', nome: '東京センター', cidade: 'Tokyo', pais: 'JP', lat: 35.6762, lng: 139.6503, capacidade: 3500, ocupacao: 2800 },
  { id: '7', nome: '大阪センター', cidade: 'Osaka', pais: 'JP', lat: 34.6937, lng: 135.5023, capacidade: 2800, ocupacao: 2100 },
  { id: '8', nome: '名古屋センター', cidade: 'Nagoya', pais: 'JP', lat: 35.1815, lng: 136.9066, capacidade: 2200, ocupacao: 1650 },
];

export default function LogistixPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    console.log('[LogistixPage] Carregando dados...');
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }

      const { data: pedidosRaw, error: pedidosError } = await supabase
        .from('admin_pedidos')
        .select('*')
        .limit(20)
        .order('created_at', { ascending: false });

      if (pedidosError) throw pedidosError;

      const pedidosList = pedidosRaw || [];
      
      const totalValor = pedidosList.reduce((sum: number, p: any) => sum + (p.valor || 0), 0);
      
      const kpisData = {
        total: pedidosList.length,
        concluidas: pedidosList.filter((p: any) => p.status === 'entregue').length,
        atrasos: pedidosList.filter((p: any) => p.status === 'atrasado').length,
        emTransito: pedidosList.filter((p: any) => p.status === 'em_transito').length,
        taxa: String(pedidosList.length > 0 ? Math.round((pedidosList.filter((p: any) => p.status === 'entregue').length / pedidosList.length) * 100) : 0),
        custo: totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
      };

      setKpis(kpisData);
      setPedidos(pedidosList.map((p: any) => ({
        id: p.id,
        codigo: p.codigo,
        status: p.status,
        destino_cidade: p.destino_cidade,
        destino_estado: p.destino_estado,
        previsao: p.previsao,
        valor: p.valor || 0
      })));
      setLoading(false);
      setError(null);
      
    } catch (err: any) {
      console.error('[LogistixPage] Erro:', err);
      setError(err.message || 'Erro ao carregar dados');
      setLoading(false);
    }
  };

  // Prepare chart data
  const statusData = [
    { name: 'Entregues', value: kpis?.concluidas || 0 },
    { name: 'Em Trânsito', value: kpis?.emTransito || 0 },
    { name: 'Atrasados', value: kpis?.atrasos || 0 },
    { name: 'Pendentes', value: Math.max(0, (kpis?.total || 0) - (kpis?.concluidas || 0) - (kpis?.emTransito || 0) - (kpis?.atrasos || 0)) },
  ];

  const legendData = [
    { name: 'Entregues', value: kpis?.concluidas || 0, color: '#00ff88' },
    { name: 'Em Trânsito', value: kpis?.emTransito || 0, color: '#00f5ff' },
    { name: 'Atrasados', value: kpis?.atrasos || 0, color: '#ff00ff' },
    { name: 'Pendentes', value: Math.max(0, (kpis?.total || 0) - (kpis?.concluidas || 0) - (kpis?.emTransito || 0) - (kpis?.atrasos || 0)), color: '#ffee00' },
  ];

  const weeklyData = [
    { name: 'Seg', value: 45 },
    { name: 'Ter', value: 52 },
    { name: 'Qua', value: 38 },
    { name: 'Qui', value: 65 },
    { name: 'Sex', value: 48 },
    { name: 'Sáb', value: 72 },
    { name: 'Dom', value: 35 },
  ];

  const regionData = [
    { name: 'SP', value: 156 },
    { name: 'RJ', value: 89 },
    { name: 'MG', value: 67 },
    { name: 'PR', value: 54 },
    { name: 'BA', value: 42 },
  ];

  const statusColor = (status: string) => {
    const colors: Record<string, string> = {
      pendente: 'text-neon-yellow bg-neon-yellow/10 border-neon-yellow/30',
      em_transito: 'text-neon-cyan bg-neon-cyan/10 border-neon-cyan/30',
      entregue: 'text-neon-green bg-neon-green/10 border-neon-green/30',
      atrasado: 'text-neon-magenta bg-neon-magenta/10 border-neon-magenta/30',
      cancelado: 'text-gray-400 bg-gray-400/10 border-gray-400/30',
    };
    return colors[status] || 'text-gray-400';
  };

  // Show loading
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-neon-cyan text-xl font-mono">Carregando Logistix...</div>
        </div>
      </div>
    );
  }

  // Show error
  if (error) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
        <div className="bg-dark-card border border-neon-red rounded-xl p-6 max-w-md">
          <div className="text-neon-red font-bold text-xl mb-2">Erro</div>
          <div className="text-gray-400">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <LogistixSidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        userEmail={userEmail}
      />

      <main className="md:ml-64 p-4 md:p-6 pt-16 md:pt-6">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Logistix <span className="text-neon-cyan">WMS</span>
          </h1>
          <p className="text-gray-400">Painel de Gestão Logística - Brasil & Japão</p>
        </header>

        {activeTab === 'dashboard' && (
          <>
            {/* KPIs Grid */}
            <NeonKPIGrid>
              <NeonKPI 
                title="Pedidos Hoje" 
                value={kpis?.total || 0} 
                icon="package" 
                color="cyan"
                trend={12}
              />
              <NeonKPI 
                title="Entregues" 
                value={kpis?.concluidas || 0} 
                icon="truck" 
                color="green"
                trend={8}
              />
              <NeonKPI 
                title="Em Trânsito" 
                value={kpis?.emTransito || 0} 
                icon="truck" 
                color="yellow"
              />
              <NeonKPI 
                title="Atrasados" 
                value={kpis?.atrasos || 0} 
                icon="alert" 
                color="magenta"
                trend={-5}
              />
              <NeonKPI 
                title="Taxa Entrega" 
                value={`${kpis?.taxa || 0}%`} 
                icon="trending" 
                color="purple"
                trend={3}
              />
              <NeonKPI 
                title="Receita" 
                value={`R$ ${kpis?.custo || '0'}`} 
                icon="dollar" 
                color="green"
              />
            </NeonKPIGrid>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              {/* Donut Chart */}
              <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4">Status dos Pedidos</h3>
                <NeonDonutChart data={statusData} size={180} />
                <NeonLegend data={legendData} />
              </div>

              {/* Line Chart */}
              <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4">Entregas Semanais</h3>
                <NeonLineChart data={weeklyData} height={200} />
              </div>

              {/* Bar Chart */}
              <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4">Por Região (Brasil)</h3>
                <NeonBarChart data={regionData} height={200} />
              </div>
            </div>

            {/* Map Section */}
            <div className="mt-6">
              <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold">Mapa de Distribuição</h3>
                  <MapLegend />
                </div>
                <LogisticsMap 
                  warehouses={WAREHOUSES_DATA.map(w => ({
                    id: w.id,
                    name: w.nome,
                    city: w.cidade,
                    country: w.pais as 'BR' | 'JP',
                    lat: w.lat,
                    lng: w.lng,
                    capacity: w.capacidade,
                    occupation: w.ocupacao
                  }))}
                  height={400}
                />
              </div>
            </div>

            {/* Recent Orders Table */}
            <div className="mt-6">
              <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4">Pedidos Recentes</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-dark-border">
                        <th className="text-left text-gray-400 text-sm py-3 px-4">Código</th>
                        <th className="text-left text-gray-400 text-sm py-3 px-4">Status</th>
                        <th className="text-left text-gray-400 text-sm py-3 px-4">Destino</th>
                        <th className="text-left text-gray-400 text-sm py-3 px-4">Previsão</th>
                        <th className="text-right text-gray-400 text-sm py-3 px-4">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pedidos.slice(0, 8).map((pedido) => (
                        <tr key={pedido.id} className="border-b border-dark-border/50 hover:bg-dark-cardHover transition-colors">
                          <td className="py-3 px-4 font-mono text-neon-cyan">{pedido.codigo}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColor(pedido.status)}`}>
                              {pedido.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-300">{pedido.destino_cidade} - {pedido.destino_estado}</td>
                          <td className="py-3 px-4 text-gray-400 font-mono text-sm">
                            {pedido.previsao ? new Date(pedido.previsao).toLocaleDateString('pt-BR') : '-'}
                          </td>
                          <td className="py-3 px-4 text-right text-neon-green font-mono">
                            R$ {pedido.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab !== 'dashboard' && (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="text-gray-400 text-xl mb-2">Em desenvolvimento</div>
              <div className="text-gray-500 text-sm">Módulo: {activeTab}</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}