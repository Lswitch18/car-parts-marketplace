import { Package, Plus } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Package,
  title = 'Nenhum registro encontrado',
  description,
  actionLabel,
  onAction,
}: {
  icon?: any;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#111827] flex items-center justify-center mb-4">
        <Icon size={28} className="text-gray-600" />
      </div>
      <p className="text-sm font-medium text-gray-400">{title}</p>
      {description && (
        <p className="text-xs text-gray-600 mt-1 max-w-xs">{description}</p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 h-10 px-5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <Plus size={15} />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
