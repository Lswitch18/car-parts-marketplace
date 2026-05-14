import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../../lib/adminApi';
import { Save, Settings } from 'lucide-react';

export default function ConfigPage() {
  const queryClient = useQueryClient();
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const { data: config, isLoading } = useQuery({
    queryKey: ['admin', 'config'],
    queryFn: () => adminApi.configuracoes.list(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ chave, valor }: { chave: string; valor: string }) => adminApi.configuracoes.update(chave, valor),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'config'] }); setNewKey(''); setNewValue(''); },
  });

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  const entries = config ? Object.entries(config) : [];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold">Configurações</h2>
        <p className="text-sm text-gray-400 mt-1">Gerenciar configurações do sistema</p>
      </div>

      <div className="bg-[#111827] rounded-xl border border-white/5 p-6">
        <h3 className="text-base font-medium mb-4 flex items-center gap-2">
          <Settings size={16} className="text-gray-400" /> Configurações do Sistema
        </h3>
        <div className="space-y-4">
          {entries.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">Nenhuma configuração encontrada</p>
          ) : entries.map(([chave, valor]) => (
            <div key={chave} className="flex items-center justify-between py-3 border-b border-white/5 last:border-b-0">
              <div>
                <p className="text-sm font-medium text-white">{chave}</p>
                <p className="text-xs text-gray-400 mt-0.5 font-mono">{String(valor)}</p>
              </div>
              <input
                value={String(valor)}
                onChange={e => {
                  const newConfig = { ...config, [chave]: e.target.value };
                  queryClient.setQueryData(['admin', 'config'], newConfig);
                }}
                onBlur={() => updateMutation.mutate({ chave, valor: String(config?.[chave] || '') })}
                className="bg-[#0B1220] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-blue-500 w-48 text-right"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#111827] rounded-xl border border-white/5 p-6">
        <h3 className="text-base font-medium mb-4">Adicionar Configuração</h3>
        <div className="flex items-center gap-3">
          <input placeholder="Chave" value={newKey} onChange={e => setNewKey(e.target.value)}
            className="flex-1 bg-[#0B1220] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500" />
          <input placeholder="Valor" value={newValue} onChange={e => setNewValue(e.target.value)}
            className="flex-1 bg-[#0B1220] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500" />
          <button onClick={() => { if (newKey && newValue) updateMutation.mutate({ chave: newKey, valor: newValue }); }}
            disabled={!newKey || !newValue || updateMutation.isPending}
            className="h-10 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50">
            <Save size={16} /> Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
