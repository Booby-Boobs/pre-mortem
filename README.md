# Pre-Mortem: The Exit Simulator

Congratulations. You have decided to build a startup. This repository is a technical post-mortem of your future failure, conveniently packaged as a physics-based simulation. In this environment, you will attempt to stack "solid foundations" against "VC hype" while navigating the inevitable friction caused by "toxic employees" and management "pivots."

This is not a game. It is a documented collapse of a billion-dollar dream.

## Installation

Begin your descent into technical debt:

```bash
npm install pre-mortem
```

## Quick Start

Initialize your burn rate:

```typescript
import { PreMortem } from 'pre-mortem';

const container = document.getElementById('game-container');
const game = new PreMortem(container, {
  logoUrl: './assets/logo.png',
  width: 800,
  height: 600
});

game.start();
```

## Dynamic Configuration

The simulator is highly configurable, allowing you to fine-tune the exact parameters of your bankruptcy. Adjust the economy, round stages, and chaos frequency via the constructor.

### Configuration API

```typescript
interface GameConfig {
  logoUrl?: string;       // URL to startup logo overlay
  width?: number;         // Canvas width
  height?: number;        // Canvas height
  initialRunway?: number; // Starting cash (Default: 200,000)
  stages?: StageConfig[]; // Custom progression steps (The path to Unicorn)
  chaosInterval?: number; // Interval between corporate crises in ms (Default: 90000)
}

interface StageConfig {
  name: string;      // Display name (e.g., "Series A")
  threshold: number; // Valuation target to reach this stage
  burnRate: number;  // Cash drain per second ($)
}
```

### Example: The "Blitzscaling" Setup

```typescript
const game = new PreMortem(container, {
  initialRunway: 500000,
  chaosInterval: 30000, // Trigger chaos every 30 seconds for maximum instability
  stages: [
    { name: 'Garage Days', threshold: 0, burnRate: 100 },
    { name: 'Series A', threshold: 100000000, burnRate: 10000 },
    { name: 'Existential Crisis', threshold: 500000000, burnRate: 50000 },
    { name: 'Exit or Die', threshold: 1000000000, burnRate: 150000 }
  ]
});
```

## Folder Structure

- `src/index.ts`: Library entry point (exports `PreMortem`).
- `src/game.ts`: Core Matter.js physics engine and render loop (The Chaos Engine).
- `src/gamestate.ts`: Economic logic, stage progression, and runway management (The Burn Logic).
- `src/blocks.ts`: Definitions for Bootstrap, VC, and Toxic blocks (The Human Capital).
- `src/ui.ts`: HTML/CSS overlays for HUD, Legend, and Crises (The Illusion Layer).
- `dist/`: Generated bundles for distribution.

## Development & Publishing

### Local Development
To witness the collapse in a local environment:
```bash
npm run dev
```

### Build for Production
To generate UMD, ES modules, and TypeScript definitions:
```bash
npm run build
```

### How to Publish
1. Ensure the version in `package.json` is correct.
2. Run build: `npm run build`
3. Publish: `npm publish --access public`

## Satirical Gameplay Mechanics

- **Vesting Logic**: Blocks must stay stable within the "Office Zone" for 1 second to contribute to valuation. In this world, stability is the only currency.
- **Toxic Employees**: Spawns at 1/15 probability. These units have zero value and disruptive physics properties, perfectly mimicking real-world senior management.
- **Positive Irony**: Background quotes reflecting internal "culture" and industry jargon, providing the necessary cognitive dissonance for a true startup experience.

## License
ISC