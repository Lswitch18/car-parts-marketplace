import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';

interface CarSceneProps {
  scrollProgress: number; // 0.0 to 1.0 based on scroll depth
  themeColor: 'purple' | 'cyan' | 'blue';
  telemetryMode: boolean;
  performanceMode: boolean;
}

const COLOR_MAP = {
  purple: {
    primary: '#7000FF',
    secondary: '#FF007A',
    ambient: '#ff0055',
    lights: '#7000FF'
  },
  cyan: {
    primary: '#00E5FF',
    secondary: '#00D97E',
    ambient: '#00ffff',
    lights: '#00D97E'
  },
  blue: {
    primary: '#0D75FF',
    secondary: '#00E5FF',
    ambient: '#0D75FF',
    lights: '#00E5FF'
  }
};

// Custom Shader for holographic scanning beam
const ScanShader = {
  vertexShader: `
    varying vec3 vPosition;
    varying vec2 vUv;
    void main() {
      vPosition = position;
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 color;
    uniform float time;
    varying vec3 vPosition;
    varying vec2 vUv;
    void main() {
      // Create moving horizontal scanlines
      float scanline = sin(vPosition.y * 20.0 + time * 6.0) * 0.5 + 0.5;
      float glow = exp(-pow(vPosition.y - sin(time) * 1.5, 2.0) * 8.0); // Moving beam
      
      vec3 finalColor = color * (0.3 + scanline * 0.3 + glow * 0.8);
      float alpha = 0.25 + glow * 0.5;
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `
};

