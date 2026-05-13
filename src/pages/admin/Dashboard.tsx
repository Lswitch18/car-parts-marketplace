import { useState, useEffect, useRef } from 'react';
import { useAnalytics, useDailyStats, DailyStatsData } from '../../hooks/useAnalytics';
import { RevenueChart, CategoryChart, TopSellersChart, TransactionStatus } from '../../components/admin/analytics';
import { useI18n } from '../../lib/i18n';
import { Users, TrendingUp, DollarSign, ShoppingCart, RefreshCw, MapPin, Navigation } from 'lucide-react';
import GaidLogo from '../../components/GaidLogo';

// ── Tipos ────────────────────────────────────────────────────────────────────
interface City { name: string; state: string; lat: number; lng: number; color: string }
interface Route { from: City; to: City; status: string; order: string }

// ── Cidades brasileiras (origem/destino) ─────────────────────────────────────
const CITIES: City[] = [
  { name: 'São Paulo',       state: 'SP', lat: -23.5505, lng: -46.6333, color: '#0D75FF' },
  { name: 'Rio de Janeiro',  state: 'RJ', lat: -22.9068, lng: -43.1729, color: '#00D97E' },
  { name: 'Belo Horizonte',  state: 'MG', lat: -19.9167, lng: -43.9345, color: '#FFB800' },
  { name: 'Curitiba',        state: 'PR', lat: -25.4297, lng: -49.2711, color: '#FF4B4B' },
  { name: 'Porto Alegre',    state: 'RS', lat: -30.0346, lng: -51.2177, color: '#A855F7' },
  { name: 'Salvador',        state: 'BA', lat: -12.9714, lng: -38.5014, color: '#0D75FF' },
  { name: 'Brasília',        state: 'DF', lat: -15.7801, lng: -47.9292, color: '#00D97E' },
  { name: 'Manaus',          state: 'AM', lat:  -3.1190, lng: -60.0217, color: '#FFB800' },
];

const ROUTES: Route[] = [
  { from: CITIES[0], to: CITIES[1], status: 'transit',   order: '#PED-1248' },
  { from: CITIES[2], to: CITIES[3], status: 'delayed',   order: '#PED-1247' },
  { from: CITIES[0], to: CITIES[4], status: 'delivered', order: '#PED-1246' },
  { from: CITIES[6], to: CITIES[5], status: 'transit',   order: '#PED-1245' },
  { from: CITIES[1], to: CITIES[7], status: 'transit',   order: '#PED-1244' },
];

const STATUS_COLOR: Record<string, string> = {
  transit:   '#0D75FF',
  delayed:   '#FF4B4B',
  delivered: '#00D97E',
};

// ── Skeleton ─────────────────────────────────────────────────────────────────
function Sk({ h = 'h-24', cls = '' }: { h?: string; cls?: string }) {
  return <div className={`skeleton ${h} rounded-xl ${cls}`} />;
}

// ── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ title, value, icon: Icon, color, trend, sub }: {
  title: string; value: string | number; icon: React.ElementType;
  color: string; trend?: string; sub?: string;
}) {
  return (
    <div className="stat-card group">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 4, fontFamily: 'Sora, sans-serif', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{title}</p>
          <p style={{ fontSize: 28, fontWeight: 800, color, fontFamily: 'Sora, sans-serif', lineHeight: 1 }}>{value}</p>
          {trend && (
            <p className="flex items-center gap-1 mt-1" style={{ fontSize: 11, color: trend.startsWith('-') ? 'var(--color-error)' : 'var(--color-success)' }}>
              <TrendingUp size={10} />
              {trend} vs mês anterior
            </p>
          )}
          {sub && <p style={{ fontSize: 11, color: 'var(--text-disabled)', marginTop: 2 }}>{sub}</p>}
        </div>
        <div style={{ background: 'rgba(13,117,255,0.12)', border: '1px solid rgba(13,117,255,0.20)', borderRadius: 10, padding: 10 }}>
          <Icon size={18} style={{ color: 'var(--daig-blue)' }} />
        </div>
      </div>
      {/* bottom line accent */}
      <div style={{ position: 'absolute', bottom: 0, left: 16, right: 16, height: 1, background: 'linear-gradient(90deg, transparent, rgba(13,117,255,0.4), transparent)', opacity: 0, transition: 'opacity .3s' }} className="group-hover:opacity-100" />
    </div>
  );
}

