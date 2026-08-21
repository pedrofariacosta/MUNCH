import { getBlindScore } from '../config/balance.js';
import { GAME_STATES } from '../config/constants.js';

export class UIManager {
  constructor() {
    // Elementos do DOM
    this.menuScreen = document.getElementById('menu-screen');
    this.gameOverScreen = document.getElementById('game-over-screen');
    this.shopOverlay = document.getElementById('shop-overlay');
    this.loadingOverlay = document.getElementById('loading-screen');
    
    this.btnStart = document.getElementById('btn-start');
    this.btnRestart = document.getElementById('btn-restart');
    
    // Elementos do HUD
    this.hudScore = document.getElementById('hud-score');
    this.hudChips = document.getElementById('hud-chips');
    this.hudMult = document.getElementById('hud-mult');
    this.hudBlind = document.getElementById('hud-blind');
    this.hudStage = document.getElementById('hud-stage');
    this.hudGold = document.getElementById('hud-gold');
    this.hudLives = document.getElementById('hud-lives');
    this.goalFill = document.getElementById('goal-fill');
    this.goalText = document.getElementById('goal-text');
    
    // Slots de habilidades
    this.cooldownVault = document.getElementById('cooldown-vault');
    this.cooldownBlaster = document.getElementById('cooldown-blaster');
    this.slotVault = document.getElementById('slot-vault');
    this.slotBlaster = document.getElementById('slot-blaster');
    
    // Inventário de coringas
    this.inventoryContainer = document.getElementById('inventory-slots');
    
    // Vitrine e controles da loja
    this.shopCardsGrid = document.getElementById('shop-cards');
    this.btnReroll = document.getElementById('btn-reroll');
    this.btnNextLevel = document.getElementById('btn-next-level');
    this.rerollCostText = document.getElementById('reroll-cost');
  }

  init(gameCallbacks) {
    // Cliques dos botões
    this.btnStart.addEventListener('click', () => gameCallbacks.onStartGame());
    this.btnRestart.addEventListener('click', () => gameCallbacks.onRestartGame());
    
    this.btnReroll.addEventListener('click', () => gameCallbacks.onRerollShop());
    this.btnNextLevel.addEventListener('click', () => gameCallbacks.onExitShop());
    
    this.gameCallbacks = gameCallbacks;
  }

  // Atualiza os valores do HUD
  updateHUD(gameContext) {
    const { 
      stage, 
      score, 
      stageScore, 
      lives, 
      gold, 
      player,
      scoreEngine 
    } = gameContext;

    const blindGoal = getBlindScore(stage);
    
    // Stats base
    this.hudStage.innerText = stage;
    this.hudScore.innerText = score.toLocaleString();
    this.hudGold.innerText = gold;
    this.hudLives.innerText = '❤️'.repeat(Math.max(0, lives));

    // Chips e Mult estilo Balatro
    this.hudChips.innerText = scoreEngine.lastChipsCalculated || 10;
    this.hudMult.innerText = scoreEngine.lastMultCalculated || 1;
    this.hudBlind.innerText = blindGoal.toLocaleString();

    // Animação de cálculo ativa se estiver no combo
    if (scoreEngine.comboTimer > 0) {
      this.hudChips.classList.add('active');
      this.hudMult.classList.add('active');
    } else {
      this.hudChips.classList.remove('active');
      this.hudMult.classList.remove('active');
    }

    // Progresso da meta da Blind
    const progressPercent = Math.min(100, (stageScore / blindGoal) * 100);
    this.goalFill.style.width = `${progressPercent}%`;
    this.goalText.innerText = `${Math.floor(stageScore).toLocaleString()} / ${blindGoal.toLocaleString()}`;

    // Cooldowns das skills
    if (player) {
      this.updateSkillCooldown(
        player.vaultCooldown, 
        3000, // 3s base
        this.cooldownVault, 
        this.slotVault
      );
      this.updateSkillCooldown(
        player.blasterCooldown, 
        4000, // 4s base
        this.cooldownBlaster, 
        this.slotBlaster
      );
    }

    // Mostra os coringas equipados
    this.updateInventory(gameContext.jokers);
  }

  updateSkillCooldown(currentCooldown, maxCooldown, fillEl, slotEl) {
    if (currentCooldown > 0) {
      const pct = (currentCooldown / maxCooldown) * 100;
      fillEl.style.width = `${pct}%`;
      slotEl.classList.remove('ready');
    } else {
      fillEl.style.width = '0%';
      slotEl.classList.add('ready');
    }
  }

  updateInventory(jokersList) {
    this.inventoryContainer.innerHTML = '';
    
    // Desenha os 5 slots
    for (let i = 0; i < 5; i++) {
      const slot = document.createElement('div');
      slot.className = 'item-slot-hud';
      
      const joker = jokersList[i];
      if (joker) {
        slot.classList.add('filled');
        slot.innerText = joker.icon;
        
        // Tooltip ao passar o mouse
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.innerHTML = `<strong>${joker.name}</strong><br><small>${joker.rarity}</small><br>${joker.desc}`;
        slot.appendChild(tooltip);
      } else {
        slot.innerHTML = '<span style="font-size: 10px; color:#4b5563;">+</span>';
      }
      this.inventoryContainer.appendChild(slot);
    }
  }

  // Vitrine de cartas na loja
  renderShop(offers, gold, rerollCost) {
    this.shopCardsGrid.innerHTML = '';
    this.rerollCostText.innerText = rerollCost;

    offers.forEach((offer, index) => {
      const card = document.createElement('div');
      card.className = 'shop-card';
      
      if (offer.sold) {
        card.classList.add('sold-out');
      }

      card.innerHTML = `
        <div class="shop-card-icon">${offer.icon}</div>
        <div class="shop-card-name">${offer.name}</div>
        <div class="shop-card-desc">${offer.desc}</div>
        <div class="shop-card-cost">${offer.sold ? 'ADQUIRIDO' : `${offer.cost}g`}</div>
      `;

      if (!offer.sold) {
        card.addEventListener('click', () => {
          this.gameCallbacks.onBuyShopItem(index);
        });
      }

      this.shopCardsGrid.appendChild(card);
    });
  }

  // Alterna os overlays do jogo
  switchState(state) {
    // Esconde tudo primeiro
    this.menuScreen.classList.add('hidden');
    this.gameOverScreen.classList.add('hidden');
    this.shopOverlay.classList.add('hidden');
    this.loadingOverlay.classList.add('hidden');

    switch (state) {
      case GAME_STATES.MENU:
        this.menuScreen.classList.remove('hidden');
        break;
      case GAME_STATES.GAMEOVER:
        this.gameOverScreen.classList.remove('hidden');
        const finalScoreText = document.getElementById('final-score');
        const recordText = document.getElementById('high-score-over');
        
        const currentScore = parseInt(this.hudScore.innerText.replace(/,/g, '')) || 0;
        const savedRecord = parseInt(localStorage.getItem('munch_highscore')) || 0;
        
        finalScoreText.innerText = currentScore.toLocaleString();
        recordText.innerText = savedRecord.toLocaleString();
        break;
      case GAME_STATES.SHOP:
        this.shopOverlay.classList.remove('hidden');
        break;
      case GAME_STATES.LOADING:
        this.loadingOverlay.classList.remove('hidden');
        break;
      case GAME_STATES.PLAYING:
        // Rodada ativa, sem overlay
        break;
    }
  }
}
