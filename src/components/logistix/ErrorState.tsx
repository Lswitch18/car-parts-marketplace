import { AlertCircle, RotateCcw } from 'lucide-react';

export default function ErrorState({
  message = 'Erro ao carregar dados',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
        <AlertCircle size={28} className="text-red-400" />
      </div>
      <p className="text-sm font-medium text-gray-400">{message}</p>
      <p className="text-xs text-gray-600 mt-1">Tente novamente ou verifique a conexão</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 h-10 px-5 bg-[#1F2937] hover:bg-[#2a3a4a] text-gray-300 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors border border-white/5"
        >
          <RotateCcw size={15} />
          Tentar novamente
        </button>
      )}
    </div>
  );
}
