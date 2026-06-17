import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { logisticsApi } from '../../../lib/logisticsApi';
import { Search, Building, Package, CheckCircle, Clock, Truck } from 'lucide-react';

export default function DropoffPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterAgencia, setFilterAgencia] = useState('');

  const { data: dropoffs } = useQuery({
    queryKey: ['admin', 'dropoffs', filterAgencia],
    queryFn: () => logisticsApi.dropoff.list(filterAgencia || undefined),
    refetchInterval: 10000,
  });

  const { data: agencias } = useQuery({
    queryKey: ['admin', 'agencias'],
    queryFn: async () => {
      const supabase = (await import('../../../lib/supabase')).supabase;
      const { data } = await supabase.from('admin_armazens').select('id,nome,cidade').ilike('nome', 'Ag%').order('nome');
      return data || [];
    },
  });

  const collectMutation = useMutation({
    mutationFn: async (dropoffId: string) => {
      const supabase = (await import('../../../lib/supabase')).supabase;
      await supabase.from('admin_dropoffs').update({ status: 'collected' }).eq('id', dropoffId);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'dropoffs'] }),
  });

  const rows = Array.isArray(dropoffs) ? dropoffs : [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Drop-offs</h2>
          <p className="text-sm text-text-secondary mt-1">{rows.filter(r => r.status === 'received').length} aguardando coleta</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center bg-[#111827] rounded-lg h-10 px-3 border border-border flex-1">
          <Search size={18} className="text-text-secondary mr-2" />
          <input type="text" placeholder="Buscar por código..." value={search} onChange={e => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-text-muted" />
        </div>
        <select value={filterAgencia} onChange={e => setFilterAgencia(e.target.value)}
          className="h-10 bg-[#111827] border border-border rounded-lg px-3 text-sm text-white outline-none">
          <option value="">Todas agências</option>
          {(agencias || []).map((a: any) => (
            <option key={a.id} value={a.id}>{a.nome}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-3">
        {rows.filter(r => !search || r.shipment?.codigo?.includes(search)).map((d: any) => (
          <div key={d.id} className="bg-[#111827] rounded-xl p-4 border border-border">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Package size={16} className="text-blue-400" />
                  <span className="font-mono font-medium">{d.shipment?.codigo || d.codigo_agencia}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    d.status === 'collected' ? 'bg-green-400/15 text-green-400' :
                    d.status === 'received' ? 'bg-blue-400/15 text-blue-400' : 'bg-yellow-400/15 text-yellow-400'
                  }`}>
                    {d.status === 'collected' ? 'Coletado' : d.status === 'received' ? 'Na agência' : d.status}
                  </span>
                </div>
              </div>
              {d.status === 'received' && (
                <button onClick={() => collectMutation.mutate(d.id)}
                  className="h-8 px-3 bg-green-500/10 border border-green-500/30 rounded-lg text-xs font-medium text-green-400 flex items-center gap-1.5">
                  <Truck size={12} /> Coletar
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-text-secondary">
                <Building size={12} /> {d.agencia?.nome || '—'}
              </div>
              <div className="flex items-center gap-1.5 text-text-secondary">
                <Clock size={12} /> {new Date(d.created_at).toLocaleString('pt-BR')}
              </div>
              {d.recebido_por && (
                <div className="flex items-center gap-1.5 text-text-secondary">
                  <CheckCircle size={12} /> {d.recebido_por}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
