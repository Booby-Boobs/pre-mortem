export interface StageConfig {
  name: string;
  threshold: number; // Valuation required to reach this stage
  burnRate: number; // Dollars per second
  fundingBonus?: number; // Cash awarded when reaching this stage
}

export interface GameStateConfig {
  initialRunway: number;
  stages: StageConfig[];
}

export enum GameStatus {
  PLAYING = 'playing',
  PAUSED = 'paused', 
  BANKRUPT = 'bankrupt',
  COLLAPSED = 'collapsed',
  WIN = 'exited',
}

export class GameState {
  public runway: number;
  public valuation: number = 0;
  public stage: string; // Dynamic name
  public status: GameStatus = GameStatus.PLAYING;
  public lastPenaltyReason: string = '';
  
  private config: GameStateConfig;
  private currentStageIndex: number = 0;
  private listeners: ((event?: string) => void)[] = [];

  constructor(config: GameStateConfig) {
    this.config = config;
    this.runway = config.initialRunway;
    
    // Validate stages
    if (!this.config.stages || this.config.stages.length === 0) {
        throw new Error("Game must have at least one stage defined.");
    }
    
    // Sort stages by threshold to be safe
    this.config.stages.sort((a, b) => a.threshold - b.threshold);

    this.currentStageIndex = 0;
    this.stage = this.config.stages[0].name;
    this.checkStage();
  }

  public setPaused(paused: boolean) {
      if (paused) {
          if (this.status === GameStatus.PLAYING) this.status = GameStatus.PAUSED;
      } else {
          if (this.status === GameStatus.PAUSED) this.status = GameStatus.PLAYING;
      }
      this.notify();
  }

  public togglePause() {
      this.setPaused(this.status === GameStatus.PLAYING);
  }

  public tick(dt: number) {
    if (this.status !== GameStatus.PLAYING) return;
    
    const safeDt = Math.min(dt, 0.1); 
    const currentBurnRate = this.getDynamicBurnRate();
    
    this.runway -= currentBurnRate * safeDt;

    if (this.runway <= 0) {
      this.runway = 0;
      this.status = GameStatus.BANKRUPT;
    }
    
    // Check win condition (Final Stage Reached?)
    // Actually, traditionally Unicorn Jenga ends at Unicorn. 
    // Let's assume the LAST stage is the goal? Or specific logic?
    // User said "Next is where...", implies progression.
    // If we exceed the highest threshold, we win?
    
    const finalStage = this.config.stages[this.config.stages.length - 1];
    if (this.valuation >= finalStage.threshold && this.status === GameStatus.PLAYING) {
         this.status = GameStatus.WIN;
    }

    this.checkStage();
    this.notify();
  }

  private getDynamicBurnRate(): number {
      return this.config.stages[this.currentStageIndex].burnRate;
  }

  public addValuation(amount: number) {
    this.valuation += amount;
    this.checkStage();
    this.notify();
  }

  public spendMoney(amount: number) {
    this.runway -= amount;
    this.notify();
  }

  public addMoney(amount: number) {
    this.runway += amount;
    this.notify();
  }
  
  public setCollapsed() {
    if (this.status !== GameStatus.PLAYING) return;
    this.status = GameStatus.COLLAPSED;
    this.notify();
  }

  public getNextStageThreshold(): number {
      // Return the threshold of the NEXT stage
      if (this.currentStageIndex < this.config.stages.length - 1) {
          return this.config.stages[this.currentStageIndex + 1].threshold;
      }
      // If at last stage, goal is met? Or maybe return the current threshold?
      return this.config.stages[this.config.stages.length - 1].threshold;
  }

  public penalty(amount: number, reason: string) {
    this.runway -= amount;
    this.lastPenaltyReason = reason;
    if (this.runway < 0) {
      this.runway = 0;
      this.status = GameStatus.BANKRUPT;
    }
    this.notify('penalty');
  }

  private checkStage() {
    // Determine stage based on valuation
    // Find highest threshold we have crossed
    let newIndex = 0;
    for (let i = 0; i < this.config.stages.length; i++) {
        if (this.valuation >= this.config.stages[i].threshold) {
            newIndex = i;
        } else {
            break; // Since we sorted, we can stop
        }
    }
    
    if (newIndex !== this.currentStageIndex) {
        // Award bonus if we progressed forward
        if (newIndex > this.currentStageIndex) {
            const bonus = this.config.stages[newIndex].fundingBonus || 0;
            if (bonus > 0) {
                this.addMoney(bonus);
                this.notify('funding:' + bonus);
            }
        }
        this.currentStageIndex = newIndex;
        this.stage = this.config.stages[newIndex].name;
    }
  }

  public subscribe(listener: (event?: string) => void) {
    this.listeners.push(listener);
  }

  private notify(event?: string) {
    this.listeners.forEach((listener) => listener(event));
  }

  public isPlaying(): boolean {
    return this.status === GameStatus.PLAYING;
  }

  public isBankrupt(): boolean {
    return this.status === GameStatus.BANKRUPT;
  }
}
