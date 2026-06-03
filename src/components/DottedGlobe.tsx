import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function WireGlobe() {
  const groupRef = useRef<THREE.Group>(null)

  const { positions, linePositions } = useMemo(() => {
    const count = 280
    const radius = 2.86
    const pts: THREE.Vector3[] = []

    // Fibonacci sphere for uniform distribution
    const goldenRatio = (1 + Math.sqrt(5)) / 2
    for (let i = 0; i < count; i++) {
      const theta = Math.acos(1 - 2 * (i + 0.5) / count)
      const phi = 2 * Math.PI * i / goldenRatio
      pts.push(new THREE.Vector3(
        radius * Math.sin(theta) * Math.cos(phi),
        radius * Math.sin(theta) * Math.sin(phi),
        radius * Math.cos(theta)
      ))
    }

    // Build connections between nearby points
    const lines: number[] = []
    const connectDist = radius * 0.65
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        if (pts[i].distanceTo(pts[j]) < connectDist) {
          lines.push(pts[i].x, pts[i].y, pts[i].z)
          lines.push(pts[j].x, pts[j].y, pts[j].z)
        }
      }
    }

    const pos = new Float32Array(pts.flatMap(p => [p.x, p.y, p.z]))
    const linePos = new Float32Array(lines)

    return { positions: pos, linePositions: linePos }
  }, [])

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.2
      groupRef.current.rotation.x = Math.sin(Date.now() * 0.00008) * 0.08
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
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          color="#80C8FF"
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={linePositions.length / 3}
            array={linePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#4080CC" transparent opacity={0.15} />
      </lineSegments>
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