export default function ImmersiveCarScene({ scrollProgress, themeColor, telemetryMode, performanceMode }: CarSceneProps) {
  const carRef = useRef<THREE.Group>(null);
  const hoodRef = useRef<THREE.Group>(null);
  const exhaustParticlesRef = useRef<THREE.Points>(null);
  const scanBeamRef = useRef<THREE.Mesh>(null);

  const colors = useMemo(() => COLOR_MAP[themeColor], [themeColor]);

  // Pre-compiled arrays for fast particles (simulating Redis pre-cache telemetry)
  const particleCount = performanceMode ? 150 : 600;
  const particleData = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      // Spreads particles around the car
      positions[i * 3] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 14;
      speeds[i] = 0.2 + Math.random() * 0.8;
    }
    return { positions, speeds };
  }, [particleCount]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // 1. Camera path interpolation based on scroll depth (Cinematic Active Theory style)
    const { camera } = state;
    
    // Define camera coordinates at key scroll checkpoints
    let targetCam = new THREE.Vector3();
    let targetLookAt = new THREE.Vector3(0, 0.5, 0);

    if (scrollProgress < 0.25) {
      // Section 1: Front perspective view of the car
      const t = scrollProgress / 0.25;
      targetCam.set(
        THREE.MathUtils.lerp(6.5, 1.5, t),
        THREE.MathUtils.lerp(1.8, 3.5, t),
        THREE.MathUtils.lerp(6.5, 4.5, t)
      );
      targetLookAt.set(0, 0.2, 0);
    } else if (scrollProgress < 0.6) {
      // Section 2: Moving top-down looking straight at the opening hood
      const t = (scrollProgress - 0.25) / 0.35;
      targetCam.set(
        THREE.MathUtils.lerp(1.5, -0.2, t),
        THREE.MathUtils.lerp(3.5, 4.2, t),
        THREE.MathUtils.lerp(4.5, 2.5, t)
      );
      targetLookAt.set(0, 0.4, 0.8);
    } else if (scrollProgress < 0.85) {
      // Section 3: Super zoom into the mechanical engine & turbo details
      const t = (scrollProgress - 0.6) / 0.25;
      targetCam.set(
        THREE.MathUtils.lerp(-0.2, -1.8, t),
        THREE.MathUtils.lerp(4.2, 2.0, t),
        THREE.MathUtils.lerp(2.5, 1.8, t)
      );
      targetLookAt.set(0, 0.5, 1.2);
    } else {
      // Section 4: Deep inspection sweep to the rear wheels and chassis
      const t = (scrollProgress - 0.85) / 0.15;
      targetCam.set(
        THREE.MathUtils.lerp(-1.8, -4.5, t),
        THREE.MathUtils.lerp(2.0, 1.5, t),
        THREE.MathUtils.lerp(1.8, -4.5, t)
      );
      targetLookAt.set(0, 0.2, -1.0);
    }

    // Smooth camera lerp
    camera.position.lerp(targetCam, 0.06);
    
    // Create a target matrix to look at smoothly
    const lookTarget = new THREE.Vector3();
    lookTarget.copy(targetLookAt);
    
    // In R3F, we can manually look at the lerped target lookAt coordinate
    const currentLook = new THREE.Vector3(0, 0, 0);
    currentLook.lerp(lookTarget, 0.06);
    camera.lookAt(currentLook);

    // 2. Animate elements based on scroll and time
    if (carRef.current) {
      // Slight floating/physics bounce
      carRef.current.position.y = Math.sin(time * 1.5) * 0.05;
      
      // Gentle chassis rotation based on scroll for extra 3D depth
      carRef.current.rotation.y = THREE.MathUtils.lerp(0, -Math.PI / 6, scrollProgress);
    }

    // 3. Smooth Hood (Capô) opening animation based on scroll progress
    if (hoodRef.current) {
      // Opens only between 20% and 60% scroll progress
      let openFactor = 0;
      if (scrollProgress > 0.2 && scrollProgress < 0.7) {
        openFactor = (scrollProgress - 0.2) / 0.5; // normalized 0 to 1
      } else if (scrollProgress >= 0.7) {
        openFactor = 1.0;
      }
      
      // Smoothly rotate the hood on X-axis (front hinge)
      const targetAngle = -openFactor * (Math.PI / 2.3); // Rotate open upwards
      hoodRef.current.rotation.x = THREE.MathUtils.lerp(hoodRef.current.rotation.x, targetAngle, 0.1);
    }

    // 4. Exhaust pipe particles simulation
    if (exhaustParticlesRef.current) {
      const geo = exhaustParticlesRef.current.geometry as THREE.BufferGeometry;
      const positions = geo.attributes.position.array as Float32Array;
      const speedMultiplier = 1.0 + scrollProgress * 2.0;

      for (let i = 0; i < particleCount; i++) {
        // Exhaust emitter at rear right [-0.8, 0.2, -2.4]
        const idx = i * 3;
        positions[idx + 2] -= particleData.speeds[i] * 0.1 * speedMultiplier; // Move back
        positions[idx + 0] += (Math.random() - 0.5) * 0.03; // Disperse X
        positions[idx + 1] += (Math.random() - 0.5) * 0.03 + 0.01; // Rise Y

        // Reset if too far
        if (positions[idx + 2] < -8.0) {
          positions[idx] = -0.6 + (Math.random() - 0.5) * 0.1;
          positions[idx + 1] = 0.15;
          positions[idx + 2] = -2.2;
        }
      }
      geo.attributes.position.needsUpdate = true;
    }

    // 5. Update Hologram Scan Shader uniforms
    if (scanBeamRef.current) {
      const mat = scanBeamRef.current.material as THREE.ShaderMaterial;
      if (mat.uniforms) {
        mat.uniforms.time.value = time;
      }
    }
  });

  return (
    <group>
      {/* Cinematic Lighting System */}
      <ambientLight intensity={0.25} />
      
      {/* Dynamic spotlights highlighting current inspect zones */}
      <spotLight 
        position={[2, 8, 5]} 
        intensity={6} 
        angle={0.6} 
        penumbra={0.8} 
        color={colors.primary} 
        castShadow
      />
      <spotLight 
        position={[-3, 6, -3]} 
        intensity={4} 
        angle={0.5} 
        penumbra={0.5} 
        color={colors.secondary} 
      />
      
      {/* Custom Holographic Scan Beam (Only visible in Telemetry mode) */}
      {telemetryMode && (
        <mesh ref={scanBeamRef} position={[0, 0.5, 0]}>
          <boxGeometry args={[4.2, 3.0, 7.8]} />
          <shaderMaterial
            vertexShader={ScanShader.vertexShader}
            fragmentShader={ScanShader.fragmentShader}
            transparent
            blending={THREE.AdditiveBlending}
            uniforms={{
              color: { value: new THREE.Color(colors.primary) },
              time: { value: 0 }
            }}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Main JDM Vehicle Group */}
      <group ref={carRef} position={[0, 0, 0]}>
        
        {/* 1. MAIN CHASSIS (Procedural Streamlined Body Panels) */}
        <group>
          {/* Main Core Body */}
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[2.0, 0.6, 5.0]} />
            <meshPhysicalMaterial 
              color="#0d0d15" 
              metalness={0.9} 
              roughness={0.08}
              clearcoat={1.0}
              clearcoatRoughness={0.05}
            />
          </mesh>

          {/* Sleek Roof & Cabin (Glassmorphism design) */}
          <mesh position={[0, 0.9, -0.4]}>
            <boxGeometry args={[1.7, 0.5, 2.2]} />
            <meshPhysicalMaterial 
              color="#020208" 
              transparent 
              opacity={0.7} 
              roughness={0.1}
              metalness={0.5}
              transmission={0.8}
              ior={1.5}
            />
          </mesh>

          {/* Front Bumper & Low Splitter */}
          <mesh position={[0, 0.15, 2.55]}>
            <boxGeometry args={[2.05, 0.25, 0.4]} />
            <meshStandardMaterial color="#08080c" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Neon Splitter Line */}
          <mesh position={[0, 0.05, 2.65]}>
            <boxGeometry args={[2.1, 0.05, 0.1]} />
            <meshStandardMaterial color={colors.primary} emissive={colors.primary} emissiveIntensity={3} />
          </mesh>

          {/* High Rear GT Wing / Spoiler */}
          <group position={[0, 0.95, -2.4]}>
            {/* Wing Blade */}
            <mesh position={[0, 0.25, 0]}>
              <boxGeometry args={[2.2, 0.05, 0.5]} />
              <meshStandardMaterial color="#050508" metalness={0.95} roughness={0.05} />
            </mesh>
            {/* Left Support */}
            <mesh position={[-0.95, 0.1, 0]}>
              <boxGeometry args={[0.05, 0.3, 0.1]} />
              <meshStandardMaterial color="#111115" metalness={0.9} />
            </mesh>
            {/* Right Support */}
            <mesh position={[0.95, 0.1, 0]}>
              <boxGeometry args={[0.05, 0.3, 0.1]} />
              <meshStandardMaterial color="#111115" metalness={0.9} />
            </mesh>
          </group>
        </group>

        {/* 2. ROTATING HOOD PANEL (Capô articulado) */}
        {/* Set pivot point at the rear base of the hood */}
        <group ref={hoodRef} position={[0, 0.72, 0.7]}>
          <mesh position={[0, -0.01, 0.85]}>
            <boxGeometry args={[1.96, 0.06, 1.8]} />
            <meshPhysicalMaterial 
              color="#07070a" 
              roughness={0.3} 
              metalness={0.9} 
              clearcoat={0.8}
            />
          </mesh>
          {/* Carbon Fiber Graphic center stripe */}
          <mesh position={[0, 0.03, 0.85]}>
            <boxGeometry args={[0.6, 0.01, 1.82]} />
            <meshStandardMaterial color="#151515" roughness={0.5} metalness={0.2} wireframe={performanceMode} />
          </mesh>
        </group>

        {/* 3. MECHANICAL ENGINE COMPONENT (Revelado ao abrir o capô) */}
        <group position={[0, 0.45, 1.45]}>
          {/* Engine Block Base */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.2, 0.4, 1.3]} />
            <meshStandardMaterial color="#2d3033" metalness={0.8} roughness={0.4} />
          </mesh>

          {/* Glowing Neon Valve Cover Cylinders */}
          <mesh position={[0.15, 0.22, 0]}>
            <boxGeometry args={[0.4, 0.12, 1.0]} />
            <meshStandardMaterial 
              color={colors.primary} 
              emissive={colors.primary} 
              emissiveIntensity={1.5} 
            />
          </mesh>
          <mesh position={[-0.15, 0.22, 0]}>
            <boxGeometry args={[0.4, 0.12, 1.0]} />
            <meshStandardMaterial 
              color={colors.secondary} 
              emissive={colors.secondary} 
              emissiveIntensity={1.5} 
            />
          </mesh>

          {/* Heavy Duty TWIN SCROLL TURBOCHARGER (Cyan Glow) */}
          <group position={[0.45, 0.15, 0.3]}>
            {/* Turbo Housing (Snail shape) */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <torusGeometry args={[0.22, 0.1, 12, 24]} />
              <meshStandardMaterial color="#88888a" metalness={0.95} roughness={0.15} />
            </mesh>
            {/* Glowing Intake Compressor Wheel inside */}
            <mesh position={[0, 0, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.15, 0.15, 0.05, 12]} />
              <meshStandardMaterial 
                color="#00ffff" 
                emissive="#00E5FF" 
                emissiveIntensity={3.0} 
              />
            </mesh>
          </group>

          {/* Cooling Intercooler Radiator Pipes (Aero front) */}
          <mesh position={[0, 0.08, 0.72]}>
            <boxGeometry args={[1.3, 0.35, 0.15]} />
            <meshStandardMaterial color="#1a1c1e" metalness={0.7} roughness={0.6} />
          </mesh>
        </group>

        {/* 4. SUSPENSION & GLOWING WHEELS */}
        <group>
          {/* Front Wheels Axis */}
          <group>
            {/* Front Left */}
            <mesh position={[-1.02, 0.15, 1.6]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.5, 0.5, 0.4, 24]} />
              <meshStandardMaterial color="#121215" roughness={0.6} />
            </mesh>
            {/* Rim Accent */}
            <mesh position={[-1.23, 0.15, 1.6]} rotation={[0, 0, Math.PI / 2]}>
              <torusGeometry args={[0.3, 0.06, 8, 16]} />
              <meshStandardMaterial color={colors.primary} emissive={colors.primary} emissiveIntensity={2} />
            </mesh>

            {/* Front Right */}
            <mesh position={[1.02, 0.15, 1.6]} rotation={[0, 0, -Math.PI / 2]}>
              <cylinderGeometry args={[0.5, 0.5, 0.4, 24]} />
              <meshStandardMaterial color="#121215" roughness={0.6} />
            </mesh>
            {/* Rim Accent */}
            <mesh position={[1.23, 0.15, 1.6]} rotation={[0, 0, -Math.PI / 2]}>
              <torusGeometry args={[0.3, 0.06, 8, 16]} />
              <meshStandardMaterial color={colors.primary} emissive={colors.primary} emissiveIntensity={2} />
            </mesh>
          </group>

          {/* Rear Wheels Axis */}
          <group>
            {/* Rear Left */}
            <mesh position={[-1.02, 0.15, -1.6]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.52, 0.52, 0.46, 24]} />
              <meshStandardMaterial color="#121215" roughness={0.6} />
            </mesh>
            {/* Rim Accent */}
            <mesh position={[-1.26, 0.15, -1.6]} rotation={[0, 0, Math.PI / 2]}>
              <torusGeometry args={[0.32, 0.06, 8, 16]} />
              <meshStandardMaterial color={colors.secondary} emissive={colors.secondary} emissiveIntensity={2} />
            </mesh>

            {/* Rear Right */}
            <mesh position={[1.02, 0.15, -1.6]} rotation={[0, 0, -Math.PI / 2]}>
              <cylinderGeometry args={[0.52, 0.52, 0.46, 24]} />
              <meshStandardMaterial color="#121215" roughness={0.6} />
            </mesh>
            {/* Rim Accent */}
            <mesh position={[1.26, 0.15, -1.6]} rotation={[0, 0, -Math.PI / 2]}>
              <torusGeometry args={[0.32, 0.06, 8, 16]} />
              <meshStandardMaterial color={colors.secondary} emissive={colors.secondary} emissiveIntensity={2} />
            </mesh>
          </group>
        </group>
      </group>

      {/* 5. ACTIVE THEORY EXHAUST & CYBER FLOATING PARTICLES */}
      <points ref={exhaustParticlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={particleData.positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={performanceMode ? 0.08 : 0.12}
          color={colors.secondary}
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Ambient glowing stardust particle field */}
      <Sparkles
        count={performanceMode ? 60 : 250}
        scale={[18, 8, 18]}
        size={2.5}
        speed={0.4}
        color={colors.primary}
        opacity={0.4}
      />
    </group>
  );
}
