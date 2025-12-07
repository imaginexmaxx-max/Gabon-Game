import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useGame, type Grenade as GrenadeType } from "@/lib/stores/useGame";

interface GrenadeProps {
  grenade: GrenadeType;
}

const OBSTACLES = {
  trees: [
    { x: -20, z: -30, radius: 2.2 },
    { x: -25, z: -28, radius: 2.2 },
    { x: -22, z: -32, radius: 2.2 },
    { x: 18, z: -28, radius: 2.2 },
    { x: 22, z: -30, radius: 2.2 },
    { x: 20, z: -32, radius: 2.2 },
    { x: -28, z: -5, radius: 2.2 },
    { x: -30, z: 0, radius: 2.2 },
    { x: -32, z: 5, radius: 2.2 },
    { x: -29, z: 10, radius: 2.2 },
    { x: 28, z: -5, radius: 2.2 },
    { x: 30, z: 0, radius: 2.2 },
    { x: 32, z: 5, radius: 2.2 },
    { x: 29, z: 10, radius: 2.2 },
    { x: -15, z: 15, radius: 2.2 },
    { x: -18, z: 18, radius: 2.2 },
    { x: 15, z: 15, radius: 2.2 },
    { x: 18, z: 18, radius: 2.2 },
  ],
  houses: [
    { x: -8, z: 5, radius: 3.0 },
    { x: -12, z: 3, radius: 3.0 },
    { x: 10, z: 8, radius: 3.0 },
    { x: 8, z: 12, radius: 3.0 },
    { x: 0, z: 15, radius: 3.0 },
  ],
  hills: [
    { x: -15, z: -20, radius: 2.8 },
    { x: 10, z: -25, radius: 3.3 },
    { x: 20, z: 5, radius: 2.5 },
    { x: -20, z: 10, radius: 3.3 },
    { x: 5, z: 20, radius: 2.8 },
  ],
  covers: [
    { x: -5, z: -15, width: 2, height: 2.5, depth: 3 },
    { x: 12, z: -8, width: 2.5, height: 2.2, depth: 2 },
    { x: -18, z: 0, width: 3, height: 2, depth: 1.5 },
    { x: 8, z: 8, width: 2, height: 2.8, depth: 2.5 },
    { x: 0, z: 12, width: 2.5, height: 2, depth: 3 },
  ],
};

const checkObstacleCollision = (pos: THREE.Vector3): boolean => {
  const radius = 0.25;
  
  for (const tree of OBSTACLES.trees) {
    const dx = pos.x - tree.x;
    const dz = pos.z - tree.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    if (distance < tree.radius + radius) return true;
  }
  
  for (const house of OBSTACLES.houses) {
    const dx = pos.x - house.x;
    const dz = pos.z - house.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    if (distance < house.radius + radius) return true;
  }
  
  for (const hill of OBSTACLES.hills) {
    const dx = pos.x - hill.x;
    const dz = pos.z - hill.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    if (distance < hill.radius + radius) return true;
  }
  
  for (const cover of OBSTACLES.covers) {
    const dx = pos.x - cover.x;
    const dz = pos.z - cover.z;
    const dy = pos.y - (cover.height / 2);
    
    if (
      Math.abs(dx) < cover.width / 2 + radius &&
      Math.abs(dz) < cover.depth / 2 + radius &&
      Math.abs(dy) < cover.height / 2 + radius
    ) {
      return true;
    }
  }
  
  return false;
};

export default function Grenade({ grenade }: GrenadeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const velocityRef = useRef(new THREE.Vector3());
  const updateGrenade = useGame((state) => state.updateGrenade);
  const explodeGrenade = useGame((state) => state.explodeGrenade);
  const removeGrenade = useGame((state) => state.removeGrenade);

  useEffect(() => {
    velocityRef.current = grenade.direction.clone().multiplyScalar(grenade.speed);
  }, [grenade.direction, grenade.speed]);

  useFrame((_, delta) => {
    if (!meshRef.current || grenade.timeToExplode <= 0) return;

    const newPos = grenade.position.clone();
    
    // Apply velocity and gravity
    newPos.add(velocityRef.current.clone().multiplyScalar(delta));
    velocityRef.current.y -= 9.8 * delta;
    
    // Clamp to ground
    if (newPos.y < 0.3) {
      newPos.y = 0.3;
      velocityRef.current.y = 0;
    }

    // Check obstacle collision - explode on impact
    if (checkObstacleCollision(newPos)) {
      console.log("Grenade hit obstacle!");
      explodeGrenade(grenade.id);
      return;
    }

    const newTime = grenade.timeToExplode - delta;
    updateGrenade(grenade.id, newPos, newTime);

    if (newTime <= 0) {
      explodeGrenade(grenade.id);
    }

    meshRef.current.position.copy(grenade.position);
  });

  return (
    <mesh ref={meshRef} position={grenade.position} castShadow>
      <sphereGeometry args={[0.25, 8, 8]} />
      <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.3} />
    </mesh>
  );
}
