import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useGame, type Enemy as EnemyType } from "@/lib/stores/useGame";

interface EnemyProps {
  enemy: EnemyType;
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
    { x: -5, z: -15, width: 2, depth: 3 },
    { x: 12, z: -8, width: 2.5, depth: 2 },
    { x: -18, z: 0, width: 3, depth: 1.5 },
    { x: 8, z: 8, width: 2, depth: 2.5 },
    { x: 0, z: 12, width: 2.5, depth: 3 },
  ],
};

const checkObstacleCollision = (pos: THREE.Vector3): boolean => {
  const radius = 0.5;
  
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
    if (Math.abs(dx) < cover.width / 2 + radius && Math.abs(dz) < cover.depth / 2 + radius) {
      return true;
    }
  }
  
  return false;
};

export default function Enemy({ enemy }: EnemyProps) {
  const meshRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const damagePlayer = useGame((state) => state.damagePlayer);
  const updateEnemy = useGame((state) => state.updateEnemy);
  const shootEnemy = useGame((state) => state.shootEnemy);
  
  const attackRange = 2;
  const shootRange = 20;
  const attackCooldown = useRef(0);
  const shootCooldown = useRef(0);
  const patrolSpeed = 2;
  const chaseSpeed = 4;
  const aggroRange = 15;

  // Pre-calculate random patrol offset to avoid Math.random in render
  const patrolOffset = useMemo(() => ({
    x: (Math.random() - 0.5) * 20,
    z: (Math.random() - 0.5) * 20,
  }), []);

  useFrame((_, delta) => {
    if (!meshRef.current || enemy.isDead) return;

    const enemyPos = enemy.position;
    const playerPos = camera.position;
    const distanceToPlayer = enemyPos.distanceTo(playerPos);

    // Check if player is in aggro range
    if (distanceToPlayer < aggroRange && !enemy.isAggro) {
      updateEnemy(enemy.id, { isAggro: true });
    }

    if (enemy.isAggro) {
      // Chase player
      const direction = new THREE.Vector3()
        .subVectors(playerPos, enemyPos)
        .normalize();
      
      direction.y = 0;
      
      const newPos = enemyPos.clone();
      newPos.add(direction.multiplyScalar(chaseSpeed * delta));
      newPos.y = 0.3;
      
      // Check collision with obstacles
      if (!checkObstacleCollision(newPos)) {
        updateEnemy(enemy.id, { position: newPos });
      }

      // Look at player
      meshRef.current.lookAt(playerPos.x, meshRef.current.position.y, playerPos.z);

      // Shoot if in range
      if (distanceToPlayer < shootRange) {
        shootCooldown.current -= delta;
        if (shootCooldown.current <= 0) {
          const direction = new THREE.Vector3()
            .subVectors(playerPos, enemyPos)
            .normalize();
          shootEnemy(enemyPos.clone().add(new THREE.Vector3(0.35, 1.0, 0)), direction);
          shootCooldown.current = 2.5;
        }
      }
      
      // Attack if in range
      if (distanceToPlayer < attackRange) {
        attackCooldown.current -= delta;
        if (attackCooldown.current <= 0) {
          damagePlayer(10);
          attackCooldown.current = 1.5;
          console.log("Enemy attacked player!");
        }
      }
    } else {
      // Patrol behavior
      const distanceToTarget = enemyPos.distanceTo(enemy.patrolTarget);
      
      if (distanceToTarget < 1) {
        const newTarget = new THREE.Vector3(
          patrolOffset.x + (Math.random() - 0.5) * 10,
          1,
          patrolOffset.z + (Math.random() - 0.5) * 10
        );
        updateEnemy(enemy.id, { patrolTarget: newTarget });
      } else {
        const direction = new THREE.Vector3()
          .subVectors(enemy.patrolTarget, enemyPos)
          .normalize();
        
        const newPos = enemyPos.clone();
        newPos.add(direction.multiplyScalar(patrolSpeed * delta));
        newPos.y = 0.3;
        
        // Check collision with obstacles
        if (!checkObstacleCollision(newPos)) {
          updateEnemy(enemy.id, { position: newPos });
        }
        meshRef.current.lookAt(enemy.patrolTarget.x, meshRef.current.position.y, enemy.patrolTarget.z);
      }
    }

    meshRef.current.position.copy(enemy.position);
  });

  const opacity = enemy.isDead ? 0.3 : 1;

  return (
    <group ref={meshRef} position={enemy.position}>
      {/* Legs - white pants */}
      <mesh position={[-0.15, 0.4, 0]} castShadow>
        <boxGeometry args={[0.15, 0.8, 0.15]} />
        <meshStandardMaterial color="#e8e8e8" transparent opacity={opacity} />
      </mesh>
      <mesh position={[0.15, 0.4, 0]} castShadow>
        <boxGeometry args={[0.15, 0.8, 0.15]} />
        <meshStandardMaterial color="#e8e8e8" transparent opacity={opacity} />
      </mesh>
      
      {/* Body - dark blue jacket */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <boxGeometry args={[0.6, 0.8, 0.35]} />
        <meshStandardMaterial color="#1a2850" transparent opacity={opacity} />
      </mesh>
      
      {/* White crossed belts/sashes */}
      <mesh position={[-0.15, 1.1, 0.18]} castShadow>
        <boxGeometry args={[0.08, 0.7, 0.02]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={opacity} />
      </mesh>
      <mesh position={[0.15, 1.1, 0.18]} castShadow>
        <boxGeometry args={[0.08, 0.7, 0.02]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={opacity} />
      </mesh>
      
      {/* Red collar */}
      <mesh position={[0, 1.45, 0]} castShadow>
        <boxGeometry args={[0.35, 0.1, 0.35]} />
        <meshStandardMaterial color="#cc3333" transparent opacity={opacity} />
      </mesh>
      
      {/* Head - skin tone */}
      <mesh position={[0, 1.7, 0]} castShadow>
        <boxGeometry args={[0.25, 0.3, 0.25]} />
        <meshStandardMaterial color="#d4a574" transparent opacity={opacity} />
      </mesh>
      
      {/* Hat - dark blue bicorne */}
      <mesh position={[0, 1.95, 0]} castShadow>
        <boxGeometry args={[0.35, 0.15, 0.2]} />
        <meshStandardMaterial color="#1a2850" transparent opacity={opacity} />
      </mesh>
      <mesh position={[0, 2.0, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[0.15, 0.05, 0.4]} />
        <meshStandardMaterial color="#d4a020" transparent opacity={opacity} />
      </mesh>
      
      {/* Red plume */}
      <mesh position={[0, 2.2, 0]} castShadow>
        <coneGeometry args={[0.08, 0.3, 8]} />
        <meshStandardMaterial color="#ff3333" transparent opacity={opacity} />
      </mesh>
      
      {/* Rifle - brown */}
      <mesh position={[0.35, 1.0, 0]} rotation={[0, 0, Math.PI / 6]} castShadow>
        <boxGeometry args={[0.08, 1.2, 0.08]} />
        <meshStandardMaterial color="#654321" transparent opacity={opacity} />
      </mesh>
      
      {/* Arms - dark blue */}
      <mesh position={[-0.35, 1.1, 0]} castShadow>
        <boxGeometry args={[0.12, 0.6, 0.12]} />
        <meshStandardMaterial color="#1a2850" transparent opacity={opacity} />
      </mesh>
      <mesh position={[0.35, 1.1, 0]} castShadow>
        <boxGeometry args={[0.12, 0.6, 0.12]} />
        <meshStandardMaterial color="#1a2850" transparent opacity={opacity} />
      </mesh>
      
      {/* Health bar above enemy */}
      {!enemy.isDead && (
        <mesh position={[0, 2.5, 0]}>
          <planeGeometry args={[1, 0.1]} />
          <meshBasicMaterial color="#333333" transparent opacity={0.7} />
          <mesh position={[-(1 - enemy.health / 100) / 2, 0, -0.01]}>
            <planeGeometry args={[enemy.health / 100, 0.1]} />
            <meshBasicMaterial color={enemy.isAggro ? "#ff0000" : "#00ff00"} />
          </mesh>
        </mesh>
      )}
    </group>
  );
}
