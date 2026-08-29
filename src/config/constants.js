// Configurações e parâmetros gerais do jogo

export const GRID_COLS = 21;
export const GRID_ROWS = 21;
export const TILE_SIZE = 32; // Tamanho em pixels de cada bloco da grade
export const CANVAS_SIZE = GRID_COLS * TILE_SIZE; // 672x672 pixels

export const TILE_TYPES = {
  EMPTY: 0,
  WALL: 1,
  PELLET: 2,
  GOLD_PELLET: 3,
  POWER_PELLET: 4,
  PORTAL: 5
};

export const DIRECTIONS = {
  UP: { x: 0, y: -1, angle: -Math.PI / 2 },
  DOWN: { x: 0, y: 1, angle: Math.PI / 2 },
  LEFT: { x: -1, y: 0, angle: Math.PI },
  RIGHT: { x: 1, y: 0, angle: 0 },
  NONE: { x: 0, y: 0, angle: 0 }
};

export const GAME_STATES = {
  MENU: 'MENU',
  LOADING: 'LOADING',
  PLAYING: 'PLAYING',
  SHOP: 'SHOP',
  GAMEOVER: 'GAMEOVER'
};

// Velocidade das entidades (em pixels por milissegundo)
export const ENTITY_SPEEDS = {
  PLAYER: 0.16, // Velocidade do slime (~5 blocos por segundo)
  ENEMY_CHASE: 0.11,
  ENEMY_SCATTER: 0.11,
  ENEMY_FRIGHTENED: 0.07,
  PROJECTILE: 0.35
};

// Configurações das habilidades
export const SKILLS_CONFIG = {
  VAULT: {
    COOLDOWN_MS: 3000,
    DISTANCE: 2 // Distância do salto (2 blocos)
  },
  BLASTER: {
    COOLDOWN_MS: 4000,
    DURATION_MS: 3000, // Duração do atordoamento ao atingir um fantasma
    AMMO_MAX: 1
  }
};

// Paleta de cores oficial do jogo
export const COLOR_PALETTE = {
  BACKGROUND: '#030305',
  WALL_NEON: '#3b82f6',
  WALL_INNER: '#1e3a8a',
  PLAYER_SLIME: '#a3a3c2', // Fallback
  SLIME_COLORS: {
    classic: '#a3a3c2', // Cor original mantida conforme solicitado
    metallic: '#94a3b8',
    ballistic: '#ef4444',
    gambler: '#eab308'
  },
  PLAYER_OUTLINE: '#ffffff',
  PROJECTILE: '#3b82f6',
  PELLET: '#ffffff',
  GOLD_PELLET: '#eab308',
  POWER_PELLET: '#d946ef',
  PORTAL: '#10b981',
  PORTAL_GLOW: 'rgba(16, 185, 129, 0.4)'
};
