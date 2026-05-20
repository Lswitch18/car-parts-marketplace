import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// ── Available 3D Models Catalog ──────────────────────────────────────
export const MODEL_CATALOG = [
  {
    id: 'engine_scan',
    name: 'Motor JDM Scan',
    path: '/car_engine_scan.glb',
    description: 'Scan fotorrealístico de motor automotivo completo',
    category: 'Motor',
    size: '30 MB',
    icon: '🔧',
  },
  {
    id: 'toy_car',
    name: 'Carro Engenharia (KhronosGroup)',
    path: '/toy_car.glb',
    description: 'Modelo de referência oficial glTF — carro com pintura metálica PBR',
    category: 'Carro Completo',
    size: '5.2 MB',
    icon: '🚗',
  },
  {
    id: 'lamborghini',
    name: 'Lamborghini Aventador',
    path: '/lamborghini_aventador.glb',
    description: 'Supercar italiano com geometria detalhada',
    category: 'Supercar',
    size: '1.9 MB',
    icon: '🏎️',
  },
  {
    id: 'car_generic',
    name: 'Carro Low-Poly',
    path: '/car_model.glb',
    description: 'Modelo leve ideal para carregamento rápido',
    category: 'Low-Poly',
    size: '424 KB',
    icon: '🚙',
  },
  {
    id: 'wheel_hydraulics',
    name: 'Roda + Sistema Hidráulico',
    path: '/wheel_hydraulics.glb',
    description: 'Engenharia de suspensão e roda com hidráulica',
    category: 'Suspensão',
    size: '7.5 MB',
    icon: '⚙️',
  },
  {
    id: 'carbon_bike',
    name: 'Bike Fibra de Carbono',
    path: '/carbon_frame_bike.glb',
    description: 'Bicicleta de engenharia — quadro de fibra de carbono com PBR',
    category: 'Engenharia',
    size: '3.3 MB',
    icon: '🚲',
  },
];

interface ExplodedCarSceneProps {
  explosionFactor: number; // 0.0 to 1.0 (0 = assembled, 1 = exploded)
  colorTheme: 'purple' | 'cyan' | 'blue';
  wireframe: boolean;
  autoRotate: boolean;
  scrollPercent: number; // 0.0 to 1.0 based on screen scroll
  interactiveMode: 'scroll' | 'sandbox';
  modelPath?: string; // path to GLB model (defaults to car_engine_scan.glb)
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
  modelPath = '/car_engine_scan.glb',
}: ExplodedCarSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const colors = useMemo(() => THEME_COLORS[colorTheme], [colorTheme]);
  const [modelReady, setModelReady] = useState(false);

  // Load the GLB model dynamically
  const { scene } = useGLTF(modelPath);

  // Clone the scene to avoid mutating shared cache
  const clonedScene = useMemo(() => {
    const cloned = scene.clone();
    
    // Compute bounding box to center and scale it perfectly in the 3D viewport
    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    
    // Scale it to a normalized target dimension of 3.5 units
    const scaleFactor = maxDim > 0 ? 3.5 / maxDim : 1;
    cloned.scale.set(scaleFactor, scaleFactor, scaleFactor);
    
    // Recompute box with new scale and subtract center to center it
    const scaledBox = new THREE.Box3().setFromObject(cloned);
    const center = new THREE.Vector3();
    scaledBox.getCenter(center);
    cloned.position.sub(center);
    
    // Shift slightly upwards to float over the grid
    cloned.position.y += 0.4;

    setModelReady(true);
    
    return cloned;
  }, [scene]);

  // Store original positions of each child mesh for organic explosion displacement
  const originalPositions = useMemo(() => {
    const positions: { [key: string]: THREE.Vector3 } = {};
    clonedScene.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        positions[child.uuid] = child.position.clone();
      }
    });
    return positions;
  }, [clonedScene]);

  // Compute deterministic explosion directions for every mesh based on its position
  const explosionDirections = useMemo(() => {
    const dirs: { [key: string]: THREE.Vector3 } = {};
    const sceneBBox = new THREE.Box3().setFromObject(clonedScene);
    const sceneCenter = new THREE.Vector3();
    sceneBBox.getCenter(sceneCenter);

    let meshIndex = 0;
    clonedScene.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        // Calculate direction from center of scene to center of mesh
        const meshBox = new THREE.Box3().setFromObject(child);
        const meshCenter = new THREE.Vector3();
        meshBox.getCenter(meshCenter);
        
        const dir = meshCenter.clone().sub(sceneCenter);
        
        // If direction is zero (mesh is at center), use a pseudo-random direction
        if (dir.length() < 0.001) {
          const angle = (meshIndex * 137.508) * (Math.PI / 180); // golden angle
          dir.set(Math.cos(angle), 0.5 * Math.sin(meshIndex * 0.7), Math.sin(angle));
        }
        
        dir.normalize();
        
        // Scale the explosion distance — farther meshes go farther
        const dist = meshCenter.distanceTo(sceneCenter);
        const explosionMagnitude = 0.8 + dist * 0.5 + meshIndex * 0.05;
        dir.multiplyScalar(explosionMagnitude);
        
        dirs[child.uuid] = dir;
        meshIndex++;
      }
    });
    return dirs;
  }, [clonedScene]);

  // Handle wireframe toggle and restore original materials
  useEffect(() => {
    if (!modelReady) return;

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
          // Restore original photorealistic materials completely untouched from original GLTF
          const originalMesh = scene.getObjectByName(child.name) as THREE.Mesh;
          if (originalMesh) {
            child.material = originalMesh.material;
          }
        }
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [clonedScene, scene, colors, wireframe, modelReady]);

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
        const orig = originalPositions[child.uuid] || new THREE.Vector3();
        const dir = explosionDirections[child.uuid];
        
        if (dir) {
          const target = orig.clone().add(dir.clone().multiplyScalar(activeExplosion));
          // Smooth position transition
          child.position.lerp(target, 0.08);
        }
      }
    });
  });

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} />
    </group>
  );
}

// Preload default model
useGLTF.preload('/car_engine_scan.glb');
