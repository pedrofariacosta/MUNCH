import { TILE_SIZE, DIRECTIONS, ENTITY_SPEEDS, COLOR_PALETTE } from '../config/constants.js';

export const ENEMY_TYPES = {
  BLINKY: 'BLINKY', // Vermelho - persegue diretamente o jogador
  PINKY: 'PINKY',   // Rosa - tenta cercar (mira 4 blocos à frente do jogador)
  INKY: 'INKY',     // Ciano - faz flanqueamento usando a posição do Blinky
  CLYDE: 'CLYDE'     // Laranja - medroso (persegue se longe, foge para o canto se perto)
};

export const ENEMY_STATES = {
  CHASE: 'CHASE',
  SCATTER: 'SCATTER',
  STUNNED: 'STUNNED',
  EATEN: 'EATEN'
};

export class Enemy {
  constructor(gridX, gridY, type) {
    this.gridX = gridX;
    this.gridY = gridY;
    
    this.startX = gridX;
    this.startY = gridY;
    
    this.x = gridX * TILE_SIZE;
    this.y = gridY * TILE_SIZE;
    this.targetX = this.x;
    this.targetY = this.y;
    
    this.type = type;
    this.state = ENEMY_STATES.CHASE;
    
    this.speed = ENTITY_SPEEDS.ENEMY_CHASE;
    this.dir = DIRECTIONS.UP;
    
    this.stunTimer = 0;
    this.stunDuration = 3000; // Tempo padrão de 3 segundos
    this.respawnTimer = 0;
    
    // Configura a cor e o canto de recuo conforme a personalidade do fantasma
    this.setupGhostPersonality();
  }

  setupGhostPersonality() {
    switch (this.type) {
      case ENEMY_TYPES.BLINKY:
        this.color = '#ef4444'; // Vermelho
        this.scatterGridTarget = { x: 19, y: 1 }; // Canto superior direito
        break;
      case ENEMY_TYPES.PINKY:
        this.color = '#f472b6'; // Rosa
        this.scatterGridTarget = { x: 1, y: 1 }; // Canto superior esquerdo
        break;
      case ENEMY_TYPES.INKY:
        this.color = '#22d3ee'; // Ciano
        this.scatterGridTarget = { x: 19, y: 19 }; // Canto inferior direito
        break;
      case ENEMY_TYPES.CLYDE:
        this.color = '#fb923c'; // Laranja
        this.scatterGridTarget = { x: 1, y: 19 }; // Canto inferior esquerdo
        break;
      default:
        this.color = '#ffffff';
        this.scatterGridTarget = { x: 1, y: 1 };
    }
  }

  reset() {
    this.gridX = this.startX;
    this.gridY = this.startY;
    this.x = this.gridX * TILE_SIZE;
    this.y = this.gridY * TILE_SIZE;
    this.targetX = this.x;
    this.targetY = this.y;
    this.state = ENEMY_STATES.CHASE;
    this.stunTimer = 0;
    this.respawnTimer = 0;
    this.dir = DIRECTIONS.UP;
    this.speed = ENTITY_SPEEDS.ENEMY_CHASE;
  }

  isMoving() {
    return this.x !== this.targetX || this.y !== this.targetY;
  }

  stun(duration) {
    this.state = ENEMY_STATES.STUNNED;
    this.stunTimer = duration;
    this.speed = ENTITY_SPEEDS.ENEMY_FRIGHTENED;
    // Vira na direção oposta imediatamente ao ser atordoado
    this.dir = this.getOppositeDirection(this.dir);
  }

  eaten() {
    this.state = ENEMY_STATES.EATEN;
    this.respawnTimer = 5000; // Renasce após 5 segundos
    this.x = this.startX * TILE_SIZE;
    this.y = this.startY * TILE_SIZE;
    this.gridX = this.startX;
    this.gridY = this.startY;
    this.targetX = this.x;
    this.targetY = this.y;
  }

  update(dt, mapManager, player, blinkyRef, particleSystem) {
    // 1. Trata o fantasma no estado "devorado" (esperando renascer)
    if (this.state === ENEMY_STATES.EATEN) {
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0) {
        this.reset();
      }
      return; // Fica congelado/invisível na jaula
    }

