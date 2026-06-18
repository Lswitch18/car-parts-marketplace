import { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import { Canvas, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
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

const ZONE_COLORS: Record<string, string> = {
  RECEBIMENTO: '#3B82F6',
  PICKING: '#22C55E',
  SEPARACAO: '#FACC15',
  EXPEDICAO: '#F97316',
  ARMAZENAGEM: '#8B5CF6',
};

function getZoneBaseColor(tipo: string): THREE.Color {
  return new THREE.Color(ZONE_COLORS[tipo] || '#6B7280');
}

function getOccupancyColor(pct: number): THREE.Color {
  if (pct > 80) return new THREE.Color('#EF4444');
  if (pct > 60) return new THREE.Color('#FACC15');
  if (pct > 30) return new THREE.Color('#22C55E');
  return new THREE.Color('#166534');
}

const rackH = new THREE.Matrix4();
const tempC = new THREE.Color();

const SHELF_COUNT = 4;

function RackGrid({
  zonas,
  armazem,
  onZoneClick,
  hoveredId,
  setHoveredId,
  highlightedSlot,
}: {
  zonas: Zone[];
  armazem: ArmazemData;
  onZoneClick: (z: Zone) => void;
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  highlightedSlot?: { px: number; py: number } | null;
}) {
  const bodyRef = useRef<THREE.InstancedMesh>(null);
  const shelfRef = useRef<THREE.InstancedMesh>(null);
  const fillRef = useRef<THREE.InstancedMesh>(null);
  const glowRef = useRef<THREE.InstancedMesh>(null);

  const rackHeight = armazem.altura_m * 0.7;
  const shelfSpacing = rackHeight / (SHELF_COUNT + 1);
  const rackWidth = 1.8;
  const rackDepth = 1.8;

  const config = useMemo(() => {
    const spacingX = armazem.largura_m / Math.max(armazem.racks_colunas, 1);
    const spacingZ = armazem.comprimento_m / (Math.max(armazem.racks_linhas, 1) + 1);
    const offsetX = -armazem.largura_m / 2 + spacingX / 2;
    const offsetZ = -armazem.comprimento_m / 2 + spacingZ;

    const res: {
      pos: THREE.Vector3; occColor: THREE.Color; baseColor: THREE.Color;
      pct: number; zone: Zone; idx: number;
    }[] = [];

    zonas.forEach((zone, i) => {
      const px = zone.pos_x ?? (i % armazem.racks_colunas);
      const py = zone.pos_y ?? Math.floor(i / armazem.racks_colunas);
      if (py >= armazem.racks_linhas) return;

      const x = offsetX + px * spacingX;
      const zPos = offsetZ + py * spacingZ;
      const pct = zone.capacidade > 0 ? Math.min((zone.ocupacao / zone.capacidade), 1) : 0;

      res.push({
        pos: new THREE.Vector3(x, 0, zPos),
        occColor: getOccupancyColor(pct * 100),
        baseColor: getZoneBaseColor(zone.tipo),
        pct,
        zone,
        idx: i,
      });
    });

    return res;
  }, [zonas, armazem]);

  useEffect(() => {
    if (!bodyRef.current || config.length === 0) return;
    const body = bodyRef.current;
    const fill = fillRef.current;
    const glow = glowRef.current;

    config.forEach((d, i) => {
      rackH.identity();
      rackH.makeScale(rackWidth, rackHeight, rackDepth);
      rackH.setPosition(d.pos.x, rackHeight / 2, d.pos.z);
      body.setMatrixAt(i, rackH);
      tempC.copy(d.baseColor);
      body.setColorAt(i, tempC);

      if (fill && d.pct > 0) {
        const fillH = Math.max(d.pct * (rackHeight - 0.6), 0.1);
        rackH.identity();
        rackH.makeScale(rackWidth - 0.4, fillH, rackDepth - 0.4);
        rackH.setPosition(d.pos.x, fillH / 2 + 0.3, d.pos.z);
        fill.setMatrixAt(i, rackH);
        tempC.copy(d.occColor);
        fill.setColorAt(i, tempC);
      }

      if (glow) {
        const isHighlightedRack = highlightedSlot && d.zone.pos_x === highlightedSlot.px && d.zone.pos_y === highlightedSlot.py;
        const isHoveredRack = hoveredId === d.zone.id;

        rackH.identity();
        if (isHighlightedRack || isHoveredRack) {
          rackH.makeScale(rackWidth + 0.35, rackHeight + 0.35, rackDepth + 0.35);
          rackH.setPosition(d.pos.x, rackHeight / 2, d.pos.z);
          glow.setMatrixAt(i, rackH);

          if (isHighlightedRack) {
            tempC.set('#00E5FF'); // Cyan neon glow for search target
          } else {
            tempC.copy(d.occColor);
          }
          glow.setColorAt(i, tempC);
        } else {
          rackH.makeScale(0, 0, 0);
          glow.setMatrixAt(i, rackH);
        }
      }
    });
    body.instanceMatrix.needsUpdate = true;
    if (body.instanceColor) body.instanceColor.needsUpdate = true;
    if (fill) {
      fill.instanceMatrix.needsUpdate = true;
      if (fill.instanceColor) fill.instanceColor.needsUpdate = true;
    }
    if (glow) {
      glow.count = (hoveredId || highlightedSlot) ? config.length : 0;
      glow.instanceMatrix.needsUpdate = true;
      if (glow.instanceColor) glow.instanceColor.needsUpdate = true;
    }

    if (shelfRef.current) {
      let si = 0;
      config.forEach((_d, _i) => {
        for (let s = 1; s <= SHELF_COUNT; s++) {
          const sy = s * shelfSpacing;
          rackH.identity();
          rackH.makeScale(rackWidth + 0.1, 0.08, rackDepth + 0.1);
          rackH.setPosition(_d.pos.x, sy, _d.pos.z);
          shelfRef.current!.setMatrixAt(si, rackH);
          si++;
        }
      });
      shelfRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [config, rackHeight, shelfSpacing, rackWidth, rackDepth, hoveredId, highlightedSlot]);

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      if (e.instanceId !== undefined && config[e.instanceId]) {
        onZoneClick(config[e.instanceId].zone);
      }
    },
    [config, onZoneClick]
  );

  const handlePointerOver = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      if (e.instanceId !== undefined && config[e.instanceId]) {
        setHoveredId(config[e.instanceId].zone.id);
      }
    },
    [config, setHoveredId]
  );

  const handlePointerOut = useCallback(() => {
    setHoveredId(null);
  }, [setHoveredId]);

  if (config.length === 0) return null;

  return (
    <group>
      <instancedMesh
        ref={glowRef}
        args={[undefined, undefined, hoveredId ? config.length : 0]}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          transparent
          opacity={0.15}
          emissive={new THREE.Color('#60a5fa')}
          emissiveIntensity={2}
          depthWrite={false}
        />
      </instancedMesh>

      <instancedMesh
        ref={bodyRef}
        args={[undefined, undefined, config.length]}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial metalness={0.2} roughness={0.5} transparent opacity={0.2} />
      </instancedMesh>

      <instancedMesh
        ref={fillRef}
        args={[undefined, undefined, config.length]}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial metalness={0.4} roughness={0.3} transparent opacity={0.85} />
      </instancedMesh>

      <instancedMesh
        ref={shelfRef}
        args={[undefined, undefined, config.length * SHELF_COUNT]}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#4a5568" metalness={0.6} roughness={0.3} />
      </instancedMesh>
    </group>
  );
}

