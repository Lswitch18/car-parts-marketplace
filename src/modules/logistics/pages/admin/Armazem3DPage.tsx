import { useState, Suspense, lazy } from 'react';
import { useQuery } from '@tanstack/react-query';
import { logisticsApi } from '@/modules/logistics/api/logisticsApi';
import {
  Warehouse, Package, Percent, ChevronDown,
  RotateCcw, Search, AlertCircle, Boxes, MapPin,
} from 'lucide-react';
import ZoneBottomSheet from '@/modules/logistics/components/ZoneBottomSheet';
import GestureHint from '@/modules/logistics/components/GestureHint';

const WarehouseScene = lazy(() => import('@/modules/logistics/components/WarehouseScene'));

interface Zone {
  id: string;
  nome: string;
  tipo: string;
  capacidade: number;
  ocupacao: number;
  pos_x?: number;
  pos_y?: number;
}

const ZONE_TYPE_LABEL: Record<string, string> = {
  RECEBIMENTO: 'Azul',
  PICKING: 'Verde',
  SEPARACAO: 'Amarelo',
  EXPEDICAO: 'Laranja',
  ARMAZENAGEM: 'Roxo',
};

function getOccColor(pct: number): string {
  if (pct > 80) return '#EF4444';
  if (pct > 60) return '#FACC15';
  if (pct > 30) return '#22C55E';
  return '#166534';
}

