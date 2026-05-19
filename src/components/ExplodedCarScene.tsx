import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { OBJLoader } from 'three-stdlib';
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

  // Load the OBJ file from the public directory
  const obj = useLoader(OBJLoader, '/engineering_car_exploded.obj');

  // Clone the OBJ to avoid mutating shared cache
  const clonedObj = useMemo(() => {
    const cloned = obj.clone();
    
    // Scale and center the model
    cloned.scale.set(0.6, 0.6, 0.6);
    
    // Compute bounding box to center it
    const box = new THREE.Box3().setFromObject(cloned);
    const center = new THREE.Vector3();
    box.getCenter(center);
    cloned.position.sub(center);
    cloned.position.y += 0.5; // Offset upwards slightly
    
    return cloned;
  }, [obj]);

  // Store original positions of each child mesh for precise explosion displacement
  const originalPositions = useMemo(() => {
    const positions: { [key: string]: THREE.Vector3 } = {};
    clonedObj.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        positions[child.name] = child.position.clone();
      }
    });
    return positions;
  }, [clonedObj]);

  // Dynamically update materials and wireframe based on theme changes
  useEffect(() => {
    clonedObj.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        let material: THREE.Material;

        // Custom cyber-materials depending on the specific car component name
        if (child.name.includes('chassis_frame')) {
          material = new THREE.MeshPhysicalMaterial({
            color: '#07070c',
            metalness: 0.95,
            roughness: 0.1,
            clearcoat: 1.0,
            clearcoatRoughness: 0.05,
            wireframe: wireframe,
          });
        } else if (child.name.includes('engine_block')) {
          material = new THREE.MeshPhysicalMaterial({
            color: colors.primary,
            emissive: colors.primary,
            emissiveIntensity: 1.2,
            metalness: 0.8,
            roughness: 0.15,
            clearcoat: 0.8,
            wireframe: wireframe,
          });
        } else if (child.name.includes('intake') || child.name.includes('gearbox') || child.name.includes('driveshaft')) {
          material = new THREE.MeshStandardMaterial({
            color: '#d0d3d4',
            metalness: 0.9,
            roughness: 0.1,
            wireframe: wireframe,
          });
        } else if (child.name.includes('suspension')) {
          material = new THREE.MeshStandardMaterial({
            color: colors.secondary,
            emissive: colors.secondary,
            emissiveIntensity: 0.6,
            metalness: 0.95,
            roughness: 0.15,
            wireframe: wireframe,
          });
        } else if (child.name.includes('hood') || child.name.includes('roof') || child.name.includes('rear_panel')) {
          material = new THREE.MeshPhysicalMaterial({
            color: '#0a0a0f',
            metalness: 0.9,
            roughness: 0.08,
            clearcoat: 1.0,
            clearcoatRoughness: 0.05,
            wireframe: wireframe,
          });
        } else if (child.name.includes('radiator')) {
          material = new THREE.MeshStandardMaterial({
            color: colors.primary,
            emissive: colors.primary,
            emissiveIntensity: 0.4,
            metalness: 0.7,
            roughness: 0.4,
            wireframe: wireframe,
          });
        } else {
          material = new THREE.MeshStandardMaterial({
            color: '#1a1c1e',
            metalness: 0.8,
            roughness: 0.2,
            wireframe: wireframe,
          });
        }

        child.material = material;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [clonedObj, colors, wireframe]);

  // Frame loop for camera, offsets, and rotations
  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Telemetry values driven by active interaction mode
    let activeExplosion = explosionFactor;
    let activeRotationY = 0;
    let activeScale = 0.6;
    let activePositionY = 0.5;

    if (interactiveMode === 'scroll') {
      // 1. SCROLL MODE LERP VALUES
      // Starts fully assembled at 0% scroll, begins to disassemble past 20% scroll
      if (scrollPercent < 0.2) {
        activeExplosion = 0.0;
      } else if (scrollPercent > 0.85) {
        activeExplosion = 1.0;
      } else {
        // Linearly map 0.2 to 0.85 scroll -> 0.0 to 1.0 explosionFactor
        activeExplosion = (scrollPercent - 0.2) / 0.65;
      }

      // 2. Camera zoom-in & scale changes
      // Starts smaller/farther at 0.42, scales up to 0.75 as we scroll down
      activeScale = 0.42 + scrollPercent * 0.33;

      // 3. Rotation Y: starts perfectly horizontal (facing side), spins dynamically
      // Starts at -Math.PI / 2 (90 deg side view) and rotates through ~360 deg
      activeRotationY = -Math.PI / 2.0 + scrollPercent * Math.PI * 2.2;
      
      // Floating motion is gentler in scroll mode to avoid interference with viewport alignment
      activePositionY = 0.35 + Math.sin(time * 1.2) * 0.06;
    } else {
      // SANDBOX MODE LERP VALUES
      activeExplosion = explosionFactor;
      activeScale = 0.6;
      if (autoRotate) {
        activeRotationY = time * 0.18;
      } else {
        activeRotationY = groupRef.current ? groupRef.current.rotation.y : 0;
      }
      activePositionY = 0.5 + Math.sin(time * 1.5) * 0.08;
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

    // Apply the exploded offsets to each submesh smoothly based on activeExplosion
    clonedObj.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        const orig = originalPositions[child.name] || new THREE.Vector3();
        const target = orig.clone();

        // Multi-stage explosion coordinates to give maximum JDM engineering value
        if (child.name.includes('engine_block')) {
          target.add(new THREE.Vector3(0, 1.6 * activeExplosion, 1.2 * activeExplosion));
        } else if (child.name.includes('intake')) {
          target.add(new THREE.Vector3(0, 2.5 * activeExplosion, 1.5 * activeExplosion));
        } else if (child.name.includes('radiator')) {
          target.add(new THREE.Vector3(0, 1.0 * activeExplosion, 2.8 * activeExplosion));
        } else if (child.name.includes('gearbox')) {
          target.add(new THREE.Vector3(0, -1.2 * activeExplosion, 0.6 * activeExplosion));
        } else if (child.name.includes('driveshaft')) {
          target.add(new THREE.Vector3(0, -1.0 * activeExplosion, -1.8 * activeExplosion));
        } else if (child.name.includes('suspension')) {
          // Suspensions float further outward on X axis
          let xOffset = child.name.includes('left') ? -2.4 : 2.4;
          target.add(new THREE.Vector3(xOffset * activeExplosion, 0, 0));
        } else if (child.name.includes('hood')) {
          target.add(new THREE.Vector3(0, 2.8 * activeExplosion, 2.0 * activeExplosion));
          // Rotate open beautifully as it disassembles
          child.rotation.x = -activeExplosion * (Math.PI / 6);
        } else if (child.name.includes('roof')) {
          target.add(new THREE.Vector3(0, 3.2 * activeExplosion, -0.8 * activeExplosion));
        } else if (child.name.includes('rear_panel')) {
          target.add(new THREE.Vector3(0, -0.6 * activeExplosion, -3.0 * activeExplosion));
        }

        // Smooth position transition
        child.position.lerp(target, 0.08);
      }
    });
  });

  return (
    <group ref={groupRef}>
      <primitive object={clonedObj} />
    </group>
  );
}
