import { UnicornJengaGame, GameConfig } from './game';
import { UIManager } from './ui';

export class UnicornJenga {
  private game: UnicornJengaGame;
  private ui: UIManager;

  constructor(container: HTMLElement, config: GameConfig = {}) {
    this.game = new UnicornJengaGame(container, {
        ...config,
        onCrisis: (shout, desc) => this.ui.showCrisisAlert(shout, desc)
    });
    this.ui = new UIManager(container, {
      onSpawn: (type) => this.game.spawnBlock(type),
      onRotate: () => this.game.toggleRotation(),
      gameState: this.game.gameState,
    });

    if (config.logoUrl) {
      this.ui.showLogo(config.logoUrl);
    }
  }

  public start() {
    this.game.start();
  }
}

// Export parts if needed directly
export { UnicornJengaGame, UIManager };
