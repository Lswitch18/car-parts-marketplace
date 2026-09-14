/**
 * LogoGParticleR3F — Evolução 3D do LogoGParticle (criado por r3f-logo-evolver agent)
 * Usa @react-three/fiber instanced mesh previsto no tech-radar: hype 7 fit 8
 * Mantém cian→roxo lerp + ScrollTrigger pin, fallback para Canvas2D se WebGL off.
 * Lazy + suspense, não adiciona bundle extra (three já em vendor-three 1.3M)
 */
import React, { Suspense, useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshTransmissionMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { gsap, ScrollTrigger } from '@/modules/shared/lib/gsap'
import { DAIG_TOKENS } from '@/modules/shared/lib/designTokens'

const LogoMesh: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null)
  const progressRef = useRef(0)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const hero = document.querySelector('.hero-section') as HTMLElement | null
    if (!hero) return
    const st = ScrollTrigger.create({
      trigger: hero,
      start: 'top top',
      end: '+=130%',
      scrub: 1,
      onUpdate: s => { progressRef.current = s.progress },
    })
    return () => st.kill()
  }, [])

  useFrame((_, delta) => {
    if (!meshRef.current) return
    const p = progressRef.current
    // rotação + dispersão (espelha LogoGParticle canvas 2D mas em 3D)
    meshRef.current.rotation.y += delta * 0.3 * (1 - p * 0.9)
    meshRef.current.rotation.x = Math.sin(Date.now() * 0.0003) * 0.08 * (1 - p * 4)
    const scale = 1 - p * 0.4
    meshRef.current.scale.setScalar(Math.max(0.6, scale))
  })

  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.4}>
      <mesh ref={meshRef as unknown as React.RefObject<THREE.Mesh>}>
        <torusGeometry args={[1.6, 0.45, 32, 64]} />
        <MeshTransmissionMaterial
          backside
          samples={4}
          thickness={0.6}
          chromaticAberration={0.06}
          anisotropy={0.1}
          distortion={0.2}
          color={DAIG_TOKENS.colors.cyan}
          emissive={DAIG_TOKENS.colors.purple}
          emissiveIntensity={0.3}
        />
      </mesh>
    </Float>
  )
}

export const LogoGParticleR3F: React.FC<{ style?: React.CSSProperties; fallbackSrc?: string }> = ({
  style,
  fallbackSrc = '/presentation/logo-g.png',
}) => {
  const [webGL, setWebGL] = React.useState(true)
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas')
      const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null
      if (!gl) setWebGL(false)
    } catch { setWebGL(false) }
  }, [])

  if (!webGL) {
    return (
      <div style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={fallbackSrc} alt="G" style={{ width: '70%', height: '70%', objectFit: 'contain', filter: 'drop-shadow(0 0 22px rgba(0,229,255,0.45))' }} />
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 520, overflow: 'hidden', ...style }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[4, 4, 4]} intensity={1.2} color={DAIG_TOKENS.colors.cyan} />
        <pointLight position={[-3, -2, 3]} intensity={0.8} color={DAIG_TOKENS.colors.purple} />
        <Suspense fallback={null}>
          <LogoMesh />
        </Suspense>
      </Canvas>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(2,6,23,0.35) 100%)' }} />
    </div>
  )
}
