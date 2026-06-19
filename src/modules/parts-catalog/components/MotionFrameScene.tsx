import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';

interface SceneProps {
  speed: number;
  distortion: number;
  glow: number;
  colorTheme: 'blue' | 'purple' | 'cyan';
  wireframe: boolean;
}

const THEME_COLORS = {
  blue: {
    primary: '#0D75FF',
    secondary: '#00E5FF',
    ambient: '#002244',
  },
  purple: {
    primary: '#7000FF',
    secondary: '#FF007A',
    ambient: '#220044',
  },
  cyan: {
    primary: '#00E5FF',
    secondary: '#00D97E',
    ambient: '#003333',
  },
};

function InteractiveFrame({ speed, distortion, glow, colorTheme, wireframe }: SceneProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const frameRef = useRef<THREE.Group>(null);
  const lightsRef = useRef<THREE.Group>(null);

  const colors = useMemo(() => THEME_COLORS[colorTheme], [colorTheme]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Rotate frame gently
    if (frameRef.current) {
      frameRef.current.rotation.y = time * 0.15 * speed;
      frameRef.current.rotation.x = Math.sin(time * 0.2) * 0.1;
    }

    // Rotate and deform the inner core mesh
    if (meshRef.current) {
      meshRef.current.rotation.y = -time * 0.25 * speed;
      meshRef.current.rotation.z = Math.cos(time * 0.15) * 0.2;
      
      // Simulating a dynamic noise/morphing effect using geometry modifications
      const geometry = meshRef.current.geometry as THREE.BufferGeometry;
      const position = geometry.attributes.position;
      
      if (position) {
        const speedFactor = time * speed * 2;
        // Accessing underlying array to morph vertices dynamically
        // Note: For custom shader-like effects in vanilla Three, we can distort using simple sine waves
        // For performance, we limit calculation to a neat morph scale
        const scale = 1 + Math.sin(speedFactor) * 0.08 * distortion;
        meshRef.current.scale.set(scale, scale, scale);
      }
    }

    // Orbiting lights inside/around
    if (lightsRef.current) {
      lightsRef.current.rotation.y = time * 0.8 * speed;
    }
  });

  return (
    <group>
      {/* 3D Motion Frame - Hollow metallic border with holographic neon glass panel */}
      <group ref={frameRef}>
        {/* Top border */}
        <mesh position={[0, 3, 0]}>
          <boxGeometry args={[6.4, 0.2, 0.2]} />
          <meshStandardMaterial
            color={colors.primary}
            emissive={colors.primary}
            emissiveIntensity={glow * 0.8}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
        {/* Bottom border */}
        <mesh position={[0, -3, 0]}>
          <boxGeometry args={[6.4, 0.2, 0.2]} />
          <meshStandardMaterial
            color={colors.primary}
            emissive={colors.primary}
            emissiveIntensity={glow * 0.8}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
        {/* Left border */}
        <mesh position={[-3.1, 0, 0]}>
          <boxGeometry args={[0.2, 6.2, 0.2]} />
          <meshStandardMaterial
            color={colors.primary}
            emissive={colors.primary}
            emissiveIntensity={glow * 0.8}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
        {/* Right border */}
        <mesh position={[3.1, 0, 0]}>
          <boxGeometry args={[0.2, 6.2, 0.2]} />
          <meshStandardMaterial
            color={colors.primary}
            emissive={colors.primary}
            emissiveIntensity={glow * 0.8}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* Frame Outer Corner Accents - Cyberpunk/Sci-fi aesthetic */}
        <group>
          {/* Top Left */}
          <mesh position={[-3.2, 3.1, 0]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.5, 0.15, 0.3]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={glow} />
          </mesh>
          {/* Top Right */}
          <mesh position={[3.2, 3.1, 0]} rotation={[0, 0, -Math.PI / 4]}>
            <boxGeometry args={[0.5, 0.15, 0.3]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={glow} />
          </mesh>
          {/* Bottom Left */}
          <mesh position={[-3.2, -3.1, 0]} rotation={[0, 0, -Math.PI / 4]}>
            <boxGeometry args={[0.5, 0.15, 0.3]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={glow} />
          </mesh>
          {/* Bottom Right */}
          <mesh position={[3.2, -3.1, 0]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.5, 0.15, 0.3]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={glow} />
          </mesh>
        </group>

        {/* Semi-transparent Glass backing with neon grids */}
        <mesh position={[0, 0, -0.1]}>
          <planeGeometry args={[6, 6]} />
          <meshPhysicalMaterial
            color={colors.ambient}
            transparent
            opacity={0.35}
            roughness={0.2}
            metalness={0.1}
            transmission={0.6}
            ior={1.5}
            thickness={1.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* Morphing Inner Sculpture (3D Core) representing the "3D Skill" */}
      <Float speed={1.5 * speed} rotationIntensity={0.8} floatIntensity={0.5}>
        <mesh ref={meshRef}>
          <torusKnotGeometry args={[1.2, 0.45, 150, 24, 3, 4]} />
          <meshPhysicalMaterial
            color={colors.primary}
            emissive={colors.secondary}
            emissiveIntensity={0.4}
            metalness={0.8}
            roughness={0.15}
            clearcoat={1.0}
            clearcoatRoughness={0.1}
            transmission={0.4}
            thickness={1.0}
            wireframe={wireframe}
          />
        </mesh>
      </Float>

      {/* Internal Rotating Lights */}
      <group ref={lightsRef}>
        <pointLight position={[3, 3, 2]} color={colors.primary} intensity={5} distance={15} />
        <pointLight position={[-3, -3, 2]} color={colors.secondary} intensity={5} distance={15} />
      </group>
    </group>
  );
}

export default function MotionFrameScene(props: SceneProps) {
  const colors = THEME_COLORS[props.colorTheme];

  return (
    <div className="w-full h-full min-h-[350px] relative rounded-2xl overflow-hidden border border-white/5 bg-[#030307]">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <directionalLight position={[-10, -10, 5]} intensity={0.8} color={colors.primary} />
        
        <InteractiveFrame {...props} />
        
        {/* Subtle grid base in the background */}
        <gridHelper
          args={[30, 30, '#11111e', '#07070f']}
          position={[0, -4, 0]}
          rotation={[0, 0, 0]}
        />
        
        <OrbitControls
          enableZoom={true}
          minDistance={4}
          maxDistance={15}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
          enableDamping
          dampingFactor={0.08}
        />
      </Canvas>

      {/* Dynamic Glow aura behind the frame */}
      <div 
        className="absolute inset-0 pointer-events-none transition-all duration-700 opacity-20 filter blur-[80px]"
        style={{
          background: `radial-gradient(circle, ${colors.primary}55 0%, transparent 70%)`
        }}
      />
    </div>
  );
}
