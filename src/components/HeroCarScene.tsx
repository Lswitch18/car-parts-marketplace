import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Sparkles } from '@react-three/drei'
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
    const scale = maxDim > 0 ? 4 / maxDim : 1
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
    <group ref={groupRef} position={[0, -0.31, 0]}>
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
