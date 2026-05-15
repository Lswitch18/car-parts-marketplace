import { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import { Canvas, ThreeEvent } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface Zone {
  id: string;
  nome: string;
  tipo: string;
  capacidade: number;
  ocupacao: number;
  pos_x?: number;
  pos_y?: number;
  tipo_visual?: string;
}

interface ArmazemData {
  largura_m: number;
  comprimento_m: number;
  altura_m: number;
  racks_linhas: number;
  racks_colunas: number;
  nome: string;
}

function getOccupancyColor(pct: number): THREE.Color {
  if (pct > 80) return new THREE.Color('#EF4444');
  if (pct > 60) return new THREE.Color('#FACC15');
  if (pct > 30) return new THREE.Color('#22C55E');
  return new THREE.Color('#166534');
}

const rackMat4 = new THREE.Matrix4();
const tempColor = new THREE.Color();

function RackGrid({
  zonas,
  armazem,
  onZoneClick,
  hoveredId,
  setHoveredId,
}: {
  zonas: Zone[];
  armazem: ArmazemData;
  onZoneClick: (z: Zone) => void;
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const { positions, rackData } = useMemo(() => {
    const spacingX = armazem.largura_m / Math.max(armazem.racks_colunas, 1);
    const spacingZ = armazem.comprimento_m / (Math.max(armazem.racks_linhas, 1) + 1);
    const offsetX = -armazem.largura_m / 2 + spacingX / 2;
    const offsetZ = -armazem.comprimento_m / 2 + spacingZ;

    const poss: THREE.Vector3[] = [];
    const data: { zone: Zone; index: number; color: THREE.Color }[] = [];

    zonas.forEach((zone, i) => {
      const px = zone.pos_x ?? (i % armazem.racks_colunas);
      const py = zone.pos_y ?? Math.floor(i / armazem.racks_colunas);
      if (py >= armazem.racks_linhas) return;

      const x = offsetX + px * spacingX;
      const zPos = offsetZ + py * spacingZ;
      const pct = zone.capacidade > 0 ? (zone.ocupacao / zone.capacidade) * 100 : 0;

      poss.push(new THREE.Vector3(x, 0, zPos));
      data.push({ zone, index: i, color: getOccupancyColor(pct) });
    });

    return { positions: poss, rackData: data };
  }, [zonas, armazem]);

  useEffect(() => {
    if (!meshRef.current || rackData.length === 0) return;
    const mesh = meshRef.current;
    rackData.forEach((d, i) => {
      const pos = positions[i];
      if (!pos) return;
      rackMat4.identity();
      rackMat4.makeScale(1.2, 3, 1.2);
      rackMat4.setPosition(pos.x, 1.5, pos.z);
      mesh.setMatrixAt(i, rackMat4);
      tempColor.copy(d.color);
      mesh.setColorAt(i, tempColor);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [rackData, positions]);

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      if (e.instanceId !== undefined && rackData[e.instanceId]) {
        onZoneClick(rackData[e.instanceId].zone);
      }
    },
    [rackData, onZoneClick]
  );

  const handlePointerOver = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      if (e.instanceId !== undefined && rackData[e.instanceId]) {
        setHoveredId(rackData[e.instanceId].zone.id);
      }
    },
    [rackData, setHoveredId]
  );

  const handlePointerOut = useCallback(() => {
    setHoveredId(null);
  }, [setHoveredId]);

  if (rackData.length === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, rackData.length]}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        metalness={0.3}
        roughness={0.6}
        transparent
        opacity={0.85}
      />
    </instancedMesh>
  );
}

function WarehouseFloor({ armazem }: { armazem: ArmazemData }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
      <planeGeometry args={[armazem.largura_m + 4, armazem.comprimento_m + 4]} />
      <meshStandardMaterial color="#1a1a2e" roughness={0.9} metalness={0.1} />
    </mesh>
  );
}

function WarehouseWalls({ armazem }: { armazem: ArmazemData }) {
  const hw = armazem.largura_m / 2;
  const hc = armazem.comprimento_m / 2;
  const h = armazem.altura_m;

  const wallMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#1e3a5f',
        transparent: true,
        opacity: 0.15,
        roughness: 0.5,
        metalness: 0.3,
        side: THREE.DoubleSide,
      }),
    []
  );

  return (
    <group>
      <mesh position={[0, h / 2, -hc]} material={wallMat}>
        <planeGeometry args={[armazem.largura_m, h]} />
      </mesh>
      <mesh position={[0, h / 2, hc]} material={wallMat}>
        <planeGeometry args={[armazem.largura_m, h]} />
      </mesh>
      <mesh position={[-hw, h / 2, 0]} material={wallMat}>
        <planeGeometry args={[armazem.comprimento_m, h]} />
      </mesh>
      <mesh position={[hw, h / 2, 0]} material={wallMat}>
        <planeGeometry args={[armazem.comprimento_m, h]} />
      </mesh>
      <mesh position={[0, h, 0]} material={wallMat}>
        <planeGeometry args={[armazem.largura_m + 2, armazem.comprimento_m + 2]} />
      </mesh>
    </group>
  );
}

function GroundGrid({ armazem }: { armazem: ArmazemData }) {
  return (
    <gridHelper
      args={[Math.max(armazem.largura_m, armazem.comprimento_m) + 8, 20, '#2a2a4a', '#1a1a3a']}
      position={[0, 0, 0]}
    />
  );
}

function SceneContent({
  zonas,
  armazem,
  onZoneClick,
  hoveredId,
  setHoveredId,
}: {
  zonas: Zone[];
  armazem: ArmazemData;
  onZoneClick: (z: Zone) => void;
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
}) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[30, 50, 20]} intensity={1.2} />
      <directionalLight position={[-20, 30, -10]} intensity={0.3} />
      <pointLight position={[0, armazem.altura_m + 2, 0]} intensity={0.5} color="#4a9eff" />

      <GroundGrid armazem={armazem} />
      <WarehouseFloor armazem={armazem} />
      <WarehouseWalls armazem={armazem} />

      <RackGrid
        zonas={zonas}
        armazem={armazem}
        onZoneClick={onZoneClick}
        hoveredId={hoveredId}
        setHoveredId={setHoveredId}
      />

      <OrbitControls
        makeDefault
        minDistance={5}
        maxDistance={armazem.largura_m * 2}
        maxPolarAngle={Math.PI / 2.1}
        enableDamping
        dampingFactor={0.15}
      />
    </>
  );
}

export default function WarehouseScene({
  zonas,
  armazem,
  onZoneClick,
}: {
  zonas: Zone[];
  armazem: ArmazemData;
  onZoneClick: (z: Zone) => void;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{
          position: [
            armazem.largura_m * 0.6,
            armazem.altura_m * 1.2,
            armazem.comprimento_m * 0.8,
          ],
          fov: 45,
          near: 0.1,
          far: 1000,
        }}
        style={{ background: '#0a0a1a' }}
        shadows={false}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <SceneContent
          zonas={zonas}
          armazem={armazem}
          onZoneClick={onZoneClick}
          hoveredId={hoveredId}
          setHoveredId={setHoveredId}
        />
      </Canvas>
    </div>
  );
}
