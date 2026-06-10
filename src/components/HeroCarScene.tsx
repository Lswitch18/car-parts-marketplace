import { useRef, useMemo, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Sparkles, Html } from '@react-three/drei'
import * as THREE from 'three'

const NEON = '#00D4FF'

/* ── TRON wireframe car from GLB model ───────────── */
function TronCar() {
  const groupRef = useRef<THREE.Group>(null)
  const { scene } = useGLTF('/sports_car.glb')

  const { glassScene, edgesData } = useMemo(() => {
    const cloned = scene.clone(true)

    // Auto-scale to 4 units
    const box = new THREE.Box3().setFromObject(cloned)
    const size = new THREE.Vector3()
    box.getSize(size)
    const maxDim = Math.max(size.x, size.y, size.z)
    const scale = maxDim > 0 ? 3.5 / maxDim : 1
    cloned.scale.set(scale, scale, scale)

    // Center
    const scaledBox = new THREE.Box3().setFromObject(cloned)
    const center = new THREE.Vector3()
    scaledBox.getCenter(center)
    cloned.position.sub(center)
    cloned.position.y += 0.6

    const edges: {
      pos: THREE.Vector3
      quat: THREE.Quaternion
      scl: THREE.Vector3
      geom: THREE.EdgesGeometry
    }[] = []

    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry) {
        // Replace mesh material with glassmorphism
        child.material = new THREE.MeshPhysicalMaterial({
          color: '#000000',
          transparent: true,
          opacity: 0.05,
          roughness: 0.05,
          metalness: 0,
          clearcoat: 0.6,
          clearcoatRoughness: 0.2,
          side: THREE.DoubleSide,
          depthWrite: false,
        })
        child.castShadow = false
        child.receiveShadow = false

        // Neon edge geometry
        edges.push({
          pos: child.position.clone(),
          quat: child.quaternion.clone(),
          scl: child.scale.clone(),
          geom: new THREE.EdgesGeometry(child.geometry, 18),
        })
      }
    })

    return { glassScene: cloned, edgesData: edges }
  }, [scene])

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3
    }
  })

  return (
    <group ref={groupRef} position={[0, -0.4, 0]}>
      {/* Glass car body (original meshes with glass material) */}
      <primitive object={glassScene} />

      {/* Neon wireframe edges */}
      {edgesData.map((ed, i) => (
        <lineSegments
          key={i}
          geometry={ed.geom}
          position={ed.pos}
          quaternion={ed.quat}
          scale={ed.scl}
        >
          <lineBasicMaterial
            color={NEON}
            transparent
            opacity={0.75}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </lineSegments>
      ))}
    </group>
  )
}

/* ── 3D dots with hover tooltips (Missão, Visão, Inovação) ── */
function CompanyDots() {
  const items = [
    { title: 'Missão', desc: 'Conectar pessoas com as peças certas', color: '#0D75FF' },
    { title: 'Visão', desc: 'Referência em autopeças no Japão', color: '#7000FF' },
    { title: 'Inovação', desc: 'IA + 3D + Logística Inteligente', color: '#00D4FF' },
  ]

  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState<number | null>(null)
  const scrollRef = useRef(0)
  const currentY = useRef(0.85)

  useEffect(() => {
    const onScroll = () => { scrollRef.current = window.scrollY }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useFrame(() => {
    if (!groupRef.current) return
    const targetY = Math.max(0.5, Math.min(1.5, 0.85 + scrollRef.current * 0.0004))
    currentY.current += (targetY - currentY.current) * 0.05
    groupRef.current.position.y = currentY.current
  })

  return (
    <group ref={groupRef} position={[-0.7, 0.85, 0.6]}>
      {items.map((item, i) => (
        <Html key={item.title} position={[0, 0.08 - i * 0.08, 0]}>
          <div className="flex items-center pointer-events-auto">
            <div
              className="w-[5px] h-[5px] rounded-full cursor-pointer transition-all duration-200"
              style={{
                backgroundColor: hovered === i ? '#00D4FF' : item.color,
                boxShadow: hovered === i
                  ? '0 0 8px #00D4FF'
                  : `0 0 4px ${item.color}55`,
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
            {hovered === i && (
              <div
                className="ml-2 px-2 py-1 rounded whitespace-nowrap"
                style={{
                  backgroundColor: 'rgba(0,0,0,0.85)',
                  border: `1px solid ${item.color}44`,
                  backdropFilter: 'blur(8px)',
                }}
              >
                <span style={{ fontSize: '10px', fontWeight: 700, color: item.color, marginRight: '5px' }}>
                  {item.title}
                </span>
                <span style={{ fontSize: '9px', fontWeight: 300, color: '#8892A4' }}>
                  {item.desc}
                </span>
              </div>
            )}
          </div>
        </Html>
      ))}
    </group>
  )
}

/* ── Public component ─────────────────────────────── */
export default function HeroCarScene() {
  return (
    <div className="absolute right-[-120px] top-1/2 -translate-y-1/2 w-[900px] h-[900px] pointer-events-none z-0 hidden lg:block">
      <Canvas
        camera={{ position: [0, 0.85, 6.5], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.15} />
        <pointLight position={[5, 5, 5]} intensity={0.3} color={NEON} />

        <TronCar />

        <CompanyDots />

        <Sparkles
          count={50}
          scale={[7, 3.5, 7]}
          size={2}
          speed={0.2}
          color={NEON}
          opacity={0.25}
        />
      </Canvas>
    </div>
  )
}
