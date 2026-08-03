import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useI18n } from '@/modules/shared/lib/i18n'
import { 
  Sparkles, TrendingUp, ShieldCheck, Zap, ArrowUpRight, 
  Cpu, Layers, CheckCircle2, Award, Activity
} from 'lucide-react'

const REVENUE_DATA = [
  { month: 'Jan', sales: 450000 },
  { month: 'Fev', sales: 680000 },
  { month: 'Mar', sales: 920000 },
  { month: 'Abr', sales: 1150000 },
  { month: 'Mai', sales: 1480000 },
  { month: 'Jun', sales: 1850000 },
]

export default function HitechShowcase21st() {
  const { t } = useI18n()
  const [activeMetric, setActiveMetric] = useState<'sales' | 'inventory' | 'security'>('sales')

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0D75FF', '#00E5FF', '#38BDF8', '#ffffff']
    })
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 text-white font-sans">
      
      {/* 21st.dev Cyber Neon Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden bg-[#0A0D14]/90 border border-blue-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_40px_rgba(13,117,255,0.2)] backdrop-blur-2xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#0D75FF]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-mono text-cyan-400 bg-blue-500/10 border border-[#00E5FF]/30 mb-3 shadow-[0_0_15px_rgba(0,229,255,0.2)]">
              <Sparkles className="w-3.5 h-3.5 text-[#00E5FF] animate-pulse" />
              <span>21st.dev Hi-Tech Design System</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {t('Tecnologia & Desempenho em Tempo Real')}
            </h2>
            <p className="text-xs text-zinc-400 mt-1 max-w-lg leading-relaxed">
              {t('Interfaces com micro-animações dinâmicas, gráficos de alto desempenho e aceleradores visuais de ponta.')}
            </p>
          </div>

          <button
            type="button"
            onClick={triggerCelebration}
            className="self-start sm:self-center px-5 py-3 rounded-2xl bg-gradient-to-r from-[#0D75FF] via-blue-600 to-[#00E5FF] hover:opacity-95 text-white font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(13,117,255,0.4)] border border-[#00E5FF]/40 cursor-pointer active:scale-95 flex items-center space-x-2 shrink-0"
          >
            <Award className="w-4 h-4 text-white" />
            <span>{t('Celebrar Meta 🚀')}</span>
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center space-x-2 mt-8 pt-6 border-t border-zinc-800/80 overflow-x-auto">
          {[
            { id: 'sales', label: t('Faturamento (¥)'), icon: TrendingUp },
            { id: 'inventory', label: t('Métricas de Peças'), icon: Layers },
            { id: 'security', label: t('Segurança & Criptografia'), icon: ShieldCheck }
          ].map((tab) => {
            const Icon = tab.icon
            const isSel = activeMetric === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveMetric(tab.id as any)}
                className={`relative px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
                  isSel ? 'text-cyan-300' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {isSel && (
                  <motion.div
                    layoutId="activeTabGlow"
                    className="absolute inset-0 bg-[#0D75FF]/20 border border-[#00E5FF] rounded-xl shadow-[0_0_20px_rgba(13,117,255,0.3)]"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className={`w-4 h-4 relative z-10 ${isSel ? 'text-[#00E5FF]' : ''}`} />
                <span className="relative z-10">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* Dynamic Animated Content Panel */}
      <AnimatePresence mode="wait">
        {activeMetric === 'sales' && (
          <motion.div
            key="sales"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="bg-[#0B0E17]/90 border border-blue-500/30 rounded-3xl p-6 shadow-2xl backdrop-blur-xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-mono text-zinc-400">{t('Volume Acumulado em Vendas')}</p>
                <p className="text-3xl font-black text-white font-mono mt-1">
                  ¥ 1.850.000
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center space-x-1">
                <ArrowUpRight className="w-4 h-4" />
                <span>+ 38.5%</span>
              </span>
            </div>

            {/* Recharts Animated Area Chart */}
            <div className="h-56 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={REVENUE_DATA}>
                  <defs>
                    <linearGradient id="cyberGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0D75FF" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#52525b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#52525b" fontSize={11} tickLine={false} tickFormatter={(val) => `¥${(val / 1000)}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#06080F', borderColor: '#00E5FF', borderRadius: '12px', fontSize: '12px' }}
                    formatter={(val: any) => [`¥ ${Number(val).toLocaleString()}`, t('Vendas')]}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#00E5FF" strokeWidth={3} fillOpacity={1} fill="url(#cyberGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {activeMetric === 'inventory' && (
          <motion.div
            key="inventory"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {[
              { label: t('Peças Ativas no WMS'), val: '1.240', desc: t('Categorizadas por QR Code'), color: '#00E5FF' },
              { label: t('Tempo Médio de Envio'), val: '24h', desc: t('Despacho expresso no Japão'), color: '#0D75FF' },
              { label: t('Índice de Qualidade'), val: '99.8%', desc: t('Inspecionadas por IA'), color: '#10B981' }
            ].map((stat, i) => (
              <div key={i} className="bg-[#0B0E17]/90 border border-blue-500/30 rounded-2xl p-5 shadow-xl backdrop-blur-xl space-y-2">
                <p className="text-xs text-zinc-400">{stat.label}</p>
                <p className="text-2xl font-black text-white font-mono">{stat.val}</p>
                <p className="text-[11px] text-zinc-500">{stat.desc}</p>
              </div>
            ))}
          </motion.div>
        )}

        {activeMetric === 'security' && (
          <motion.div
            key="security"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="bg-[#0B0E17]/90 border border-blue-500/30 rounded-3xl p-6 shadow-2xl backdrop-blur-xl space-y-4"
          >
            <div className="flex items-center space-x-3 text-[#00E5FF]">
              <ShieldCheck className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">{t('Criptografia AES-256-GCM & MFA Guard')}</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {t('Proteção de dados financeiros com criptografia simétrica de chave de 256 bits via Web Crypto API nativa do navegador e verificação de dois fatores em dois canais independentes.')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-[#06080F] border border-zinc-800 flex items-center space-x-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-zinc-300">{t('PBKDF2 Key Derivation (100k iterações)')}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#06080F] border border-zinc-800 flex items-center space-x-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-zinc-300">{t('MFA Confiável com Cache Local')}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
