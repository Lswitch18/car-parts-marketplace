import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { logisticsApi } from '../../../lib/logisticsApi';
import { useI18n } from '../../../lib/i18n';
import { Truck, MapPin, Compass, Clock, CheckCircle, Navigation, Radio } from 'lucide-react';

export default function MapaPage() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [selectedSimDriver, setSelectedSimDriver] = useState('');

  const { data: motoristas, isLoading } = useQuery({
    queryKey: ['admin', 'gps-motoristas'],
    queryFn: () => logisticsApi.tracking.gpsList(),
    refetchInterval: 10000,
  });

  const { data: drivers } = useQuery({
    queryKey: ['admin', 'drivers-map'],
    queryFn: async () => {
      const supabase = (await import('../../../lib/supabase')).supabase;
      const { data } = await supabase.from('profiles').select('id, full_name, email').order('full_name');
      return data || [];
    }
  });

  const simGpsMutation = useMutation({
    mutationFn: async () => {
      if (!selectedSimDriver) return;
      const lat = 35.6762 + (Math.random() - 0.5) * 0.1;
      const lng = 139.6503 + (Math.random() - 0.5) * 0.1;
      await logisticsApi.tracking.gps(selectedSimDriver, lat, lng, 10, 50);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'gps-motoristas'] });
      alert('Sinal de GPS simulado enviado com sucesso!');
    }
  });

  const rows = Array.isArray(motoristas) ? motoristas : [];
  const activeCount = rows.length;

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full" />
          <span className="text-xs font-black uppercase tracking-wider text-text-muted">{t('Carregando posições...')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-text font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-text-muted">{t('Despacho de frotas')}</span>
          <h2 className="text-3xl font-black uppercase tracking-tight text-text mt-1">
            {t('Torre de Controle (GPS Logístico)')}
          </h2>
          <p className="text-text-muted text-sm mt-0.5">
            {t('Posição em tempo real de motoristas e transportadoras ativas no sistema WMS Japão.')}
          </p>
        </div>
        <div className="bg-primary text-black px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider">
          {activeCount} {t('Motoristas Ativos')}
        </div>
      </div>

      {/* Simulador de Telemetria GPS */}
      <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-text flex items-center gap-2">
          <Radio size={16} className="text-primary-light animate-pulse" /> Simular Transmissor GPS do Entregador (Last-Mile Telemetry)
        </h3>
        <div className="flex flex-col md:flex-row items-end gap-4">
          <div className="flex-1 w-full">
            <label className="text-xs text-text-secondary mb-1 block">Selecionar Entregador / Motorista</label>
            <select
              value={selectedSimDriver}
              onChange={e => setSelectedSimDriver(e.target.value)}
              className="w-full h-10 bg-background border border-border rounded-lg px-3 text-sm text-white outline-none"
            >
              <option value="">Selecione...</option>
              {(drivers || []).map((d: any) => (
                <option key={d.id} value={d.id}>{d.full_name || d.email}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => simGpsMutation.mutate()}
            disabled={!selectedSimDriver || simGpsMutation.isPending}
            className="h-10 px-5 bg-primary hover:bg-primary-dark text-black rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-xs w-full md:w-auto flex items-center justify-center gap-2"
          >
            {simGpsMutation.isPending ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <><Compass size={14} /> Transmitir Coordenadas (Tóquio)</>}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface border-2 border-black rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase tracking-widest text-text-secondary">{t('Status Geral')}</span>
            <CheckCircle size={16} className="text-green-600" />
          </div>
          <p className="text-2xl font-black text-text">{t('Operação Ativa')}</p>
          <span className="text-[10px] font-bold text-text-muted uppercase">{t('Sincronização GPS Ligada')}</span>
        </div>

        <div className="bg-surface border-2 border-black rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase tracking-widest text-text-secondary">{t('Fila de Envio')}</span>
            <Truck size={16} className="text-text" />
          </div>
          <p className="text-2xl font-black text-text">{activeCount} {t('Viagens')}</p>
          <span className="text-[10px] font-bold text-text-muted uppercase">{t('Monitorados no momento')}</span>
        </div>

        <div className="bg-surface border-2 border-black rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase tracking-widest text-text-secondary">{t('Último Sinal')}</span>
            <Clock size={16} className="text-text" />
          </div>
          <p className="text-2xl font-black text-text">
            {rows.length > 0 && rows[0].ultima_atualizacao
              ? new Date(rows[0].ultima_atualizacao).toLocaleTimeString('pt-BR')
              : '—'}
          </p>
          <span className="text-[10px] font-bold text-text-muted uppercase">{t('Atualização Mais Recente')}</span>
        </div>
      </div>

      {/* Main List Container */}
      <div className="bg-surface border-2 border-black rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 bg-background border-b-2 border-black flex justify-between items-center">
          <h3 className="text-sm font-black uppercase tracking-wider text-text">{t('Lista de Despachos Ativos')}</h3>
          <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">{t('Atualiza em 10s')}</span>
        </div>

        {rows.length === 0 ? (
          <div className="p-10 text-center text-text-muted font-bold bg-surface">
            <Navigation className="mx-auto text-slate-300 mb-2 rotate-45" size={32} />
            <p className="text-sm">{t('Nenhum sinal de GPS ativo foi recebido recentemente.')}</p>
          </div>
        ) : (
          <div className="divide-y divide-black/10">
            {rows.map((m: any) => {
              const isYamatoOrDaig = m.transportadora?.toUpperCase().includes('YAMATO') || m.transportadora?.toUpperCase().includes('DAIG');
              return (
                <div key={m.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 px-6 gap-4 hover:bg-background transition-all">
                  
                  {/* Left Side: Driver and Carrier Info */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-full border-2 border-black bg-background flex items-center justify-center shrink-0">
                      <Truck size={18} className="text-text" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-black text-text truncate">{m.nome}</p>
                        <span className={`inline-block w-2 h-2 rounded-full ${isYamatoOrDaig ? 'bg-primary' : 'bg-green-500'}`} />
                      </div>
                      <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mt-0.5">
                        {m.transportadora || t('Transportadora Local')}
                      </p>
                    </div>
                  </div>

                  {/* Right Side: Coordinates and signal time */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-black/5 pt-3 sm:pt-0">
                    
                    {/* Location coordinates */}
                    <div className="text-left sm:text-right">
                      <span className="text-[9px] font-black uppercase tracking-wider text-text-secondary block leading-none mb-1">
                        {t('Última Coordenada')}
                      </span>
                      {m.latitude && m.longitude ? (
                        <span className="text-xs font-black text-text font-mono bg-background px-2 py-1 rounded border border-black/5 flex items-center gap-1">
                          <MapPin size={10} className="text-text-muted" />
                          {m.latitude.toFixed(6)}°, {m.longitude.toFixed(6)}°
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-text-secondary">—</span>
                      )}
                    </div>

                    {/* Clock / Signal time */}
                    <div className="text-right">
                      <span className="text-[9px] font-black uppercase tracking-wider text-text-secondary block leading-none mb-1">
                        {t('Último Sinal')}
                      </span>
                      {m.ultima_atualizacao ? (
                        <span className="text-xs font-bold text-slate-600 flex items-center gap-1 justify-end">
                          <Clock size={10} />
                          {new Date(m.ultima_atualizacao).toLocaleTimeString('pt-BR')}
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-text-secondary">—</span>
                      )}
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
