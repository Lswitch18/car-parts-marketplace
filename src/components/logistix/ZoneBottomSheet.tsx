import { X, Package, MapPin, Percent, Boxes, ArrowUpDown, Truck, Warehouse as WarehouseIcon, TrendingUp } from 'lucide-react';

interface Zone {
  id: string;
  nome: string;
  tipo: string;
  capacidade: number;
  ocupacao: number;
}

const ZONE_TYPE_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  RECEBIMENTO: { label: 'Recebimento', color: '#0D75FF', icon: ArrowUpDown },
  PICKING:     { label: 'Picking',     color: '#00E5FF', icon: Package },
  SEPARACAO:   { label: 'Separação',   color: '#FFB800', icon: Boxes },
  EXPEDICAO:   { label: 'Expedição',   color: '#FF7A00', icon: Truck },
  ARMAZENAGEM: { label: 'Armazenagem', color: '#7000FF', icon: WarehouseIcon },
};

function OccupancyBar({ pct, color }: { pct: number; color: string }) {
  const clampedPct = Math.min(pct, 100);
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs flex items-center gap-1.5" style={{ color: '#6B7280' }}>
          <Percent size={12} />
          Ocupação
        </span>
        <span
          className="text-sm font-bold tabular-nums"
          style={{ color }}
        >
          {pct}%
        </span>
      </div>
      <div
        className="h-2.5 rounded-full overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${clampedPct}%`,
            background: `linear-gradient(90deg, ${color}cc, ${color})`,
            boxShadow: `0 0 10px ${color}60`,
          }}
        />
      </div>
    </div>
  );
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
  const typeConf = ZONE_TYPE_CONFIG[zone.tipo] || { label: zone.tipo, color: '#6B7280', icon: Package };
  const Icon = typeConf.icon;
  const occupancyColor = pct > 80 ? '#FF4B4B' : pct > 60 ? '#FFB800' : typeConf.color;
  const livre = Math.max(0, zone.capacidade - zone.ocupacao);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 transition-all"
        style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden"
        style={{
          background: 'rgba(10,10,15,0.98)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderBottom: 'none',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 -24px 64px rgba(0,0,0,0.6)',
          maxHeight: '55vh',
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
        </div>

        {/* Header */}
        <div
          className="flex items-center gap-3 px-5 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background: `${typeConf.color}15`,
              border: `1px solid ${typeConf.color}30`,
            }}
          >
            <Icon size={20} style={{ color: typeConf.color }} />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-white truncate">{zone.nome}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{
                  background: `${typeConf.color}15`,
                  color: typeConf.color,
                  border: `1px solid ${typeConf.color}25`,
                }}
              >
                {typeConf.label}
              </span>
              <span className="text-[11px]" style={{ color: '#4B5563' }}>
                #{zone.id.slice(0, 6).toUpperCase()}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl transition-colors hover:bg-white/5 flex-shrink-0"
            style={{ color: '#6B7280' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div
          className="p-5 space-y-5 overflow-y-auto"
          style={{ maxHeight: 'calc(55vh - 120px)' }}
        >
          {/* Occupancy bar */}
          <OccupancyBar pct={pct} color={occupancyColor} />

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Ocupado', value: zone.ocupacao, color: occupancyColor, icon: TrendingUp },
              { label: 'Livre', value: livre, color: typeConf.color, icon: Package },
              { label: 'Total', value: zone.capacidade, color: '#6B7280', icon: Boxes },
            ].map(({ label, value, color, icon: StatIcon }) => (
              <div
                key={label}
                className="rounded-2xl p-3.5 text-center"
                style={{
                  background: `${color}08`,
                  border: `1px solid ${color}15`,
                }}
              >
                <StatIcon size={14} className="mx-auto mb-1.5" style={{ color: `${color}80` }} />
                <p className="text-lg font-bold tabular-nums text-white">{value}</p>
                <p className="text-[10px] mt-0.5" style={{ color: '#6B7280' }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Location */}
          <div
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <MapPin size={13} style={{ color: '#6B7280' }} />
            <span style={{ color: '#6B7280' }}>
              Zona <span className="text-white font-medium">{zone.nome}</span> · {typeConf.label}
            </span>
          </div>

          {/* CTA */}
          {onViewInventory && (
            <button
              onClick={() => onViewInventory(zone.id)}
              className="w-full h-12 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              style={{
                background: `linear-gradient(135deg, ${typeConf.color} 0%, ${typeConf.color}bb 100%)`,
                boxShadow: `0 8px 24px ${typeConf.color}40`,
                color: '#fff',
              }}
            >
              <Package size={15} />
              Ver itens nesta zona
            </button>
          )}
        </div>
      </div>
    </>
  );
}
