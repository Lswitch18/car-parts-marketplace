import { useQuery } from '@tanstack/react-query';
import { logisticsApi } from '../../../lib/logisticsApi';
import { useI18n } from '../../../lib/i18n';
import { Truck, MapPin, Compass, Clock, CheckCircle, Navigation } from 'lucide-react';

export default function MapaPage() {
  const { t } = useI18n();

  const { data: motoristas, isLoading } = useQuery({
    queryKey: ['admin', 'gps-motoristas'],
    queryFn: () => logisticsApi.tracking.gpsList(),
    refetchInterval: 10000, // Fetch every 10 seconds for real-time status updates
  });

  const rows = Array.isArray(motoristas) ? motoristas : [];
  const activeCount = rows.length;

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full" />
          <span className="text-xs font-black uppercase tracking-wider text-slate-500">{t('Carregando posições...')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-black font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-black/15 pb-6">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-slate-500">{t('Despacho de frotas')}</span>
          <h2 className="text-3xl font-black uppercase tracking-tight text-black mt-1">
            {t('Último Status de Motoristas')}
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            {t('Posição em tempo real de motoristas e transportadoras ativas no sistema WMS Japão.')}
          </p>
        </div>
        <div className="bg-black text-white px-4 py-2 border-2 border-black rounded-lg text-xs font-black uppercase tracking-wider">
          {activeCount} {t('Motoristas Ativos')}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border-2 border-black rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">{t('Status Geral')}</span>
            <CheckCircle size={16} className="text-green-600" />
          </div>
          <p className="text-2xl font-black text-black">{t('Operação Ativa')}</p>
          <span className="text-[10px] font-bold text-slate-500 uppercase">{t('Sincronização GPS Ligada')}</span>
        </div>

        <div className="bg-white border-2 border-black rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">{t('Fila de Envio')}</span>
            <Truck size={16} className="text-black" />
          </div>
          <p className="text-2xl font-black text-black">{activeCount} {t('Viagens')}</p>
          <span className="text-[10px] font-bold text-slate-500 uppercase">{t('Monitorados no momento')}</span>
        </div>

        <div className="bg-white border-2 border-black rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">{t('Último Sinal')}</span>
            <Clock size={16} className="text-black" />
          </div>
          <p className="text-2xl font-black text-black">
            {rows.length > 0 && rows[0].ultima_atualizacao
              ? new Date(rows[0].ultima_atualizacao).toLocaleTimeString('pt-BR')
              : '—'}
          </p>
          <span className="text-[10px] font-bold text-slate-500 uppercase">{t('Atualização Mais Recente')}</span>
        </div>
      </div>

      {/* Main List Container */}
      <div className="bg-white border-2 border-black rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b-2 border-black flex justify-between items-center">
          <h3 className="text-sm font-black uppercase tracking-wider text-black">{t('Lista de Despachos Ativos')}</h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('Atualiza em 10s')}</span>
        </div>

        {rows.length === 0 ? (
          <div className="p-10 text-center text-slate-500 font-bold bg-white">
            <Navigation className="mx-auto text-slate-300 mb-2 rotate-45" size={32} />
            <p className="text-sm">{t('Nenhum sinal de GPS ativo foi recebido recentemente.')}</p>
          </div>
        ) : (
          <div className="divide-y divide-black/10">
            {rows.map((m: any) => {
              const isYamatoOrDaig = m.transportadora?.toUpperCase().includes('YAMATO') || m.transportadora?.toUpperCase().includes('DAIG');
              return (
                <div key={m.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 px-6 gap-4 hover:bg-slate-50 transition-all">
                  
                  {/* Left Side: Driver and Carrier Info */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-full border-2 border-black bg-slate-100 flex items-center justify-center shrink-0">
                      <Truck size={18} className="text-black" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-black text-black truncate">{m.nome}</p>
                        <span className={`inline-block w-2 h-2 rounded-full ${isYamatoOrDaig ? 'bg-blue-500' : 'bg-green-500'}`} />
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                        {m.transportadora || t('Transportadora Local')}
                      </p>
                    </div>
                  </div>

                  {/* Right Side: Coordinates and signal time */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-black/5 pt-3 sm:pt-0">
                    
                    {/* Location coordinates */}
                    <div className="text-left sm:text-right">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block leading-none mb-1">
                        {t('Última Coordenada')}
                      </span>
                      {m.latitude && m.longitude ? (
                        <span className="text-xs font-black text-black font-mono bg-slate-100 px-2 py-1 rounded border border-black/5 flex items-center gap-1">
                          <MapPin size={10} className="text-slate-500" />
                          {m.latitude.toFixed(6)}°, {m.longitude.toFixed(6)}°
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-slate-400">—</span>
                      )}
                    </div>

                    {/* Clock / Signal time */}
                    <div className="text-right">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block leading-none mb-1">
                        {t('Último Sinal')}
                      </span>
                      {m.ultima_atualizacao ? (
                        <span className="text-xs font-bold text-slate-600 flex items-center gap-1 justify-end">
                          <Clock size={10} />
                          {new Date(m.ultima_atualizacao).toLocaleTimeString('pt-BR')}
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-slate-400">—</span>
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
