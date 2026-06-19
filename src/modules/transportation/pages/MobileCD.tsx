import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mobileApi } from '@/modules/transportation/api/mobileApi';
import { Warehouse, Search, Package, ChevronRight } from 'lucide-react';

export default function MobileCD() {
  const [selectedArmazem, setSelectedArmazem] = useState<string | null>(null);
  const [searchProd, setSearchProd] = useState('');

  const { data: armazens } = useQuery({
    queryKey: ['mobile', 'armazens'],
    queryFn: () => mobileApi.armazens.list(),
  });

  const { data: estoque, isLoading: loadingEstoque } = useQuery({
    queryKey: ['mobile', 'estoque', selectedArmazem],
    queryFn: () => mobileApi.estoque.list(selectedArmazem || undefined),
    enabled: !!selectedArmazem,
  });

  const armazensArr = Array.isArray(armazens) ? armazens : [];
  const estoqueArr = Array.isArray(estoque) ? estoque : [];
  const filtered = searchProd
    ? estoqueArr.filter((i: any) => i.produto?.toLowerCase().includes(searchProd.toLowerCase()) || i.sku?.toLowerCase().includes(searchProd.toLowerCase()))
    : estoqueArr;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Centro de Distribuição</h1>

      {!selectedArmazem ? (
        <div className="grid grid-cols-1 gap-3">
          {armazensArr.map((a: any) => {
            const pct = a.capacidade > 0 ? Math.round(a.ocupacao * 100 / a.capacidade) : 0;
            const cor = pct > 80 ? '#EF4444' : pct > 60 ? '#FACC15' : '#22C55E';
            return (
              <div key={a.id} onClick={() => setSelectedArmazem(a.id)}
                className="bg-[#111827] rounded-xl p-4 border border-white/5 active:scale-[0.98] transition-transform cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Warehouse size={16} className="text-blue-400" />
                    <span className="font-semibold text-sm">{a.nome}</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-600" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-[#1F2937] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: cor }} />
                  </div>
                  <span className="text-xs font-medium" style={{ color: cor }}>{pct}%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1.5">{a.cidade}, {a.estado}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <div>
          <button onClick={() => setSelectedArmazem(null)}
            className="text-sm text-blue-400 mb-3 flex items-center gap-1">
            ← Voltar para lista
          </button>

          <div className="flex items-center bg-[#111827] rounded-lg h-9 px-3 border border-white/5 mb-3">
            <Search size={15} className="text-gray-400 mr-2" />
            <input type="text" placeholder="Buscar produto ou SKU..." value={searchProd}
              onChange={e => setSearchProd(e.target.value)}
              className="bg-transparent border-none outline-none text-white text-xs w-full placeholder:text-gray-500" />
          </div>

          {loadingEstoque ? (
            <div className="flex items-center justify-center h-32"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <Package size={36} className="mx-auto text-gray-600 mb-2" />
              <p className="text-gray-500 text-sm">Nenhum item no estoque</p>
            </div>
          ) : filtered.map((item: any) => (
            <div key={item.id} className="bg-[#111827] rounded-xl p-3.5 border border-white/5 mb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.produto}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5 font-mono">{item.sku || 'SEM SKU'}</p>
                </div>
                <div className="text-right ml-3">
                  <p className="text-lg font-bold">{item.quantidade}</p>
                  <p className="text-[10px] text-gray-500">unidades</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
