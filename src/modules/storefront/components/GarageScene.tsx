/**
 * GarageScene — Passeio virtual pela garagem DAIG
 * Stack: React + @react-three/fiber + drei + Three.js + GSAP ScrollTrigger
 * 
 * COMO TROCAR O MODELO 3D CUSTOM (.gltf/.obj):
 * 1. Coloque seu arquivo em public/models/garage.gltf (ou house.gltf)
 * 2. Descomente o bloco <Suspense><GltfModel /></Suspense> abaixo e comente <Garage /> procedural
 * 3. Ajuste scale/position em <GltfModel url="/models/garage.gltf" />
 * Exemplo:
 *   import { useGLTF } from '@react-three/drei'
 *   function GltfModel({ url }) {
 *     const { scene } = useGLTF(url)
 *     return <primitive object={scene} scale={1.2} position={[0,0,-5]} />
 *   }
 *   // No JSX: <Suspense fallback={null}><GltfModel url="/models/garage.gltf" /></Suspense>
 */
import React, { useRef, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, PerspectiveCamera, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// G Gear 3D — 12 dentes, cian→roxo
const Gear: React.FC<{ progress: { current: number } }> = ({ progress }) => {
  const ref = useRef<THREE.Group>(null)
  const teeth = 12
  const outerR = 2.2
  const rootR = 1.65

  useFrame(() => {
    if (!ref.current) return
    const p = progress.current
    // 0-55% gira 720° (2 voltas), depois dispersa
    const rot = Math.min(p / 0.55, 1) * Math.PI * 4
    ref.current.rotation.z = rot
    // Ondulação leve antes do scroll
    const idleAmp = 1 - Math.min(p * 8, 1)
    const t = performance.now() * 0.001
    ref.current.position.y = Math.sin(t * 0.6) * 0.04 * idleAmp
    // Dispersão: escala vai a 0 e opacidade some
    const disp = p < 0.32 ? 0 : (p - 0.32) / 0.68
    const s = 1 - disp * 0.95
    ref.current.scale.setScalar(Math.max(0.05, s))
    ref.current.traverse(o => {
      if ((o as THREE.Mesh).isMesh) {
        const m = o as THREE.Mesh
        const mat = m.material as THREE.MeshStandardMaterial
        if (mat.transparent !== undefined) {
          mat.opacity = 1 - disp * 0.97
          mat.transparent = true
        }
      }
    })
  })

  return (
    <group ref={ref} position={[0, 1.2, -8]}>
      {/* Gear body */}
      <mesh>
        <cylinderGeometry args={[rootR, rootR, 0.35, 32]} />
        <meshStandardMaterial color="#90A0B8" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Teeth - 12 retangulares com topo plano */}
      {Array.from({ length: teeth }).map((_, i) => {
        const ang = (i * 360) / teeth
        const isEven = i % 2 === 0
        return (
          <mesh key={i} position={[Math.cos((ang * Math.PI) / 180) * (rootR + 0.25), Math.sin((ang * Math.PI) / 180) * (rootR + 0.25), 0]} rotation={[0, 0, (ang * Math.PI) / 180]}>
            <boxGeometry args={[0.45, 0.32, 0.32]} />
            <meshStandardMaterial color={isEven ? '#00E5FF' : '#7000FF'} metalness={0.6} roughness={0.4} emissive={isEven ? '#00E5FF' : '#7000FF'} emissiveIntensity={0.15} />
          </mesh>
        )
      })}
      {/* Inner hole + G */}
      <mesh position={[0, 0, 0.18]}>
        <cylinderGeometry args={[0.95, 0.95, 0.4, 32]} />
        <meshStandardMaterial color="#020617" />
      </mesh>
      {/* G letter as 3D text - simple box + shape */}
      <group position={[0, 0, 0.35]}>
        {/* G as extruded shape - simplified as torus segment */}
        <mesh>
          <torusGeometry args={[0.55, 0.12, 12, 20, Math.PI * 1.6]} />
          <meshStandardMaterial color="#E6FDFF" metalness={0.5} roughness={0.4} emissive="#00E5FF" emissiveIntensity={0.2} />
        </mesh>
        <mesh position={[0.18, -0.05, 0]}>
          <boxGeometry args={[0.28, 0.12, 0.12]} />
          <meshStandardMaterial color="#E6FDFF" />
        </mesh>
      </group>
      {/* Outer glow */}
      <pointLight position={[0, 0, 1]} intensity={1.2} distance={6} color="#00E5FF" />
      <pointLight position={[1, 1, 0.5]} intensity={0.8} distance={5} color="#7000FF" />
    </group>
  )
}

