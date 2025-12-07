import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { useGame } from "@/lib/stores/useGame";
import { useAudio } from "@/lib/stores/useAudio";

enum Controls {
  forward = "forward",
  back = "back",
  left = "left",
  right = "right",
  jump = "jump",
}

export default function Player() {
  const playerRef = useRef<THREE.Group>(null);
  const velocityRef = useRef(new THREE.Vector3());
  const directionRef = useRef(new THREE.Vector3());
  const yawRef = useRef(0);
  const pitchRef = useRef(0);
  const { camera } = useThree();
  const [, getKeys] = useKeyboardControls<Controls>();
  
  const switchWeapon = useGame((state) => state.switchWeapon);
  const playHit = useAudio((state) => state.playHit);
  const throwGrenade = useGame((state) => state.throwGrenade);
  const cameraShakeRef = useRef(0);

  const moveSpeed = 8;
  const mouseSensitivity = 0.002;
  const playerHeight = 1.7;
  const attackRange = 3;
  const jumpForce = 8;
  
  const jumpVelocityRef = useRef(0);
  const isJumpingRef = useRef(false);
  
  // Tree collision data - tight to actual tree foliage (matches JungleTrees component)
  const trees = [
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
  ];
  
  // House collision data (from Village component)
  const houses = [
    { x: -8, z: 5, radius: 2.8 },
    { x: -12, z: 3, radius: 2.8 },
    { x: 10, z: 8, radius: 2.8 },
    { x: 8, z: 12, radius: 2.8 },
    { x: 0, z: 15, radius: 2.8 },
  ];

  // Hill collision data (from Hills component) - prevents walking into hills
  const hills = [
    { x: -15, z: -20, radius: 2.8, height: 1.2 },
    { x: 10, z: -25, radius: 3.3, height: 1.3 },
    { x: 20, z: 5, radius: 2.5, height: 1 },
    { x: -20, z: 10, radius: 3.3, height: 1.2 },
    { x: 5, z: 20, radius: 2.8, height: 1.1 },
  ];

  // Cover object collision data (from CoverObjects component)
  const coverObjects = [
    { x: -5, z: -15, width: 2, height: 2.5, depth: 3 },
    { x: 12, z: -8, width: 2.5, height: 2.2, depth: 2 },
    { x: -18, z: 0, width: 3, height: 2, depth: 1.5 },
    { x: 8, z: 8, width: 2, height: 2.8, depth: 2.5 },
    { x: 0, z: 12, width: 2.5, height: 2, depth: 3 },
  ];


  const checkTreeCollision = (x: number, z: number): boolean => {
    const collisionRadius = 0.5; // Player collision radius
    for (const tree of trees) {
      const dx = x - tree.x;
      const dz = z - tree.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      if (distance < tree.radius + collisionRadius) {
        return true; // Collision detected
      }
    }
    return false; // No collision
  };

  const checkHouseCollision = (x: number, z: number): boolean => {
    const collisionRadius = 0.5; // Player collision radius
    for (const house of houses) {
      const dx = x - house.x;
      const dz = z - house.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      if (distance < house.radius + collisionRadius) {
        return true; // Collision detected
      }
    }
    return false; // No collision
  };

  const checkHillCollision = (x: number, z: number): boolean => {
    const collisionRadius = 0.5; // Player collision radius
    for (const hill of hills) {
      const dx = x - hill.x;
      const dz = z - hill.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      if (distance < hill.radius + collisionRadius) {
        return true; // Collision detected
      }
    }
    return false; // No collision
  };

  const checkCoverCollision = (x: number, z: number): boolean => {
    const collisionRadius = 0.5; // Player collision radius
    for (const cover of coverObjects) {
      const dx = x - cover.x;
      const dz = z - cover.z;
      if (
        Math.abs(dx) < cover.width / 2 + collisionRadius &&
        Math.abs(dz) < cover.depth / 2 + collisionRadius
      ) {
        return true; // Collision detected
      }
    }
    return false; // No collision
  };


  const handleAttack = () => {
    const currentWeapon = useGame.getState().currentWeapon;
    const shootRifle = useGame.getState().shootRifle;
    const damageEnemy = useGame.getState().damageEnemy;
    const enemies = useGame.getState().enemies;
    
    if (currentWeapon === "rifle") {
      const direction = new THREE.Vector3(0, 0, -1);
      direction.applyQuaternion(camera.quaternion);
      shootRifle(camera.position.clone(), direction);
      playHit();
    } else {
      // Spear melee attack
      const direction = new THREE.Vector3(0, 0, -1);
      direction.applyQuaternion(camera.quaternion);
      const raycastOrigin = camera.position.clone();
      
      console.log("Spear attack! Checking", enemies.length, "enemies");
      enemies.forEach((enemy) => {
        const distance = raycastOrigin.distanceTo(enemy.position);
        console.log(`Enemy ${enemy.id}: distance=${distance.toFixed(2)}, attackRange=${attackRange}`);
        if (distance < attackRange) {
          const toEnemy = enemy.position.clone().sub(raycastOrigin).normalize();
          const dot = direction.dot(toEnemy);
          console.log(`Enemy ${enemy.id} in range! dot=${dot.toFixed(2)}`);
          if (dot > 0.8) {
            damageEnemy(enemy.id, 50);
            playHit();
            console.log("Spear hit enemy!");
          }
        }
      });
    }
  };

  // Mouse look controls
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement) {
        yawRef.current -= event.movementX * mouseSensitivity;
        pitchRef.current -= event.movementY * mouseSensitivity;
        pitchRef.current = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitchRef.current));
        
        camera.rotation.order = 'YXZ';
        camera.rotation.y = yawRef.current;
        camera.rotation.x = pitchRef.current;
        camera.rotation.z = 0;
      }
    };

    const handleClick = () => {
      if (!document.pointerLockElement) {
        document.body.requestPointerLock();
      } else {
        handleAttack();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "q" || event.key === "Q") {
        switchWeapon();
      }
      if (event.code === "Space") {
        event.preventDefault();
        if (!isJumpingRef.current && camera.position.y === playerHeight) {
          jumpVelocityRef.current = jumpForce;
          isJumpingRef.current = true;
        }
      }
      if (event.key === "e" || event.key === "E") {
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(camera.quaternion);
        throwGrenade(camera.position.clone().add(new THREE.Vector3(0, -0.3, 0)), direction);
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [camera, switchWeapon, playHit]);

  useFrame((_, delta) => {
    if (!playerRef.current) return;

    // Handle camera shake from explosions
    const explosions = useGame.getState().explosions;
    if (explosions.length > 0 && cameraShakeRef.current === 0) {
      cameraShakeRef.current = 0.3;
    }
    
    if (cameraShakeRef.current > 0) {
      cameraShakeRef.current -= delta;
      const shakeAmount = Math.pow(Math.max(0, cameraShakeRef.current) / 0.3, 2) * 0.2;
      camera.position.x += (Math.random() - 0.5) * shakeAmount;
      camera.position.y += (Math.random() - 0.5) * shakeAmount;
      camera.position.z += (Math.random() - 0.5) * shakeAmount;
    }

    const keys = getKeys();
    const direction = directionRef.current;
    direction.set(0, 0, 0);

    if (keys.forward) direction.z -= 1;
    if (keys.back) direction.z += 1;
    if (keys.left) direction.x -= 1;
    if (keys.right) direction.x += 1;

    if (direction.length() > 0) {
      direction.normalize();
      
      const euler = new THREE.Euler(0, yawRef.current, 0, "YXZ");
      direction.applyEuler(euler);
      
      velocityRef.current.x = direction.x * moveSpeed;
      velocityRef.current.z = direction.z * moveSpeed;
    } else {
      velocityRef.current.x *= 0.9;
      velocityRef.current.z *= 0.9;
    }

    const newX = camera.position.x + velocityRef.current.x * delta;
    const newZ = camera.position.z + velocityRef.current.z * delta;
    
    const boundaryLimit = 23;
    
    // Check all collisions: trees, houses, hills, and cover objects
    const finalX = (checkTreeCollision(newX, camera.position.z) || checkHouseCollision(newX, camera.position.z) || checkHillCollision(newX, camera.position.z) || checkCoverCollision(newX, camera.position.z))
      ? camera.position.x 
      : Math.max(-boundaryLimit, Math.min(boundaryLimit, newX));
    const finalZ = (checkTreeCollision(camera.position.x, newZ) || checkHouseCollision(camera.position.x, newZ) || checkHillCollision(camera.position.x, newZ) || checkCoverCollision(camera.position.x, newZ))
      ? camera.position.z 
      : Math.max(-boundaryLimit, Math.min(boundaryLimit, newZ));
    
    camera.position.x = finalX;
    camera.position.z = finalZ;
    
    // Jump physics
    jumpVelocityRef.current -= 9.8 * delta; // Gravity
    if (camera.position.y + jumpVelocityRef.current * delta <= playerHeight) {
      camera.position.y = playerHeight;
      jumpVelocityRef.current = 0;
      isJumpingRef.current = false;
    } else {
      camera.position.y += jumpVelocityRef.current * delta;
    }
    
    camera.rotation.order = 'YXZ';
    camera.rotation.z = 0;

    playerRef.current.position.copy(camera.position);
  });

  const currentWeapon = useGame((state) => state.currentWeapon);

  return (
    <>
      <group ref={playerRef} />
      {/* Spear visible in right hand - positioned relative to camera, always in frame */}
      {currentWeapon === "spear" && (
        <group position={[camera.position.x + 0.6, camera.position.y - 0.6, camera.position.z - 0.5]}>
          {/* Shaft */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 2.5, 8]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
          {/* Spearhead */}
          <mesh position={[0, 1.3, 0]}>
            <coneGeometry args={[0.15, 0.6, 8]} />
            <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      )}
      
      {/* Rifle visible in right hand - positioned relative to camera, always in frame, pointing forward - AK-47 style */}
      {currentWeapon === "rifle" && (
        <group position={[camera.position.x + 0.4, camera.position.y - 0.5, camera.position.z - 0.4]}>
          {/* Main barrel - long and straight */}
          <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.045, 0.045, 2.2, 8]} />
            <meshStandardMaterial color="#3a3a3a" />
          </mesh>
          
          {/* Receiver/body - long box */}
          <mesh position={[0, -0.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <boxGeometry args={[0.12, 1.8, 0.1]} />
            <meshStandardMaterial color="#4a4a4a" />
          </mesh>
          
          {/* Curved magazine - banana style */}
          <mesh position={[-0.25, -0.4, 0.1]} rotation={[Math.PI / 2, 0, 0.3]}>
            <boxGeometry args={[0.12, 0.9, 0.15]} />
            <meshStandardMaterial color="#2a2a2a" />
          </mesh>
          
          {/* Stock/grip at back */}
          <mesh position={[-0.35, -0.25, -0.5]} rotation={[0.2, 0, 0]}>
            <boxGeometry args={[0.15, 0.4, 0.2]} />
            <meshStandardMaterial color="#5a4a3a" />
          </mesh>
          
          {/* Front sight/gas tube */}
          <mesh position={[0.15, 0.2, 0]}>
            <boxGeometry args={[0.08, 0.35, 0.08]} />
            <meshStandardMaterial color="#3a3a3a" />
          </mesh>
          
          {/* Rear sight */}
          <mesh position={[-0.1, 0.2, 0]}>
            <boxGeometry args={[0.08, 0.3, 0.08]} />
            <meshStandardMaterial color="#3a3a3a" />
          </mesh>
          
          {/* Handguard details - rails */}
          <mesh position={[0.1, -0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <boxGeometry args={[0.08, 1.2, 0.04]} />
            <meshStandardMaterial color="#4a4a4a" />
          </mesh>
        </group>
      )}
    </>
  );
}
