# Unicorn Jenga: The Exit Simulator 🦄🏢

A satirical startup physics game built with Matter.js and TypeScript. Balance your "solid" foundations against "VC hype" while avoiding "toxic employees" to reach a billion-dollar exit.

## Installation

```bash
npm install unicorn-jenga
```

## Quick Start

```typescript
import { UnicornJenga } from 'unicorn-jenga';

const container = document.getElementById('game-container');
const game = new UnicornJenga(container, {
  logoUrl: './assets/logo.png',
  width: 800,
  height: 600
});

game.start();
```

## Dynamic Configuration

The game is designed to be highly configurable. You can adjust the economy, stages, and visual branding dynamically via the constructor.

### Configuration API

```typescript
interface GameConfig {
  logoUrl?: string;       // URL to startup logo overlay
  width?: number;         // Canvas width
  height?: number;        // Canvas height
  initialRunway?: number; // Starting cash (Default: 200,000)
  stages?: StageConfig[]; // Custom progression steps
  chaosInterval?: number; // Optional: Interval between chaos events in ms (Default: 90000)
}

interface StageConfig {
  name: string;      // Display name (e.g., "Seed Round")
  threshold: number; // Valuation target to reach this stage
  burnRate: number;  // Cash drain per second ($)
}
```

### Example: Custom Economy

```typescript
const game = new UnicornJenga(container, {
  initialRunway: 500000,
  chaosInterval: 10000, // Trigger chaos every 10 seconds for debug (Normal: 90000)
  stages: [
    { name: 'Garage Days', threshold: 0, burnRate: 100 },
    { name: 'Series A', threshold: 25000000, burnRate: 10000 },
    { name: 'Unicorn Status', threshold: 1000000000, burnRate: 100000 }
  ]
});
```

## Folder Structure

- `src/index.ts`: Library entry point (exports `UnicornJenga`).
- `src/game.ts`: Core Matter.js physics engine and render loop.
- `src/gamestate.ts`: Economic logic, stage progression, and runway management.
- `src/blocks.ts`: Definitions for Bootstrap, VC, and Toxic blocks.
- `src/ui.ts`: HTML/CSS overlays for HUD, Legend, and Modals.
- `dist/`: Generated bundles for distribution.

## Development & Publishing

### Local Development
To start the dev server for testing:
```bash
npm run dev
```

### Build for NPM
To generate UMD, ES modules, and TypeScript definitions:
```bash
npm run build
```

### How to Publish
1. Ensure the version in `package.json` is correct.
2. Run build: `npm run build`
3. Publish: `npm publish --access public` (if it's the first time, ensure you're logged into npm).

## Satirical Gameplay Mechanics

- **Vesting Logic**: Blocks must stay stable within the **Office Zone** for 1 second to contribute to valuation.
- **Toxic Employees**: Spawns at 1/15 probability. These units have 0 value and disruptive physics properties (rolling, hex-wedges, etc.).
- **Positive Irony**: Background "office vibes" quotes randomly selected from industry jargon.

## License
ISC