// Garage procedural
const Garage: React.FC = () => {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 40]} />
        <meshStandardMaterial color="#0a0f1e" roughness={0.9} metalness={0.1} />
      </mesh>
      {/* Grid floor */}
      <gridHelper args={[30, 30, '#00E5FF', '#1a2332']} position={[0, 0.01, 0]} />
      {/* Walls */}
      <mesh position={[0, 3, -15]} receiveShadow>
        <planeGeometry args={[30, 6]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </mesh>
      {/* Side walls */}
      <mesh position={[-15, 3, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[40, 6]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[15, 3, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[40, 6]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      {/* Shelves with JDM parts - boxes */}
      {[
        [-4, 0.5, -4], [-4, 1.2, -4], [-4, 0.5, -2], [4, 0.5, -6], [4, 1.2, -6],
        [-6, 0.5, 2], [6, 0.5, 4], [-5, 0.5, 6], [5, 0.5, -10]
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <boxGeometry args={[0.9, 0.7, 0.6]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#1e293b' : '#334155'} metalness={0.3} roughness={0.6} />
        </mesh>
      ))}
      {/* Neon strips */}
      <mesh position={[0, 5.8, -14.9]}>
        <planeGeometry args={[20, 0.08]} />
        <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={1} />
      </mesh>
      <mesh position={[0, 5.8, 14.9]}>
        <planeGeometry args={[20, 0.08]} />
        <meshStandardMaterial color="#7000FF" emissive="#7000FF" emissiveIntensity={1} />
      </mesh>
    </group>
  )
}

const CameraWalk: React.FC<{ progress: React.MutableRefObject<number> }> = ({ progress }) => {
  const { camera } = useThree()
  const ref = useRef(progress)

  useEffect(() => {
    ref.current = progress
    const hero = document.querySelector('.garage-walk-section') as HTMLElement
    const trigger = hero || '.garage-walk-section'
    const st = ScrollTrigger.create({
      trigger,
      start: 'top top',
      end: '+=180%',
      scrub: 1,
      pin: true,
      anticipatePin: 1,
      onUpdate: self => {
        progress.current = self.progress
        const p = self.progress
        // Dolly walk: z 8 → -12, x -1 → 1.5, y 1.7 → 1.4
        const targetZ = 8 - p * 20
        const targetX = -0.8 + p * 2.3
        const targetY = 1.7 - p * 0.3
        gsap.to(camera.position, { x: targetX, y: targetY, z: targetZ, duration: 0.4, overwrite: 'auto', ease: 'power2.out' })
        // Look slightly ahead
        const lookZ = targetZ - 5 - p * 2
        // @ts-ignore
        if ((camera as THREE.PerspectiveCamera).lookAt) {
          // For PerspectiveCamera, we lerp target via gsap on a dummy
        }
      },
    })
    return () => st.kill()
  }, [camera, progress])

  useFrame(() => {
    // Keep camera looking forward along walk
    const p = progress.current
    const lookAt = new THREE.Vector3(-0.5 + p * 1.2, 1.1, -8 - p * 12)
    camera.lookAt(lookAt)
  })

  return null
}

export const GarageScene: React.FC = () => {
  const progress = useRef(0)
  const [ready, setReady] = React.useState(false)
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 300)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="garage-walk-section" style={{ minHeight: '100vh', height: '100vh', position: 'relative', background: '#020617', display: 'block' }}>
      {!ready && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020617', zIndex: 1 }}>
          <div style={{ width: 32, height: 32, border: '3px solid rgba(0,229,255,0.2)', borderTopColor: '#00E5FF', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
        </div>
      )}
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [0, 1.7, 8], fov: 60 }}
        style={{ position: 'absolute', inset: 0, display: 'block', opacity: ready ? 1 : 0, transition: 'opacity 0.6s' }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
        onCreated={() => setReady(true)}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow shadow-mapSize={[2048, 2048]} />
        <pointLight position={[-4, 3, -4]} intensity={0.8} color="#00E5FF" distance={12} />
        <pointLight position={[4, 3, 6]} intensity={0.6} color="#7000FF" distance={10} />
        <Garage />
        <Gear progress={progress} />
        <ContactShadows position={[0, 0.02, 0]} opacity={0.5} scale={20} blur={2} far={8} color="#000" />
        <Environment preset="city" />
        <CameraWalk progress={progress} />
        <PerspectiveCamera makeDefault position={[0, 1.7, 8]} fov={60} />
      </Canvas>

      {/* Overlay UI — glass ultra */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
        <div style={{ pointerEvents: 'auto', textAlign: 'center', maxWidth: 720, padding: '0 24px' }}>
          <div style={{ display: 'inline-flex', gap: 8, padding: '6px 14px', borderRadius: 100, background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.18)', marginBottom: 18 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00E5FF', boxShadow: '0 0 8px #00E5FF' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#00E5FF', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Passeio Virtual · Garagem DAIG</span>
          </div>
          <h2 style={{ fontSize: 'clamp(32px,6vw,64px)', fontWeight: 900, color: 'white', lineHeight: 0.9, letterSpacing: '-0.03em', marginBottom: 16, textShadow: '0 4px 32px rgba(0,0,0,0.8)' }}>
            Entre na <span style={{ background: 'linear-gradient(135deg,#00E5FF,#7000FF)', WebkitBackgroundClip: 'text', color: 'transparent' }}>garagem</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: 16, lineHeight: 1.6, maxWidth: 520, margin: '0 auto' }}>
            Role para caminhar — prateleiras com peças JDM reais, luz neon e a engrenagem G ao fundo que gira e se desfaz.
          </p>
        </div>
        <div style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', opacity: 0.6, animation: 'scrollBounce 2.5s ease-in-out infinite' }}>
          <svg width="20" height="30" viewBox="0 0 20 30" fill="none"><rect x="1" y="1" width="18" height="28" rx="9" stroke="rgba(0,229,255,0.5)" strokeWidth="1.2"/><rect x="8.5" y="5" width="3" height="7" rx="1.5" fill="rgba(0,229,255,0.7)"/></svg>
        </div>
      </div>

      <style>{`@keyframes scrollBounce{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(8px)}}`}</style>
    </div>
  )
}
