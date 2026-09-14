import React from 'react'
import { Store, Bot, Sparkles, MessageCircle, Languages, CreditCard, ShieldCheck, Building2, Boxes, Landmark, FileCheck, Search } from 'lucide-react'
import { DAIG_TOKENS } from '@/modules/shared/lib/designTokens'

type IconSpec = {
  icon: React.ElementType
  badge?: React.ElementType
  color: string
  bg: string
  border: string
  glow: string
}

const HITECH_MAP: Record<string, IconSpec> = {
  Store: { icon: Store, badge: Search, color: DAIG_TOKENS.colors.cyan, bg: 'rgba(0,229,255,0.09)', border: 'rgba(0,229,255,0.22)', glow: '0 0 20px rgba(0,229,255,0.22)' },
  Bot: { icon: Bot, badge: Sparkles, color: '#7C3AED', bg: 'rgba(124,58,237,0.09)', border: 'rgba(124,58,237,0.22)', glow: '0 0 20px rgba(124,58,237,0.22)' },
  MessageCircle: { icon: MessageCircle, badge: Languages, color: '#00D97E', bg: 'rgba(0,217,126,0.09)', border: 'rgba(0,217,126,0.18)', glow: '0 0 20px rgba(0,217,126,0.18)' },
  CreditCard: { icon: CreditCard, badge: ShieldCheck, color: '#FF6B35', bg: 'rgba(255,107,53,0.09)', border: 'rgba(255,107,53,0.18)', glow: '0 0 20px rgba(255,107,53,0.18)' },
  Building2: { icon: Building2, badge: Boxes, color: DAIG_TOKENS.colors.blue, bg: 'rgba(13,117,255,0.09)', border: 'rgba(13,117,255,0.18)', glow: '0 0 20px rgba(13,117,255,0.18)' },
  Landmark: { icon: Landmark, badge: FileCheck, color: '#F59E0B', bg: 'rgba(245,158,11,0.09)', border: 'rgba(245,158,11,0.18)', glow: '0 0 20px rgba(245,158,11,0.18)' },
}

export const HitechIcon: React.FC<{ name: keyof typeof HITECH_MAP; size?: number }> = ({ name, size = 22 }) => {
  const spec = HITECH_MAP[name]
  if (!spec) return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Icon: any = spec.icon
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Badge: any = spec.badge
  return (
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: 14,
        background: spec.bg,
        border: `1px solid ${spec.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        boxShadow: spec.glow,
        flexShrink: 0,
      }}
    >
      <Icon size={size} color={spec.color} strokeWidth={1.9} />
      {Badge && (
        <span
          style={{
            position: 'absolute',
            right: -6,
            bottom: -6,
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: '#0a0d0b',
            border: `1px solid ${spec.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 2px 10px rgba(0,0,0,0.4), ${spec.glow}`,
          }}
        >
          <Badge size={10} color={spec.color} strokeWidth={2.2} />
        </span>
      )}
    </div>
  )
}

export { HITECH_MAP }
