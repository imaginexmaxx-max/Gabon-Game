# Freedom Fighter: Gabon 1960

## Overview

This is a first-person 3D action game built with React Three Fiber that tells the story of Gabon's independence struggle in 1960. Players defend their village from colonial forces using traditional weapons and captured rifles. The game features real-time 3D combat, enemy AI with patrol and aggro systems, and educational content about Gabon's path to independence.

The application is a full-stack TypeScript project with a React frontend using Three.js for 3D rendering, an Express backend, and PostgreSQL database support via Drizzle ORM. The project uses Vite for development and production builds, with separate entry points for development and production environments.

## User Preferences

Preferred communication style: Simple, everyday language.
Game language: French
Visual preferences: Visible weapons, solid boundaries, dense jungle terrain with natural barriers

## System Architecture

### Frontend Architecture

**3D Game Engine**
- **React Three Fiber**: Declarative Three.js rendering within React components
- **@react-three/drei**: Helper utilities for camera controls, keyboard inputs, and 3D primitives
- **@react-three/postprocessing**: Visual effects and shader support
- **Three.js**: Core 3D rendering engine for geometry, materials, and physics

The game scene is composed of modular React components (Player, Enemy, Bullet, Terrain) that each manage their own state and frame updates via `useFrame` hooks. This allows for clean separation of concerns where each entity handles its own behavior independently.

**State Management**
- **Zustand**: Lightweight state management for game state and audio controls
- Two main stores: `useGame` (game logic, entities, phases) and `useAudio` (sound effects, music)
- Uses Zustand's `subscribeWithSelector` middleware for reactive state updates

The game state tracks the player's health, weapons, ammunition, enemies, bullets, and game phase (intro, playing, victory, defeat). State updates trigger re-renders only for affected components, maintaining performance.

**UI Layer**
- **Radix UI**: Accessible, unstyled component primitives for dialogs, buttons, and overlays
- **Tailwind CSS**: Utility-first styling with custom theme configuration
- **shadcn/ui**: Pre-built component library built on Radix UI and Tailwind

UI components are separated from game rendering - screens (IntroScreen, EndScreen, HUD) overlay the 3D canvas and provide context-appropriate information without interfering with gameplay.

### Backend Architecture

**Server Framework**
- **Express.js**: HTTP server handling API routes and static file serving
- **Dual-mode operation**: Separate entry points for development (`index-dev.ts`) and production (`index-prod.ts`)

In development mode, Vite middleware is integrated into Express to provide hot module replacement and fast refresh. In production, Express serves pre-built static assets from the `dist/public` directory.

**Development Environment**
- Vite dev server integrated as Express middleware
- Custom error overlay plugin for runtime error reporting
- Source maps preserved for debugging

**Production Build**
- Client bundled with Vite (outputs to `dist/public`)
- Server bundled with esbuild (outputs to `dist/index.js`)
- ESM module format throughout the stack

The build process creates optimized bundles with code splitting for efficient loading. The server uses `esbuild` for fast bundling with external package dependencies.

### Data Storage

**Database Layer**
- **Drizzle ORM**: Type-safe SQL query builder with schema-first approach
- **PostgreSQL**: Production database (configured via `@neondatabase/serverless`)
- **In-memory storage**: Development/testing fallback (`MemStorage` class)

The storage interface (`IStorage`) abstracts CRUD operations, allowing the application to switch between in-memory and database storage without changing business logic. Currently implements user authentication schema but prepared for game data persistence.

**Schema Design**
- Single `users` table with username/password fields
- Schema defined in `shared/schema.ts` for type sharing between client and server
- Zod validation schemas auto-generated from Drizzle schemas

The shared schema approach ensures type safety across the stack - the same types are used in API requests, database queries, and frontend state.

### Game Logic Architecture

**Entity System**
- Enemies have patrol/chase AI with aggro detection
- Bullet collision detection via distance calculations
- Frame-based physics using delta time for consistent movement
- Ammo pickups spawn when enemies are killed, providing 10 rifle rounds each (capped at 30 total)

Each entity type (Enemy, Bullet, Player, AmmoPickup) encapsulates its own update logic in `useFrame` hooks, processing position updates, collision checks, and state transitions every frame.

**Combat Mechanics**
- Two weapon types: melee (spear) and ranged (rifle)
- Rifle has limited ammunition requiring resource management
- Spear attack uses distance and angle checks to hit enemies in melee range (3 units)
- Enemies patrol until player enters aggro range, then chase
- Damage system with health tracking for both player and enemies
- Killed enemies drop ammo pickups that auto-collect when player is nearby

**World Environment**
- Village setting with 5 traditional huts featuring cylindrical bases, conical grass roofs, and wooden doors
- Map boundaries at ±24 units with transparent walls and corner posts
- Player movement clamped to ±23 units to prevent escaping the play area
- Colonial soldiers rendered as multi-part 3D models with dark blue uniforms, white crossed belts, red collars, bicorne hats with gold trim and red plumes, and brown rifles

**Camera System**
- First-person perspective with pointer-lock mouse controls
- Yaw (left/right) and pitch (up/down) rotation tracked separately in refs
- Camera rotation order set to 'YXZ' with Z-axis locked to prevent roll
- Pitch clamped to ±90 degrees to prevent over-rotation

**Game Phases**
- Intro: Story context and controls explanation
- Playing: Active gameplay with combat
- Victory: All enemies defeated
- Defeat: Player health reaches zero

Phase transitions are managed through Zustand state, triggering appropriate UI overlays while keeping the game scene rendered in the background for visual continuity.

### Audio System

**Sound Management**
- Background music (looped, adjustable volume)
- Sound effects (hit impacts, success chimes)
- Mute toggle with persistent state
- Audio preloading on component mount

The audio store (`useAudio`) manages HTML5 Audio elements, providing playback controls and mute state. Sounds are cloned before playback to allow overlapping effects.

## External Dependencies

**Core Libraries**
- `react` & `react-dom`: UI framework
- `@react-three/fiber`: React renderer for Three.js
- `three`: 3D graphics library
- `express`: Web server framework
- `drizzle-orm`: Database ORM
- `zustand`: State management

**Development Tools**
- `vite`: Build tool and dev server
- `typescript`: Type checking and compilation
- `tsx`: TypeScript execution for Node.js
- `esbuild`: Fast JavaScript bundler
- `drizzle-kit`: Database migration tool
- `tailwindcss`: CSS framework

**Database**
- `@neondatabase/serverless`: PostgreSQL client for serverless environments
- `pg`: PostgreSQL client (via Drizzle)

**UI Components**
- `@radix-ui/*`: Accessible component primitives (20+ packages)
- `tailwind-merge` & `clsx`: Utility class management
- `class-variance-authority`: Component variant styling

**3D Utilities**
- `@react-three/drei`: Three.js helpers and abstractions
- `@react-three/postprocessing`: Visual effects pipeline
- `vite-plugin-glsl`: GLSL shader support in Vite

**Additional Libraries**
- `@tanstack/react-query`: Server state management (configured but not actively used)
- `date-fns`: Date manipulation utilities
- `zod`: Runtime type validation
- `nanoid`: Unique ID generation

The application is designed as a monorepo with shared code between client and server (`shared/` directory), using path aliases (`@/*` for client, `@shared/*` for shared) to maintain clean imports across the codebase.