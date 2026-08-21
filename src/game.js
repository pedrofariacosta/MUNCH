// ════════════════════════════════════
//   MUNCH Gameplay Engine v1.2
// ════════════════════════════════════

(function() {
  // Favicon Estático
  const faviconCanvas = document.createElement('canvas');
  faviconCanvas.width = 32;
  faviconCanvas.height = 32;
  const faviconCtx = faviconCanvas.getContext('2d');
  
  let faviconLink = document.getElementById('dynamic-favicon');
  if (!faviconLink) {
    faviconLink = document.createElement('link');
    faviconLink.id = 'dynamic-favicon';
    faviconLink.rel = 'icon';
    faviconLink.type = 'image/png';
    document.head.appendChild(faviconLink);
  }
  
  function drawStaticFavicon() {
    faviconCtx.clearRect(0, 0, 32, 32);
    faviconCtx.save();
    faviconCtx.translate(16, 16);
    
    faviconCtx.beginPath();
    faviconCtx.roundRect(-9, -9, 18, 18, 3.5);
    faviconCtx.fillStyle = '#9e9e9e';
    faviconCtx.fill();
    faviconCtx.strokeStyle = '#ffffff';
    faviconCtx.lineWidth = 2.5;
    faviconCtx.stroke();
    
    faviconCtx.strokeStyle = '#ffffff';
    faviconCtx.lineWidth = 1.8;
    faviconCtx.lineCap = 'round';
    faviconCtx.beginPath();
    faviconCtx.moveTo(-7, -4.5);
    faviconCtx.lineTo(-2, -2.5);
    faviconCtx.stroke();
    faviconCtx.beginPath();
    faviconCtx.moveTo(7, -4.5);
    faviconCtx.lineTo(2, -2.5);
    faviconCtx.stroke();
    
    faviconCtx.fillStyle = '#ffffff';
    faviconCtx.beginPath();
    faviconCtx.moveTo(-7, -1);
    faviconCtx.lineTo(-2.5, 1.2);
    faviconCtx.lineTo(-7, 2.5);
    faviconCtx.closePath();
    faviconCtx.fill();
    faviconCtx.beginPath();
    faviconCtx.moveTo(7, -1);
    faviconCtx.lineTo(2.5, 1.2);
    faviconCtx.lineTo(7, 2.5);
    faviconCtx.closePath();
    faviconCtx.fill();
    
    faviconCtx.fillStyle = '#1a1a1a';
    faviconCtx.fillRect(-5, 0.2, 1.5, 1.5);
    faviconCtx.fillRect(3.5, 0.2, 1.5, 1.5);
    
    faviconCtx.fillStyle = '#ffffff';
    faviconCtx.fillRect(-1.2, 3.5, 0.8, 0.8);
    faviconCtx.fillRect(0.8, 3.5, 0.8, 0.8);
    
    faviconCtx.fillStyle = '#1a1a1a';
    faviconCtx.fillRect(-4, 5.5, 8, 2.5);
    faviconCtx.strokeStyle = '#ffffff';
    faviconCtx.lineWidth = 0.6;
    faviconCtx.strokeRect(-4, 5.5, 8, 2.5);
    
    faviconCtx.restore();
    faviconLink.href = faviconCanvas.toDataURL('image/png');
  }
  
  drawStaticFavicon();

  // Configurações do Jogo
  const TILE_SIZE = 40;
  const GRID_WIDTH = 20;
  const GRID_HEIGHT = 15;

  const DIRECTIONS = {
    UP:    { x: 0,  y: -1, angle: -Math.PI / 2 },
    DOWN:  { x: 0,  y: 1,  angle: Math.PI / 2  },
    LEFT:  { x: -1, y: 0,  angle: Math.PI      },
    RIGHT: { x: 1,  y: 0,  angle: 0           },
    NONE:  { x: 0,  y: 0,  angle: 0           }
  };

  const GAME_STATES = {
    PLAYING: 'playing',
    PHASE_CLEAR: 'phase_clear',
    WIN_MODAL: 'win_modal',
    GAME_OVER: 'game_over'
  };

  // Mapa base do labirinto (20 x 15)
  // 0: Vazio/Caminho, 1: Parede, 2: Pastilha, 3: Pastilha Ouro, 4: Power Pellet
  const BASE_MAP = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,4,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,4,1],
    [1,2,1,1,2,1,1,1,2,1,1,2,1,1,1,2,1,1,2,1],
    [1,3,1,1,2,1,1,1,2,1,1,2,1,1,1,2,1,1,3,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,2,1,2,1,1,1,1,1,1,2,1,2,1,1,2,1],
    [1,2,2,2,2,1,2,2,2,1,1,2,2,2,1,2,2,2,2,1],
    [0,2,1,1,2,1,1,1,0,1,1,0,1,1,1,2,1,1,2,0], // Wrap portal nas extremidades (linha 7)
    [1,2,2,2,2,1,2,2,2,2,2,2,2,2,1,2,2,2,2,1],
    [1,2,1,1,2,1,2,1,1,1,1,1,1,2,1,2,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,1],
    [1,3,1,1,2,1,1,1,2,1,1,2,1,1,1,2,1,1,3,1],
    [1,2,1,1,2,1,1,1,2,1,1,2,1,1,1,2,1,1,2,1],
    [1,4,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,4,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ];

  // Engine principal
  class Game {
    constructor() {
      this.canvas = document.getElementById('gameCanvas');
      this.ctx = this.canvas.getContext('2d');
      this.bezel = document.getElementById('arcadeBezel');

      // Modais
      this.modalWin = document.getElementById('modalWin');
      this.modalGameOver = document.getElementById('modalGameOver');
      this.btnNextBlind = document.getElementById('btnNextBlind');
      this.btnRestart = document.getElementById('btnRestart');

      // HUD
      this.hudBlindTarget = document.getElementById('hudBlindTarget');
      this.hudCurrentScore = document.getElementById('hudCurrentScore');
      this.hudProgressBar = document.getElementById('hudProgressBar');
      this.hudChipsValue = document.getElementById('hudChipsValue');
      this.hudMultValueEl = document.getElementById('hudMultValue');
      this.hudRoundIndicator = document.getElementById('hudRoundIndicator');
      this.hudLives = document.getElementById('hudLives');
      this.hudGold = document.getElementById('hudGold');
      
      this.chipsBox = document.getElementById('chipsBox');
      this.multBox = document.getElementById('multBox');

      // Cooldown Skills
      this.vaultChargesEl = document.getElementById('vaultCharges');
      this.vaultCooldownFill = document.getElementById('vaultCooldownFill');
      this.blasterChargesEl = document.getElementById('blasterCharges');
      this.blasterCooldownFill = document.getElementById('blasterCooldownFill');
      
      this.skillVault = document.getElementById('skillVault');
      this.skillBlaster = document.getElementById('skillBlaster');

      // Estado do Jogo
      this.gameState = GAME_STATES.PLAYING;
      this.ante = 1;
      this.blind = 1;
      this.lives = 3;
      this.gold = 0;
      this.phase = 1;

      this.score = 0;
      this.chips = 0;
      this.mult = 1;
      this.targetScore = 1500;
      this.remainingPellets = 0;
      this.phaseClearTimer = 0;

      // Habilidades
      this.vaultMaxCharges = 2;
      this.vaultCharges = 2;
      this.vaultCooldown = 0;
      this.vaultMaxCooldown = 3000;

      this.blasterMaxCharges = 1;
      this.blasterCharges = 1;
      this.blasterCooldown = 0;
      this.blasterMaxCooldown = 4000;

      this.map = [];
      this.particles = [];
      this.projectiles = [];
      this.floatingTexts = [];

      this.player = null;
      this.ghosts = [];

      this.frightenedTimer = 0;

      this.init();
    }

    init() {
      // Eventos teclado
      window.addEventListener('keydown', (e) => {
        if (!this.player) return;

        // Armazena no buffer de entrada (Input Buffer) do jogador
        if (e.code === 'ArrowUp' || e.code === 'KeyW') this.player.setInput(DIRECTIONS.UP);
        if (e.code === 'ArrowDown' || e.code === 'KeyS') this.player.setInput(DIRECTIONS.DOWN);
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.player.setInput(DIRECTIONS.LEFT);
        if (e.code === 'ArrowRight' || e.code === 'KeyD') this.player.setInput(DIRECTIONS.RIGHT);

        // Pulo
        if (e.code === 'Space') {
          e.preventDefault();
          this.triggerVault();
        }

        // Disparo
        if (e.code === 'KeyF') {
          this.triggerBlaster();
        }

        // Reiniciar rápido
        if (this.gameState === GAME_STATES.GAME_OVER && e.code === 'KeyR') {
          this.restartGame();
        }
      });

      // Clique no canvas atira blaster
      this.canvas.addEventListener('mousedown', (e) => {
        if (e.button === 0 && this.gameState === GAME_STATES.PLAYING) {
          this.triggerBlaster();
        }
      });

      // Modais
      this.btnNextBlind.addEventListener('click', () => this.nextRound());
      this.btnRestart.addEventListener('click', () => this.restartGame());

      this.loadLevel();
      this.lastTime = performance.now();
      requestAnimationFrame((t) => this.gameLoop(t));
    }

    loadLevel() {
      this.map = BASE_MAP.map(row => [...row]);

      // Conta total de pastilhas no mapa
      this.remainingPellets = 0;
      for (let r = 0; r < GRID_HEIGHT; r++) {
        for (let c = 0; c < GRID_WIDTH; c++) {
          if (this.map[r][c] >= 2) this.remainingPellets++;
        }
      }
      this.totalPellets = this.remainingPellets; // Guarda o total para a barra de progresso

      // Cria jogador
      this.player = new Player(9, 10);

      // Cria inimigos conforme a fase (dificuldade progressiva)
      this.ghosts = this.spawnEnemiesForPhase(this.phase);

      this.projectiles = [];
      this.particles = [];
      this.floatingTexts = [];
      this.frightenedTimer = 0;
      this.phaseClearTimer = 0;

      this.targetScore = this.ante * 1500 + (this.blind - 1) * 1000;
      this.score = 0;
      this.chips = 0;
      this.mult = 1;

      this.vaultCharges = this.vaultMaxCharges;
      this.vaultCooldown = 0;
      this.blasterCharges = this.blasterMaxCharges;
      this.blasterCooldown = 0;

      this.updateHUD();
    }

    // Gera os inimigos conforme a fase atual — escalabilidade de dificuldade
    spawnEnemiesForPhase(phase) {
      const speedMultiplier = this.getEnemySpeedMultiplier(phase);

      if (phase === 1) {
        // Tutorial calmo: apenas 1 Espada lenta
        const spade = new SpikeEnemy(8, 7, 'SPADE');
        spade.speed *= speedMultiplier;
        return [spade];
      } else if (phase === 2) {
        // Fase 2: 1 Espada + 1 Ouro, velocidade maior
        const spade = new SpikeEnemy(8, 7, 'SPADE');
        const diamond = new SpikeEnemy(11, 7, 'DIAMOND');
        spade.speed *= speedMultiplier;
        diamond.speed *= speedMultiplier;
        return [spade, diamond];
      } else {
        // Fase 3+: 2 Espadas + 1 Ouro, velocidade crescente
        const enemies = [
          new SpikeEnemy(8, 7, 'SPADE'),
          new SpikeEnemy(9, 7, 'DIAMOND'),
          new SpikeEnemy(11, 7, 'SPADE')
        ];
        enemies.forEach(e => e.speed *= speedMultiplier);
        return enemies;
      }
    }

    // Calcula o multiplicador de velocidade dos inimigos relativo ao jogador
    getEnemySpeedMultiplier(phase) {
      if (phase === 1) return 0.70;
      if (phase === 2) return 0.80;
      // Fase 3+: 85% base + 5% por fase extra
      return Math.min(1.3, 0.85 + (phase - 3) * 0.05);
    }

    triggerScreenShake(intensity = 8) {
      if (!this.bezel) return;
      this.bezel.classList.remove('shake');
      void this.bezel.offsetWidth; // Reflow
      this.bezel.classList.add('shake');
      setTimeout(() => this.bezel.classList.remove('shake'), 150);
    }

    triggerVault() {
      if (!this.player || this.vaultCharges <= 0 || this.player.isJumping || this.player.dir === DIRECTIONS.NONE) return;
      
      const jumpDistance = 2;
      const targetGridX = this.player.gridX + this.player.dir.x * jumpDistance;
      const targetGridY = this.player.gridY + this.player.dir.y * jumpDistance;

      if (this.isWalkable(targetGridX, targetGridY)) {
        this.vaultCharges--;
        this.player.jumpTo(targetGridX, targetGridY);
        this.triggerScreenShake(4);

        this.spawnDust(this.player.x + TILE_SIZE / 2, this.player.y + TILE_SIZE / 2, 8, '#ffffff');
        this.addFloatingText(this.player.x + TILE_SIZE/2, this.player.y, 'PULO!', '#00E5FF');
      }
    }

    triggerBlaster() {
      if (!this.player || this.blasterCharges <= 0 || this.player.isJumping) return;

      let shootDir = this.player.dir;
      if (shootDir === DIRECTIONS.NONE) {
        shootDir = DIRECTIONS.RIGHT;
      }

      this.blasterCharges--;
      
      const startX = this.player.x + TILE_SIZE/2;
      const startY = this.player.y + TILE_SIZE/2;

      this.projectiles.push(new Laser(startX, startY, shootDir));
      this.triggerScreenShake(3);

      for (let i = 0; i < 6; i++) {
        this.particles.push(new Particle(
          startX + shootDir.x * 10,
          startY + shootDir.y * 10,
          '#FFE600',
          3,
          shootDir.x * 2.5 + (Math.random() - 0.5) * 1.5,
          shootDir.y * 2.5 + (Math.random() - 0.5) * 1.5,
          250
        ));
      }
    }

    isWalkable(gridX, gridY) {
      if (gridY === 7 && (gridX < 0 || gridX >= GRID_WIDTH)) {
        return true;
      }
      if (gridX < 0 || gridX >= GRID_WIDTH || gridY < 0 || gridY >= GRID_HEIGHT) {
        return false;
      }
      return this.map[gridY][gridX] !== 1;
    }

    addFloatingText(x, y, text, color, detail = '') {
      this.floatingTexts.push({
        x,
        y,
        text,
        detail,
        color,
        life: 1000,
        maxLife: 1000
      });
    }

    spawnDust(x, y, count = 5, color = '#ffffff') {
      for (let i = 0; i < count; i++) {
        this.particles.push(new Particle(
          x,
          y,
          color,
          Math.random() * 3 + 2,
          (Math.random() - 0.5) * 3,
          (Math.random() - 0.5) * 3,
          400
        ));
      }
    }

    updateHUD() {
      if (!this.hudBlindTarget) return;

      if (this.totalPellets > 0) {
        this.hudBlindTarget.innerText = `FALTAM: ${this.remainingPellets}`;
        const pct = Math.min(100, ((this.totalPellets - this.remainingPellets) / this.totalPellets) * 100);
        this.hudProgressBar.style.width = pct + '%';
      }

      this.hudCurrentScore.innerText = Math.round(this.score).toLocaleString();

      this.hudChipsValue.innerText = Math.round(this.chips).toLocaleString();
      this.hudMultValueEl.innerText = Math.round(this.mult);

      this.hudRoundIndicator.innerText = `ANTE ${this.ante} // BLIND ${this.blind}`;
      this.hudLives.innerText = '❤️'.repeat(Math.max(0, this.lives));
      this.hudGold.innerText = this.gold;

      this.vaultChargesEl.innerText = `${this.vaultCharges}/${this.vaultMaxCharges}`;
      this.blasterChargesEl.innerText = `${this.blasterCharges}/${this.blasterMaxCharges}`;

      if (this.vaultCharges < this.vaultMaxCharges) {
        const cldPct = 100 - (this.vaultCooldown / this.vaultMaxCooldown) * 100;
        this.vaultCooldownFill.style.width = cldPct + '%';
        this.skillVault.classList.remove('ready');
      } else {
        this.vaultCooldownFill.style.width = '100%';
        this.skillVault.classList.add('ready');
      }

      if (this.blasterCharges < this.blasterMaxCharges) {
        const cldPct = 100 - (this.blasterCooldown / this.blasterMaxCooldown) * 100;
        this.blasterCooldownFill.style.width = cldPct + '%';
        this.skillBlaster.classList.remove('ready');
      } else {
        this.blasterCooldownFill.style.width = '100%';
        this.skillBlaster.classList.add('ready');
      }
    }

    scorePop(box) {
      if (!box) return;
      box.classList.add('pop');
      setTimeout(() => box.classList.remove('pop'), 100);
    }

    addPoints(pelletType) {
      let earnedChips = 0;
      let earnedMult = 0;
      let scoreColor = '#ffffff';
      let tag = '';

      if (pelletType === 2) {
        earnedChips = 10;
        scoreColor = '#ffffff';
        tag = '+10 FICHAS';
        this.chips += earnedChips;
        this.scorePop(this.chipsBox);
      } else if (pelletType === 3) {
        earnedChips = 50;
        earnedMult = 1;
        scoreColor = '#FFE600';
        tag = '+50 FICHAS // +1 MULT';
        this.chips += earnedChips;
        this.mult += earnedMult;
        this.scorePop(this.chipsBox);
        this.scorePop(this.multBox);
      } else if (pelletType === 4) {
        earnedChips = 50;
        scoreColor = '#00E5FF';
        tag = '+50 FICHAS // EM PÂNICO!';
        this.chips += earnedChips;
        this.scorePop(this.chipsBox);

        this.frightenedTimer = 6000;
        this.ghosts.forEach(g => {
          if (g && g.state !== 'eaten' && g.state !== 'respawning') {
            g.state = 'frightened';
          }
        });
      }

      const oldScore = this.score;
      this.score = this.chips * this.mult;

      const diff = this.score - oldScore;
      if (diff > 0 && this.player) {
        this.addFloatingText(
          this.player.x + TILE_SIZE/2,
          this.player.y,
          `+${Math.round(diff).toLocaleString()}`,
          scoreColor,
          tag
        );
      }

      this.remainingPellets--;
      this.updateHUD();
      this.checkPelletClear();
    }

    // Checa se o mapa está limpo (todas as pastilhas coletadas)
    checkPelletClear() {
      if (this.remainingPellets <= 0 && this.gameState === GAME_STATES.PLAYING) {
        this.gameState = GAME_STATES.PHASE_CLEAR;
        this.phaseClearTimer = 500; // Congela 0.5s antes de mostrar o modal
        this.triggerScreenShake(12);

        // Explosão colorida de vitória
        for (let i = 0; i < 40; i++) {
          this.particles.push(new Particle(
            this.canvas.width / 2,
            this.canvas.height / 2,
            `hsl(${Math.random() * 360}, 100%, 60%)`,
            Math.random() * 4 + 3,
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 8,
            1200
          ));
        }
      }
    }

    // Mostra o modal de vitória após o breve congelamento
    showWinModal() {
      this.gameState = GAME_STATES.WIN_MODAL;
      document.getElementById('winModalScore').innerText = Math.round(this.score).toLocaleString();
      document.getElementById('winModalTarget').innerText = this.targetScore.toLocaleString();
      document.getElementById('winModalGold').innerText = `+${this.ante * 5}`;
      this.modalWin.classList.add('visible');
    }

    nextRound() {
      this.gold += this.ante * 5;
      this.phase++;
      this.blind++;
      if (this.blind > 3) {
        this.blind = 1;
        this.ante++;
      }

      this.modalWin.classList.remove('visible');
      this.gameState = GAME_STATES.PLAYING;
      this.loadLevel();
    }

    triggerGameOver() {
      this.gameState = GAME_STATES.GAME_OVER;
      this.triggerScreenShake(16);

      const record = parseInt(localStorage.getItem('munch_highscore')) || 0;
      if (this.score > record) {
        localStorage.setItem('munch_highscore', this.score);
      }

      document.getElementById('loseModalScore').innerText = Math.round(this.score).toLocaleString();
      document.getElementById('loseModalHighScore').innerText = Math.max(record, Math.round(this.score)).toLocaleString();
      
      this.modalGameOver.classList.add('visible');
    }

    restartGame() {
      this.modalGameOver.classList.remove('visible');
      this.ante = 1;
      this.blind = 1;
      this.phase = 1;
      this.lives = 3;
      this.gold = 0;
      this.gameState = GAME_STATES.PLAYING;
      this.loadLevel();
    }

    hurtPlayer() {
      if (!this.player) return;
      this.lives--;
      this.triggerScreenShake(14);

      this.spawnDust(this.player.x + TILE_SIZE/2, this.player.y + TILE_SIZE/2, 12, '#FF2E2E');

      if (this.lives <= 0) {
        this.triggerGameOver();
      } else {
        this.player.resetPosition(9, 10);
        this.ghosts.forEach((g, i) => {
          if (g) g.resetPosition(8 + i, 7);
        });
      }
      this.updateHUD();
    }

    eatGhost(ghost) {
      ghost.state = 'eaten';
      
      const ghostBaseScore = 200;
      const ghostBaseMult = 2;
      
      this.chips += ghostBaseScore;
      this.mult += ghostBaseMult;
      
      const oldScore = this.score;
      this.score = this.chips * this.mult;
      const diff = this.score - oldScore;

      this.triggerScreenShake(6);
      this.spawnDust(ghost.x + TILE_SIZE/2, ghost.y + TILE_SIZE/2, 15, '#ffffff');

      this.addFloatingText(
        ghost.x + TILE_SIZE/2,
        ghost.y,
        `DEVORADO! +${Math.round(diff).toLocaleString()}`,
        '#00E5FF',
        `+200 Fichas x2 Mult`
      );

      this.updateHUD();
    }

    update(dt) {
      // Congelamento breve após limpar o mapa
      if (this.gameState === GAME_STATES.PHASE_CLEAR) {
        this.phaseClearTimer -= dt;
        // Partículas e textos continuam animando durante o freeze
        this.particles.forEach(p => { if (p) p.update(dt); });
        this.particles = this.particles.filter(p => p && p.active && !p.toRemove);
        if (this.phaseClearTimer <= 0) {
          this.showWinModal();
        }
        return;
      }

      if (this.gameState !== GAME_STATES.PLAYING) return;

      // 1. Cooldown de pulo
      if (this.vaultCharges < this.vaultMaxCharges) {
        this.vaultCooldown += dt;
        if (this.vaultCooldown >= this.vaultMaxCooldown) {
          this.vaultCharges++;
          this.vaultCooldown = 0;
        }
      }

      // 2. Cooldown de disparo
      if (this.blasterCharges < this.blasterMaxCharges) {
        this.blasterCooldown += dt;
        if (this.blasterCooldown >= this.blasterMaxCooldown) {
          this.blasterCharges++;
          this.blasterCooldown = 0;
        }
      }

      // 3. Temporizador de pânico (frightened)
      if (this.frightenedTimer > 0) {
        this.frightenedTimer -= dt;
        if (this.frightenedTimer <= 0) {
          this.ghosts.forEach(g => {
            if (g && g.state === 'frightened') g.state = 'normal';
          });
        }
      }

      // 4. Jogador
      if (this.player) {
        this.player.update(dt, this);
      }

      // 5. Projéteis (Limpeza Estável / Sem Crash)
      this.projectiles.forEach(proj => {
        if (proj) proj.update(dt, this);
      });
      this.projectiles = this.projectiles.filter(proj => proj && proj.active && !proj.toRemove);

      // 6. Inimigos (Limpeza Estável / Sem Crash)
      this.ghosts.forEach(ghost => {
        if (ghost) ghost.update(dt, this);
      });
      this.ghosts = this.ghosts.filter(ghost => ghost && !ghost.toRemove);

      // 7. Colisões do Jogador com Inimigos (Hitbox Tolerante)
      if (this.player && !this.player.isJumping) {
        this.ghosts.forEach(ghost => {
          if (!ghost || ghost.state === 'eaten' || ghost.state === 'respawning') return;

          const dist = Math.hypot(
            (this.player.x + TILE_SIZE/2) - (ghost.x + TILE_SIZE/2),
            (this.player.y + TILE_SIZE/2) - (ghost.y + TILE_SIZE/2)
          );

          // Hitbox de colisão reduzida (0.55 * TILE_SIZE ≈ 22px)
          if (dist < TILE_SIZE * 0.55) {
            if (ghost.state === 'frightened' || ghost.state === 'stunned') {
              this.eatGhost(ghost);
            } else {
              this.hurtPlayer();
            }
          }
        });
      }

      // 8. Partículas e textos flutuantes (Limpeza Estável)
      this.particles.forEach(p => {
        if (p) p.update(dt);
      });
      this.particles = this.particles.filter(p => p && p.active && !p.toRemove);

      for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
        const ft = this.floatingTexts[i];
        if (!ft) continue;
        ft.life -= dt;
        ft.y -= 0.05 * dt;
        if (ft.life <= 0) {
          this.floatingTexts.splice(i, 1);
        }
      }

      this.updateHUD();
    }

    draw() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // ── Chão do Corredor (Preto Absoluto + Micro-Grid Pontilhado) ──
      this.ctx.fillStyle = '#08080a';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      this.ctx.fillStyle = 'rgba(74, 75, 87, 0.22)';
      for (let x = 20; x < this.canvas.width; x += 40) {
        for (let y = 20; y < this.canvas.height; y += 40) {
          this.ctx.fillRect(x - 0.75, y - 0.75, 1.5, 1.5);
        }
      }

      // ── Desenha o Labirinto (Temática Balatro) ──
      for (let r = 0; r < GRID_HEIGHT; r++) {
        for (let c = 0; c < GRID_WIDTH; c++) {
          const tile = this.map[r][c];
          
          if (tile === 1) {
            // Muro: Corpo Cinza-Ardósia Metálico Escuro (#1b1b22)
            this.ctx.fillStyle = '#1b1b22';
            this.ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            
            // Contorno: Linha sólida sutil Cinza Platina (#4a4b57)
            this.ctx.strokeStyle = '#4a4b57';
            this.ctx.lineWidth = 1.8;
            this.ctx.strokeRect(c * TILE_SIZE + 1.5, r * TILE_SIZE + 1.5, TILE_SIZE - 3, TILE_SIZE - 3);

            // Nós de conexão Amarelo Arcade (#FFE600) nos vértices (cantos dos tiles de parede)
            this.ctx.fillStyle = '#FFE600';
            this.ctx.beginPath();
            this.ctx.arc(c * TILE_SIZE, r * TILE_SIZE, 2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.beginPath();
            this.ctx.arc(c * TILE_SIZE + TILE_SIZE, r * TILE_SIZE, 2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.beginPath();
            this.ctx.arc(c * TILE_SIZE, r * TILE_SIZE + TILE_SIZE, 2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.beginPath();
            this.ctx.arc(c * TILE_SIZE + TILE_SIZE, r * TILE_SIZE + TILE_SIZE, 2, 0, Math.PI * 2);
            this.ctx.fill();

          } else {
            // Caminho - Pastilhas e Moedas
            const cx = c * TILE_SIZE + TILE_SIZE / 2;
            const cy = r * TILE_SIZE + TILE_SIZE / 2;

            if (tile === 2) {
              // Pastilha Normal: Losango Branco Brilhante (#ffffff)
              this.ctx.fillStyle = '#ffffff';
              this.ctx.beginPath();
              this.ctx.moveTo(cx, cy - 4.5);
              this.ctx.lineTo(cx + 4.5, cy);
              this.ctx.lineTo(cx, cy + 4.5);
              this.ctx.lineTo(cx - 4.5, cy);
              this.ctx.closePath();
              this.ctx.fill();
            } else if (tile === 3) {
              // Pastilha Dourada: Moeda Octogonal Dourada Pulsante (#FFE600)
              const pulse = 1 + Math.sin(performance.now() * 0.008) * 0.12;
              const rVal = 5.5 * pulse;
              
              this.ctx.fillStyle = '#FFE600';
              this.ctx.shadowColor = 'rgba(255, 230, 0, 0.55)';
              this.ctx.shadowBlur = 6;
              
              this.ctx.beginPath();
              for (let i = 0; i < 8; i++) {
                const angle = (i * Math.PI) / 4;
                const px = cx + Math.cos(angle) * rVal;
                const py = cy + Math.sin(angle) * rVal;
                if (i === 0) this.ctx.moveTo(px, py);
                else this.ctx.lineTo(px, py);
              }
              this.ctx.closePath();
              this.ctx.fill();
              this.ctx.shadowBlur = 0;
            } else if (tile === 4) {
              // Power Pellet: Pulso suave ciano com senoide (~1.3s de ciclo)
              const sineCycle = (Math.sin(performance.now() * 0.00483) + 1) / 2; // 0.0 a 1.0 suave
              const pelletOpacity = 0.5 + sineCycle * 0.5; // Oscila entre 0.5 e 1.0
              const glowIntensity = 4 + sineCycle * 8;

              this.ctx.save();
              this.ctx.globalAlpha = pelletOpacity;
              this.ctx.fillStyle = '#00E5FF';
              this.ctx.shadowColor = 'rgba(0, 229, 255, 0.6)';
              this.ctx.shadowBlur = glowIntensity;
              this.ctx.beginPath();
              this.ctx.arc(cx, cy, 7, 0, Math.PI * 2);
              this.ctx.fill();
              this.ctx.shadowBlur = 0;
              this.ctx.restore();
            }
          }
        }
      }

      // Sombra do jogador pulando
      if (this.player && this.player.isJumping) {
        this.ctx.save();
        const centerX = this.player.x + TILE_SIZE / 2;
        const centerY = this.player.y + TILE_SIZE / 2;
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.beginPath();
        const shadowSize = 10 * (1 - Math.sin(this.player.jumpProgress * Math.PI) * 0.3);
        this.ctx.arc(centerX, centerY + 14, shadowSize, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }

      // Desenha jogador
      if (this.player) {
        this.player.draw(this.ctx);
      }

      // Projéteis
      this.projectiles.forEach(proj => {
        if (proj) proj.draw(this.ctx);
      });

      // Inimigos
      this.ghosts.forEach(ghost => {
        if (ghost) ghost.draw(this.ctx);
      });

      // Partículas
      this.particles.forEach(p => {
        if (p) p.draw(this.ctx);
      });

      // Textos Flutuantes
      this.ctx.save();
      this.floatingTexts.forEach(t => {
        if (!t) return;
        const alpha = t.life / t.maxLife;
        this.ctx.globalAlpha = alpha;
        this.ctx.textAlign = 'center';
        
        this.ctx.font = 'bold 12px "Space Grotesk", sans-serif';
        this.ctx.fillStyle = t.color;
        this.ctx.fillText(t.text, t.x, t.y);

        if (t.detail) {
          this.ctx.font = '7px "Press Start 2P", monospace';
          this.ctx.fillStyle = '#8e8e8e';
          this.ctx.fillText(t.detail, t.x, t.y + 11);
        }
      });
      this.ctx.restore();
    }

    gameLoop(currentTime) {
      const dt = currentTime - this.lastTime;
      this.lastTime = currentTime;

      const cappedDt = Math.min(dt, 100);

      this.update(cappedDt);
      this.draw();

      requestAnimationFrame((t) => this.gameLoop(t));
    }
  }

  // ── Player (Slime 2.5D Dinâmico) ──
  class Player {
    constructor(gridX, gridY) {
      this.gridX = gridX;
      this.gridY = gridY;
      
      this.x = gridX * TILE_SIZE;
      this.y = gridY * TILE_SIZE;
      
      this.targetX = this.x;
      this.targetY = this.y;

      this.speed = 0.16;
      this.dir = DIRECTIONS.RIGHT;
      
      // Squash & Stretch
      this.squishX = 1;
      this.squishY = 1;
      this.angle = 0;
      this.walkTimer = 0;

      // Pulo
      this.isJumping = false;
      this.jumpDuration = 250;
      this.jumpTimeLeft = 0;
      this.jumpStart = { x: 0, y: 0 };
      this.jumpProgress = 0;

      // Input Buffer
      this.inputBufferDir = DIRECTIONS.NONE;
      this.inputBufferTime = 0;
    }

    // Verifica se duas direções são exatamente opostas (giro de 180°)
    isOpposite(dirA, dirB) {
      return (dirA.x === -dirB.x && dirA.x !== 0) || (dirA.y === -dirB.y && dirA.y !== 0);
    }

    setInput(dir) {
      // Inversão imediata de 180°: calcula precisamente o tile reverso para evitar engasgos (invisible wall)
      if (this.isMoving() && this.dir !== DIRECTIONS.NONE && this.isOpposite(this.dir, dir)) {
        this.targetX = this.targetX - this.dir.x * TILE_SIZE;
        this.targetY = this.targetY - this.dir.y * TILE_SIZE;
        this.dir = dir;
        this.angle = dir.angle;
        this.inputBufferDir = DIRECTIONS.NONE;
        this.inputBufferTime = 0;
        return;
      }

      this.inputBufferDir = dir;
      this.inputBufferTime = 150; // Buffer de 150ms
    }

    resetPosition(gridX, gridY) {
      this.gridX = gridX;
      this.gridY = gridY;
      this.x = gridX * TILE_SIZE;
      this.y = gridY * TILE_SIZE;
      this.targetX = this.x;
      this.targetY = this.y;
      this.dir = DIRECTIONS.NONE;
      this.isJumping = false;
      this.squishX = 1;
      this.squishY = 1;
      this.inputBufferDir = DIRECTIONS.NONE;
      this.inputBufferTime = 0;
    }

    isMoving() {
      return this.x !== this.targetX || this.y !== this.targetY;
    }

    jumpTo(targetGridX, targetGridY) {
      this.isJumping = true;
      this.jumpTimeLeft = this.jumpDuration;
      this.jumpStart = { x: this.x, y: this.y };
      
      this.gridX = targetGridX;
      this.gridY = targetGridY;
      this.targetX = this.gridX * TILE_SIZE;
      this.targetY = this.gridY * TILE_SIZE;
    }

    update(dt, game) {
      // 1. Cooldown de Input Buffer
      if (this.inputBufferTime > 0) {
        this.inputBufferTime -= dt;
        if (this.inputBufferTime <= 0) {
          this.inputBufferDir = DIRECTIONS.NONE;
        }
      }

      // 2. Logica do Salto
      if (this.isJumping) {
        this.jumpTimeLeft -= dt;
        this.jumpProgress = 1 - Math.max(0, this.jumpTimeLeft) / this.jumpDuration;

        this.x = this.jumpStart.x + (this.targetX - this.jumpStart.x) * this.jumpProgress;
        this.y = this.jumpStart.y + (this.targetY - this.jumpStart.y) * this.jumpProgress;

        const scaleEffect = Math.sin(this.jumpProgress * Math.PI) * 0.4;
        this.squishX = 1 + scaleEffect;
        this.squishY = 1 + scaleEffect;

        if (this.jumpTimeLeft <= 0) {
          this.x = this.targetX;
          this.y = this.targetY;
          this.isJumping = false;
          
          this.squishX = 1.25;
          this.squishY = 0.75;
          
          game.triggerScreenShake(3);
          game.spawnDust(this.x + TILE_SIZE/2, this.y + TILE_SIZE/2, 6, '#ffffff');
        }
        return;
      }

      this.squishX += (1 - this.squishX) * 0.15;
      this.squishY += (1 - this.squishY) * 0.15;

      // 3. Corner Snapping / Auto-Alinhamento ao mover
      if (this.isMoving()) {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const dist = Math.hypot(dx, dy);
        const step = this.speed * dt;

        this.walkTimer += dt * 0.015;
        this.squishX = 1 + Math.sin(this.walkTimer) * 0.05;
        this.squishY = 1 - Math.sin(this.walkTimer) * 0.05;

        // Snapping perpendicular com tolerância de 8px
        if (this.inputBufferDir !== DIRECTIONS.NONE && this.inputBufferDir !== this.dir) {
          const isPerpendicular = (this.dir.x !== 0 && this.inputBufferDir.y !== 0) || (this.dir.y !== 0 && this.inputBufferDir.x !== 0);
          if (isPerpendicular) {
            const closestGridX = Math.round(this.x / TILE_SIZE);
            const closestGridY = Math.round(this.y / TILE_SIZE);
            const distToCenter = Math.hypot(this.x - closestGridX * TILE_SIZE, this.y - closestGridY * TILE_SIZE);

            if (distToCenter <= 8) { // Snapping mais generoso (8px de tolerância)
              const checkX = closestGridX + this.inputBufferDir.x;
              const checkY = closestGridY + this.inputBufferDir.y;
              if (game.isWalkable(checkX, checkY)) {
                // Alinha eixo oposto perfeitamente ao grid
                this.x = closestGridX * TILE_SIZE;
                this.y = closestGridY * TILE_SIZE;
                this.gridX = closestGridX;
                this.gridY = closestGridY;

                // Transiciona para a nova direção
                this.dir = this.inputBufferDir;
                this.targetX = checkX * TILE_SIZE;
                this.targetY = checkY * TILE_SIZE;
                this.angle = this.dir.angle;

                this.inputBufferDir = DIRECTIONS.NONE;
                this.inputBufferTime = 0;
                return;
              }
            }
          }
        }

        if (step >= dist) {
          this.x = this.targetX;
          this.y = this.targetY;
          this.gridX = Math.round(this.x / TILE_SIZE);
          this.gridY = Math.round(this.y / TILE_SIZE);

          // Wrap portals (linha 7)
          if (this.gridY === 7) {
            if (this.gridX < 0) {
              this.gridX = GRID_WIDTH - 1;
              this.x = this.gridX * TILE_SIZE;
              this.targetX = this.x;
            } else if (this.gridX >= GRID_WIDTH) {
              this.gridX = 0;
              this.x = 0;
              this.targetX = 0;
            }
          }

          // Come pastilhas
          const currentTile = game.map[this.gridY][this.gridX];
          if (currentTile > 1) {
            game.map[this.gridY][this.gridX] = 0;
            game.addPoints(currentTile);
          }
        } else {
          this.x += (dx / dist) * step;
          this.y += (dy / dist) * step;
        }
      }

      // Escolhe proxima direcao quando parado
      if (!this.isMoving()) {
        if (this.inputBufferDir !== DIRECTIONS.NONE) {
          const checkX = this.gridX + this.inputBufferDir.x;
          const checkY = this.gridY + this.inputBufferDir.y;
          if (game.isWalkable(checkX, checkY)) {
            this.dir = this.inputBufferDir;
            this.targetX = checkX * TILE_SIZE;
            this.targetY = checkY * TILE_SIZE;
            this.angle = this.dir.angle;
            this.inputBufferDir = DIRECTIONS.NONE;
            this.inputBufferTime = 0;
            return;
          }
        }

        if (this.dir !== DIRECTIONS.NONE) {
          const checkX = this.gridX + this.dir.x;
          const checkY = this.gridY + this.dir.y;
          if (game.isWalkable(checkX, checkY)) {
            this.targetX = checkX * TILE_SIZE;
            this.targetY = checkY * TILE_SIZE;
          } else {
            this.dir = DIRECTIONS.NONE;
          }
        }
      }
    }

    draw(ctx) {
      // Sombra preta semitransparente elíptica logo abaixo
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(this.x + TILE_SIZE/2, this.y + TILE_SIZE/2 + 15, 14 * this.squishX, 5 * this.squishY, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.save();
      const centerX = this.x + TILE_SIZE / 2;
      const centerY = this.y + TILE_SIZE / 2;
      ctx.translate(centerX, centerY);
      ctx.scale(this.squishX, this.squishY);

      // Corpo 3D com Projeção Ortográfica / 2.5D
      const size = TILE_SIZE - 4;
      
      // 1. Topo do Cubo (Cinza mais claro #b0b0b0)
      ctx.fillStyle = '#b0b0b0';
      ctx.beginPath();
      ctx.moveTo(-size/2, -size/2 + 6);
      ctx.lineTo(-size/2 + 3, -size/2);
      ctx.lineTo(size/2 - 3, -size/2);
      ctx.lineTo(size/2, -size/2 + 6);
      ctx.closePath();
      ctx.fill();

      // 2. Face frontal (Cinza médio #949494)
      ctx.fillStyle = '#949494';
      ctx.beginPath();
      ctx.roundRect(-size/2, -size/2 + 6, size, size - 6, [0, 0, 6, 6]);
      ctx.fill();

      // 3. Contorno Branco Sólido de 3px
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-size/2 + 3, -size/2);
      ctx.lineTo(size/2 - 3, -size/2);
      ctx.lineTo(size/2, -size/2 + 6);
      ctx.lineTo(size/2, size/2);
      ctx.lineTo(-size/2, size/2);
      ctx.lineTo(-size/2, -size/2 + 6);
      ctx.closePath();
      ctx.stroke();

      // Divisor entre topo e face frontal
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-size/2, -size/2 + 6);
      ctx.lineTo(size/2, -size/2 + 6);
      ctx.stroke();

      // 4. Deslocamento dinâmico dos elementos da face (Olhar na direção)
      let faceX = 0;
      let faceY = 0;

      if (this.dir === DIRECTIONS.RIGHT) faceX = 3;
      if (this.dir === DIRECTIONS.LEFT) faceX = -3;
      if (this.dir === DIRECTIONS.UP) faceY = -2;
      if (this.dir === DIRECTIONS.DOWN) faceY = 2;

      ctx.translate(faceX, faceY + 4); // Desloca para o centro da face frontal

      // Sobrancelhas bravas diagonais em "V"
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-7, -4);
      ctx.lineTo(-2, -2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(7, -4);
      ctx.lineTo(2, -2);
      ctx.stroke();

      // Olhos brancos em formato cunha (\ /)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-7, -1);
      ctx.lineTo(-2.5, 1.2);
      ctx.lineTo(-7, 2.5);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(7, -1);
      ctx.lineTo(2.5, 1.2);
      ctx.lineTo(7, 2.5);
      ctx.closePath();
      ctx.fill();

      // Pupilas
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.arc(-4.5, 0.3, 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(4.5, 0.3, 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Narinas
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-0.8, 2.5, 0.6, 0.6);
      ctx.fillRect(0.8, 2.5, 0.6, 0.6);

      // Boca rosnando
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(-3.5, 4.5, 7, 2);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(-3.5, 4.5, 7, 2);

      ctx.restore();
    }
  }

  // ── Projétil Laser ──
  class Laser {
    constructor(x, y, dir) {
      this.x = x;
      this.y = y;
      this.dir = dir;
      this.speed = 0.45;
      this.active = true;
      this.toRemove = false;
    }

    update(dt, game) {
      const step = this.speed * dt;
      this.x += this.dir.x * step;
      this.y += this.dir.y * step;

      const gridX = Math.floor(this.x / TILE_SIZE);
      const gridY = Math.floor(this.y / TILE_SIZE);

      if (gridX < 0 || gridX >= GRID_WIDTH || gridY < 0 || gridY >= GRID_HEIGHT || game.map[gridY][gridX] === 1) {
        this.active = false;
        this.toRemove = true;
        game.spawnDust(this.x, this.y, 4, '#FFE600');
        return;
      }

      // Colisão com inimigos
      for (let i = 0; i < game.ghosts.length; i++) {
        const ghost = game.ghosts[i];
        if (!ghost || ghost.state === 'eaten' || ghost.state === 'respawning') continue;

        const dist = Math.hypot(this.x - (ghost.x + TILE_SIZE/2), this.y - (ghost.y + TILE_SIZE/2));
        if (dist < TILE_SIZE / 2) {
          this.active = false;
          this.toRemove = true;
          ghost.die(game);
          break;
        }
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.dir.angle);
      
      ctx.shadowColor = '#FFE600';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-10, -2.5, 20, 5);
      
      ctx.restore();
    }
  }

  // ── SpikeEnemy: Inimigos Temáticos de Naipes Espinhados ──
  class SpikeEnemy {
    constructor(gridX, gridY, type) {
      this.gridX = gridX;
      this.gridY = gridY;
      this.x = gridX * TILE_SIZE;
      this.y = gridY * TILE_SIZE;
      
      this.targetX = this.x;
      this.targetY = this.y;
      this.type = type; // 'SPADE' ou 'DIAMOND'

      this.speed = type === 'DIAMOND' ? 0.11 : 0.075;
      this.dir = DIRECTIONS.UP;
      
      this.state = 'normal'; // 'normal', 'dash', 'stunned', 'frightened', 'eaten', 'respawning'
      this.stunTimer = 0;
      this.respawnTimer = 0;
      this.dashCooldown = 0;
      
      this.toRemove = false;
    }

    resetPosition(gridX, gridY) {
      this.gridX = gridX;
      this.gridY = gridY;
      this.x = gridX * TILE_SIZE;
      this.y = gridY * TILE_SIZE;
      this.targetX = this.x;
      this.targetY = this.y;
      this.state = 'normal';
      this.dir = DIRECTIONS.UP;
      this.respawnTimer = 0;
      this.dashCooldown = 0;
    }

    isMoving() {
      return this.x !== this.targetX || this.y !== this.targetY;
    }

    stun() {
      this.state = 'stunned';
      this.stunTimer = 3500;
    }

    die(game) {
      this.state = 'respawning';
      this.respawnTimer = 2500; // Respawna em 2.5 segundos
      
      const deathX = this.x + TILE_SIZE/2;
      const deathY = this.y + TILE_SIZE/2;

      // Quebra em 4 estilhaços geométricos giratórios
      const color = this.type === 'SPADE' ? '#32323e' : '#FB8500';
      for (let i = 0; i < 4; i++) {
        game.particles.push(new ShardParticle(deathX, deathY, color));
      }

      // Recompensas imediatas
      game.chips += 200;
      game.mult += 2;
      
      const oldScore = game.score;
      game.score = game.chips * game.mult;
      const diff = game.score - oldScore;

      game.addFloatingText(
        deathX,
        deathY - 12,
        `QUEBRADO! +${Math.round(diff).toLocaleString()}`,
        '#FFE600',
        `+200 Fichas x2 Mult`
      );

      // Manda invisível pro centro
      this.x = 9 * TILE_SIZE;
      this.y = 7 * TILE_SIZE;
      this.targetX = this.x;
      this.targetY = this.y;
      this.gridX = 9;
      this.gridY = 7;

      game.triggerScreenShake(6);
      game.updateHUD();
      game.checkWinningCondition();
    }

    update(dt, game) {
      // 1. Controle de Respawn
      if (this.state === 'respawning') {
        this.respawnTimer -= dt;
        if (this.respawnTimer <= 0) {
          this.state = 'normal';
          this.resetPosition(9, 7);
        }
        return;
      }

      // Cooldown de investidas
      if (this.dashCooldown > 0) {
        this.dashCooldown -= dt;
      }

      // 2. Lógica de Atordoamento
      if (this.state === 'stunned') {
        this.stunTimer -= dt;
        if (this.stunTimer <= 0) {
          this.state = game.frightenedTimer > 0 ? 'frightened' : 'normal';
        }
        return;
      }

      // Calcula velocidade atual
      let currentSpeed = this.speed + (game.ante * 0.008);
      if (this.state === 'dash') {
        currentSpeed = this.speed * 2.8; // Investida super veloz
      } else if (this.state === 'frightened') {
        currentSpeed = this.speed * 0.6; // Lento em pânico
      } else if (this.state === 'eaten') {
        currentSpeed = this.speed * 2.5; // Correndo pro meio
      }

      if (this.isMoving()) {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const dist = Math.hypot(dx, dy);
        const step = currentSpeed * dt;

        if (step >= dist) {
          this.x = this.targetX;
          this.y = this.targetY;
          this.gridX = Math.round(this.x / TILE_SIZE);
          this.gridY = Math.round(this.y / TILE_SIZE);

          // Wrap portals (linha 7)
          if (this.gridY === 7) {
            if (this.gridX < 0) {
              this.gridX = GRID_WIDTH - 1;
              this.x = this.gridX * TILE_SIZE;
              this.targetX = this.x;
            } else if (this.gridX >= GRID_WIDTH) {
              this.gridX = 0;
              this.x = 0;
              this.targetX = 0;
            }
          }

          if (this.state === 'eaten' && this.gridX === 9 && this.gridY === 7) {
            this.state = 'normal';
          }
          
          if (this.state === 'dash') {
            // Se bater na quina de parede após a investida, cessa a investida e fica brevemente atordoado
            const checkX = this.gridX + this.dir.x;
            const checkY = this.gridY + this.dir.y;
            if (!game.isWalkable(checkX, checkY)) {
              this.state = 'normal';
              this.dashCooldown = 1500; // Impede outra investida imediatamente
            }
          }
        } else {
          this.x += (dx / dist) * step;
          this.y += (dy / dist) * step;
        }
      }

      if (!this.isMoving()) {
        // Se comido, volta pra jaula central (9, 7)
        if (this.state === 'eaten') {
          const path = this.findPath(this.gridX, this.gridY, 9, 7, game);
          if (path.length > 0) {
            this.dir = path[0];
            this.targetX = (this.gridX + this.dir.x) * TILE_SIZE;
            this.targetY = (this.gridY + this.dir.y) * TILE_SIZE;
          }
          return;
        }

        // ♠ Espada: Ativa investida em linha reta se avistar jogador
        if (this.type === 'SPADE' && this.state === 'normal' && this.dashCooldown <= 0) {
          const seenDir = this.checkLineOfSight(game.player, game);
          if (seenDir && game.isWalkable(this.gridX + seenDir.x, this.gridY + seenDir.y)) {
            this.state = 'dash';
            this.dir = seenDir;
            this.targetX = (this.gridX + this.dir.x) * TILE_SIZE;
            this.targetY = (this.gridY + this.dir.y) * TILE_SIZE;
            game.triggerScreenShake(3);
            return;
          }
        }

        // Escolhe caminhos no cruzamento
        const validDirs = [];
        for (const [key, d] of Object.entries(DIRECTIONS)) {
          if (d === DIRECTIONS.NONE) continue;
          if (d.x === -this.dir.x && d.y === -this.dir.y) continue; // Não volta imediatamente para trás

          if (game.isWalkable(this.gridX + d.x, this.gridY + d.y)) {
            validDirs.push(d);
          }
        }

        if (validDirs.length === 0) {
          const oppositeDir = { x: -this.dir.x, y: -this.dir.y };
          if (game.isWalkable(this.gridX + oppositeDir.x, this.gridY + oppositeDir.y)) {
            this.dir = Object.values(DIRECTIONS).find(d => d.x === oppositeDir.x && d.y === oppositeDir.y) || this.dir;
          }
        } else {
          let chosenDir = null;

          // ♦ Ouro: Persegue e tenta flanquear usando cálculo de distância no grid
          if (this.type === 'DIAMOND' && this.state === 'normal' && game.player) {
            let minDistance = Infinity;
            validDirs.forEach(d => {
              const nextC = this.gridX + d.x;
              const nextR = this.gridY + d.y;
              const dist = Math.hypot(nextC - game.player.gridX, nextR - game.player.gridY);
              if (dist < minDistance) {
                minDistance = dist;
                chosenDir = d;
              }
            });
          }

          // Caso normal / aleatório
          if (!chosenDir) {
            chosenDir = validDirs[Math.floor(Math.random() * validDirs.length)];
          }

          this.dir = chosenDir;
        }

        this.targetX = (this.gridX + this.dir.x) * TILE_SIZE;
        this.targetY = (this.gridY + this.dir.y) * TILE_SIZE;
      }
    }

    checkLineOfSight(player, game) {
      if (!player) return null;
      if (this.gridY === player.gridY) {
        const step = player.gridX > this.gridX ? 1 : -1;
        let clear = true;
        for (let c = this.gridX + step; c !== player.gridX; c += step) {
          if (!game.isWalkable(c, this.gridY)) {
            clear = false;
            break;
          }
        }
        if (clear) return step === 1 ? DIRECTIONS.RIGHT : DIRECTIONS.LEFT;
      }
      if (this.gridX === player.gridX) {
        const step = player.gridY > this.gridY ? 1 : -1;
        let clear = true;
        for (let r = this.gridY + step; r !== player.gridY; r += step) {
          if (!game.isWalkable(this.gridX, r)) {
            clear = false;
            break;
          }
        }
        if (clear) return step === 1 ? DIRECTIONS.DOWN : DIRECTIONS.UP;
      }
      return null;
    }

    findPath(startCol, startRow, targetCol, targetRow, game) {
      const queue = [[startCol, startRow, []]];
      const visited = new Set();
      visited.add(`${startCol},${startRow}`);

      while (queue.length > 0) {
        const [c, r, path] = queue.shift();

        if (c === targetCol && r === targetRow) {
          return path;
        }

        for (const [key, d] of Object.entries(DIRECTIONS)) {
          if (d === DIRECTIONS.NONE) continue;
          const nextCol = c + d.x;
          const nextRow = r + d.y;
          const keyStr = `${nextCol},${nextRow}`;

          if (game.isWalkable(nextCol, nextRow) && !visited.has(keyStr)) {
            visited.add(keyStr);
            queue.push([nextCol, nextRow, [...path, d]]);
          }
        }
      }
      return [];
    }

    draw(ctx) {
      if (this.state === 'respawning') return; // Oculta durante respawn

      ctx.save();
      const cx = this.x + TILE_SIZE / 2;
      const cy = this.y + TILE_SIZE / 2;
      ctx.translate(cx, cy);

      // Alvos atordoados/pânico
      if (this.state === 'eaten') {
        // Apenas Olhos
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-5, -3, 5, 0, Math.PI * 2);
        ctx.arc(5, -3, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0000ff';
        ctx.beginPath();
        ctx.arc(-5 + this.dir.x * 2, -3 + this.dir.y * 2, 2, 0, Math.PI * 2);
        ctx.arc(5 + this.dir.x * 2, -3 + this.dir.y * 2, 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.state === 'frightened') {
        // Losango de pânico (Branco piscando)
        const isFlash = Math.floor(performance.now() / 180) % 2 === 0;
        ctx.fillStyle = isFlash ? '#1d1d8f' : '#ffffff';
        ctx.beginPath();
        ctx.moveTo(0, -14);
        ctx.lineTo(12, 0);
        ctx.lineTo(0, 14);
        ctx.lineTo(-12, 0);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#ef5350';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (this.state === 'stunned') {
        // Losango congelado (Ciano)
        ctx.fillStyle = '#00838f';
        ctx.beginPath();
        ctx.moveTo(0, -14);
        ctx.lineTo(12, 0);
        ctx.lineTo(0, 14);
        ctx.lineTo(-12, 0);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#00E5FF';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        // Desenhos normais de naipes
        if (this.type === 'SPADE') {
          // ♠ INVESTIDA GLOW
          if (this.state === 'dash') {
            ctx.shadowColor = '#FF2E2E';
            ctx.shadowBlur = 12;
            // Brilho vermelho de investida
            ctx.fillStyle = 'rgba(255, 46, 46, 0.15)';
            ctx.beginPath();
            ctx.arc(0, 0, 19, 0, Math.PI * 2);
            ctx.fill();
          }

          // ♠ Desenho de Espada
          ctx.beginPath();
          ctx.moveTo(0, -14);
          ctx.bezierCurveTo(8, -14, 14, -5, 14, 1);
          ctx.bezierCurveTo(14, 7, 7, 10, 0, 7);
          ctx.bezierCurveTo(-7, 10, -14, 7, -14, 1);
          ctx.bezierCurveTo(-14, -5, -8, -14, 0, -14);
          ctx.closePath();
          
          ctx.fillStyle = '#202124';
          ctx.fill();
          ctx.strokeStyle = this.state === 'dash' ? '#FF2E2E' : '#ffffff';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Pedestal da espada
          ctx.beginPath();
          ctx.moveTo(0, 3);
          ctx.quadraticCurveTo(5, 11, 7, 13);
          ctx.lineTo(-7, 13);
          ctx.quadraticCurveTo(-5, 11, 0, 3);
          ctx.closePath();
          ctx.fillStyle = '#202124';
          ctx.fill();
          ctx.stroke();

          // Ponta metálica amarela/brilhante
          ctx.fillStyle = '#FFE600';
          ctx.beginPath();
          ctx.moveTo(0, -14);
          ctx.lineTo(4, -8);
          ctx.lineTo(-4, -8);
          ctx.closePath();
          ctx.fill();

          ctx.shadowBlur = 0;
        } else if (this.type === 'DIAMOND') {
          // ♦ Lâmina de Ouros — Losango geométrico chanfrado, sem esfera pulsante

          // Corpo externo: cinza-metálico escuro
          ctx.beginPath();
          ctx.moveTo(0, -15);
          ctx.lineTo(13, 0);
          ctx.lineTo(0, 15);
          ctx.lineTo(-13, 0);
          ctx.closePath();
          ctx.fillStyle = '#1a1a24';
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Facetas internas anguladas — linhas finas douradas cruzadas
          ctx.strokeStyle = '#FFE600';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(0, -10);
          ctx.lineTo(8, 0);
          ctx.lineTo(0, 10);
          ctx.lineTo(-8, 0);
          ctx.closePath();
          ctx.stroke();

          // Cruz central geométrica dourada
          ctx.beginPath();
          ctx.moveTo(0, -10);
          ctx.lineTo(0, 10);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(-8, 0);
          ctx.lineTo(8, 0);
          ctx.stroke();
        }
      }

      ctx.restore();
    }
  }

  // ── Fragmento de Destruição ShardParticle ──
  class ShardParticle {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.size = Math.random() * 4 + 5;
      this.angle = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.25;
      this.vx = (Math.random() - 0.5) * 6;
      this.vy = (Math.random() - 0.5) * 6;
      this.life = 600;
      this.maxLife = 600;
      this.active = true;
    }

    update(dt) {
      this.life -= dt;
      this.x += this.vx * (dt / 16);
      this.y += this.vy * (dt / 16);
      this.angle += this.rotationSpeed * (dt / 16);
      if (this.life <= 0) {
        this.active = false;
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.globalAlpha = Math.max(0, this.life / this.maxLife);
      ctx.fillStyle = this.color;
      
      // Desenha estilhaço triangular
      ctx.beginPath();
      ctx.moveTo(0, -this.size);
      ctx.lineTo(this.size, this.size);
      ctx.lineTo(-this.size, this.size);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }
  }

  // ── Representação das Partículas ──
  class Particle {
    constructor(x, y, color, size, vx, vy, life) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.size = size;
      this.vx = vx;
      this.vy = vy;
      this.life = life;
      this.maxLife = life;
      this.active = true;
      this.toRemove = false;
    }

    update(dt) {
      this.life -= dt;
      this.x += this.vx * (dt / 16);
      this.y += this.vy * (dt / 16);
      this.vy += 0.05 * (dt / 16);

      if (this.life <= 0) {
        this.active = false;
        this.toRemove = true;
      }
    }

    draw(ctx) {
      ctx.save();
      const alpha = Math.max(0, this.life / this.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
      ctx.restore();
    }
  }

  // Instancia a classe principal
  window.addEventListener('DOMContentLoaded', () => {
    window.munchGame = new Game();
  });
})();
