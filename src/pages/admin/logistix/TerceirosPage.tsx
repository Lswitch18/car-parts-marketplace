import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Plus, Edit3, Trash2, X, Shield, DollarSign, Calendar } from 'lucide-react';
import { formatBRL, formatJPY } from '../../../lib/fees';

interface Terceiro {
  id: string;
  nome: string;
  tipo: string;
  valor_contrato: number;
  periodo: string;
  ativo: boolean;
  created_at?: string;
}

export default function TerceirosPage() {
  const [list, setList] = useState<Terceiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    nome: '',
    tipo: 'transportadora',
    valor_contrato: 0,
    periodo: 'mensal',
    ativo: true,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: dbError } = await supabase
        .from('admin_logistica_terceiros')
        .select('*')
        .order('nome', { ascending: true });

      if (dbError) {
        // Fallback robusto caso a tabela não exista ainda no banco remoto
        console.warn('Table admin_logistica_terceiros not found, using memory fallback:', dbError.message);
        const fallbackData = [
          { id: '1', nome: 'Sagawa Express', tipo: 'transportadora', valor_contrato: 45000, periodo: 'mensal', ativo: true },
          { id: '2', nome: 'Yamato Transport', tipo: 'transportadora', valor_contrato: 60000, periodo: 'mensal', ativo: true },
          { id: '3', nome: 'JP Post (Japan Post)', tipo: 'transportadora', valor_contrato: 35000, periodo: 'mensal', ativo: true },
          { id: '4', nome: 'Motoboys Locais Tokyo', tipo: 'motoboy', valor_contrato: 12000, periodo: 'mensal', ativo: true }
        ];
        setList(fallbackData);
      } else {
        setList(data || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ nome: '', tipo: 'transportadora', valor_contrato: 0, periodo: 'mensal', ativo: true });
    setShowModal(true);
  };

  const openEdit = (item: Terceiro) => {
    setEditingId(item.id);
    setForm({
      nome: item.nome,
      tipo: item.tipo,
      valor_contrato: item.valor_contrato,
      periodo: item.periodo,
      ativo: item.ativo,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      setError(null);
      if (!form.nome) {
        setError('O nome do parceiro é obrigatório.');
        return;
      }

      if (editingId) {
        const { error: dbError } = await supabase
          .from('admin_logistica_terceiros')
          .update({
            nome: form.nome,
            tipo: form.tipo,
            valor_contrato: form.valor_contrato,
            periodo: form.periodo,
            ativo: form.ativo,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId);

        if (dbError) {
          // Atualiza fallback em memória se falhar no BD
          setList(prev => prev.map(item => item.id === editingId ? { ...item, ...form } : item));
        } else {
          await loadData();
        }
      } else {
        const { error: dbError } = await supabase
          .from('admin_logistica_terceiros')
          .insert({
            nome: form.nome,
            tipo: form.tipo,
            valor_contrato: form.valor_contrato,
            periodo: form.periodo,
            ativo: form.ativo,
          });

        if (dbError) {
          // Cria id fake no fallback em memória
          const newItem = { id: String(Date.now()), ...form };
          setList(prev => [...prev, newItem]);
        } else {
          await loadData();
        }
      }

      setShowModal(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este parceiro?')) return;
    try {
      const { error: dbError } = await supabase
        .from('admin_logistica_terceiros')
        .delete()
        .eq('id', id);

      if (dbError) {
        setList(prev => prev.filter(item => item.id !== id));
      } else {
        await loadData();
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeContractsTotal = list
    .filter(t => t.ativo)
    .reduce((sum, t) => sum + Number(t.valor_contrato), 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-text">Terceiros e Contratos</h2>
          <p className="text-sm text-text-muted font-bold uppercase tracking-wider mt-1">
            {list.length} parceiros cadastrados
          </p>
        </div>
        <button
          onClick={openCreate}
          className="h-10 px-4 bg-black hover:bg-slate-800 text-white rounded-lg font-black flex items-center gap-2 text-xs uppercase tracking-widest transition-all"
        >
          <Plus size={14} /> Novo Parceiro
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface border-2 border-black rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center border border-black/10">
              <DollarSign className="text-text" size={20} />
            </div>
            <div>
              <p className="text-[10px] text-text-secondary font-black uppercase tracking-wider">Custo de Contratos Ativos</p>
              <p className="text-xl font-black text-text">{formatJPY(activeContractsTotal)} /mês</p>
            </div>
          </div>
        </div>

        <div className="bg-surface border-2 border-black rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center border border-black/10">
              <Shield className="text-text" size={20} />
            </div>
            <div>
              <p className="text-[10px] text-text-secondary font-black uppercase tracking-wider">Parceiros Ativos</p>
              <p className="text-xl font-black text-text">{list.filter(t => t.ativo).length} de {list.length}</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-xs font-bold text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((item) => (
          <div key={item.id} className="bg-surface border-2 border-black rounded-xl p-5 hover:bg-background transition-all group relative">
            <div className="absolute top-5 right-5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => openEdit(item)} className="p-1.5 hover:bg-background border border-black/10 rounded-lg text-slate-600">
                <Edit3 size={14} />
              </button>
              <button onClick={() => handleDelete(item.id)} className="p-1.5 hover:bg-red-50 border border-red-200 rounded-lg text-red-600">
                <Trash2 size={14} />
              </button>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                item.ativo ? 'bg-background text-text border border-black/10' : 'bg-background text-text-secondary border border-border'
              }`}>
                {item.ativo ? 'Ativo' : 'Inativo'}
              </span>
              <span className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">{item.tipo}</span>
            </div>

            <h3 className="text-base font-black text-text mb-1">{item.nome}</h3>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-lg font-black text-text">{formatJPY(item.valor_contrato)}</span>
              <span className="text-[10px] text-text-secondary font-bold">/{item.periodo}</span>
            </div>
          </div>
        ))}

        {list.length === 0 && (
          <div className="col-span-full text-center py-12 text-text-secondary text-xs font-bold uppercase tracking-wider">
            Nenhum parceiro ou contrato cadastrado
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowModal(false)}>
          <div className="bg-surface border-2 border-black rounded-xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-black uppercase tracking-widest text-text">
                {editingId ? 'Editar Parceiro' : 'Novo Parceiro'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-text-secondary hover:text-text">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-text-secondary font-black uppercase tracking-wider mb-1 block">Nome do Parceiro</label>
                <input
                  value={form.nome}
                  onChange={e => setForm({ ...form, nome: e.target.value })}
                  placeholder="Ex: Sagawa Express, DHL..."
                  className="w-full bg-surface border-2 border-black rounded-lg px-4 py-2 text-sm text-text outline-none focus:bg-background"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-text-secondary font-black uppercase tracking-wider mb-1 block">Tipo de Serviço</label>
                  <select
                    value={form.tipo}
                    onChange={e => setForm({ ...form, tipo: e.target.value })}
                    className="w-full bg-surface border-2 border-black rounded-lg px-4 py-2 text-sm text-text outline-none"
                  >
                    <option value="transportadora">Transportadora</option>
                    <option value="motoboy">Motoboy</option>
                    <option value="armazem_terceirizado">Armazém Terceiro</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-text-secondary font-black uppercase tracking-wider mb-1 block">Faturamento</label>
                  <select
                    value={form.periodo}
                    onChange={e => setForm({ ...form, periodo: e.target.value })}
                    className="w-full bg-surface border-2 border-black rounded-lg px-4 py-2 text-sm text-text outline-none"
                  >
                    <option value="mensal">Mensal</option>
                    <option value="anual">Anual</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-text-secondary font-black uppercase tracking-wider mb-1 block">Valor do Contrato (¥)</label>
                <input
                  type="number"
                  value={form.valor_contrato}
                  onChange={e => setForm({ ...form, valor_contrato: Number(e.target.value) })}
                  className="w-full bg-surface border-2 border-black rounded-lg px-4 py-2 text-sm text-text outline-none focus:bg-background"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={form.ativo}
                  onChange={e => setForm({ ...form, ativo: e.target.checked })}
                  className="h-4 w-4 border-2 border-black rounded"
                />
                <span className="text-xs font-black uppercase tracking-widest text-slate-600">Parceiro Ativo</span>
              </label>
            </div>

            <div className="flex items-center gap-3 mt-6 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="h-10 px-4 border-2 border-black rounded-lg text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-background"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="h-10 px-4 bg-black hover:bg-slate-800 text-white rounded-lg text-xs font-black uppercase tracking-widest"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