function WarehouseFloor({ armazem }: { armazem: ArmazemData }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
      <planeGeometry args={[armazem.largura_m + 6, armazem.comprimento_m + 6]} />
      <meshStandardMaterial color="#1a1a2e" roughness={0.9} metalness={0.1} />
    </mesh>
  );
}

function WarehouseWalls({ armazem }: { armazem: ArmazemData }) {
  const hw = armazem.largura_m / 2;
  const hc = armazem.comprimento_m / 2;
  const h = armazem.altura_m;

  const wallMat = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: '#1e3a5f', transparent: true, opacity: 0.1,
      roughness: 0.5, metalness: 0.3, side: THREE.DoubleSide,
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
    </group>
  );
}

function DockDoors({ armazem }: { armazem: ArmazemData }) {
  const hc = armazem.comprimento_m / 2;
  const h = armazem.altura_m;
  const doorCount = Math.min(armazem.racks_colunas, 8);
  const doorW = 3.5;
  const doorH = h * 0.55;
  const gap = (armazem.largura_m - doorCount * doorW) / (doorCount + 1);
  const startX = -armazem.largura_m / 2 + gap + doorW / 2;

  return (
    <group position={[0, 0, -hc + 0.1]}>
      {Array.from({ length: doorCount }, (_, i) => (
        <mesh key={i} position={[startX + i * (doorW + gap), doorH / 2, 0]}>
          <planeGeometry args={[doorW - 0.5, doorH]} />
          <meshStandardMaterial color="#0f1729" roughness={0.8} metalness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

function RoofStructure({ armazem }: { armazem: ArmazemData }) {
  const beamCount = Math.max(5, Math.floor(armazem.comprimento_m / 10));
  const beamSpacing = armazem.comprimento_m / (beamCount - 1);
  const beamMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#2a3a5a', metalness: 0.5, roughness: 0.4 }),
    []
  );

  return (
    <group position={[0, armazem.altura_m, 0]}>
      {Array.from({ length: beamCount }, (_, i) => (
        <mesh key={i} position={[0, 0, -armazem.comprimento_m / 2 + i * beamSpacing]} material={beamMat}>
          <boxGeometry args={[armazem.largura_m, 0.15, 0.3]} />
        </mesh>
      ))}
    </group>
  );
}

function SupportColumns({ armazem }: { armazem: ArmazemData }) {
  const colCountX = Math.max(3, Math.floor(armazem.racks_colunas / 3));
  const colCountZ = Math.max(2, Math.floor(armazem.racks_linhas / 2));
  const spacingX = armazem.largura_m / (colCountX - 1);
  const spacingZ = armazem.comprimento_m / (colCountZ - 1);
  const colMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#2a3a5a', metalness: 0.6, roughness: 0.3 }),
    []
  );

  return (
    <group>
      {Array.from({ length: colCountX }, (_, ix) =>
        Array.from({ length: colCountZ }, (_, iz) => (
          <mesh
            key={`${ix}-${iz}`}
            position={[-armazem.largura_m / 2 + ix * spacingX, armazem.altura_m / 2, -armazem.comprimento_m / 2 + iz * spacingZ]}
            material={colMat}
          >
            <cylinderGeometry args={[0.15, 0.2, armazem.altura_m, 8]} />
          </mesh>
        ))
      )}
    </group>
  );
}

function AisleMarkers({ armazem }: { armazem: ArmazemData }) {
  const aisleCount = Math.max(1, Math.floor(armazem.racks_linhas / 2) - 1);
  const rowH = armazem.comprimento_m / (armazem.racks_linhas + 1);

  return (
    <group>
      {Array.from({ length: aisleCount }, (_, i) => {
        const aisleZ = -armazem.comprimento_m / 2 + ((i * 2) + 1.5) * rowH;
        return (
          <mesh key={i} position={[0, 0.02, aisleZ]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[armazem.largura_m - 2, 0.5]} />
            <meshStandardMaterial color="#2a2a4a" transparent opacity={0.25} roughness={0.8} />
          </mesh>
        );
      })}
    </group>
  );
}

function LoadingDockArea({ armazem }: { armazem: ArmazemData }) {
  return (
    <mesh position={[0, 0.02, -armazem.comprimento_m / 2 + 2]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[armazem.largura_m - 2, 4]} />
      <meshStandardMaterial color="#3a3a5e" roughness={0.9} metalness={0.1} transparent opacity={0.4} />
    </mesh>
  );
}

function ZoneLabels({ zonas, armazem }: { zonas: Zone[]; armazem: ArmazemData }) {
  const spacingX = armazem.largura_m / Math.max(armazem.racks_colunas, 1);
  const spacingZ = armazem.comprimento_m / (Math.max(armazem.racks_linhas, 1) + 1);
  const offsetX = -armazem.largura_m / 2 + spacingX / 2;
  const offsetZ = -armazem.comprimento_m / 2 + spacingZ;

  return (
    <group>
      {zonas.map((zone, i) => {
        const px = zone.pos_x ?? (i % armazem.racks_colunas);
        const py = zone.pos_y ?? Math.floor(i / armazem.racks_colunas);
        if (py >= armazem.racks_linhas) return null;
        const x = offsetX + px * spacingX;
        const zPos = offsetZ + py * spacingZ;

        return (
          <Text
            key={zone.id}
            position={[x, armazem.altura_m * 0.78, zPos]}
            fontSize={0.8}
            color="#93bbff"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.08}
            outlineColor="#000000"
          >
            {zone.nome.slice(0, 6)}
          </Text>
        );
      })}
    </group>
  );
}

function SceneContent({
  zonas,
  armazem,
  onZoneClick,
  hoveredId,
  setHoveredId,
  highlightedSlot,
}: {
  zonas: Zone[];
  armazem: ArmazemData;
  onZoneClick: (z: Zone) => void;
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  highlightedSlot?: { px: number; py: number } | null;
}) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[30, 50, 20]} intensity={1.5} />
      <directionalLight position={[-20, 30, -10]} intensity={0.4} />
      <pointLight position={[0, armazem.altura_m + 2, 0]} intensity={0.8} color="#4a9eff" />

      <gridHelper
        args={[Math.max(armazem.largura_m, armazem.comprimento_m) + 12, 24, '#2a2a4a', '#1a1a3a']}
        position={[0, 0, 0]}
      />
      <WarehouseFloor armazem={armazem} />
      <WarehouseWalls armazem={armazem} />
      <AisleMarkers armazem={armazem} />
      <LoadingDockArea armazem={armazem} />
      <DockDoors armazem={armazem} />
      <SupportColumns armazem={armazem} />
      <RoofStructure armazem={armazem} />

      <RackGrid
        zonas={zonas}
        armazem={armazem}
        onZoneClick={onZoneClick}
        hoveredId={hoveredId}
        setHoveredId={setHoveredId}
        highlightedSlot={highlightedSlot}
      />
      <ZoneLabels zonas={zonas} armazem={armazem} />

      <Text
        position={[0, armazem.altura_m + 2.5, 0]}
        fontSize={2}
        color="#4a9eff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.12}
        outlineColor="#000000"
      >
        {armazem.nome}
      </Text>

      <OrbitControls
        makeDefault
        minDistance={3}
        maxDistance={armazem.largura_m * 2.5}
        maxPolarAngle={Math.PI / 2.05}
        minPolarAngle={0.1}
        enableDamping
        dampingFactor={0.12}
        rotateSpeed={0.6}
        zoomSpeed={1.0}
      />
    </>
  );
}

export default function WarehouseScene({
  zonas,
  armazem,
  onZoneClick,
  highlightedSlot,
}: {
  zonas: Zone[];
  armazem: ArmazemData;
  onZoneClick: (z: Zone) => void;
  highlightedSlot?: { px: number; py: number } | null;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const camDist = Math.max(armazem.largura_m, armazem.comprimento_m, armazem.altura_m * 2);

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{
          position: [camDist * 0.5, armazem.altura_m * 1.5, camDist * 0.7],
          fov: 40,
          near: 0.1,
          far: 2000,
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
          highlightedSlot={highlightedSlot}
        />
      </Canvas>
    </div>
  );
}
