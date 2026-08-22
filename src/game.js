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
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,3,1,1,2,1,1,1,2,1,1,2,1,1,1,2,1,1,3,1],
    [1,2,1,1,2,1,1,1,2,1,1,2,1,1,1,2,1,1,2,1],
    [1,4,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,4,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ];

  // Pool de cartas/relíquias roguelike
  const CARD_POOL = [
    {
      id: "relic_jump_module",
      name: "MOLA HIDRÁULICA",
      category: "AÇÃO & SOBREVIVÊNCIA",
      rarity: "Comum",
      desc: "+1 Carga Máxima de Pulo. Permite saltar paredes e inimigos.",
      icon: "🦘",
      apply: (game) => {
        game.vaultMaxCharges += 1;
        game.vaultCharges = game.vaultMaxCharges;
      },
      revert: (game) => {
        game.vaultMaxCharges = Math.max(0, game.vaultMaxCharges - 1);
        game.vaultCharges = Math.min(game.vaultCharges, game.vaultMaxCharges);
      }
    },
    {
      id: "relic_blaster_core",
      name: "CANHÃO DE PLASMA",
      category: "AÇÃO & SOBREVIVÊNCIA",
      rarity: "Comum",
      desc: "+1 Carga Máxima de Disparo. Atordoa inimigos em linha reta.",
      icon: "🔫",
      apply: (game) => {
        game.blasterMaxCharges += 1;
        game.blasterCharges = game.blasterMaxCharges;
      },
      revert: (game) => {
        game.blasterMaxCharges = Math.max(0, game.blasterMaxCharges - 1);
        game.blasterCharges = Math.min(game.blasterCharges, game.blasterMaxCharges);
      }
    },
    {
      id: "relic_overclock",
      name: "OVERCLOCK DE SISTEMA",
      category: "AÇÃO & SOBREVIVÊNCIA",
      rarity: "Incomum",
      desc: "Reduz o tempo de recarga de todas as habilidades em 30%.",
      icon: "⚡",
      apply: (game) => {
        game.cooldownMultiplier *= 0.7;
      },
      revert: (game) => {
        game.cooldownMultiplier /= 0.7;
      }
    },
    {
      id: "relic_backup_battery",
      name: "BATERIA RESERVA",
      category: "AÇÃO & SOBREVIVÊNCIA",
      rarity: "Comum",
      desc: "+1 Vida Máxima e recupera todas as vidas perdidas.",
      icon: "❤️",
      apply: (game) => {
        game.maxLives = (game.maxLives || 2) + 1;
        game.lives = game.maxLives;
      },
      revert: (game) => {
        game.maxLives = Math.max(1, game.maxLives - 1);
        game.lives = Math.min(game.lives, game.maxLives);
      }
    },
    {
      id: "relic_steel_coating",
      name: "REVESTIMENTO DE AÇO",
      category: "MULTIPLICADORES & PONTUAÇÃO",
      rarity: "Comum",
      desc: "Pastilhas normais concedem +20 Fichas base.",
      icon: "🛡️",
      apply: (game) => {
        game.pelletChipBonus += 20;
      },
      revert: (game) => {
        game.pelletChipBonus -= 20;
      }
    },
    {
      id: "relic_sharp_drift",
      name: "DRIFT PERFEITO",
      category: "MULTIPLICADORES & PONTUAÇÃO",
      rarity: "Incomum",
      desc: "Mudar de direção na quina exata concede +2 Mult na rodada.",
      icon: "🌀",
      apply: (game) => {},
      revert: (game) => {}
    },
    {
      id: "relic_bounty_hunter",
      name: "CAÇADOR DE NAIPES",
      category: "MULTIPLICADORES & PONTUAÇÃO",
      rarity: "Incomum",
      desc: "Destruir um inimigo com Blaster concede +5 Mult permanente no round.",
      icon: "🔥",
      apply: (game) => {
        game.killMultBonus += 5;
      },
      revert: (game) => {
        game.killMultBonus -= 5;
      }
    },
    {
      id: "relic_gold_alchemist",
      name: "ALQUIMIA DOURADA",
      category: "MULTIPLICADORES & PONTUAÇÃO",
      rarity: "Rara",
      desc: "Moedas especiais concedem x1.75 Mult ao serem consumidas.",
      icon: "🪙",
      apply: (game) => {
        game.goldenMultFactor *= 1.75;
      },
      revert: (game) => {
        game.goldenMultFactor /= 1.75;
      }
    },
    {
      id: "relic_slime_puddle",
      name: "LODO VISCOSO",
      category: "QUEBRA DE REGRAS",
      rarity: "Incomum",
      desc: "Pular deixa poças de lodo que reduzem velocidade inimiga em 50% por 4s.",
      icon: "🦠",
      apply: (game) => {
        game.hasStickyJump = true;
      },
      revert: (game) => {
        game.hasStickyJump = game.activeRelics.some(r => r.id === 'relic_slime_puddle');
      }
    },
    {
      id: "relic_railgun",
      name: "TIRO PERFURANTE",
      category: "QUEBRA DE REGRAS",
      rarity: "Rara",
      desc: "O laser do Blaster perfura inimigos e limpa linhas até bater em paredes.",
      icon: "☄️",
      apply: (game) => {},
      revert: (game) => {}
    },
    {
      id: "relic_magnetic_pull",
      name: "VÁCUO MAGNÉTICO",
      category: "QUEBRA DE REGRAS",
      rarity: "Rara",
      desc: "Atrai e devora pastilhas a até 1.5 blocos de distância do Slime.",
      icon: "🧲",
      apply: (game) => {},
      revert: (game) => {}
    }
  ];

  // Classe para gerenciar poças pegajosas deixadas por pulos (Rastro Viscoso)
  class StickyPool {
    constructor(gridX, gridY, duration = 5000) {
      this.gridX = gridX;
      this.gridY = gridY;
      this.timeLeft = duration;
      this.x = gridX * TILE_SIZE;
      this.y = gridY * TILE_SIZE;
    }
    update(dt) {
      this.timeLeft -= dt;
    }
    draw(ctx) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 229, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(this.x + TILE_SIZE/2, this.y + TILE_SIZE/2, TILE_SIZE/2.5, 0, Math.PI*2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.7)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }
  }

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
      this.hudBlindBadge = document.getElementById('hudBlindBadge');
      this.hudRelicsCount = document.getElementById('relicsCount');
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
      this.maxLives = 2; // Vida máxima inicial da run
      this.lives = 2; // Começa com 2 corações
      this.gold = 0;
      this.phase = 1;

      this.score = 0;
      this.chips = 0;
      this.mult = 1;
      this.targetScore = 1500;
      this.remainingPellets = 0;
      this.phaseClearTimer = 0;

      // Habilidades bloqueadas inicialmente
      this.vaultMaxCharges = 0;
      this.vaultCharges = 0;
      this.vaultCooldown = 0;
      this.vaultMaxCooldown = 7000; // Recarga estendida de 7.0s

      this.blasterMaxCharges = 0;
      this.blasterCharges = 0;
      this.blasterCooldown = 0;
      this.blasterMaxCooldown = 10000; // Recarga estendida de 10.0s

      // Estado do inventário de relíquias e modificadores roguelike
      this.activeRelics = [];
      this.pelletChipBonus = 0;
      this.killMultBonus = 0;
      this.goldenMultFactor = 1.0;
      this.hasStickyJump = false;
      this.cooldownMultiplier = 1.0;
      this.stickyPools = [];
      this.pelletsEatenForVault = 0;

      this.map = [];
      this.particles = [];
      this.projectiles = [];
      this.floatingTexts = [];

      this.player = null;
      this.ghosts = [];

      this.frightenedTimer = 0;
      this.debugMode = false; // Inativo por padrão, so abre caso aperte F3
      this.overchargeShockwave = null;

      this.init();
    }

    init() {
      // Eventos teclado
      window.addEventListener('keydown', (e) => {
        if (!this.player) return;

        // F3 alterna o Painel de Depuração Visual na tela
        if (e.code === 'F3') {
          e.preventDefault();
          this.debugMode = !this.debugMode;
          return;
        }

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
      this.btnNextBlind.addEventListener('click', () => {
        this.modalWin.classList.remove('visible');
        this.showDraftShopModal();
      });
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

      // Cria jogador na posicao (9, 8) - corredor central livre
      this.player = new Player(9, 8);

      // Cria inimigos conforme a fase (dificuldade progressiva)
      this.ghosts = this.spawnEnemiesForPhase(this.phase);

      this.projectiles = [];
      this.particles = [];
      this.floatingTexts = [];
      this.frightenedTimer = 0;
      this.phaseClearTimer = 0;

      this.targetScore = this.getTargetScore(this.ante, this.blind);
      this.score = 0;
      this.chips = 0;
      this.mult = 1;

       this.vaultCharges = this.vaultMaxCharges;
      this.vaultCooldown = 0;
      this.blasterCharges = this.blasterMaxCharges;
      this.blasterCooldown = 0;
      
      this.stickyPools = [];
      this.pelletsEatenForVault = 0;

      this.updateHUD();
      this.updateRelicsTray();
    }

    getTargetScore(ante, blind) {
      if (ante === 1) {
        if (blind === 1) return 2000;
        if (blind === 2) return 4000;
        if (blind === 3) return 8000;
      }
      if (ante === 2) {
        if (blind === 1) return 15000;
        if (blind === 2) return 25000;
        if (blind === 3) return 45000;
      }
      // Antes superiores (ante >= 3)
      const base = blind === 1 ? 15000 : (blind === 2 ? 25000 : 45000);
      return Math.round(base * Math.pow(2.2, ante - 2));
    }

    checkWinCondition() {
      if (this.gameState === GAME_STATES.PLAYING && this.score >= this.targetScore) {
        this.gameState = GAME_STATES.PHASE_CLEAR;
        this.phaseClearTimer = 1500; // Congela 1.5s com efeitos especiais
        this.triggerScreenShake(12);

        // Dá ouro pelo término da blind
        this.gold += this.ante * 5;

        // Explosão de confetes e partículas douradas
        for (let i = 0; i < 40; i++) {
          this.particles.push(new Particle(
            this.canvas.width / 2,
            this.canvas.height / 2,
            Math.random() > 0.5 ? '#FFE600' : `hsl(${Math.random() * 360}, 100%, 60%)`, // Dourado + cores vibrantes
            Math.random() * 4 + 3,
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 8,
            1200
          ));
        }
      }
    }

    triggerBoardOvercharge() {
      this.overchargeShockwave = {
        x: this.canvas.width / 2,
        y: this.canvas.height / 2,
        radius: 0,
        maxRadius: Math.hypot(this.canvas.width, this.canvas.height),
        speed: 0.8, // pixels por ms
        active: true
      };

      this.triggerScreenShake(10);

      this.remainingPellets = 0;
      for (let r = 0; r < GRID_HEIGHT; r++) {
        for (let c = 0; c < GRID_WIDTH; c++) {
          if (BASE_MAP[r][c] >= 2) {
            this.map[r][c] = 5; // Reaparece como Pastilha Energizada
            this.remainingPellets++;
          }
        }
      }

      // Spawna Moeda Especial Dourada (tipo 3) em (9, 8) Y=8, X=9
      if (this.isWalkable(9, 8)) {
        this.map[8][9] = 3;
        this.remainingPellets++;
      }

      this.totalPellets = this.remainingPellets;

      this.addFloatingText(
        this.canvas.width / 2,
        this.canvas.height / 2 - 20,
        "RECARGA DO LABIRINTO!",
        "#FF00FF"
      );
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
        // Rastro Viscoso (Poças de Pulo)
        if (this.hasStickyJump) {
          this.stickyPools.push(new StickyPool(this.player.gridX, this.player.gridY));
          this.stickyPools.push(new StickyPool(targetGridX, targetGridY));
        }

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

      const isRailgun = this.activeRelics.some(r => r.id === 'relic_railgun');
      this.projectiles.push(new Laser(startX, startY, shootDir, isRailgun));
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

      let blindName = 'SMALL BLIND';
      if (this.blind === 2) blindName = 'BIG BLIND';
      else if (this.blind === 3) blindName = 'BOSS BLIND';

      // Painel esquerdo: badge + meta + score
      if (this.hudBlindBadge) {
        this.hudBlindBadge.innerText = `ANTE ${this.ante} // ${blindName}`;
      }
      this.hudBlindTarget.innerText = this.targetScore.toLocaleString();
      
      const pct = Math.min(100, (this.score / this.targetScore) * 100);
      this.hudProgressBar.style.width = pct + '%';
      
      if (pct >= 100) {
        this.hudProgressBar.classList.add('gold-pulsing');
      } else {
        this.hudProgressBar.classList.remove('gold-pulsing');
      }

      this.hudCurrentScore.innerText = Math.round(this.score).toLocaleString();

      this.hudChipsValue.innerText = Math.round(this.chips).toLocaleString();
      this.hudMultValueEl.innerText = Math.round(this.mult);

      this.hudRoundIndicator.innerText = `ANTE ${this.ante} // ${blindName}`;
      this.hudLives.innerText = '\u2764\uFE0F'.repeat(Math.max(0, this.lives));
      this.hudGold.innerText = this.gold;

      // Relics count label
      if (this.hudRelicsCount) {
        this.hudRelicsCount.innerText = `(${this.activeRelics.length}/5)`;
      }

      // Vault (Pulo)
      if (this.vaultMaxCharges === 0) {
        document.querySelector('#skillVault .skill-key').innerText = '[ESPACO] BLOQUEADO';
        this.vaultChargesEl.innerText = 'BLOQUEADO';
        this.vaultCooldownFill.style.width = '0%';
        this.skillVault.classList.add('blocked');
        this.skillVault.classList.remove('ready');
      } else {
        document.querySelector('#skillVault .skill-key').innerText = '[ESPACO] PULO';
        this.vaultChargesEl.innerText = `${this.vaultCharges}/${this.vaultMaxCharges}`;
        this.skillVault.classList.remove('blocked');
        
        if (this.vaultCharges < this.vaultMaxCharges) {
          const currentMaxCld = this.vaultMaxCooldown * (this.cooldownMultiplier || 1.0);
          const cldPct = 100 - (this.vaultCooldown / currentMaxCld) * 100;
          this.vaultCooldownFill.style.width = Math.max(0, Math.min(100, cldPct)) + '%';
          this.skillVault.classList.remove('ready');
        } else {
          this.vaultCooldownFill.style.width = '100%';
          this.skillVault.classList.add('ready');
        }
      }

      // Blaster (Tiro)
      if (this.blasterMaxCharges === 0) {
        document.querySelector('#skillBlaster .skill-key').innerText = '[F] BLOQUEADO';
        this.blasterChargesEl.innerText = 'BLOQUEADO';
        this.blasterCooldownFill.style.width = '0%';
        this.skillBlaster.classList.add('blocked');
        this.skillBlaster.classList.remove('ready');
      } else {
        document.querySelector('#skillBlaster .skill-key').innerText = '[F] TIRO';
        this.blasterChargesEl.innerText = `${this.blasterCharges}/${this.blasterMaxCharges}`;
        this.skillBlaster.classList.remove('blocked');

        if (this.blasterCharges < this.blasterMaxCharges) {
          const currentMaxCld = this.blasterMaxCooldown * (this.cooldownMultiplier || 1.0);
          const cldPct = 100 - (this.blasterCooldown / currentMaxCld) * 100;
          this.blasterCooldownFill.style.width = Math.max(0, Math.min(100, cldPct)) + '%';
          this.skillBlaster.classList.remove('ready');
        } else {
          this.blasterCooldownFill.style.width = '100%';
          this.skillBlaster.classList.add('ready');
        }
      }
    }

    updateRelicsTray() {
      const tray = document.getElementById('relicsTray');
      if (!tray) return;
      tray.innerHTML = '';

      for (let i = 0; i < 5; i++) {
        const slot = document.createElement('div');
        if (i < this.activeRelics.length) {
          const card = this.activeRelics[i];
          const rarityClass = card.rarity === 'Rara' ? 'rara' : card.rarity.toLowerCase();
          slot.className = `relic-badge occupied ${rarityClass}`;
          slot.innerHTML = `
            ${card.icon}
            <div class="relic-tooltip">
              <div class="tooltip-rarity ${rarityClass}">${card.rarity.toUpperCase()}</div>
              <div class="tooltip-name">${card.name}</div>
              <div class="tooltip-category">${card.category}</div>
              <div class="tooltip-desc">${card.desc}</div>
            </div>
          `;
        } else {
          slot.className = 'relic-badge empty';
          slot.innerHTML = '';
        }
        tray.appendChild(slot);
      }

      // Update relics count label
      if (this.hudRelicsCount) {
        this.hudRelicsCount.innerText = `(${this.activeRelics.length}/5)`;
      }
    }

    resetRunState() {
      this.activeRelics = [];
      this.pelletChipBonus = 0;
      this.killMultBonus = 0;
      this.goldenMultFactor = 1.0;
      this.hasStickyJump = false;
      this.cooldownMultiplier = 1.0;
      
      this.vaultMaxCharges = 0;
      this.blasterMaxCharges = 0;
      this.vaultCharges = 0;
      this.blasterCharges = 0;
      
      this.maxLives = 2;
      this.lives = 2;
      this.gold = 0;
      this.phase = 1;
      this.ante = 1;
      this.blind = 1;
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

      if (this.vaultMaxCharges > 0 && this.vaultCharges < this.vaultMaxCharges) {
        this.pelletsEatenForVault = (this.pelletsEatenForVault || 0) + 1;
        if (this.pelletsEatenForVault >= 30) {
          this.vaultCharges++;
          this.vaultCooldown = 0;
          this.pelletsEatenForVault = 0;
        }
      }

      if (pelletType === 2) {
        earnedChips = 10 + (this.pelletChipBonus || 0);
        scoreColor = '#ffffff';
        tag = `+${earnedChips} FICHAS`;
        this.chips += earnedChips;
        this.scorePop(this.chipsBox);
      } else if (pelletType === 3) {
        earnedChips = 50;
        earnedMult = 1;
        scoreColor = '#FFE600';
        tag = '+50 FICHAS // +1 MULT';
        this.chips += earnedChips;
        this.mult += earnedMult;
        if (this.goldenMultFactor && this.goldenMultFactor > 1.0) {
          const oldMult = this.mult;
          this.mult = Math.round(this.mult * this.goldenMultFactor);
          const multDiff = this.mult - oldMult;
          tag = `+50 FICHAS // x${this.goldenMultFactor} MULT OURO (+${multDiff} Mult!)`;
        }
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
      } else if (pelletType === 5) {
        earnedChips = (10 + (this.pelletChipBonus || 0)) * 2;
        scoreColor = '#FF00FF';
        tag = `+${earnedChips} FICHAS ENERGIZADAS!`;
        this.chips += earnedChips;
        this.scorePop(this.chipsBox);
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
      this.checkWinCondition();

      if (this.remainingPellets <= 0 && this.gameState === GAME_STATES.PLAYING) {
        if (this.score < this.targetScore) {
          this.triggerBoardOvercharge();
        }
      }
    }

    getWeightedRandomCard(excludeList = []) {
      const candidates = CARD_POOL.filter(card => {
        if (excludeList.some(c => c.id === card.id)) return false;
        
        // Exclude if it's already in activeRelics AND is of unique effect
        const isUnique = ['relic_overclock', 'relic_slime_puddle', 'relic_railgun', 'relic_magnetic_pull', 'relic_gold_alchemist'].includes(card.id);
        if (isUnique && this.activeRelics.some(r => r.id === card.id)) return false;
        
        return true;
      });

      if (candidates.length === 0) return null;

      const comuns = candidates.filter(c => c.rarity === 'Comum');
      const incomuns = candidates.filter(c => c.rarity === 'Incomum');
      const raras = candidates.filter(c => c.rarity === 'Rara');

      const r = Math.random();
      let chosenRarity = 'Comum';
      if (r < 0.10) {
        chosenRarity = 'Rara';
      } else if (r < 0.40) {
        chosenRarity = 'Incomum';
      } else {
        chosenRarity = 'Comum';
      }

      let selectedGroup = [];
      if (chosenRarity === 'Rara') {
        selectedGroup = raras.length > 0 ? raras : (incomuns.length > 0 ? incomuns : comuns);
      } else if (chosenRarity === 'Incomum') {
        selectedGroup = incomuns.length > 0 ? incomuns : (comuns.length > 0 ? comuns : raras);
      } else {
        selectedGroup = comuns.length > 0 ? comuns : (incomuns.length > 0 ? incomuns : raras);
      }

      if (selectedGroup.length === 0) return null;
      return selectedGroup[Math.floor(Math.random() * selectedGroup.length)];
    }

    spawnCardParticles(cardElement) {
      const rect = cardElement.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2 + window.scrollX;
      const centerY = rect.top + rect.height / 2 + window.scrollY;
      
      for (let i = 0; i < 20; i++) {
        const p = document.createElement('div');
        p.style.position = 'fixed';
        p.style.left = centerX + 'px';
        p.style.top = centerY + 'px';
        p.style.width = '6px';
        p.style.height = '6px';
        p.style.backgroundColor = Math.random() > 0.5 ? '#FFE600' : '#FFB703';
        p.style.borderRadius = '50%';
        p.style.zIndex = '10000';
        p.style.pointerEvents = 'none';
        p.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        document.body.appendChild(p);
        
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 6;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        
        requestAnimationFrame(() => {
          p.style.transform = `translate(${vx * 35}px, ${vy * 35}px) scale(0)`;
          p.style.opacity = '0';
        });
        
        setTimeout(() => p.remove(), 500);
      }
    }

    animateCardToTray(cardElement, targetSlotElement, callback) {
      const cardRect = cardElement.getBoundingClientRect();
      const trayRect = targetSlotElement.getBoundingClientRect();
      
      const clone = document.createElement('div');
      clone.className = cardElement.className;
      clone.innerHTML = cardElement.innerHTML;
      
      clone.style.animation = 'none';
      clone.style.position = 'fixed';
      clone.style.top = (cardRect.top + window.scrollY) + 'px';
      clone.style.left = (cardRect.left + window.scrollX) + 'px';
      clone.style.width = cardRect.width + 'px';
      clone.style.height = cardRect.height + 'px';
      clone.style.margin = '0';
      clone.style.zIndex = '9999';
      clone.style.transformOrigin = 'top left';
      clone.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
      
      document.body.appendChild(clone);
      
      requestAnimationFrame(() => {
        clone.style.top = (trayRect.top + window.scrollY) + 'px';
        clone.style.left = (trayRect.left + window.scrollX) + 'px';
        clone.style.width = '32px';
        clone.style.height = '44px';
        clone.style.opacity = '0.3';
        clone.style.transform = 'scale(0.2)';
      });
      
      setTimeout(() => {
        clone.remove();
        callback();
      }, 600);
    }

    showReplacementUI(newCard, selectedEl) {
      const container = document.getElementById('draftCardsContainer');
      container.innerHTML = '';
      container.closest('.draft-modal-content').classList.add('replacement-mode');
      
      document.querySelector('#modalDraftShop .modal-subtitle').innerText = 'BANDEJA CHEIA // ESCOLHA UMA RELIQUIA PARA SUBSTITUIR';

      this.activeRelics.forEach((relic, idx) => {
        const cardEl = document.createElement('div');
        const rarityClass = relic.rarity === 'Rara' ? 'rara' : relic.rarity.toLowerCase();
        cardEl.className = `relic-card active-relic-option ${rarityClass}`;
        cardEl.innerHTML = `
          <div class="relic-card-rarity">${relic.rarity}</div>
          <div class="relic-card-icon">${relic.icon}</div>
          <div class="relic-card-name">${relic.name}</div>
          <div class="relic-card-desc">${relic.desc}</div>
          <div class="btn-replace-action">SUBSTITUIR</div>
        `;
        
        cardEl.addEventListener('click', () => {
          this.spawnCardParticles(selectedEl || cardEl);
          
          relic.revert(this);
          
          this.activeRelics.splice(idx, 1);
          this.activeRelics.push(newCard);
          newCard.apply(this);
          
          const traySlot = document.getElementById('relicsTray').children[idx] || document.getElementById('relicsTray');
          this.animateCardToTray(selectedEl || cardEl, traySlot, () => {
            this.modalWin.classList.remove('visible');
            document.getElementById('modalDraftShop').classList.remove('visible');
            this.triggerScreenShake(8);
            this.updateRelicsTray();
            this.nextRound();
          });
        });
        
        container.appendChild(cardEl);
      });
      
      const divider = document.createElement('div');
      divider.className = 'replacement-divider';
      divider.innerText = '- - - OU - - -';
      container.appendChild(divider);

      const skipBtn = document.createElement('button');
      skipBtn.className = 'btn-discard-new';
      skipBtn.innerText = 'RECUSAR E DESCARTAR NOVA RELIQUIA';
      skipBtn.addEventListener('click', () => {
        document.getElementById('modalDraftShop').classList.remove('visible');
        this.nextRound();
      });
      
      container.appendChild(skipBtn);
    }

    formatCardDesc(desc) {
      return desc
        .replace(/(\+?\d+\s*Fichas)/g, '<span class="highlight-chips">$1</span>')
        .replace(/(\+?\d+\s*Mult)/g, '<span class="highlight-mult">$1</span>')
        .replace(/(x\d+\.?\d*\s*Mult)/g, '<span class="highlight-xmult">$1</span>')
        .replace(/(Pulo)/g, '<span class="highlight-jump">$1</span>')
        .replace(/(Disparo)/g, '<span class="highlight-shoot">$1</span>');
    }

    // Mostra a Loja de Draft de Relíquias
    showDraftShopModal() {
      this.gameState = GAME_STATES.WIN_MODAL;
      const container = document.getElementById('draftCardsContainer');
      container.innerHTML = '';
      container.closest('.draft-modal-content').classList.remove('replacement-mode');
      
      document.querySelector('#modalDraftShop .modal-subtitle').innerText = 'ESCOLHA UMA RELIQUIA PARA A SUA RUN';

      // Sorteia 2 cartas ponderadas e distintas
      const card1 = this.getWeightedRandomCard([]);
      const card2 = this.getWeightedRandomCard(card1 ? [card1] : []);

      const selectedCards = [];
      if (card1) selectedCards.push(card1);
      if (card2) selectedCards.push(card2);

      selectedCards.forEach(card => {
        const cardEl = document.createElement('div');
        const rarityClass = card.rarity === 'Rara' ? 'rara' : card.rarity.toLowerCase();
        cardEl.className = `relic-card ${rarityClass}`;

        const formattedDesc = this.formatCardDesc(card.desc);

        cardEl.innerHTML = `
          <div class="relic-card-rarity">${card.rarity}</div>
          <div class="relic-card-icon">${card.icon}</div>
          <div class="relic-card-name">${card.name}</div>
          <div class="relic-card-desc">${formattedDesc}</div>
        `;

        // 3D dynamic tilt and holographic sheen on mousemove
        cardEl.addEventListener('mousemove', (e) => {
          const rect = cardEl.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateY = ((x - centerX) / centerX) * 15;
          const rotateX = ((centerY - y) / centerY) * 15;
          cardEl.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
          
          const pctX = (x / rect.width) * 100;
          const pctY = (y / rect.height) * 100;
          cardEl.style.setProperty('--sheen-x', `${pctX}%`);
          cardEl.style.setProperty('--sheen-y', `${pctY}%`);
        });

        cardEl.addEventListener('mouseleave', () => {
          cardEl.style.transform = 'perspective(600px) rotateX(0) rotateY(0) scale(1)';
          cardEl.style.setProperty('--sheen-x', '50%');
          cardEl.style.setProperty('--sheen-y', '50%');
        });

        cardEl.addEventListener('click', () => {
          this.selectDraftCard(card, cardEl);
        });

        container.appendChild(cardEl);
      });

      document.getElementById('modalDraftShop').classList.add('visible');
    }

    selectDraftCard(card, cardEl) {
      if (this.activeRelics.length >= 5) {
        this.showReplacementUI(card, cardEl);
        return;
      }

      this.spawnCardParticles(cardEl);

      this.activeRelics.push(card);
      card.apply(this);

      // Encontra o slot correspondente para a animação de voar
      const slotIndex = this.activeRelics.length - 1;
      const targetSlot = document.getElementById('relicsTray').children[slotIndex] || document.getElementById('relicsTray');

      this.animateCardToTray(cardEl, targetSlot, () => {
        document.getElementById('modalDraftShop').classList.remove('visible');
        this.triggerScreenShake(8);
        this.updateRelicsTray();
        this.nextRound();
      });
    }

    nextRound() {
      this.phase++;
      this.blind++;
      if (this.blind > 3) {
        this.blind = 1;
        this.ante++;
      }

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
      this.resetRunState();
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
        this.player.resetPosition(9, 8);
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
      this.checkWinCondition();
    }

    update(dt) {
      // Atualiza onda de choque se ativa
      if (this.overchargeShockwave && this.overchargeShockwave.active) {
        this.overchargeShockwave.radius += this.overchargeShockwave.speed * dt;
        if (this.overchargeShockwave.radius >= this.overchargeShockwave.maxRadius) {
          this.overchargeShockwave.active = false;
          this.overchargeShockwave = null;
        }
      }

      // Congelamento breve após limpar o mapa
      if (this.gameState === GAME_STATES.PHASE_CLEAR) {
        this.phaseClearTimer -= dt;
        // Partículas e textos continuam animando durante o freeze
        this.particles.forEach(p => { if (p) p.update(dt); });
        this.particles = this.particles.filter(p => p && p.active && !p.toRemove);
        if (this.phaseClearTimer <= 0) {
          this.gameState = GAME_STATES.WIN_MODAL;
          document.getElementById('winModalScore').innerText = Math.round(this.score).toLocaleString();
          document.getElementById('winModalTarget').innerText = Math.round(this.targetScore).toLocaleString();
          document.getElementById('winModalGold').innerText = this.gold.toString();
          this.modalWin.classList.add('visible');
        }
        return;
      }

      if (this.gameState !== GAME_STATES.PLAYING) return;

      // 1. Cooldown de pulo
      if (this.vaultMaxCharges > 0 && this.vaultCharges < this.vaultMaxCharges) {
        this.vaultCooldown += dt;
        const currentMaxCld = this.vaultMaxCooldown * (this.cooldownMultiplier || 1.0);
        if (this.vaultCooldown >= currentMaxCld) {
          this.vaultCharges++;
          this.vaultCooldown = 0;
        }
      }

      // 2. Cooldown de disparo
      if (this.blasterMaxCharges > 0 && this.blasterCharges < this.blasterMaxCharges) {
        this.blasterCooldown += dt;
        const currentMaxCld = this.blasterMaxCooldown * (this.cooldownMultiplier || 1.0);
        if (this.blasterCooldown >= currentMaxCld) {
          this.blasterCharges++;
          this.blasterCooldown = 0;
        }
      }

      // Atualização das poças viscosas (Rastro Viscoso)
      if (this.stickyPools) {
        this.stickyPools.forEach(p => p.update(dt));
        this.stickyPools = this.stickyPools.filter(p => p.timeLeft > 0);
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
            } else if (tile === 5) {
              // Pastilha Energizada: Losango Neon Roxo/Rosa Pulsante (#FF00FF)
              const pulse = 1 + Math.sin(performance.now() * 0.012) * 0.2;
              const radius = 6 * pulse;
              
              this.ctx.save();
              this.ctx.fillStyle = '#FF00FF';
              this.ctx.shadowColor = '#FF00FF';
              this.ctx.shadowBlur = 8 * pulse;
              
              this.ctx.beginPath();
              this.ctx.moveTo(cx, cy - radius);
              this.ctx.lineTo(cx + radius, cy);
              this.ctx.lineTo(cx, cy + radius);
              this.ctx.lineTo(cx - radius, cy);
              this.ctx.closePath();
              this.ctx.fill();
              
              this.ctx.restore();
            }
          }
        }
      }

      // Rastro Viscoso (Poças de Pulo)
      if (this.stickyPools) {
        this.stickyPools.forEach(p => p.draw(this.ctx));
      }

      // Onda de Choque do Overcharge
      if (this.overchargeShockwave && this.overchargeShockwave.active) {
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(255, 255, 200, 0.5)';
        this.ctx.lineWidth = 20;
        this.ctx.shadowColor = '#FFE600';
        this.ctx.shadowBlur = 12;
        this.ctx.beginPath();
        this.ctx.arc(this.overchargeShockwave.x, this.overchargeShockwave.y, this.overchargeShockwave.radius, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.restore();
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

      // Painel de Depuração Visual
      if (this.debugMode && this.player) {
        this.drawDebugOverlay();
      }
    }

    drawDebugOverlay() {
      const p = this.player;
      if (!p) return;

      this.ctx.save();
      this.ctx.fillStyle = 'rgba(8, 8, 12, 0.88)';
      this.ctx.fillRect(8, 8, 360, 136);
      this.ctx.strokeStyle = '#00E5FF';
      this.ctx.lineWidth = 1.5;
      this.ctx.strokeRect(8, 8, 360, 136);

      this.ctx.font = 'bold 10px monospace';
      this.ctx.fillStyle = '#00E5FF';
      this.ctx.fillText(`[MUNCH DEPURADOR VISUAL] (F3: Alternar)`, 16, 24);

      const targetCenterX = (p.gridX + p.dir.x) * TILE_SIZE;
      const targetCenterY = (p.gridY + p.dir.y) * TILE_SIZE;
      this.ctx.fillText(`Grade: (${p.gridX}, ${p.gridY}) | Pixels: (${Math.round(p.x)}, ${Math.round(p.y)})`, 16, 42);
      this.ctx.fillText(`Alvo: (${Math.round(targetCenterX)}, ${Math.round(targetCenterY)}) | Movendo: ${p.isMoving() ? 'SIM' : 'NÃO'}`, 16, 58);

      const dirStr = Object.keys(DIRECTIONS).find(k => DIRECTIONS[k] === p.dir) || 'NONE';
      const bufStr = Object.keys(DIRECTIONS).find(k => DIRECTIONS[k] === p.inputBufferDir) || 'NONE';
      this.ctx.fillText(`Direção: ${dirStr} | Buffer: ${bufStr} (${Math.round(p.inputBufferTime)}ms)`, 16, 74);

      const checkX = p.gridX + p.dir.x;
      const checkY = p.gridY + p.dir.y;
      const canWalk = this.isWalkable(checkX, checkY);
      const tileVal = (checkY >= 0 && checkY < GRID_HEIGHT && checkX >= 0 && checkX < GRID_WIDTH) ? this.map[checkY][checkX] : 'FORA';

      this.ctx.fillStyle = canWalk ? '#00FF66' : '#FF3366';
      this.ctx.fillText(`Frente (${checkX}, ${checkY}): ${canWalk ? 'LIVRE' : 'PAREDE'} (Tipo: ${tileVal})`, 16, 90);

      this.ctx.fillStyle = '#FFE600';
      this.ctx.fillText(`Última parada: ${p.lastStopReason || 'Nenhuma'}`, 16, 110);

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

  // ── Player (Slime 2.5D Dinâmico - Engine Contínua Arcade) ──
  class Player {
    constructor(gridX, gridY) {
      this.gridX = gridX;
      this.gridY = gridY;
      
      // Coordenadas em pixel (alinhadas ao canto superior esquerdo do tile)
      this.x = gridX * TILE_SIZE;
      this.y = gridY * TILE_SIZE;

      this.speed = 0.14; // Pixels por milissegundo (velocidade confortável e precisa)
      this.dir = DIRECTIONS.RIGHT;
      
      // Squash & Stretch
      this.squishX = 1;
      this.squishY = 1;
      this.angle = 0;
      this.walkTimer = 0;

      // Pulo (Vault)
      this.isJumping = false;
      this.jumpDuration = 250;
      this.jumpTimeLeft = 0;
      this.jumpStart = { x: 0, y: 0 };
      this.jumpTarget = { x: 0, y: 0 };
      this.jumpProgress = 0;

      // Input Buffer
      this.inputBufferDir = DIRECTIONS.NONE;
      this.inputBufferTime = 0;
      this.lastStopReason = '';
    }

    checkEatPellet(game) {
      if (!game || !game.map) return;
      
      const hasMagnet = game.activeRelics.some(r => r.id === 'relic_magnetic_pull');
      const searchRadius = hasMagnet ? 1 : 0;

      for (let dy = -searchRadius; dy <= searchRadius; dy++) {
        for (let dx = -searchRadius; dx <= searchRadius; dx++) {
          const checkX = this.gridX + dx;
          const checkY = this.gridY + dy;

          if (checkY >= 0 && checkY < GRID_HEIGHT && checkX >= 0 && checkX < GRID_WIDTH) {
            const currentTile = game.map[checkY][checkX];
            if (currentTile > 1) {
              const distance = Math.hypot(dx, dy);
              if (distance <= 1.5) {
                game.map[checkY][checkX] = 0;
                game.addPoints(currentTile);

                if (distance > 0) {
                  const startX = checkX * TILE_SIZE + TILE_SIZE/2;
                  const startY = checkY * TILE_SIZE + TILE_SIZE/2;
                  const playerX = this.x + TILE_SIZE/2;
                  const playerY = this.y + TILE_SIZE/2;

                  for (let i = 0; i < 3; i++) {
                    game.particles.push(new Particle(
                      startX,
                      startY,
                      '#00E5FF',
                      2,
                      (playerX - startX) * 0.01 + (Math.random() - 0.5),
                      (playerY - startY) * 0.01 + (Math.random() - 0.5),
                      200
                    ));
                  }
                }
              }
            }
          }
        }
      }
    }

    // Verifica se duas direções são exatamente opostas (giro de 180°)
    isOpposite(dirA, dirB) {
      return (dirA.x === -dirB.x && dirA.x !== 0) || (dirA.y === -dirB.y && dirA.y !== 0);
    }

    setInput(dir) {
      // Inversão Imediata (180°): altera a direção instantaneamente no mesmo frame
      if (this.dir !== DIRECTIONS.NONE && this.isOpposite(this.dir, dir)) {
        this.dir = dir;
        this.angle = dir.angle;
        this.inputBufferDir = DIRECTIONS.NONE;
        this.inputBufferTime = 0;
        return;
      }

      this.inputBufferDir = dir;
      this.inputBufferTime = 300; // Janela de buffer de 300ms
    }

    resetPosition(gridX, gridY) {
      this.gridX = gridX;
      this.gridY = gridY;
      this.x = gridX * TILE_SIZE;
      this.y = gridY * TILE_SIZE;
      this.dir = DIRECTIONS.NONE;
      this.isJumping = false;
      this.squishX = 1;
      this.squishY = 1;
      this.inputBufferDir = DIRECTIONS.NONE;
      this.inputBufferTime = 0;
      this.lastStopReason = '';
    }

    isMoving() {
      return this.dir !== DIRECTIONS.NONE && !this.isJumping;
    }

    jumpTo(targetGridX, targetGridY) {
      this.isJumping = true;
      this.jumpTimeLeft = this.jumpDuration;
      this.jumpStart = { x: this.x, y: this.y };
      this.jumpTarget = { x: targetGridX * TILE_SIZE, y: targetGridY * TILE_SIZE };
      
      this.gridX = targetGridX;
      this.gridY = targetGridY;
    }

    update(dt, game) {
      // 1. Contagem do tempo limite do Input Buffer
      if (this.inputBufferTime > 0) {
        this.inputBufferTime -= dt;
        if (this.inputBufferTime <= 0) {
          this.inputBufferDir = DIRECTIONS.NONE;
        }
      }

      // 2. Lógica do Salto (Pulo / Vault)
      if (this.isJumping) {
        this.jumpTimeLeft -= dt;
        this.jumpProgress = 1 - Math.max(0, this.jumpTimeLeft) / this.jumpDuration;

        this.x = this.jumpStart.x + (this.jumpTarget.x - this.jumpStart.x) * this.jumpProgress;
        this.y = this.jumpStart.y + (this.jumpTarget.y - this.jumpStart.y) * this.jumpProgress;

        this.gridX = Math.floor((this.x + TILE_SIZE / 2) / TILE_SIZE);
        this.gridY = Math.floor((this.y + TILE_SIZE / 2) / TILE_SIZE);

        const scaleEffect = Math.sin(this.jumpProgress * Math.PI) * 0.4;
        this.squishX = 1 + scaleEffect;
        this.squishY = 1 + scaleEffect;

        if (this.jumpTimeLeft <= 0) {
          this.x = this.jumpTarget.x;
          this.y = this.jumpTarget.y;
          this.gridX = Math.floor((this.x + TILE_SIZE / 2) / TILE_SIZE);
          this.gridY = Math.floor((this.y + TILE_SIZE / 2) / TILE_SIZE);
          this.isJumping = false;
          
          this.squishX = 1.25;
          this.squishY = 0.75;
          
          this.checkEatPellet(game);
          game.triggerScreenShake(3);
          game.spawnDust(this.x + TILE_SIZE/2, this.y + TILE_SIZE/2, 6, '#ffffff');
        }
        return;
      }

      this.squishX += (1 - this.squishX) * 0.15;
      this.squishY += (1 - this.squishY) * 0.15;

      // Se o Slime estiver parado, tenta iniciar movimento a partir do buffer
      if (this.dir === DIRECTIONS.NONE) {
        if (this.inputBufferDir !== DIRECTIONS.NONE) {
          const nextGridX = this.gridX + this.inputBufferDir.x;
          const nextGridY = this.gridY + this.inputBufferDir.y;
          if (game.isWalkable(nextGridX, nextGridY)) {
            this.dir = this.inputBufferDir;
            this.angle = this.dir.angle;
            this.inputBufferDir = DIRECTIONS.NONE;
            this.inputBufferTime = 0;
          } else {
            this.inputBufferDir = DIRECTIONS.NONE;
            this.inputBufferTime = 0;
          }
        }
        if (this.dir === DIRECTIONS.NONE) return; // Permanece parado no centro do tile
      }

      // 3. Movimentação Contínua baseada em Velocidade (Auto-Walk Arcade Engine)
      let step = this.speed * dt;

      // Animação de deformação (gelatina) enquanto anda
      this.walkTimer += dt * 0.015;
      this.squishX = 1 + Math.sin(this.walkTimer) * 0.05;
      this.squishY = 1 - Math.sin(this.walkTimer) * 0.05;

      while (step > 0 && this.dir !== DIRECTIONS.NONE) {
        // Centro do próximo tile para onde estamos nos movendo
        const targetCenter = {
          x: (this.gridX + this.dir.x) * TILE_SIZE,
          y: (this.gridY + this.dir.y) * TILE_SIZE
        };

        // Distância até o próximo centro de tile
        const distToTargetCenter = Math.hypot(targetCenter.x - this.x, targetCenter.y - this.y);

        if (step < distToTargetCenter) {
          // Snap de curva instantânea "na hora": se acabou de passar do centro do tile (dist <= 14px) e apertou a curva
          if (this.inputBufferDir !== DIRECTIONS.NONE && this.inputBufferDir !== this.dir) {
            const isPerpendicular = (this.dir.x !== 0 && this.inputBufferDir.y !== 0) || (this.dir.y !== 0 && this.inputBufferDir.x !== 0);
            if (isPerpendicular) {
              const tileCenter = { x: this.gridX * TILE_SIZE, y: this.gridY * TILE_SIZE };
              const distToCenter = Math.hypot(tileCenter.x - this.x, tileCenter.y - this.y);

              if (distToCenter <= 14) {
                const bufGridX = this.gridX + this.inputBufferDir.x;
                const bufGridY = this.gridY + this.inputBufferDir.y;
                if (game.isWalkable(bufGridX, bufGridY)) {
                  this.x = tileCenter.x;
                  this.y = tileCenter.y;
                  this.dir = this.inputBufferDir;
                  this.angle = this.dir.angle;
                  this.inputBufferDir = DIRECTIONS.NONE;
                  this.inputBufferTime = 0;
                  this.checkEatPellet(game);

                  if (game.activeRelics.some(r => r.id === 'relic_sharp_drift')) {
                    game.mult += 2;
                    game.updateHUD();
                    game.addFloatingText(this.x + TILE_SIZE/2, this.y, '+2 MULT', '#FF00FF', 'DRIFT PERFEITO!');
                    game.spawnDust(this.x + TILE_SIZE/2, this.y + TILE_SIZE/2, 4, '#FF00FF');
                  }
                  continue;
                }
              }
            }
          }

          // Deslocamento normal dentro do segmento atual
          this.x += this.dir.x * step;
          this.y += this.dir.y * step;
          step = 0;
        } else {
          // Atingiu ou ultrapassou o centro do próximo tile!
          step -= distToTargetCenter;
          this.x = targetCenter.x;
          this.y = targetCenter.y;
          
          this.gridX = Math.floor((this.x + TILE_SIZE / 2) / TILE_SIZE);
          this.gridY = Math.floor((this.y + TILE_SIZE / 2) / TILE_SIZE);

          // Wrap portals (linha 7)
          if (this.gridY === 7) {
            if (this.gridX < 0) {
              this.gridX = GRID_WIDTH - 1;
              this.x = this.gridX * TILE_SIZE;
            } else if (this.gridX >= GRID_WIDTH) {
              this.gridX = 0;
              this.x = 0;
            }
          }

          // Devora a pastilha no centro do novo tile
          this.checkEatPellet(game);

          // ── MÁQUINA DE DECISÃO NO CENTRO DO TILE (INTERSECTION ENGINE) ──
          
          // Prioridade 1: Mudar para a nova direção buffered se a casa adjacente estiver LIVRE
          let directionChanged = false;
          if (this.inputBufferDir !== DIRECTIONS.NONE) {
            const bufGridX = this.gridX + this.inputBufferDir.x;
            const bufGridY = this.gridY + this.inputBufferDir.y;
            
            if (game.isWalkable(bufGridX, bufGridY)) {
              this.dir = this.inputBufferDir;
              this.angle = this.dir.angle;
              this.inputBufferDir = DIRECTIONS.NONE;
              this.inputBufferTime = 0;
              directionChanged = true;

              if (game.activeRelics.some(r => r.id === 'relic_sharp_drift')) {
                game.mult += 2;
                game.updateHUD();
                game.addFloatingText(this.x + TILE_SIZE/2, this.y, '+2 MULT', '#FF00FF', 'DRIFT PERFEITO!');
                game.spawnDust(this.x + TILE_SIZE/2, this.y + TILE_SIZE/2, 4, '#FF00FF');
              }
            } else {
              // Se o buffer aponta para uma parede no cruzamento, descarta o comando sem parar o slime
              this.inputBufferDir = DIRECTIONS.NONE;
              this.inputBufferTime = 0;
            }
          }

          // Prioridade 2 e 3: Manter rota ou parar se houver parede na frente
          if (!directionChanged) {
            const nextGridX = this.gridX + this.dir.x;
            const nextGridY = this.gridY + this.dir.y;

            if (!game.isWalkable(nextGridX, nextGridY)) {
              // Prioridade 3: Parede na frente -> Trava no centro exato do tile e zera a velocidade
              this.x = this.gridX * TILE_SIZE;
              this.y = this.gridY * TILE_SIZE;
              
              const tileVal = (nextGridY >= 0 && nextGridY < GRID_HEIGHT && nextGridX >= 0 && nextGridX < GRID_WIDTH) ? game.map[nextGridY][nextGridX] : 'FORA';
              this.lastStopReason = `Parede na frente (${nextGridX}, ${nextGridY}) [Tipo: ${tileVal}]`;
              console.log(`[MUNCH DEBUG] Slime colidiu com parede na grade (${this.gridX}, ${this.gridY}). ${this.lastStopReason}`);
              
              this.dir = DIRECTIONS.NONE;
              step = 0;
            }
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
    constructor(x, y, dir, isRailgun = false) {
      this.x = x;
      this.y = y;
      this.dir = dir;
      this.speed = 0.45;
      this.active = true;
      this.toRemove = false;
      this.isRailgun = isRailgun;
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
          ghost.die(game);
          if (!this.isRailgun) {
            this.active = false;
            this.toRemove = true;
            break;
          }
        }
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.dir.angle);
      
      if (this.isRailgun) {
        ctx.shadowColor = '#FF00FF'; // Brilho neon rosa para railgun
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-15, -4, 30, 8); // Laser mais espesso
      } else {
        ctx.shadowColor = '#FFE600';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-10, -2.5, 20, 5);
      }
      
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
      const extraMult = 2 + (game.killMultBonus || 0);
      game.mult += extraMult;
      
      const oldScore = game.score;
      game.score = game.chips * game.mult;
      const diff = game.score - oldScore;

      game.addFloatingText(
        deathX,
        deathY - 12,
        `QUEBRADO! +${Math.round(diff).toLocaleString()}`,
        '#FFE600',
        `+200 Fichas +${extraMult} Mult`
      );

      // Manda invisível pro centro
      this.x = 8 * TILE_SIZE;
      this.y = 7 * TILE_SIZE;
      this.targetX = this.x;
      this.targetY = this.y;
      this.gridX = 8;
      this.gridY = 7;

      game.triggerScreenShake(6);
      game.updateHUD();
      game.checkWinCondition();
    }

    update(dt, game) {
      // 1. Controle de Respawn
      if (this.state === 'respawning') {
        this.respawnTimer -= dt;
        if (this.respawnTimer <= 0) {
          this.state = 'normal';
          this.resetPosition(8, 7);
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

      // Boss Blind de Ante Ímpar: Inimigos +15% mais velozes
      if (game.blind === 3 && game.ante % 2 === 1) {
        currentSpeed *= 1.15;
      }

      // Checa se está sobre uma poça viscosa (Rastro Viscoso)
      let isSteppingOnSticky = false;
      if (game.stickyPools) {
        for (const pool of game.stickyPools) {
          if (pool.gridX === this.gridX && pool.gridY === this.gridY) {
            isSteppingOnSticky = true;
            break;
          }
        }
      }
      if (isSteppingOnSticky) {
        currentSpeed *= 0.5; // Frenagem de 50%
      }

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

          if (this.state === 'eaten' && this.gridX === 8 && this.gridY === 7) {
            this.state = 'normal';
          }
          
          if (this.state === 'dash') {
            // Se bater na quina de parede após a investida, cessa a investida e fica brevemente atordoado
            const checkX = this.gridX + this.dir.x;
            const checkY = this.gridY + this.dir.y;
            if (!game.isWalkable(checkX, checkY)) {
              this.state = 'normal';
              // Boss Blind de Ante Par: investe com o dobro de frequência (metade do cooldown)
              const baseCooldown = (game.blind === 3 && game.ante % 2 === 0) ? 750 : 1500;
              this.dashCooldown = baseCooldown; // Impede outra investida imediatamente
            }
          }
        } else {
          this.x += (dx / dist) * step;
          this.y += (dy / dist) * step;
        }
      }

      if (!this.isMoving()) {
        // Se comido, volta pro corredor central (8, 7)
        if (this.state === 'eaten') {
          const path = this.findPath(this.gridX, this.gridY, 8, 7, game);
          if (path.length > 0) {
            this.dir = path[0];
            this.targetX = (this.gridX + this.dir.x) * TILE_SIZE;
            this.targetY = (this.gridY + this.dir.y) * TILE_SIZE;
          } else {
            this.resetPosition(8, 7);
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

          // Facetas internas anguladas em tom metálico sutil
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, -9);
          ctx.lineTo(7, 0);
          ctx.lineTo(0, 9);
          ctx.lineTo(-7, 0);
          ctx.closePath();
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
