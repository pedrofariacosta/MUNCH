import { GRID_COLS, GRID_ROWS, TILE_SIZE, TILE_TYPES, COLOR_PALETTE } from '../config/constants.js';
import { Pellet } from '../entities/Pellet.js';

export class MapManager {
  constructor() {
    this.grid = [];
    this.pellets = [];
    this.portalSpawned = false;
    this.portalTile = { x: 10, y: 10 }; // Local do portal na sala central
    
    // Matriz de desenho do mapa
    // 1 = PAREDE, 0 = CAMINHO, 2 = ORBE, 3 = ORBE DOURADO, 4 = SUPER ORBE
    this.blueprint = [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 4, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 4, 1],
      [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1],
      [1, 3, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 3, 1],
      [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
      [1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1],
      [1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1],
      [1, 1, 1, 1, 1, 2, 1, 1, 1, 0, 1, 0, 1, 1, 1, 2, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 2, 1, 0, 1, 1, 0, 1, 1, 0, 1, 2, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0, 2, 0, 0, 1, 0, 0, 0, 1, 0, 0, 2, 0, 0, 0, 0, 0], // Linha 10, coluna 10 é o centro do mapa
      [1, 1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 1, 1, 0, 1, 2, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1],
      [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
      [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1],
      [1, 4, 2, 2, 1, 2, 2, 2, 2, 2, 0, 2, 2, 2, 2, 2, 1, 2, 2, 4, 1], // Jogador nasce na linha 16, coluna 10
      [1, 1, 1, 2, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 1, 1, 1],
      [1, 3, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 3, 1],
      [1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ];
  }

  loadLevel() {
    this.grid = [];
    this.pellets = [];
    this.portalSpawned = false;

    // Carrega o clone da matriz do mapa
    for (let r = 0; r < GRID_ROWS; r++) {
      this.grid[r] = [];
      for (let c = 0; c < GRID_COLS; c++) {
        const type = this.blueprint[r][c];
        
        // Cria parede ou caminho livre
        if (type === 1) {
          this.grid[r][c] = TILE_TYPES.WALL;
        } else {
          this.grid[r][c] = TILE_TYPES.EMPTY;
        }

        // Adiciona os orbes conforme o tipo
        if (type === 2) {
          this.pellets.push(new Pellet(c, r, 'NORMAL'));
        } else if (type === 3) {
          this.pellets.push(new Pellet(c, r, 'GOLD'));
        } else if (type === 4) {
          this.pellets.push(new Pellet(c, r, 'POWER'));
        }
      }
    }
  }

  isWall(x, y) {
    if (x < 0 || x >= GRID_COLS || y < 0 || y >= GRID_ROWS) return true;
    return this.grid[y][x] === TILE_TYPES.WALL;
  }

  isTileWalkable(x, y) {
    // Suporte aos túneis laterais (wrap-around estilo Pac-Man)
    if ((x < 0 || x >= GRID_COLS) && y === 10) return true;
    
    if (x < 0 || x >= GRID_COLS || y < 0 || y >= GRID_ROWS) return false;
    return this.grid[y][x] !== TILE_TYPES.WALL;
  }

  // Faz a entidade surgir do lado oposto ao cruzar as bordas do mapa
  wrapCoordinates(entity) {
    if (entity.x < -TILE_SIZE / 2) {
      entity.x = (GRID_COLS - 0.5) * TILE_SIZE;
      entity.gridX = GRID_COLS - 1;
      entity.alignWithGrid();
    } else if (entity.x > (GRID_COLS - 0.5) * TILE_SIZE) {
      entity.x = -TILE_SIZE / 2;
      entity.gridX = 0;
      entity.alignWithGrid();
    }
  }

  // Checa se o jogador passou por cima e comeu algum orbe
  checkPelletCollision(playerX, playerY) {
    const playerGridX = Math.round(playerX / TILE_SIZE);
    const playerGridY = Math.round(playerY / TILE_SIZE);

    for (let i = 0; i < this.pellets.length; i++) {
      const p = this.pellets[i];
      if (!p.collected && p.gridX === playerGridX && p.gridY === playerGridY) {
        p.collected = true;
        return p;
      }
    }
    return null;
  }

  allPelletsEaten() {
    return this.pellets.every(p => p.collected);
  }

  spawnPortal() {
    if (this.portalSpawned) return;
    this.portalSpawned = true;
    
    const { x, y } = this.portalTile;
    this.grid[y][x] = TILE_TYPES.PORTAL;
  }

  isPortal(x, y) {
    if (x < 0 || x >= GRID_COLS || y < 0 || y >= GRID_ROWS) return false;
    return this.grid[y][x] === TILE_TYPES.PORTAL;
  }

  update(dt) {
    // Atualiza a animação de pulso dos orbes ativos
    this.pellets.forEach(p => p.update(dt));
  }

  draw(ctx) {
    ctx.save();
    
    // Desenha as paredes e o chão do mapa
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const type = this.grid[r][c];
        const px = c * TILE_SIZE;
        const py = r * TILE_SIZE;

        if (type === TILE_TYPES.WALL) {
          // Bloco com contorno neon
          ctx.shadowColor = COLOR_PALETTE.WALL_NEON;
          ctx.shadowBlur = 4;
          
          ctx.fillStyle = COLOR_PALETTE.BACKGROUND;
          ctx.fillRect(px + 1, py + 1, TILE_SIZE - 2, TILE_SIZE - 2);
          
          ctx.strokeStyle = COLOR_PALETTE.WALL_NEON;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(px + 3, py + 3, TILE_SIZE - 6, TILE_SIZE - 6);

          ctx.strokeStyle = COLOR_PALETTE.WALL_INNER;
          ctx.lineWidth = 1;
          ctx.strokeRect(px + 6, py + 6, TILE_SIZE - 12, TILE_SIZE - 12);
        } else if (type === TILE_TYPES.PORTAL) {
          // Efeito visual do portal verde pulsante e girando
          const pulse = Math.sin(Date.now() * 0.01) * 4;
          const centerX = px + TILE_SIZE / 2;
          const centerY = py + TILE_SIZE / 2;

          ctx.shadowColor = COLOR_PALETTE.PORTAL;
          ctx.shadowBlur = 12;
          
          ctx.fillStyle = COLOR_PALETTE.PORTAL;
          ctx.beginPath();
          ctx.arc(centerX, centerY, TILE_SIZE / 2.5 + pulse / 2, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Detalhes internos em espiral do portal
          ctx.strokeStyle = COLOR_PALETTE.PORTAL_GLOW;
          ctx.beginPath();
          ctx.arc(centerX, centerY, TILE_SIZE / 4 - pulse / 3, 0, Math.PI * 1.5);
          ctx.stroke();
        }
      }
    }

    // Desenha todos os orbes ativos
    this.pellets.forEach(p => p.draw(ctx));

    ctx.restore();
  }
}
