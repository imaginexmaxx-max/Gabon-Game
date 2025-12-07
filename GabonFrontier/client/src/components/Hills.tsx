import { useMemo } from "react";

interface HillData {
  x: number;
  z: number;
  radius: number;
  height: number;
}

const generateHills = (): HillData[] => {
  return [
    { x: -15, z: -20, radius: 2.5, height: 0.4 },
    { x: 10, z: -25, radius: 3, height: 0.5 },
    { x: 20, z: 5, radius: 2.3, height: 0.35 },
    { x: -20, z: 10, radius: 3, height: 0.45 },
    { x: 5, z: 20, radius: 2.5, height: 0.4 },
  ];
};

export default function Hills() {
  const hills = useMemo(() => generateHills(), []);

  return (
    <group>
      {hills.map((hill, idx) => (
        <mesh key={idx} position={[hill.x, -0.3 + hill.height / 2, hill.z]}>
          <sphereGeometry args={[hill.radius, 16, 16]} />
          <meshStandardMaterial color="#6B8E23" />
        </mesh>
      ))}
    </group>
  );
}
