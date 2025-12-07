import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useGame, type Bullet as BulletType } from "@/lib/stores/useGame";

interface BulletProps {
  bullet: BulletType;
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
    { x: -8, z: 5, radius: 2.8 },
    { x: -12, z: 3, radius: 2.8 },
    { x: 10, z: 8, radius: 2.8 },
    { x: 8, z: 12, radius: 2.8 },
    { x: 0, z: 15, radius: 2.8 },
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
  const radius = 0.15;
  
  // Check trees
  for (const tree of OBSTACLES.trees) {
    const dx = pos.x - tree.x;
    const dz = pos.z - tree.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    if (distance < tree.radius + radius) return true;
  }
  
  // Check houses
  for (const house of OBSTACLES.houses) {
    const dx = pos.x - house.x;
    const dz = pos.z - house.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    if (distance < house.radius + radius) return true;
  }
  
  // Check hills
  for (const hill of OBSTACLES.hills) {
    const dx = pos.x - hill.x;
    const dz = pos.z - hill.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    if (distance < hill.radius + radius) return true;
  }
  
  // Check cover objects
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

export default function Bullet({ bullet }: BulletProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  const updateBullet = useGame((state) => state.updateBullet);
  const removeBullet = useGame((state) => state.removeBullet);
  const damageEnemy = useGame((state) => state.damageEnemy);
  const damagePlayer = useGame((state) => state.damagePlayer);
  const enemies = useGame((state) => state.enemies);
  const lifetimeRef = useRef(0);
  const maxLifetime = 3;
  const isEnemyBullet = bullet.id.startsWith("enemy-bullet");

  useEffect(() => {
    return () => {
      removeBullet(bullet.id);
    };
  }, [bullet.id, removeBullet]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    lifetimeRef.current += delta;
    if (lifetimeRef.current > maxLifetime) {
      removeBullet(bullet.id);
      return;
    }

    const movement = bullet.direction.clone().multiplyScalar(bullet.speed * delta);
    const newPosition = bullet.position.clone().add(movement);

    // Check for obstacle collision first
    if (checkObstacleCollision(newPosition)) {
      removeBullet(bullet.id);
      return;
    }

    let hit = false;

    if (isEnemyBullet) {
      // Enemy bullets check for collision with player
      const playerDistance = newPosition.distanceTo(camera.position);
      if (playerDistance < 1.5) {
        damagePlayer(15);
        hit = true;
        console.log("Enemy bullet hit player!");
      }
    } else {
      // Player bullets check for collision with enemies
      enemies.forEach((enemy) => {
        if (!enemy.isDead) {
          const distance = newPosition.distanceTo(enemy.position);
          if (distance < 1.2) {
            damageEnemy(enemy.id, 35);
            hit = true;
            console.log(`Bullet hit enemy ${enemy.id}! Distance: ${distance.toFixed(2)}`);
          }
        }
      });
    }

    if (hit) {
      removeBullet(bullet.id);
      return;
    }

    // Check if hit ground
    if (newPosition.y < 0) {
      removeBullet(bullet.id);
      return;
    }

    updateBullet(bullet.id, newPosition);
    meshRef.current.position.copy(newPosition);
  });

  return (
    <mesh ref={meshRef} position={bullet.position}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshBasicMaterial color="#888888" />
    </mesh>
  );
}
