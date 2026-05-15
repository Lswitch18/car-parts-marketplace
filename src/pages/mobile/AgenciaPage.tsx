import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { logisticsApi } from '../../lib/logisticsApi';
import { CheckCircle, X, Clock, Building } from 'lucide-react';

export default function AgenciaPage() {
  const queryClient = useQueryClient();
  const [codigo, setCodigo] = useState('');
  const [selectedAgencia, setSelectedAgencia] = useState('');
  const [showResult, setShowResult] = useState<any>(null);

  const { data: agencias } = useQuery({
    queryKey: ['agencias'],
    queryFn: async () => {
      const supabase = (await import('../../lib/supabase')).supabase;
      const { data } = await supabase.from('admin_armazens').select('id,nome,cidade').ilike('nome', 'Ag%').order('nome');
      return data || [];
    },
  });

  const { data: dropoffs } = useQuery({
    queryKey: ['dropoffs'],
    queryFn: (): Promise<any[]> => logisticsApi.dropoff.list().catch((): any[] => []),
    refetchInterval: 15000,
  });

  const createDropoff = useMutation({
    mutationFn: () => logisticsApi.dropoff.create({ shipment_id: codigo, agencia_id: selectedAgencia }),
    onSuccess: (data) => {
      setShowResult({ success: true, message: 'Pacote recebido na agência!' });
      setCodigo('');
      queryClient.invalidateQueries({ queryKey: ['dropoffs'] });
    },
    onError: (err: any) => {
      setShowResult({ success: false, message: err.message });
    },
  });

  const rows = Array.isArray(dropoffs) ? dropoffs : [];
  const pendentes = rows.filter((r: any) => r.status === 'received');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!codigo.trim() || !selectedAgencia) return;
    createDropoff.mutate();
  }

  return (
    <div className="min-h-screen bg-[#0B1220] text-white pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-5 pb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Building size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold">Drop-off</h1>
            <p className="text-sm text-white/70">Recebimento de pacotes</p>
          </div>
        </div>
      </div>

      <div className="p-4 -mt-4">
        {/* Result notification */}
        {showResult && (
          <div className={`mb-4 p-4 rounded-xl flex items-start gap-3 ${
            showResult.success ? 'bg-green-500/15 border border-green-500/30' : 'bg-red-500/15 border border-red-500/30'
          }`}>
            {showResult.success ? <CheckCircle size={20} className="text-green-400 shrink-0 mt-0.5" /> : <X size={20} className="text-red-400 shrink-0 mt-0.5" />}
            <div className="flex-1">
              <p className="text-sm font-medium">{showResult.success ? '✅ Recebido!' : '❌ Erro'}</p>
              <p className="text-xs text-gray-400 mt-0.5">{showResult.message}</p>
            </div>
            <button onClick={() => setShowResult(null)}><X size={16} className="text-gray-500" /></button>
          </div>
        )}

        {/* Agency selector */}
        <div className="mb-4">
          <label className="text-xs text-gray-400 mb-1.5 block font-medium">AGÊNCIA DE DESTINO</label>
          <select value={selectedAgencia} onChange={e => setSelectedAgencia(e.target.value)}
            className="w-full h-12 bg-[#111827] border border-white/10 rounded-xl px-4 text-sm text-white outline-none focus:border-blue-500">
            <option value="">Selecione a agência...</option>
            {(agencias || []).map((a: any) => (
              <option key={a.id} value={a.id}>{a.nome} — {a.cidade}</option>
            ))}
          </select>
        </div>

        {/* Scanner / Code input */}
        <form onSubmit={handleSubmit} className="mb-6">
          <label className="text-xs text-gray-400 mb-1.5 block font-medium">CÓDIGO DO PACOTE</label>
          <div className="flex gap-2">
            <input type="text" value={codigo} onChange={e => setCodigo(e.target.value)}
              placeholder="Escaneie ou digite o código..."
              className="flex-1 h-12 bg-[#111827] border border-white/10 rounded-xl px-4 text-sm text-white outline-none focus:border-blue-500 font-mono"
              autoFocus />
            <button type="submit" disabled={!codigo.trim() || !selectedAgencia || createDropoff.isPending}
              className="h-12 px-6 bg-blue-500 rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center gap-2">
              {createDropoff.isPending ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /></>
              ) : 'Receber'}
            </button>
          </div>
        </form>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-[#111827] rounded-xl p-4 border border-white/5">
            <p className="text-2xl font-bold text-blue-400">{pendentes.length}</p>
            <p className="text-xs text-gray-400 mt-0.5">Aguardando coleta DAIG</p>
          </div>
          <div className="bg-[#111827] rounded-xl p-4 border border-white/5">
            <p className="text-2xl font-bold text-green-400">{rows.filter((r: any) => r.status === 'collected').length}</p>
            <p className="text-xs text-gray-400 mt-0.5">Já coletados</p>
          </div>
        </div>

        {/* Recent drop-offs */}
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Clock size={14} className="text-gray-400" /> Últimos recebimentos
        </h3>
        <div className="space-y-2">
          {rows.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">Nenhum pacote recebido ainda</p>
          ) : rows.slice(0, 10).map((d: any) => (
            <div key={d.id} className="bg-[#111827] rounded-xl p-3.5 border border-white/5 flex items-center justify-between">
              <div>
                <p className="text-sm font-mono font-medium">{d.shipment?.codigo || d.codigo_agencia || '—'}</p>
                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                  <Building size={10} /> {d.agencia?.nome || '—'}
                </p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                d.status === 'collected' ? 'bg-green-400/15 text-green-400' :
                d.status === 'received' ? 'bg-blue-400/15 text-blue-400' : 'bg-gray-400/15 text-gray-400'
              }`}>
                {d.status === 'collected' ? 'Coletado' : d.status === 'received' ? 'Na agência' : d.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
