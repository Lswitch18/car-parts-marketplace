import React from 'react'
import { useI18n } from '@/modules/shared/lib/i18n'
import { FileText, ShieldCheck, CheckCircle, Lock, Server, Landmark, ExternalLink } from 'lucide-react'

export default function TermsOfService() {
  const { t } = useI18n()

  return (
    <div className="min-h-screen bg-[#05070C] text-white py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Title Banner */}
        <div className="text-center space-y-3 border-b border-blue-500/20 pb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-[#00E5FF]/30 text-cyan-400 text-xs font-mono uppercase tracking-wider">
            <FileText className="w-4 h-4 text-[#00E5FF]" /> {t('Termos de Serviço e Processamento de Dados')}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            {t('Termos de Uso, Tecnologia & Liquidação Financeira')}
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            {t('Regras oficiais de utilização da plataforma Digital A.I. Garage (DAIG Technology), processamento de dados de transações web e política de conciliação bancária no Japão.')}
          </p>
        </div>

        {/* Main Content Box */}
        <div className="bg-[#0B0E17]/90 border border-blue-500/30 rounded-2xl p-6 sm:p-8 space-y-7 text-zinc-300 text-sm leading-relaxed shadow-2xl backdrop-blur-xl">
          
          {/* Section 1 */}
          <section className="space-y-2.5">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-2">
              <CheckCircle className="w-5 h-5 text-[#00E5FF]" /> 1. {t('Aceitação dos Termos e Escopo de Tecnologia')}
            </h2>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {t('A DAIG Digital A.I. Garage é a empresa fornecedora de tecnologia e infraestrutura digital da plataforma. Ao acessar, cadastrar-se ou utilizar qualquer funcionalidade, você declara concordância integral com estes Termos de Serviço e autoriza o processamento de dados necessários para viabilizar as transações comercializadas na plataforma.')}
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-2.5">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-2">
              <Server className="w-5 h-5 text-[#00E5FF]" /> 2. {t('Coleta e Tratamento de Dados de Transações Web')}
            </h2>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {t('Para garantir a segurança das vendas, emissão de comprovantes, conciliação e proteção antifraude, coletamos e armazenamos dados essenciais da transação web sob rígidos protocolos de segurança digital. Os dados não serão comercializados com terceiros não autorizados.')}
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-2.5">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-2">
              <Landmark className="w-5 h-5 text-[#00E5FF]" /> 3. {t('Custódia, Liquidação Financeira e Transferências Bancárias')}
            </h2>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {t('Os valores arrecadados nas vendas são mantidos sob custódia de segurança (Escrow) e repassados para a conta corrente ou empresarial cadastrada pelo vendedor no Japão. As transferências e validações bancárias são executadas em parceria com provedores globais de liquidação sob criptografia avançada.')}
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-2.5">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-2">
              <Lock className="w-5 h-5 text-[#00E5FF]" /> 4. {t('Segurança da Informação e Criptografia Bancária')}
            </h2>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {t('Todas as informações bancárias (código de agência, número de conta e titularidade em Katakana ou Alfabeto) são criptografadas na origem com padrões internacionais de proteção financeira, assegurando a integridade e privacidade do titular.')}
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-2.5">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-2">
              <ShieldCheck className="w-5 h-5 text-[#00E5FF]" /> 5. {t('Responsabilidade dos Vendedores')}
            </h2>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {t('Os vendedores garantem a veracidade das informações cadastradas e a procedência das peças anunciadas. Informações inverídicas ou adulteradas poderão acarretar o bloqueio temporário ou definitivo da conta e suspensão dos repasses pendentes.')}
            </p>
          </section>

        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-zinc-500 pt-4">
          © 2026 Digital A.I. Garage - DAIG Technology. {t('Todos os direitos reservados.')}
        </div>

      </div>
    </div>
  )
}
