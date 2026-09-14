/**
 * DAIG Design Tokens — Fonte Única de Verdade (Cyber Neon)
 * Extraído de src/index.css:12-34 + tailwind.config.js
 * Toda decisão autônoma de design DEVE mapear para estes tokens.
 * Forge/DesignAuthority rejeitam PR fora deste lock.
 */
export const DAIG_TOKENS = {
  colors: {
    // Fundos Extreme Dark
    void: '#020617', // hero/presentation bg (PresentationPage:724)
    deep: '#050505',
    card: '#0A0A0F',
    elevated: '#111116',
    // Neon
    blue: '#0D75FF',
    cyan: '#00E5FF',
    purple: '#7000FF',
    // Semânticos
    success: '#10B981',
    warning: '#F59E0B',
    error: '#FF4B4B',
    info: '#0D75FF',
    // Texto
    textMain: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.65)',
    textMuted: 'rgba(255,255,255,0.45)',
    textFaint: 'rgba(255,255,255,0.35)',
  },
  glass: {
    ultra: 'rgba(11,14,23,0.78)', // glass-ultra bg
    blur: '24px',
    saturate: '180%',
    border: 'rgba(13,117,255,0.14)',
    borderHover: 'rgba(13,117,255,0.25)',
    shadow: '0 8px 32px rgba(0,0,0,0.38), 0 0 60px rgba(13,117,255,0.06)',
  },
  neon: {
    cyan: '#00E5FF',
    blue: '#0D75FF',
    purple: '#7000FF',
    magenta: '#ff00ff',
    green: '#00ff88',
  },
  radii: {
    card: 18,
    pill: 100,
    button: 14,
  },
  motion: {
    lenisDuration: 1.2,
    lenisEasing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    staggerEach: 0.08,
    splitStagger: 0.02,
    easeOut: 'power3.out',
    easeExpo: 'expo.out',
    easeElastic: 'elastic.out(1, 0.3)',
  },
  typography: {
    display: 'Sora, sans-serif',
    body: 'Raleway, sans-serif',
    mono: 'JetBrains Mono, monospace',
  },
  z: {
    bgParticle: 0,
    content: 1,
    overlay: 10,
    header: 50,
  },
} as const

export type DaigTokenPath = string // e.g. "colors.cyan"

export function isAllowedColor(hex: string): boolean {
  const allowed = new Set<string>([
    DAIG_TOKENS.colors.void,
    DAIG_TOKENS.colors.deep,
    DAIG_TOKENS.colors.card,
    DAIG_TOKENS.colors.elevated,
    DAIG_TOKENS.colors.blue,
    DAIG_TOKENS.colors.cyan,
    DAIG_TOKENS.colors.purple,
    DAIG_TOKENS.colors.success,
    DAIG_TOKENS.colors.warning,
    DAIG_TOKENS.colors.error,
    DAIG_TOKENS.colors.info,
    '#FFFFFF',
    '#000000',
    // variantes com alpha são permitidas se base for token
  ])
  const base = hex.replace(/\/\d+/, '').toLowerCase()
  // permite rgba variants se base hex for token
  if (allowed.has(hex) || allowed.has(base)) return true
  // permite rgba com token rgb
  if (hex.startsWith('rgba') || hex.startsWith('hsla')) {
    if (hex.includes('0,229,255') || hex.includes('13,117,255') || hex.includes('112,0,255')) return true
  }
  return false
}

export const DESIGN_GUARDRAILS = {
  // IA só pode animar transform/opacity (GPU)
  allowedAnimatedProps: ['x', 'y', 'xPercent', 'yPercent', 'scale', 'opacity', 'rotate', 'rotateX', 'rotateY'] as const,
  forbiddenAnimatedProps: ['width', 'height', 'top', 'left', 'background', 'color'] as const,
  // GSAP regras premium
  lenisDuration: 1.2,
  willChangeOnlyDuringAnim: true,
  splitTextAllowed: { type: 'chars,words', stagger: 0.02, rotationX: -90 },
} as const
