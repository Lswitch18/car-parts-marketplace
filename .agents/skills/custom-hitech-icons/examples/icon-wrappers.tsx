import React from 'react'
import { Sparkles, ShieldCheck, Zap, Lock, Package, Building2, Wrench, Car, Store, Globe, EyeOff, Key } from 'lucide-react'

// ── 1. Icon Container Wrapper Hi-Tech ────────────────────────
export function HitechIconBox({
  children,
  colorVariant = 'blue',
  size = 'md',
  hoverEffect = true,
}: {
  children: React.ReactNode
  colorVariant?: 'blue' | 'cyan' | 'purple' | 'emerald' | 'amber' | 'red'
  size?: 'sm' | 'md' | 'lg'
  hoverEffect?: boolean
}) {
  const colorStyles = {
    blue: 'bg-[#0D75FF]/10 border-[#0D75FF]/30 text-[#0D75FF] shadow-[0_0_20px_rgba(13,117,255,0.2)]',
    cyan: 'bg-[#00E5FF]/10 border-[#00E5FF]/30 text-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.2)]',
    purple: 'bg-purple-500/10 border-purple-500/30 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.2)]',
    emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]',
    amber: 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]',
    red: 'bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]',
  }

  const sizeStyles = {
    sm: 'p-2 rounded-xl text-xs',
    md: 'p-3 rounded-2xl text-sm',
    lg: 'p-4 rounded-3xl text-base',
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center border backdrop-blur-xl transition-all duration-300 ${
        colorStyles[colorVariant]
      } ${sizeStyles[size]} ${
        hoverEffect ? 'hover:scale-110 hover:border-cyan-300/60' : ''
      }`}
    >
      {children}
    </div>
  )
}

// ── 2. Layered Dual Icon (Ícone Composto com Badge) ───────────
export function LayeredIcon({
  mainIcon: MainIcon,
  badgeIcon: BadgeIcon,
  color = 'cyan',
}: {
  mainIcon: any
  badgeIcon: any
  color?: 'cyan' | 'amber' | 'emerald' | 'purple'
}) {
  return (
    <div className="relative inline-block">
      <HitechIconBox colorVariant={color} size="md">
        <MainIcon className="w-6 h-6" />
      </HitechIconBox>
      <div className="absolute -top-1 -right-1 p-1 bg-zinc-950 rounded-full border border-cyan-400/40 text-cyan-300 shadow-[0_0_10px_rgba(0,229,255,0.5)]">
        <BadgeIcon className="w-3.5 h-3.5 animate-pulse" />
      </div>
    </div>
  )
}

// ── 3. Exemplos Prontos de Ícones Temáticos ───────────────────
export const AiServiceIcon = () => <LayeredIcon mainIcon={Wrench} badgeIcon={Sparkles} color="cyan" />
export const SecurePaymentIcon = () => <LayeredIcon mainIcon={ShieldCheck} badgeIcon={Lock} color="emerald" />
export const FastShippingIcon = () => <LayeredIcon mainIcon={Car} badgeIcon={Zap} color="amber" />
export const PrivateStockIcon = () => <LayeredIcon mainIcon={Package} badgeIcon={Key} color="purple" />
