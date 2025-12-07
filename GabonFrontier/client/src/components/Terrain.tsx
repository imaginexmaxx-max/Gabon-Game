import { useTexture } from "@react-three/drei";

export default function Terrain() {
  const grassTexture = useTexture("/textures/grass.png");
  
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial map={grassTexture} />
    </mesh>
  );
}
