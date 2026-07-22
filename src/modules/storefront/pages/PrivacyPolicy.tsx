import React from 'react'
import { Lock, ShieldCheck, UserCheck } from 'lucide-react'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#07070A] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="text-center space-y-3 border-b border-white/10 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <Lock className="w-4 h-4" /> プライバシーポリシー (Privacy Policy)
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Política de Privacidade (Privacy Policy)
          </h1>
          <p className="text-gray-400 text-sm max-w-2xl mx-auto">
            Como a Digital AI Garage (DAIG) protege, utiliza e armazena os dados dos usuários e compradores em conformidade com as leis de proteção de dados no Japão.
          </p>
        </div>

        <div className="bg-[#0D0D14] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 text-gray-300 text-sm leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-400" /> 1. Coleta e Uso de Informações
            </h2>
            <p>
              Coletamos informações estritamente necessárias para a prestação dos serviços de marketplace, emissão de comprovantes Konbini, cálculo de fretes e garantia de segurança nos pagamentos.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-400" /> 2. Proteção e Segurança de Dados
            </h2>
            <p>
              Todos os dados trafegados utilizam criptografia SSL/TLS de ponta a ponta. Dados bancários e cartões são processados de forma 100% segura e tokenizada através da infraestrutura PCI-DSS Compliance da Stripe.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-400" /> 3. Compartilhamento Restrito
            </h2>
            <p>
              Não vendemos nem compartilhamos dados pessoais com terceiros para fins de marketing. Dados de envio (endereço e telefone) são compartilhados exclusivamente com os operadores logísticos parceiros para a entrega física das peças.
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
