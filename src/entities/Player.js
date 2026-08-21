import { TILE_SIZE, DIRECTIONS, SKILLS_CONFIG, ENTITY_SPEEDS, COLOR_PALETTE } from '../config/constants.js';
import { Projectile } from './Projectile.js';

export class Player {
  constructor(gridX, gridY) {
    this.gridX = gridX;
    this.gridY = gridY;
    
    // Coordenadas em pixel (centralizadas no bloco correspondente da grade)
    this.x = gridX * TILE_SIZE;
    this.y = gridY * TILE_SIZE;
    
    this.targetX = this.x;
    this.targetY = this.y;
    
    this.dir = DIRECTIONS.RIGHT;
    this.nextDir = DIRECTIONS.NONE;
    
    // Parâmetros principais do jogador
    this.speed = 0.14; // Velocidade em pixels por milissegundo
    this.lives = 3;
    this.maxLives = 3;
    
    // Estado das habilidades
    this.vaultCooldown = 0;
    this.blasterCooldown = 0;
    this.vaultTimer = 0; // Se maior que zero, indica que o jogador está saltando
    this.vaultStart = { x: 0, y: 0 };
    this.vaultDuration = 220; // Duração do salto em milissegundos
    
    // Fatores de distorção visual para animações (squish e stretch)
    this.squishX = 1;
    this.squishY = 1;
    this.walkAnimTimer = 0;
    
    // Ângulo para onde o jogador está olhando (direciona os olhos)
    this.angle = 0;
  }

  reset(gridX, gridY) {
    this.gridX = gridX;
    this.gridY = gridY;
    this.x = gridX * TILE_SIZE;
    this.y = gridY * TILE_SIZE;
    this.targetX = this.x;
    this.targetY = this.y;
    this.dir = DIRECTIONS.RIGHT;
    this.nextDir = DIRECTIONS.NONE;
    this.vaultTimer = 0;
    this.squishX = 1;
    this.squishY = 1;
    this.walkAnimTimer = 0;
    this.angle = 0;
  }

  isMoving() {
    return this.x !== this.targetX || this.y !== this.targetY;
  }

