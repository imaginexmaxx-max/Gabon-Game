import { useMemo, Suspense } from "react";
import { useTexture } from "@react-three/drei";

function VillageContent() {
  const woodTexture = useTexture("/textures/wood.jpg");
  const grassTexture = useTexture("/textures/grass.png");

  const huts = useMemo(() => [
    { position: [-8, 0, 5] as [number, number, number], rotation: 0.3 },
    { position: [-12, 0, 3] as [number, number, number], rotation: -0.5 },
    { position: [10, 0, 8] as [number, number, number], rotation: 0.8 },
    { position: [8, 0, 12] as [number, number, number], rotation: -0.2 },
    { position: [0, 0, 15] as [number, number, number], rotation: 0 },
  ], []);

  return (
    <group>
      {huts.map((hut, index) => (
        <group key={index} position={hut.position} rotation={[0, hut.rotation, 0]}>
          {/* Base */}
          <mesh position={[0, 1, 0]}>
            <cylinderGeometry args={[2, 2.2, 2, 8]} />
            <meshStandardMaterial map={woodTexture} color="#8B7355" />
          </mesh>
          
          {/* Roof */}
          <mesh position={[0, 2.5, 0]}>
            <coneGeometry args={[2.5, 2, 8]} />
            <meshStandardMaterial map={grassTexture} color="#6B8E23" />
          </mesh>
          
          {/* Door */}
          <mesh position={[0, 0.7, 2]}>
            <boxGeometry args={[0.8, 1.4, 0.1]} />
            <meshStandardMaterial color="#654321" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export default function Village() {
  return (
    <Suspense fallback={null}>
      <VillageContent />
    </Suspense>
  );
}
