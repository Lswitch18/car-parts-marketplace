import { useEffect, useRef, useCallback } from 'react'
import gsap from 'gsap'

type Lang = 'pt' | 'ja'

export function usePresentationAudio(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  lang: Lang,
) {
  const ctxRef = useRef<AudioContext | null>(null)
  const narrationGainRef = useRef<GainNode | null>(null)
  const bedGainRef = useRef<GainNode | null>(null)
  const bedSourceRef = useRef<AudioBufferSourceNode | null>(null)
  const narrationBufferRef = useRef<Map<Lang, AudioBuffer>>(new Map())
  const narrationSourceRef = useRef<AudioBufferSourceNode | null>(null)
  const startedRef = useRef(false)

  // bed loop via AudioContext (ducking)
  const ensureContext = useCallback(async () => {
    if (ctxRef.current) {
      if (ctxRef.current.state === 'suspended') await ctxRef.current.resume()
      return ctxRef.current
    }
    const Ctx = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)
    const ctx = new Ctx()
    const nGain = ctx.createGain()
    const bGain = ctx.createGain()
    nGain.gain.value = 1
    bGain.gain.value = 0.14
    nGain.connect(ctx.destination)
    bGain.connect(ctx.destination)
    ctxRef.current = ctx
    narrationGainRef.current = nGain
    bedGainRef.current = bGain
    return ctx
  }, [])

  // Load bed ambient once
  useEffect(() => {
    let cancelled = false
    ensureContext().then(async (ctx) => {
      try {
        const res = await fetch('/presentation/audio/bed_ambient.mp3')
        if (!res.ok) return
        const buf = await res.arrayBuffer()
        const decoded = await ctx.decodeAudioData(buf)
        if (cancelled) return
        const src = ctx.createBufferSource()
        src.buffer = decoded
        src.loop = true
        src.connect(bedGainRef.current!)
        src.start(0)
        bedSourceRef.current = src
      } catch { /* ignore */ }
    })
    return () => { cancelled = true; try { bedSourceRef.current?.stop() } catch {} }
  }, [ensureContext])

  // Ducking API
  const duckBed = useCallback((duck: boolean) => {
    const g = bedGainRef.current
    if (!g || !ctxRef.current) return
    gsap.to(g.gain, { value: duck ? 0.05 : 0.14, duration: 0.4, ease: 'power2.inOut' })
  }, [])

  const crossfadeLang = useCallback(async (next: Lang) => {
    await ensureContext()
    const g = narrationGainRef.current
    if (!g) return
    // fade out
    gsap.to(g.gain, { value: 0, duration: 0.3, ease: 'power2.inOut' })
  }, [ensureContext])

  // Sync helper for video -> audio (fallback if using <audio> element elsewhere)
  const resumeOnGesture = useCallback(async () => {
    if (!startedRef.current) {
      await ensureContext()
      startedRef.current = true
    } else if (ctxRef.current?.state === 'suspended') {
      await ctxRef.current.resume()
    }
  }, [ensureContext])

  useEffect(() => {
    const onPointer = () => resumeOnGesture()
    window.addEventListener('pointerdown', onPointer, { once: true })
    window.addEventListener('touchstart', onPointer, { once: true })
    return () => {
      window.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('touchstart', onPointer)
    }
  }, [resumeOnGesture])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try { narrationSourceRef.current?.stop() } catch {}
      try { bedSourceRef.current?.stop() } catch {}
      // don't close ctx aggressively (may be reused)
    }
  }, [])

  return { ensureContext, duckBed, crossfadeLang, resumeOnGesture, ctxRef, narrationBufferRef }
}