function LoadingSkeleton() {
  return (
    <div className="flex-1 flex items-center justify-center bg-[#0a0a1a]">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Warehouse size={28} className="text-blue-400/50" />
        </div>
        <div className="w-32 h-3 bg-surface/5 rounded-full mx-auto animate-pulse mb-2" />
        <div className="w-24 h-2 bg-surface/5 rounded-full mx-auto animate-pulse" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-text-muted bg-[#0a0a1a]">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center mb-4">
        <Boxes size={36} className="text-gray-600" />
      </div>
      <p className="text-sm text-text-secondary font-medium">Nenhuma zona encontrada</p>
      <p className="text-xs text-gray-600 mt-1">Este armazém não possui zonas configuradas</p>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#0a0a1a]">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
        <AlertCircle size={28} className="text-red-400" />
      </div>
      <p className="text-sm text-text-secondary font-medium">Erro ao carregar</p>
      <p className="text-xs text-gray-600 mt-1 mb-4 text-center px-8">{message}</p>
      <button
        onClick={onRetry}
        className="h-9 px-4 bg-[#1F2937] hover:bg-[#2a3a4a] rounded-xl text-xs text-gray-300 font-medium transition-colors border border-border"
      >
        Tentar novamente
      </button>
    </div>
  );
}

export default function Armazem3DPage() {
  const [armazemId, setArmazemId] = useState<string>('');
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [showSelector, setShowSelector] = useState(false);
  const [searchCD, setSearchCD] = useState('');
  const [resetKey, setResetKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedSlot, setHighlightedSlot] = useState<{
    rack: string;
    bay: string;
    level: string;
    position: string;
    formatted: string;
    px: number;
    py: number;
  } | null>(null);

  function parseWMSSlot(search: string) {
    const clean = search.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    const match = clean.match(/^([A-F])(0[1-6]|[1-6])([A-F])([1-2])$/);
    if (match) {
      const rack = match[1];
      const bayStr = match[2].padStart(2, '0');
      const level = match[3];
      const position = match[4];
      const py = rack.charCodeAt(0) - 65;
      const px = parseInt(bayStr, 10) - 1;
      return { rack, bay: bayStr, level, position, formatted: `${rack}-${bayStr}-${level}${position}`, px, py };
    }
    return null;
  }

  const {
    data: armazens,
    isLoading: loadingArmazens,
    isError: errorArmazens,
  } = useQuery({
    queryKey: ['admin', 'armazens-list'],
    queryFn: async () => {
      const supabase = (await import('@/modules/shared/lib/supabase')).supabase;
      const { data } = await supabase
        .from('admin_armazens')
        .select('id,nome,cidade,estado,largura_m,comprimento_m,capacidade,ocupacao')
        .order('nome');
      return (data || []) as Array<{
        id: string;
        nome: string;
        cidade: string;
        estado: string;
        largura_m: number;
        comprimento_m: number;
        capacidade: number;
        ocupacao: number;
      }>;
    },
  });

  const armazemList = Array.isArray(armazens) ? armazens : [];
  const filteredCDs = searchCD
    ? armazemList.filter(
        (a) =>
          a.nome.toLowerCase().includes(searchCD.toLowerCase()) ||
          a.cidade.toLowerCase().includes(searchCD.toLowerCase())
      )
    : armazemList;

  const { data: layout, isLoading: layoutLoading, isError: layoutError, refetch: refetchLayout } = useQuery({
    queryKey: ['admin', 'armazem-3d', armazemId],
    queryFn: () => logisticsApi.wms.layout(armazemId),
    enabled: !!armazemId,
  });

  const selectedArmazem = armazemList.find((a) => a.id === armazemId);
  const zonas = layout?.zonas || [];
  const inventario = layout?.inventario || [];
  const totalItens = inventario.reduce((s: number, i: any) => s + (i.quantidade || 0), 0);
  const totalZonas = zonas.length;

  const armazem3d = layout?.armazem || {
    largura_m: selectedArmazem?.largura_m || 60,
    comprimento_m: selectedArmazem?.comprimento_m || 80,
    altura_m: 10,
    racks_linhas: 6,
    racks_colunas: 10,
    nome: selectedArmazem?.nome || '',
    capacidade: 0,
    ocupacao: 0,
  };

  const pctGeral = armazem3d.capacidade > 0
    ? Math.round((armazem3d.ocupacao / armazem3d.capacidade) * 100)
    : 0;

  const handleRetry = () => {
    refetchLayout();
    setResetKey((k) => k + 1);
  };

  const showEmptyState = armazemId && !layoutLoading && !layoutError && zonas.length === 0;

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a1a] flex flex-col">
      {/* Floating Top Bar + CD Selector */}
      <div className="absolute top-0 left-0 right-0 z-20">
        <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Warehouse size={16} className="text-blue-400 flex-shrink-0" />
            {selectedArmazem ? (
              <div className="min-w-0">
                <h2 className="text-sm font-bold truncate drop-shadow-lg">{selectedArmazem.nome}</h2>
                <p className="text-[10px] text-text-secondary truncate drop-shadow">
                  {selectedArmazem.cidade} · {selectedArmazem.estado}
                </p>
              </div>
            ) : (
              <p className="text-sm text-text-secondary">Selecione um centro de distribuição</p>
            )}
          </div>
          {armazemId && (
            <button
              onClick={() => setResetKey((k) => k + 1)}
              className="w-8 h-8 rounded-lg bg-black/40 backdrop-blur-sm border border-border flex items-center justify-center text-text-secondary hover:text-white transition-colors"
              title="Resetar visão"
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>

        {/* CD Selector */}
        <div className="px-3 pb-2 bg-gradient-to-b from-black/60 to-transparent backdrop-blur-sm">
          <button
            onClick={() => {
              setShowSelector(!showSelector);
              setSearchCD('');
            }}
            className="w-full h-10 bg-black/40 backdrop-blur-sm border border-border rounded-xl px-3.5 flex items-center justify-between text-sm text-white active:scale-[0.99] transition-transform"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Warehouse size={14} className="text-blue-400 flex-shrink-0" />
              <span className={`truncate ${armazemId ? '' : 'text-text-secondary'}`}>
                {selectedArmazem?.nome || 'Escolher centro de distribuição...'}
              </span>
            </div>
            <ChevronDown
              size={14}
              className={`text-text-secondary transition-transform flex-shrink-0 ${showSelector ? 'rotate-180' : ''}`}
            />
          </button>

          {showSelector && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowSelector(false)} />
              <div className="absolute left-3 right-3 top-full mt-1 z-30 bg-[#1a1a2e]/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-3 h-10 border-b border-border">
                  <Search size={14} className="text-text-muted flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Buscar CD por nome ou cidade..."
                    value={searchCD}
                    onChange={(e) => setSearchCD(e.target.value)}
                    className="bg-transparent border-none outline-none text-xs text-white w-full placeholder:text-gray-600"
                    autoFocus
                  />
                </div>
                <div className="max-h-52 overflow-y-auto">
                  {loadingArmazens ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : errorArmazens ? (
                    <div className="text-center py-6 text-xs text-red-400">
                      Erro ao carregar armazéns
                    </div>
                  ) : filteredCDs.length === 0 ? (
                    <div className="text-center py-6 text-xs text-text-muted">
                      Nenhum CD encontrado
                    </div>
                  ) : (
                    filteredCDs.map((a) => {
                      const pct = a.capacidade > 0 ? Math.round((a.ocupacao / a.capacidade) * 100) : 0;
                      const cor = getOccColor(pct);
                      return (
                        <button
                          key={a.id}
                          onClick={() => {
                            setArmazemId(a.id);
                            setShowSelector(false);
                            setSelectedZone(null);
                          }}
                          className={`w-full flex items-center gap-3 px-3.5 py-3 text-left hover:bg-surface/5 transition-colors ${
                            a.id === armazemId ? 'bg-primary/10 border-l-2 border-blue-500' : ''
                          }`}
                        >
                          <div className="w-9 h-9 rounded-lg bg-[#111827] flex items-center justify-center flex-shrink-0">
                            <Warehouse size={14} className="text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{a.nome}</p>
                            <p className="text-[11px] text-text-muted flex items-center gap-1">
                              <MapPin size={10} /> {a.cidade}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="text-xs font-bold" style={{ color: cor }}>
                              {pct}%
                            </span>
                            <p className="text-[10px] text-gray-600">ocupação</p>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Mini Stats */}
        {armazemId && !layoutLoading && !layoutError && zonas.length > 0 && (
          <div className="flex items-center gap-3 px-3 py-1.5 backdrop-blur-sm bg-black/30">
            <span className="flex items-center gap-1.5 text-[11px] text-text-secondary whitespace-nowrap">
              <Boxes size={12} className="text-blue-400" />
              {totalZonas} zonas
            </span>
            <span className="w-px h-3 bg-surface/10" />
            <span className="flex items-center gap-1.5 text-[11px] text-text-secondary whitespace-nowrap">
              <Package size={12} className="text-cyan-400" />
              {totalItens} itens
            </span>
            <span className="w-px h-3 bg-surface/10" />
            <span className="flex items-center gap-1.5 text-[11px] whitespace-nowrap" style={{ color: getOccColor(pctGeral) }}>
              <Percent size={12} />
              {pctGeral}% ocupado
            </span>
          </div>
        )}

        {/* Zone Legend */}
        {armazemId && !layoutLoading && zonas.length > 0 && (
          <div className="flex items-center gap-3 px-3 py-1.5 backdrop-blur-sm bg-black/20 overflow-x-auto">
            <span className="text-[10px] text-text-muted font-medium mr-1">Zonas:</span>
            {Object.entries(ZONE_TYPE_LABEL).map(([tipo, label]) => {
              const hasType = zonas.some((z) => z.tipo === tipo);
              if (!hasType) return null;
              const colors: Record<string, string> = {
                RECEBIMENTO: '#3B82F6', PICKING: '#22C55E',
                SEPARACAO: '#FACC15', EXPEDICAO: '#F97316',
                ARMAZENAGEM: '#8B5CF6',
              };
              return (
                <span key={tipo} className="flex items-center gap-1 text-[10px] text-text-secondary whitespace-nowrap">
                  <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: colors[tipo] || '#6B7280' }} />
                  {label}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* 3D Canvas - always fills the screen */}
      <div className="flex-1 relative">
        {!armazemId ? (
          <div className="flex flex-col items-center justify-center h-full text-text-muted py-24">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center mb-4">
              <Warehouse size={36} className="text-gray-600" />
            </div>
            <p className="text-sm font-medium">Selecione um centro de distribuição</p>
            <p className="text-xs text-gray-600 mt-1">para visualizar o modelo 3D interativo</p>
          </div>
        ) : layoutLoading ? (
          <LoadingSkeleton />
        ) : layoutError ? (
          <ErrorState message="Não foi possível carregar os dados do armazém. Verifique a conexão." onRetry={handleRetry} />
        ) : showEmptyState ? (
          <EmptyState />
        ) : (
          <Suspense fallback={<LoadingSkeleton />}>
            <WarehouseScene
              key={resetKey}
              zonas={zonas}
              armazem={armazem3d}
              onZoneClick={(z) => setSelectedZone(z)}
              highlightedSlot={highlightedSlot}
            />
            <GestureHint />
          </Suspense>
        )}

        {/* WMS Slot Search Overlay */}
        {armazemId && zonas.length > 0 && !layoutLoading && !layoutError && (
          <div className="absolute top-28 right-3 z-30 bg-[#111827]/90 backdrop-blur-md border border-border p-4 rounded-xl shadow-2xl w-64 space-y-3 pointer-events-auto">
            <div>
              <span className="text-[10px] text-primary font-bold uppercase tracking-widest font-mono">Endereço WMS</span>
              <p className="text-[11px] text-text-secondary font-medium">Digite a posição (Ex: A-03-D1)</p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ex: A-03-D1..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  const parsed = parseWMSSlot(e.target.value);
                  setHighlightedSlot(parsed);
                }}
                className="flex-1 h-9 bg-black/35 border border-border/80 rounded-lg px-3 text-xs text-white outline-none focus:border-primary font-mono placeholder:text-gray-600"
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setHighlightedSlot(null);
                  }}
                  className="h-9 px-2 bg-surface hover:bg-black/30 border border-border text-text-secondary rounded-lg text-xs"
                >
                  Limpar
                </button>
              )}
            </div>

            {highlightedSlot && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-2.5 space-y-1">
                <span className="text-[10px] text-primary font-bold uppercase tracking-wider block">Localizado</span>
                <div className="text-[11px] text-text-secondary space-y-0.5 font-mono">
                  <p><span className="text-text-muted font-sans">Corredor:</span> {highlightedSlot.rack} (Linha {highlightedSlot.py + 1})</p>
                  <p><span className="text-text-muted font-sans">Baia:</span> B{highlightedSlot.bay} (Coluna {highlightedSlot.px + 1})</p>
                  <p><span className="text-text-muted font-sans">Nível:</span> {highlightedSlot.level}</p>
                  <p><span className="text-text-muted font-sans">Posição:</span> P{highlightedSlot.position}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Legend overlay at bottom */}
        {armazemId && zonas.length > 0 && !layoutLoading && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-3 text-[10px] bg-black/70 backdrop-blur-md rounded-xl px-4 py-2 border border-border pointer-events-none shadow-lg">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#22C55E]" /> Normal
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#FACC15]" /> Alerta
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#EF4444]" /> Crítico
            </span>
          </div>
        )}
      </div>

      {/* Bottom Sheet */}
      <ZoneBottomSheet
        zone={selectedZone}
        onClose={() => setSelectedZone(null)}
        onViewInventory={(zoneId) => {
          console.log('Ver itens da zona:', zoneId);
        }}
      />
    </div>
  );
}
