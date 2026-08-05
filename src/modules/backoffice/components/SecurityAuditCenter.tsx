import React, { useState } from 'react'
import { 
  ShieldCheck, ShieldAlert, Key, Lock, Eye, AlertTriangle, 
  CheckCircle2, RefreshCw, Server, Terminal, Shield, FileCheck
} from 'lucide-react'
import { useI18n } from '@/modules/shared/lib/i18n'

interface AuditLogEvent {
  id: string
  timestamp: string
  actor: string
  action: string
  resource: string
  ip: string
  status: 'allowed' | 'blocked' | 'warning'
}

const DEMO_AUDIT_LOGS: AuditLogEvent[] = [
  {
    id: 'log-101',
    timestamp: '2026-08-05 16:15:22',
    actor: 'teste.partner@daig.jp',
    action: 'SELECT public.parts',
    resource: 'tenant_id=12c738e6 (RLS OK)',
    ip: '187.122.45.10 (Brasil)',
    status: 'allowed'
  },
  {
    id: 'log-102',
    timestamp: '2026-08-05 16:10:04',
    actor: 'wellynton.lead@daig.jp',
    action: 'EXPORT acuerdo_socios_pdf',
    resource: 'IP Assignment 50% Co-Ownership',
    ip: '201.88.14.99 (Brasil)',
    status: 'allowed'
  },
  {
    id: 'log-103',
    timestamp: '2026-08-05 15:44:11',
    actor: 'guest_unauth_bot',
    action: 'POST /rest/v1/work_orders',
    resource: 'tentativa de bypass RLS',
    ip: '192.241.200.12 (USA)',
    status: 'blocked'
  },
  {
    id: 'log-104',
    timestamp: '2026-08-05 14:02:50',
    actor: 'patrick.ceo@daig.jp',
    action: 'UPDATE bank_accounts',
    resource: 'Zengin Bank JP (Koshonin Verified)',
    ip: '126.208.19.44 (Tóquio, JP)',
    status: 'allowed'
  }
]

export default function SecurityAuditCenter() {
  const { t } = useI18n()
  const [logs, setLogs] = useState<AuditLogEvent[]>(DEMO_AUDIT_LOGS)
  const [filterStatus, setFilterStatus] = useState<'all' | 'allowed' | 'blocked'>('all')

  const filteredLogs = logs.filter(l => {
    if (filterStatus === 'all') return true
    return l.status === filterStatus
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header da Central de Segurança */}
      <div className="bg-gradient-to-r from-[#0C101A] via-[#0A192F] to-[#0C101A] border border-cyan-500/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(0,229,255,0.12)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 p-0.5 shadow-lg shrink-0">
            <div className="w-full h-full bg-[#06080F] rounded-[14px] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white">{t('Central de Segurança & Auditoria Shift-Left')}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                100% SECURE
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              {t('Inspeção em tempo real de acessos RLS, logs de auditoria, proteção contra SQLi/XSS e auditoria de IP.')}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-blue-500/10 text-cyan-300 border border-blue-500/30 flex items-center space-x-1.5">
            <Server className="w-4 h-4 text-cyan-400" />
            <span>Supabase RLS: Estrito</span>
          </span>
        </div>
      </div>

      {/* CARDS DE HEALTH STATUS DE SEGURANÇA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        <div className="bg-[#121215] border border-zinc-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Proteção de Banco RLS</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-lg font-bold text-white">48 Tabelas Isoladas</p>
          <p className="text-[11px] text-zinc-500">Filtradas por tenant_id = auth.uid()</p>
        </div>

        <div className="bg-[#121215] border border-zinc-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Criptografia Financeira</span>
            <Lock className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-lg font-bold text-white">AES-256-GCM Nativo</p>
          <p className="text-[11px] text-zinc-500">Dados Zengin Bank & Stripe cifrados</p>
        </div>

        <div className="bg-[#121215] border border-zinc-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Tentativas Bloqueadas</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-lg font-bold text-amber-300">0 Vulnerabilidades SAST</p>
          <p className="text-[11px] text-zinc-500">OWASP Top 10 Sanitizado</p>
        </div>

      </div>

      {/* LOGS DE AUDITORIA EM TEMPO REAL */}
      <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
          <div className="flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-white text-sm">Log de Auditoria & Eventos de Segurança (Real-Time)</h3>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-lg transition ${filterStatus === 'all' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400 hover:text-white'}`}
            >
              Todos ({logs.length})
            </button>
            <button
              onClick={() => setFilterStatus('allowed')}
              className={`px-3 py-1 rounded-lg transition ${filterStatus === 'allowed' ? 'bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20' : 'text-zinc-400 hover:text-white'}`}
            >
              Permitidos
            </button>
            <button
              onClick={() => setFilterStatus('blocked')}
              className={`px-3 py-1 rounded-lg transition ${filterStatus === 'blocked' ? 'bg-red-500/10 text-red-400 font-bold border border-red-500/20' : 'text-zinc-400 hover:text-white'}`}
            >
              Bloqueados
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Ator / Usuário</th>
                <th className="py-2.5 px-3">Ação Executada</th>
                <th className="py-2.5 px-3">Recurso / Escopo</th>
                <th className="py-2.5 px-3">Origem (IP)</th>
                <th className="py-2.5 px-3 text-right">Resultado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-zinc-900/60 transition">
                  <td className="py-3 px-3 text-zinc-400">{log.timestamp}</td>
                  <td className="py-3 px-3 font-bold text-white">{log.actor}</td>
                  <td className="py-3 px-3 text-cyan-300">{log.action}</td>
                  <td className="py-3 px-3 text-zinc-400 truncate max-w-xs">{log.resource}</td>
                  <td className="py-3 px-3 text-zinc-400">{log.ip}</td>
                  <td className="py-3 px-3 text-right">
                    {log.status === 'allowed' && (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        OK 200
                      </span>
                    )}
                    {log.status === 'blocked' && (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-red-500/10 text-red-400 border border-red-500/20">
                        BLOQUEADO RLS
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
