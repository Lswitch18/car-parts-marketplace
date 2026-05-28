import { Package, Plus, LucideIcon } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Package,
  title = 'Nenhum registro encontrado',
  description,
  actionLabel,
  onAction,
  accentColor = '#0D75FF',
}: {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  accentColor?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center select-none">
      {/* Glow ring */}
      <div className="relative mb-5">
        <div
          className="absolute inset-0 rounded-3xl blur-xl opacity-30"
          style={{ background: accentColor }}
        />
        <div
          className="relative w-20 h-20 rounded-3xl flex items-center justify-center"
          style={{
            background: `${accentColor}12`,
            border: `1px solid ${accentColor}25`,
          }}
        >
          <Icon size={32} style={{ color: `${accentColor}99` }} />
        </div>
      </div>

      <p className="text-sm font-semibold text-white mb-1">{title}</p>

      {description && (
        <p className="text-xs max-w-[240px] leading-relaxed" style={{ color: '#6B7280' }}>
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 h-10 px-5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all active:scale-[0.97]"
          style={{
            background: `${accentColor}18`,
            color: accentColor,
            border: `1px solid ${accentColor}30`,
          }}
        >
          <Plus size={15} />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
