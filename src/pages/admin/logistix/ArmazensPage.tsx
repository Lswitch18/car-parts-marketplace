import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../../lib/adminApi';
import { Plus, Edit3, Trash2, X, Warehouse, MapPin, MapIcon } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const DEFAULT_ICON = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

export default function ArmazensPage() {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<'cards' | 'map'>('cards');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ nome: '', cidade: '', estado: '', pais: 'JP', endereco: '', telefone: '', email: '', latitude: 35.6762, longitude: 139.6503, capacidade: 0, ocupacao: 0, ativo: true });

  const { data: armazens, isLoading } = useQuery({
    queryKey: ['admin', 'armazens-list'],
    queryFn: () => adminApi.armazens.list(),
  });

  const createMutation = useMutation({
    mutationFn: () => adminApi.armazens.create(form),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'armazens-list'] }); closeModal(); },
  });

  const updateMutation = useMutation({
    mutationFn: () => { if (!editingId) throw new Error('No id'); return adminApi.armazens.update(editingId, form); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'armazens-list'] }); closeModal(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.armazens.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'armazens-list'] }),
  });

  function openCreate() {
    setEditingId(null);
    setForm({ nome: '', cidade: '', estado: '', pais: 'JP', endereco: '', telefone: '', email: '', latitude: 35.6762, longitude: 139.6503, capacidade: 0, ocupacao: 0, ativo: true });
    setShowModal(true);
  }

  function openEdit(row: any) {
    setEditingId(row.id);
    setForm({
      nome: row.nome || '', cidade: row.cidade || '', estado: row.estado || '', pais: row.pais || 'JP',
      endereco: row.endereco || '', telefone: row.telefone || '', email: row.email || '',
      latitude: row.latitude || 35.6762, longitude: row.longitude || 139.6503,
      capacidade: row.capacidade || 0, ocupacao: row.ocupacao || 0, ativo: row.ativo !== false,
    });
    setShowModal(true);
  }

  function closeModal() { setShowModal(false); setEditingId(null); }

  function handleSave() { if (editingId) updateMutation.mutate(); else createMutation.mutate(); }

  function calcPct(a: any) {
    if (!a.capacidade || a.capacidade === 0) return 0;
    return Math.round(((a.ocupacao || 0) / a.capacidade) * 100);
  }

  const list = Array.isArray(armazens) ? armazens : [];

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Centros de Distribuição</h2><p className="text-sm text-gray-400 mt-1">{(list || []).length} centros</p></div>
        <div className="flex items-center gap-2">
          <button onClick={() => setViewMode(viewMode === 'cards' ? 'map' : 'cards')}
            className="h-10 px-3 bg-[#111827] border border-white/5 rounded-lg text-gray-400 hover:text-white flex items-center gap-2 text-sm">
            <MapIcon size={16} /> {viewMode === 'cards' ? 'Mapa' : 'Cards'}
          </button>
          <button onClick={openCreate} className="h-10 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2 text-sm"><Plus size={16} /> Novo Armazém</button>
        </div>
      </div>

      {viewMode === 'map' ? (
        <div className="bg-[#111827] rounded-xl border border-white/5 overflow-hidden h-[500px]">
          <MapContainer center={[35.0, 136.0]} zoom={6} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
            {list.filter(a => a.latitude && a.longitude).map(a => (
              <Marker key={a.id} position={[a.latitude, a.longitude]} icon={DEFAULT_ICON}>
                <Popup>
                  <div className="text-black">
                    <p className="font-bold text-sm">{a.nome}</p>
                    <p className="text-xs text-gray-600">{a.cidade}, {a.estado}</p>
                    <p className="text-xs text-gray-600">{a.endereco || ''}</p>
                    <p className="text-xs text-gray-600">Ocupação: {calcPct(a)}%</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">Nenhum armazém cadastrado</div>
          ) : list.map((a: any) => {
            const pct = calcPct(a);
            return (
              <div key={a.id} className="bg-[#111827] rounded-xl border border-white/5 p-5 hover:border-blue-500/30 transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Warehouse size={20} className="text-blue-400" />
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(a)} className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-blue-400"><Edit3 size={14} /></button>
                    <button onClick={() => deleteMutation.mutate(a.id)} className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-red-400"><Trash2 size={14} /></button>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{a.nome}</h3>
                <p className="text-sm text-gray-400 flex items-center gap-1"><MapPin size={12} />{a.cidade}{a.estado ? ` - ${a.estado}` : ''}</p>
                {a.endereco && <p className="text-xs text-gray-500 mt-1">{a.endereco}</p>}
                {a.telefone && <p className="text-xs text-gray-500">{a.telefone}</p>}
                {a.email && <p className="text-xs text-gray-500">{a.email}</p>}
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Ocupação</span>
                    <span className="font-medium" style={{ color: pct > 80 ? '#EF4444' : pct > 60 ? '#FACC15' : '#22C55E' }}>{pct}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{
                      width: `${Math.min(pct, 100)}%`,
                      background: pct > 80 ? '#EF4444' : pct > 60 ? '#FACC15' : '#22C55E',
                    }} />
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>{a.ocupacao || 0} unidades</span>
                  <span>Capacidade: {a.capacidade || 0}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={closeModal}>
          <div className="bg-[#1F2937] rounded-xl p-6 w-full max-w-lg mx-4 border border-white/10 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">{editingId ? 'Editar Armazém' : 'Novo Armazém'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div><label className="text-sm text-gray-400 mb-1 block">Nome</label>
                <input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm text-gray-400 mb-1 block">Cidade</label>
                  <input value={form.cidade} onChange={e => setForm({ ...form, cidade: e.target.value })} className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500" /></div>
                <div><label className="text-sm text-gray-400 mb-1 block">Estado</label>
                  <input value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })} className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500" /></div>
              </div>
              <div><label className="text-sm text-gray-400 mb-1 block">País</label>
                <select value={form.pais} onChange={e => setForm({ ...form, pais: e.target.value })} className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500">
                  <option value="JP">Japão</option>
                  <option value="BR">Brasil</option>
                </select>
              </div>
              <div><label className="text-sm text-gray-400 mb-1 block">Endereço</label>
                <input value={form.endereco} onChange={e => setForm({ ...form, endereco: e.target.value })} className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm text-gray-400 mb-1 block">Telefone</label>
                  <input value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500" /></div>
                <div><label className="text-sm text-gray-400 mb-1 block">Email</label>
                  <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm text-gray-400 mb-1 block">Latitude</label>
                  <input type="number" step="any" value={form.latitude} onChange={e => setForm({ ...form, latitude: Number(e.target.value) })} className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500" /></div>
                <div><label className="text-sm text-gray-400 mb-1 block">Longitude</label>
                  <input type="number" step="any" value={form.longitude} onChange={e => setForm({ ...form, longitude: Number(e.target.value) })} className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm text-gray-400 mb-1 block">Capacidade</label>
                  <input type="number" value={form.capacidade} onChange={e => setForm({ ...form, capacidade: Number(e.target.value) })} className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500" /></div>
                <div><label className="text-sm text-gray-400 mb-1 block">Ocupação Atual</label>
                  <input type="number" value={form.ocupacao} onChange={e => setForm({ ...form, ocupacao: Number(e.target.value) })} className="w-full bg-[#111827] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500" /></div>
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.ativo} onChange={e => setForm({ ...form, ativo: e.target.checked })} className="h-4 w-4 rounded border-white/20 bg-[#111827]" />
                <span className="text-sm text-gray-400">Ativo</span>
              </label>
            </div>
            <div className="flex items-center gap-3 mt-6 justify-end">
              <button onClick={closeModal} className="h-10 px-4 border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white">Cancelar</button>
              <button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}
                className="h-10 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                {editingId ? 'Atualizar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
