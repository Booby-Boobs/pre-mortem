import { BlockType, BLOCK_DEFINITIONS } from './blocks';
import { GameState } from './gamestate';

export interface UIOptions {
  onSpawn: (type: BlockType) => void;
  onRotate: () => void;
  gameState: GameState;
}

export class UIManager {
  private container: HTMLElement;
  private options: UIOptions;
  private hudElement!: HTMLElement;

  constructor(container: HTMLElement, options: UIOptions) {
    this.container = container;
    this.options = options;
    this.initStyles();
    this.createHUD();
    this.createControls();
    this.createLegend();
    this.createSystemButtons();
    
    // Subscribe to updates
    this.options.gameState.subscribe((event) => {
      this.updateHUD();
      if (event === 'penalty') {
          this.showToast(`-${this.options.gameState.lastPenaltyReason}`, 'danger');
      } else if (event?.startsWith('funding:')) {
          const amount = event.split(':')[1];
          this.showToast(`+$${parseInt(amount).toLocaleString()} Series Funding!`, 'info');
      }
    });
    this.updateHUD(); // Initial render
  }

  private initStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .uj-hud {
        position: absolute;
        top: 20px; /* Restored to top */
        right: 20px;
        color: #fff;
        font-family: 'Inter', sans-serif;
        text-align: right;
        pointer-events: none;
        z-index: 100;
      }
      /* ... existing styles ... */
      .uj-sys-btn {
        background: rgba(255,255,255,0.1);
        border: 1px solid rgba(255,255,255,0.3);
        color: #fff;
        padding: 6px 10px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 11px; /* Slightly smaller to be discreet */
        font-family: 'Inter', sans-serif;
        transition: background 0.2s;
        pointer-events: auto;
      }
      .uj-sys-btn:hover { background: rgba(255,255,255,0.2); }
      .uj-sys-container {
        position: absolute;
        bottom: 20px; /* Moved to bottom */
        left: 20px;   /* Moved to left */
        display: flex;
        gap: 10px;
        z-index: 200;
        opacity: 0.6; /* Make them even less conspicuous */
        transition: opacity 0.2s;
      }
      .uj-sys-container:hover { opacity: 1; }
      .uj-stat-label {
        font-size: 12px;
        color: #888;
        text-transform: uppercase;
      }
      .uj-stat-value {
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 10px;
      }
      .uj-stat-value.danger {
        color: #ff4444;
      }
      .uj-controls {
        position: absolute;
        bottom: 20px;
        right: 20px; /* Aligned with HUD */
        display: flex;
        flex-direction: column; /* Stack vertically for cleaner look on right side? Or Keep horizontal? */
        /* User said "move right". Sidebar layout might be better. */
        gap: 20px;
        z-index: 100;
        align-items: flex-end; /* Align right */
      }
      .uj-btn {
        padding: 16px 0; /* Changed padding to vertical only, width handles horizontal */
        width: 220px;    /* Fixed width for equality */
        font-family: 'Inter', sans-serif;
        font-weight: bold;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        text-transform: uppercase;
        font-size: 16px; 
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        transition: transform 0.1s;
        text-align: center; /* Ensure centered text */
      }
      .uj-btn:active {
        transform: scale(0.95);
      }
      .uj-btn-solid {
        background: #555;
        color: #fff;
        border-bottom: 4px solid #333;
      }
      .uj-btn-hype {
        background: #FF00FF;
        color: #fff;
        border-bottom: 4px solid #cc00cc;
        animation: pulse 2s infinite;
      }
      .uj-btn-rotate {
        background: #0077ff;
        color: #fff;
        border-bottom: 4px solid #0055aa;
        padding: 16px 20px; 
      }
      .uj-btn-rotate.vertical {
        background: #00AAFF;
        transform: translateY(-2px);
      }
      @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(255, 0, 255, 0.7); }
        70% { box-shadow: 0 0 0 10px rgba(255, 0, 255, 0); }
        100% { box-shadow: 0 0 0 0 rgba(255, 0, 255, 0); }
      }
      .uj-overlay-logo {
        position: absolute;
        top: 20px;
        left: 20px;
        max-width: 150px;
        z-index: 100;
        pointer-events: none;
      }
      .uj-legend {
        position: absolute;
        top: 80px; 
        left: 20px;
        width: 240px; 
        z-index: 90;
        font-family: 'Inter', sans-serif;
        color: white;
        background: rgba(0,0,0,0.6);
        padding: 12px;
        border-radius: 8px;
        backdrop-filter: blur(6px);
        border: 1px solid rgba(255,255,255,0.1);
      }
      .uj-legend-item {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
      }
      .uj-swatch {
        width: 20px;
        height: 20px;
        margin-right: 10px;
        border: 1px solid white;
      }
      .uj-swatch.solid { background: #555; }
      .uj-swatch.hype { background: #FF00FF; }
      .uj-legend-text { font-size: 12px; line-height: 1.4; }
      .uj-legend-note { margin-top: 10px; opacity: 0.7; font-size: 11px; }
      .uj-legend-mini {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          color: #ddd;
      }
      .uj-crisis-overlay {
        position: absolute;
        top: 0; left: 0; width: 100%; height: 100%;
        pointer-events: none;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 400;
        font-family: 'Inter', sans-serif;
        background: rgba(255, 0, 0, 0);
        transition: background 0.3s;
      }
      .uj-crisis-overlay.active {
        background: rgba(255, 0, 0, 0.2);
        animation: flash-red 1s infinite;
      }
      @keyframes flash-red {
        0%, 100% { background: rgba(255,0,0,0.1); }
        50% { background: rgba(255,0,0,0.3); }
      }
      .uj-crisis-box {
        background: #ff4444;
        color: white;
        padding: 20px 40px;
        border-radius: 12px;
        box-shadow: 0 0 20px rgba(0,0,0,0.5);
        text-align: center;
        transform: scale(0.8);
        opacity: 0;
        transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      .uj-crisis-box.visible {
        transform: scale(1);
        opacity: 1;
      }
      .uj-crisis-shout {
        font-size: 32px;
        font-weight: 900;
        margin-bottom: 5px;
        text-transform: uppercase;
      }
      .uj-crisis-desc {
        font-size: 18px;
        opacity: 0.9;
      }
    `;
    document.head.appendChild(style);
  }

  private createControls() {
    const controls = document.createElement('div');
    controls.className = 'uj-controls';

    const btnSolid = document.createElement('button');
    btnSolid.className = 'uj-btn uj-btn-solid';
    btnSolid.innerText = 'Build Solid\n(Costs $5k)';
    btnSolid.onclick = () => this.options.onSpawn(BlockType.BOOTSTRAP);

    const btnHype = document.createElement('button');
    btnHype.className = 'uj-btn uj-btn-hype';
    btnHype.innerText = 'Hype Up\n(Grants $75k)';
    btnHype.onclick = () => this.options.onSpawn(BlockType.VC);

    controls.appendChild(btnSolid);
    controls.appendChild(btnHype);
    this.container.appendChild(controls);
  }

  private createSystemButtons() {
    const container = document.createElement('div');
    container.className = 'uj-sys-container';
    
    const btnPause = document.createElement('button');
    btnPause.className = 'uj-sys-btn';
    btnPause.innerText = '⏸ PAUSE';
    btnPause.id = 'uj-btn-pause'; // Add ID for updating
    btnPause.onclick = () => {
        const wasPlaying = this.options.gameState.isPlaying();
        this.options.gameState.togglePause();
        btnPause.innerText = !wasPlaying ? '⏸ PAUSE' : '▶ RESUME';
    };

    const btnReset = document.createElement('button');
    btnReset.className = 'uj-sys-btn';
    btnReset.innerText = '↻ RESET';
    btnReset.onclick = () => window.location.reload();

    container.appendChild(btnPause);
    container.appendChild(btnReset);
    this.container.appendChild(container);
  }

  private createLegend() {
    const legend = document.createElement('div');
    legend.className = 'uj-legend';
    legend.innerHTML = `
      <div style="margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 6px;">
        <strong style="color: #00ff7f; font-size: 14px;">MISSION</strong>
        <div class="uj-legend-text">
           1. Reach <strong>$1 Billion</strong> Valuation.<br>
           2. Don't run out of <strong>Runway</strong>.<br>
           <small style="opacity:0.7">Burn Rate increases with Stage!</small>
        </div>
      </div>

      <div style="margin-bottom: 12px;">
         <div class="uj-legend-item">
            <div class="uj-swatch solid"></div>
            <div class="uj-legend-text">
                <strong>Build Solid</strong><br>
                High Friction. Good Foundation.<br>
                <span style="color:#ffaaaa">Costs $5k. Low Value.</span>
            </div>
         </div>
         <div class="uj-legend-item">
            <div class="uj-swatch hype"></div>
            <div class="uj-legend-text">
                <strong>Hype Up</strong><br>
                Distorted Shape. Unstable.<br>
                <span style="color:#aaffaa">Grants $75k. High Value.</span>
            </div>
         </div>
      </div>
      
      <!-- Toxic Employees Section -->
       <div style="margin-bottom: 8px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 6px;">
         <strong style="color: #ff4444; font-size: 13px;">TOXIC (Risk: 1/15)</strong>
         <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 5px;">
            <div class="uj-legend-mini">
                <img src="https://raw.githubusercontent.com/Booby-Boobs/Pre-Mortem/main/public/slacker.png" style="width: 30px; height: auto;">
                <span>Slacker</span>
            </div>
            <div class="uj-legend-mini">
                <img src="https://raw.githubusercontent.com/Booby-Boobs/Pre-Mortem/main/public/control-freak.png" style="width: 30px; height: auto;">
                <span>Control Freak</span>
            </div>
            <div class="uj-legend-mini">
                <img src="https://raw.githubusercontent.com/Booby-Boobs/Pre-Mortem/main/public/prima-donna.png" style="width: 30px; height: auto;">
                <span>Prima Donna</span>
            </div>
            <div class="uj-legend-mini">
                <img src="https://raw.githubusercontent.com/Booby-Boobs/Pre-Mortem/main/public/quet-quitter.png" style="width: 30px; height: auto;">
                <span>Quiet Quitter</span>
            </div>
            <div class="uj-legend-mini">
                <img src="https://raw.githubusercontent.com/Booby-Boobs/Pre-Mortem/main/public/slack-spammer.png" style="width: 30px; height: auto;">
                <span>Spammer</span>
            </div>
         </div>
         <div class="uj-legend-note" style="color: #ffaaaa; margin-top: 5px;">
             $0 Val. Heavy. Annoying.
         </div>
       </div>
      <div class="uj-legend-note" style="font-size: 10px; line-height: 1.3;">
        <strong style="font-size: 11px;">STRATEGY:</strong><br>
        • <strong>Hype-Hole</strong>: High Hype = Zero stability. Organization & code collapse.<br>
        • <strong>Solid-Sink</strong>: Pure solid = Runway burn. No growth velocity.<br>
        <span style="color: #00ff7f; opacity: 0.9;"><em>Balance foundation with noise.</em></span>
      </div>

      <div class="uj-legend-note" style="margin-top: 8px;">
        <strong>RULES:</strong><br>
        - Blocks only vest inside <strong>Dashed Zone</strong>.<br>
        - Crossing <strong>Red Line</strong> = Penalty.<br>
        - Press <strong>'R'</strong> to rotate.
      </div>

      <!-- Chaos Events Description -->
      <div style="margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 6px;">
          <strong style="color: #ffaa00; font-size: 13px;">CHAOS EVENTS</strong>
          <div style="font-size: 11px; color: #ccc; line-height: 1.4; margin-top: 4px;">
              • <strong>Strategic Pivot</strong>: Gravity shifts.<br>
              • <strong>The Big Reorg</strong>: Zero friction.<br>
              • <strong>Legacy Deprecation</strong>: Ghost API.<br>
              • <strong>Feature Creep</strong>: Codescale 1.2x.<br>
              • <strong>Viral Spike</strong>: Trafficequake.
          </div>
      </div>

      <button id="uj-view-labels" style="
        margin-top: 15px; 
        width: 100%;
        background: rgba(255,255,255,0.1); 
        border: 1px solid rgba(255,255,255,0.3); 
        color: #ccc; 
        border-radius: 4px; 
        padding: 6px 8px; 
        cursor: pointer; 
        font-size: 11px;
        transition: background 0.2s;">
        View Label Dictionary
      </button>
    `;
    this.container.appendChild(legend);

    document.getElementById('uj-view-labels')?.addEventListener('click', () => {
        this.showGlossary();
    });
  }

  private showGlossary() {
      if (document.getElementById('uj-glossary')) return;
      
      // Pause game
      const wasPlaying = this.options.gameState.isPlaying();
      if (wasPlaying) {
          this.options.gameState.setPaused(true);
          const pauseBtn = document.getElementById('uj-btn-pause');
          if (pauseBtn) pauseBtn.innerText = '▶ RESUME';
      }

      const overlay = document.createElement('div');
      overlay.id = 'uj-glossary';
      overlay.style.cssText = `
        position: absolute;
        top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.9);
        color: white;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 300;
        font-family: 'Inter', sans-serif;
      `;

      overlay.innerHTML = `
        <div style="background: #222; padding: 40px; border-radius: 12px; max-width: 800px; width: 90%; max-height: 80vh; overflow-y: auto; position: relative;">
            <button id="uj-glossary-close" style="position: absolute; top: 10px; right: 10px; background: none; border: none; color: white; font-size: 24px; cursor: pointer;">&times;</button>
            <h2 style="text-align: center; margin-bottom: 30px;">Startup Lingo Dictionary</h2>
            <div style="display: flex; gap: 40px;">
                <div style="flex: 1;">
                    <h3 style="color: #aaa; border-bottom: 2px solid #555; padding-bottom: 10px;">Build Solid (The Work)</h3>
                    <ul id="uj-solid-list" style="list-style: none; padding: 0; color: #ccc; line-height: 1.6;"></ul>
                </div>
                <div style="flex: 1;">
                    <h3 style="color: #FF00FF; border-bottom: 2px solid #cc00cc; padding-bottom: 10px;">Hype Up (The Noise)</h3>
                    <ul id="uj-hype-list" style="list-style: none; padding: 0; color: #ffccff; line-height: 1.6;"></ul>
                </div>
            </div>
        </div>
      `;

      this.container.appendChild(overlay);
      this.populateGlossaryLists();
      
      const close = () => {
          overlay.remove();
          if (wasPlaying) {
              this.options.gameState.setPaused(false);
              const pauseBtn = document.getElementById('uj-btn-pause');
              if (pauseBtn) pauseBtn.innerText = '⏸ PAUSE';
          }
      };

      document.getElementById('uj-glossary-close')!.onclick = close;
      
      // Close on background click
      overlay.onclick = (e) => {
          if (e.target === overlay) close();
      }
  }

  private populateGlossaryLists() {
      const solidList = document.getElementById('uj-solid-list');
      const hypeList = document.getElementById('uj-hype-list');
      
      if (solidList && hypeList) {
        BLOCK_DEFINITIONS[BlockType.BOOTSTRAP].possibleLabels?.forEach(label => {
            const li = document.createElement('li');
            li.textContent = label;
            solidList.appendChild(li);
        });
        
        BLOCK_DEFINITIONS[BlockType.VC].possibleLabels?.forEach(label => {
            const li = document.createElement('li');
            li.textContent = label;
            hypeList.appendChild(li);
        });
      }
  }

  private createHUD() {
    this.hudElement = document.createElement('div');
    this.hudElement.className = 'uj-hud';
    this.container.appendChild(this.hudElement);
  }

  private updateHUD() {
    const state = this.options.gameState;
    
    const moneyFormatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    });
    const compactFormatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    });

    const isBankrupt = state.isBankrupt();
    const runwayClass = isBankrupt ? 'uj-stat-value danger' : 'uj-stat-value';

    const nextThreshold = state.getNextStageThreshold();
    const nextStageText = nextThreshold > 0 ? `<small style="font-size:12px; opacity:0.7">Next: ${compactFormatter.format(nextThreshold)}</small>` : '';

    this.hudElement.innerHTML = `
      <div class="uj-stat-label">Stage</div>
      <div class="uj-stat-value">${state.stage}</div>
      
      <div class="uj-stat-label">Valuation</div>
      <div class="uj-stat-value" style="color: #00ff7f">
        ${moneyFormatter.format(state.valuation)}<br>
        ${nextStageText}
      </div>
      
      <div class="uj-stat-label">Runway</div>
      <div class="${runwayClass}">${moneyFormatter.format(state.runway)}</div>
    `;

    if (state.status !== 'playing') {
      this.showGameOver(state.status, state.valuation);
    }
  }

  private showToast(message: string, type: 'info' | 'danger' = 'info') {
      const toast = document.createElement('div');
      toast.innerText = message;
      toast.style.cssText = `
        position: absolute;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'danger' ? 'rgba(255, 68, 68, 0.9)' : 'rgba(0, 0, 0, 0.8)'};
        color: white;
        padding: 10px 20px;
        border-radius: 20px;
        font-family: 'Inter', sans-serif;
        font-weight: bold;
        z-index: 500;
        animation: fadeUp 2s forwards;
        white-space: nowrap;
      `;
      
      this.container.appendChild(toast);
      setTimeout(() => {
          toast.style.transition = 'opacity 0.5s';
          toast.style.opacity = '0';
          setTimeout(() => toast.remove(), 500);
      }, 2000);
  }

  private showGameOver(status: string, valuation: number) {
    if (document.getElementById('uj-gameover')) return;

    const overlay = document.createElement('div');
    overlay.id = 'uj-gameover';
    overlay.style.cssText = `
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.85);
      color: white;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 200;
      font-family: 'Inter', sans-serif;
    `;

    let title = '';
    let message = '';
    let color = '#fff';

    switch (status) {
      case 'bankrupt':
        title = 'HONEST POOR';
        message = 'You ran out of runway. The market did not love you.';
        color = '#ff4444';
        break;
      case 'collapsed':
        title = 'SCANDAL!';
        message = 'Your tower of lies has collapsed. TechCrunch is mocking you.';
        color = '#ffaa00';
        break;
      case 'exited':
        title = 'VISIONARY FRAUD';
        message = `You exited with $${(valuation / 1_000_000).toFixed(1)}M! You are a genius.`;
        color = '#00ff7f';
        break;
    }

    overlay.innerHTML = `
      <h1 style="font-size: 48px; color: ${color}; margin-bottom: 10px;">${title}</h1>
      <p style="font-size: 18px; color #ccc; max-width: 400px; text-align: center;">${message}</p>
      <button onclick="window.location.reload()" style="
        margin-top: 30px;
        padding: 15px 30px;
        font-size: 20px;
        background: white;
        border: none;
        cursor: pointer;
        border-radius: 8px;
        font-weight: bold;
      ">TRY AGAIN</button>
    `;

    this.container.appendChild(overlay);
  }

  public showLogo(url: string) {
    if (!url) return;
    const img = document.createElement('img');
    img.src = url;
    img.className = 'uj-overlay-logo';
    this.container.appendChild(img);
  }

  public showCrisisAlert(shout: string, desc: string) {
      const overlay = document.createElement('div');
      overlay.className = 'uj-crisis-overlay active';
      
      const box = document.createElement('div');
      box.className = 'uj-crisis-box';
      box.innerHTML = `
        <div class="uj-crisis-shout">${shout}</div>
        <div class="uj-crisis-desc">${desc}</div>
      `;
      
      overlay.appendChild(box);
      this.container.appendChild(overlay);
      
      // Animate in
      setTimeout(() => box.classList.add('visible'), 100);
      
      // Remove after 4 seconds
      setTimeout(() => {
          box.classList.remove('visible');
          overlay.classList.remove('active');
          setTimeout(() => {
              overlay.remove();
          }, 500);
      }, 4000);
  }
}
