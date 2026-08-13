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
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Vendedor / Empresa (販売事業者名)</span>
              <p className="text-white font-semibold text-base">Patrick Suzuki (Digital AI Garage - DAIG)</p>
              <p className="text-xs text-gray-400 font-mono">https://daig.jp</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Gerente de Vendas / Representante (運営統括責任者)</span>
              <p className="text-white font-semibold text-base flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                Patrick Suzuki (パトリック・スズキ)
              </p>
            </div>

            <div className="space-y-1 col-span-1 md:col-span-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Endereço Comercial Registrado (所在地)</span>
              <p className="text-white font-medium flex items-center gap-1.5 text-xs">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                Aichi-ken, Inuyama-shi (愛知県犬山市 / Inuyama City, Aichi Prefecture, Japan)
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">E-mail de Contato (お問い合わせ先メールアドレス)</span>
              <p className="text-white font-medium flex items-center gap-1.5 text-blue-400">
                <Mail className="w-4 h-4 shrink-0" />
                patrick.suzuki@daig.jp / support@daig.jp
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Telefone de Suporte / 電話番号</span>
              <p className="text-white font-medium flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                +81 50-1234-5678 (Suporte ao Cliente Japão)
              </p>
            </div>

            <div className="space-y-1 col-span-1 md:col-span-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Preço de Promoção / Preço do Produto (販売価格)</span>
              <p className="text-white font-medium text-xs">
                Exibido individualmente em cada página de detalhes de produto (ou na tela de seleção de pagamento no momento da compra). Todos os preços em JPY (¥).
              </p>
            </div>

            <div className="space-y-1 col-span-1 md:col-span-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Taxas Adicionais (商品代金以外の必要料金)</span>
              <p className="text-white font-medium text-xs leading-relaxed">
                1. <strong>Imposto de Consumo (JCT 10%)</strong>: Incluso ou discriminado na página do produto.<br/>
                2. <strong>Taxa de Envio / Frete (送料)</strong>: Calculada e exibida individualmente na tela de compra de acordo com a província do comprador no Japão (Yamato Transport / Sagawa Express / Japan Post).
              </p>
            </div>
          </div>
        </div>

        {/* Detalhes de Pagamentos e Prazos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="bg-[#0D0D14] border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-400" /> Métodos e Prazos de Pagamento (支払時期・方法)
            </h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-400">Cartão de Crédito:</span>
                <span className="font-semibold text-white">Débito imediato no pedido</span>
              </li>
              <li className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-400">Konbini (Conveniente):</span>
                <span className="font-semibold text-white">Prazo de 3 dias corridos (Max ¥300.000)</span>
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
                <span className="text-gray-400">Prazo de Envio:</span>
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
            Em conformidade com a legislação comercial do Japão (特定商取引法), pedidos cancelados por iniciativa do comprador antes do envio terão restituição integral. Em caso de item com defeito de fabricação não especificado no anúncio, a contestação poderá ser aberta em até 7 dias corridos após a entrega para mediação e reembolso seguro via sistema Escrow da plataforma.
          </p>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-gray-500 pt-4">
          © 2026 Digital AI Garage - DAIG (PATRICK SUZUKI). All rights reserved. 特定商取引法に基づく表記.
        </div>

      </div>
    </div>
  )
}
