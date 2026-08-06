import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Package, Warehouse, Users, X, Loader2, ArrowRight } from 'lucide-react';
import { adminApi } from '@/modules/transactions/api/adminApi';

interface SearchResult {
  id: string;
  label: string;
  description: string;
  type: 'pedido' | 'cliente' | 'armazem' | 'usuario';
  icon: any;
  color: string;
  navId: string;
}

const TYPE_LABELS: Record<string, string> = {
  pedido: 'Pedido',
  cliente: 'Cliente',
  armazem: 'Armazém',
  usuario: 'Usuário',
};

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
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

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
            color: '#0D75FF',
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
            color: '#7000FF',
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
            color: '#00E5FF',
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
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 transition-all"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />

      {/* Search modal */}
      <div className="fixed top-[12%] left-1/2 -translate-x-1/2 w-full max-w-xl z-50 px-4">
        <div
          className="rounded-2xl overflow-hidden shadow-2xl"
          style={{
            background: 'rgba(10,10,15,0.98)',
            border: '1px solid rgba(13,117,255,0.2)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 32px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(13,117,255,0.1)',
          }}
        >
          {/* Input row */}
          <div
            className="flex items-center gap-3 px-4 h-14"
            style={{ borderBottom: results.length > 0 || query.length >= 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
          >
            <Search size={18} style={{ color: '#0D75FF', flexShrink: 0 }} />
            <input
              ref={inputRef}
              type="text"
              placeholder="Buscar pedidos, clientes, armazéns..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-transparent border-none outline-none text-sm text-white w-full"
              style={{ caretColor: '#0D75FF' }}
            />
            {loading ? (
              <Loader2 size={16} className="animate-spin flex-shrink-0" style={{ color: '#0D75FF' }} />
            ) : query ? (
              <button
                onClick={() => setQuery('')}
                className="p-1.5 rounded-lg transition-colors hover:bg-white/5 flex-shrink-0"
                style={{ color: '#6B7280' }}
              >
                <X size={14} />
              </button>
            ) : null}
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="max-h-72 overflow-y-auto p-2">
              {results.map((r, i) => (
                <button
                  key={`${r.type}-${r.id}`}
                  onClick={() => { onNavigate(r.navId); onClose(); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                  style={
                    i === selectedIndex
                      ? {
                          background: `${r.color}12`,
                          border: `1px solid ${r.color}25`,
                        }
                      : {
                          border: '1px solid transparent',
                        }
                  }
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${r.color}15`, border: `1px solid ${r.color}20` }}
                  >
                    <r.icon size={15} style={{ color: r.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{r.label}</p>
                    <p className="text-[11px] mt-0.5 truncate" style={{ color: '#6B7280' }}>{r.description}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${r.color}15`, color: r.color }}
                    >
                      {TYPE_LABELS[r.type] || r.type}
                    </span>
                    {i === selectedIndex && (
                      <ArrowRight size={12} style={{ color: r.color }} />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No results */}
          {query.length >= 2 && !loading && results.length === 0 && (
            <div className="py-10 text-center">
              <p className="text-sm font-medium text-white mb-1">Nenhum resultado</p>
              <p className="text-xs" style={{ color: '#6B7280' }}>para "{query}"</p>
            </div>
          )}

          {/* Hint before typing */}
          {query.length < 2 && (
            <div className="py-5 text-center">
              <p className="text-xs" style={{ color: '#4B5563' }}>
                Digite pelo menos 2 caracteres para buscar
              </p>
            </div>
          )}

          {/* Keyboard shortcuts bar */}
          <div
            className="flex items-center justify-between px-4 h-9"
            style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.3)' }}
          >
            {[
              { key: '↵', label: 'selecionar' },
              { key: '↑↓', label: 'navegar' },
              { key: 'ESC', label: 'fechar' },
            ].map(({ key, label }) => (
              <span key={key} className="flex items-center gap-1.5 text-[10px]" style={{ color: '#4B5563' }}>
                <kbd
                  className="px-1.5 py-0.5 rounded text-[9px] font-bold"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#9CA3AF' }}
                >
                  {key}
                </kbd>
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
