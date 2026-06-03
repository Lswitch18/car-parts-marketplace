import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function ParticleGlobe() {
  const groupRef = useRef<THREE.Group>(null)
  const ringRef = useRef<THREE.Mesh>(null)

  const { positions, colors } = useMemo(() => {
    const count = 2500
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const radius = 2.86

    for (let i = 0; i < count; i++) {
      const theta = Math.acos(2 * Math.random() - 1)
      const phi = Math.random() * Math.PI * 2

      pos[i * 3] = radius * Math.sin(theta) * Math.cos(phi)
      pos[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi)
      pos[i * 3 + 2] = radius * Math.cos(theta)

      const isBlue = Math.random() > 0.5
      col[i * 3] = isBlue ? 0.08 : 0.5
      col[i * 3 + 1] = isBlue ? 0.35 : 0.5
      col[i * 3 + 2] = isBlue ? 0.65 : 0.5
    }

    return { positions: pos, colors: col }
  }, [])

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.25
      groupRef.current.rotation.x = Math.sin(Date.now() * 0.0001) * 0.1
    }
    if (ringRef.current) {
      ringRef.current.rotation.x += delta * 0.15
    }
  })

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={colors.length / 3}
            array={colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          vertexColors
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      <mesh ref={ringRef}>
        <torusGeometry args={[3.38, 0.025, 16, 80]} />
        <meshBasicMaterial color="#0D75FF" transparent opacity={0.12} />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3.38, 0.02, 16, 80]} />
        <meshBasicMaterial color="#00E5FF" transparent opacity={0.08} />
      </mesh>
    </group>
  )
}

export default function DottedGlobe() {
  return (
    <div
      className="absolute right-[-100px] top-1/2 -translate-y-1/2 w-[650px] h-[650px] pointer-events-none z-0 hidden lg:block"
      style={{ opacity: 0.3 }}
    >
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }} gl={{ antialias: true }}>
        <ParticleGlobe />
      </Canvas>
    </div>
  )
}
