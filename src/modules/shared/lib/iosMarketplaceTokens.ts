/**
 * iosMarketplaceTokens — extensão iOS do DAIG_TOKENS
 * Mantém paleta Cyber Neon intacta, adiciona safe-area, dock e haptics.
 * Fonte única para todo layout iOS (IosMarketplaceLayout + 7 telas).
 */
import { DAIG_TOKENS } from './designTokens'

export const IOS_TOKENS = {
  ...DAIG_TOKENS,
  // Tipografia premium Google Fonts (Sora + Instrument Sans + JetBrains Mono)
  // Carregada em index.html via preconnect/preload — fallback: Raleway/Geist
  typography: {
    display: 'Sora, sans-serif',
    body: 'Instrument Sans, Raleway, sans-serif',
    mono: 'JetBrains Mono, Geist Mono, monospace',
    jpFallback: '"Noto Sans JP", "Hiragino Kaku Gothic ProN", sans-serif',
  },
  // Safe Area + Thumb Zone (iPhone notch/Dynamic Island + dock flutuante)
  ios: {
    safeTop: 'env(safe-area-inset-top)',
    safeBottom: 'env(safe-area-inset-bottom)',
    safeLeft: 'env(safe-area-inset-left)',
    safeRight: 'env(safe-area-inset-right)',
    // Dock flutuante premium (não cobre thumb-zone)
    dockHeight: 72,
    dockBottom: 24, // bottom-6
    dockSide: 24, // left-6 right-6
    dockRadius: 24, // rounded-3xl
    // Thumb zone: 128px do bottom (FAB/CTA)
    thumbZone: 128,
    // Content padding para não ficar sob dock
    contentBottom: 112, // dockHeight + dockBottom + gap
  },
  // Dock glass-ultra (mesmo DAIG_TOKENS.glass mas com alpha 0.85 para legibilidade iOS)
  dock: {
    bg: 'rgba(11,14,23,0.82)',
    blur: '24px',
    saturate: '180%',
    border: 'rgba(13,117,255,0.14)',
    shadow: '0 8px 32px rgba(0,0,0,0.45), 0 0 60px rgba(13,117,255,0.08)',
    activeBg: 'rgba(13,117,255,0.12)',
    activeColor: DAIG_TOKENS.colors.blue,
    inactiveColor: 'rgba(255,255,255,0.45)',
  },
  // Haptics (Capacitor Haptics)
  haptics: {
    light: 'LIGHT',
    medium: 'MEDIUM',
    heavy: 'HEAVY',
    selection: 'SELECTION',
  },
  // Motion iOS (um pouco mais rápido que web para sensação nativa)
  motionIos: {
    ...DAIG_TOKENS.motion,
    spring: '0.34, 1.56, 0.64, 1', // usado em scale CTA (ios spring)
    tapScale: 0.97,
    dockStagger: 0.04,
  },
} as const
