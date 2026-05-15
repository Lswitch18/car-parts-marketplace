import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Package, Warehouse, Users, X, Loader2 } from 'lucide-react';
import { adminApi } from '../../lib/adminApi';

interface SearchResult {
  id: string;
  label: string;
  description: string;
  type: 'pedido' | 'cliente' | 'armazem' | 'usuario';
  icon: any;
  color: string;
  navId: string;
}

export default function GlobalSearch({
  open,
  onClose,
  onNavigate,
}: {
  open: boolean;
  onClose: () => void;
  onNavigate: (id: string, params?: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

  const doSearch = useCallback(async (q: string) => {
    if (!q || q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const all: SearchResult[] = [];

    try {
      const [pedidos, clientes, armazens] = await Promise.all([
        adminApi.dashboard.pedidosRecentes().catch((): any[] => []),
        adminApi.clientes.list().catch((): any[] => []),
        adminApi.armazens.list().catch((): any[] => []),
      ]);

      const lower = q.toLowerCase();

      (pedidos || []).forEach((p: any) => {
        if (p.codigo?.toLowerCase().includes(lower) || p.cliente?.toLowerCase().includes(lower)) {
          all.push({
            id: p.id || p.codigo,
            label: p.codigo || '',
            description: `${p.cliente || ''} · ${p.status || ''}`,
            type: 'pedido',
            icon: Package,
            color: '#3B82F6',
            navId: 'pedidos',
          });
        }
      });

      (clientes || []).forEach((c: any) => {
        if (c.nome?.toLowerCase().includes(lower) || c.email?.toLowerCase().includes(lower) || c.cnpj?.includes(lower)) {
          all.push({
            id: c.id,
            label: c.nome || '',
            description: `${c.email || ''} · ${c.cidade || ''}`,
            type: 'cliente',
            icon: Users,
            color: '#8B5CF6',
            navId: 'clientes',
          });
        }
      });

      (armazens || []).forEach((a: any) => {
        if (a.nome?.toLowerCase().includes(lower) || a.cidade?.toLowerCase().includes(lower)) {
          all.push({
            id: a.id,
            label: a.nome || '',
            description: `${a.cidade || ''} · ${a.estado || ''}`,
            type: 'armazem',
            icon: Warehouse,
            color: '#22C55E',
            navId: 'armazens',
          });
        }
      });
    } catch {}

    setResults(all.slice(0, 10));
    setSelectedIndex(0);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => doSearch(query), 250);
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [query, doSearch]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      onNavigate(results[selectedIndex].navId);
      onClose();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-lg z-50 mx-4">
        <div className="bg-[#1a1a2e] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-4 h-14 border-b border-white/5">
            <Search size={18} className="text-gray-500 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Buscar pedidos, clientes, armazéns..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-gray-600"
            />
            {loading && <Loader2 size={16} className="text-gray-500 animate-spin" />}
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          {results.length > 0 && (
            <div className="max-h-72 overflow-y-auto p-2">
              {results.map((r, i) => (
                <button
                  key={`${r.type}-${r.id}`}
                  onClick={() => { onNavigate(r.navId); onClose(); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                    i === selectedIndex ? 'bg-blue-500/10 border border-blue-500/20' : 'hover:bg-white/5'
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${r.color}18` }}
                  >
                    <r.icon size={15} style={{ color: r.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{r.label}</p>
                    <p className="text-[11px] text-gray-500 truncate">{r.description}</p>
                  </div>
                  <span
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: `${r.color}18`, color: r.color }}
                  >
                    {r.type}
                  </span>
                </button>
              ))}
            </div>
          )}

          {query.length >= 2 && !loading && results.length === 0 && (
            <div className="py-8 text-center text-sm text-gray-500">
              Nenhum resultado para "{query}"
            </div>
          )}

          {query.length < 2 && (
            <div className="py-6 text-center text-[11px] text-gray-600">
              Digite pelo menos 2 caracteres para buscar
            </div>
          )}

          <div className="flex items-center justify-between px-4 h-10 bg-black/20 text-[10px] text-gray-600">
            <span>↵ para selecionar</span>
            <span>↑↓ para navegar</span>
            <span>ESC para fechar</span>
          </div>
        </div>
      </div>
    </>
  );
}
