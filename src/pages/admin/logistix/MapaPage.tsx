import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { logisticsApi } from '../../../lib/logisticsApi';
import { Circle } from 'lucide-react';

let L: any = null;

export default function MapaPage() {
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);

  const { data: motoristas } = useQuery({
    queryKey: ['admin', 'gps-motoristas'],
    queryFn: () => logisticsApi.tracking.gpsList(),
    refetchInterval: 15000,
  });

  const { data: armazens } = useQuery({
    queryKey: ['admin', 'armazens-mapa'],
    queryFn: async () => {
      const supabase = (await import('../../../lib/supabase')).supabase;
      const { data } = await supabase.from('admin_armazens').select('id,nome,cidade,latitude,longitude').not('latitude', 'is', null).limit(50);
      return data || [];
    },
  });

  useEffect(() => {
    if (map) return;
    (async () => {
      const leaflet = await import('leaflet');
      await import('leaflet/dist/leaflet.css');
      L = leaflet.default || leaflet;

      const m = L.map('mapa-container').setView([35.68, 139.65], 6);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
      }).addTo(m);
      setMap(m);
    })();
    return () => {
      if (L && map) { map.remove(); }
    };
  }, []);

  useEffect(() => {
    if (!map || !L) return;

    // Clear old markers
    markers.forEach((m: any) => m.remove());

    const novos: any[] = [];

    (armazens || []).forEach((a: any) => {
      if (a.latitude && a.longitude) {
        const m = L.marker([a.latitude, a.longitude], {
          icon: L.divIcon({
            className: '',
            html: '<div style="width:22px;height:22px;background:#8B5CF6;border:3px solid white;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:10px;font-weight:bold">CD</div>',
            iconSize: [22, 22], iconAnchor: [11, 11],
          }),
        }).addTo(map).bindPopup(`<b>${a.nome}</b><br/>${a.cidade}`);
        novos.push(m);
      }
    });

    const rows = Array.isArray(motoristas) ? motoristas : [];
    rows.forEach((m: any) => {
      if (m.latitude && m.longitude) {
        const color = m.transportadora?.includes('YAMATO') || m.transportadora?.includes('DAIG') ? '#3B82F6' : '#22C55E';
        const marker = L.circleMarker([m.latitude, m.longitude], {
          radius: 8, fillColor: color, color: 'white', weight: 2, fillOpacity: 1,
        }).addTo(map)
          .bindPopup(`<b>${m.nome}</b><br/>${m.transportadora || ''}<br/>🕐 ${m.ultima_atualizacao ? new Date(m.ultima_atualizacao).toLocaleTimeString('pt-BR') : '—'}`);
        novos.push(marker);
      }
    });

    setMarkers(novos);
  }, [map, motoristas, armazens]);

  const rows = Array.isArray(motoristas) ? motoristas : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Mapa Logístico</h2>
          <p className="text-sm text-gray-400 mt-1">{rows.length} motoristas ativos</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1"><Circle size={8} className="fill-blue-500 text-blue-500" /> Coletores</span>
          <span className="flex items-center gap-1"><Circle size={8} className="fill-green-500 text-green-500" /> Entregadores</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 bg-purple-500 rounded" /> CDs</span>
        </div>
      </div>

      <div className="bg-[#111827] rounded-xl overflow-hidden border border-white/5" style={{ height: '600px' }}>
        <div id="mapa-container" className="w-full h-full" />
      </div>

      {rows.length > 0 && (
        <div className="bg-[#111827] rounded-xl border border-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/5">
            <h3 className="text-sm font-semibold">Motoristas em campo</h3>
          </div>
          <div className="divide-y divide-white/5 max-h-60 overflow-y-auto">
            {rows.map((m: any) => (
              <div key={m.id} className="flex items-center justify-between p-3 px-4 hover:bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${m.transportadora?.includes('YAMATO') || m.transportadora?.includes('DAIG') ? 'bg-blue-500' : 'bg-green-500'}`} />
                  <div>
                    <p className="text-sm font-medium">{m.nome}</p>
                    <p className="text-[11px] text-gray-500">{m.transportadora || '—'}</p>
                  </div>
                </div>
                <div className="text-right text-xs text-gray-400">
                  {m.latitude && m.longitude ? (
                    <p>{m.latitude.toFixed(4)}, {m.longitude.toFixed(4)}</p>
                  ) : '—'}
                  {m.ultima_atualizacao && (
                    <p className="text-[10px] text-gray-500">{new Date(m.ultima_atualizacao).toLocaleTimeString('pt-BR')}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
