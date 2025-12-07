import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGame, type Explosion as ExplosionType } from "@/lib/stores/useGame";

interface ExplosionProps {
  explosion: ExplosionType;
}

export default function Explosion({ explosion }: ExplosionProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const scaleRef = useRef(0);
  const removeExplosion = useGame((state) => state.removeExplosion);
  const updateExplosion = useGame((state) => state.updateExplosion);
  const damageEnemy = useGame((state) => state.damageEnemy);
  const enemies = useGame((state) => state.enemies);
  const hitEnemiesRef = useRef<Set<string>>(new Set(explosion.hitEnemies));

  useEffect(() => {
    scaleRef.current = 0;
    hitEnemiesRef.current = new Set(explosion.hitEnemies);
  }, [explosion.id]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    // Expand the shockwave
    scaleRef.current += delta * 12;
    const currentRadius = explosion.radius + (explosion.maxRadius - explosion.radius) * Math.min(scaleRef.current, 1);

    // Check for enemy collisions at current shockwave position
    enemies.forEach((enemy) => {
      if (!enemy.isDead && !hitEnemiesRef.current.has(enemy.id)) {
        const distToEnemy = enemy.position.distanceTo(explosion.position);
        const shockwaveThickness = 0.5;
        
        // Damage if shockwave is currently passing through the enemy
        if (
          distToEnemy >= currentRadius - shockwaveThickness &&
          distToEnemy <= currentRadius + shockwaveThickness
        ) {
          damageEnemy(enemy.id, explosion.damage);
          hitEnemiesRef.current.add(enemy.id);
          console.log(`Explosion shockwave hit enemy ${enemy.id}!`);
        }
      }
    });

    // Update the explosion store with current hit enemies
    if (hitEnemiesRef.current.size > 0) {
      updateExplosion(explosion.id, currentRadius, Array.from(hitEnemiesRef.current));
    }

    // Remove when animation is done
    if (scaleRef.current >= 1) {
      removeExplosion(explosion.id);
      return;
    }

    // Update visual
    meshRef.current.scale.setScalar(Math.min(scaleRef.current, 1));
    const material = meshRef.current.material as THREE.MeshStandardMaterial;
    material.opacity = 0.9 * (1 - Math.min(scaleRef.current, 1));
  });

  return (
    <mesh ref={meshRef} position={explosion.position}>
      <sphereGeometry args={[explosion.maxRadius, 32, 32]} />
      <meshStandardMaterial
        color="#ff6600"
        emissive="#ff3300"
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}
