import React from 'react'
import { FileText, ShieldCheck, CheckCircle } from 'lucide-react'

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#07070A] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="text-center space-y-3 border-b border-white/10 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <FileText className="w-4 h-4" /> 利用規約 (Terms of Service)
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Termos de Uso e Serviço (Terms of Service)
          </h1>
          <p className="text-gray-400 text-sm max-w-2xl mx-auto">
            Regras de utilização da plataforma Digital AI Garage (DAIG), leilões de autopeças JDM e garantias do sistema Escrow de compra e venda.
          </p>
        </div>

        <div className="bg-[#0D0D14] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 text-gray-300 text-sm leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-400" /> 1. Aceitação dos Termos
            </h2>
            <p>
              Ao utilizar os serviços da plataforma Digital AI Garage (DAIG), você concorda integralmente com estes Termos de Serviço e com a nossa Política de Privacidade.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" /> 2. Sistema de Custódia e Pagamentos (Escrow)
            </h2>
            <p>
              Todos os pagamentos realizados via Cartão de Crédito ou Konbini (Loja de Conveniência no Japão) ficam retidos com segurança em nosso sistema de custódia (Escrow) até que o comprador receba o produto e confirme a conformidade da peça automotiva.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-400" /> 3. Responsabilidade dos Vendedores
            </h2>
            <p>
              Vendedores são responsáveis pela veracidade das especificações técnicas, compatibilidade de chassi/OEM e fotos enviadas. Peças adulteradas ou divergentes resultarão em estorno integral ao comprador e suspensão da conta.
            </p>
          </section>
        </div>

        <div className="text-center text-xs text-gray-500 pt-4">
          © 2026 Digital AI Garage - DAIG (PATRICK HIKARUFORBECI SUZUKI). Todos os direitos reservados.
        </div>

      </div>
    </div>
  )
}
