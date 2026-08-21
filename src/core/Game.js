import { CANVAS_SIZE, DIRECTIONS, GAME_STATES, TILE_SIZE, COLOR_PALETTE } from '../config/constants.js';
import { getBlindScore, getStageCoinReward } from '../config/balance.js';
import { Player } from '../entities/Player.js';
import { Enemy, ENEMY_TYPES, ENEMY_STATES } from '../entities/Enemy.js';
import { Input } from './Input.js';
import { ScoreEngine } from './ScoreEngine.js';
import { ParticleSystem } from '../systems/ParticleSystem.js';
import { MapManager } from '../systems/MapManager.js';
import { ShopSystem } from '../systems/ShopSystem.js';
import { UIManager } from '../ui/UIManager.js';
import { LoadingScreen } from '../ui/LoadingScreen.js';

export class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    
    // Tamanho do canvas
    this.canvas.width = CANVAS_SIZE;
    this.canvas.height = CANVAS_SIZE;
    
    // Estado e pontuação
    this.state = GAME_STATES.MENU;
    this.stage = 1;
    this.score = 0;
    this.stageScore = 0;
    this.gold = 0;
    this.lives = 3;
    this.jokers = []; // Coringas equipados (max 5)
    
    // Core references
    this.player = null;
    this.enemies = [];
    this.projectiles = [];
    this.floatingTexts = [];
    
    // Inicializa subsistemas
    this.input = new Input();
    this.scoreEngine = new ScoreEngine();
    this.particleSystem = new ParticleSystem();
    this.mapManager = new MapManager();
    this.shopSystem = new ShopSystem();
    this.uiManager = new UIManager();
    this.loadingScreen = new LoadingScreen();
    
    this.lastTime = 0;
    
    this.init();
  }

  init() {
    // Callbacks da interface
    this.uiManager.init({
      onStartGame: () => this.startGame(),
      onRestartGame: () => this.startGame(),
      onBuyShopItem: (index) => this.buyShopItem(index),
      onRerollShop: () => this.rerollShop(),
      onExitShop: () => this.exitShop()
    });

    // Estado inicial
    this.state = GAME_STATES.MENU;
    this.uiManager.switchState(this.state);
    
    requestAnimationFrame((timestamp) => this.loop(timestamp));
  }

  startGame() {
    this.stage = 1;
    this.gold = 0;
    this.lives = 3;
    this.jokers = [];
    
    this.scoreEngine.resetGameScore();
    this.particleSystem.clear();
    this.floatingTexts = [];
    
    this.state = GAME_STATES.LOADING;
    this.uiManager.switchState(this.state);
    
    // Transição de loading pra Fase 1
    this.loadingScreen.startTransition(1500, () => {
      this.startStage();
    }, true);
  }

  startStage() {
    this.state = GAME_STATES.PLAYING;
    this.uiManager.switchState(this.state);
    
    this.stageScore = 0;
    this.scoreEngine.resetStageScore();
    this.projectiles = [];
    this.floatingTexts = [];
    this.particleSystem.clear();
    
    // Carrega o mapa
    this.mapManager.loadLevel();
    
    // Spawna ou reseta o player na posição inicial (10, 16)
    if (!this.player) {
      this.player = new Player(10, 16);
    } else {
      this.player.reset(10, 16);
    }
    this.player.lives = this.lives;

    // Fantasmas iniciais
    this.enemies = [
      new Enemy(9, 8, ENEMY_TYPES.BLINKY),  // Vermelho
      new Enemy(11, 8, ENEMY_TYPES.PINKY),  // Rosa
      new Enemy(9, 10, ENEMY_TYPES.INKY),   // Ciano
      new Enemy(11, 10, ENEMY_TYPES.CLYDE)  // Laranja
    ];
    
    this.updateHUD();
  }

  nextStage() {
    this.stage++;
    this.state = GAME_STATES.LOADING;
    this.uiManager.switchState(this.state);
    
    this.loadingScreen.startTransition(1500, () => {
      this.startStage();
    }, true);
  }

  // --- Loja ---

  buyShopItem(index) {
    const playerState = {
      gold: this.gold,
      jokers: this.jokers
    };

    const result = this.shopSystem.buyItem(index, playerState);
    
    if (result.success) {
      this.gold = playerState.gold;
      this.jokers = playerState.jokers;
      
      this.particleSystem.triggerScreenShake(2);
      this.addFloatingText(
        CANVAS_SIZE / 2, 
        CANVAS_SIZE / 2 - 40, 
        `${result.item.name} Adquirido!`, 
        COLOR_PALETTE.GOLD_PELLET, 
        1000
      );
      
      // Atualiza tela da loja
      this.uiManager.renderShop(this.shopSystem.activeOffers, this.gold, this.shopSystem.rerollCost);
      this.updateHUD();
    } else {
      // Flutua mensagem de erro se falhar
      this.addFloatingText(
        CANVAS_SIZE / 2, 
        CANVAS_SIZE / 2 - 40, 
        result.reason, 
        '#ef4444', 
        800
      );
    }
  }

  rerollShop() {
    const playerState = {
      gold: this.gold
    };

    const success = this.shopSystem.reroll(playerState);
    if (success) {
      this.gold = playerState.gold;
      this.uiManager.renderShop(this.shopSystem.activeOffers, this.gold, this.shopSystem.rerollCost);
      this.updateHUD();
    } else {
      this.addFloatingText(
        CANVAS_SIZE / 2, 
        CANVAS_SIZE / 2 - 40, 
        'Sem Ouro Suficiente', 
        '#ef4444', 
        800
      );
    }
  }

  exitShop() {
    this.nextStage();
  }

  // --- Loop Principal ---

  loop(timestamp) {
    if (!this.lastTime) this.lastTime = timestamp;
    const dt = timestamp - this.lastTime;
    this.lastTime = timestamp;
    
    // Limita o dt máximo pra não travar o jogo ao mudar de aba
    const cappedDt = Math.min(dt, 100);

    this.update(cappedDt);
    this.draw();

    requestAnimationFrame((ts) => this.loop(ts));
  }

  update(dt) {
    if (this.state !== GAME_STATES.PLAYING) {
      // Fora de jogo, só atualiza partículas e texto (loja e menus)
      this.particleSystem.update(dt);
      this.updateFloatingTexts(dt);
      return;
    }

    // Habilidades e comandos
    if (this.input.isPressed('VAULT')) {
      const activeStats = this.player.getModifiedStats(this.jokers);
      this.player.triggerVault(this.mapManager, this.particleSystem, activeStats);
    }

    if (this.input.isPressed('BLASTER')) {
      const activeStats = this.player.getModifiedStats(this.jokers);
      this.player.triggerBlaster(
        this.particleSystem, 
        activeStats, 
        (p) => this.projectiles.push(p)
      );
    }

    // Buffer de direção
    const nextDirCode = this.input.getMovementDirection();
    if (nextDirCode) {
      this.player.nextDir = DIRECTIONS[nextDirCode];
    } else {
      this.player.nextDir = DIRECTIONS.NONE;
    }

    // Combo e timers
    this.scoreEngine.update(dt);

    // Itens e orbes do mapa
    this.mapManager.update(dt);

    // Atualiza jogador
    const activeModifiers = this.jokers;
    const activeStats = this.player.getModifiedStats(activeModifiers);
    
    this.player.update(dt, this.mapManager, this.particleSystem, activeModifiers, activeStats);
    this.mapManager.wrapCoordinates(this.player);

    // Atualiza tiros ativos
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.update(dt, this.mapManager);
      
      if (!proj.active) {
        this.projectiles.splice(i, 1);
      }
    }

    // IA dos fantasmas
    const blinkyGhost = this.enemies.find(e => e.type === ENEMY_TYPES.BLINKY);
    
    this.enemies.forEach(enemy => {
      enemy.update(dt, this.mapManager, this.player, blinkyGhost, this.particleSystem);
      this.mapManager.wrapCoordinates(enemy);
    });

    // Colisões e combate

    // Tiros vs Fantasmas
    this.projectiles.forEach(proj => {
      if (!proj.active) return;

      this.enemies.forEach(enemy => {
        if (enemy.state === ENEMY_STATES.EATEN) return;
        
        // Colisão por círculo
        const dist = Math.sqrt(
          Math.pow((proj.x - (enemy.x + TILE_SIZE/2)), 2) + 
          Math.pow((proj.y - (enemy.y + TILE_SIZE/2)), 2)
        );

        if (dist < TILE_SIZE / 2) {
          proj.active = false;
          
          // Aplica o atordoamento (stun)
          const baseStun = 3000; // 3s base
          const duration = baseStun * (activeStats.stunDurationMultiplier || 1);
          enemy.stun(duration);
          
          this.particleSystem.spawnImpactSparks(proj.x, proj.y, COLOR_PALETTE.WALL_NEON);
          this.addFloatingText(enemy.x + TILE_SIZE/2, enemy.y, 'STUNNED!', '#3b82f6', 800);
        }
      });
    });

    // Jogador vs Orbes
    const pelletEaten = this.mapManager.checkPelletCollision(this.player.x, this.player.y);
    if (pelletEaten) {
      this.particleSystem.spawnPelletSparks(
        pelletEaten.x, 
        pelletEaten.y, 
        COLOR_PALETTE[`${pelletEaten.type}_PELLET`] || COLOR_PALETTE.PELLET
      );
      
      // Conta os fantasmas que ainda estão em jogo (não devorados)
      const activeEnemiesCount = this.enemies.filter(e => e.state !== ENEMY_STATES.EATEN).length;
      
      const scoreContext = {
        health: this.lives,
        maxHealth: 3,
        activeEnemiesCount: activeEnemiesCount
      };

      // Cálculo de pontos (Chips x Mult)
      const scoringResult = this.scoreEngine.addPelletScore(
        pelletEaten.type, 
        this.jokers, 
        scoreContext
      );

      // Efeitos passivos dos coringas ao comer orbe
      this.jokers.forEach(j => {
        if (j && typeof j.onEatPellet === 'function') {
          const goldBonus = j.onEatPellet(this);
          if (goldBonus) {
            this.addFloatingText(this.player.x + TILE_SIZE/2, this.player.y - 12, '+1 Gold!', COLOR_PALETTE.GOLD_PELLET, 850);
          }
        }
      });

      this.score = this.scoreEngine.score;
      this.stageScore = this.scoreEngine.stageScore;

      // Texto de pontuação subindo na tela
      this.addFloatingText(
        this.player.x + TILE_SIZE / 2, 
        this.player.y, 
        `+${scoringResult.points} pts`, 
        scoringResult.mult > 1 ? '#ef4444' : '#22d3ee', 
        800,
        `(${scoringResult.chips} x ${scoringResult.mult})`
      );

      // Checa se a meta da fase foi batida
      const goal = getBlindScore(this.stage);
      if (this.stageScore >= goal && !this.mapManager.portalSpawned) {
        this.mapManager.spawnPortal();
        
        // Spawna portal com faíscas verdes
        const portalPx = this.mapManager.portalTile.x * TILE_SIZE + TILE_SIZE/2;
        const portalPy = this.mapManager.portalTile.y * TILE_SIZE + TILE_SIZE/2;
        this.particleSystem.spawnImpactSparks(portalPx, portalPy, COLOR_PALETTE.PORTAL);
        
        this.addFloatingText(
          portalPx, 
          portalPy - 20, 
          'PORTAL ABERTO!', 
          COLOR_PALETTE.PORTAL, 
          1800
        );
      }
    }

    // Jogador vs Portal (Passagem de fase)
    const playerGridX = Math.round(this.player.x / TILE_SIZE);
    const playerGridY = Math.round(this.player.y / TILE_SIZE);
    
    if (this.mapManager.isPortal(playerGridX, playerGridY)) {
      this.clearStage();
      return;
    }

    // Jogador vs Fantasmas (Inimigos)
    this.enemies.forEach(enemy => {
      if (enemy.state === ENEMY_STATES.EATEN) return;

      const dx = this.player.x - enemy.x;
      const dy = this.player.y - enemy.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Alcance de contato físico
      if (dist < TILE_SIZE / 1.5) {
        if (enemy.state === ENEMY_STATES.STUNNED) {
          // Devora o fantasma!
          enemy.eaten();
          this.particleSystem.spawnImpactSparks(enemy.x + TILE_SIZE/2, enemy.y + TILE_SIZE/2, '#ffffff');
          
          // O fantasma devorado dá pontos extras
          const eatenCombo = this.scoreEngine.combo || 1;
          const chipsBonus = 300;
          const multBonus = 5;
          const pointsEarned = chipsBonus * multBonus * eatenCombo;
          
          this.score += pointsEarned;
          this.stageScore += pointsEarned;
          this.scoreEngine.score = this.score;
          this.scoreEngine.stageScore = this.stageScore;
          
          this.addFloatingText(
            enemy.x + TILE_SIZE/2, 
            enemy.y, 
            `DEVORADO! +${pointsEarned.toLocaleString()}`, 
            '#a855f7', 
            1200,
            `x${eatenCombo} Combo`
          );
        } else {
          // Jogador foi atingido!
          this.hurtPlayer();
        }
      }
    });

    // 8. Atualiza os sistemas visuais secundários
    this.particleSystem.update(dt);
    this.updateFloatingTexts(dt);

    // 9. Atualiza o painel do HUD na barra lateral
    this.updateHUD();
  }

  hurtPlayer() {
    this.lives--;
    this.player.lives = this.lives;
    this.scoreEngine.resetCombo();
    
    this.particleSystem.triggerScreenShake(12);
    this.particleSystem.spawnImpactSparks(
      this.player.x + TILE_SIZE / 2, 
      this.player.y + TILE_SIZE / 2, 
      '#ff0033'
    );

    // Checa se as vidas acabaram (Game Over)
    if (this.lives <= 0) {
      this.state = GAME_STATES.GAMEOVER;
      
      // Grava o recorde localmente se bater a maior pontuação anterior
      const record = parseInt(localStorage.getItem('munch_highscore')) || 0;
      if (this.score > record) {
        localStorage.setItem('munch_highscore', this.score);
      }
      
      this.uiManager.switchState(this.state);
    } else {
      // Reposiciona o jogador e os fantasmas (estilo reinício de rodada clássico)
      this.player.reset(10, 16);
      this.enemies.forEach(e => e.reset());
      this.projectiles = [];
    }
  }

  clearStage() {
    // Entrega moedas ao passar de fase
    const fraction = Math.min(2.0, this.stageScore / getBlindScore(this.stage));
    let coinsEarned = getStageCoinReward(this.stage, this.lives, fraction);
    
    // Adiciona o bônus passivo obtido com Coringas
    const stats = this.player.getModifiedStats(this.jokers);
    coinsEarned += stats.stageCompletionGoldBonus || 0;

    this.gold += coinsEarned;
    
    // Direciona o jogador para a Loja
    this.state = GAME_STATES.SHOP;
    
    // Gera novas opções na vitrine da loja
    const offers = this.shopSystem.generateOffers();
    this.uiManager.renderShop(offers, this.gold, this.shopSystem.rerollCost);
    this.uiManager.switchState(this.state);
    
    this.updateHUD();
  }

  // --- Controle de Textos Flutuantes ---

  addFloatingText(x, y, text, color, lifeMs = 800, subtext = '') {
    this.floatingTexts.push({
      x,
      y,
      text,
      subtext,
      color,
      life: lifeMs,
      maxLife: lifeMs,
      vy: 0.05 // Velocidade de subida dos números
    });
  }

  updateFloatingTexts(dt) {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const t = this.floatingTexts[i];
      t.y -= t.vy * dt;
      t.life -= dt;
      if (t.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  updateHUD() {
    const gameContext = {
      stage: this.stage,
      score: this.score,
      stageScore: this.stageScore,
      lives: this.lives,
      gold: this.gold,
      player: this.player,
      scoreEngine: this.scoreEngine,
      jokers: this.jokers
    };
    
    this.uiManager.updateHUD(gameContext);
  }

  draw() {
    const shake = this.particleSystem.getShakeOffset();
    
    this.ctx.save();
    
    // Efeito de tremor de tela
    this.ctx.translate(shake.x, shake.y);
    
    // Limpa com cor de fundo
    this.ctx.fillStyle = COLOR_PALETTE.BACKGROUND;
    this.ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Desenha elementos do jogo
    this.mapManager.draw(this.ctx);
    this.projectiles.forEach(p => p.draw(this.ctx));
    this.enemies.forEach(enemy => enemy.draw(this.ctx));

    if (this.player && this.state === GAME_STATES.PLAYING) {
      this.player.draw(this.ctx);
    }

    this.particleSystem.draw(this.ctx);

    // Pontuações subindo na tela (floating text)
    this.ctx.save();
    this.floatingTexts.forEach(t => {
      const alpha = Math.max(0, t.life / t.maxLife);
      
      this.ctx.globalAlpha = alpha;
      this.ctx.textAlign = 'center';
      
      this.ctx.font = 'bold 12px "Orbitron", sans-serif';
      this.ctx.fillStyle = t.color;
      this.ctx.fillText(t.text, t.x, t.y);

      if (t.subtext) {
        this.ctx.font = '9px "Press Start 2P", monospace';
        this.ctx.fillStyle = '#6b7280';
        this.ctx.fillText(t.subtext, t.x, t.y + 11);
      }
    });
    this.ctx.restore();

    this.ctx.restore();
  }
}
