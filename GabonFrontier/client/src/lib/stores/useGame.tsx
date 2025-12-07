import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import * as THREE from "three";

export type GamePhase = "intro" | "playing" | "victory" | "defeat";
export type WeaponType = "spear" | "rifle" | "grenade";

export interface Grenade {
  id: string;
  position: THREE.Vector3;
  direction: THREE.Vector3;
  speed: number;
  timeToExplode: number;
}

export interface Enemy {
  id: string;
  position: THREE.Vector3;
  health: number;
  patrolTarget: THREE.Vector3;
  isAggro: boolean;
  isDead: boolean;
}

export interface Bullet {
  id: string;
  position: THREE.Vector3;
  direction: THREE.Vector3;
  speed: number;
}

export interface AmmoPickup {
  id: string;
  position: THREE.Vector3;
  ammoAmount: number;
}

export interface Explosion {
  id: string;
  position: THREE.Vector3;
  radius: number;
  damage: number;
  maxRadius: number;
  hitEnemies: string[];
}

interface GameState {
  phase: GamePhase;
  playerHealth: number;
  playerMaxHealth: number;
  currentWeapon: WeaponType;
  rifleAmmo: number;
  maxRifleAmmo: number;
  grenadeCount: number;
  enemies: Enemy[];
  bullets: Bullet[];
  grenades: Grenade[];
  explosions: Explosion[];
  ammoPickups: AmmoPickup[];
  enemiesKilled: number;
  totalEnemies: number;
  
  // Actions
  start: () => void;
  restart: () => void;
  setPhase: (phase: GamePhase) => void;
  switchWeapon: () => void;
  damagePlayer: (amount: number) => void;
  healPlayer: (amount: number) => void;
  shootRifle: (position: THREE.Vector3, direction: THREE.Vector3) => void;
  shootEnemy: (position: THREE.Vector3, direction: THREE.Vector3) => void;
  throwGrenade: (position: THREE.Vector3, direction: THREE.Vector3) => void;
  updateGrenade: (id: string, position: THREE.Vector3, timeToExplode: number) => void;
  explodeGrenade: (grenadeId: string) => void;
  removeGrenade: (id: string) => void;
  removeExplosion: (id: string) => void;
  updateExplosion: (id: string, radius: number, hitEnemies: string[]) => void;
  addEnemy: (enemy: Enemy) => void;
  updateEnemy: (id: string, updates: Partial<Enemy>) => void;
  damageEnemy: (id: string, damage: number) => void;
  removeEnemy: (id: string) => void;
  updateBullet: (id: string, position: THREE.Vector3) => void;
  removeBullet: (id: string) => void;
  incrementKills: () => void;
  addAmmoPickup: (pickup: AmmoPickup) => void;
  collectAmmo: (id: string) => void;
}

