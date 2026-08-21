import { TILE_SIZE, ENTITY_SPEEDS, COLOR_PALETTE } from '../config/constants.js';

export class Projectile {
  constructor(x, y, direction) {
    this.x = x;
    this.y = y;
    this.dir = direction;
    this.speed = ENTITY_SPEEDS.PROJECTILE; // Velocidade em pixels por ms
    this.active = true;
    
    // Dimensões físicas do projétil
    this.size = 8;
  }

  update(dt, mapManager) {
    if (!this.active) return;

    // Movimentação em coordenadas de pixel
    this.x += this.dir.x * this.speed * dt;
    this.y += this.dir.y * this.speed * dt;

    // Checa colisão com paredes do mapa
    const gridX = Math.floor(this.x / TILE_SIZE);
    const gridY = Math.floor(this.y / TILE_SIZE);

    if (mapManager.isWall(gridX, gridY)) {
      this.active = false; // Desativa o projétil se bater na parede
    }
  }

  draw(ctx) {
    if (!this.active) return;

    ctx.save();
    
    // Efeito neon no tiro do blaster
    ctx.shadowColor = COLOR_PALETTE.PROJECTILE;
    ctx.shadowBlur = 8;
    
    ctx.fillStyle = COLOR_PALETTE.PROJECTILE;
    
    // Desenha em formato de cápsula dependendo da direção do tiro
    if (this.dir.x !== 0) {
      // Rastro horizontal
      ctx.fillRect(this.x - 6, this.y - 3, 12, 6);
      
      // Núcleo branco no centro do tiro
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(this.x - 4, this.y - 1, 8, 2);
    } else {
      // Rastro vertical
      ctx.fillRect(this.x - 3, this.y - 6, 6, 12);
      
      // Núcleo branco
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(this.x - 1, this.y - 4, 2, 8);
    }

    ctx.restore();
  }
}