// ── MapaBrasil (Leaflet via CDN global) ───────────────────────────────────────
function MapaBrasil({ selectedOrigin, selectedDest }: { selectedOrigin: string; selectedDest: string }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    const L = (window as any).L;
    if (!L || !mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: [-15.5, -53.5],
      zoom: 4,
      zoomControl: true,
      attributionControl: false,
    });
    mapInstance.current = map;

    // Tile escuro
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Marcadores
    CITIES.forEach(city => {
      const icon = L.divIcon({
        html: `<div style="width:12px;height:12px;border-radius:50%;background:${city.color};border:2px solid #fff;box-shadow:0 0 8px ${city.color}88"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
        className: '',
      });
      L.marker([city.lat, city.lng], { icon })
        .addTo(map)
        .bindTooltip(`<b>${city.name}</b> - ${city.state}`, { direction: 'top', offset: [0, -8] });
    });

    // Linhas de rota
    ROUTES.forEach(route => {
      const color = STATUS_COLOR[route.status] || '#0D75FF';
      L.polyline([[route.from.lat, route.from.lng], [route.to.lat, route.to.lng]], {
        color,
        weight: 2,
        opacity: 0.7,
        dashArray: route.status === 'transit' ? '8 4' : undefined,
      }).addTo(map).bindTooltip(`${route.order}: ${route.from.name} → ${route.to.name}`);
    });

    return () => { map.remove(); mapInstance.current = null; };
  }, []);

  // Filtro visual
  useEffect(() => {
    const L = (window as any).L;
    const map = mapInstance.current;
    if (!L || !map) return;
    // Foco na cidade de origem selecionada
    const city = CITIES.find(c => c.name === selectedOrigin);
    if (city) map.flyTo([city.lat, city.lng], 6, { animate: true, duration: 1 });
  }, [selectedOrigin]);

  return (
    <div ref={mapRef} style={{ width: '100%', height: '100%', borderRadius: 12, minHeight: 320 }} />
  );
}

// ── Dashboard Principal ───────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { t } = useI18n();
  const { data, isLoading, error, refetch } = useAnalytics();
  const { data: dailyRaw } = useDailyStats();
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [originCity, setOriginCity] = useState('São Paulo');
  const [destCity, setDestCity] = useState('Rio de Janeiro');
  const [activeTab, setActiveTab] = useState<'overview' | 'map' | 'orders'>('overview');

  const stats = dailyRaw as DailyStatsData;

  const fmt = (v: any) => {
    const n = Number(v || 0);
    if (n >= 1_000_000) return `R$ ${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000)     return `R$ ${(n / 1_000).toFixed(1)}K`;
    return `R$ ${n.toLocaleString('pt-BR')}`;
  };

  const RECENT = [
    { id: '#PED-1248', cliente: 'Magazine Luiza', origem: 'SP',  destino: 'Campinas - SP', status: 'transit',   prev: '23/05/2026' },
    { id: '#PED-1247', cliente: 'Mercado Livre',  origem: 'RJ',  destino: 'Niterói - RJ',  status: 'transit',   prev: '23/05/2026' },
    { id: '#PED-1246', cliente: 'Americanas',     origem: 'MG',  destino: 'Contagem - MG', status: 'delayed',   prev: '22/05/2026' },
    { id: '#PED-1245', cliente: 'Netshoes',       origem: 'SP',  destino: 'São José - SC', status: 'delivered', prev: '20/05/2026' },
    { id: '#PED-1244', cliente: 'Casas Bahia',    origem: 'PR',  destino: 'Curitiba - PR', status: 'delivered', prev: '19/05/2026' },
  ];

  const STATUS_LABEL: Record<string, string> = {
    transit:   'Em trânsito',
    delayed:   'Atrasado',
    delivered: 'Entregue',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)', padding: '24px', fontFamily: 'Sora, sans-serif' }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <GaidLogo size={36} variant="horizontal" animated />
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: 0 }}>Dashboard Admin</h1>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
              Atualizado: {lastUpdate.toLocaleTimeString('pt-BR')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Filtro origem */}
          <select
            value={originCity}
            onChange={e => setOriginCity(e.target.value)}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', color: '#fff', borderRadius: 8, padding: '8px 12px', fontSize: 13, fontFamily: 'Sora, sans-serif', cursor: 'pointer' }}
          >
            {CITIES.map(c => <option key={c.name} value={c.name}>{c.name} - {c.state}</option>)}
          </select>
          <Navigation size={14} style={{ color: 'var(--daig-blue)' }} />
          {/* Filtro destino */}
          <select
            value={destCity}
            onChange={e => setDestCity(e.target.value)}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', color: '#fff', borderRadius: 8, padding: '8px 12px', fontSize: 13, fontFamily: 'Sora, sans-serif', cursor: 'pointer' }}
          >
            {CITIES.map(c => <option key={c.name} value={c.name}>{c.name} - {c.state}</option>)}
          </select>
          <button
            onClick={() => { refetch(); setLastUpdate(new Date()); }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-card)', border: '1px solid var(--border-default)', color: '#fff', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer', fontFamily: 'Sora, sans-serif' }}
          >
            <RefreshCw size={14} />
            Atualizar
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(255,75,75,.12)', border: '1px solid rgba(255,75,75,.3)', color: '#FF4B4B', padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: 13 }}>
          Erro ao carregar dados: {error.message}
        </div>
      )}

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <Sk key={i} h="h-24" />)
        ) : (<>
          <StatCard title="Pedidos Totais"    value={stats?.total_parts ?? 0}        icon={ShoppingCart} color="#fff"    trend="+18.2%" />
          <StatCard title="Entregas Concluídas" value={stats?.today_transactions ?? 0} icon={TrendingUp}   color="#00D97E" trend="+22.7%" />
          <StatCard title="Atrasos"           value="63"                              icon={RefreshCw}    color="#FF4B4B" trend="-15.3%" />
          <StatCard title="Taxa de Entrega"   value="92.4%"                           icon={Navigation}   color="#0D75FF" trend="+5.7%" />
          <StatCard title="Receita Total"     value={fmt(data?.financial?.total_gmv)} icon={DollarSign}   color="#FFB800" trend="-8.6%" />
        </>)}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-2 mb-5">
        {(['overview', 'map', 'orders'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 18px', borderRadius: 8, fontSize: 13, fontFamily: 'Sora, sans-serif', fontWeight: 600, cursor: 'pointer',
              background: activeTab === tab ? 'var(--daig-blue)' : 'var(--bg-card)',
              color: activeTab === tab ? '#fff' : 'var(--text-muted)',
              border: activeTab === tab ? 'none' : '1px solid var(--border-default)',
              transition: 'all .2s',
            }}
          >
            {{ overview: '📊 Visão Geral', map: '🗺️ Mapa de Rotas', orders: '📦 Pedidos' }[tab]}
          </button>
        ))}
      </div>

      {/* ── Tab: Overview ── */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          <div className="lg:col-span-2">
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 14, padding: 20 }}>
              {isLoading ? <Sk h="h-64" /> : (
                <RevenueChart data={data?.sales?.sales || []} total={data?.sales?.total || 0} />
              )}
            </div>
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 14, padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Status das Entregas</h3>
            {isLoading ? <Sk h="h-48" /> : (
              <TransactionStatus data={data?.status?.status || []} />
            )}
            {/* Legenda */}
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[['#00D97E', 'Entregue', '1.024 (82.1%)'], ['#0D75FF', 'Em trânsito', '142 (11.4%)'], ['#FFB800', 'Atrasado', '63 (5.0%)'], ['#FF4B4B', 'Cancelado', '19 (1.5%)']].map(([color, label, count]) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}88` }} />
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Mapa ── */}
      {activeTab === 'map' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          <div className="lg:col-span-2" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 14, padding: 16, minHeight: 380 }}>
            <div className="flex items-center justify-between mb-3">
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Expedições em Tempo Real</h3>
              <div className="flex gap-3">
                {[['#0D75FF','Em trânsito'], ['#FF4B4B','Atrasado'], ['#00D97E','Entregue']].map(([c, l]) => (
                  <span key={l} className="flex items-center gap-1" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: c, display: 'inline-block' }} />{l}
                  </span>
                ))}
              </div>
            </div>
            <MapaBrasil selectedOrigin={originCity} selectedDest={destCity} />
          </div>

          {/* Painel de rotas */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 14, padding: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 12 }}>Rotas Ativas</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ROUTES.map(r => (
                <div key={r.order} style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: '10px 12px', border: `1px solid ${STATUS_COLOR[r.status]}33` }}>
                  <div className="flex items-center justify-between mb-1">
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{r.order}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: STATUS_COLOR[r.status], background: `${STATUS_COLOR[r.status]}18`, padding: '2px 8px', borderRadius: 20 }}>
                      {STATUS_LABEL[r.status]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={10} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.from.name}</span>
                    <span style={{ color: 'var(--daig-blue)', fontSize: 10 }}>→</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.to.name}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Armazéns / cidades */}
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '16px 0 10px' }}>Armazéns</h3>
            {[['CD São Paulo','85%','#00D97E'],['CD Rio de Janeiro','76%','#00D97E'],['CD Belo Horizonte','62%','#FFB800'],['CD Curitiba','58%','#FFB800'],['CD Salvador','38%','#FF4B4B']].map(([name, pct, color]) => (
              <div key={name} style={{ marginBottom: 8 }}>
                <div className="flex justify-between mb-1">
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{name}</span>
                  <span style={{ fontSize: 12, color, fontWeight: 700 }}>{pct}</span>
                </div>
                <div style={{ height: 4, background: 'var(--bg-void)', borderRadius: 2 }}>
                  <div style={{ height: '100%', width: pct, background: color, borderRadius: 2, boxShadow: `0 0 6px ${color}66`, transition: 'width .5s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tab: Pedidos ── */}
      {activeTab === 'orders' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 14, padding: 20, marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Pedidos Recentes</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  {['Pedido', 'Cliente', 'Origem', 'Destino', 'Status', 'Previsão'].map(h => (
                    <th key={h} style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: 11, fontWeight: 600, padding: '10px 12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}><td colSpan={6} style={{ padding: '8px 12px' }}><Sk h="h-8" /></td></tr>
                    ))
                  : RECENT.map(row => (
                      <tr key={row.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background .2s' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <td style={{ padding: '12px', fontSize: 13, color: '#fff', fontWeight: 700 }}>{row.id}</td>
                        <td style={{ padding: '12px', fontSize: 13, color: 'var(--text-secondary)' }}>{row.cliente}</td>
                        <td style={{ padding: '12px', fontSize: 13, color: 'var(--text-muted)' }}>{row.origem}</td>
                        <td style={{ padding: '12px', fontSize: 13, color: 'var(--text-muted)' }}>{row.destino}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: STATUS_COLOR[row.status], background: `${STATUS_COLOR[row.status]}18`, padding: '3px 10px', borderRadius: 20, border: `1px solid ${STATUS_COLOR[row.status]}33` }}>
                            {STATUS_LABEL[row.status]}
                          </span>
                        </td>
                        <td style={{ padding: '12px', fontSize: 13, color: 'var(--text-muted)' }}>{row.prev}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Segunda linha de gráficos (overview) ── */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 14, padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 12 }}>Usuários</h3>
            <div className="grid grid-cols-3 gap-3">
              {[['Total', stats?.total_users ?? 0, '#fff'], ['Ativos', stats?.active_listings ?? 0, '#00D97E'], ['Hoje', stats?.today_transactions ?? 0, '#0D75FF']].map(([l, v, c]) => (
                <div key={l as string} style={{ textAlign: 'center', padding: 12, background: 'var(--bg-elevated)', borderRadius: 10 }}>
                  <p style={{ fontSize: 22, fontWeight: 800, color: c as string }}>{v as number}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{l as string}</p>
                </div>
              ))}
            </div>
            {isLoading ? <Sk h="h-40 mt-4" /> : <div className="mt-4"><CategoryChart data={data?.categories?.categories || []} /></div>}
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 14, padding: 20 }}>
            {isLoading ? <Sk h="h-full" /> : <TopSellersChart data={data?.sellers?.sellers || []} />}
          </div>
        </div>
      )}
    </div>
  );
}
