import { X, Package, MapPin, Percent, Boxes, ArrowUpDown, Truck, Warehouse as WarehouseIcon } from 'lucide-react';

interface Zone {
  id: string;
  nome: string;
  tipo: string;
  capacidade: number;
  ocupacao: number;
}

const ZONE_TYPE_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  RECEBIMENTO: { label: 'Recebimento', color: '#3B82F6', icon: ArrowUpDown },
  PICKING: { label: 'Picking', color: '#22C55E', icon: Package },
  SEPARACAO: { label: 'Separação', color: '#FACC15', icon: Boxes },
  EXPEDICAO: { label: 'Expedição', color: '#F97316', icon: Truck },
  ARMAZENAGEM: { label: 'Armazenagem', color: '#8B5CF6', icon: WarehouseIcon },
};

export default function ZoneBottomSheet({
  zone,
  onClose,
  onViewInventory,
}: {
  zone: Zone | null;
  onClose: () => void;
  onViewInventory?: (zoneId: string) => void;
}) {
  if (!zone) return null;

  const pct = zone.capacidade > 0 ? Math.round((zone.ocupacao / zone.capacidade) * 100) : 0;
  const typeConf = ZONE_TYPE_CONFIG[zone.tipo] || { label: zone.tipo, color: '#6B7280', icon: Package };
  const Icon = typeConf.icon;
  const cor = pct > 80 ? '#EF4444' : pct > 60 ? '#FACC15' : typeConf.color;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-[#1a1a2e] rounded-t-2xl border-t border-white/10 animate-slide-up shadow-2xl"
        style={{ maxHeight: '50vh' }}
      >
        <div className="flex items-center gap-3 p-4 border-b border-white/5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${typeConf.color}22` }}
          >
            <Icon size={18} style={{ color: typeConf.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold truncate">{zone.nome}</h3>
            <div className="flex items-center gap-2">
              <span
                className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                style={{
                  background: `${typeConf.color}18`,
                  color: typeConf.color,
                }}
              >
                {typeConf.label}
              </span>
              <span className="text-[11px] text-gray-500">ID: {zone.id.slice(0, 6)}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-xl text-gray-400 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto" style={{ maxHeight: '35vh' }}>
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-sm text-gray-400 flex items-center gap-1.5">
                <Percent size={14} /> Ocupação
              </span>
              <span className="text-sm font-bold tabular-nums" style={{ color: cor }}>
                {pct}%
              </span>
            </div>
            <div className="h-3.5 bg-[#111827] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${Math.min(pct, 100)}%`,
                  background: `linear-gradient(90deg, ${typeConf.color}, ${cor})`,
                  boxShadow: `0 0 8px ${cor}44`,
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#111827] rounded-xl p-3.5 border border-white/5">
              <p className="text-[11px] text-gray-500 mb-0.5">Ocupado</p>
              <p className="text-lg font-bold tabular-nums">{zone.ocupacao}</p>
              <p className="text-[10px] text-gray-600">unidades</p>
            </div>
            <div className="bg-[#111827] rounded-xl p-3.5 border border-white/5">
              <p className="text-[11px] text-gray-500 mb-0.5">Capacidade</p>
              <p className="text-lg font-bold tabular-nums">{zone.capacidade}</p>
              <p className="text-[10px] text-gray-600">unidades</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-600">
            <MapPin size={12} />
            <span>Zona {zone.nome} · {typeConf.label}</span>
          </div>

          {onViewInventory && (
            <button
              onClick={() => onViewInventory(zone.id)}
              className="w-full h-11 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Package size={15} /> Ver itens nesta zona
            </button>
          )}
        </div>
      </div>
    </>
  );
}
