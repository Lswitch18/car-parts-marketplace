import { Plus } from 'lucide-react';

export default function PageHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
  total,
}: {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  total?: number;
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-xl font-bold">
          {title}
          {total !== undefined && (
            <span className="ml-2 text-sm font-normal text-gray-500">({total})</span>
          )}
        </h2>
        {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="h-10 px-5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors flex-shrink-0"
        >
          <Plus size={16} />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
