import React, { useState } from 'react'
import { 
  ShieldCheck, FileText, Download, UserCheck, Scale, 
  Building2, CheckCircle2, Sparkles, AlertCircle, Copy, ExternalLink, Globe
} from 'lucide-react'
import { useI18n } from '@/modules/shared/lib/i18n'

export default function LegalFinanceCenter() {
  const { t } = useI18n()

  const [selectedAgent, setSelectedAgent] = useState<'wellynton' | 'patrick'>('wellynton')
  const [generatingDoc, setGeneratingDoc] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const handleDownloadPdf = (docType: string) => {
    setGeneratingDoc(docType)
    setTimeout(() => {
      setGeneratingDoc(null)
      // Redireciona ou abre o arquivo gerado
      window.open('/documentos_juridicos/Acordo_de_Socios_DAIG_Auto_Parts_90_10.pdf', '_blank')
    }, 600)
  }

  const handleCopy = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(keyName)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header do Módulo Legal & Financeiro */}
      <div className="bg-gradient-to-r from-[#0B0E17] via-[#0A192F] to-[#0B0E17] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_40px_rgba(0,229,255,0.15)] text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0D75FF] to-[#00E5FF] p-0.5 shadow-lg shrink-0">
              <div className="w-full h-full bg-[#06080F] rounded-[14px] flex items-center justify-center">
                <Scale className="w-6 h-6 text-[#00E5FF]" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black text-white">{t('Gestão Jurídica, Societária & Fiscal (DAIG)')}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  90% / 10% SOCIEDADE
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                {t('Agentes jurídicos autônomos dedicados para acompanhamento contratual no Brasil e no Japão.')}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-zinc-900/90 p-1.5 rounded-2xl border border-zinc-800 shrink-0">
            <button
              onClick={() => setSelectedAgent('wellynton')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
                selectedAgent === 'wellynton'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>🇧🇷 Agente Wellynton (10%)</span>
            </button>

            <button
              onClick={() => setSelectedAgent('patrick')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
                selectedAgent === 'patrick'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>🇯🇵 Agente Patrick (90%)</span>
            </button>
          </div>
        </div>
      </div>

      {/* PAINEL DO AGENTE DA BRASIL (WELLYNTON SANTOS JERONIMO) */}
      {selectedAgent === 'wellynton' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Card de Identificação Societária */}
          <div className="bg-[#0B0E17] border border-blue-500/30 rounded-2xl p-6 space-y-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">Sócio Desenvolvedor (Brasil 🇧🇷)</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-300 border border-blue-500/30">
                10% Cotas
              </span>
            </div>

            <div>
              <h3 className="text-lg font-black text-white">Wellynton Santos Jeronimo</h3>
              <p className="text-xs text-zinc-400">Lead Software Engineer & Co-fundador Técnico</p>
            </div>

            <div className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800 text-xs font-mono space-y-1 text-zinc-300">
              <p><span className="text-zinc-500">Foro de Validade:</span> São Paulo, SP (Brasil)</p>
              <p><span className="text-zinc-500">Propriedade Intelectual:</span> Cessão Total à DAIG</p>
              <p><span className="text-zinc-500">Status Cartório:</span> Pronto p/ Firma Reconhecida</p>
            </div>

            <button
              onClick={() => handleDownloadPdf('acordo-socios')}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{generatingDoc ? t('Gerando PDF...') : t('Baixar Acordo de Sócios PDF')}</span>
            </button>
          </div>

          {/* Gerador de Certidões & Termos do Brasil */}
          <div className="lg:col-span-2 bg-[#0B0E17] border border-zinc-800 rounded-2xl p-6 space-y-5 shadow-lg">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              {t('Documentos & Certidões do Sócio Desenvolvedor (Brasil)')}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Doc 1: Acordo de Sócios 90/10 */}
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">Acordo de Sócios & Governança</span>
                  <span className="text-[10px] font-mono text-emerald-400">PDF Oficial</span>
                </div>
                <p className="text-[11px] text-zinc-400">Regula a divisão de 90/10, poder de decisão do majoritário e distribuição de dividendos.</p>
                <button
                  onClick={() => handleDownloadPdf('acordo-socios')}
                  className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-cyan-300 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Gerar PDF p/ Cartório</span>
                </button>
              </div>

              {/* Doc 2: Cessão Irrevogável de IP */}
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">Termo de Cessão de IP</span>
                  <span className="text-[10px] font-mono text-cyan-400">Código-Fonte</span>
                </div>
                <p className="text-[11px] text-zinc-400">Garante a transferência exclusiva de todo o código e modelos de IA para a DAIG.</p>
                <button
                  onClick={() => handleDownloadPdf('cessao-ip')}
                  className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-cyan-300 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Gerar Certidão de IP</span>
                </button>
              </div>

            </div>

            <div className="p-4 bg-blue-950/20 border border-blue-500/30 rounded-xl flex items-start space-x-3 text-xs text-blue-200">
              <UserCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Instrução de Assinatura no Brasil 🇧🇷:</p>
                <p className="text-[11px] text-zinc-300 mt-0.5">
                  Imprima 2 vias do PDF gerado, assine presencialmente e solicite o <strong>Reconhecimento de Firma por Autenticidade</strong> em qualquer Tabelionato de Notas do Brasil.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* PAINEL DO AGENTE DO JAPÃO (PATRICK SUZUKI) */}
      {selectedAgent === 'patrick' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Card de Identificação Societária Japão */}
          <div className="bg-[#0B0E17] border border-purple-500/30 rounded-2xl p-6 space-y-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">Sócio Majoritário & CEO (Japão 🇯🇵)</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/30">
                90% Cotas
              </span>
            </div>

            <div>
              <h3 className="text-lg font-black text-white">Patrick Suzuki</h3>
              <p className="text-xs text-zinc-400">Chief Executive Officer & Fundador</p>
            </div>

            <div className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800 text-xs font-mono space-y-1 text-zinc-300">
              <p><span className="text-zinc-500">Foro Notarial:</span> Tóquio, Japão (公証人役場)</p>
              <p><span className="text-zinc-500">Licença Kobutsu:</span> 東京都公安委員会 登録</p>
              <p><span className="text-zinc-500">Invoice System:</span> Número T+13 Dígitos</p>
            </div>

            <button
              onClick={() => handleDownloadPdf('acordo-socios')}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{generatingDoc ? t('Gerando PDF...') : t('Baixar Acordo de Governança PDF')}</span>
            </button>
          </div>

          {/* Compliance Tributário & Notarização no Japão */}
          <div className="lg:col-span-2 bg-[#0B0E17] border border-zinc-800 rounded-2xl p-6 space-y-5 shadow-lg">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-purple-400" />
              {t('Documentos de Compliance & Notarização no Japão (JCT 10% & Apostille)')}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Doc 1: Fatura Qualificada Invoice System */}
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">Invoice System (インボイス制度)</span>
                  <span className="text-[10px] font-mono text-purple-300">JCT 10%</span>
                </div>
                <p className="text-[11px] text-zinc-400">Modelo de nota fiscal com discriminação de imposto de consumo e número de registro T.</p>
                <button
                  onClick={() => handleDownloadPdf('invoice-jct')}
                  className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-purple-300 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Gerar Modelo JCT 10%</span>
                </button>
              </div>

              {/* Doc 2: Apostila da Haia */}
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">Instrução de Apostilamento MOFA</span>
                  <span className="text-[10px] font-mono text-emerald-400">Apostille</span>
                </div>
                <p className="text-[11px] text-zinc-400">Guia de validação no notário de Tóquio (公証人役場) e Ministério dos Negócios Estrangeiros.</p>
                <button
                  onClick={() => handleDownloadPdf('guia-apostille')}
                  className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-emerald-300 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Gerar Guia de Apostila</span>
                </button>
              </div>

            </div>

            <div className="p-4 bg-purple-950/20 border border-purple-500/30 rounded-xl flex items-start space-x-3 text-xs text-purple-200">
              <Building2 className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Instrução de Notarização no Japão 🇯🇵:</p>
                <p className="text-[11px] text-zinc-300 mt-0.5">
                  Imprima o PDF, assine no Japão e apresente ao Notário Oficial (公証人役場 - Koshonin Yakuba) solicitando o carimbo de autenticidade (*Inkan Koshō*) e Apostila da Convenção da Haia (*Apostille*).
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  )
}
