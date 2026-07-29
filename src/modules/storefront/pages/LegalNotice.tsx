import React from 'react'
import { ShieldCheck, Mail, Phone, MapPin, Globe, Clock, CreditCard, Truck, RefreshCw, UserCheck } from 'lucide-react'

export default function LegalNotice() {
  return (
    <div className="min-h-screen bg-[#07070A] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3 border-b border-white/10 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" /> 特定商取引法に基づく表記 (Specified Commercial Transactions Act Notice)
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Informações Legais & Transações Comerciais (SCT)
          </h1>
          <p className="text-gray-400 text-sm max-w-2xl mx-auto">
            Informações regulatórias de conformidade com a Lei de Transações Comerciais Especificadas do Japão para suporte a pagamentos via Konbini e Cartão de Crédito.
          </p>
        </div>

        {/* Tabela de Conformidade SCT */}
        <div className="bg-[#0D0D14] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl backdrop-blur-md">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-4">
            <Globe className="w-5 h-5 text-blue-400" /> 特定商取引法に基づく表示 (Dados Oficiais do Operador)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Nome da Empresa / Nome Fantasia</span>
              <p className="text-white font-semibold text-base">Digital AI Garage - DAIG (https://daig.jp)</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Representante Legal / Titular Declarado</span>
              <p className="text-white font-semibold text-base flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                Sr. ALDAIR JOSE PINTO
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Declaração de Endereço Residencial do Representante</span>
              <p className="text-white font-medium flex items-center gap-1.5 text-xs">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                Rua Ismair Eufrasio de Siqueira, nº 11, Bairro Xaxim, CEP 81810-532
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">E-mail de Suporte / お問い合わせ先</span>
              <p className="text-white font-medium flex items-center gap-1.5 text-blue-400">
                <Mail className="w-4 h-4 shrink-0" />
                contact@daig.jp
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Telefone de Suporte / 電話番号</span>
              <p className="text-white font-medium flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                03-1234-5678 (+81 3 1234 5678)
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Horário de Atendimento / 受付時間</span>
              <p className="text-white font-medium flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                10:00 - 17:00 (Segunda a Sexta-feira - JST)
              </p>
            </div>
          </div>
        </div>

        {/* Detalhes de Pagamentos e Prazos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="bg-[#0D0D14] border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-400" /> Métodos de Pagamento e Prazos
            </h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-400">Cartão de Crédito:</span>
                <span className="font-semibold text-white">Débito e Aprovação Imediata</span>
              </li>
              <li className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-400">Konbini (Conveniente):</span>
                <span className="font-semibold text-white">Até 3 dias corridos pós-emissão</span>
              </li>
              <li className="flex justify-between pb-1">
                <span className="text-gray-400">Moeda de Cobrança:</span>
                <span className="font-semibold text-emerald-400">Iene Japonês (JPY / ¥)</span>
              </li>
            </ul>
          </div>

          <div className="bg-[#0D0D14] border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-400" /> Entrega e Frete (引渡し時期)
            </h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-400">Postagem:</span>
                <span className="font-semibold text-white">1 a 3 dias úteis pós-confirmação</span>
              </li>
              <li className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-400">Operadores Logísticos:</span>
                <span className="font-semibold text-white">Yamato Transport, Sagawa, Japan Post</span>
              </li>
              <li className="flex justify-between pb-1">
                <span className="text-gray-400">Garantia em Custódia:</span>
                <span className="font-semibold text-blue-400">Retenção Escrow DAIG</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Políticas de Troca e Cancelamento */}
        <div className="bg-[#0D0D14] border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-amber-400" /> Cancelamento e Devolução (返品・キャンセル)
          </h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            Em conformidade com a legislação comercial do Japão, pedidos cancelados por iniciativa do comprador antes do envio terão restituição integral. Em caso de item com defeito de fabricação não especificado no anúncio, a contestação poderá ser aberta em até 7 dias corridos após a entrega para mediação e reembolso seguro via sistema Escrow da plataforma.
          </p>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-gray-500 pt-4">
          © 2026 Digital AI Garage - DAIG (PATRICK HIKARUFORBECI SUZUKI). All rights reserved. 特定商取引法に基づく表記.
        </div>

      </div>
    </div>
  )
}
