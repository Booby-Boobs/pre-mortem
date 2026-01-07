import Matter from 'matter-js';
import { createBlock, BlockType } from './blocks';
import { GameState, StageConfig } from './gamestate';

export interface GameConfig {
  logoUrl?: string; // Optional logo URL
  width?: number;
  height?: number;
  initialRunway?: number;
  stages?: StageConfig[];
  onCrisis?: (shout: string, desc: string) => void;
  chaosInterval?: number; // in ms
}

export class UnicornJengaGame {
  private engine: Matter.Engine;
  private render: Matter.Render;
  private runner: Matter.Runner;
  private container: HTMLElement;
  private width: number;
  private height: number;
  private mouseConstraint!: Matter.MouseConstraint;
  private currentQuote: { text: string, author: string } | null = null;
  private chaosTimer: number = 10000; // Debug: Initial event after 10s
  private chaosInterval: number = 90000; // Default 1.5 mins
  private onCrisis?: (shout: string, desc: string) => void;

  public gameState: GameState;
  public spawnVertical: boolean = false;
  
  constructor(container: HTMLElement, config: GameConfig = {}) {
    this.container = container;
    this.width = config.width || container.clientWidth || 800;
    this.height = config.height || container.clientHeight || 600;
    this.onCrisis = config.onCrisis;
    this.chaosInterval = config.chaosInterval || 90000; // 1.5 min default
    // Set first timer to 10s for debug as requested, or use config if provided
    this.chaosTimer = config.chaosInterval ? config.chaosInterval : 10000; 

    const defaultStages: StageConfig[] = [
        { name: 'Seed Round', threshold: 0, burnRate: 2_000 },
        { name: 'Series A', threshold: 100_000_000, burnRate: 10_000, fundingBonus: 250_000 },
        { name: 'Series B', threshold: 250_000_000, burnRate: 25_000, fundingBonus: 500_000 },
        { name: 'Series C', threshold: 500_000_000, burnRate: 50_000, fundingBonus: 1_000_000 },
        { name: 'Series D', threshold: 700_000_000, burnRate: 75_000, fundingBonus: 2_000_000 },
        { name: 'Series E', threshold: 850_000_000, burnRate: 100_000, fundingBonus: 5_000_000 },
        { name: 'Unicorn Status', threshold: 1_000_000_000, burnRate: 150_000, fundingBonus: 10_000_000 },
    ];

    this.gameState = new GameState({
      initialRunway: config.initialRunway || 200_000, 
      stages: config.stages || defaultStages
    });

    this.engine = Matter.Engine.create();
    this.render = Matter.Render.create({
      element: this.container,
      engine: this.engine,
      options: {
        width: this.width,
        height: this.height,
        wireframes: false,
        background: '#1a1a1a', 
      },
    });

    this.runner = Matter.Runner.create();
    
    this.initWorld();
    this.initMouse();
    this.initRenderLoop();
    this.initGameLoop();
    this.initControls();
    
    this.gameState.subscribe(() => {
        if (this.gameState.status === 'paused') {
            this.runner.enabled = false;
        } else if (this.gameState.status === 'playing') {
            this.runner.enabled = true;
        }
    });
  }

  private initControls() {
      window.addEventListener('keydown', (e) => {
          if ((e.key === 'r' || e.key === 'R') && this.gameState.isPlaying()) {
             this.rotateHeldBody();
          }
      });
  }

  private rotateHeldBody() {
      const body = this.mouseConstraint.body;
      if (body) {
          Matter.Body.rotate(body, 45 * (Math.PI / 180));
      }
  }

  private initWorld() {
    const { width, height } = this;
    const groundHeight = 60;
    
    const ground = Matter.Bodies.rectangle(width / 2, height - groundHeight / 2, width, groundHeight, { 
      isStatic: true,
      render: { fillStyle: '#333' }
    });
    
    Matter.Composite.add(this.engine.world, [ground]);
  }

