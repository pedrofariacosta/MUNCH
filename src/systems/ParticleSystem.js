export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.screenShake = 0;
    this.maxShake = 15;
  }

  addParticle(x, y, color, size, speedX, speedY, lifeMs, decayPercent = 0.96) {
    this.particles.push({
      x,
      y,
      color,
      size,
      vx: speedX,
      vy: speedY,
      life: lifeMs,
      maxLife: lifeMs,
      decay: decayPercent
    });
  }

  // Gera faíscas quando um orbe é comido
  spawnPelletSparks(x, y, color) {
    const numParticles = 8 + Math.floor(Math.random() * 5);
    for (let i = 0; i < numParticles; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 1.5;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const size = 2 + Math.random() * 3;
      const life = 300 + Math.random() * 200;
      this.addParticle(x, y, color, size, vx, vy, life, 0.94);
    }
  }

  // Linhas de velocidade ou poeira durante o Pulo do jogador
  spawnVaultTrail(x, y, color) {
    const numParticles = 12;
    for (let i = 0; i < numParticles; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.2 + Math.random() * 0.8;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const size = 3 + Math.random() * 3;
      const life = 400 + Math.random() * 200;
      this.addParticle(x, y, color, size, vx, vy, life, 0.92);
    }
  }

  // Explosão e faíscas ao atingir inimigo com projétil
  spawnImpactSparks(x, y, color) {
    this.triggerScreenShake(4);
    const numParticles = 15;
    for (let i = 0; i < numParticles; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.0 + Math.random() * 2.0;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const size = 2 + Math.random() * 4;
      const life = 500 + Math.random() * 300;
      this.addParticle(x, y, color, size, vx, vy, life, 0.95);
    }
  }

  // Anel circular de atordoamento
  spawnStunRing(x, y, radius, color) {
    // Cria partículas distribuídas ao redor de uma circunferência
    const numParticles = 16;
    for (let i = 0; i < numParticles; i++) {
      const angle = (i / numParticles) * Math.PI * 2;
      const vx = Math.cos(angle) * 0.5;
      const vy = Math.sin(angle) * 0.5;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      this.addParticle(px, py, color, 2, vx, vy, 400, 0.98);
    }
  }

  triggerScreenShake(amount) {
    this.screenShake = Math.min(this.maxShake, this.screenShake + amount);
  }

  update(dt) {
    // Atualiza o estado de cada partícula
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt * 0.06; // Fator de escala para manter velocidade estável independente do framerate
      p.y += p.vy * dt * 0.06;
      p.vx *= p.decay;
      p.vy *= p.decay;
      p.life -= dt;
      
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Suaviza o tremor da tela ao longo do tempo
    if (this.screenShake > 0) {
      this.screenShake -= dt * 0.015;
      if (this.screenShake < 0.1) this.screenShake = 0;
    }
  }

  draw(ctx) {
    ctx.save();
    this.particles.forEach(p => {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    });
    ctx.restore();
  }

  // Calcula o desvio de trepidação para tremer a câmera
  getShakeOffset() {
    if (this.screenShake <= 0) return { x: 0, y: 0 };
    const angle = Math.random() * Math.PI * 2;
    return {
      x: Math.cos(angle) * this.screenShake,
      y: Math.sin(angle) * this.screenShake
    };
  }

  clear() {
    this.particles = [];
    this.screenShake = 0;
  }
}
