import React from 'react'

interface CustomIconProps {
  className?: string
  glow?: boolean
}

// ── 1. Turbocharger JDM Icon ──────────────────────────────
export function TurboIcon({ className = 'w-6 h-6', glow = true }: CustomIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${className} ${glow ? 'drop-shadow-[0_0_10px_rgba(0,229,255,0.6)]' : ''}`}
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v6M12 15v6M3 12h6M15 12h6" />
      <path d="M5.6 5.6l4.3 4.3M14.1 14.1l4.3 4.3M18.4 5.6l-4.3 4.3M9.9 14.1l-4.3 4.3" />
    </svg>
  )
}

// ── 2. Piston & Engine Component Icon ──────────────────────
export function PistonIcon({ className = 'w-6 h-6', glow = true }: CustomIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${className} ${glow ? 'drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]' : ''}`}
    >
      <rect x="6" y="3" width="12" height="7" rx="2" />
      <path d="M6 6h12M6 8.5h12" />
      <path d="M10 10v6a2 2 0 0 0 4 0v-6" />
      <circle cx="12" cy="18" r="2" />
    </svg>
  )
}

// ── 3. Brake Disc Rotor Icon ──────────────────────────────
export function BrakeDiscIcon({ className = 'w-6 h-6', glow = true }: CustomIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${className} ${glow ? 'drop-shadow-[0_0_10px_rgba(239,68,68,0.6)]' : ''}`}
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3" />
      <circle cx="12" cy="6" r="0.8" fill="currentColor" />
      <circle cx="18" cy="12" r="0.8" fill="currentColor" />
      <circle cx="12" cy="18" r="0.8" fill="currentColor" />
      <circle cx="6" cy="12" r="0.8" fill="currentColor" />
      <path d="M4 3l4 4M20 3l-4 4" />
    </svg>
  )
}

// ── 4. ECU / Microchip Module Icon ─────────────────────────
export function EcuModuleIcon({ className = 'w-6 h-6', glow = true }: CustomIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${className} ${glow ? 'drop-shadow-[0_0_10px_rgba(13,117,255,0.6)]' : ''}`}
    >
      <rect x="5" y="5" width="14" height="14" rx="3" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
      <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" />
    </svg>
  )
}

// ── 5. AI Vision Computer OCR Scanner Icon ────────────────
export function AiScanIcon({ className = 'w-6 h-6', glow = true }: CustomIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${className} ${glow ? 'drop-shadow-[0_0_10px_rgba(0,229,255,0.7)]' : ''}`}
    >
      <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
      <line x1="7" y1="12" x2="17" y2="12" stroke="#00E5FF" strokeWidth="2" className="animate-pulse" />
      <circle cx="12" cy="12" r="2" fill="#00E5FF" />
    </svg>
  )
}
