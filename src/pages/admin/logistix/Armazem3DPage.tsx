import { useState, Suspense, lazy } from 'react';
import { useQuery } from '@tanstack/react-query';
import { logisticsApi } from '../../../lib/logisticsApi';
import { Warehouse, Package, Percent, ChevronDown, Maximize2, Minimize2 } from 'lucide-react';
import ZoneBottomSheet from '../../../components/logistix/ZoneBottomSheet';
import GestureHint from '../../../components/logistix/GestureHint';

const WarehouseScene = lazy(() => import('../../../components/logistix/WarehouseScene'));

interface Zone {
  id: string;
  nome: string;
  tipo: string;
  capacidade: number;
  ocupacao: number;
  pos_x?: number;
  pos_y?: number;
  tipo_visual?: string;
}

function getOccupancyColor(pct: number): string {
  if (pct > 80) return '#EF4444';
  if (pct > 60) return '#FACC15';
  if (pct > 30) return '#22C55E';
  return '#166534';
}

export default function Armazem3DPage() {
  const [armazemId, setArmazemId] = useState<string>('');
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [showSelector, setShowSelector] = useState(false);

  const { data: armazens } = useQuery({
    queryKey: ['admin', 'armazens-list'],
    queryFn: async () => {
      const supabase = (await import('../../../lib/supabase')).supabase;
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

  const { data: layout, isLoading: layoutLoading } = useQuery({
    queryKey: ['admin', 'armazem-3d', armazemId],
    queryFn: () => logisticsApi.wms.layout(armazemId),
    enabled: !!armazemId,
  });

  const selectedArmazem = armazemList.find((a) => a.id === armazemId);
  const zonas = layout?.zonas || [];
  const inventario = layout?.inventario || [];
  const totalItens = inventario.reduce((s: number, i: any) => s + (i.quantidade || 0), 0);

  const armazem3d: {
    largura_m: number; comprimento_m: number; altura_m: number;
    racks_linhas: number; racks_colunas: number; nome: string;
    capacidade: number; ocupacao: number;
  } = layout?.armazem || {
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

  return (
    <div className={`flex flex-col ${fullscreen ? 'fixed inset-0 z-50 bg-[#0B1220]' : ''}`}>
      {/* Top Bar */}
      <div className="flex items-center justify-between p-3 bg-[#0B1220] border-b border-white/5 flex-shrink-0 z-10">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Warehouse size={18} className="text-blue-400 flex-shrink-0" />
          {selectedArmazem ? (
            <div className="min-w-0">
              <h2 className="text-sm font-bold truncate">{selectedArmazem.nome}</h2>
              <p className="text-[10px] text-gray-500 truncate">
                {selectedArmazem.cidade} · {selectedArmazem.estado}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Selecione um armazém</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFullscreen(!fullscreen)}
            className="w-9 h-9 rounded-lg bg-[#111827] border border-white/5 flex items-center justify-center text-gray-400 hover:text-white"
          >
            {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* CD Selector */}
      <div className="relative px-3 py-2 bg-[#0B1220] border-b border-white/5 flex-shrink-0">
        <button
          onClick={() => setShowSelector(!showSelector)}
          className="w-full h-10 bg-[#111827] border border-white/10 rounded-xl px-4 flex items-center justify-between text-sm text-white"
        >
          <span className={armazemId ? '' : 'text-gray-500'}>
            {selectedArmazem?.nome || 'Escolher centro de distribuição...'}
          </span>
          <ChevronDown size={16} className="text-gray-400" />
        </button>

        {showSelector && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setShowSelector(false)} />
            <div className="absolute left-3 right-3 top-full mt-1 z-30 bg-[#1F2937] border border-white/10 rounded-xl max-h-60 overflow-y-auto shadow-2xl">
              {armazemList.map((a) => {
                const pct = a.capacidade > 0
                  ? Math.round((a.ocupacao / a.capacidade) * 100)
                  : 0;
                const cor = getOccupancyColor(pct);
                return (
                  <button
                    key={a.id}
                    onClick={() => {
                      setArmazemId(a.id);
                      setShowSelector(false);
                      setSelectedZone(null);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors ${
                      a.id === armazemId ? 'bg-blue-500/10 border-l-2 border-blue-500' : ''
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#111827] flex items-center justify-center flex-shrink-0">
                      <Warehouse size={14} className="text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{a.nome}</p>
                      <p className="text-[11px] text-gray-500">
                        {a.cidade} · {a.estado}
                      </p>
                    </div>
                    <span className="text-xs font-bold" style={{ color: cor }}>
                      {pct}%
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* 3D Canvas */}
      <div className={`flex-1 relative ${fullscreen ? '' : 'min-h-[50vh]'}`}>
        {!armazemId ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 py-20">
            <Warehouse size={48} className="mb-3 text-gray-600" />
            <p className="text-sm">Selecione um centro de distribuição</p>
            <p className="text-xs text-gray-600 mt-1">para visualizar o modelo 3D</p>
          </div>
        ) : layoutLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            }
          >
            <WarehouseScene
              zonas={zonas}
              armazem={armazem3d}
              onZoneClick={(z) => setSelectedZone(z)}
            />
            <GestureHint />
          </Suspense>
        )}

        {/* Floating Stats */}
        {armazemId && !layoutLoading && (
          <div className="absolute top-3 left-3 flex items-center gap-2 text-xs bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/5 pointer-events-none">
            <span className="flex items-center gap-1">
              <Package size={12} className="text-blue-400" /> {totalItens}
            </span>
            <span className="text-gray-600">|</span>
            <span className="flex items-center gap-1">
              <Percent size={12} style={{ color: getOccupancyColor(pctGeral) }} />{' '}
              <span style={{ color: getOccupancyColor(pctGeral) }}>{pctGeral}%</span>
            </span>
          </div>
        )}

        {/* Occupancy Legend */}
        {armazemId && !layoutLoading && (
          <div className="absolute bottom-3 left-3 flex items-center gap-3 text-[10px] bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/5 pointer-events-none">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#22C55E]" /> Normal
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#FACC15]" /> Alerta
            </span>
            <span className="flex items-center gap-1">
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
