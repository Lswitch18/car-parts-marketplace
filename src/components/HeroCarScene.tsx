import { useRef, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGLTF, Sparkles, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

const NEON = '#00D4FF'

/* ── TRON wireframe car from GLB model ───────────── */
function TronCar() {
  const groupRef = useRef<THREE.Group>(null)
  const { scene } = useGLTF('/sports_car.glb')

  const { glassScene, edgesData } = useMemo(() => {
    const cloned = scene.clone(true)

    const box = new THREE.Box3().setFromObject(cloned)
    const size = new THREE.Vector3()
    box.getSize(size)
    const maxDim = Math.max(size.x, size.y, size.z)
    const scale = maxDim > 0 ? 4 / maxDim : 1
    cloned.scale.set(scale, scale, scale)

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

  return (
    <group ref={groupRef} position={[0, -0.3, 0]}>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.28, 0]}
      >
        <ringGeometry args={[1.2, 2.2, 48]} />
        <meshBasicMaterial
          color={NEON}
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <primitive object={glassScene} />

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
    <div className="absolute inset-0 z-0 w-full h-full">
      <Canvas
        camera={{ position: [0, 0.85, 6.5], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.15} />
        <pointLight position={[5, 5, 5]} intensity={0.3} color={NEON} />

        <OrbitControls
          autoRotate
          autoRotateSpeed={2}
          enablePan={false}
          enableZoom={false}
          enableDamping
          dampingFactor={0.05}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 2}
        />

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
