import { X, Package, MapPin, Percent } from 'lucide-react';

interface Zone {
  id: string;
  nome: string;
  tipo: string;
  capacidade: number;
  ocupacao: number;
}

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
  const cor = pct > 80 ? '#EF4444' : pct > 60 ? '#FACC15' : '#22C55E';

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-[#1F2937] rounded-t-2xl border-t border-white/10 animate-slide-up shadow-2xl"
        style={{ maxHeight: '45vh' }}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${cor}22` }}>
              <Package size={16} style={{ color: cor }} />
            </div>
            <div>
              <h3 className="text-base font-bold">{zone.nome}</h3>
              <span className="text-[11px] text-gray-400 uppercase">{zone.tipo}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-gray-400">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto" style={{ maxHeight: '35vh' }}>
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-gray-400 flex items-center gap-1">
                <Percent size={13} /> Ocupação
              </span>
              <span className="font-bold" style={{ color: cor }}>{pct}%</span>
            </div>
            <div className="h-3 bg-[#111827] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min(pct, 100)}%`, background: cor }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#111827] rounded-xl p-3">
              <p className="text-[11px] text-gray-400">Ocupado</p>
              <p className="text-lg font-bold">{zone.ocupacao}</p>
            </div>
            <div className="bg-[#111827] rounded-xl p-3">
              <p className="text-[11px] text-gray-400">Capacidade</p>
              <p className="text-lg font-bold">{zone.capacidade}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <MapPin size={12} />
            <span>ID: {zone.id.slice(0, 8)}</span>
          </div>

          {onViewInventory && (
            <button
              onClick={() => onViewInventory(zone.id)}
              className="w-full h-11 bg-blue-500 hover:bg-blue-600 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Package size={15} /> Ver itens nesta zona
            </button>
          )}
        </div>
      </div>
    </>
  );
}
