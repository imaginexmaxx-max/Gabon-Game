import { useMemo } from "react";

interface CoverData {
  x: number;
  z: number;
  width: number;
  height: number;
  depth: number;
}

const generateCover = (): CoverData[] => {
  return [
    // Rock formations
    { x: -5, z: -15, width: 2, height: 2.5, depth: 3 },
    { x: 12, z: -8, width: 2.5, height: 2.2, depth: 2 },
    { x: -18, z: 0, width: 3, height: 2, depth: 1.5 },
    { x: 8, z: 8, width: 2, height: 2.8, depth: 2.5 },
    { x: 0, z: 12, width: 2.5, height: 2, depth: 3 },
  ];
};

export default function CoverObjects() {
  const coverObjects = useMemo(() => generateCover(), []);

  return (
    <group>
      {coverObjects.map((cover, idx) => (
        <mesh key={idx} position={[cover.x, cover.height / 2, cover.z]} castShadow>
          <boxGeometry args={[cover.width, cover.height, cover.depth]} />
          <meshStandardMaterial color="#8B7355" />
        </mesh>
      ))}
    </group>
  );
}