    // 2. Controla o tempo de atordoamento
    if (this.state === ENEMY_STATES.STUNNED) {
      this.stunTimer -= dt;
      
      // Cria o anel de atordoamento ao redor do fantasma
      if (Math.random() < 0.05) {
        particleSystem.spawnStunRing(this.x + TILE_SIZE/2, this.y + TILE_SIZE/2, 12, COLOR_PALETTE.ENEMY_STUNNED);
      }

      if (this.stunTimer <= 0) {
        this.state = ENEMY_STATES.CHASE;
        this.speed = ENTITY_SPEEDS.ENEMY_CHASE;
      }
    }

    // 3. Movimentação física
    if (this.isMoving()) {
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const step = this.speed * dt;

      if (step >= dist) {
        this.x = this.targetX;
        this.y = this.targetY;
        this.gridX = Math.round(this.x / TILE_SIZE);
        this.gridY = Math.round(this.y / TILE_SIZE);
      } else {
        this.x += (dx / dist) * step;
        this.y += (dy / dist) * step;
      }
    }

    // Decide o próximo passo na grade ao terminar de se mover
    if (!this.isMoving()) {
      const nextTile = this.calculateNextTile(mapManager, player, blinkyRef);
      this.dir = { x: nextTile.x - this.gridX, y: nextTile.y - this.gridY };
      
      // Resolve a direção correspondente
      const matchedDir = Object.values(DIRECTIONS).find(d => d.x === this.dir.x && d.y === this.dir.y);
      if (matchedDir) {
        this.dir = matchedDir;
      }

      this.targetX = nextTile.x * TILE_SIZE;
      this.targetY = nextTile.y * TILE_SIZE;
    }
  }

  // Algoritmo clássico de busca de caminhos (BFS / distância Euclidiana)
  calculateNextTile(mapManager, player, blinkyRef) {
    const targetGrid = this.getTargetTile(player, blinkyRef);
    const validMoves = [];
    
    const possibleDirs = [DIRECTIONS.UP, DIRECTIONS.DOWN, DIRECTIONS.LEFT, DIRECTIONS.RIGHT];
    const oppositeDir = this.getOppositeDirection(this.dir);

    possibleDirs.forEach(d => {
      // Impede de dar meia-volta imediatamente em estados normais
      if (d === oppositeDir && this.state !== ENEMY_STATES.STUNNED) return;

      const nextX = this.gridX + d.x;
      const nextY = this.gridY + d.y;
      
      if (mapManager.isTileWalkable(nextX, nextY)) {
        validMoves.push({ x: nextX, y: nextY, dir: d });
      }
    });

    // Caso de emergência se ficar encurralado
    if (validMoves.length === 0) {
      const revX = this.gridX + oppositeDir.x;
      const revY = this.gridY + oppositeDir.y;
      if (mapManager.isTileWalkable(revX, revY)) {
        return { x: revX, y: revY };
      }
      return { x: this.gridX, y: this.gridY }; // Travado
    }

    // Se estiver atordoado, move-se aleatoriamente para simular pânico
    if (this.state === ENEMY_STATES.STUNNED) {
      const randomIndex = Math.floor(Math.random() * validMoves.length);
      return validMoves[randomIndex];
    }

    // Seleciona a direção que deixa o fantasma mais próximo do objetivo
    let bestMove = null;
    let minDistance = Infinity;

    validMoves.forEach(move => {
      const dx = targetGrid.x - move.x;
      const dy = targetGrid.y - move.y;
      const distance = dx * dx + dy * dy; // Distância ao quadrado para otimizar desempenho

      // Ordem de preferência clássica do arcade em caso de empate: CIMA, ESQUERDA, BAIXO, DIREITA
      if (distance < minDistance) {
        minDistance = distance;
        bestMove = move;
      }
    });

    return bestMove;
  }

  getTargetTile(player, blinkyRef) {
    if (this.state === ENEMY_STATES.SCATTER) {
      return this.scatterGridTarget;
    }

    // Fórmulas de perseguição personalizadas para cada tipo de fantasma
    switch (this.type) {
      case ENEMY_TYPES.BLINKY:
        // Perseguição direta
        return { x: player.gridX, y: player.gridY };
        
      case ENEMY_TYPES.PINKY:
        // Mira 4 blocos à frente da direção que o jogador está olhando
        return {
          x: player.gridX + player.dir.x * 4,
          y: player.gridY + player.dir.y * 4
        };
        
      case ENEMY_TYPES.INKY: {
        // Flanqueamento complexo: usa a posição de Blinky para criar um vetor de cerco
        const bX = blinkyRef ? blinkyRef.gridX : player.gridX;
        const bY = blinkyRef ? blinkyRef.gridY : player.gridY;
        const offsetPlayerX = player.gridX + player.dir.x * 2;
        const offsetPlayerY = player.gridY + player.dir.y * 2;
        const vecX = offsetPlayerX - bX;
        const vecY = offsetPlayerY - bY;
        return {
          x: offsetPlayerX + vecX,
          y: offsetPlayerY + vecY
        };
      }
        
      case ENEMY_TYPES.CLYDE: {
        // Persegue se estiver longe (> 8 blocos), recua se estiver perto
        const dx = player.gridX - this.gridX;
        const dy = player.gridY - this.gridY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 8) {
          return { x: player.gridX, y: player.gridY };
        } else {
          return this.scatterGridTarget;
        }
      }
      
      default:
        return { x: player.gridX, y: player.gridY };
    }
  }

  getOppositeDirection(dir) {
    if (dir === DIRECTIONS.UP) return DIRECTIONS.DOWN;
    if (dir === DIRECTIONS.DOWN) return DIRECTIONS.UP;
    if (dir === DIRECTIONS.LEFT) return DIRECTIONS.RIGHT;
    if (dir === DIRECTIONS.RIGHT) return DIRECTIONS.LEFT;
    return DIRECTIONS.NONE;
  }

  draw(ctx) {
    if (this.state === ENEMY_STATES.EATEN) return; // Invisível se estiver derrotado na jaula

    ctx.save();
    const centerX = this.x + TILE_SIZE / 2;
    const centerY = this.y + TILE_SIZE / 2;
    
    // Desenha o corpo em formato de domo + base ondulada clássica
    ctx.beginPath();
    ctx.arc(centerX, centerY - 2, 12, Math.PI, 0, false); // Domo
    
    // Ondas na parte inferior do fantasma
    ctx.lineTo(centerX + 12, centerY + 12);
    ctx.lineTo(centerX + 8, centerY + 8);
    ctx.lineTo(centerX + 4, centerY + 12);
    ctx.lineTo(centerX, centerY + 8);
    ctx.lineTo(centerX - 4, centerY + 12);
    ctx.lineTo(centerX - 8, centerY + 8);
    ctx.lineTo(centerX - 12, centerY + 12);
    ctx.closePath();

    // Determina se o fantasma deve piscar de branco no fim do atordoamento
    let isFlashingCloseToEnd = this.state === ENEMY_STATES.STUNNED && this.stunTimer < 1000 && Math.floor(this.stunTimer / 100) % 2 === 0;
    
    ctx.fillStyle = this.state === ENEMY_STATES.STUNNED 
      ? (isFlashingCloseToEnd ? '#ffffff' : '#3b82f6') 
      : this.color;
      
    ctx.fill();
    
    // Contorno brilhante
    ctx.strokeStyle = this.state === ENEMY_STATES.STUNNED ? '#60a5fa' : this.color;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Desenha as pupilas direcionais
    const eyeOffsetX = this.dir.x * 2.5;
    const eyeOffsetY = this.dir.y * 2.5;

    ctx.fillStyle = this.state === ENEMY_STATES.STUNNED ? '#f59e0b' : '#ffffff';
    
    if (this.state === ENEMY_STATES.STUNNED) {
      // Olhos em "X" para indicar pânico/atordoamento
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      
      ctx.beginPath();
      ctx.moveTo(centerX - 7, centerY - 4);
      ctx.lineTo(centerX - 3, centerY);
      ctx.moveTo(centerX - 3, centerY - 4);
      ctx.lineTo(centerX - 7, centerY);
      
      ctx.moveTo(centerX + 3, centerY - 4);
      ctx.lineTo(centerX + 7, centerY);
      ctx.moveTo(centerX + 7, centerY - 4);
      ctx.lineTo(centerX + 3, centerY);
      ctx.stroke();
    } else {
      // Olhos normais (globos oculares)
      ctx.beginPath();
      ctx.arc(centerX - 5 + eyeOffsetX, centerY - 2 + eyeOffsetY, 3.5, 0, Math.PI * 2);
      ctx.arc(centerX + 5 + eyeOffsetX, centerY - 2 + eyeOffsetY, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Pupilas apontando para onde o fantasma está se movendo
      ctx.fillStyle = '#0b0f19';
      ctx.beginPath();
      ctx.arc(centerX - 5 + eyeOffsetX * 1.5, centerY - 2 + eyeOffsetY * 1.5, 1.5, 0, Math.PI * 2);
      ctx.arc(centerX + 5 + eyeOffsetX * 1.5, centerY - 2 + eyeOffsetY * 1.5, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
