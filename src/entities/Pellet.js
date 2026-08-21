import { TILE_SIZE, COLOR_PALETTE } from '../config/constants.js';

export class Pellet {
  constructor(gridX, gridY, type) {
    this.gridX = gridX;
    this.gridY = gridY;
    
    // Coordenadas centralizadas no bloco da grade
    this.x = gridX * TILE_SIZE + TILE_SIZE / 2;
    this.y = gridY * TILE_SIZE + TILE_SIZE / 2;
    
    this.type = type; // Pode ser 'NORMAL', 'GOLD' ou 'POWER'
    this.collected = false;
    
    // Timer para controlar as animações
    this.animTimer = Math.random() * 1000;
  }

  update(dt) {
    this.animTimer += dt;
  }

  draw(ctx) {
    if (this.collected) return;
    
    ctx.save();
    
    const pulseFactor = Math.sin(this.animTimer * 0.005);
    
    switch (this.type) {
      case 'NORMAL':
        // Orbe normal pequeno
        ctx.fillStyle = COLOR_PALETTE.PELLET;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'GOLD':
        // Orbe dourado brilhante
        ctx.shadowColor = COLOR_PALETTE.GOLD_PELLET;
        ctx.shadowBlur = 8 + pulseFactor * 4;
        
        ctx.fillStyle = COLOR_PALETTE.GOLD_PELLET;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 6 + pulseFactor * 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Detalhe interno do orbe dourado
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3 + pulseFactor * 0.8, 0, Math.PI * 2);
        ctx.stroke();
        break;
        
      case 'POWER':
        // Super orbe piscante
        ctx.shadowColor = COLOR_PALETTE.POWER_PELLET;
        ctx.shadowBlur = 12 + pulseFactor * 6;
        
        // Efeito pulso de transparência
        ctx.fillStyle = COLOR_PALETTE.POWER_PELLET;
        ctx.globalAlpha = 0.7 + pulseFactor * 0.3;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, 8 + pulseFactor * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Núcleo branco no centro do orbe
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 1.0;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
        ctx.fill();
        break;
    }
    
    ctx.restore();
  }
}
