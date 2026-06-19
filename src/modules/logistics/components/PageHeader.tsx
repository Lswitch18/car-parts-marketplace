import { Plus, LucideIcon } from 'lucide-react';

export default function PageHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
  total,
  icon: Icon,
  accentColor = '#0D75FF',
}: {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  total?: number;
  icon?: LucideIcon;
  accentColor?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-6 gap-4">
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: `${accentColor}18`,
              border: `1px solid ${accentColor}30`,
            }}
          >
            <Icon size={17} style={{ color: accentColor }} />
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-bold text-white leading-tight">{title}</h2>
            {total !== undefined && (
              <span
                className="text-xs font-semibold px-2.5 py-0.5 rounded-full tabular-nums"
                style={{
                  background: `${accentColor}15`,
                  color: accentColor,
                  border: `1px solid ${accentColor}25`,
                }}
              >
                {total}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs mt-0.5 truncate" style={{ color: '#6B7280' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="flex-shrink-0 h-9 px-4 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all active:scale-[0.97]"
          style={{
            background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}cc 100%)`,
            color: '#fff',
            boxShadow: `0 4px 16px ${accentColor}40`,
          }}
        >
          <Plus size={15} />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
