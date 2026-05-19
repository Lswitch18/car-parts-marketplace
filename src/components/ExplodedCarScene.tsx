import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface ExplodedCarSceneProps {
  explosionFactor: number; // 0.0 to 1.0 (0 = assembled, 1 = exploded)
  colorTheme: 'purple' | 'cyan' | 'blue';
  wireframe: boolean;
  autoRotate: boolean;
  scrollPercent: number; // 0.0 to 1.0 based on screen scroll
  interactiveMode: 'scroll' | 'sandbox';
}

const THEME_COLORS = {
  purple: {
    primary: '#7000FF',
    secondary: '#FF007A',
    ambient: '#ff0055',
  },
  cyan: {
    primary: '#00E5FF',
    secondary: '#00D97E',
    ambient: '#00ffff',
  },
  blue: {
    primary: '#0D75FF',
    secondary: '#00E5FF',
    ambient: '#0D75FF',
  },
};

export default function ExplodedCarScene({
  explosionFactor,
  colorTheme,
  wireframe,
  autoRotate,
  scrollPercent,
  interactiveMode,
}: ExplodedCarSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const colors = useMemo(() => THEME_COLORS[colorTheme], [colorTheme]);

  // Load the high-fidelity photorealistic GLB scan
  const { scene } = useGLTF('/car_engine_scan.glb');

  // Clone the scene to avoid mutating shared cache
  const clonedScene = useMemo(() => {
    const cloned = scene.clone();
    
    // Compute bounding box to center and scale it perfectly in the 3D viewport
    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    
    // Scale it to a normalized target dimension of 3.5 units
    const scaleFactor = 3.5 / maxDim;
    cloned.scale.set(scaleFactor, scaleFactor, scaleFactor);
    
    // Recompute box with new scale and subtract center to center it
    const scaledBox = new THREE.Box3().setFromObject(cloned);
    const center = new THREE.Vector3();
    scaledBox.getCenter(center);
    cloned.position.sub(center);
    
    // Shift slightly upwards to float over the grid
    cloned.position.y += 0.4;
    
    return cloned;
  }, [scene]);

  // Store original positions of each child mesh for organic explosion displacement
  const originalPositions = useMemo(() => {
    const positions: { [key: string]: THREE.Vector3 } = {};
    clonedScene.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        positions[child.name] = child.position.clone();
      }
    });
    return positions;
  }, [clonedScene]);

  // Handle wireframe toggle and neon material overrides
  useEffect(() => {
    clonedScene.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        if (wireframe) {
          // Glow-in-the-dark wireframe cyber aesthetic
          child.material = new THREE.MeshBasicMaterial({
            color: colors.primary,
            wireframe: true,
            transparent: true,
            opacity: 0.65,
          });
        } else {
          // Restore original photorealistic materials from GLTF, but make them extra premium with modern specular parameters
          const origMat = child.material as any;
          if (origMat) {
            origMat.roughness = Math.min(origMat.roughness || 0.5, 0.4);
            origMat.metalness = Math.max(origMat.metalness || 0.0, 0.35);
            
            // Inject subtle neon cyber glow reflections if present in scan
            if (origMat.emissive) {
              origMat.emissive.set(colors.primary);
              origMat.emissiveIntensity = 0.15;
            }
          }
        }
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [clonedScene, colors, wireframe]);

  // Frame loop for camera, offsets, and rotations
  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Telemetry values driven by active interaction mode
    let activeExplosion = explosionFactor;
    let activeRotationY = 0;
    let activeScale = 1.0;
    let activePositionY = 0.0;

    if (interactiveMode === 'scroll') {
      // 1. SCROLL MODE LERP VALUES
      // Starts fully assembled at 0% scroll, begins to disassemble past 15% scroll
      if (scrollPercent < 0.15) {
        activeExplosion = 0.0;
      } else if (scrollPercent > 0.85) {
        activeExplosion = 1.0;
      } else {
        // Linearly map 0.15 to 0.85 scroll -> 0.0 to 1.0 explosionFactor
        activeExplosion = (scrollPercent - 0.15) / 0.70;
      }

      // 2. Camera zoom-in & scale changes
      // Starts smaller/farther, scales up as we scroll down
      activeScale = 0.85 + scrollPercent * 0.45;

      // 3. Rotation Y: starts perfectly horizontal (facing side), spins dynamically
      activeRotationY = -Math.PI / 2.0 + scrollPercent * Math.PI * 2.2;
      
      // Floating motion is gentler in scroll mode to avoid interference with viewport alignment
      activePositionY = Math.sin(time * 1.2) * 0.06;
    } else {
      // SANDBOX MODE LERP VALUES
      activeExplosion = explosionFactor;
      activeScale = 1.0;
      if (autoRotate) {
        activeRotationY = time * 0.18;
      } else {
        activeRotationY = groupRef.current ? groupRef.current.rotation.y : 0;
      }
      activePositionY = Math.sin(time * 1.5) * 0.08;
    }

    // Smoothly apply parameters to main group
    if (groupRef.current) {
      groupRef.current.scale.lerp(new THREE.Vector3(activeScale, activeScale, activeScale), 0.08);
      
      if (interactiveMode === 'scroll') {
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, activeRotationY, 0.08);
      } else if (autoRotate) {
        groupRef.current.rotation.y = activeRotationY;
      }
      
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, activePositionY, 0.08);
    }

    // Apply the exploded offsets to each submesh segment organically
    clonedScene.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        const orig = originalPositions[child.name] || new THREE.Vector3();
        const target = orig.clone();

        // Explode the scanned engine parts organically outwards depending on mesh names
        // Sketchfab scanned meshes typically consist of multiple Object_X components
        if (child.name.includes('Object_2')) {
          target.add(new THREE.Vector3(0, 0.9 * activeExplosion, 0.5 * activeExplosion));
        } else if (child.name.includes('Object_3')) {
          target.add(new THREE.Vector3(0.6 * activeExplosion, -0.7 * activeExplosion, 0.3 * activeExplosion));
        } else if (child.name.includes('Object_4')) {
          target.add(new THREE.Vector3(-0.6 * activeExplosion, 0.7 * activeExplosion, -0.5 * activeExplosion));
        } else if (child.name.includes('Object_5')) {
          target.add(new THREE.Vector3(0, -0.9 * activeExplosion, -0.7 * activeExplosion));
        } else if (child.name.includes('Object_6')) {
          target.add(new THREE.Vector3(0.7 * activeExplosion, 0, 0.6 * activeExplosion));
        }

        // Smooth position transition
        child.position.lerp(target, 0.08);
      }
    });
  });

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} />
    </group>
  );
}

useGLTF.preload('/car_engine_scan.glb');
