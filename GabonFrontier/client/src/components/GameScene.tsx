import { useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { KeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { useGame } from "@/lib/stores/useGame";
import Terrain from "./Terrain";
import Player from "./Player";
import Enemy from "./Enemy";
import Bullet from "./Bullet";
import Grenade from "./Grenade";
import Explosion from "./Explosion";
import Village from "./Village";
import MapBoundary from "./MapBoundary";
import AmmoPickup from "./AmmoPickup";
import JungleTrees from "./JungleTrees";
import Hills from "./Hills";
import CoverObjects from "./CoverObjects";

enum Controls {
  forward = "forward",
  back = "back",
  left = "left",
  right = "right",
  jump = "jump",
}

export default function GameScene() {
  const enemies = useGame((state) => state.enemies);
  const bullets = useGame((state) => state.bullets);
  const grenades = useGame((state) => state.grenades);
  const explosions = useGame((state) => state.explosions);
  const ammoPickups = useGame((state) => state.ammoPickups);
  const addEnemy = useGame((state) => state.addEnemy);

  const keyMap = [
    { name: Controls.forward, keys: ["KeyW", "ArrowUp"] },
    { name: Controls.back, keys: ["KeyS", "ArrowDown"] },
    { name: Controls.left, keys: ["KeyA", "ArrowLeft"] },
    { name: Controls.right, keys: ["KeyD", "ArrowRight"] },
    { name: Controls.jump, keys: ["Space"] },
  ];

  useEffect(() => {
    console.log("Initializing enemies...");
    
    const enemyPositions = [
      new THREE.Vector3(10, 1, -15),
      new THREE.Vector3(-12, 1, -20),
      new THREE.Vector3(15, 1, -10),
      new THREE.Vector3(-8, 1, -25),
      new THREE.Vector3(0, 1, -30),
    ];

    enemyPositions.forEach((position, index) => {
      addEnemy({
        id: `enemy-${index}`,
        position: position,
        health: 100,
        patrolTarget: position.clone().add(new THREE.Vector3(5, 0, 5)),
        isAggro: false,
        isDead: false,
      });
    });

    console.log("Enemies initialized:", enemyPositions.length);
  }, [addEnemy]);

  return (
    <KeyboardControls map={keyMap}>
      <Canvas
        shadows
        camera={{
          position: [0, 1.7, 5],
          fov: 75,
          near: 0.1,
          far: 1000,
        }}
        gl={{
          antialias: true,
        }}
      >
        <color attach="background" args={["#87CEEB"]} />
        
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-30}
          shadow-camera-right={30}
          shadow-camera-top={30}
          shadow-camera-bottom={-30}
        />

        {/* Game Objects */}
        <Suspense fallback={null}>
          <Terrain />
          <Village />
          <MapBoundary />
          <JungleTrees />
          <Hills />
          <CoverObjects />
        </Suspense>
        
        <Player />
        
        {/* Render all enemies */}
        {enemies.map((enemy) => (
          <Enemy key={enemy.id} enemy={enemy} />
        ))}
        
        {/* Render all bullets */}
        {bullets.map((bullet) => (
          <Bullet key={bullet.id} bullet={bullet} />
        ))}
        
        {/* Render all grenades */}
        {grenades.map((grenade) => (
          <Grenade key={grenade.id} grenade={grenade} />
        ))}
        
        {/* Render all explosions */}
        {explosions.map((explosion) => (
          <Explosion key={explosion.id} explosion={explosion} />
        ))}
        
        {/* Render all ammo pickups */}
        {ammoPickups.map((pickup) => (
          <AmmoPickup key={pickup.id} pickup={pickup} />
        ))}
      </Canvas>
    </KeyboardControls>
  );
}
