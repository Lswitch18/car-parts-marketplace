import React from 'react';
import { DollarSign, FileText, ArrowDownRight } from 'lucide-react';

export default function AccountsPayable() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-white">Contas a Pagar</h1>
          <p className="text-gray-400 mt-1">Gestão de despesas internas, salários e contas operacionais.</p>
        </div>
        <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          Nova Despesa
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-2">
            <ArrowDownRight className="w-5 h-5 text-red-400" />
            <h3 className="text-lg font-semibold text-white">A Vencer (Próx. 7 dias)</h3>
          </div>
          <p className="text-3xl font-bold text-white">¥ 250,000</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-semibold text-white">Pagamentos Pendentes</h3>
          </div>
          <p className="text-3xl font-bold text-white">12</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Despesas do Mês</h3>
          </div>
          <p className="text-3xl font-bold text-white">¥ 1,200,500</p>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Lançamentos Recentes</h2>
          <div className="text-gray-400 text-center py-12">
            Nenhuma despesa lançada ou a lista está sendo carregada...
          </div>
        </div>
      </div>
    </div>
  );
}
