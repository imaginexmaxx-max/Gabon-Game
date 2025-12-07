import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface TreeData {
  x: number;
  z: number;
  height: number;
  trunkRadius: number;
}

const generateTrees = (): TreeData[] => {
  const trees: TreeData[] = [];
  const positions = [
    // Around the perimeter to create a jungle barrier
    { x: -20, z: -30, height: 8, radius: 0.6 },
    { x: -25, z: -28, height: 9, radius: 0.5 },
    { x: -22, z: -32, height: 8.5, radius: 0.6 },
    { x: 18, z: -28, height: 7, radius: 0.55 },
    { x: 22, z: -30, height: 8.5, radius: 0.6 },
    { x: 20, z: -32, height: 8, radius: 0.55 },
    
    // Left side cluster
    { x: -28, z: -5, height: 7.5, radius: 0.5 },
    { x: -30, z: 0, height: 8, radius: 0.6 },
    { x: -32, z: 5, height: 7, radius: 0.55 },
    { x: -29, z: 10, height: 8.5, radius: 0.6 },
    
    // Right side cluster
    { x: 28, z: -5, height: 8, radius: 0.6 },
    { x: 30, z: 0, height: 7.5, radius: 0.55 },
    { x: 32, z: 5, height: 8, radius: 0.5 },
    { x: 29, z: 10, height: 7, radius: 0.6 },
    
    // Front/back clusters for blocking paths
    { x: -15, z: 15, height: 8, radius: 0.55 },
    { x: -18, z: 18, height: 7.5, radius: 0.6 },
    { x: 15, z: 15, height: 8.5, radius: 0.55 },
    { x: 18, z: 18, height: 7, radius: 0.6 },
  ];
  
  return positions.map((pos) => ({
    x: pos.x,
    z: pos.z,
    height: pos.height,
    trunkRadius: pos.radius,
  }));
};

export default function JungleTrees() {
  const treeRef = useRef<THREE.Group>(null);
  const trees = useMemo(() => generateTrees(), []);

  return (
    <group ref={treeRef}>
      {trees.map((tree, idx) => (
        <group key={idx} position={[tree.x, 0, tree.z]}>
          {/* Tree Trunk */}
          <mesh position={[0, tree.height / 2, 0]}>
            <cylinderGeometry args={[tree.trunkRadius, tree.trunkRadius * 1.2, tree.height, 8]} />
            <meshStandardMaterial color="#5C4033" />
          </mesh>

          {/* Tree Foliage - multiple spheres for bushy look */}
          <mesh position={[0, tree.height * 0.8, 0]}>
            <sphereGeometry args={[2.5, 8, 8]} />
            <meshStandardMaterial color="#228B22" />
          </mesh>
          <mesh position={[0.8, tree.height * 0.6, 0.8]}>
            <sphereGeometry args={[2, 8, 8]} />
            <meshStandardMaterial color="#2E7D32" />
          </mesh>
          <mesh position={[-0.8, tree.height * 0.65, -0.8]}>
            <sphereGeometry args={[2, 8, 8]} />
            <meshStandardMaterial color="#228B22" />
          </mesh>
          <mesh position={[0, tree.height + 0.5, 0]}>
            <sphereGeometry args={[1.5, 8, 8]} />
            <meshStandardMaterial color="#1B5E20" />
          </mesh>

          {/* Collision Cylinder (invisible) - keeps player out */}
          <mesh position={[0, tree.height / 2, 0]}>
            <cylinderGeometry args={[3.5, 3.5, tree.height + 1, 16]} />
            <meshStandardMaterial transparent opacity={0} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
