import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

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
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://clqubcryhbrjlupkgeva.supabase.co';

export default function LogistixPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setDebugInfo('Iniciando verificação...');
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      setDebugInfo(`Sessão: ${session ? 'existe' : 'não existe'}`);
      
      if (sessionError) {
        setError(`Erro de sessão: ${sessionError.message}`);
        setLoading(false);
        return;
      }
      
      if (!session) {
        navigate('/login', { replace: true });
        return;
      }

      setUser(session.user);
      setDebugInfo(`Usuário: ${session.user.email}`);

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        setDebugInfo(`Erro profile: ${profileError.message}`);
        setError(`Erro ao buscar perfil: ${profileError.message}`);
        setLoading(false);
        return;
      }

      if (profile?.role !== 'admin') {
        navigate('/dashboard', { replace: true });
        return;
      }

      setDebugInfo('Carregando dados...');
      await loadData();
      
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Erro de autenticação');
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login', { replace: true });
        return;
      }

      // Fetch data directly from Supabase
      const { data: pedidosRaw, error: pedidosError } = await supabase
        .from('admin_pedidos')
        .select('*')
        .limit(10)
        .order('created_at', { ascending: false });

      if (pedidosError) {
        console.error('Database error:', pedidosError);
        // Table might not exist - show mock data for demo
        const mockPedidos = [
          { id: '1', codigo: 'PED-001', status: 'pendente', destino_cidade: 'São Paulo', destino_estado: 'SP', previsao: '2024-01-15' },
          { id: '2', codigo: 'PED-002', status: 'em_transito', destino_cidade: 'Rio de Janeiro', destino_estado: 'RJ', previsao: '2024-01-14' },
          { id: '3', codigo: 'PED-003', status: 'entregue', destino_cidade: 'Belo Horizonte', destino_estado: 'MG', previsao: '2024-01-12' },
        ];
        setKpis({ total: 3, concluidas: 1, atrasos: 0, emTransito: 1, taxa: '33', custo: '0' });
        setPedidos(mockPedidos);
        setLoading(false);
        setError('Tabelas do Logistix não encontradas. Execute a migração no Supabase.');
        return;
      }

      const pedidosList = pedidosRaw || [];
      
      // Calculate KPIs from data
      const kpisData = {
        total: pedidosList.length,
        concluidas: pedidosList.filter((p: any) => p.status === 'entregue').length,
        atrasos: pedidosList.filter((p: any) => p.status === 'atrasado').length,
        emTransito: pedidosList.filter((p: any) => p.status === 'em_transito').length,
        taxa: String(pedidosList.length > 0 ? Math.round((pedidosList.filter((p: any) => p.status === 'entregue').length / pedidosList.length) * 100) : 0),
        custo: '0'
      };

      setKpis(kpisData);
      setPedidos(pedidosList.map((p: any) => ({
        id: p.id,
        codigo: p.codigo,
        status: p.status,
        destino_cidade: p.destino_cidade,
        destino_estado: p.destino_estado,
        previsao: p.previsao
      })));
      setLoading(false);
      setError(null);
      
    } catch (err: any) {
      console.error('Load data error:', err);
      setError(err.message || 'Erro ao carregar dados');
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

  // Show loading
  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#111827', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: 64, 
            height: 64, 
            border: '4px solid #2563eb', 
            borderTopColor: 'transparent', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <div style={{ fontSize: 20 }}>Carregando Logistix...</div>
          <div style={{ color: '#9ca3af', fontSize: 14, marginTop: 8 }}>{debugInfo}</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Show error
  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#111827', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: 20
      }}>
        <div style={{ 
          background: '#7f1d1d', 
          border: '1px solid #ef4444', 
          borderRadius: 8, 
          padding: 24, 
          maxWidth: 500,
          color: '#fecaca'
        }}>
          <div style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>Erro</div>
          <div style={{ marginBottom: 16 }}>{error}</div>
          <div style={{ fontSize: 12, color: '#fca5a5', marginBottom: 16 }}>{debugInfo}</div>
          <button 
            onClick={() => window.location.href = '/login'}
            style={{
              background: '#2563eb',
              color: 'white',
              padding: '8px 16px',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer'
            }}
          >
            Ir para Login
          </button>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div style={{ minHeight: '100vh', background: '#111827', color: 'white' }}>
      {/* Sidebar */}
      <aside style={{ 
        position: 'fixed', 
        left: 0, 
        top: 0, 
        height: '100vh', 
        width: 256, 
        background: '#1f2937', 
        borderRight: '1px solid #374151',
        padding: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{ 
            width: 40, 
            height: 40, 
            background: '#2563eb', 
            borderRadius: 8, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <svg style={{ width: 24, height: 24 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: 18 }}>LOGISTIX</div>
            <div style={{ fontSize: 12, color: '#9ca3af' }}>Smart Logistics</div>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                borderRadius: 8,
                border: 'none',
                background: activeTab === item.id ? '#2563eb' : 'transparent',
                color: activeTab === item.id ? 'white' : '#d1d5db',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: 14
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {user && (
          <div style={{ 
            position: 'absolute', 
            bottom: 16, 
            left: 16, 
            right: 16, 
            padding: 16, 
            background: 'rgba(55, 65, 81, 0.5)', 
            borderRadius: 8 
          }}>
            <div style={{ fontSize: 12, color: '#9ca3af' }}>Usuário</div>
            <div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.email}
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main style={{ marginLeft: 256, padding: 32 }}>
        <header style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 30, fontWeight: 'bold' }}>Logistix WMS</h1>
          <p style={{ color: '#9ca3af' }}>Painel de Gestão Logística</p>
        </header>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16, marginBottom: 32 }}>
          <div style={{ background: '#1f2937', borderRadius: 12, padding: 24, border: '1px solid #374151' }}>
            <div style={{ color: '#9ca3af', fontSize: 14 }}>Pedidos Totais</div>
            <div style={{ fontSize: 30, fontWeight: 'bold' }}>{kpis?.total || 0}</div>
          </div>
          <div style={{ background: '#1f2937', borderRadius: 12, padding: 24, border: '1px solid #374151' }}>
            <div style={{ color: '#9ca3af', fontSize: 14 }}>Concluídos</div>
            <div style={{ fontSize: 30, fontWeight: 'bold', color: '#22c55e' }}>{kpis?.concluidas || 0}</div>
          </div>
          <div style={{ background: '#1f2937', borderRadius: 12, padding: 24, border: '1px solid #374151' }}>
            <div style={{ color: '#9ca3af', fontSize: 14 }}>Em Trânsito</div>
            <div style={{ fontSize: 30, fontWeight: 'bold', color: '#3b82f6' }}>{kpis?.emTransito || 0}</div>
          </div>
          <div style={{ background: '#1f2937', borderRadius: 12, padding: 24, border: '1px solid #374151' }}>
            <div style={{ color: '#9ca3af', fontSize: 14 }}>Atrasados</div>
            <div style={{ fontSize: 30, fontWeight: 'bold', color: '#ef4444' }}>{kpis?.atrasos || 0}</div>
          </div>
          <div style={{ background: '#1f2937', borderRadius: 12, padding: 24, border: '1px solid #374151' }}>
            <div style={{ color: '#9ca3af', fontSize: 14 }}>Taxa de Entrega</div>
            <div style={{ fontSize: 30, fontWeight: 'bold', color: '#eab308' }}>{kpis?.taxa || 0}%</div>
          </div>
          <div style={{ background: '#1f2937', borderRadius: 12, padding: 24, border: '1px solid #374151' }}>
            <div style={{ color: '#9ca3af', fontSize: 14 }}>Custo Logístico</div>
            <div style={{ fontSize: 30, fontWeight: 'bold', color: '#a855f7' }}>R$ {kpis?.custo || '0'}</div>
          </div>
        </div>

        {/* Pedidos Recentes */}
        <div style={{ background: '#1f2937', borderRadius: 12, border: '1px solid #374151' }}>
          <div style={{ padding: 24, borderBottom: '1px solid #374151' }}>
            <h2 style={{ fontSize: 20, fontWeight: 'bold' }}>Pedidos Recentes</h2>
          </div>
          {pedidos.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af' }}>
              Nenhum pedido encontrado.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: 'rgba(55, 65, 81, 0.5)' }}>
                  <tr>
                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: 14, fontWeight: 500, color: '#9ca3af' }}>Código</th>
                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: 14, fontWeight: 500, color: '#9ca3af' }}>Status</th>
                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: 14, fontWeight: 500, color: '#9ca3af' }}>Destino</th>
                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: 14, fontWeight: 500, color: '#9ca3af' }}>Previsão</th>
                  </tr>
                </thead>
                <tbody style={{ borderTop: '1px solid #374151' }}>
                  {pedidos.map(pedido => (
                    <tr key={pedido.id} style={{ borderBottom: '1px solid #374151' }}>
                      <td style={{ padding: '16px 24px', fontFamily: 'monospace' }}>{pedido.codigo}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ 
                          padding: '4px 12px', 
                          borderRadius: 9999, 
                          fontSize: 12,
                          background: statusColor(pedido.status).replace('bg-', '')
                        }}>
                          {pedido.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>{pedido.destino_cidade} - {pedido.destino_estado}</td>
                      <td style={{ padding: '16px 24px' }}>{pedido.previsao || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={{ marginTop: 32, display: 'flex', gap: 16 }}>
          <button style={{ 
            background: '#2563eb', 
            color: 'white', 
            padding: '12px 24px', 
            borderRadius: 8, 
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <span>🔍</span>
            <span>Rastrear Pedido</span>
          </button>
          <button style={{ 
            background: '#22c55e', 
            color: 'white', 
            padding: '12px 24px', 
            borderRadius: 8, 
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <span>➕</span>
            <span>Novo Pedido</span>
          </button>
          <button style={{ 
            background: '#a855f7', 
            color: 'white', 
            padding: '12px 24px', 
            borderRadius: 8, 
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <span>🏭</span>
            <span>Gerenciar Armazéns</span>
          </button>
        </div>
      </main>
    </div>
  );
}