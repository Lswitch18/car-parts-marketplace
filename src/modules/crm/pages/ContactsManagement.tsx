import React from 'react';
import { Users, Building2, Phone } from 'lucide-react';

export default function ContactsManagement() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-white">Contatos (CRM)</h1>
          <p className="text-gray-400 mt-1">Gestão de clientes corporativos, fornecedores e parceiros logísticos.</p>
        </div>
        <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          Novo Contato
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Fornecedores</h3>
          </div>
          <p className="text-3xl font-bold text-white">124</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Clientes B2B</h3>
          </div>
          <p className="text-3xl font-bold text-white">89</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-2">
            <Phone className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Parceiros de Transporte</h3>
          </div>
          <p className="text-3xl font-bold text-white">42</p>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Lista de Contatos</h2>
          <div className="text-gray-400 text-center py-12">
            Nenhum contato cadastrado ou a lista está sendo carregada...
          </div>
        </div>
      </div>
    </div>
  );
}
