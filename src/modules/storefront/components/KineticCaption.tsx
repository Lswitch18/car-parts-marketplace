import React, { useEffect, useState, useRef } from 'react'
import gsap from 'gsap'
import { parseVtt, findActiveCue, type VttCue } from '@/modules/storefront/lib/vttParser'

type Props = {
  lang: 'pt' | 'ja'
  currentTime: number
  onDuck?: (isActive: boolean) => void
  className?: string
}

export const KineticCaption: React.FC<Props> = ({ lang, currentTime, onDuck, className }) => {
  const [cues, setCues] = useState<VttCue[]>([])
  const [active, setActive] = useState<VttCue | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    let cancelled = false
    const url = lang === 'pt' ? '/presentation/subs/pt.vtt' : '/presentation/subs/ja.vtt'
    // fallback to legacy location
    fetch(url).then(async r => {
      if (!r.ok) {
        const alt = lang === 'pt' ? '/videos/demo-pt.vtt' : '/videos/demo-ja.vtt'
        const r2 = await fetch(alt)
        if (!r2.ok) return
        return r2.text()
      }
      return r.text()
    }).then(t => {
      if (cancelled || !t) return
      setCues(parseVtt(t))
    }).catch(() => {})
    return () => { cancelled = true }
  }, [lang])

  useEffect(() => {
    const a = findActiveCue(cues, currentTime)
    setActive(a)
    onDuck?.(!!a)
  }, [cues, currentTime, onDuck])

  useEffect(() => {
    if (!containerRef.current || reduce || !active) return
    const words = containerRef.current.querySelectorAll('.kc-word')
    gsap.fromTo(words,
      { y: 8, opacity: 0.3 },
      { y: 0, opacity: 1, duration: 0.32, stagger: 0.03, ease: 'power2.out', overwrite: true }
    )
  }, [active, reduce])

  if (!active) return null

  return (
    <div
      ref={containerRef}
      aria-live="polite"
      className={className}
      style={{
        position: 'absolute',
        bottom: '9%',
        left: '50%',
        transform: 'translateX(-50%)',
        maxWidth: '86%',
        padding: '10px 18px',
        borderRadius: 14,
        background: 'rgba(6, 8, 15, 0.72)',
        backdropFilter: 'blur(14px) saturate(160%)',
        WebkitBackdropFilter: 'blur(14px) saturate(160%)',
        border: '1px solid rgba(0, 229, 255, 0.18)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.45), 0 0 28px rgba(0,229,255,0.12)',
        textAlign: 'center',
        pointerEvents: 'none',
      }}
    >
      <p style={{ margin: 0, color: 'rgba(255,255,255,0.92)', fontSize: 14, lineHeight: 1.5, fontWeight: 500, letterSpacing: 0.1 }}>
        {active.words.map((w, i) => (
          <span
            key={`${w}-${i}`}
            className="kc-word inline-block"
            style={{
              marginRight: i === active.words.length - 1 ? 0 : 6,
              textShadow: i === 0 ? '0 0 10px rgba(0,229,255,0.45)' : undefined,
              color: i === 0 ? '#E6FDFF' : undefined,
            }}
          >
            {w}
          </span>
        ))}
      </p>
    </div>
  )
}
