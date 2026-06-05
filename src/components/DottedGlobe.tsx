import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function WireGlobe() {
  const groupRef = useRef<THREE.Group>(null)

  const data = useMemo(() => {
    const count = 200
    const radius = 3.8
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const ptBright: boolean[] = []

    const goldenRatio = (1 + Math.sqrt(5)) / 2
    for (let i = 0; i < count; i++) {
      const theta = Math.acos(1 - 2 * (i + 0.5) / count)
      const phi = 2 * Math.PI * i / goldenRatio
      pos[i * 3] = radius * Math.sin(theta) * Math.cos(phi)
      pos[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi)
      pos[i * 3 + 2] = radius * Math.cos(theta)

      const bright = Math.random() > 0.6
      ptBright.push(bright)
      if (bright) {
        col[i * 3] = 0
        col[i * 3 + 1] = 0.83
        col[i * 3 + 2] = 1
      } else {
        col[i * 3] = 0.5
        col[i * 3 + 1] = 0.6
        col[i * 3 + 2] = 0.7
      }
    }

    const lines: number[] = []
    const lcols: number[] = []
    const connectDist = radius * 0.6

    for (let i = 0; i < count; i++) {
      const ix = i * 3
      for (let j = i + 1; j < count; j++) {
        const jx = j * 3
        const dx = pos[ix] - pos[jx]
        const dy = pos[ix + 1] - pos[jx + 1]
        const dz = pos[ix + 2] - pos[jx + 2]
        if (dx * dx + dy * dy + dz * dz < connectDist * connectDist) {
          lines.push(pos[ix], pos[ix + 1], pos[ix + 2])
          lines.push(pos[jx], pos[jx + 1], pos[jx + 2])
          const c = ptBright[i] || ptBright[j] ? [0, 0.6, 1] : [0.3, 0.4, 0.6]
          lcols.push(c[0], c[1], c[2], c[0], c[1], c[2])
        }
      }
    }

    return {
      positions: pos,
      colors: col,
      linePositions: new Float32Array(lines),
      lineColors: new Float32Array(lcols),
    }
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
          <bufferAttribute attach="attributes-position" count={data.positions.length / 3} array={data.positions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={data.colors.length / 3} array={data.colors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.1} vertexColors transparent opacity={0.7} blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation />
      </points>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={data.linePositions.length / 3} array={data.linePositions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={data.lineColors.length / 3} array={data.lineColors} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial vertexColors transparent opacity={0.3} />
      </lineSegments>
    </group>
  )
}

export default function DottedGlobe() {
  return (
    <div className="absolute right-[-120px] top-1/2 -translate-y-1/2 w-[900px] h-[900px] pointer-events-none z-0 hidden lg:block" style={{ opacity: 0.4 }}>
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }} gl={{ antialias: true }}>
        <WireGlobe />
      </Canvas>
    </div>
  )
}
