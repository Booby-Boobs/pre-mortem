import Matter from 'matter-js';

export enum BlockType {
  BOOTSTRAP = 'bootstrap',
  VC = 'vc',
  SLACKER = 'slacker',
  CONTROL_FREAK = 'control_freak',
  PRIMA_DONNA = 'prima_donna',
  QUIET_QUITTER = 'quiet_quitter',
  SLACK_SPAMMER = 'slack_spammer'
}

export interface BlockConfig {
  w: number;
  h: number;
  color: string;
  density: number;
  friction: number;
  restitution: number;
  label: string;
  possibleLabels?: string[];
}

export const BLOCK_DEFINITIONS: Record<BlockType, BlockConfig> = {
  [BlockType.BOOTSTRAP]: {
    w: 132, 
    h: 44, 
    color: '#555555', // Concrete/Rust
    density: 0.005, // High relative density (Matter.js default is 0.001)
    friction: 0.8,
    restitution: 0.0,
    label: 'Refactoring',
    possibleLabels: [
      // The Work (Old & New)
      'Refactoring', 'Unit Tests', 'Bug Fixes', 'User Support',
      'Documentation', 'Security Audit', 'Compliance', 'Cleanup',
      'Optimization', 'CI/CD Pipeline', 'Code Review', 'DB Tuning',
      'API Design', 'Accessibility', 'Localization', 'Error Logs',
      'Backups', 'Legacy Code', 'Hiring', 'Customer Love',
      'Bossware', 'YAML Hell', 'DNS Propagation', 'Regex', 'npm audit',
      'GDPR / SOC2', 'Migration', 'Certificate Expiry', 'On-Call',
      'Technical Debt', 'Works on my machine', 'Yak Shaving'
    ]
  },
  [BlockType.VC]: {
    w: 120,
    h: 40,
    color: '#FF00FF', // Neon Pink
    density: 0.0005, // Slightly heavier (was 0.0001)
    friction: 0.3, // Less slippery (was 0.1)
    restitution: 0.6, // Less bouncy (was 0.9)
    label: 'AI Blockchain',
    possibleLabels: [
      // The Hype (Old & New)
      'GenAI', 'Blockchain', 'Web3', 'Metaverse', 'NFTs',
      'Viral Growth', 'Pivot', 'Synergy', 'Disruption',
      'Thought Leader', 'Influencers', 'Hyper-Scale', 'Quantum',
      'Big Data', 'Growth Hack', 'Paradigm Shift', '10x Engineer',
      'Visionary', 'Series B Pitch', 'Exit Strategy',
      'Vibe Coding', 'Founder Mode', 'Prompt Engineering', 'AGI',
      'AI Wrapper', 'Unlimited PTO', 'Radical Candor', 'Community Led',
      'Pre-Revenue', 'Fractional CxO'
    ]
  },
  [BlockType.SLACKER]: {
    w: 64, // 80 * 0.8
    h: 64, // 80 * 0.8
    color: '#FFFFFF', 
    density: 0.01,
    friction: 1.0, 
    restitution: 0.1, 
    label: 'The Slacker',
    possibleLabels: ['The Slacker'] 
  },
  [BlockType.CONTROL_FREAK]: {
    w: 64, // Square to match image aspect ratio
    h: 64, 
    color: '#FF0000', density: 0.012, friction: 0.5, restitution: 0.2, 
    label: 'Control Freak', possibleLabels: ['Control Freak']
  },
  [BlockType.PRIMA_DONNA]: {
    w: 56, h: 56, // 70 * 0.8
    color: '#FFFF00', density: 0.008, friction: 0.1, restitution: 1.2, 
    label: 'Prima Donna', possibleLabels: ['Prima Donna']
  },
  [BlockType.QUIET_QUITTER]: {
    w: 48, h: 48, // 60 * 0.8
    color: '#00FFFF', density: 0.005, friction: 0.01, restitution: 0.9, 
    label: 'Quiet Quitter', possibleLabels: ['Quiet Quitter']
  },
  [BlockType.SLACK_SPAMMER]: {
    w: 60, h: 60, // 75 * 0.8
    color: '#00FF00', density: 0.01, friction: 0.4, restitution: 0.4, 
    label: 'Slack Spammer', possibleLabels: ['Slack Spammer']
  }
};

