export default function MapBoundary() {
  const boundarySize = 48;
  const wallHeight = 5;
  const wallThickness = 1;

  return (
    <group>
      {/* North wall */}
      <mesh position={[0, wallHeight / 2, -boundarySize / 2]}>
        <boxGeometry args={[boundarySize, wallHeight, wallThickness]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      {/* South wall */}
      <mesh position={[0, wallHeight / 2, boundarySize / 2]}>
        <boxGeometry args={[boundarySize, wallHeight, wallThickness]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      {/* East wall */}
      <mesh position={[boundarySize / 2, wallHeight / 2, 0]}>
        <boxGeometry args={[wallThickness, wallHeight, boundarySize]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      {/* West wall */}
      <mesh position={[-boundarySize / 2, wallHeight / 2, 0]}>
        <boxGeometry args={[wallThickness, wallHeight, boundarySize]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      {/* Corner posts */}
      {[
        [-boundarySize / 2, -boundarySize / 2],
        [boundarySize / 2, -boundarySize / 2],
        [-boundarySize / 2, boundarySize / 2],
        [boundarySize / 2, boundarySize / 2],
      ].map(([x, z], index) => (
        <mesh key={index} position={[x, wallHeight / 2, z]}>
          <boxGeometry args={[wallThickness * 2, wallHeight, wallThickness * 2]} />
          <meshStandardMaterial color="#4a3728" />
        </mesh>
      ))}
    </group>
  );
}