  update(dt, mapManager, particleSystem, activeJokers, statsModifiers, addProjectile) {
    // 1. Atualiza tempos de recarga
    const stats = this.getModifiedStats(statsModifiers);
    
    if (this.vaultCooldown > 0) {
      this.vaultCooldown = Math.max(0, this.vaultCooldown - dt);
    }
    if (this.blasterCooldown > 0) {
      this.blasterCooldown = Math.max(0, this.blasterCooldown - dt);
    }

    // 2. Controla o salto (Pulo / Vault) ativo
    if (this.vaultTimer > 0) {
      this.vaultTimer -= dt;
      const progress = 1 - Math.max(0, this.vaultTimer) / this.vaultDuration;
      
      // Interpolação linear da posição
      this.x = this.vaultStart.x + (this.targetX - this.vaultStart.x) * progress;
      this.y = this.vaultStart.y + (this.targetY - this.vaultStart.y) * progress;

      // Efeito de achatamento do slime durante o pulo
      this.squishX = 1 - Math.sin(progress * Math.PI) * 0.35;
      this.squishY = 1 + Math.sin(progress * Math.PI) * 0.35;

      // Cria partículas de rastro de fumaça/poeira
      if (Math.random() < 0.4) {
        particleSystem.addParticle(
          this.x + TILE_SIZE/2, 
          this.y + TILE_SIZE/2, 
          'rgba(255,255,255,0.7)', 
          3, 
          (Math.random() - 0.5) * 0.4, 
          (Math.random() - 0.5) * 0.4, 
          300
        );
      }

      if (this.vaultTimer <= 0) {
        this.x = this.targetX;
        this.y = this.targetY;
        this.squishX = 1.2; // Efeito rebote ao pousar
        this.squishY = 0.8;
        particleSystem.spawnVaultTrail(this.x + TILE_SIZE/2, this.y + TILE_SIZE/2, COLOR_PALETTE.PLAYER_OUTLINE);
        particleSystem.triggerScreenShake(2);
      }
      return; // Pula a lógica de movimento comum se estiver saltando
    }

    // Retorna a forma original gradualmente
    this.squishX += (1 - this.squishX) * 0.15;
    this.squishY += (1 - this.squishY) * 0.15;

    // 3. Movimentação Contínua baseada em Velocidade (Auto-Walk Arcade Engine)
    if (this.dir === DIRECTIONS.NONE) {
      if (this.nextDir !== DIRECTIONS.NONE) {
        const nextGridX = this.gridX + this.nextDir.x;
        const nextGridY = this.gridY + this.nextDir.y;
        if (mapManager.isTileWalkable(nextGridX, nextGridY)) {
          this.dir = this.nextDir;
          this.angle = this.dir.angle;
          this.nextDir = DIRECTIONS.NONE;
        } else {
          this.nextDir = DIRECTIONS.NONE;
        }
      }
      if (this.dir === DIRECTIONS.NONE) return;
    }

    let step = this.speed * dt;

    // Efeito de gelatina ao andar (contração/expansão periódica)
    this.walkAnimTimer += dt * 0.015;
    this.squishX = 1 + Math.sin(this.walkAnimTimer) * 0.06;
    this.squishY = 1 - Math.sin(this.walkAnimTimer) * 0.06;

    while (step > 0 && this.dir !== DIRECTIONS.NONE) {
      const targetCenter = {
        x: (this.gridX + this.dir.x) * TILE_SIZE,
        y: (this.gridY + this.dir.y) * TILE_SIZE
      };

      const distToTargetCenter = Math.hypot(targetCenter.x - this.x, targetCenter.y - this.y);

      if (step < distToTargetCenter) {
        if (this.nextDir !== DIRECTIONS.NONE && this.nextDir !== this.dir) {
          const isPerpendicular = (this.dir.x !== 0 && this.nextDir.y !== 0) || (this.dir.y !== 0 && this.nextDir.x !== 0);
          if (isPerpendicular) {
            const tileCenter = { x: this.gridX * TILE_SIZE, y: this.gridY * TILE_SIZE };
            const distToCenter = Math.hypot(tileCenter.x - this.x, tileCenter.y - this.y);

            if (distToCenter <= 14) {
              const bufGridX = this.gridX + this.nextDir.x;
              const bufGridY = this.gridY + this.nextDir.y;
              if (mapManager.isTileWalkable(bufGridX, bufGridY)) {
                this.x = tileCenter.x;
                this.y = tileCenter.y;
                this.dir = this.nextDir;
                this.angle = this.dir.angle;
                this.nextDir = DIRECTIONS.NONE;
                continue;
              }
            }
          }
        }

        this.x += this.dir.x * step;
        this.y += this.dir.y * step;
        step = 0;
      } else {
        step -= distToTargetCenter;
        this.x = targetCenter.x;
        this.y = targetCenter.y;
        
        this.gridX = Math.floor((this.x + TILE_SIZE / 2) / TILE_SIZE);
        this.gridY = Math.floor((this.y + TILE_SIZE / 2) / TILE_SIZE);

        let directionChanged = false;
        if (this.nextDir !== DIRECTIONS.NONE) {
          const bufGridX = this.gridX + this.nextDir.x;
          const bufGridY = this.gridY + this.nextDir.y;
          
          if (mapManager.isTileWalkable(bufGridX, bufGridY)) {
            this.dir = this.nextDir;
            this.angle = this.dir.angle;
            this.nextDir = DIRECTIONS.NONE;
            directionChanged = true;
          } else {
            this.nextDir = DIRECTIONS.NONE;
          }
        }

        if (!directionChanged) {
          const nextGridX = this.gridX + this.dir.x;
          const nextGridY = this.gridY + this.dir.y;

          if (!mapManager.isTileWalkable(nextGridX, nextGridY)) {
            this.x = this.gridX * TILE_SIZE;
            this.y = this.gridY * TILE_SIZE;
            this.dir = DIRECTIONS.NONE;
            step = 0;
          }
        }
      }
    }
  }

  alignWithGrid() {
    this.x = this.gridX * TILE_SIZE;
    this.y = this.gridY * TILE_SIZE;
    this.targetX = this.x;
    this.targetY = this.y;
  }

  // Dispara a habilidade de salto (Pulo / Vault)
  triggerVault(mapManager, particleSystem, statsModifiers) {
    if (this.vaultCooldown > 0 || this.vaultTimer > 0) return false;
    if (this.dir === DIRECTIONS.NONE) return false; // Deve estar em movimento para saltar
    
    const stats = this.getModifiedStats(statsModifiers);
    const jumpDist = SKILLS_CONFIG.VAULT.DISTANCE;
    const destGridX = this.gridX + this.dir.x * jumpDist;
    const destGridY = this.gridY + this.dir.y * jumpDist;

    // Só permite saltar se a célula destino for passável (não cai dentro de paredes)
    if (mapManager.isTileWalkable(destGridX, destGridY)) {
      this.vaultStart = { x: this.x, y: this.y };
      this.gridX = destGridX;
      this.gridY = destGridY;
      this.targetX = this.gridX * TILE_SIZE;
      this.targetY = this.gridY * TILE_SIZE;
      this.vaultTimer = this.vaultDuration;
      
      // Cooldown (aplica modificadores obtidos através de itens)
      const baseCooldown = SKILLS_CONFIG.VAULT.COOLDOWN_MS;
      this.vaultCooldown = baseCooldown * (stats.vaultCooldownMultiplier || 1);
      
      particleSystem.spawnVaultTrail(this.x + TILE_SIZE/2, this.y + TILE_SIZE/2, 'rgba(255, 255, 255, 0.4)');
      return true;
    }
    return false;
  }

