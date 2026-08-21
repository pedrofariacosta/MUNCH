import { PELLET_SCORES } from '../config/balance.js';

export class ScoreEngine {
  constructor() {
    this.score = 0;
    this.stageScore = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.comboDuration = 3500; // Tempo em milissegundos para segurar o combo
    
    // Dados da última pontuação calculada (usado no feed visual)
    this.lastChipsCalculated = 0;
    this.lastMultCalculated = 0;
    this.lastPointsAdded = 0;
  }

  resetGameScore() {
    this.score = 0;
    this.stageScore = 0;
    this.resetCombo();
  }

  resetStageScore() {
    this.stageScore = 0;
    this.resetCombo();
  }

  resetCombo() {
    this.combo = 0;
    this.comboTimer = 0;
  }

  update(dt) {
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.resetCombo();
      }
    }
  }

  // Calcula a pontuação usando o sistema Balatro: Fichas (Chips) x Multiplicador (Mult)
  addPelletScore(pelletType, jokersInventory, playerStatsContext) {
    // 1. Pega os valores básicos de chips e mult do orbe
    const base = PELLET_SCORES[pelletType] || PELLET_SCORES.NORMAL;
    
    // Aumenta o combo
    this.combo++;
    this.comboTimer = this.comboDuration;

    let scoreAccumulator = {
      chips: base.chips,
      mult: base.mult
    };

    // 2. Prepara o contexto para os Coringas avaliarem as condições
    const context = {
      pelletType: pelletType,
      combo: this.combo,
      playerHealth: playerStatsContext.health,
      playerMaxHealth: playerStatsContext.maxHealth,
      activeEnemiesCount: playerStatsContext.activeEnemiesCount
    };

    // 3. Aplica os efeitos dos Coringas/Relíquias equipados
    jokersInventory.forEach(joker => {
      if (joker && typeof joker.modifyScore === 'function') {
        scoreAccumulator = joker.modifyScore(scoreAccumulator, context);
      }
    });

    // 4. Calcula o valor final (Fichas e Mult nunca podem ser menores que 1)
    const finalChips = Math.max(1, scoreAccumulator.chips);
    const finalMult = Math.max(1, scoreAccumulator.mult);
    const pointsAdded = finalChips * finalMult;

    // 5. Soma os pontos ao placar geral e da fase
    this.score += pointsAdded;
    this.stageScore += pointsAdded;

    // Salva os valores calculados para exibir na interface (floating text)
    this.lastChipsCalculated = finalChips;
    this.lastMultCalculated = finalMult;
    this.lastPointsAdded = pointsAdded;

    return {
      chips: finalChips,
      mult: finalMult,
      points: pointsAdded,
      combo: this.combo
    };
  }
}
