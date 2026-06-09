import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import * as THREE from 'three'

const NEON = '#00D4FF'

/* ── Car section shapes (coupe silhouette) ────────── */
interface Section {
  size: [number, number, number]
  pos: [number, number, number]
  rot?: [number, number, number]
}

const SECTIONS: Section[] = [
  // Underbody
  { size: [2.0, 0.06, 5.2], pos: [0, 0.03, 0] },
  // Front bumper
  { size: [1.96, 0.28, 0.3], pos: [0, 0.18, 2.6] },
  // Hood
  { size: [1.86, 0.2, 1.0], pos: [0, 0.32, 1.8] },
  // Cowl / windshield base
  { size: [1.76, 0.18, 0.3], pos: [0, 0.52, 1.1], rot: [-0.15, 0, 0] },
  // Cabin
  { size: [1.66, 0.38, 1.4], pos: [0, 0.68, -0.1] },
  // Rear window
  { size: [1.76, 0.18, 0.3], pos: [0, 0.52, -1.1], rot: [0.15, 0, 0] },
  // Trunk
  { size: [1.86, 0.2, 1.0], pos: [0, 0.32, -1.8] },
  // Rear bumper
  { size: [1.96, 0.28, 0.3], pos: [0, 0.18, -2.6] },

  // Front wheel arches
  { size: [0.28, 0.2, 0.7], pos: [-1.07, 0.14, 1.7] },
  { size: [0.28, 0.2, 0.7], pos: [1.07, 0.14, 1.7] },
  // Rear wheel arches
  { size: [0.28, 0.2, 0.7], pos: [-1.07, 0.14, -1.7] },
  { size: [0.28, 0.2, 0.7], pos: [1.07, 0.14, -1.7] },

  // Rear spoiler wing
  { size: [1.7, 0.03, 0.35], pos: [0, 0.56, -2.35] },
  // Spoiler supports
  { size: [0.03, 0.16, 0.03], pos: [-0.75, 0.46, -2.35] },
  { size: [0.03, 0.16, 0.03], pos: [0.75, 0.46, -2.35] },
  // Front splitter
  { size: [1.8, 0.03, 0.15], pos: [0, 0.02, 2.75] },
]

/* ── Wheel ring helper ────────────────────────────── */
function buildCircle(radius: number, seg = 32) {
  const pts: number[] = []
  for (let i = 0; i <= seg; i++) {
    const t = (i / seg) * Math.PI * 2
    pts.push(Math.cos(t) * radius, Math.sin(t) * radius, 0)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3))
  return g
}

/* ── 3D Car ───────────────────────────────────────── */
function TronCar() {
  const groupRef = useRef<THREE.Group>(null)

  const meshes = useMemo(
    () =>
      SECTIONS.map((s) => {
        const geom = new THREE.BoxGeometry(...s.size)
        const edges = new THREE.EdgesGeometry(geom, 15)
        return { pos: s.pos, rot: s.rot ?? [0, 0, 0], geom, edges }
      }),
    [],
  )

  const wheelPositions: [number, number, number][] = [
    [-1.06, 0.15, 1.7],
    [1.06, 0.15, 1.7],
    [-1.06, 0.15, -1.7],
    [1.06, 0.15, -1.7],
  ]

  const wheelGeom = useMemo(() => buildCircle(0.36, 24), [])

  const groundRing = useMemo(() => new THREE.RingGeometry(1.5, 2.3, 48), [])

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.28
    }
  })

  return (
    <group ref={groupRef} position={[0, -0.2, 0]}>
      {/* Ground reflection ring */}
      <mesh
        geometry={groundRing}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.3, 0]}
      >
        <meshBasicMaterial
          color={NEON}
          transparent
          opacity={0.08}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Car body sections — glass fill + neon edges */}
      {meshes.map((m, i) => (
        <group key={i} position={m.pos} rotation={m.rot as any}>
          {/* Glassmorphism fill */}
          <mesh geometry={m.geom}>
            <meshPhysicalMaterial
              color="#000000"
              transparent
              opacity={0.04}
              roughness={0.05}
              metalness={0}
              clearcoat={0.5}
              clearcoatRoughness={0.3}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
          {/* Neon wireframe */}
          <lineSegments geometry={m.edges}>
            <lineBasicMaterial
              color={NEON}
              transparent
              opacity={0.7}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </lineSegments>
        </group>
      ))}

      {/* Wheels — continuous circle lines */}
      {wheelPositions.map((pos, i) => (
        <group key={`w${i}`} position={pos} rotation={[0, 0, Math.PI / 2]}>
          <line geometry={wheelGeom}>
            <lineBasicMaterial
              color={NEON}
              transparent
              opacity={0.9}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </line>
        </group>
      ))}
    </group>
  )
}

/* ── Public component ─────────────────────────────── */
export default function HeroCarScene() {
  return (
    <div className="absolute right-[-120px] top-1/2 -translate-y-1/2 w-[900px] h-[900px] pointer-events-none z-0 hidden lg:block">
      <Canvas
        camera={{ position: [0, 0.5, 5.5], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.15} />
        <pointLight position={[5, 5, 5]} intensity={0.3} color={NEON} />

        <TronCar />

        <Sparkles
          count={45}
          scale={[7, 3.5, 7]}
          size={2}
          speed={0.2}
          color={NEON}
          opacity={0.2}
        />
      </Canvas>
    </div>
  )
}
