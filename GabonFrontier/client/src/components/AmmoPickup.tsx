import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGame, type AmmoPickup as AmmoPickupType } from "@/lib/stores/useGame";

interface AmmoPickupProps {
  pickup: AmmoPickupType;
}

export default function AmmoPickup({ pickup }: AmmoPickupProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const collectAmmo = useGame((state) => state.collectAmmo);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    meshRef.current.rotation.y += delta * 2;

    const playerPos = state.camera.position;
    const pickupPos = pickup.position;
    const distance = playerPos.distanceTo(pickupPos);

    if (distance < 1.5) {
      collectAmmo(pickup.id);
    }
  });

  return (
    <group position={pickup.position}>
      <mesh ref={meshRef} position={[0, 0.5, 0]}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color="#ffaa00" emissive="#ff8800" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.4, 8]} />
        <meshStandardMaterial color="#885500" />
      </mesh>
    </group>
  );
}
