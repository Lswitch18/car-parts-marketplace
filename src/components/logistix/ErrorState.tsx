import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function ErrorState({
  message = 'Erro ao carregar dados',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center select-none">
      <div className="relative mb-5">
        <div
          className="absolute inset-0 rounded-3xl blur-xl opacity-25"
          style={{ background: '#FF4B4B' }}
        />
        <div
          className="relative w-20 h-20 rounded-3xl flex items-center justify-center"
          style={{
            background: 'rgba(255,75,75,0.1)',
            border: '1px solid rgba(255,75,75,0.25)',
          }}
        >
          <AlertTriangle size={32} style={{ color: 'rgba(255,75,75,0.8)' }} />
        </div>
      </div>

      <p className="text-sm font-semibold text-white mb-1">{message}</p>
      <p className="text-xs" style={{ color: '#6B7280' }}>
        Verifique a conexão e tente novamente
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 h-10 px-5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all active:scale-[0.97]"
          style={{
            background: 'rgba(255,75,75,0.1)',
            color: '#FF6B6B',
            border: '1px solid rgba(255,75,75,0.25)',
          }}
        >
          <RotateCcw size={14} />
          Tentar novamente
        </button>
      )}
    </div>
  );
}