  triggerBlaster(particleSystem, statsModifiers, addProjectile) {
    if (this.blasterCooldown > 0 || this.vaultTimer > 0) return false;
    
    // Escolhe a direção do disparo: se estiver parado, usa a última direção ativa
    let shootDir = this.dir;
    if (shootDir === DIRECTIONS.NONE) {
      shootDir = Object.values(DIRECTIONS).find(d => d.angle === this.angle) || DIRECTIONS.RIGHT;
    }

    const stats = this.getModifiedStats(statsModifiers);

    // Cria o projétil na tela
    const startX = this.x + TILE_SIZE / 2;
    const startY = this.y + TILE_SIZE / 2;
    const proj = new Projectile(startX, startY, shootDir);
    addProjectile(proj);

    // Configura o cooldown
    const baseCooldown = SKILLS_CONFIG.BLASTER.COOLDOWN_MS;
    this.blasterCooldown = baseCooldown * (stats.blasterCooldownMultiplier || 1);

    particleSystem.triggerScreenShake(3);
    
    // Efeito visual rápido de faísca por recuo do disparo
    for (let i = 0; i < 5; i++) {
      particleSystem.addParticle(
        startX + shootDir.x * 12,
        startY + shootDir.y * 12,
        COLOR_PALETTE.PROJECTILE,
        2,
        shootDir.x * 2 + (Math.random() - 0.5),
        shootDir.y * 2 + (Math.random() - 0.5),
        200
      );
    }
    
    return true;
  }

  getModifiedStats(statsModifiers) {
    let stats = {
      vaultCooldownMultiplier: 1,
      blasterCooldownMultiplier: 1,
      stunDurationMultiplier: 1,
      stageCompletionGoldBonus: 0
    };
    
    statsModifiers.forEach(relic => {
      if (relic && typeof relic.modifyStats === 'function') {
        stats = relic.modifyStats(stats);
      }
    });

    return stats;
  }

  draw(ctx) {
    ctx.save();
    
    // Move para o centro do slime
    const centerX = this.x + TILE_SIZE / 2;
    const centerY = this.y + TILE_SIZE / 2;
    ctx.translate(centerX, centerY);
    
    // Rotaciona para apontar para a direção do movimento
    ctx.rotate(this.angle);

    // Escala para simular contração/estiramento das animações
    ctx.scale(this.squishX, this.squishY);

    // Desenha a forma base do corpo (cubo cinza com cantos arredondados)
    const size = TILE_SIZE - 4;
    const radius = 6;
    
    ctx.beginPath();
    ctx.roundRect(-size/2, -size/2, size, size, radius);
    
    // Borda branca do cubo
    ctx.strokeStyle = COLOR_PALETTE.PLAYER_OUTLINE;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Preenchimento cinza do corpo
    ctx.fillStyle = COLOR_PALETTE.PLAYER_SLIME;
    ctx.fill();

    // Draw angry squinting eyes looking forwards (to the right inside local rotated coords)
    // === BROWS (white, thick, ~28deg inward) ===
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    // Upper brow
    ctx.beginPath();
    ctx.moveTo(0, -11);
    ctx.lineTo(11, -6);
    ctx.stroke();
    // Lower brow
    ctx.beginPath();
    ctx.moveTo(0, 11);
    ctx.lineTo(11, 6);
    ctx.stroke();

    // === EYES (white triangular wedges \ / pointing inward) ===
    ctx.fillStyle = '#ffffff';
    // Upper eye wedge (wide at outer, pointed inward)
    ctx.beginPath();
    ctx.moveTo(1, -9);
    ctx.lineTo(11, -5);
    ctx.lineTo(1, -3);
    ctx.closePath();
    ctx.fill();
    // Lower eye wedge
    ctx.beginPath();
    ctx.moveTo(1, 9);
    ctx.lineTo(11, 5);
    ctx.lineTo(1, 3);
    ctx.closePath();
    ctx.fill();

    // === PUPILS (dark circles in lower-inner area) ===
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(7, -5.5, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(7, 5.5, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // === NOSTRILS (tiny white dots) ===
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(5, -1, 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(5, 1, 0.6, 0, Math.PI * 2);
    ctx.fill();

    // === SNARL MOUTH (dark cavity + teeth) ===
    // Dark mouth opening
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(2, -2, 9, 4);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(2, -2, 9, 4);
    // Teeth (white triangles from top edge)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(3.5, -2);
    ctx.lineTo(5.5, 0.5);
    ctx.lineTo(7.5, -2);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}
