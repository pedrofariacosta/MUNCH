// Munch - Motor de física e jogabilidade

(function () {
  // Favicon fixo do slime
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
  let GRID_WIDTH = 20;
  let GRID_HEIGHT = 15;

  const DIRECTIONS = {
    UP: { x: 0, y: -1, angle: -Math.PI / 2 },
    DOWN: { x: 0, y: 1, angle: Math.PI / 2 },
    LEFT: { x: -1, y: 0, angle: Math.PI },
    RIGHT: { x: 1, y: 0, angle: 0 },
    NONE: { x: 0, y: 0, angle: 0 }
  };

  const GAME_STATES = {
    PLAYING: 'playing',
    PHASE_CLEAR: 'phase_clear',
    WIN_MODAL: 'win_modal',
    RUN_CLEARED: 'run_cleared',
    GAME_OVER: 'game_over'
  };

  // Mapa do labirinto: 0 = vazio, 1 = parede, 2 = pastilha, 3 = ouro, 4 = azul
  const BASE_MAP = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 4, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 4, 1],
    [1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1],
    [1, 3, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 3, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1],
    [1, 2, 2, 2, 2, 1, 2, 2, 2, 1, 1, 2, 2, 2, 1, 2, 2, 2, 2, 1],
    [0, 2, 1, 1, 2, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 2, 1, 1, 2, 0], // Wrap portal nas extremidades (linha 7)
    [1, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 3, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 3, 1],
    [1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1],
    [1, 4, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  ];

  // Lista de relíquias disponíveis
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
      apply: (game) => { },
      revert: (game) => { }
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
      apply: (game) => { },
      revert: (game) => { }
    },
    {
      id: "relic_magnetic_pull",
      name: "VÁCUO MAGNÉTICO",
      category: "QUEBRA DE REGRAS",
      rarity: "Rara",
      desc: "Atrai e devora pastilhas a até 1.5 blocos de distância do Slime.",
      icon: "🧲",
      apply: (game) => { },
      revert: (game) => { }
    },
    {
      id: "relic_mercury_skates",
      name: "PATINS DE MERCÚRIO",
      category: "AÇÃO & SOBREVIVÊNCIA",
      rarity: "Incomum",
      desc: "Aumenta a velocidade base de movimento do Slime em +10%.",
      icon: "🛼",
      apply: (game) => { game.baseSpeedMult = (game.baseSpeedMult || 1) + 0.10; },
      revert: (game) => { game.baseSpeedMult = Math.max(1, (game.baseSpeedMult || 1.10) - 0.10); }
    },
    {
      id: "relic_adrenaline",
      name: "INJEÇÃO DE ADRENALINA",
      category: "AÇÃO & SOBREVIVÊNCIA",
      rarity: "Rara",
      desc: "Concede +20% de velocidade por 3s após abater um inimigo ou saltar.",
      icon: "💉",
      apply: (game) => { game.hasAdrenaline = true; },
      revert: (game) => { game.hasAdrenaline = false; }
    },
    {
      id: "relic_quantum_leap",
      name: "SALTO QUÂNTICO",
      category: "QUEBRA DE REGRAS",
      rarity: "Incomum",
      desc: "O Pulo passa a atravessar 3 blocos de distância e recarrega 2s mais rápido.",
      icon: "🌌",
      apply: (game) => { game.hasQuantumLeap = true; game.vaultMaxCooldown -= 2000; },
      revert: (game) => { game.hasQuantumLeap = false; game.vaultMaxCooldown += 2000; }
    },
    {
      id: "relic_midas_touch",
      name: "TOQUE DE MIDAS",
      category: "MULTIPLICADORES & PONTUAÇÃO",
      rarity: "Incomum",
      desc: "Ao saltar, converte a pastilha mais próxima em uma Moeda Dourada.",
      icon: "✨",
      apply: (game) => { game.hasMidasTouch = true; },
      revert: (game) => { game.hasMidasTouch = false; }
    },
    {
      id: "relic_black_card",
      name: "CARTÃO BLACK",
      category: "MULTIPLICADORES & PONTUAÇÃO",
      rarity: "Rara",
      desc: "Moedas Douradas concedem +5 Ouros extras e +100 Fichas.",
      icon: "💳",
      apply: (game) => { game.blackCardActive = true; },
      revert: (game) => { game.blackCardActive = false; }
    },
    {
      id: "relic_laser_ricochet",
      name: "RICOCHETE LASER",
      category: "QUEBRA DE REGRAS",
      rarity: "Rara",
      desc: "O disparo do Blaster rebate em até 2 paredes.",
      icon: "📐",
      apply: (game) => { game.laserRicochet = true; },
      revert: (game) => { game.laserRicochet = false; }
    },
    {
      id: "relic_infinite_battery",
      name: "BATERIA INFINITA",
      category: "AÇÃO & SOBREVIVÊNCIA",
      rarity: "Lendária",
      desc: "Eliminar 2 inimigos num curto intervalo recupera 1 carga de disparo.",
      icon: "🔋",
      apply: (game) => { game.infiniteBattery = true; },
      revert: (game) => { game.infiniteBattery = false; }
    },
    {
      id: "relic_straight_combo",
      name: "COMBO EM LINHA RETA",
      category: "MULTIPLICADORES & PONTUAÇÃO",
      rarity: "Comum",
      desc: "Andar 5 blocos sem fazer curvas adiciona +1 Mult.",
      icon: "📏",
      apply: (game) => { game.straightLineCombo = true; },
      revert: (game) => { game.straightLineCombo = false; }
    },
    {
      id: "relic_slime_meteor",
      name: "METEORO DE GOSMA",
      category: "AÇÃO & SOBREVIVÊNCIA",
      rarity: "Incomum",
      desc: "Ao aterrissar do pulo, gera choque de 2.5 blocos atordoando inimigos por 2s. Cooldown do pulo +25%.",
      icon: "☄️",
      apply: (game) => { game.hasSlimeMeteor = true; game.vaultMaxCooldown *= 1.25; },
      revert: (game) => { game.hasSlimeMeteor = false; game.vaultMaxCooldown /= 1.25; }
    },
    {
      id: "relic_quantum_jump",
      name: "SALTO QUÂNTICO",
      category: "QUEBRA DE REGRAS",
      rarity: "Incomum",
      desc: "Pular por cima de um perseguidor (Close Call) e aterrissar em pastilha comum restaura 50% da recarga do pulo.",
      icon: "🌌",
      apply: (game) => { game.hasQuantumJump = true; },
      revert: (game) => { game.hasQuantumJump = false; }
    },
    {
      id: "relic_gravity_boots",
      name: "BOTAS GRAVITACIONAIS",
      category: "QUEBRA DE REGRAS",
      rarity: "Rara",
      desc: "Permite saltar por cima das paredes do labirinto. Enquanto o pulo recarrega, tem -10% de velocidade.",
      icon: "🥾",
      apply: (game) => { game.hasGravityBoots = true; },
      revert: (game) => { game.hasGravityBoots = false; }
    },
    {
      id: "relic_slam_dunk",
      name: "ENTERRADA TRIUNFAL",
      category: "MULTIPLICADORES & PONTUAÇÃO",
      rarity: "Comum",
      desc: "Enquanto o Slime estiver no ar, qualquer pontuação gerada recebe um multiplicador temporário de x2.0 Mult.",
      icon: "🏀",
      apply: (game) => { game.hasSlamDunk = true; },
      revert: (game) => { game.hasSlamDunk = false; }
    },
    {
      id: "relic_loan_shark",
      name: "EMPRÉSTIMO TUBARÃO",
      category: "ECONOMIA & RISCO",
      rarity: "Incomum",
      desc: "Concede +15 moedas agora. As próximas 3 lojas cobram taxa de 5 moedas ou custam 1 vida.",
      icon: "🦈",
      apply: (game) => {
        game.hasLoanShark = true;
        game.gold += 15;
        game.runGoldCollected = (game.runGoldCollected || 0) + 15;
        game.loanSharkFeeRemaining = (game.loanSharkFeeRemaining || 0) + 3;
      },
      revert: (game) => { game.hasLoanShark = false; }
    },
    {
      id: "relic_piggy_bank",
      name: "COFRINHO DE CERÂMICA",
      category: "ECONOMIA & RISCO",
      rarity: "Comum",
      desc: "+1 moeda por fase concluída sem usar pulo. Ao sofrer dano, quebra, concede as moedas e é destruído.",
      icon: "🐷",
      apply: (game) => { game.hasPiggyBank = true; game.piggyBankCoins = 0; },
      revert: (game) => { game.hasPiggyBank = false; }
    },
    {
      id: "relic_leaky_bag",
      name: "BOLSA FURADA",
      category: "ECONOMIA & RISCO",
      rarity: "Rara",
      desc: "Reduz o preço da loja em 50%. Perde 1 moeda a cada 8s de fase sem super-pastilha ativa.",
      icon: "👜",
      apply: (game) => { game.hasLeakyBag = true; game.leakyBagTimer = 0; },
      revert: (game) => { game.hasLeakyBag = false; }
    },
    {
      id: "relic_saber_tooth",
      name: "DENTE DE SABRE",
      category: "MULTIPLICADORES & PONTUAÇÃO",
      rarity: "Comum",
      desc: "+10 fichas por pastilha devorada em movimento retilíneo contínuo por mais de 2 segundos.",
      icon: "🦷",
      apply: (game) => { game.hasSaberTooth = true; },
      revert: (game) => { game.hasSaberTooth = false; }
    },
    {
      id: "relic_tape_measure",
      name: "FITA MÉTRICA",
      category: "MULTIPLICADORES & PONTUAÇÃO",
      rarity: "Incomum",
      desc: "+0.1 Mult por segundo de movimento sem colidir em paredes (acumula até +3.0 Mult; zera se colidir).",
      icon: "📐",
      apply: (game) => { game.hasTapeMeasure = true; game.tapeMeasureBonus = 0; game.tapeMeasureTimer = 0; },
      revert: (game) => { game.hasTapeMeasure = false; game.tapeMeasureBonus = 0; }
    },
    {
      id: "relic_unstable_gunpowder",
      name: "PÓLVORA INSTÁVEL",
      category: "QUEBRA DE REGRAS",
      rarity: "Incomum",
      desc: "Eliminar inimigos vulneráveis explode e devora pastilhas normais em raio de 3 blocos. Super-pastilha dura 30% a menos.",
      icon: "🧨",
      apply: (game) => { game.hasUnstableGunpowder = true; },
      revert: (game) => { game.hasUnstableGunpowder = false; }
    },
    {
      id: "relic_wicked_shadow",
      name: "SOMBRA PERVERSA",
      category: "MULTIPLICADORES & PONTUAÇÃO",
      rarity: "Incomum",
      desc: "Até x1.75 Mult por proximidade de inimigo perigoso pelas costas. Toque nas costas causa dano imediato sem imunidade.",
      icon: "👥",
      apply: (game) => { game.hasWickedShadow = true; },
      revert: (game) => { game.hasWickedShadow = false; }
    },
    {
      id: "relic_faustian_bargain",
      name: "CONTRATO FAUSTO",
      category: "ECONOMIA & RISCO",
      rarity: "Rara",
      desc: "Concede +100.000 pontos no início de cada estágio. A vida máxima fica travada em exatamente 1.",
      icon: "📜",
      apply: (game) => {
        game.hasFaustianBargain = true;
        game.savedMaxLives = game.maxLives || 2;
        game.maxLives = 1;
        game.lives = 1;
      },
      revert: (game) => {
        game.hasFaustianBargain = false;
        game.maxLives = game.savedMaxLives || 2;
      }
    },
    {
      id: "relic_pure_adrenaline",
      name: "ADRENALINA PURA",
      category: "MULTIPLICADORES & PONTUAÇÃO",
      rarity: "Rara",
      desc: "Enquanto estiver com apenas 1 vida restante, todas as pastilhas devoradas aplicam x2.0 Mult.",
      icon: "💉",
      apply: (game) => { game.hasPureAdrenaline = true; },
      revert: (game) => { game.hasPureAdrenaline = false; }
    }
  ];

  // Classe para as poças de lodo
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
      ctx.arc(this.x + TILE_SIZE / 2, this.y + TILE_SIZE / 2, TILE_SIZE / 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.7)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }
  }

  function generateMap(ante) {
    if (ante === 3) {
      // Mapa maior: 23x17 com praças centrais abertas
      GRID_WIDTH = 23;
      GRID_HEIGHT = 17;
      return [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 4, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 1],
        [1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1],
        [1, 3, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 3, 1],
        [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 2, 1, 1, 1, 1, 2, 1, 1, 2, 2, 2, 2, 2, 1, 1, 2, 1, 1, 1, 1, 2, 1],
        [1, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 1],
        [1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 0, 0, 0, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1],
        [0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0], // Warp row
        [1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 0, 0, 0, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1],
        [1, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 1],
        [1, 2, 1, 1, 1, 1, 2, 1, 1, 2, 2, 2, 2, 2, 1, 1, 2, 1, 1, 1, 1, 2, 1],
        [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 3, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 3, 1],
        [1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1],
        [1, 4, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
      ];
    } else if (ante >= 4) {
      // Mapa fragmentado com lasers (Laser = 5) e 4 warps nos cantos
      GRID_WIDTH = 20;
      GRID_HEIGHT = 15;
      return [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [0, 4, 2, 2, 2, 2, 2, 2, 2, 5, 5, 2, 2, 2, 2, 2, 2, 2, 4, 0], // Warp Corners (linha 1)
        [1, 2, 1, 1, 5, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 5, 1, 1, 2, 1],
        [1, 3, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 3, 1],
        [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 2, 1, 1, 2, 1, 2, 1, 5, 1, 1, 5, 1, 2, 1, 2, 1, 1, 2, 1],
        [1, 2, 2, 2, 2, 1, 2, 2, 2, 1, 1, 2, 2, 2, 1, 2, 2, 2, 2, 1],
        [0, 2, 5, 1, 2, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 2, 1, 5, 2, 0], // Centro e laterais
        [1, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 1],
        [1, 2, 1, 1, 2, 1, 2, 1, 5, 1, 1, 5, 1, 2, 1, 2, 1, 1, 2, 1],
        [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
        [1, 3, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 3, 1],
        [1, 2, 1, 1, 5, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 5, 1, 1, 2, 1],
        [0, 4, 2, 2, 2, 2, 2, 2, 2, 5, 5, 2, 2, 2, 2, 2, 2, 2, 4, 0], // Warp Corners (linha 13)
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
      ];
    } else {
      // Mapas clássicos
      GRID_WIDTH = 20;
      GRID_HEIGHT = 15;
      return BASE_MAP.map(row => [...row]);
    }
  }

  // Classe controladora do jogo
  class Game {
    constructor() {
      this.canvas = document.getElementById('gameCanvas');
      this.ctx = this.canvas.getContext('2d');
      this.bezel = document.getElementById('arcadeBezel');

      // Modais
      this.modalWin = document.getElementById('modalWin');
      this.modalGameOver = document.getElementById('modalGameOver');
      this.modalRunCleared = document.getElementById('modalRunCleared');
      this.btnNextBlind = document.getElementById('btnNextBlind');
      this.btnRestart = document.getElementById('btnRestart');

      // Elementos do HUD
      this.hudBlindTarget = document.getElementById('hudBlindTarget');
      this.hudBlindBadge = document.getElementById('hudBlindBadge');
      this.hudBossBlindIndicator = document.getElementById('hudBossBlindIndicator');
      this.hudRelicsCount = document.getElementById('relicsCount');
      this.hudCurrentScore = document.getElementById('hudCurrentScore');
      this.hudProgressBar = document.getElementById('hudProgressBar');
      this.hudProgressContainer = document.getElementById('hudProgressContainer');
      this.hudProgressText = document.getElementById('hudProgressText');
      this.stageGoalAlert = document.getElementById('stageGoalAlert');
      this.inGameToastContainer = document.getElementById('inGameToastContainer');
      this.hudChipsValue = document.getElementById('hudChipsValue');
      this.hudMultValueEl = document.getElementById('hudMultValue');
      this.hudRoundIndicator = document.getElementById('hudRoundIndicator');
      this.hudLives = document.getElementById('hudLives');
      this.hudGold = document.getElementById('hudGold');

      // Suporte a toque: fecha tooltips abertos ao tocar fora
      document.addEventListener('click', () => {
        document.querySelectorAll('.relic-badge.touch-open').forEach(el => el.classList.remove('touch-open'));
      });

      this.chipsBox = document.getElementById('chipsBox');
      this.multBox = document.getElementById('multBox');

      // Habilidades e recarga
      this.vaultChargesEl = document.getElementById('vaultCharges');
      this.vaultCooldownFill = document.getElementById('vaultCooldownFill');
      this.blasterChargesEl = document.getElementById('blasterCharges');
      this.blasterCooldownFill = document.getElementById('blasterCooldownFill');

      this.skillVault = document.getElementById('skillVault');
      this.skillBlaster = document.getElementById('skillBlaster');

      // Estado inicial do jogo
      this.gameState = GAME_STATES.PLAYING;
      this.ante = 1;
      this.blind = 1;
      this.maxLives = 2; // Vida máxima
      this.lives = 2; // Vidas iniciais
      this.gold = 0;
      this.phase = 1;

      this.score = 0;
      this.chips = 0;
      this.mult = 1;
      this.targetScore = 1500;
      this.remainingPellets = 0;
      this.phaseClearTimer = 0;

      // Habilidades bloqueadas de início
      this.vaultMaxCharges = 0;
      this.vaultCharges = 0;
      this.vaultCooldown = 0;
      this.vaultMaxCooldown = 7000;

      this.blasterMaxCharges = 0;
      this.blasterCharges = 0;
      this.blasterCooldown = 0;
      this.blasterMaxCooldown = 10000;

      // Relíquias e bônus ativos
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
      this.debugMode = false; // Alterna com F3
      this.overchargeShockwave = null;

      // Estado e estatísticas de vitória (Run Cleared)
      this.animationFrameId = null;
      this.isVictoryPaused = false;
      this.runCleared = false;
      this.hasShownVictoryModal = false;
      this.accumulatedRunScore = 0;
      this.runMaxMult = 1;
      this.runEnemiesKilled = 0;
      this.runPelletsEaten = 0;

      this.init();
    }

    init() {
      // Aplica tema visual CRT salvo
      const theme = localStorage.getItem('munch_crt_theme');
      if (theme && theme !== 'default') {
        document.body.classList.add(`theme-${theme}`);
      }

      // Escuta do teclado
      window.addEventListener('keydown', (e) => {
        if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
          return;
        }
        if (this.isVictoryPaused || this.gameState === GAME_STATES.RUN_CLEARED) {
          return;
        }
        if (!this.player) return;

        // Abre/fecha depurador com F3
        if (e.code === 'F3') {
          e.preventDefault();
          this.debugMode = !this.debugMode;
          return;
        }

        if (this.gameState !== GAME_STATES.PLAYING) {
          // Atalho para reiniciar
          if (this.gameState === GAME_STATES.GAME_OVER && e.code === 'KeyR') {
            this.restartGame();
          }
          return;
        }

        // Buffer de entrada
        if (e.code === 'ArrowUp' || e.code === 'KeyW') this.player.setInput(DIRECTIONS.UP, this);
        if (e.code === 'ArrowDown' || e.code === 'KeyS') this.player.setInput(DIRECTIONS.DOWN, this);
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.player.setInput(DIRECTIONS.LEFT, this);
        if (e.code === 'ArrowRight' || e.code === 'KeyD') this.player.setInput(DIRECTIONS.RIGHT, this);

        // Aciona pulo
        if (e.code === 'Space') {
          e.preventDefault();
          this.triggerVault();
        }

        // Aciona disparo
        if (e.code === 'KeyF') {
          this.triggerBlaster();
        }

        // Atalho para reiniciar
        if (this.gameState === GAME_STATES.GAME_OVER && e.code === 'KeyR') {
          this.restartGame();
        }

        // Atalho de Enter para avançar na tela de vitória
        if (e.code === 'Enter' && this.gameState === GAME_STATES.WIN_MODAL && this.modalWin.classList.contains('visible')) {
          e.preventDefault();
          this.btnNextBlind.click();
          return;
        }

        // Atalhos para Loja de Relíquias (Draft Shop e Modo Substituição)
        const modalDraft = document.getElementById('modalDraftShop');
        if (modalDraft && modalDraft.classList.contains('visible')) {
          const cards = document.querySelectorAll('#draftCardsContainer .relic-card');
          const interactables = Array.from(document.querySelectorAll('#draftCardsContainer .relic-card, #draftCardsContainer .btn-discard-new'));

          if (e.code === 'ArrowLeft' || e.code === 'ArrowUp') {
            e.preventDefault();
            this.draftSelectedIndex = (this.draftSelectedIndex - 1 + interactables.length) % interactables.length;
            this.updateDraftFocus();
            return;
          }

          if (e.code === 'ArrowRight' || e.code === 'ArrowDown') {
            e.preventDefault();
            this.draftSelectedIndex = (this.draftSelectedIndex + 1) % interactables.length;
            this.updateDraftFocus();
            return;
          }

          if (e.code === 'Enter') {
            e.preventDefault();
            if (interactables[this.draftSelectedIndex]) {
              interactables[this.draftSelectedIndex].click();
            }
            return;
          }

          if (e.code === 'Digit1' || e.code === 'Numpad1') { if (cards.length > 0) { e.preventDefault(); cards[0].click(); return; } }
          if (e.code === 'Digit2' || e.code === 'Numpad2') { if (cards.length > 1) { e.preventDefault(); cards[1].click(); return; } }
          if (e.code === 'Digit3' || e.code === 'Numpad3') { if (cards.length > 2) { e.preventDefault(); cards[2].click(); return; } }
          if (e.code === 'Digit4' || e.code === 'Numpad4') { if (cards.length > 3) { e.preventDefault(); cards[3].click(); return; } }
          if (e.code === 'Digit5' || e.code === 'Numpad5') { if (cards.length > 4) { e.preventDefault(); cards[4].click(); return; } }

          if (e.code === 'Escape' || e.code === 'Backspace' || e.code === 'Delete') {
            const skipBtn = document.querySelector('.btn-discard-new');
            if (skipBtn) { e.preventDefault(); skipBtn.click(); return; }
          }
        }
      });

      // Clique esquerdo para atirar
      this.canvas.addEventListener('mousedown', (e) => {
        if (e.button === 0 && this.gameState === GAME_STATES.PLAYING && !this.isVictoryPaused) {
          this.triggerBlaster();
        }
      });

      // Modais do jogo
      this.btnNextBlind.addEventListener('click', () => {
        this.modalWin.classList.remove('visible');
        this.showDraftShopModal();
      });
      this.btnRestart.addEventListener('click', () => this.restartGame());

      // Botões do Modal de Vitória (Run Cleared)
      const btnFinishRun = document.getElementById('btnFinishRun');
      if (btnFinishRun) {
        btnFinishRun.addEventListener('click', async () => {
          btnFinishRun.disabled = true;
          const statusEl = document.getElementById('victorySubmitStatus');
          if (statusEl) {
            statusEl.innerText = "Registrando vitória...";
            statusEl.style.color = "#FFE600";
          }

          const txtPlayerName = document.getElementById('victoryPlayerName');
          const name = (txtPlayerName && txtPlayerName.value.trim()) ? txtPlayerName.value.trim() : (localStorage.getItem('munch_last_player_name') || 'SLIME_ANONIMO');
          localStorage.setItem('munch_last_player_name', name);

          const finalScore = Math.max(Math.round(this.accumulatedRunScore || 0), Math.round(this.score || 0));

          // 1. Marca cleared: true e salva histórico
          this.runCleared = true;
          this.recordRunHistory(true);

          // 2. Registra nas estatísticas
          let totalAntes = parseInt(localStorage.getItem('munch_total_antes')) || 0;
          localStorage.setItem('munch_total_antes', totalAntes + 1);

          const previousRecord = parseInt(localStorage.getItem('munch_best_round_score')) || 0;
          if (finalScore > previousRecord) {
            localStorage.setItem('munch_best_round_score', finalScore);
          }

          // 3. Desbloqueia Ficha Vermelha/Dourada e temas via MetaProgression
          if (window.MetaProgression) {
            window.MetaProgression.recordVictory(this.selectedSlime, this.stake);
          }
          if (this.stake === 'white') {
            localStorage.setItem('munch_unlocked_red_stake', 'true');
            let unlockedStakes = ['white'];
            try { unlockedStakes = JSON.parse(localStorage.getItem('munch_unlocked_stakes')) || ['white']; } catch (e) { }
            if (!unlockedStakes.includes('red')) unlockedStakes.push('red');
            localStorage.setItem('munch_unlocked_stakes', JSON.stringify(unlockedStakes));
          } else if (this.stake === 'red') {
            localStorage.setItem('munch_unlocked_gold_stake', 'true');
            let unlockedStakes = ['white', 'red'];
            try { unlockedStakes = JSON.parse(localStorage.getItem('munch_unlocked_stakes')) || ['white', 'red']; } catch (e) { }
            if (!unlockedStakes.includes('gold')) unlockedStakes.push('gold');
            localStorage.setItem('munch_unlocked_stakes', JSON.stringify(unlockedStakes));
          }

          if (window.AchievementManager) {
            window.AchievementManager.recordAnte(this.ante);
            window.AchievementManager.checkAll(false);
          }

          // 4. Envia para o Leaderboard / Redis
          try {
            const lb = window.MunchLeaderboard || (typeof MunchLeaderboard !== 'undefined' ? MunchLeaderboard : null);
            if (lb) {
              await lb.submitScore(name, finalScore, this.ante, this.stake, true);
            }
          } catch (err) {
            console.warn('[MUNCH] Erro ao sincronizar pontuação de vitória:', err);
          }

          // 5. Remove run ativa
          localStorage.removeItem('munch_active_run');

          // 6. Retorna ao menu
          window.location.href = 'menu.html';
        });
      }

      const btnContinueEndless = document.getElementById('btnContinueEndless');
      if (btnContinueEndless) {
        btnContinueEndless.addEventListener('click', () => {
          if (this.modalRunCleared) {
            this.modalRunCleared.classList.remove('visible');
          }

          // Garante desbloqueio da Ficha Vermelha/Dourada e temas via MetaProgression
          if (window.MetaProgression) {
            window.MetaProgression.recordVictory(this.selectedSlime, this.stake);
          }
          if (this.stake === 'white') {
            localStorage.setItem('munch_unlocked_red_stake', 'true');
            let unlockedStakes = ['white'];
            try { unlockedStakes = JSON.parse(localStorage.getItem('munch_unlocked_stakes')) || ['white']; } catch (e) { }
            if (!unlockedStakes.includes('red')) unlockedStakes.push('red');
            localStorage.setItem('munch_unlocked_stakes', JSON.stringify(unlockedStakes));
          } else if (this.stake === 'red') {
            localStorage.setItem('munch_unlocked_gold_stake', 'true');
          }

          if (window.AchievementManager) {
            window.AchievementManager.recordAnte(this.ante);
            window.AchievementManager.checkAll(false);
          }

          this.isEndless = true;
          this.runCleared = true;
          this.hasShownVictoryModal = true;
          this.isVictoryPaused = false;

          localStorage.setItem('munch_run_setup', JSON.stringify({
            stake: this.stake,
            endless: true
          }));

          // Avança para o Nível 9 Estágio 1
          this.ante = 9;
          this.blind = 1;
          this.phase = 1;

          this.gameState = GAME_STATES.PLAYING;
          this.loadLevel();

          this.lastTime = performance.now();
          this.animationFrameId = requestAnimationFrame((t) => this.gameLoop(t));
        });
      }

      const btnReturnMenu = document.getElementById('btnReturnMenu');
      if (btnReturnMenu) {
        btnReturnMenu.addEventListener('click', () => {
          this.recordRunHistory(this.runCleared);
          localStorage.removeItem('munch_active_run');
          window.location.href = 'menu.html';
        });
      }

      const btnSubmitScore = document.getElementById('btnSubmitScore');
      const txtPlayerName = document.getElementById('txtPlayerName');
      const lblSubmitStatus = document.getElementById('lblSubmitStatus');

      if (btnSubmitScore && txtPlayerName) {
        txtPlayerName.value = localStorage.getItem('munch_last_player_name') || '';
        btnSubmitScore.addEventListener('click', async () => {
          const name = txtPlayerName.value.trim();
          if (!name) {
            lblSubmitStatus.innerText = "Por favor, digite seu apelido!";
            lblSubmitStatus.style.color = "#FF2E2E";
            return;
          }
          localStorage.setItem('munch_last_player_name', name);
          lblSubmitStatus.innerText = "Registrando recorde...";
          lblSubmitStatus.style.color = "#FFE600";
          btnSubmitScore.disabled = true;

          const lb = window.MunchLeaderboard || (typeof MunchLeaderboard !== 'undefined' ? MunchLeaderboard : null);
          if (lb) {
            await lb.submitScore(name, this.score, this.ante, this.stake, this.runCleared);
          }
          lblSubmitStatus.innerText = "✓ RECORD ENVIADO COM SUCESSO!";
          lblSubmitStatus.style.color = "#10B981";
        });
      }

      // Verifica se deve resumir run ativa
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('resume') === 'true' && localStorage.getItem('munch_active_run')) {
        this.resumeActiveRun();
      } else {
        this.resetRunState();
        this.loadLevel();
      }

      this.lastTime = performance.now();
      this.animationFrameId = requestAnimationFrame((t) => this.gameLoop(t));
    }

    loadLevel() {
      // Carrega setup da partida e variante do slime
      const setupRaw = localStorage.getItem('munch_run_setup');
      let setup = { stake: 'white', endless: false };
      if (setupRaw) { try { setup = JSON.parse(setupRaw); } catch (e) { } }
      this.stake = setup.stake || this.stake || 'white';
      this.isEndless = this.isEndless || setup.endless || false;

      this.selectedSlime = localStorage.getItem('munch_selected_slime') || 'classic';
      this.isGamblerSlime = (this.selectedSlime === 'gambler');

      // Copia o mapa padrão
      this.map = generateMap(this.ante);

      this.canvas.width = GRID_WIDTH * TILE_SIZE;
      this.canvas.height = GRID_HEIGHT * TILE_SIZE;
      const gameContainer = document.querySelector('.game-container');
      if (gameContainer) gameContainer.style.width = (this.canvas.width + 60) + 'px';

      this.laserWallTimer = 4000;
      this.laserWallActive = false;

      // Coleta as posições livres para as pastilhas especiais
      const candidateTiles = [];
      for (let r = 0; r < GRID_HEIGHT; r++) {
        for (let c = 0; c < GRID_WIDTH; c++) {
          if (this.map[r][c] === 3 || this.map[r][c] === 4) {
            this.map[r][c] = 2; // Converte para pastilha normal primeiro
          }
          if (this.map[r][c] === 2) {
            // Ignora tiles muito próximos do spawn do jogador
            const dist = Math.hypot(c - 9, r - 8);
            if (dist > 2.5) {
              candidateTiles.push({ r, c });
            }
          }
        }
      }

      // Embaralha as posições disponíveis
      for (let i = candidateTiles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [candidateTiles[i], candidateTiles[j]] = [candidateTiles[j], candidateTiles[i]];
      }

      // Coloca 4 pastilhas azuis
      const bluePellets = [];
      for (let i = 0; i < 4 && candidateTiles.length > 0; i++) {
        const t = candidateTiles.pop();
        this.map[t.r][t.c] = 4;
        bluePellets.push(t);
      }

      // Spawning de Moedas Físicas em Posição de Risco (Estritamente 2 a 3 moedas)
      // Se Boss Blind "Vácuo de Moedas", nenhuma moeda física nasce no mapa!
      if (this.activeBossBlind !== 'Vácuo de Moedas') {
        const coinCount = Math.floor(Math.random() * 2) + 2; // 2 ou 3 moedas

        const deadEnds = [];
        const normalCandidates = [];

        candidateTiles.forEach(tile => {
          let wallCount = 0;
          const neighbors = [
            { r: tile.r - 1, c: tile.c },
            { r: tile.r + 1, c: tile.c },
            { r: tile.r, c: tile.c - 1 },
            { r: tile.r, c: tile.c + 1 }
          ];
          neighbors.forEach(n => {
            if (n.r < 0 || n.r >= GRID_HEIGHT || n.c < 0 || n.c >= GRID_WIDTH || this.map[n.r][n.c] === 1) {
              wallCount++;
            }
          });

          let minBlueDist = Infinity;
          bluePellets.forEach(bp => {
            const d = Math.hypot(tile.c - bp.c, tile.r - bp.r);
            if (d < minBlueDist) minBlueDist = d;
          });
          tile.minBlueDist = minBlueDist;

          if (wallCount >= 3) {
            deadEnds.push(tile);
          } else {
            normalCandidates.push(tile);
          }
        });

        deadEnds.sort((a, b) => b.minBlueDist - a.minBlueDist);
        normalCandidates.sort((a, b) => b.minBlueDist - a.minBlueDist);
        const prioritized = [...deadEnds, ...normalCandidates];

        for (let i = 0; i < coinCount && prioritized.length > 0; i++) {
          const coinTile = prioritized[i];
          this.map[coinTile.r][coinTile.c] = 3;
        }
      }

      // Conta as pastilhas no tabuleiro
      this.remainingPellets = 0;
      for (let r = 0; r < GRID_HEIGHT; r++) {
        for (let c = 0; c < GRID_WIDTH; c++) {
          if (this.map[r][c] >= 2) this.remainingPellets++;
        }
      }
      this.totalPellets = this.remainingPellets;

      // Reseta rastreadores do estágio
      this.stageDamageTaken = false;
      this.jumpUsedInStage = false;
      this.targetReachedInStage = false;
      if (this.hudProgressContainer) {
        this.hudProgressContainer.classList.remove('goal-cleared-glitch');
      }
      this.leakyBagTimer = 0;
      this.landingBoostTimer = 0;
      this.corridorTrail = [];
      this.fakeWallsCooldownTimer = 15000;
      this.fakeWallsDurationTimer = 0;
      this.activeFakeWalls = [];

      // Spawna o slime e os inimigos
      const startX = Math.floor(GRID_WIDTH / 2) - 1;
      const startY = Math.floor(GRID_HEIGHT / 2) + 1;
      this.player = new Player(startX, startY, this.selectedSlime);
      this.ghosts = this.spawnEnemiesForPhase(this.phase);

      // Boss Blind: Inimigo Fantasma (um dos perseguidores fica invisível com olhos espreitantes e +10% vel)
      if (this.activeBossBlind === 'Inimigo Fantasma' && this.ghosts && this.ghosts.length > 0) {
        this.ghosts[0].isPhantom = true;
        this.ghosts[0].speed *= 1.10;
      }

      // Boss Blind: O Silenciador (desativa temporariamente o efeito da 1ª relíquia equipada)
      if (this.activeBossBlind === 'O Silenciador' && this.activeRelics.length > 0 && typeof this.activeRelics[0].revert === 'function') {
        this.activeRelics[0].revert(this);
      }

      // Alerta de Boss Blind
      if (this.activeBossBlind) {
        this.showBossBlindBanner(this.activeBossBlind);
      }

      this.projectiles = [];
      this.particles = [];
      this.floatingTexts = [];
      this.frightenedTimer = 0;
      this.phaseClearTimer = 0;
      this.targetScore = this.getTargetScore(this.ante, this.blind);

      // Boss Blind: Vácuo de Moedas (+15% na meta)
      if (this.activeBossBlind === 'Vácuo de Moedas') {
        this.targetScore = Math.round(this.targetScore * 1.15);
      }

      this.score = 0;
      this.chips = 0;
      this.mult = 1;

      // Relíquia Contrato Fausto: +100.000 pontos no início do estágio; vida máxima travada em 1
      if (this.hasFaustianBargain) {
        this.score += 100000;
        this.maxLives = 1;
        this.lives = 1;
        this.addFloatingText(this.player.x + TILE_SIZE / 2, this.player.y - 35, '+100.000 PONTOS (FAUSTO)', '#FFE600');
      }

      // Recarrega as cargas das habilidades para o máximo APENAS se comprou o voucher
      if (this.buyRecharge) {
        this.vaultCharges = this.vaultMaxCharges;
        this.blasterCharges = this.blasterMaxCharges;
        this.vaultCooldown = 0;
        this.blasterCooldown = 0;
        this.buyRecharge = false;
      }

      this.stickyPools = [];
      this.pelletsEatenForVault = 0;

      this.updateHUD();
      this.updateRelicsTray();
      this.saveActiveRunState();
    }

    getTargetScore(ante, blind) {
      if (ante >= 9) {
        // Escalonamento exponencial do Modo Sem Fim (Endless Mode)
        // Meta_N = Meta_8 * (1.8)^(N - 8)
        const target8 = this.getTargetScore(8, blind);
        return Math.round(target8 * Math.pow(1.8, ante - 8));
      }

      let baseTarget = 2000;
      if (ante === 1) {
        if (blind === 1) baseTarget = 2000;
        if (blind === 2) baseTarget = 4000;
        if (blind === 3) baseTarget = 8000;
      } else if (ante === 2) {
        if (blind === 1) baseTarget = 15000;
        if (blind === 2) baseTarget = 25000;
        if (blind === 3) baseTarget = 45000;
      } else {
        const base = blind === 1 ? 15000 : (blind === 2 ? 25000 : 45000);
        baseTarget = Math.round(base * Math.pow(2.2, ante - 2));
      }

      if (this.stake === 'red') baseTarget = Math.round(baseTarget * 1.20);
      if (this.stake === 'gold') baseTarget = Math.round(baseTarget * 1.40);

      return baseTarget;
    }

    checkWinCondition() {
      if (this.gameState === GAME_STATES.PLAYING && this.score >= this.targetScore) {
        this.gameState = GAME_STATES.PHASE_CLEAR;
        this.phaseClearTimer = 1500; // Pausa rápida com efeitos visuais
        this.triggerScreenShake(12);

        // Recompensa Meritocrática ao Concluir Estágio (Fase 3)
        let earnedCoins = 2; // Base: +2 moedas
        let noDamage = !this.stageDamageTaken;
        let overTarget = (this.score >= this.targetScore * 1.5);
        if (noDamage) earnedCoins += 1; // Sem Dano: +1 moeda
        if (overTarget) earnedCoins += 1; // Meta Superada (>= 150%): +1 moeda
        earnedCoins = Math.min(4, earnedCoins); // Teto máximo por fase: 4 moedas
        this.gold += earnedCoins;
        this.runGoldCollected = (this.runGoldCollected || 0) + earnedCoins;

        // Bônus Cofrinho de Cerâmica (se completou a fase sem usar pulo)
        if (this.hasPiggyBank && !this.jumpUsedInStage) {
          this.piggyBankCoins = (this.piggyBankCoins || 0) + 1;
          this.addFloatingText(this.player ? this.player.x + TILE_SIZE / 2 : 200, this.player ? this.player.y - 35 : 200, `🐷 COFRINHO +1 MOEDA (${this.piggyBankCoins} no cofre)`, '#FFB703');
        }

        // Restaura a 1ª relíquia se estava sob efeito de 'O Silenciador'
        if (this.activeBossBlind === 'O Silenciador' && this.activeRelics.length > 0 && typeof this.activeRelics[0].apply === 'function') {
          this.activeRelics[0].apply(this);
        }

        let rewardDetails = `+${earnedCoins} MOEDAS (Base 2${noDamage ? ' +1 Sem Dano' : ''}${overTarget ? ' +1 Meta 150%' : ''})`;
        if (this.player) {
          this.addFloatingText(this.player.x + TILE_SIZE / 2, this.player.y - 15, rewardDetails, '#FFE600');
        }

        // Registra incremento de Antes completados nas estatísticas
        let completed = parseInt(localStorage.getItem('munch_completed_antes')) || 0;
        let totalAntes = parseInt(localStorage.getItem('munch_total_antes')) || 0;
        localStorage.setItem('munch_completed_antes', completed + 1);
        localStorage.setItem('munch_total_antes', totalAntes + 1);

        if (window.AchievementManager) {
          if (this.blind === 3) window.AchievementManager.recordBossDefeated(1);
          window.AchievementManager.recordAnte(this.ante);
          window.AchievementManager.recordGoldHeld(this.gold);
          window.AchievementManager.recordScore(this.score);
          window.AchievementManager.recordMult(this.mult);
        }

        // Acumula a pontuação da run
        this.accumulatedRunScore = (this.accumulatedRunScore || 0) + this.score;

        // Confetes e efeitos de vitória
        for (let i = 0; i < 40; i++) {
          this.particles.push(new Particle(
            this.canvas.width / 2,
            this.canvas.height / 2,
            Math.random() > 0.5 ? '#FFE600' : `hsl(${Math.random() * 360}, 100%, 60%)`,
            Math.random() * 4 + 3,
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 8,
            1200
          ));
        }

        this.saveActiveRunState();
      }
    }

    triggerBoardOvercharge() {
      this.overchargeShockwave = {
        x: this.canvas.width / 2,
        y: this.canvas.height / 2,
        radius: 0,
        maxRadius: Math.hypot(this.canvas.width, this.canvas.height),
        speed: 0.8,
        active: true
      };

      this.triggerScreenShake(10);

      this.remainingPellets = 0;
      for (let r = 0; r < GRID_HEIGHT; r++) {
        for (let c = 0; c < GRID_WIDTH; c++) {
          if (BASE_MAP[r][c] >= 2) {
            this.map[r][c] = 5; // Transforma em pastilha energizada
            this.remainingPellets++;
          }
        }
      }

      // Coloca uma moeda dourada no meio do mapa
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

    // Cria os inimigos nos cantos do labirinto para não nascerem em cima do jogador
    spawnEnemiesForPhase(phase) {
      const speedMultiplier = this.getEnemySpeedMultiplier(phase);
      if (phase === 1) {
        const spade = new SpikeEnemy(2, 2, 'SPADE');
        spade.speed *= speedMultiplier;
        return [spade];
      } else if (phase === 2) {
        const spade = new SpikeEnemy(2, 2, 'SPADE');
        const diamond = new SpikeEnemy(GRID_WIDTH - 3, 2, 'DIAMOND');
        spade.speed *= speedMultiplier;
        diamond.speed *= speedMultiplier;
        return [spade, diamond];
      } else if (phase === 3) {
        const e1 = new SpikeEnemy(2, 2, 'SPADE');
        const e2 = new SpikeEnemy(GRID_WIDTH - 3, 2, 'DIAMOND');
        const e3 = new SpikeEnemy(2, GRID_HEIGHT - 3, 'SPADE');
        [e1, e2, e3].forEach(e => e.speed *= speedMultiplier);
        return [e1, e2, e3];
      } else {
        // 4 inimigos
        const e1 = new SpikeEnemy(2, 2, 'SPADE');
        const e2 = new SpikeEnemy(GRID_WIDTH - 3, 2, 'DIAMOND');
        const e3 = new SpikeEnemy(2, GRID_HEIGHT - 3, 'SPADE');
        const e4 = new SpikeEnemy(GRID_WIDTH - 3, GRID_HEIGHT - 3, 'DIAMOND');
        [e1, e2, e3, e4].forEach(e => e.speed *= speedMultiplier);
        return [e1, e2, e3, e4];
      }
    }

    // Define a velocidade dos inimigos a cada fase
    getEnemySpeedMultiplier(phase) {
      let mult = 0.70;
      if (phase === 1) mult = 0.70;
      else if (phase === 2) mult = 0.80;
      else mult = Math.min(1.3, 0.85 + (phase - 3) * 0.05);

      if (this.stake === 'red') mult *= 1.10;
      if (this.stake === 'gold') mult *= 1.20;

      // Incremento passivo no Modo Sem Fim (+5% cumulativo por nível além do 8)
      if (this.ante > 8) {
        mult *= (1 + (this.ante - 8) * 0.05);
      }

      return mult;
    }

    triggerScreenShake(intensity = 8) {
      if (!this.bezel) return;
      const shakeSetting = localStorage.getItem('munch_option_shake') || '100';
      const factor = parseInt(shakeSetting) / 100;
      if (factor <= 0) return;

      this.bezel.classList.remove('shake');
      void this.bezel.offsetWidth;
      this.bezel.classList.add('shake');
      setTimeout(() => this.bezel.classList.remove('shake'), Math.round(150 * factor));
    }

    triggerVault() {
      if (!this.player || this.vaultCharges <= 0 || this.player.isJumping || this.player.dir === DIRECTIONS.NONE) return;

      const jumpDistance = this.hasQuantumLeap ? 3 : 2;
      const targetGridX = this.player.gridX + this.player.dir.x * jumpDistance;
      const targetGridY = this.player.gridY + this.player.dir.y * jumpDistance;

      // Sem Botas Gravitacionais, não pode saltar através de paredes intermediárias
      if (!this.hasGravityBoots) {
        for (let step = 1; step < jumpDistance; step++) {
          const midX = this.player.gridX + this.player.dir.x * step;
          const midY = this.player.gridY + this.player.dir.y * step;
          if (!this.isWalkable(midX, midY)) return;
        }
      }

      if (this.isWalkable(targetGridX, targetGridY)) {
        // Poças de lodo deixadas pelo pulo
        if (this.hasStickyJump) {
          this.stickyPools.push(new StickyPool(this.player.gridX, this.player.gridY));
          this.stickyPools.push(new StickyPool(targetGridX, targetGridY));
        }

        this.jumpUsedInStage = true;
        this.player.jumpCrossedEnemies = new Set();
        this.player.hasMadeCloseCallInCurrentJump = false;

        this.vaultCharges--;
        this.player.jumpTo(targetGridX, targetGridY);
        this.triggerScreenShake(4);

        if (this.hasAdrenaline) this.adrenalineTimer = 3000;

        if (this.hasMidasTouch) {
          let closest = null;
          let minDist = Infinity;
          for (let r = 0; r < GRID_HEIGHT; r++) {
            for (let c = 0; c < GRID_WIDTH; c++) {
              if (this.map[r][c] === 2) {
                let dist = Math.hypot(this.player.gridX - c, this.player.gridY - r);
                if (dist < minDist) { minDist = dist; closest = { r, c }; }
              }
            }
          }
          if (closest) this.map[closest.r][closest.c] = 3; // Transforma em ouro
        }

        this.spawnDust(this.player.x + TILE_SIZE / 2, this.player.y + TILE_SIZE / 2, 8, '#ffffff');
        this.addFloatingText(this.player.x + TILE_SIZE / 2, this.player.y, 'PULO!', '#00E5FF');
      }
    }

    triggerBlaster() {
      if (!this.player || this.blasterCharges <= 0 || this.player.isJumping) return;

      let shootDir = this.player.dir;
      if (shootDir === DIRECTIONS.NONE) {
        shootDir = DIRECTIONS.RIGHT;
      }

      this.blasterCharges--;

      const startX = this.player.x + TILE_SIZE / 2;
      const startY = this.player.y + TILE_SIZE / 2;

      const isRailgun = this.activeRelics.some(r => r.id === 'relic_railgun');
      const bounces = this.laserRicochet ? 2 : 0;
      this.projectiles.push(new Laser(startX, startY, shootDir, isRailgun, bounces));
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
      // Bloqueio temporário por Paredes Falsas (Boss Blind)
      if (this.activeFakeWalls && this.activeFakeWalls.some(w => w.r === gridY && w.c === gridX)) {
        return false;
      }

      if (gridX < 0 || gridX >= GRID_WIDTH || gridY < 0 || gridY >= GRID_HEIGHT) {
        if (gridX === -1 && gridY >= 0 && gridY < GRID_HEIGHT) return this.map[gridY][0] !== 1 && this.map[gridY][GRID_WIDTH - 1] !== 1;
        if (gridX === GRID_WIDTH && gridY >= 0 && gridY < GRID_HEIGHT) return this.map[gridY][GRID_WIDTH - 1] !== 1 && this.map[gridY][0] !== 1;
        if (gridY === -1 && gridX >= 0 && gridX < GRID_WIDTH) return this.map[0][gridX] !== 1 && this.map[GRID_HEIGHT - 1][gridX] !== 1;
        if (gridY === GRID_HEIGHT && gridX >= 0 && gridX < GRID_WIDTH) return this.map[GRID_HEIGHT - 1][gridX] !== 1 && this.map[0][gridX] !== 1;
        return false;
      }
      if (this.map[gridY][gridX] === 5) {
        return !this.laserWallActive;
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

      let blindName = 'ESTÁGIO 1';
      if (this.blind === 2) blindName = 'ESTÁGIO 2';
      else if (this.blind === 3) blindName = 'CHEFÃO';

      // Informações da fase e meta
      if (this.hudBlindBadge) {
        this.hudBlindBadge.innerText = `NÍVEL ${this.ante} // ${blindName}`;
      }

      if (this.hudBossBlindIndicator) {
        if (this.activeBossBlind) {
          this.hudBossBlindIndicator.style.display = 'inline-flex';
          this.hudBossBlindIndicator.innerText = `⚠️ ${this.activeBossBlind.toUpperCase()}`;
          this.hudBossBlindIndicator.title = this.getBossBlindDescription(this.activeBossBlind);
        } else {
          this.hudBossBlindIndicator.style.display = 'none';
        }
      }

      this.hudBlindTarget.innerText = this.targetScore.toLocaleString();

      const pct = Math.min(100, (this.score / this.targetScore) * 100);
      this.hudProgressBar.style.width = pct + '%';
      if (this.hudProgressText) {
        this.hudProgressText.innerText = `${Math.round(this.score).toLocaleString()} / ${Math.round(this.targetScore).toLocaleString()} (${Math.floor(pct)}%)`;
      }

      if (pct >= 100) {
        this.hudProgressBar.classList.add('gold-pulsing');
        if (!this.targetReachedInStage) {
          this.targetReachedInStage = true;
          if (this.hudProgressContainer) this.hudProgressContainer.classList.add('goal-cleared-glitch');
          this.playSFX('target_cleared');
          this.showStageGoalAlert('META ATINGIDA');
        }
      } else {
        this.hudProgressBar.classList.remove('gold-pulsing');
      }

      this.hudCurrentScore.innerText = Math.round(this.score).toLocaleString();

      this.hudChipsValue.innerText = Math.round(this.chips).toLocaleString();
      this.hudMultValueEl.innerText = Math.round(this.mult);

      this.hudRoundIndicator.innerText = `NÍVEL ${this.ante} // ${blindName}`;
      this.hudLives.innerText = '\u2764\uFE0F'.repeat(Math.max(0, this.lives));
      this.hudGold.innerText = this.gold;

      // Contador de relíquias
      if (this.hudRelicsCount) {
        this.hudRelicsCount.innerText = `(${this.activeRelics.length}/${this.maxRelics})`;
      }

      // Atualiza recarga do pulo
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

      // Atualiza recarga do disparo
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

      for (let i = 0; i < this.maxRelics; i++) {
        const slot = document.createElement('div');
        if (i < this.activeRelics.length) {
          const card = this.activeRelics[i];
          const rarityClass = card.rarity === 'Rara' ? 'rara' : card.rarity.toLowerCase();
          const isSilenced = (i === 0 && this.activeBossBlind === 'O Silenciador');

          slot.className = `relic-badge occupied ${rarityClass}${isSilenced ? ' silenced' : ''}`;
          slot.innerHTML = `
            <span class="relic-icon-display">${card.icon}</span>
            <div class="relic-tooltip">
              <div class="tooltip-rarity ${rarityClass}">${card.rarity.toUpperCase()}${isSilenced ? ' [SILENCIADA]' : ''}</div>
              <div class="tooltip-name">${card.name}</div>
              <div class="tooltip-category">${card.category}</div>
              <div class="tooltip-desc">${isSilenced ? '⚠️ EFEITO DESATIVADO POR O SILENCIADOR!' : card.desc}</div>
            </div>
          `;

          // Suporte a toque para abrir/fechar tooltip
          slot.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = slot.classList.contains('touch-open');
            document.querySelectorAll('.relic-badge.touch-open').forEach(el => el.classList.remove('touch-open'));
            if (!isOpen) slot.classList.add('touch-open');
          });
        } else {
          slot.className = 'relic-badge empty';
          slot.innerHTML = '';
        }
        tray.appendChild(slot);
      }

      // Atualiza contador de relíquias no HUD
      if (this.hudRelicsCount) {
        this.hudRelicsCount.innerText = `(${this.activeRelics.length}/${this.maxRelics})`;
      }
    }

    resetRunState() {
      this.activeRelics = [];
      this.pelletChipBonus = 0;
      this.killMultBonus = 0;
      this.goldenMultFactor = 1.0;
      this.hasStickyJump = false;
      this.cooldownMultiplier = 1.0;

      this.selectedSlime = localStorage.getItem('munch_selected_slime') || 'classic';
      this.isGamblerSlime = (this.selectedSlime === 'gambler');
      this.initialRunRecord = parseInt(localStorage.getItem('munch_best_round_score')) || 0;

      // Aplica estatísticas e habilidades base de cada Slime
      this.vaultMaxCharges = 0;
      this.blasterMaxCharges = 0;

      if (this.selectedSlime === 'metallic') {
        this.pelletChipBonus = 30;
        this.cooldownMultiplier = 1.20;
      } else if (this.selectedSlime === 'ballistic') {
        this.blasterMaxCharges = 2;
      }

      this.vaultMaxCooldown = 7000;
      this.blasterMaxCooldown = 6000;

      this.maxRelics = 5;
      this.purchasedVouchers = [];

      this.vaultCharges = this.vaultMaxCharges;
      this.blasterCharges = this.blasterMaxCharges;
      this.vaultCooldown = 0;
      this.blasterCooldown = 0;

      this.maxLives = 2;
      this.lives = 2;
      this.gold = 0;
      this.runGoldCollected = 0;
      this.phase = 1;
      this.ante = 1;
      this.blind = 1;
      this.score = 0;
      this.chips = 0;
      this.mult = 1;
      this.activeBossBlind = null;

      // Estatísticas da run atual
      this.runPelletsEaten = 0;
      this.runEnemiesKilled = 0;
      this.runMaxMult = 1;
      this.accumulatedRunScore = 0;
      this.isVictoryPaused = false;
      this.runCleared = false;
      this.hasShownVictoryModal = false;
      this.isEndless = false;
      this.targetReachedInStage = false;
    }

    saveActiveRunState() {
      if (this.gameState === GAME_STATES.GAME_OVER) return;
      const data = {
        ante: this.ante,
        blind: this.blind,
        phase: this.phase,
        score: this.score,
        chips: this.chips,
        mult: this.mult,
        gold: this.gold,
        lives: this.lives,
        maxLives: this.maxLives,
        selectedSlime: this.selectedSlime,
        stake: this.stake,
        isEndless: this.isEndless,
        runCleared: this.runCleared,
        hasShownVictoryModal: this.hasShownVictoryModal,
        accumulatedRunScore: this.accumulatedRunScore,
        runMaxMult: this.runMaxMult,
        runEnemiesKilled: this.runEnemiesKilled,
        runPelletsEaten: this.runPelletsEaten,
        activeBossBlind: this.activeBossBlind,
        maxRelics: this.maxRelics,
        purchasedVouchers: this.purchasedVouchers,
        activeRelics: this.activeRelics.map(r => ({ id: r.id, name: r.name, icon: r.icon, rarity: r.rarity, category: r.category, desc: r.desc }))
      };
      localStorage.setItem('munch_active_run', JSON.stringify(data));
    }

    resumeActiveRun() {
      const activeRaw = localStorage.getItem('munch_active_run');
      if (!activeRaw) {
        this.resetRunState();
        this.loadLevel();
        return;
      }
      try {
        const data = JSON.parse(activeRaw);
        this.resetRunState();

        this.ante = data.ante || 1;
        this.blind = data.blind || 1;
        this.phase = data.phase || 1;
        this.score = data.score || 0;
        this.chips = data.chips || 0;
        this.mult = data.mult || 1;
        this.gold = data.gold || 0;
        this.selectedSlime = data.selectedSlime || 'classic';
        this.stake = data.stake || 'white';
        this.isEndless = data.isEndless || false;
        this.runCleared = data.runCleared || false;
        this.hasShownVictoryModal = data.hasShownVictoryModal || false;
        this.accumulatedRunScore = data.accumulatedRunScore || 0;
        this.runMaxMult = data.runMaxMult || 1;
        this.runEnemiesKilled = data.runEnemiesKilled || 0;
        this.runPelletsEaten = data.runPelletsEaten || 0;
        this.isGamblerSlime = (this.selectedSlime === 'gambler');
        this.activeBossBlind = data.activeBossBlind || null;
        this.maxRelics = data.maxRelics || 5;
        this.purchasedVouchers = data.purchasedVouchers || [];

        this.activeRelics = [];
        if (data.activeRelics && Array.isArray(data.activeRelics)) {
          data.activeRelics.forEach(savedRelic => {
            const template = CARD_POOL.find(c => c.id === savedRelic.id);
            if (template) {
              this.activeRelics.push(template);
              if (typeof template.apply === 'function') {
                template.apply(this);
              }
            }
          });
        }
        if (data.lives) this.lives = data.lives;
        if (data.maxLives) this.maxLives = data.maxLives;

        this.loadLevel();
      } catch (e) {
        this.resetRunState();
        this.loadLevel();
      }
    }

    recordRunHistory(cleared = false) {
      const historyRaw = localStorage.getItem('munch_run_history') || '[]';
      let history = [];
      try { history = JSON.parse(historyRaw); } catch (e) { }

      const now = new Date();
      const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      const finalScore = Math.max(Math.round(this.accumulatedRunScore || 0), Math.round(this.score || 0));

      history.unshift({
        date: dateStr,
        stake: this.stake || 'white',
        ante: this.ante || 1,
        score: finalScore,
        relics: this.activeRelics.map(r => ({ icon: r.icon, id: r.id, name: r.name })),
        cleared: !!cleared,
        maxMult: Math.round(this.runMaxMult || this.mult || 1),
        kills: this.runEnemiesKilled || 0,
        pellets: this.runPelletsEaten || 0,
        slime: this.selectedSlime || 'classic'
      });

      if (history.length > 10) history.pop();
      localStorage.setItem('munch_run_history', JSON.stringify(history));
    }

    scorePop(box) {
      if (!box) return;
      box.classList.add('pop');
      setTimeout(() => box.classList.remove('pop'), 100);
    }

    addPoints(pelletType) {
      // Modificador Boss Blind: O Olho Vigilante (0 pontos se no mesmo corredor nos últimos 3s)
      if (this.activeBossBlind === 'O Olho Vigilante' && this.player) {
        const now = Date.now();
        if (!this.corridorTrail) this.corridorTrail = [];
        const isHorizontal = this.player.dir.x !== 0;
        const isVertical = this.player.dir.y !== 0;
        const inRecentCorridor = this.corridorTrail.some(entry => {
          if (now - entry.time > 3000) return false;
          if (isHorizontal && entry.row === this.player.gridY) return true;
          if (isVertical && entry.col === this.player.gridX) return true;
          return false;
        });
        this.corridorTrail.push({ row: this.player.gridY, col: this.player.gridX, time: now });
        this.corridorTrail = this.corridorTrail.filter(e => now - e.time <= 4000);

        if (inRecentCorridor) {
          this.addFloatingText(this.player.x + TILE_SIZE / 2, this.player.y - 20, 'VIGILANTE! 0 PTS', '#ff4444');
          return;
        }
      }

      let earnedChips = 0;
      let earnedMult = 0;
      let scoreColor = '#ffffff';
      let tag = '';

      let totalPellets = (parseInt(localStorage.getItem('munch_total_pellets')) || 0) + 1;
      localStorage.setItem('munch_total_pellets', totalPellets);
      this.runPelletsEaten = (this.runPelletsEaten || 0) + 1;
      if (window.MetaProgression) window.MetaProgression.addPellet();
      if (window.AchievementManager) window.AchievementManager.checkAll(false);

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

        // Relíquia Dente de Sabre: +10 fichas se em linha reta há mais de 2 segundos
        if (this.hasSaberTooth && this.player && (this.player.straightLineTimer || 0) >= 2000) {
          earnedChips += 10;
        }

        // Relíquia Fita Métrica: bônus acumulado de mult por mover sem bater
        if (this.hasTapeMeasure && this.tapeMeasureBonus > 0) {
          earnedMult += this.tapeMeasureBonus;
        }

        scoreColor = '#ffffff';
        tag = `+${earnedChips} FICHAS${earnedMult > 0 ? ` +${earnedMult.toFixed(1)} MULT` : ''}`;
        this.chips += earnedChips;
        this.mult += earnedMult;
        this.scorePop(this.chipsBox);
        if (earnedMult > 0) this.scorePop(this.multBox);
      } else if (pelletType === 3) {
        let earnedGold = 1;
        earnedChips = 0;
        earnedMult = 0;

        // Cartão Black logic (se adicionado)
        if (this.blackCardActive) {
          earnedGold += 5;
          earnedChips += 100;
        }

        if (this.activeBossBlind === 'Ouro Corrompido') {
          this.mult = Math.max(1, this.mult - 0.2);
        }

        this.gold += earnedGold;
        this.runGoldCollected = (this.runGoldCollected || 0) + earnedGold;
        this.chips += earnedChips;
        this.mult += earnedMult;

        scoreColor = '#FFE600';
        tag = `+${earnedGold} OURO${earnedChips > 0 ? ` // +${earnedChips} FICHAS` : ''}`;

        this.scorePop(this.chipsBox);
        this.scorePop(this.multBox);
      } else if (pelletType === 4) {
        earnedChips = 50;
        scoreColor = '#00E5FF';
        tag = '+50 FICHAS // EM PÂNICO!';
        this.chips += earnedChips;
        this.scorePop(this.chipsBox);

        // Pólvora Instável reduz duração em 30% (4200ms vs 6000ms)
        this.frightenedTimer = this.hasUnstableGunpowder ? 4200 : 6000;
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

      if (this.isGamblerSlime) {
        const randFactor = parseFloat((0.5 + Math.random() * 2.5).toFixed(1));
        this.mult = Math.max(1, Math.round(this.mult * randFactor));
      }

      // Relíquia Enterrada Triunfal: x2.0 Mult enquanto estiver no ar
      if (this.hasSlamDunk && this.player && this.player.isJumping) {
        this.mult = Math.round(this.mult * 2);
      }

      // Relíquia Adrenalina Pura: x2.0 Mult se estiver com 1 vida
      if (this.hasPureAdrenaline && this.lives === 1) {
        this.mult = Math.round(this.mult * 2);
      }

      // Relíquia Sombra Perversa: até x1.75 Mult baseado na proximidade traseira
      if (this.hasWickedShadow && this.wickedShadowMultBonus > 1.0) {
        this.mult = Math.round(this.mult * this.wickedShadowMultBonus);
      }

      const oldScore = this.score;
      this.score = this.chips * this.mult;
      this.runMaxMult = Math.max(this.runMaxMult || 1, this.mult);

      // Registra recorde de multiplicador máximo na rodada
      const currentMaxMult = parseInt(localStorage.getItem('munch_max_mult')) || 1;
      if (this.mult > currentMaxMult) {
        localStorage.setItem('munch_max_mult', Math.round(this.mult));
      }
      if (window.MetaProgression && window.MetaProgression.checkMult(this.mult)) {
        this.addFloatingText(this.player.x + TILE_SIZE / 2, this.player.y - 30, '★ SLIME GAMBLER DESBLOQUEADO! ★', '#FFE600');
      }

      const diff = this.score - oldScore;
      if (diff > 0 && this.player) {
        this.addFloatingText(
          this.player.x + TILE_SIZE / 2,
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

        // Exclui relíquias de efeito único já ativas
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

    createRelicCardHTML(card, isReplacementOption = false) {
      let rarityText = 'COMMON';
      if (card.rarity === 'Incomum') rarityText = 'UNCOMMON';
      else if (card.rarity === 'Rara') rarityText = 'RARE';

      let categoryText = 'ARSENAL';
      if (card.category === 'MULTIPLICADORES & PONTUAÇÃO') categoryText = 'MULTIPLIER';
      else if (card.category === 'QUEBRA DE REGRAS') categoryText = 'GAME BREAKER';
      else if (card.category === 'AÇÃO & SOBREVIVÊNCIA') categoryText = 'ARSENAL';
      else if (card.category) categoryText = card.category;

      let statBadgeHtml = '';
      if (card.id === 'relic_jump_module') {
        statBadgeHtml = `<div class="card-stat-pill blue"><span class="pill-value">+1</span> Carga de Pulo</div>`;
      } else if (card.id === 'relic_blaster_core') {
        statBadgeHtml = `<div class="card-stat-pill orange"><span class="pill-value">+1</span> Disparo</div>`;
      } else if (card.id === 'relic_overclock') {
        statBadgeHtml = `<div class="card-stat-pill cyan"><span class="pill-value">-30%</span> Cooldown</div>`;
      } else if (card.id === 'relic_backup_battery') {
        statBadgeHtml = `<div class="card-stat-pill red"><span class="pill-value">+1</span> Vida Max</div>`;
      } else if (card.id === 'relic_steel_coating') {
        statBadgeHtml = `<div class="card-stat-pill blue"><span class="pill-value">+20</span> Fichas Base</div>`;
      } else if (card.id === 'relic_sharp_drift') {
        statBadgeHtml = `<div class="card-stat-pill red"><span class="pill-value">+2</span> Mult Drift</div>`;
      } else if (card.id === 'relic_bounty_hunter') {
        statBadgeHtml = `<div class="card-stat-pill red"><span class="pill-value">+5</span> Mult Mult</div>`;
      } else if (card.id === 'relic_gold_alchemist') {
        statBadgeHtml = `<div class="card-stat-pill gold"><span class="pill-value">x1.75</span> Mult Ouro</div>`;
      } else if (card.id === 'relic_slime_puddle') {
        statBadgeHtml = `<div class="card-stat-pill teal"><span class="pill-value">-50%</span> Vel. Inimigo</div>`;
      } else if (card.id === 'relic_railgun') {
        statBadgeHtml = `<div class="card-stat-pill gold"><span class="pill-value">PERF</span> Laser Total</div>`;
      } else if (card.id === 'relic_magnetic_pull') {
        statBadgeHtml = `<div class="card-stat-pill gold"><span class="pill-value">x1.5</span> Mult Vácuo</div>`;
      }

      const formattedDesc = this.formatCardDesc(card.desc);

      return `
        <div class="relic-card-header">
          <div class="relic-card-pill">[ <span class="pill-rarity">${rarityText}</span> // <span class="pill-category">${categoryText}</span> ]</div>
        </div>
        <div class="relic-card-icon-container">
          <div class="relic-card-icon-ring">
            <div class="relic-card-icon">${card.icon}</div>
          </div>
        </div>
        <div class="relic-card-name">${card.name}</div>
        <div class="relic-card-desc-box">
          ${statBadgeHtml ? `<div class="card-stat-badge-wrapper">${statBadgeHtml}</div>` : ''}
          <div class="relic-card-desc-text">${formattedDesc}</div>
        </div>
        ${!isReplacementOption ? (() => {
          const price = this.getCardPrice(card);
          const canAfford = this.gold >= price;
          return `<div class="card-price-tag ${canAfford ? 'affordable' : 'unaffordable'}">🪙 $${price} OUROS</div>`;
        })() : ''}
        ${isReplacementOption ? `<div class="btn-replace-action">SUBSTITUIR</div>` : ''}
      `;
    }

    getCardPrice(card) {
      let base = 5;
      const r = (card.rarity || 'comum').toLowerCase();
      if (r === 'comum') base = 5;
      else if (r === 'incomum') base = 8;
      else if (r === 'rara' || r === 'lendária') base = 12;

      // Inflação contínua a partir do Nível 4 (+1 a cada 2 níveis completados)
      if (this.ante >= 4) {
        base += Math.floor((this.ante - 2) / 2);
      }

      // Relíquia Bolsa Furada: reduz o preço em 50%
      if (this.hasLeakyBag) {
        base = Math.max(1, Math.floor(base * 0.5));
      }

      return base;
    }

    getShopRerollPrice() {
      let base = 3;
      if (this.shopRerollCount === 1) base = 6;
      else if (this.shopRerollCount >= 2) base = 10;

      if (this.ante >= 4) {
        base += Math.floor((this.ante - 2) / 2);
      }
      return base;
    }

    removeRelic(id) {
      const idx = this.activeRelics.findIndex(r => r.id === id);
      if (idx !== -1) {
        const relic = this.activeRelics[idx];
        if (typeof relic.revert === 'function') {
          relic.revert(this);
        }
        this.activeRelics.splice(idx, 1);
        this.updateRelicsTray();
        this.saveActiveRunState();
      }
    }

    showReplacementUI(newCard, selectedEl, price = 0) {
      const container = document.getElementById('draftCardsContainer');
      container.innerHTML = '';
      container.closest('.draft-modal-content').classList.add('replacement-mode');

      document.querySelector('#modalDraftShop .modal-subtitle').innerText = 'LIMITE DE 5 SLOTS ATINGIDO // ESCOLHA UMA RELÍQUIA PARA SUBSTITUIR';

      this.activeRelics.forEach((relic, idx) => {
        const cardEl = document.createElement('div');
        const rarityClass = relic.rarity === 'Rara' ? 'rara' : relic.rarity.toLowerCase();
        cardEl.className = `relic-card active-relic-option ${rarityClass}`;
        cardEl.innerHTML = this.createRelicCardHTML(relic, true);

        cardEl.addEventListener('click', () => {
          this.spawnCardParticles(selectedEl || cardEl);

          if (price > 0 && this.gold >= price) {
            this.gold -= price;
            if (window.MetaProgression) window.MetaProgression.addGoldSpent(price);
            if (window.AchievementManager) window.AchievementManager.recordGoldSpent(price);
            const goldDisplay = document.getElementById('shopGoldAmount');
            if (goldDisplay) goldDisplay.innerText = this.gold.toString();
          }

          if (typeof relic.revert === 'function') relic.revert(this);

          this.recordDiscoveredRelic(newCard);
          this.activeRelics.splice(idx, 1);
          this.activeRelics.push(newCard);
          if (typeof newCard.apply === 'function') newCard.apply(this);

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
      skipBtn.innerText = 'CANCELAR E DESCARTAR NOVA COMPRA';
      skipBtn.addEventListener('click', () => {
        document.getElementById('modalDraftShop').classList.remove('visible');
        this.nextRound();
      });

      container.appendChild(skipBtn);

      this.draftSelectedIndex = 0;
      this.updateDraftFocus();
    }

    formatCardDesc(desc) {
      return desc
        .replace(/(\+?\d+\s*Fichas)/g, '<span class="highlight-chips">$1</span>')
        .replace(/(\+?\d+\s*Mult)/g, '<span class="highlight-mult">$1</span>')
        .replace(/(x\d+\.?\d*\s*Mult)/g, '<span class="highlight-xmult">$1</span>')
        .replace(/(Pulo)/g, '<span class="highlight-jump">$1</span>')
        .replace(/(Disparo)/g, '<span class="highlight-shoot">$1</span>');
    }

    // Exibe a tela da loja de relíquias e itens
    showDraftShopModal() {
      this.gameState = GAME_STATES.WIN_MODAL;
      const container = document.getElementById('draftCardsContainer');
      const vouchersContainer = document.getElementById('vouchersContainer');
      const goldDisplay = document.getElementById('shopGoldAmount');

      if (goldDisplay) goldDisplay.innerText = this.gold.toString();

      container.innerHTML = '';
      if (vouchersContainer) vouchersContainer.innerHTML = '';

      container.closest('.draft-modal-content').classList.remove('replacement-mode');
      document.querySelector('#modalDraftShop .modal-subtitle').innerText = 'LOJA ARCADE // ESCOLHA UMA RELÍQUIA OU ITEM PARA A SUA BUILD';

      // Taxa do Empréstimo Tubarão (5 moedas nas 3 primeiras lojas, ou -1 vida)
      if (this.loanSharkFeeRemaining > 0 && !this.loanSharkPaidThisVisit) {
        this.loanSharkFeeRemaining--;
        this.loanSharkPaidThisVisit = true;
        if (this.gold >= 5) {
          this.gold -= 5;
          if (this.player) this.addFloatingText(this.player.x + TILE_SIZE / 2, this.player.y - 30, '🦈 TAXA DO TUBARÃO: -5 OUROS', '#ff4444');
        } else {
          this.lives = Math.max(1, this.lives - 1);
          if (this.player) this.addFloatingText(this.player.x + TILE_SIZE / 2, this.player.y - 30, '🦈 TUBARÃO COBROU COM SANGUE! -1 VIDA', '#ff0055');
          this.updateHUD();
        }
        if (goldDisplay) goldDisplay.innerText = this.gold.toString();
      }

      // Sorteia 2 opções de relíquias
      const card1 = this.getWeightedRandomCard([]);
      const card2 = this.getWeightedRandomCard(card1 ? [card1] : []);

      const selectedCards = [];
      if (card1) selectedCards.push(card1);
      if (card2) selectedCards.push(card2);

      selectedCards.forEach(card => {
        const cardEl = document.createElement('div');
        const rarityClass = card.rarity === 'Rara' ? 'rara' : card.rarity.toLowerCase();
        cardEl.className = `relic-card ${rarityClass}`;

        cardEl.innerHTML = this.createRelicCardHTML(card, false);

        // Efeito de inclinação 3D no mouse
        let isTicking = false;
        cardEl.addEventListener('mousemove', (e) => {
          if (isTicking) return;
          isTicking = true;
          const rect = cardEl.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          requestAnimationFrame(() => {
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateY = ((x - centerX) / centerX) * 12;
            const rotateX = ((centerY - y) / centerY) * 12;
            cardEl.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.04) translateZ(0)`;

            const pctX = (x / rect.width) * 100;
            const pctY = (y / rect.height) * 100;
            cardEl.style.setProperty('--sheen-x', `${pctX}%`);
            cardEl.style.setProperty('--sheen-y', `${pctY}%`);
            isTicking = false;
          });
        });

        cardEl.addEventListener('mouseleave', () => {
          cardEl.style.transform = 'perspective(600px) rotateX(0) rotateY(0) scale(1) translateZ(0)';
          cardEl.style.setProperty('--sheen-x', '50%');
          cardEl.style.setProperty('--sheen-y', '50%');
        });

        cardEl.addEventListener('click', () => {
          this.selectDraftCard(card, cardEl);
        });

        container.appendChild(cardEl);
      });

      this.renderVouchers();

      // Botão para avançar sem comprar relíquia
      const btnSkip = document.getElementById('btnSkipShop');
      if (btnSkip) {
        btnSkip.onclick = () => {
          document.getElementById('modalDraftShop').classList.remove('visible');
          this.nextRound();
        };
      }

      document.getElementById('modalDraftShop').classList.add('visible');

      this.draftSelectedIndex = 0;
      this.updateDraftFocus();
    }

    renderVouchers() {
      const vContainer = document.getElementById('vouchersContainer');
      if (!vContainer) return;
      vContainer.innerHTML = '';

      const inflation = this.ante >= 4 ? Math.floor((this.ante - 2) / 2) : 0;
      const rerollPrice = this.getShopRerollPrice();
      const healPrice = 7 + inflation;
      const rechargePrice = 15 + inflation;

      const vouchers = [
        { id: 'v_reroll', name: 'REROLL DA LOJA', price: rerollPrice, desc: `Substitui por 2 novas opções (${(this.shopRerollCount || 0) + 1}º reroll).`, oneTime: false },
        { id: 'v_heal', name: 'CURA (+1 VIDA)', price: healPrice, desc: 'Recupera 1 vida perdida até a vida máxima.', oneTime: false },
        { id: 'v_recharge', name: 'BOLSA DE RECARGA', price: rechargePrice, desc: 'Inicia o próximo estágio com Pulo e Tiro em 100%.', oneTime: true }
      ];

      vouchers.forEach((v) => {
        const vEl = document.createElement('div');
        vEl.className = 'voucher-card';
        if (this.purchasedVouchers && this.purchasedVouchers.includes(v.id) && v.oneTime) {
          vEl.classList.add('purchased');
        }

        vEl.innerHTML = `
          <div class="voucher-header">
            <span class="voucher-name">${v.name}</span>
            <span class="voucher-price">$${v.price} Ouros</span>
          </div>
          <div class="voucher-desc">${v.desc}</div>
        `;

        vEl.addEventListener('click', () => {
          if (vEl.classList.contains('purchased')) return;
          if (this.gold >= v.price) {
            this.gold -= v.price;
            if (window.MetaProgression) window.MetaProgression.addGoldSpent(v.price);
            if (window.AchievementManager) window.AchievementManager.recordGoldSpent(v.price);
            const goldDisplay = document.getElementById('shopGoldAmount');
            if (goldDisplay) goldDisplay.innerText = this.gold.toString();

            this.buyVoucher(v.id);
            if (v.oneTime) {
              if (!this.purchasedVouchers) this.purchasedVouchers = [];
              this.purchasedVouchers.push(v.id);
              vEl.classList.add('purchased');
            }
          } else {
            // Efeito visual de erro caso falte ouro
            vEl.style.borderColor = 'var(--red-primary)';
            vEl.style.transform = 'translateX(-5px)';
            setTimeout(() => { vEl.style.transform = 'translateX(5px)'; }, 50);
            setTimeout(() => { vEl.style.transform = 'translateX(0)'; vEl.style.borderColor = ''; }, 100);
          }
        });

        vContainer.appendChild(vEl);
      });
    }

    buyVoucher(id) {
      if (id === 'v_reroll') {
        this.shopRerollCount = (this.shopRerollCount || 0) + 1;
        this.showDraftShopModal();
      } else if (id === 'v_heal') {
        if (this.lives < this.maxLives) {
          this.lives++;
          this.updateHUD();
          if (this.player) this.addFloatingText(this.player.x + TILE_SIZE / 2, this.player.y - 25, '❤️ +1 VIDA RECUPERADA!', '#00FF66');
        } else {
          if (this.player) this.addFloatingText(this.player.x + TILE_SIZE / 2, this.player.y - 25, 'VIDA JÁ NO MÁXIMO!', '#FFE600');
        }
      } else if (id === 'v_recharge') {
        this.buyRecharge = true;
      }
    }

    getBossBlindDescription(bossName) {
      const descs = {
        'O Silenciador': 'A 1ª relíquia equipada no inventário está desativada!',
        'Paredes Falsas': 'A cada 15s, 2 corredores são bloqueados por espinhos por 5s!',
        'O Olho Vigilante': 'Devorar no mesmo corredor dos últimos 3s rende 0 pontos!',
        'Vácuo de Moedas': 'Sem moedas físicas no mapa e meta de pontuação +15%!',
        'Inimigo Fantasma': 'Um perseguidor fica invisível com olhos espreitantes e +10% vel!'
      };
      return descs[bossName] || 'Modificador de Chefe Ativo!';
    }

    playSFX(type) {
      try {
        const volumeFactor = window.AudioManager ? window.AudioManager.getEffectiveSFXVolume() : (() => {
          const sfxVol = parseInt(localStorage.getItem('munch_audio_sfx'));
          return isNaN(sfxVol) ? 1.0 : (sfxVol / 100);
        })();
        if (volumeFactor <= 0) return;

        const ctx = window.AudioManager ? window.AudioManager.getAudioContext() : (window.AudioContext || window.webkitAudioContext ? new (window.AudioContext || window.webkitAudioContext)() : null);
        if (!ctx) return;
        const destination = (window.AudioManager && window.AudioManager.sfxGainNode) ? window.AudioManager.sfxGainNode : ctx.destination;

        if (type === 'target_cleared') {
          const notes = [
            { freq: 587.33, time: 0.0, dur: 0.08 },
            { freq: 880.00, time: 0.09, dur: 0.10 },
            { freq: 1174.66, time: 0.20, dur: 0.35 }
          ];
          notes.forEach(n => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(n.freq, ctx.currentTime + n.time);
            gain.gain.setValueAtTime(0, ctx.currentTime + n.time);
            gain.gain.linearRampToValueAtTime(0.25 * volumeFactor, ctx.currentTime + n.time + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + n.time + n.dur);
            osc.connect(gain);
            gain.connect(destination);
            osc.start(ctx.currentTime + n.time);
            osc.stop(ctx.currentTime + n.time + n.dur + 0.05);
          });
        } else if (type === 'boss_alert') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(220, ctx.currentTime);
          osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.35);
          gain.gain.setValueAtTime(0.3 * volumeFactor, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
          osc.connect(gain);
          gain.connect(destination);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.45);
        } else if (type === 'toast') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1046.5, ctx.currentTime);
          osc.frequency.linearRampToValueAtTime(1318.5, ctx.currentTime + 0.12);
          gain.gain.setValueAtTime(0.2 * volumeFactor, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
          osc.connect(gain);
          gain.connect(destination);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.3);
        }
      } catch (e) {}
    }

    showStageGoalAlert(text) {
      const alertEl = document.getElementById('stageGoalAlert');
      if (!alertEl) return;
      const textEl = alertEl.querySelector('.stage-goal-alert-text');
      if (textEl) textEl.innerText = text;
      alertEl.style.display = 'block';
      alertEl.style.opacity = '1';

      setTimeout(() => {
        alertEl.style.transition = 'opacity 0.25s ease';
        alertEl.style.opacity = '0';
        setTimeout(() => {
          alertEl.style.display = 'none';
          alertEl.style.transition = '';
        }, 250);
      }, 500);
    }

    showToast(title, desc = '', icon = '✨', color = '#FFE600') {
      let container = document.getElementById('inGameToastContainer');
      if (!container) {
        container = document.createElement('div');
        container.id = 'inGameToastContainer';
        container.className = 'in-game-toast-container';
        document.body.appendChild(container);
      }

      const toast = document.createElement('div');
      toast.className = 'in-game-toast';
      toast.style.borderColor = color;
      toast.style.boxShadow = `0 0 15px ${color}55`;
      toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <div class="toast-body">
          <div class="toast-title" style="color: ${color};">${title}</div>
          ${desc ? `<div class="toast-desc">${desc}</div>` : ''}
        </div>
      `;
      container.appendChild(toast);
      this.playSFX('toast');

      setTimeout(() => {
        toast.style.transition = 'all 0.4s ease';
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        setTimeout(() => {
          if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 400);
      }, 3000);
    }

    recordDiscoveredRelic(card) {
      if (!card || !card.id) return;
      const discoveredRaw = localStorage.getItem('munch_discovered_relics') || '[]';
      let discovered = [];
      try { discovered = JSON.parse(discoveredRaw); } catch (e) { discovered = []; }

      const unlockedRaw = localStorage.getItem('unlockedRelics') || '[]';
      let unlocked = [];
      try { unlocked = JSON.parse(unlockedRaw); } catch (e) { unlocked = []; }

      const isNew = !discovered.includes(card.id) && !unlocked.includes(card.id);

      if (isNew) {
        discovered.push(card.id);
        localStorage.setItem('munch_discovered_relics', JSON.stringify(discovered));

        unlocked.push(card.id);
        localStorage.setItem('unlockedRelics', JSON.stringify(unlocked));

        if (window.MetaProgression && typeof window.MetaProgression.discoverRelic === 'function') {
          window.MetaProgression.discoverRelic(card.id);
        }
        if (window.AchievementManager) window.AchievementManager.checkAll(false);

        this.showToast('NOVA RELÍQUIA REGISTRADA NO ÁLBUM!', card.name, card.icon, '#FFE600');
      }
    }

    showBossBlindBanner(bossName) {
      const banner = document.getElementById('bossBlindBanner');
      const nameEl = document.getElementById('bossBlindAlertName');
      const descEl = document.getElementById('bossBlindAlertDesc');
      if (!banner || !nameEl || !descEl) return;

      const desc = this.getBossBlindDescription(bossName);
      nameEl.innerText = bossName.toUpperCase();
      descEl.innerText = desc;
      banner.style.display = 'flex';
      banner.style.opacity = '1';

      this.playSFX('boss_alert');

      setTimeout(() => {
        banner.style.opacity = '0';
        banner.style.transition = 'opacity 0.5s ease';
        setTimeout(() => {
          banner.style.display = 'none';
          banner.style.opacity = '1';
          banner.style.transition = '';
        }, 500);
      }, 3000);
    }

    updateDraftFocus() {
      const interactables = Array.from(document.querySelectorAll('#draftCardsContainer .relic-card, #draftCardsContainer .btn-discard-new'));
      interactables.forEach((el, index) => {
        if (index === this.draftSelectedIndex) {
          el.classList.add('keyboard-focus');
        } else {
          el.classList.remove('keyboard-focus');
        }
      });
    }

    selectDraftCard(card, cardEl) {
      const price = this.getCardPrice(card);
      if (this.gold < price) {
        cardEl.style.borderColor = 'var(--red-primary)';
        cardEl.style.transform = 'translateX(-5px)';
        setTimeout(() => { cardEl.style.transform = 'translateX(5px)'; }, 50);
        setTimeout(() => { cardEl.style.transform = 'translateX(0)'; cardEl.style.borderColor = ''; }, 100);
        return;
      }

      // Limite estrito de exatamente 5 slots
      if (this.activeRelics.length >= 5) {
        this.showReplacementUI(card, cardEl, price);
        return;
      }

      this.gold -= price;
      if (window.MetaProgression) window.MetaProgression.addGoldSpent(price);
      if (window.AchievementManager) window.AchievementManager.recordGoldSpent(price);
      const goldDisplay = document.getElementById('shopGoldAmount');
      if (goldDisplay) goldDisplay.innerText = this.gold.toString();

      this.spawnCardParticles(cardEl);

      // Adiciona relíquia descoberta no compêndio
      this.recordDiscoveredRelic(card);

      this.activeRelics.push(card);
      if (typeof card.apply === 'function') card.apply(this);

      // Slot de destino para a animação
      const slotIndex = this.activeRelics.length - 1;
      const targetSlot = document.getElementById('relicsTray').children[slotIndex] || document.getElementById('relicsTray');

      this.animateCardToTray(cardEl, targetSlot, () => {
        document.getElementById('modalDraftShop').classList.remove('visible');
        this.triggerScreenShake(8);
        this.updateRelicsTray();
        this.saveActiveRunState();
        this.nextRound();
      });
    }

    playVictoryFanfare() {
      try {
        const volumeFactor = window.AudioManager ? window.AudioManager.getEffectiveSFXVolume() : (() => {
          const sfxVol = parseInt(localStorage.getItem('munch_audio_sfx'));
          return isNaN(sfxVol) ? 1.0 : (sfxVol / 100);
        })();
        if (volumeFactor <= 0) return;

        const ctx = window.AudioManager ? window.AudioManager.getAudioContext() : (window.AudioContext || window.webkitAudioContext ? new (window.AudioContext || window.webkitAudioContext)() : null);
        if (!ctx) return;
        const destination = (window.AudioManager && window.AudioManager.sfxGainNode) ? window.AudioManager.sfxGainNode : ctx.destination;

        const notes = [
          { freq: 523.25, time: 0.0, dur: 0.12 }, // C5
          { freq: 659.25, time: 0.14, dur: 0.12 }, // E5
          { freq: 783.99, time: 0.28, dur: 0.14 }, // G5
          { freq: 1046.50, time: 0.44, dur: 0.60 }, // C6
          { freq: 783.99, time: 0.48, dur: 0.55 }, // G5 (harmonia)
          { freq: 1318.51, time: 0.54, dur: 0.50 }  // E6 (brilho)
        ];

        notes.forEach(n => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(n.freq, ctx.currentTime + n.time);

          gain.gain.setValueAtTime(0, ctx.currentTime + n.time);
          gain.gain.linearRampToValueAtTime(0.25 * volumeFactor, ctx.currentTime + n.time + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + n.time + n.dur);

          osc.connect(gain);
          gain.connect(destination);

          osc.start(ctx.currentTime + n.time);
          osc.stop(ctx.currentTime + n.time + n.dur + 0.05);
        });
      } catch (e) {
        console.warn('[MUNCH] Fanfarra de vitória indisponível:', e);
      }
    }

    triggerRunCleared() {
      this.hasShownVictoryModal = true;
      this.runCleared = true;
      this.gameState = GAME_STATES.RUN_CLEARED;
      this.isVictoryPaused = true;

      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }

      this.playVictoryFanfare();

      const finalScore = Math.max(Math.round(this.accumulatedRunScore || 0), Math.round(this.score || 0));

      // 1. Selo da Dificuldade
      let stakeText = '⚪ FICHA BRANCA CONCLUÍDA';
      let stakeClass = 'white-stake';
      if (this.stake === 'red') {
        stakeText = '🔴 FICHA VERMELHA CONCLUÍDA';
        stakeClass = 'red-stake';
      } else if (this.stake === 'gold') {
        stakeText = '🟡 FICHA DOURADA CONCLUÍDA';
        stakeClass = 'gold-stake';
      }
      const stakeBadge = document.getElementById('victoryStakeBadge');
      if (stakeBadge) {
        stakeBadge.innerText = stakeText;
        stakeBadge.className = `victory-stake-badge ${stakeClass}`;
      }

      // 2. Pontuação Final
      const scoreEl = document.getElementById('victoryFinalScore');
      if (scoreEl) scoreEl.innerText = finalScore.toLocaleString();

      // 3. Maior Mult
      const multEl = document.getElementById('victoryMaxMult');
      if (multEl) multEl.innerText = `x${Math.round(this.runMaxMult || this.mult || 1)}`;

      // 4. Inimigos / Pastilhas
      const kpEl = document.getElementById('victoryKillsPellets');
      if (kpEl) kpEl.innerText = `${(this.runEnemiesKilled || 0).toLocaleString()} / ${(this.runPelletsEaten || 0).toLocaleString()}`;

      // 5. Slime Utilizado
      const slimeMap = {
        classic: '🟢 Slime Clássico',
        metallic: '🟩 Slime Mercenário',
        ballistic: '🔴 Slime Balístico',
        gambler: '🟡 Slime Gambler'
      };
      const slimeEl = document.getElementById('victorySlimeUsed');
      if (slimeEl) slimeEl.innerText = slimeMap[this.selectedSlime] || '🟢 Slime Clássico';

      // 6. Relíquias Equipadas
      const relicsContainer = document.getElementById('victoryRelicsList');
      if (relicsContainer) {
        relicsContainer.innerHTML = '';
        if (this.activeRelics && this.activeRelics.length > 0) {
          this.activeRelics.forEach(r => {
            const item = document.createElement('div');
            const rarity = (r.rarity || 'comum').toLowerCase();
            item.className = `victory-relic-item rarity-${rarity}`;
            item.innerHTML = `<span class="relic-item-icon">${r.icon || '🃏'}</span> <span class="relic-item-name">${r.name}</span>`;
            relicsContainer.appendChild(item);
          });
        } else {
          relicsContainer.innerHTML = '<span style="color:#666; font-size:11px;">Nenhuma relíquia equipada</span>';
        }
      }

      // 7. Apelido
      const nameInput = document.getElementById('victoryPlayerName');
      if (nameInput) {
        nameInput.value = localStorage.getItem('munch_last_player_name') || '';
      }
      const statusEl = document.getElementById('victorySubmitStatus');
      if (statusEl) statusEl.innerText = '';

      if (this.modalRunCleared) {
        this.modalRunCleared.classList.add('visible');
      }
    }

    nextRound() {
      this.phase++;
      this.blind++;
      if (this.blind > 3) {
        this.blind = 1;
        this.ante++;
      }

      // Boss Blinds sorteado no Estágio 3 (Chefão) de cada ciclo
      if (this.blind === 3) {
        const bosses = ['O Silenciador', 'Paredes Falsas', 'O Olho Vigilante', 'Vácuo de Moedas', 'Inimigo Fantasma'];
        this.activeBossBlind = bosses[Math.floor(Math.random() * bosses.length)];
      } else {
        this.activeBossBlind = null;
      }

      if (this.ante > 8 && !this.isEndless && !this.hasShownVictoryModal) {
        // Run concluída com vitória total no Ante 8
        this.triggerRunCleared();
        return;
      }

      this.gameState = GAME_STATES.PLAYING;
      this.loadLevel();
    }

    async triggerGameOver() {
      // Diferenciação estrita: tela de Game Over só aparece se vidas chegarem a 0
      if (this.lives > 0) return;

      this.gameState = GAME_STATES.GAME_OVER;
      this.triggerScreenShake(16);

      let totalAntes = parseInt(localStorage.getItem('munch_total_antes')) || 0;
      localStorage.setItem('munch_total_antes', totalAntes + 1);

      this.recordRunHistory(this.runCleared);
      localStorage.removeItem('munch_active_run');

      const finalScore = Math.max(Math.round(this.accumulatedRunScore || 0), Math.round(this.score || 0));
      const previousRecord = (this.initialRunRecord !== undefined) ? this.initialRunRecord : (parseInt(localStorage.getItem('munch_best_round_score')) || 0);
      const isNewRecord = finalScore > previousRecord;
      if (isNewRecord) {
        localStorage.setItem('munch_best_round_score', finalScore);
      }

      // Elementos visuais da tela de Game Over
      const titleEl = document.getElementById('gameOverTitle');
      const subtitleEl = document.getElementById('gameOverSubtitle');
      const badgeEl = document.getElementById('gameOverHeaderBadge');
      const rowPersonalBest = document.getElementById('rowPersonalBest');
      const stageEl = document.getElementById('loseModalStage');
      const goldEl = document.getElementById('loseModalGold');
      const killsPelletsEl = document.getElementById('loseModalKillsPellets');
      const relicsListEl = document.getElementById('loseModalRelicsList');

      // Diferenciação estrita: Modo Normal vs Modo Sem Fim (Endless)
      if (this.isEndless || this.ante >= 9) {
        if (titleEl) {
          titleEl.innerText = 'RUN FINALIZADA // MODO SEM FIM';
          titleEl.className = 'modal-title endless-game-over';
        }
        if (subtitleEl) {
          subtitleEl.innerText = 'Você levou sua build ao limite absoluto no labirinto infinito!';
        }
        if (badgeEl) {
          badgeEl.style.display = 'block';
          badgeEl.innerText = `🔥 NÍVEL MÁXIMO ATINGIDO: NÍVEL ${this.ante} // ESTÁGIO ${this.blind} 🔥`;
        }
      } else {
        if (titleEl) {
          titleEl.innerText = 'FIM DE JOGO';
          titleEl.className = 'modal-title lose';
        }
        if (subtitleEl) {
          subtitleEl.innerText = 'Seu slime sucumbiu aos corredores do labirinto. Tente novamente!';
        }
        if (badgeEl) {
          badgeEl.style.display = 'none';
        }
      }

      // Pontuação e recorde pessoal
      const scoreEl = document.getElementById('loseModalScore');
      if (scoreEl) scoreEl.innerText = finalScore.toLocaleString();

      if (rowPersonalBest) {
        rowPersonalBest.style.display = isNewRecord ? 'flex' : 'none';
      }

      // Ponto da derrota (Nível e Estágio)
      if (stageEl) {
        const blindName = this.blind === 3 ? 'CHEFÃO' : `ESTÁGIO ${this.blind}`;
        stageEl.innerText = `NÍVEL ${this.ante} // ${blindName}`;
      }

      // Total de moedas coletadas na run
      if (goldEl) {
        goldEl.innerText = (this.runGoldCollected || this.gold || 0).toString();
      }

      // Inimigos devorados e pastilhas
      if (killsPelletsEl) {
        killsPelletsEl.innerText = `${this.runEnemiesKilled || 0} / ${this.runPelletsEaten || 0}`;
      }

      // 5 Relíquias equipadas no momento da derrota
      if (relicsListEl) {
        relicsListEl.innerHTML = '';
        if (this.activeRelics && this.activeRelics.length > 0) {
          this.activeRelics.forEach(relic => {
            const rItem = document.createElement('div');
            const rarityClass = relic.rarity === 'Rara' ? 'rara' : relic.rarity.toLowerCase();
            rItem.className = `relic-mini-badge ${rarityClass}`;
            rItem.innerHTML = `
              <span class="mini-icon">${relic.icon}</span>
              <span class="mini-name">${relic.name}</span>
            `;
            relicsListEl.appendChild(rItem);
          });
        } else {
          relicsListEl.innerHTML = '<span style="font-size:9px; color:#666; font-family:\'Press Start 2P\', monospace;">NENHUMA RELÍQUIA EQUIPADA</span>';
        }
      }

      const submitBox = document.querySelector('.leaderboard-submit-box');
      const btnSubmitScore = document.getElementById('btnSubmitScore');
      const lblSubmitStatus = document.getElementById('lblSubmitStatus');

      // Verifica se a pontuação entra no Top 5 de Todos os Tempos na categoria atual
      const lb = window.MunchLeaderboard || (typeof MunchLeaderboard !== 'undefined' ? MunchLeaderboard : null);
      const isTop5 = lb ? await lb.isTop5(this.stake || 'white', finalScore) : false;

      if (submitBox) {
        if (isTop5) {
          let stakeLabel = 'FICHA BRANCA';
          if (this.stake === 'red') stakeLabel = 'FICHA VERMELHA';
          if (this.stake === 'gold') stakeLabel = 'FICHA DOURADA';

          submitBox.style.display = 'block';
          if (btnSubmitScore) btnSubmitScore.disabled = false;
          if (lblSubmitStatus) {
            lblSubmitStatus.innerText = `🎉 NOVO TOP 5 GLOBAL NA ${stakeLabel}!`;
            lblSubmitStatus.style.color = '#FFE600';
          }
        } else {
          submitBox.style.display = 'none';
        }
      }

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
      this.stageDamageTaken = true;

      // Cofrinho de Cerâmica: quebra se sofrer dano, concede todas as moedas e se destrói
      if (this.hasPiggyBank) {
        const brokenCoins = this.piggyBankCoins || 0;
        this.gold += brokenCoins;
        this.runGoldCollected = (this.runGoldCollected || 0) + brokenCoins;
        this.addFloatingText(this.player.x + TILE_SIZE / 2, this.player.y - 25, `🐷 COFRINHO QUEBROU! +${brokenCoins} MOEDAS`, '#FFB703');
        this.removeRelic('relic_piggy_bank');
        this.piggyBankCoins = 0;
      }

      this.lives--;
      this.triggerScreenShake(14);

      this.spawnDust(this.player.x + TILE_SIZE / 2, this.player.y + TILE_SIZE / 2, 12, '#FF2E2E');

      if (this.lives <= 0) {
        this.triggerGameOver();
      } else {
        const startX = Math.floor(GRID_WIDTH / 2) - 1;
        const startY = Math.floor(GRID_HEIGHT / 2) + 1;
        this.player.resetPosition(startX, startY);

        // Reseta inimigos nos cantos
        const spawnCoords = [
          { x: 2, y: 2 },
          { x: GRID_WIDTH - 3, y: 2 },
          { x: 2, y: GRID_HEIGHT - 3 },
          { x: GRID_WIDTH - 3, y: GRID_HEIGHT - 3 }
        ];
        this.ghosts.forEach((g, i) => {
          if (g) {
            const coord = spawnCoords[i % spawnCoords.length];
            g.resetPosition(coord.x, coord.y);
          }
        });

        this.spawnProtectionTimer = 1200; // Imunidade ao renascer
      }
      this.updateHUD();
    }

    eatGhost(ghost) {
      ghost.state = 'eaten';

      let totalKills = (parseInt(localStorage.getItem('munch_total_kills')) || 0) + 1;
      localStorage.setItem('munch_total_kills', totalKills);
      this.runEnemiesKilled = (this.runEnemiesKilled || 0) + 1;
      if (window.MetaProgression && window.MetaProgression.addKills(1)) {
        this.addFloatingText(this.player.x + TILE_SIZE / 2, this.player.y - 35, '★ SLIME BALÍSTICO DESBLOQUEADO! ★', '#00FF66');
      }
      if (window.AchievementManager) window.AchievementManager.checkAll(false);

      const ghostBaseScore = 200;
      const ghostBaseMult = 2;

      this.chips += ghostBaseScore;
      this.mult += ghostBaseMult;
      this.runMaxMult = Math.max(this.runMaxMult || 1, this.mult);
      if (window.MetaProgression && window.MetaProgression.checkMult(this.mult)) {
        this.addFloatingText(this.player.x + TILE_SIZE / 2, this.player.y - 50, '★ SLIME GAMBLER DESBLOQUEADO! ★', '#FFE600');
      }

      // Relíquia Pólvora Instável: devora pastilhas normais em raio de 3 blocos
      if (this.hasUnstableGunpowder) {
        const centerCol = Math.floor((ghost.x + TILE_SIZE / 2) / TILE_SIZE);
        const centerRow = Math.floor((ghost.y + TILE_SIZE / 2) / TILE_SIZE);
        let devoured = 0;
        for (let r = centerRow - 3; r <= centerRow + 3; r++) {
          for (let c = centerCol - 3; c <= centerCol + 3; c++) {
            if (r >= 0 && r < GRID_HEIGHT && c >= 0 && c < GRID_WIDTH) {
              const d = Math.hypot(c - centerCol, r - centerRow);
              if (d <= 3.2 && this.map[r][c] === 2) {
                this.map[r][c] = 0;
                devoured++;
                this.remainingPellets--;
                this.chips += 10 + (this.pelletChipBonus || 0);
              }
            }
          }
        }
        if (devoured > 0) {
          this.triggerScreenShake(8);
          this.addFloatingText(ghost.x + TILE_SIZE / 2, ghost.y - 30, `💥 PÓLVORA! +${devoured} PASTILHAS`, '#ff4400');
        }
      }

      const oldScore = this.score;
      this.score = this.chips * this.mult;
      const diff = this.score - oldScore;

      this.triggerScreenShake(6);
      this.spawnDust(ghost.x + TILE_SIZE / 2, ghost.y + TILE_SIZE / 2, 15, '#ffffff');

      this.addFloatingText(
        ghost.x + TILE_SIZE / 2,
        ghost.y,
        `DEVORADO! +${Math.round(diff).toLocaleString()}`,
        '#00E5FF',
        `+200 Fichas x2 Mult`
      );

      if (this.hasAdrenaline) this.adrenalineTimer = 3000;

      if (this.infiniteBattery) {
        if (this.infiniteBatteryWindow > 0) {
          if (this.blasterMaxCharges > 0) {
            this.blasterCharges = Math.min(this.blasterMaxCharges, this.blasterCharges + 1);
            this.addFloatingText(this.player.x + TILE_SIZE / 2, this.player.y - 20, 'RECARGA!', '#FFE600');
          }
          this.infiniteBatteryWindow = 0; // reset
        } else {
          this.infiniteBatteryWindow = 1500;
        }
      }

      this.updateHUD();
      this.checkWinCondition();
    }

    update(dt) {
      // Atualiza onda de choque
      if (this.overchargeShockwave && this.overchargeShockwave.active) {
        this.overchargeShockwave.radius += this.overchargeShockwave.speed * dt;
        if (this.overchargeShockwave.radius >= this.overchargeShockwave.maxRadius) {
          this.overchargeShockwave.active = false;
          this.overchargeShockwave = null;
        }
      }

      // Pequena pausa ao completar a fase
      if (this.gameState === GAME_STATES.PHASE_CLEAR) {
        this.phaseClearTimer -= dt;
        // Mantém animações rodando na pausa
        this.particles.forEach(p => { if (p) p.update(dt); });
        this.particles = this.particles.filter(p => p && p.active && !p.toRemove);
        if (this.phaseClearTimer <= 0) {
          // Checagem de vitória de fim de run: Nível 8 Estágio 3
          if (this.ante === 8 && this.blind === 3 && !this.isEndless && !this.hasShownVictoryModal) {
            this.triggerRunCleared();
            return;
          }

          this.gameState = GAME_STATES.WIN_MODAL;
          document.getElementById('winModalScore').innerText = Math.round(this.score).toLocaleString();
          document.getElementById('winModalTarget').innerText = Math.round(this.targetScore).toLocaleString();
          document.getElementById('winModalGold').innerText = this.gold.toString();
          this.modalWin.classList.add('visible');
        }
        return;
      }

      if (this.gameState !== GAME_STATES.PLAYING) return;

      if (this.landingBoostTimer > 0) this.landingBoostTimer -= dt;
      if (this.adrenalineTimer > 0) this.adrenalineTimer -= dt;
      if (this.infiniteBatteryWindow > 0) this.infiniteBatteryWindow -= dt;

      // Boss Blind: Paredes Falsas (bloqueia 2 corredores a cada 15s por 5s)
      if (this.activeBossBlind === 'Paredes Falsas') {
        if (this.fakeWallsDurationTimer > 0) {
          this.fakeWallsDurationTimer -= dt;
          if (this.fakeWallsDurationTimer <= 0) {
            this.activeFakeWalls = [];
            this.fakeWallsCooldownTimer = 15000;
          }
        } else {
          this.fakeWallsCooldownTimer -= dt;
          if (this.fakeWallsCooldownTimer <= 0) {
            this.fakeWallsDurationTimer = 5000;
            this.activeFakeWalls = [];
            const candidates = [];
            for (let r = 1; r < GRID_HEIGHT - 1; r++) {
              for (let c = 1; c < GRID_WIDTH - 1; c++) {
                if (this.map[r][c] !== 1) {
                  if (this.player && this.player.gridX === c && this.player.gridY === r) continue;
                  if (r >= 8 && r <= 14 && c >= 7 && c <= 15) continue;
                  candidates.push({ r, c });
                }
              }
            }
            if (candidates.length >= 2) {
              for (let i = 0; i < 2; i++) {
                const idx = Math.floor(Math.random() * candidates.length);
                this.activeFakeWalls.push(candidates.splice(idx, 1)[0]);
              }
            }
            this.triggerScreenShake(4);
            if (this.player) {
              this.addFloatingText(this.player.x + TILE_SIZE / 2, this.player.y - 15, '⚠️ PAREDES FALSAS ATIVADAS!', '#ff0055');
            }
          }
        }
      }

      // Relíquia Bolsa Furada: perde 1 moeda a cada 8s sem pastilha especial ativa
      if (this.hasLeakyBag) {
        if (this.frightenedTimer <= 0) {
          this.leakyBagTimer = (this.leakyBagTimer || 0) + dt;
          if (this.leakyBagTimer >= 8000) {
            this.leakyBagTimer = 0;
            if (this.gold > 0) {
              this.gold--;
              this.updateHUD();
              if (this.player) {
                this.addFloatingText(this.player.x + TILE_SIZE / 2, this.player.y - 18, '👜 -1 MOEDA (BOLSA FURADA)', '#ff5555');
              }
            }
          }
        } else {
          this.leakyBagTimer = 0;
        }
      }

      if (this.ante >= 4) {
        this.laserWallTimer -= dt;
        if (this.laserWallTimer <= 0) {
          this.laserWallTimer = 4000;
          this.laserWallActive = !this.laserWallActive;
          this.triggerScreenShake(2);
        }

        if (this.laserWallActive && this.player && this.map[this.player.gridY][this.player.gridX] === 5) {
          this.hurtPlayer();
        }
      }

      // Proteção temporária após spawnar
      if (this.spawnProtectionTimer > 0) {
        this.spawnProtectionTimer -= dt;
        if (this.player) this.player.update(dt, this);
        return;
      }

      // Cooldown do pulo
      if (this.vaultMaxCharges > 0 && this.vaultCharges < this.vaultMaxCharges) {
        this.vaultCooldown += dt;
        const currentMaxCld = this.vaultMaxCooldown * (this.cooldownMultiplier || 1.0);
        if (this.vaultCooldown >= currentMaxCld) {
          this.vaultCharges++;
          this.vaultCooldown = 0;
        }
      }

      // Cooldown do disparo
      if (this.blasterMaxCharges > 0 && this.blasterCharges < this.blasterMaxCharges) {
        this.blasterCooldown += dt;
        const currentMaxCld = this.blasterMaxCooldown * (this.cooldownMultiplier || 1.0);
        if (this.blasterCooldown >= currentMaxCld) {
          this.blasterCharges++;
          this.blasterCooldown = 0;
        }
      }

      // Atualiza poças de lodo no chão
      if (this.stickyPools) {
        this.stickyPools.forEach(p => p.update(dt));
        this.stickyPools = this.stickyPools.filter(p => p.timeLeft > 0);
      }

      // Temporizador de pânico dos inimigos
      if (this.frightenedTimer > 0) {
        this.frightenedTimer -= dt;
        if (this.frightenedTimer <= 0) {
          this.ghosts.forEach(g => {
            if (g && g.state === 'frightened') g.state = 'normal';
          });
        }
      }

      // Atualiza jogador
      if (this.player) {
        this.player.update(dt, this);
      }

      // Atualiza projéteis
      this.projectiles.forEach(proj => {
        if (proj) proj.update(dt, this);
      });
      this.projectiles = this.projectiles.filter(proj => proj && proj.active && !proj.toRemove);

      // Atualiza inimigos
      this.ghosts.forEach(ghost => {
        if (ghost) ghost.update(dt, this);
      });
      this.ghosts = this.ghosts.filter(ghost => ghost && !ghost.toRemove);

      // Relíquia Sombra Perversa: cálculo de proximidade e derrota pelas costas
      if (this.hasWickedShadow && this.player) {
        let maxProxBonus = 1.0;
        const pDir = this.player.dir;
        if (pDir && (pDir.x !== 0 || pDir.y !== 0)) {
          const backX = -pDir.x;
          const backY = -pDir.y;
          const px = this.player.x + TILE_SIZE / 2;
          const py = this.player.y + TILE_SIZE / 2;

          for (const ghost of this.ghosts) {
            if (!ghost || ghost.state === 'eaten' || ghost.state === 'respawning' || ghost.state === 'frightened') continue;
            const gx = ghost.x + TILE_SIZE / 2;
            const gy = ghost.y + TILE_SIZE / 2;
            const dx = gx - px;
            const dy = gy - py;
            const dist = Math.hypot(dx, dy);

            const proj = dx * backX + dy * backY;
            const perp = Math.abs(dx * backY - dy * backX);

            if (proj > 0 && perp < TILE_SIZE * 0.85 && dist < TILE_SIZE * 3.5) {
              const factor = 1 - (dist / (TILE_SIZE * 3.5));
              const currentBonus = 1.0 + factor * 0.75;
              if (currentBonus > maxProxBonus) maxProxBonus = currentBonus;

              if (dist < TILE_SIZE * 0.55 && !this.player.isJumping) {
                this.spawnProtectionTimer = 0;
                this.addFloatingText(px, py - 20, '☠️ GOLPE PELAS COSTAS!', '#ff0033');
                this.hurtPlayer();
                break;
              }
            }
          }
        }
        this.wickedShadowMultBonus = maxProxBonus;
      } else {
        this.wickedShadowMultBonus = 1.0;
      }

      // Colisões do slime com inimigos
      if (this.player && !this.player.isJumping) {
        this.ghosts.forEach(ghost => {
          if (!ghost || ghost.state === 'eaten' || ghost.state === 'respawning') return;

          const dist = Math.hypot(
            (this.player.x + TILE_SIZE / 2) - (ghost.x + TILE_SIZE / 2),
            (this.player.y + TILE_SIZE / 2) - (ghost.y + TILE_SIZE / 2)
          );

          // Área de colisão efetiva
          if (dist < TILE_SIZE * 0.55) {
            if (ghost.state === 'frightened' || ghost.state === 'stunned') {
              this.eatGhost(ghost);
            } else {
              this.hurtPlayer();
            }
          }
        });
      }

      // Partículas e textos na tela
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

      // Renderiza o fundo do labirinto
      this.ctx.fillStyle = '#08080a';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      this.ctx.fillStyle = 'rgba(74, 75, 87, 0.22)';
      for (let x = 20; x < this.canvas.width; x += 40) {
        for (let y = 20; y < this.canvas.height; y += 40) {
          this.ctx.fillRect(x - 0.75, y - 0.75, 1.5, 1.5);
        }
      }

      // Renderiza as paredes e pastilhas
      for (let r = 0; r < GRID_HEIGHT; r++) {
        for (let c = 0; c < GRID_WIDTH; c++) {
          const tile = this.map[r][c];

          if (tile === 1) {
            // Paredes
            this.ctx.fillStyle = '#1b1b22';
            this.ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);

            this.ctx.strokeStyle = '#4a4b57';
            this.ctx.lineWidth = 1.8;
            this.ctx.strokeRect(c * TILE_SIZE + 1.5, r * TILE_SIZE + 1.5, TILE_SIZE - 3, TILE_SIZE - 3);

            // Detalhes dos cantos das paredes
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
            // Desenha itens
            const cx = c * TILE_SIZE + TILE_SIZE / 2;
            const cy = r * TILE_SIZE + TILE_SIZE / 2;

            if (tile === 2) {
              // Pastilha normal
              this.ctx.fillStyle = '#ffffff';
              this.ctx.beginPath();
              this.ctx.moveTo(cx, cy - 4.5);
              this.ctx.lineTo(cx + 4.5, cy);
              this.ctx.lineTo(cx, cy + 4.5);
              this.ctx.lineTo(cx - 4.5, cy);
              this.ctx.closePath();
              this.ctx.fill();
            } else if (tile === 3) {
              // Pastilha dourada
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
              // Pastilha especial azul
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
              // Parede de Laser Temporária
              this.ctx.save();
              this.ctx.fillStyle = this.laserWallActive ? '#FF00FF' : 'rgba(255, 0, 255, 0.1)';
              if (this.laserWallActive) {
                this.ctx.shadowColor = '#FF00FF';
                this.ctx.shadowBlur = 12;
              }
              this.ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
              this.ctx.restore();
            }
          }
        }
      }

      // Renderiza Paredes Falsas (Boss Blind)
      if (this.activeFakeWalls && this.activeFakeWalls.length > 0) {
        this.ctx.save();
        for (const fw of this.activeFakeWalls) {
          const fx = fw.c * TILE_SIZE;
          const fy = fw.r * TILE_SIZE;
          this.ctx.fillStyle = 'rgba(255, 0, 85, 0.75)';
          this.ctx.shadowColor = '#ff0055';
          this.ctx.shadowBlur = 10;
          this.ctx.fillRect(fx + 2, fy + 2, TILE_SIZE - 4, TILE_SIZE - 4);

          this.ctx.strokeStyle = '#ffffff';
          this.ctx.lineWidth = 2;
          this.ctx.strokeRect(fx + 3, fy + 3, TILE_SIZE - 6, TILE_SIZE - 6);

          // Padrão de espinhos / barreira de perigo
          this.ctx.beginPath();
          this.ctx.moveTo(fx + 4, fy + 4);
          this.ctx.lineTo(fx + TILE_SIZE - 4, fy + TILE_SIZE - 4);
          this.ctx.moveTo(fx + TILE_SIZE - 4, fy + 4);
          this.ctx.lineTo(fx + 4, fy + TILE_SIZE - 4);
          this.ctx.stroke();
        }
        this.ctx.restore();
      }

      // Desenha as poças de lodo
      if (this.stickyPools) {
        this.stickyPools.forEach(p => p.draw(this.ctx));
      }

      // Onda de choque ao limpar tabuleiro
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

      // Sombra do slime
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

      // Slime
      if (this.player) {
        this.player.draw(this.ctx);
      }

      // Laser
      this.projectiles.forEach(proj => {
        if (proj) proj.draw(this.ctx);
      });

      // Inimigos
      this.ghosts.forEach(ghost => {
        if (ghost) ghost.draw(this.ctx);
      });

      // Partículas de poeira
      this.particles.forEach(p => {
        if (p) p.draw(this.ctx);
      });

      // Textos flutuantes de pontuação
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

      // Mensagem de "Prepare-se"
      if (this.spawnProtectionTimer > 0) {
        this.ctx.save();
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2 - 35;
        const alpha = Math.min(1, this.spawnProtectionTimer / 300);

        this.ctx.globalAlpha = alpha;
        this.ctx.font = '900 24px "Space Grotesk", sans-serif';
        this.ctx.fillStyle = '#FFE600';
        this.ctx.shadowColor = 'rgba(255, 230, 0, 0.8)';
        this.ctx.shadowBlur = 14;
        this.ctx.fillText("PREPARE-SE!", cx, cy);

        this.ctx.font = '8px "Press Start 2P", monospace';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.shadowBlur = 4;
        this.ctx.fillText("ENTRADA SEGURA // INIMIGOS REAGINDO...", cx, cy + 24);

        this.ctx.restore();
      }

      // Névoa Arcade (Fog of War)
      if (this.activeBossBlind === 'Névoa Arcade' && this.player) {
        this.ctx.save();
        const px = this.player.x + TILE_SIZE / 2;
        const py = this.player.y + TILE_SIZE / 2;

        const gradient = this.ctx.createRadialGradient(px, py, TILE_SIZE * 2, px, py, TILE_SIZE * 6);
        gradient.addColorStop(0, 'rgba(8, 8, 12, 0)');
        gradient.addColorStop(0.5, 'rgba(8, 8, 12, 0.7)');
        gradient.addColorStop(1, 'rgba(8, 8, 12, 1)');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
      }

      // Painel de debug
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
      if (this.isVictoryPaused) return;

      const dt = currentTime - this.lastTime;
      this.lastTime = currentTime;

      const cappedDt = Math.min(dt, 100);

      this.update(cappedDt);
      this.draw();

      if (!this.isVictoryPaused) {
        this.animationFrameId = requestAnimationFrame((t) => this.gameLoop(t));
      }
    }
  }

  // Classe do jogador
  class Player {
    constructor(gridX, gridY, slimeType = 'classic') {
      this.slimeType = slimeType;
      this.gridX = gridX;
      this.gridY = gridY;

      // Coordenadas em pixel
      this.x = gridX * TILE_SIZE;
      this.y = gridY * TILE_SIZE;

      this.speed = 0.14; // Pixels por ms
      this.dir = DIRECTIONS.RIGHT;

      // Efeitos de distorção elástica
      this.squishX = 1;
      this.squishY = 1;
      this.angle = 0;
      this.walkTimer = 0;

      // Dados do pulo
      this.isJumping = false;
      this.jumpDuration = 250;
      this.jumpTimeLeft = 0;
      this.jumpStart = { x: 0, y: 0 };
      this.jumpTarget = { x: 0, y: 0 };
      this.jumpProgress = 0;

      // Buffer de movimentos
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
                  const startX = checkX * TILE_SIZE + TILE_SIZE / 2;
                  const startY = checkY * TILE_SIZE + TILE_SIZE / 2;
                  const playerX = this.x + TILE_SIZE / 2;
                  const playerY = this.y + TILE_SIZE / 2;

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

    // Verifica movimentos opostos
    isOpposite(dirA, dirB) {
      return (dirA.x === -dirB.x && dirA.x !== 0) || (dirA.y === -dirB.y && dirA.y !== 0);
    }

    setInput(dir, game = null) {
      const g = game || this.game;

      // Permite virar no sentido oposto na hora
      if (this.dir !== DIRECTIONS.NONE && this.isOpposite(this.dir, dir)) {
        const isOffsetFromGrid = (Math.abs(this.x - this.gridX * TILE_SIZE) > 0.001) || (Math.abs(this.y - this.gridY * TILE_SIZE) > 0.001);

        if (isOffsetFromGrid) {
          // O jogador estava entre this.gridX e o próximo tile (this.gridX + this.dir.x).
          // Ao inverter a direção, o tile de destino passa a ser o tile de retorno que ele acabou de deixar (this.gridX).
          // Portanto, atualizamos this.gridX para o tile em direção ao qual ele estava se deslocando,
          // de forma que (novo gridX + nova dir) aponte exatamente para o tile de retorno seguro.
          this.gridX = this.gridX + this.dir.x;
          this.gridY = this.gridY + this.dir.y;
          this.dir = dir;
          this.angle = dir.angle;
          this.inputBufferDir = DIRECTIONS.NONE;
          this.inputBufferTime = 0;
          return;
        } else {
          // Se estava exatamente no centro do tile, só pode virar se o tile oposto for caminhável
          const targetX = this.gridX + dir.x;
          const targetY = this.gridY + dir.y;
          if (g && !g.isWalkable(targetX, targetY)) {
            this.inputBufferDir = DIRECTIONS.NONE;
            this.inputBufferTime = 0;
            return;
          }
          this.dir = dir;
          this.angle = dir.angle;
          this.inputBufferDir = DIRECTIONS.NONE;
          this.inputBufferTime = 0;
          return;
        }
      }

      this.inputBufferDir = dir;
      this.inputBufferTime = 300;
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
      this.game = game;

      // Salvaguarda: se o jogador não estiver pulando e estiver dentro de uma parede, ejeta para o tile caminhável mais próximo
      if (!this.isJumping && !game.isWalkable(this.gridX, this.gridY)) {
        const snappedX = Math.round(this.x / TILE_SIZE);
        const snappedY = Math.round(this.y / TILE_SIZE);
        if (game.isWalkable(snappedX, snappedY)) {
          this.gridX = snappedX;
          this.gridY = snappedY;
          this.x = snappedX * TILE_SIZE;
          this.y = snappedY * TILE_SIZE;
        } else {
          const neighbors = [
            { x: snappedX - 1, y: snappedY },
            { x: snappedX + 1, y: snappedY },
            { x: snappedX, y: snappedY - 1 },
            { x: snappedX, y: snappedY + 1 }
          ];
          const valid = neighbors.find(n => game.isWalkable(n.x, n.y));
          if (valid) {
            this.gridX = valid.x;
            this.gridY = valid.y;
            this.x = valid.x * TILE_SIZE;
            this.y = valid.y * TILE_SIZE;
          }
        }
        this.dir = DIRECTIONS.NONE;
      }

      // Tempo limite do buffer
      if (this.inputBufferTime > 0) {
        this.inputBufferTime -= dt;
        if (this.inputBufferTime <= 0) {
          this.inputBufferDir = DIRECTIONS.NONE;
        }
      }

      // Animação de pulo
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

        // Mecânica "Close Call": passagem aérea direta sobre inimigos terrestres
        if (game.ghosts) {
          game.ghosts.forEach(ghost => {
            if (!ghost || ghost.state === 'eaten' || ghost.state === 'respawning') return;
            if (this.jumpCrossedEnemies && this.jumpCrossedEnemies.has(ghost)) return;

            const dist = Math.hypot(
              (this.x + TILE_SIZE / 2) - (ghost.x + TILE_SIZE / 2),
              (this.y + TILE_SIZE / 2) - (ghost.y + TILE_SIZE / 2)
            );

            if (dist < TILE_SIZE * 0.75) {
              if (!this.jumpCrossedEnemies) this.jumpCrossedEnemies = new Set();
              this.jumpCrossedEnemies.add(ghost);
              this.hasMadeCloseCallInCurrentJump = true;

              // Bônus de pontuação Close Call
              const closeCallChips = 250;
              const closeCallMult = 2;
              game.chips += closeCallChips;
              game.mult += closeCallMult;
              game.score = game.chips * game.mult;
              game.scorePop(game.chipsBox);
              game.scorePop(game.multBox);

              game.triggerScreenShake(4);
              game.addFloatingText(
                this.x + TILE_SIZE / 2,
                this.y - 25,
                '+CLOSE CALL! +250 Fichas x2 Mult',
                '#FFE600'
              );
              if (window.AchievementManager) window.AchievementManager.recordCloseCall(1);
            }
          });
        }

        if (this.jumpTimeLeft <= 0) {
          this.x = this.jumpTarget.x;
          this.y = this.jumpTarget.y;
          this.gridX = Math.floor((this.x + TILE_SIZE / 2) / TILE_SIZE);
          this.gridY = Math.floor((this.y + TILE_SIZE / 2) / TILE_SIZE);
          this.isJumping = false;

          this.squishX = 1.25;
          this.squishY = 0.75;

          const hadCommonPellet = (game.map[this.gridY] && game.map[this.gridY][this.gridX] === 2);

          this.checkEatPellet(game);
          game.triggerScreenShake(3);
          game.spawnDust(this.x + TILE_SIZE / 2, this.y + TILE_SIZE / 2, 6, '#ffffff');

          // Buffer de Aterrissagem (Landing Boost): +15% de velocidade por 1s ao tocar o solo se tecla pressionada
          if (game.keysPressed && (game.keysPressed['ArrowUp'] || game.keysPressed['ArrowDown'] || game.keysPressed['ArrowLeft'] || game.keysPressed['ArrowRight'] || game.keysPressed['KeyW'] || game.keysPressed['KeyS'] || game.keysPressed['KeyA'] || game.keysPressed['KeyD'] || this.inputBufferDir !== DIRECTIONS.NONE)) {
            game.landingBoostTimer = 1000;
            game.addFloatingText(this.x + TILE_SIZE / 2, this.y - 15, 'BOOST! +15% VEL', '#00FF66');
          }

          // Meteoro de Gosma: onda de choque de raio 2.5 blocos atordoando inimigos por 2s
          if (game.hasSlimeMeteor) {
            game.triggerScreenShake(7);
            if (game.ghosts) {
              game.ghosts.forEach(g => {
                if (!g || g.state === 'eaten' || g.state === 'respawning') return;
                const d = Math.hypot((this.x + TILE_SIZE / 2) - (g.x + TILE_SIZE / 2), (this.y + TILE_SIZE / 2) - (g.y + TILE_SIZE / 2));
                if (d <= 2.5 * TILE_SIZE) {
                  g.stunTimer = 2000;
                  g.state = 'stunned';
                }
              });
            }
            game.spawnDust(this.x + TILE_SIZE / 2, this.y + TILE_SIZE / 2, 16, '#00FF66');
            game.addFloatingText(this.x + TILE_SIZE / 2, this.y - 28, 'METEORO! ATORDUADO!', '#00FF66');
          }

          // Salto Quântico: Close Call + pouso em pastilha comum reseta 50% da recarga
          if (game.hasQuantumJump && this.hasMadeCloseCallInCurrentJump && hadCommonPellet) {
            const maxCld = game.vaultMaxCooldown * (game.cooldownMultiplier || 1.0);
            game.vaultCooldown = Math.max(0, game.vaultCooldown - maxCld * 0.5);
            game.addFloatingText(this.x + TILE_SIZE / 2, this.y - 35, 'SALTO QUÂNTICO! -50% RECARGA', '#00E5FF');
          }
        }
        return;
      }

      this.squishX += (1 - this.squishX) * 0.15;
      this.squishY += (1 - this.squishY) * 0.15;

      // Move o slime se tiver comando no buffer
      if (this.dir === DIRECTIONS.NONE) {
        if (this.inputBufferDir !== DIRECTIONS.NONE) {
          const nextGridX = this.gridX + this.inputBufferDir.x;
          const nextGridY = this.gridY + this.inputBufferDir.y;
          if (game.isWalkable(nextGridX, nextGridY)) {
            this.x = this.gridX * TILE_SIZE;
            this.y = this.gridY * TILE_SIZE;
            this.dir = this.inputBufferDir;
            this.angle = this.dir.angle;
            this.inputBufferDir = DIRECTIONS.NONE;
            this.inputBufferTime = 0;
          } else {
            this.inputBufferDir = DIRECTIONS.NONE;
            this.inputBufferTime = 0;
          }
        }
        if (this.dir === DIRECTIONS.NONE) return;
      }

      // Rastreamento de Dente de Sabre (linha reta contínua)
      if (this.lastMovingDir === this.dir && this.dir !== DIRECTIONS.NONE) {
        this.straightLineTimer = (this.straightLineTimer || 0) + dt;
      } else {
        this.straightLineTimer = 0;
        this.lastMovingDir = this.dir;
      }

      // Rastreamento de Fita Métrica (+0.1 Mult por segundo de movimento contínuo sem bater em paredes)
      if (game.hasTapeMeasure && this.dir !== DIRECTIONS.NONE) {
        this.tapeMeasureTimer = (this.tapeMeasureTimer || 0) + dt;
        if (this.tapeMeasureTimer >= 1000) {
          this.tapeMeasureTimer = 0;
          game.tapeMeasureBonus = Math.min(3.0, (game.tapeMeasureBonus || 0) + 0.1);
        }
      }

      // Movimentação contínua com bônus de Landing Boost e penalidade de Botas Gravitacionais
      let currentSpeed = this.speed;
      if (game.baseSpeedMult) currentSpeed *= game.baseSpeedMult;
      if (game.adrenalineTimer > 0) currentSpeed *= 1.20;
      if (game.landingBoostTimer > 0) currentSpeed *= 1.15;
      if (game.hasGravityBoots && game.vaultCooldown > 0) currentSpeed *= 0.90;

      let step = currentSpeed * dt;

      // Animação do slime balançando
      this.walkTimer += dt * 0.015;
      this.squishX = 1 + Math.sin(this.walkTimer) * 0.05;
      this.squishY = 1 - Math.sin(this.walkTimer) * 0.05;

      while (step > 0 && this.dir !== DIRECTIONS.NONE) {
        // Tile de destino imediato
        const targetGridX = this.gridX + this.dir.x;
        const targetGridY = this.gridY + this.dir.y;

        // Salvaguarda absoluta contra penetração de parede:
        // Se o tile à frente for parede ou obstáculo não-caminhável, para o slime imediatamente
        if (!game.isWalkable(targetGridX, targetGridY)) {
          this.x = this.gridX * TILE_SIZE;
          this.y = this.gridY * TILE_SIZE;
          this.dir = DIRECTIONS.NONE;
          this.straightLineTiles = 0;
          game.tapeMeasureBonus = 0;
          this.tapeMeasureTimer = 0;
          break;
        }

        // Coordenadas centrais do tile alvo
        const targetCenter = {
          x: targetGridX * TILE_SIZE,
          y: targetGridY * TILE_SIZE
        };

        // Distância para o centro do tile
        const distToTargetCenter = Math.hypot(targetCenter.x - this.x, targetCenter.y - this.y);

        if (step < distToTargetCenter) {
          // Faz curvas rápidas antes de chegar no centro do tile
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
                  this.straightLineTiles = 0; // Reseta o combo
                  this.checkEatPellet(game);

                  if (game.activeRelics.some(r => r.id === 'relic_sharp_drift')) {
                    game.mult += 2;
                    game.updateHUD();
                    game.addFloatingText(this.x + TILE_SIZE / 2, this.y, '+2 MULT', '#FF00FF', 'DRIFT PERFEITO!');
                    game.spawnDust(this.x + TILE_SIZE / 2, this.y + TILE_SIZE / 2, 4, '#FF00FF');
                  }
                  continue;
                }
              }
            }
          }

          // Movimento normal dentro da reta
          this.x += this.dir.x * step;
          this.y += this.dir.y * step;
          step = 0;
        } else {
          // Chegou no centro do tile
          step -= distToTargetCenter;
          this.x = targetCenter.x;
          this.y = targetCenter.y;

          this.gridX = Math.floor((this.x + TILE_SIZE / 2) / TILE_SIZE);
          this.gridY = Math.floor((this.y + TILE_SIZE / 2) / TILE_SIZE);

          if (game.straightLineCombo) {
            this.straightLineTiles = (this.straightLineTiles || 0) + 1;
            if (this.straightLineTiles >= 5) {
              game.mult += 1;
              game.updateHUD();
              game.addFloatingText(this.x + TILE_SIZE / 2, this.y, '+1 MULT', '#FFE600', 'COMBO RETA');
              this.straightLineTiles = 0;
            }
          }

          // Teleporte das bordas
          if (this.gridX < 0) {
            this.gridX = GRID_WIDTH - 1;
            this.x = this.gridX * TILE_SIZE;
          } else if (this.gridX >= GRID_WIDTH) {
            this.gridX = 0;
            this.x = 0;
          }
          if (this.gridY < 0) {
            this.gridY = GRID_HEIGHT - 1;
            this.y = this.gridY * TILE_SIZE;
          } else if (this.gridY >= GRID_HEIGHT) {
            this.gridY = 0;
            this.y = 0;
          }

          // Verifica pastilhas no novo tile
          this.checkEatPellet(game);

          // Tomada de decisão nas interseções

          // Tenta mudar de direção se houver comando no buffer
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
                game.addFloatingText(this.x + TILE_SIZE / 2, this.y, '+2 MULT', '#FF00FF', 'DRIFT PERFEITO!');
                game.spawnDust(this.x + TILE_SIZE / 2, this.y + TILE_SIZE / 2, 4, '#FF00FF');
              }
            } else {
              // Se não conseguiu virar, continua na mesma direção se possível
              const nextGridX = this.gridX + this.dir.x;
              const nextGridY = this.gridY + this.dir.y;
              if (!game.isWalkable(nextGridX, nextGridY)) {
                this.dir = DIRECTIONS.NONE;
                this.straightLineTiles = 0; // Bateu na parede, perde o combo
                game.tapeMeasureBonus = 0;
                this.tapeMeasureTimer = 0;
              }
              // Ignora comando se for parede
              this.inputBufferDir = DIRECTIONS.NONE;
              this.inputBufferTime = 0;
            }
          }

          // Segue em frente ou para se bater na parede
          if (!directionChanged) {
            const nextGridX = this.gridX + this.dir.x;
            const nextGridY = this.gridY + this.dir.y;

            if (!game.isWalkable(nextGridX, nextGridY)) {
              // Para o slime no centro do tile
              this.x = this.gridX * TILE_SIZE;
              this.y = this.gridY * TILE_SIZE;

              const tileVal = (nextGridY >= 0 && nextGridY < GRID_HEIGHT && nextGridX >= 0 && nextGridX < GRID_WIDTH) ? game.map[nextGridY][nextGridX] : 'FORA';
              this.lastStopReason = `Parede na frente (${nextGridX}, ${nextGridY}) [Tipo: ${tileVal}]`;
              console.log(`[MUNCH DEBUG] Slime colidiu com parede na grade (${this.gridX}, ${this.gridY}). ${this.lastStopReason}`);

              this.dir = DIRECTIONS.NONE;
              this.straightLineTiles = 0; // Perde o combo
              game.tapeMeasureBonus = 0;
              this.tapeMeasureTimer = 0;
              step = 0;
            }
          }
        }
      }
    }

    draw(ctx) {
      // Sombra do slime
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(this.x + TILE_SIZE / 2, this.y + TILE_SIZE / 2 + 15, 14 * this.squishX, 5 * this.squishY, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.save();
      const centerX = this.x + TILE_SIZE / 2;
      const centerY = this.y + TILE_SIZE / 2;
      ctx.translate(centerX, centerY);
      ctx.scale(this.squishX, this.squishY);

      // Renderiza corpo 2.5D do jogador
      const size = TILE_SIZE - 4;

      let topColor = '#b0b0b0';
      let faceColor = '#949494';

      if (this.slimeType === 'metallic') { // Mercenário
        topColor = '#4ade80';
        faceColor = '#22c55e';
      } else if (this.slimeType === 'ballistic') {
        topColor = '#f87171';
        faceColor = '#ef4444';
      } else if (this.slimeType === 'gambler') {
        topColor = '#fde047';
        faceColor = '#eab308';
      } else {
        topColor = '#a3a3c2';
        faceColor = '#7a7a9e';
      }

      // Topo do slime
      ctx.fillStyle = topColor;
      ctx.beginPath();
      ctx.moveTo(-size / 2, -size / 2 + 6);
      ctx.lineTo(-size / 2 + 3, -size / 2);
      ctx.lineTo(size / 2 - 3, -size / 2);
      ctx.lineTo(size / 2, -size / 2 + 6);
      ctx.closePath();
      ctx.fill();

      // Face frontal
      ctx.fillStyle = faceColor;
      ctx.beginPath();
      ctx.roundRect(-size / 2, -size / 2 + 6, size, size - 6, [0, 0, 6, 6]);
      ctx.fill();

      // Contorno branco
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-size / 2 + 3, -size / 2);
      ctx.lineTo(size / 2 - 3, -size / 2);
      ctx.lineTo(size / 2, -size / 2 + 6);
      ctx.lineTo(size / 2, size / 2);
      ctx.lineTo(-size / 2, size / 2);
      ctx.lineTo(-size / 2, -size / 2 + 6);
      ctx.closePath();
      ctx.stroke();

      // Linha divisória
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-size / 2, -size / 2 + 6);
      ctx.lineTo(size / 2, -size / 2 + 6);
      ctx.stroke();

      // Move os olhos dependendo da direção
      let faceX = 0;
      let faceY = 0;

      if (this.dir === DIRECTIONS.RIGHT) faceX = 3;
      if (this.dir === DIRECTIONS.LEFT) faceX = -3;
      if (this.dir === DIRECTIONS.UP) faceY = -2;
      if (this.dir === DIRECTIONS.DOWN) faceY = 2;

      ctx.translate(faceX, faceY + 4); // Desloca para o centro da face frontal

      // Sobrancelhas
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

      // Olhos
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

      // Boca
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(-3.5, 4.5, 7, 2);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(-3.5, 4.5, 7, 2);

      ctx.restore();
    }
  }

  // Classe do projétil laser
  class Laser {
    constructor(x, y, dir, isRailgun = false, bounces = 0) {
      this.x = x;
      this.y = y;
      this.dir = { x: dir.x, y: dir.y, angle: dir.angle };
      this.speed = 0.45;
      this.active = true;
      this.toRemove = false;
      this.isRailgun = isRailgun;
      this.bounces = bounces;
    }

    update(dt, game) {
      const step = this.speed * dt;
      this.x += this.dir.x * step;
      this.y += this.dir.y * step;

      const gridX = Math.floor(this.x / TILE_SIZE);
      const gridY = Math.floor(this.y / TILE_SIZE);

      if (gridX < 0 || gridX >= GRID_WIDTH || gridY < 0 || gridY >= GRID_HEIGHT || (game.map[gridY] && game.map[gridY][gridX] === 1)) {
        if (this.bounces > 0) {
          this.bounces--;
          this.x -= this.dir.x * step * 1.5; // recua para fora da parede
          this.y -= this.dir.y * step * 1.5;

          const prevGridX = Math.floor(this.x / TILE_SIZE);
          const prevGridY = Math.floor(this.y / TILE_SIZE);

          if (gridX !== prevGridX) this.dir.x *= -1;
          if (gridY !== prevGridY) this.dir.y *= -1;
          this.dir.angle = Math.atan2(this.dir.y, this.dir.x);

          game.spawnDust(this.x, this.y, 4, '#00E5FF');
          return;
        } else {
          this.active = false;
          this.toRemove = true;
          game.spawnDust(this.x, this.y, 4, '#FFE600');
          return;
        }
      }

      // Colisão com fantasmas
      for (let i = 0; i < game.ghosts.length; i++) {
        const ghost = game.ghosts[i];
        if (!ghost || ghost.state === 'eaten' || ghost.state === 'respawning') continue;

        const dist = Math.hypot(this.x - (ghost.x + TILE_SIZE / 2), this.y - (ghost.y + TILE_SIZE / 2));
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
        ctx.shadowColor = '#FF00FF';
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

  // Classe dos inimigos geométricos
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

      this.state = 'normal';
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
      let totalKills = (parseInt(localStorage.getItem('munch_total_kills')) || 0) + 1;
      localStorage.setItem('munch_total_kills', totalKills);
      game.runEnemiesKilled = (game.runEnemiesKilled || 0) + 1;
      if (window.MetaProgression && window.MetaProgression.addKills(1)) {
        game.addFloatingText(this.x + TILE_SIZE / 2, this.y - 35, '★ SLIME BALÍSTICO DESBLOQUEADO! ★', '#00FF66');
      }
      if (window.AchievementManager) window.AchievementManager.checkAll(false);

      this.state = 'respawning';
      this.respawnTimer = 2500; // Tempo para renascer

      const deathX = this.x + TILE_SIZE / 2;
      const deathY = this.y + TILE_SIZE / 2;

      // Cria partículas de estilhaços
      const color = this.type === 'SPADE' ? '#32323e' : '#FB8500';
      for (let i = 0; i < 4; i++) {
        game.particles.push(new ShardParticle(deathX, deathY, color));
      }

      // Adiciona pontuação da eliminação
      game.chips += 200;
      const extraMult = 2 + (game.killMultBonus || 0);
      game.mult += extraMult;
      game.runMaxMult = Math.max(game.runMaxMult || 1, game.mult);
      if (window.MetaProgression && window.MetaProgression.checkMult(game.mult)) {
        game.addFloatingText(deathX, deathY - 45, '★ SLIME GAMBLER DESBLOQUEADO! ★', '#FFE600');
      }

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

      // Manda de volta para a base
      const baseX = Math.floor(GRID_WIDTH / 2) - 1;
      const baseY = Math.floor(GRID_HEIGHT / 2);
      this.x = baseX * TILE_SIZE;
      this.y = baseY * TILE_SIZE;
      this.targetX = this.x;
      this.targetY = this.y;
      this.gridX = baseX;
      this.gridY = baseY;

      game.triggerScreenShake(6);
      game.updateHUD();
      game.checkWinCondition();
    }

    update(dt, game) {
      const baseX = Math.floor(GRID_WIDTH / 2) - 1;
      const baseY = Math.floor(GRID_HEIGHT / 2);

      // Controle de respawn
      if (this.state === 'respawning') {
        this.respawnTimer -= dt;
        if (this.respawnTimer <= 0) {
          this.state = 'normal';
          this.resetPosition(baseX, baseY);
        }
        return;
      }

      // Recarga da investida
      if (this.dashCooldown > 0) {
        this.dashCooldown -= dt;
      }

      // Controle do atordoamento
      if (this.state === 'stunned') {
        this.stunTimer -= dt;
        if (this.stunTimer <= 0) {
          this.state = game.frightenedTimer > 0 ? 'frightened' : 'normal';
        }
        return;
      }

      // Define a velocidade atual
      let currentSpeed = this.speed + (game.ante * 0.008);

      // Incremento passivo na velocidade dos inimigos (+5% cumulativo por nível além do 8)
      if (game.ante > 8) {
        currentSpeed *= (1 + (game.ante - 8) * 0.05);
      }

      // Bônus de velocidade para o Boss
      if (game.blind === 3 && game.ante % 2 === 1) {
        currentSpeed *= 1.15;
      }

      // Verifica poça de lodo
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
        currentSpeed *= 0.5; // Lentidão
      }

      if (this.state === 'dash') {
        currentSpeed = this.speed * 2.8; // Investida
      } else if (this.state === 'frightened') {
        currentSpeed = this.speed * 0.6; // Pânico
      } else if (this.state === 'eaten') {
        currentSpeed = this.speed * 2.5; // Retornando à base
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

          // Teleporte
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

          if (this.state === 'eaten' && this.gridX === baseX && this.gridY === baseY) {
            this.state = 'normal';
          }

          if (this.state === 'dash') {
            // Para ao bater na parede
            const checkX = this.gridX + this.dir.x;
            const checkY = this.gridY + this.dir.y;
            if (!game.isWalkable(checkX, checkY)) {
              this.state = 'normal';
              // Cooldown menor no boss
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
        // Retorna para a base se foi comido
        if (this.state === 'eaten') {
          const path = this.findPath(this.gridX, this.gridY, baseX, baseY, game);
          if (path.length > 0) {
            this.dir = path[0];
            this.targetX = (this.gridX + this.dir.x) * TILE_SIZE;
            this.targetY = (this.gridY + this.dir.y) * TILE_SIZE;
          } else {
            this.resetPosition(baseX, baseY);
          }
          return;
        }

        // Investida do Espada
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

        // Escolha de caminho nas interseções
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

          // Perseguição do Ouro
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

          // Escolha aleatória
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
      if (this.state === 'respawning') return;

      ctx.save();
      const cx = this.x + TILE_SIZE / 2;
      const cy = this.y + TILE_SIZE / 2;
      ctx.translate(cx, cy);

      // Boss Blind: Inimigo Fantasma (invisível, revelando apenas os olhos periodicamente)
      if (this.isPhantom && this.state !== 'eaten') {
        const pulse = Math.sin(performance.now() * 0.006);
        if (pulse > 0.0) {
          ctx.fillStyle = '#ff0055';
          ctx.shadowColor = '#ff0055';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(-5, -2, 3, 0, Math.PI * 2);
          ctx.arc(5, -2, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
        ctx.restore();
        return;
      }

      // Renderiza estados especiais
      if (this.state === 'eaten') {
        // Apenas os olhos
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
        // Naipe assustado
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
        // Naipe congelado
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
        // Naipe padrão
        if (this.type === 'SPADE') {
          // Brilho de investida
          if (this.state === 'dash') {
            ctx.shadowColor = '#FF2E2E';
            ctx.shadowBlur = 12;
            // Sombra vermelha
            ctx.fillStyle = 'rgba(255, 46, 46, 0.15)';
            ctx.beginPath();
            ctx.arc(0, 0, 19, 0, Math.PI * 2);
            ctx.fill();
          }

          // Desenho da Espada
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

          // Base da Espada
          ctx.beginPath();
          ctx.moveTo(0, 3);
          ctx.quadraticCurveTo(5, 11, 7, 13);
          ctx.lineTo(-7, 13);
          ctx.quadraticCurveTo(-5, 11, 0, 3);
          ctx.closePath();
          ctx.fillStyle = '#202124';
          ctx.fill();
          ctx.stroke();

          // Ponta amarela
          ctx.fillStyle = '#FFE600';
          ctx.beginPath();
          ctx.moveTo(0, -14);
          ctx.lineTo(4, -8);
          ctx.lineTo(-4, -8);
          ctx.closePath();
          ctx.fill();

          ctx.shadowBlur = 0;
        } else if (this.type === 'DIAMOND') {
          // Desenho de Ouros

          // Losango externo
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

          // Losango interno
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

  // Estilhaços geométricos
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

      // Desenha estilhaço
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

  // Partícula básica
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

  // Inicialização do jogo
  window.addEventListener('DOMContentLoaded', () => {
    window.munchGame = new Game();
  });
})();