export const useGame = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    phase: "intro",
    playerHealth: 100,
    playerMaxHealth: 100,
    currentWeapon: "rifle",
    rifleAmmo: 30,
    maxRifleAmmo: 30,
    grenadeCount: 3,
    enemies: [],
    bullets: [],
    grenades: [],
    explosions: [],
    ammoPickups: [],
    enemiesKilled: 0,
    totalEnemies: 5,
    
    start: () => {
      set({
        phase: "playing",
        playerHealth: 100,
        currentWeapon: "rifle",
        rifleAmmo: 30,
        grenadeCount: 3,
        enemies: [],
        bullets: [],
        grenades: [],
        explosions: [],
        ammoPickups: [],
        enemiesKilled: 0,
      });
    },
    
    restart: () => {
      set({
        phase: "intro",
        playerHealth: 100,
        currentWeapon: "rifle",
        rifleAmmo: 30,
        grenadeCount: 3,
        enemies: [],
        bullets: [],
        grenades: [],
        explosions: [],
        ammoPickups: [],
        enemiesKilled: 0,
      });
    },
    
    setPhase: (phase) => set({ phase }),
    
    switchWeapon: () => {
      const { currentWeapon } = get();
      set({ currentWeapon: currentWeapon === "rifle" ? "spear" : "rifle" });
      console.log("Switched weapon to:", currentWeapon === "rifle" ? "spear" : "rifle");
    },
    
    damagePlayer: (amount) => {
      set((state) => {
        const newHealth = Math.max(0, state.playerHealth - amount);
        if (newHealth === 0 && state.phase === "playing") {
          return { playerHealth: newHealth, phase: "defeat" };
        }
        return { playerHealth: newHealth };
      });
    },
    
    healPlayer: (amount) => {
      set((state) => ({
        playerHealth: Math.min(state.playerMaxHealth, state.playerHealth + amount),
      }));
    },
    
    shootRifle: (position, direction) => {
      const { rifleAmmo } = get();
      if (rifleAmmo > 0) {
        const bullet: Bullet = {
          id: `bullet-${Date.now()}-${Math.random()}`,
          position: position.clone(),
          direction: direction.clone().normalize(),
          speed: 50,
        };
        set((state) => ({
          bullets: [...state.bullets, bullet],
          rifleAmmo: state.rifleAmmo - 1,
        }));
        console.log("Rifle fired! Ammo remaining:", rifleAmmo - 1);
      } else {
        console.log("Out of ammo!");
      }
    },
    
    shootEnemy: (position, direction) => {
      const bullet: Bullet = {
        id: `enemy-bullet-${Date.now()}-${Math.random()}`,
        position: position.clone(),
        direction: direction.clone().normalize(),
        speed: 40,
      };
      set((state) => ({
        bullets: [...state.bullets, bullet],
      }));
      console.log("Enemy fired!");
    },
    
    throwGrenade: (position, direction) => {
      const { grenadeCount } = get();
      if (grenadeCount > 0) {
        const grenade: Grenade = {
          id: `grenade-${Date.now()}-${Math.random()}`,
          position: position.clone(),
          direction: direction.clone().normalize(),
          speed: 25,
          timeToExplode: 1,
        };
        set((state) => ({
          grenades: [...state.grenades, grenade],
          grenadeCount: state.grenadeCount - 1,
        }));
        console.log("Grenade thrown! Remaining:", grenadeCount - 1);
      }
    },
    
    updateGrenade: (id, position, timeToExplode) => {
      set((state) => ({
        grenades: state.grenades.map((g) =>
          g.id === id ? { ...g, position, timeToExplode } : g
        ),
      }));
    },
    
    explodeGrenade: (grenadeId) => {
      const state = get();
      const grenade = state.grenades.find((g) => g.id === grenadeId);
      if (!grenade) return;
      
      const explosion: Explosion = {
        id: `explosion-${Date.now()}-${Math.random()}`,
        position: grenade.position.clone(),
        radius: 0.5,
        maxRadius: 10,
        damage: 50,
        hitEnemies: [],
      };
      
      set({
        grenades: state.grenades.filter((g) => g.id !== grenadeId),
        explosions: [...state.explosions, explosion],
      });
      
      console.log(`Grenade exploded at`, grenade.position);
    },
    
    removeGrenade: (id) => {
      set((state) => ({
        grenades: state.grenades.filter((g) => g.id !== id),
      }));
    },
    
    removeExplosion: (id) => {
      set((state) => ({
        explosions: state.explosions.filter((e) => e.id !== id),
      }));
    },
    
    updateExplosion: (id, radius, hitEnemies) => {
      set((state) => ({
        explosions: state.explosions.map((e) =>
          e.id === id ? { ...e, radius, hitEnemies } : e
        ),
      }));
    },
    
    addEnemy: (enemy) => {
      set((state) => ({ enemies: [...state.enemies, enemy] }));
    },
    
    updateEnemy: (id, updates) => {
      set((state) => ({
        enemies: state.enemies.map((enemy) =>
          enemy.id === id ? { ...enemy, ...updates } : enemy
        ),
      }));
    },
    
    damageEnemy: (id, damage) => {
      const state = get();
      const enemy = state.enemies.find((e) => e.id === id);
      
      if (!enemy || enemy.isDead) return;
      
      const newHealth = Math.max(0, enemy.health - damage);
      console.log(`Enemy ${id} hit! Health: ${newHealth}`);
      
      if (newHealth === 0) {
        const newEnemies = state.enemies.map((e) =>
          e.id === id ? { ...e, health: 0, isDead: true } : e
        );
        const newKills = state.enemiesKilled + 1;
        
        console.log(`Enemy killed! Total: ${newKills}/${state.totalEnemies}`);
        
        const ammoPickup: AmmoPickup = {
          id: `ammo-${Date.now()}-${Math.random()}`,
          position: enemy.position.clone(),
          ammoAmount: 10,
        };
        
        setTimeout(() => {
          set((state) => ({
            enemies: state.enemies.filter((e) => e.id !== id),
          }));
        }, 500);
        
        if (newKills >= state.totalEnemies && state.phase === "playing") {
          set({
            enemies: newEnemies,
            enemiesKilled: newKills,
            ammoPickups: [...state.ammoPickups, ammoPickup],
            phase: "victory",
          });
        } else {
          set({
            enemies: newEnemies,
            enemiesKilled: newKills,
            ammoPickups: [...state.ammoPickups, ammoPickup],
          });
        }
      } else {
        set({
          enemies: state.enemies.map((e) =>
            e.id === id ? { ...e, health: newHealth, isAggro: true } : e
          ),
        });
      }
    },
    
    removeEnemy: (id) => {
      set((state) => ({
        enemies: state.enemies.filter((enemy) => enemy.id !== id),
      }));
    },
    
    updateBullet: (id, position) => {
      set((state) => ({
        bullets: state.bullets.map((bullet) =>
          bullet.id === id ? { ...bullet, position } : bullet
        ),
      }));
    },
    
    removeBullet: (id) => {
      set((state) => ({
        bullets: state.bullets.filter((bullet) => bullet.id !== id),
      }));
    },
    
    incrementKills: () => {
      set((state) => {
        const newKills = state.enemiesKilled + 1;
        console.log(`Enemy killed! Total: ${newKills}/${state.totalEnemies}`);
        if (newKills >= state.totalEnemies && state.phase === "playing") {
          return { enemiesKilled: newKills, phase: "victory" };
        }
        return { enemiesKilled: newKills };
      });
    },
    
    addAmmoPickup: (pickup) => {
      set((state) => ({
        ammoPickups: [...state.ammoPickups, pickup],
      }));
    },
    
    collectAmmo: (id) => {
      const state = get();
      const pickup = state.ammoPickups.find((p) => p.id === id);
      if (pickup) {
        const newAmmo = Math.min(state.maxRifleAmmo, state.rifleAmmo + pickup.ammoAmount);
        console.log(`Collected ${pickup.ammoAmount} ammo! Total: ${newAmmo}`);
        set((state) => ({
          ammoPickups: state.ammoPickups.filter((p) => p.id !== id),
          rifleAmmo: newAmmo,
        }));
      }
    },
  }))
);