  private initMouse() {
    const mouse = Matter.Mouse.create(this.render.canvas);
    this.mouseConstraint = Matter.MouseConstraint.create(this.engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false }
      }
    });

    Matter.Composite.add(this.engine.world, this.mouseConstraint);
    this.render.mouse = mouse;
  }

  public start() {
    Matter.Render.run(this.render);
    Matter.Runner.run(this.runner, this.engine);
  }

  public stop() {
    Matter.Render.stop(this.render);
    Matter.Runner.stop(this.runner);
  }

  private initRenderLoop() {
    Matter.Events.on(this.render, 'afterRender', () => {
      const context = this.render.context;
      const cx = this.width / 2;
      const officeWidth = 400;
      const dangerWidth = 700; 
      const topOffset = 100;
      
      const officeRect = { x: cx - officeWidth/2, y: topOffset, w: officeWidth, h: this.height - topOffset };
      const dangerRect = { x: cx - dangerWidth/2, y: topOffset - 50, w: dangerWidth, h: this.height - topOffset + 100 };

      // Office Zone
      context.beginPath();
      context.setLineDash([10, 10]);
      context.lineWidth = 2;
      context.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      context.strokeRect(officeRect.x, officeRect.y, officeRect.w, officeRect.h);
      
      context.font = '10px "Inter", sans-serif';
      context.fillStyle = 'rgba(255, 255, 255, 0.3)';
      context.textAlign = 'center';
      context.fillText("ACCURATE VALUATION ZONE", cx, officeRect.y - 15);

      // Quote
      if (!this.currentQuote) {
          const quotes = [
              { text: "WE ARE A\nFAMILY", author: "- CEO" },
              { text: "CHANGE THE\nWORLD", author: "- Founder" },
              { text: "DISRUPT\nEVERYTHING", author: "- VC" },
              { text: "MOVE FAST\nBREAK THINGS", author: "- Tech Lead" },
              { text: "RADICAL\nCANDOR", author: "- HR" },
              { text: "UNLIMITED\nPTO", author: "- Recruiter" },
              { text: "VISIONARY\nLEADER", author: "- LinkedIn" },
              { text: "10X\nGROWTH", author: "- Investor" },
              { text: "PIVOT\nTO AI", author: "- Board" }
          ];
          this.currentQuote = quotes[Math.floor(Math.random() * quotes.length)];
      }
      
      context.save();
      context.translate(cx, officeRect.y + officeRect.h / 3);
      context.rotate(-Math.PI / 12);
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.font = '900 48px "Inter", sans-serif';
      context.fillStyle = 'rgba(255, 255, 255, 0.05)';
      
      const lines = this.currentQuote.text.split('\n');
      lines.forEach((line, i) => context.fillText(line, 0, i * 50));
      
      context.font = 'italic 700 24px "Inter", sans-serif';
      context.fillStyle = 'rgba(255, 255, 255, 0.04)'; 
      context.fillText(this.currentQuote.author, 0, lines.length * 50 + 10);
      context.restore();

      // Danger Zone
      context.beginPath();
      context.setLineDash([]);
      context.lineWidth = 1;
      context.strokeStyle = 'rgba(255, 50, 50, 0.2)';
      context.strokeRect(dangerRect.x, dangerRect.y, dangerRect.w, dangerRect.h);

      // Block Labels
      context.font = 'bold 13px "Inter", sans-serif';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillStyle = '#FFFFFF';

      this.engine.world.bodies.forEach((body) => {
        if (!body.label || body.label.includes('Body')) return;
        if (body.isStatic) return;

        const data = (body as any).gameData;
        const isVested = data && data.vested;

        context.save();
        context.translate(body.position.x, body.position.y);
        context.rotate(body.angle);
        
        if (isVested) {
            context.shadowColor = '#00ff7f';
            context.shadowBlur = 10;
            context.fillStyle = '#00ff7f';
            context.fillText(body.label + " ✓", 0, 0);
        } else {
            context.shadowColor = 'black';
            context.shadowBlur = 4;
            context.fillStyle = '#FFFFFF';
            context.fillText(body.label, 0, 0);
        }
        
        context.restore();
      });
    });
  }

  private initGameLoop() { 
    Matter.Events.on(this.runner, 'afterUpdate', () => {
      if (!this.gameState.isPlaying()) return;

      const dt = this.runner.delta;
      this.gameState.tick(dt / 1000);

      // Chaos Timer
      if (this.gameState.valuation >= 1_000_000) { 
          this.chaosTimer -= dt;
          if (this.chaosTimer <= 0) {
              this.triggerChaosEvent();
              this.chaosTimer = this.chaosInterval;
          }
      }

      const cx = this.width / 2;
      const officeWidth = 400; 
      const dangerWidth = 700; 

      this.engine.world.bodies.forEach(body => {
          if (body.isStatic) return;
          const data = (body as any).gameData;
          
          const isOutside = Math.abs(body.position.x - cx) > dangerWidth / 2 || 
                            body.position.y > this.height + 50;

          if (isOutside) {
              Matter.Composite.remove(this.engine.world, body);
              const reasons = ["VC Scolding!", "Server Outage!", "GDPR Violation!", "TechCrunch Hit Piece!", "IP Lawsuit!"];
              this.gameState.penalty(50_000, reasons[Math.floor(Math.random() * reasons.length)]); 
              return;
          }

          if (data && !data.vested) {
              const IsStill = body.speed < 0.15 && Math.abs(body.angularVelocity) < 0.05;
              const Inside = Math.abs(body.position.x - cx) < officeWidth / 2;

              if (IsStill && Inside) {
                  data.vestTimer += this.runner.delta; 
                  if (data.vestTimer > 1000) { 
                      data.vested = true;
                      this.gameState.addValuation(data.value);
                  }
              } else {
                  data.vestTimer = 0; 
              }
          }
      });
    });
  }

  private triggerChaosEvent() {
      const eventId = Math.floor(Math.random() * 5);
      switch (eventId) {
          case 0:
              this.onCrisis?.("STRATEGIC PIVOT", "CEO: 'We are pivoting to AI!' (Gravity Shift)");
              this.engine.world.gravity.x = 0.2; // Reduced from 0.5 as requested
              setTimeout(() => { this.engine.world.gravity.x = 0; }, 5000);
              break;
          case 1:
              this.onCrisis?.("THE BIG REORG", "HR: 'New Org Chart Announced!' (No Friction)");
              this.engine.world.bodies.forEach(b => {
                  if (b.isStatic) return;
                  (b as any).oldFriction = b.friction;
                  b.friction = 0;
                  b.frictionStatic = 0;
              });
              setTimeout(() => {
                  this.engine.world.bodies.forEach(b => {
                      if (b.isStatic) return;
                      b.friction = (b as any).oldFriction || 0.1;
                      b.frictionStatic = 0.5;
                  });
              }, 5000);
              break;
          case 2:
              this.onCrisis?.("LEGACY DEPRECATION", "CTO: 'Deprecating v1 API!' (Ghost Blocks)");
              const active = this.engine.world.bodies.filter(b => !b.isStatic);
              if (active.length > 3) {
                  const target = active[Math.floor(Math.random() * active.length)];
                  target.isSensor = true;
                  setTimeout(() => { target.isSensor = false; }, 4000);
              }
              break;
          case 3:
              this.onCrisis?.("FEATURE CREEP", "PM: 'Just one more feature...' (1.2x Scaling)");
              this.engine.world.bodies.forEach(b => {
                  if (!b.isStatic) Matter.Body.scale(b, 1.2, 1.2);
              });
              break;
          case 4:
              this.onCrisis?.("VIRAL SPIKE", "DevOps: 'Traffic Spike!' (Earthquake)");
              let shakes = 0;
              const interval = setInterval(() => {
                  this.engine.world.bodies.forEach(b => {
                      if (!b.isStatic) Matter.Body.applyForce(b, b.position, { x: (Math.random()-0.5)*0.05, y: (Math.random()-0.5)*0.05 });
                  });
                  if (++shakes > 20) clearInterval(interval);
              }, 100);
              break;
      }
  }

  public toggleRotation() {
    this.spawnVertical = !this.spawnVertical;
  }

  public spawnBlock(type: BlockType) {
    if (!this.gameState.isPlaying()) return;
    if (Math.random() < 1/15) {
        const toxics = [BlockType.SLACKER, BlockType.CONTROL_FREAK, BlockType.PRIMA_DONNA, BlockType.QUIET_QUITTER, BlockType.SLACK_SPAMMER];
        type = toxics[Math.floor(Math.random() * toxics.length)];
    }

    if (type === BlockType.BOOTSTRAP) this.gameState.spendMoney(5_000); 
    else if (type === BlockType.VC) this.gameState.addMoney(75_000); // 1.5x of 50k

    const x = this.width / 2 + (Math.random() - 0.5) * 40; 
    const block = createBlock(x, y, type); // y is 100
    let angle = this.spawnVertical ? 90 * (Math.PI / 180) : 0;
    if (type === BlockType.VC) angle += (Math.random() - 0.5) * (30 * (Math.PI / 180));
    Matter.Body.setAngle(block, angle);

    (block as any).gameData = {
        type,
        value: type === BlockType.VC ? 50_000_000 : (type === BlockType.BOOTSTRAP ? 5_000_000 : 0),
        vested: false,
        vestTimer: 0
    };
    Matter.Composite.add(this.engine.world, block);
  }
}

// Fixed constant y at the end
const y = 100;