export const getRandomLabel = (type: BlockType): string => {
  const labels = BLOCK_DEFINITIONS[type].possibleLabels || [];
  return labels[Math.floor(Math.random() * labels.length)];
}

export const createBlock = (x: number, y: number, type: BlockType) => {
  const def = BLOCK_DEFINITIONS[type];
  const labelText = getRandomLabel(type);
  
  const options = {
    density: def.density,
    friction: def.friction,
    restitution: def.restitution,
    render: {
      fillStyle: def.color,
      strokeStyle: '#000',
      lineWidth: 2,
    },
    label: labelText,
  };

  if (type === BlockType.VC) {
    // "Long Side Trapezoid" / Distorted Wedge
    // Create an irregular quadrilateral that is annoying to stack
    const w = def.w;
    const h = def.h;
    
    // Randomize the top corners to create a slanted roof (Wedge)
    // or skew the sides (Parallelogram)
    const y1 = Math.random() * 15; // Top-Left drop
    const y2 = Math.random() * 15; // Top-Right drop
    const skew = (Math.random() - 0.5) * 20; // skew x

    const vertices = [
      { x: 0 + skew, y: y1 },           // TL
      { x: w + skew, y: y2 },           // TR
      { x: w, y: h },                   // BR
      { x: 0, y: h }                    // BL
    ];

    return Matter.Bodies.fromVertices(x, y, [vertices], options);
    return Matter.Bodies.fromVertices(x, y, [vertices], options);
  } else if (type === BlockType.SLACKER || 
             type === BlockType.CONTROL_FREAK || 
             type === BlockType.PRIMA_DONNA || 
             type === BlockType.QUIET_QUITTER || 
             type === BlockType.SLACK_SPAMMER) {
      
      const BASE_URL = 'https://raw.githubusercontent.com/Booby-Boobs/Pre-Mortem/main/public/';
      const textureMap: Record<string, string> = {
          [BlockType.SLACKER]: `${BASE_URL}slacker.png`,
          [BlockType.CONTROL_FREAK]: `${BASE_URL}control-freak.png`,
          [BlockType.PRIMA_DONNA]: `${BASE_URL}prima-donna.png`,
          [BlockType.QUIET_QUITTER]: `${BASE_URL}quet-quitter.png`,
          [BlockType.SLACK_SPAMMER]: `${BASE_URL}slack-spammer.png`
      };

      const spriteOptions = {
          ...options,
          render: {
              sprite: {
                  texture: textureMap[type],
                  xScale: (def.w / 512) * 2, // Approximate
                  yScale: (def.h / 512) * 2
              },
              lineWidth: 3,
              strokeStyle: '#ffffff'
          }
      };

      if (type === BlockType.QUIET_QUITTER) {
          return Matter.Bodies.circle(x, y, def.w / 2, spriteOptions);
      } else if (type === BlockType.CONTROL_FREAK) {
          return Matter.Bodies.trapezoid(x, y, def.w, def.h, 0.5, spriteOptions);
      } else if (type === BlockType.PRIMA_DONNA) {
           return Matter.Bodies.polygon(x, y, 5, def.w / 2, spriteOptions); // Pentagon
      } else if (type === BlockType.SLACK_SPAMMER) {
           return Matter.Bodies.polygon(x, y, 6, def.w / 2, spriteOptions); // Hexagon
      } else {
           // Default Slacker (Square)
           return Matter.Bodies.rectangle(x, y, def.w, def.h, spriteOptions);
      }
  } else {
    return Matter.Bodies.rectangle(x, y, def.w, def.h, options);
  }
};
