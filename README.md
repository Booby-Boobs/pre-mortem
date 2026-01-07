# Project Pre-Mortem: Enterprise Risk Visualization

> *"Optimism is a bug. Physics is the feature."*

**Pre-Mortem** is a deterministic simulation engine designed to visualize the structural integrity of high-growth organizations. By mapping "Technical Debt" and "Venture Capital Hype" to Matter.js physics bodies, we provide stakeholders with a realistic forecast of the inevitable entropy.

(日本語: これは「御社の崩壊」を物理演算でシミュレートするための、高度に不謹慎な教育的ツールです)

## Use Case (Why install this?)

* **For Engineers:** Visualize why "adding AI" to a spaghetti codebase will cause a segmentation fault in reality.
* **For PMs:** A hands-on demonstration of why "Feature Creep" scales linearly with "Gravity."
* **For Founders:** An anxiety simulator to practice the "Exit" timing before the runway hits zero.

## Architecture (The Metaphors)

The simulation consists of three core primitives:

### 1. The Foundation (Legacy & Work)

* **Attributes:** High Density, High Friction, Zero Restitution.
* **Examples:** Refactoring, Unit Tests, Compliance, Bug Fixes.
* **Behavior:** Boring, heavy, and essential. Without these, your valuation means nothing.

### 2. The Growth Factors (Hype & Noise)

* **Attributes:** Low Density, High Bounciness, Irregular Geometry.
* **Examples:** GenAI, Web3, Pivot, Thought Leadership.
* **Behavior:** Rapidly increases vertical valuation but introduces catastrophic structural instability.

### 3. Human Capital Friction (The "Culture")

* **Dead Wood:** Objects that consume runway (space) but provide zero structural support.
* **Toxic Agents:** The Slacker (Slippery), The Prima Donna (Oddly shaped), The Control Freak (Micromanages physics).

## Quick Start (Deployment)

### Method A: The "Shadow IT" Integration (NPM)

Install it secretly into your internal dashboard.

```bash
npm install project-risk-visualizer
```

```typescript
import { PreMortem } from 'project-risk-visualizer';

// Trigger this on a hidden Konami code or 404 page
const simulation = new PreMortem(document.body, {
  logoUrl: "/api/v1/assets/logo.png", // <--- REPLACE THIS
  initialRunway: 5000000,
  stages: [
    { name: 'Seed', threshold: 0, burnRate: 2000 },
    { name: 'IPO', threshold: 1000000000, burnRate: 500000 }
  ]
});

simulation.start();
```

### Method B: Standalone Hosting (Docker)

Perfect for hosting at http://internal-tools/strategy.

```bash
git clone https://github.com/your-org/pre-mortem.git
cd pre-mortem
# Edit src/game.ts to match your company's actual burn rate
npm install
npm run dev
```

## Chaos Events (Roadmap)

The engine includes stochastic market events to test organizational resilience:

* **Strategic Pivot**: Gravity vector randomizes due to sudden CEO intervention.
* **The Big Reorg**: All friction is temporarily set to 0. Objects slide uncontrollably.
* **Legacy Deprecation**: Randomly ghost base blocks to simulate technical debt realization.

## Contributing

Pull requests are welcome. Please ensure all new "Hype Blocks" have a density lower than 0.001.
If you are from HR, please close this tab immediately.

## License

ISC. Use at your own career risk.