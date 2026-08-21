// Configurações de balanceamento, progressão e catálogo de itens

export const PELLET_SCORES = {
  NORMAL: { chips: 10, mult: 1 },
  GOLD: { chips: 50, mult: 2 },
  POWER: { chips: 100, mult: 4 }
};

// Calcula a pontuação necessária (Meta Blind) para cada fase
export function getBlindScore(stage) {
  if (stage === 1) return 1500;
  if (stage === 2) return 4000;
  if (stage === 3) return 10000;
  if (stage === 4) return 22000;
  if (stage === 5) return 50000;
  // Aumenta exponencialmente a partir da fase 5
  return Math.floor(50000 * Math.pow(2.2, stage - 5));
}

// Recompensa em moedas ao completar uma fase
export function getStageCoinReward(stage, livesRemaining, scoreFraction) {
  // Base de 3 moedas + moedas por vida restante
  return 3 + livesRemaining + Math.floor(scoreFraction * 2);
}

// Custo para atualizar a loja (reroll)
export const SHOP_REROLL_COST = 2;

// Catálogo de Coringas/Relíquias passivas (inspirado em Balatro)
export const JOKERS_CATALOG = [
  {
    id: 'slime_booster',
    name: 'Slime Booster',
    desc: '+15 Chips para cada orbe comido.',
    icon: '🔮',
    cost: 4,
    rarity: 'Common',
    modifyScore: (score, context) => {
      score.chips += 15;
      return score;
    }
  },
  {
    id: 'sugar_rush',
    name: 'Sugar Rush',
    desc: '+3 Mult se a vida estiver cheia.',
    icon: '🍬',
    cost: 5,
    rarity: 'Common',
    modifyScore: (score, context) => {
      if (context.playerHealth === context.playerMaxHealth) {
        score.mult += 3;
      }
      return score;
    }
  },
  {
    id: 'combo_master',
    name: 'Combo Master',
    desc: 'Cada combo de 5 orbes dá +1 de Mult.',
    icon: '⚡',
    cost: 7,
    rarity: 'Uncommon',
    modifyScore: (score, context) => {
      const comboMult = Math.floor(context.combo / 5);
      score.mult += comboMult;
      return score;
    }
  },
  {
    id: 'golden_tooth',
    name: 'Golden Tooth',
    desc: 'Orbes dourados dão +50 Chips extras.',
    icon: '🪙',
    cost: 6,
    rarity: 'Uncommon',
    modifyScore: (score, context) => {
      if (context.pelletType === 'GOLD') {
        score.chips += 50;
      }
      return score;
    }
  },
  {
    id: 'heavy_blaster',
    name: 'Heavy Blaster',
    desc: 'Aumenta o atordoamento dos inimigos em 1.5s.',
    icon: '🔫',
    cost: 5,
    rarity: 'Common',
    modifyStats: (stats) => {
      stats.stunDurationMultiplier = (stats.stunDurationMultiplier || 1) + 0.5;
      return stats;
    }
  },
  {
    id: 'vault_sandals',
    name: 'Vault Sandals',
    desc: 'Tempo de recarga do Pulo reduzido em 25%.',
    icon: '👡',
    cost: 6,
    rarity: 'Common',
    modifyStats: (stats) => {
      stats.vaultCooldownMultiplier = (stats.vaultCooldownMultiplier || 1) - 0.25;
      return stats;
    }
  },
  {
    id: 'rage_slime',
    name: 'Rage Slime',
    desc: 'x1.5 Mult se houver 2 ou mais fantasmas ativos.',
    icon: '💢',
    cost: 8,
    rarity: 'Rare',
    modifyScore: (score, context) => {
      if (context.activeEnemiesCount >= 2) {
        score.mult = Math.max(1, Math.round(score.mult * 1.5));
      }
      return score;
    }
  },
  {
    id: 'coin_collector',
    name: 'Tax Refund',
    desc: 'Recebe +3 moedas ao passar de fase.',
    icon: '💸',
    cost: 5,
    rarity: 'Common',
    modifyStats: (stats) => {
      stats.stageCompletionGoldBonus = (stats.stageCompletionGoldBonus || 0) + 3;
      return stats;
    }
  },
  {
    id: 'overdrive',
    name: 'Overdrive',
    desc: '+60 Chips, mas recarga do Laser aumenta 20%.',
    icon: '🌀',
    cost: 6,
    rarity: 'Uncommon',
    modifyScore: (score, context) => {
      score.chips += 60;
      return score;
    },
    modifyStats: (stats) => {
      stats.blasterCooldownMultiplier = (stats.blasterCooldownMultiplier || 1) + 0.2;
      return stats;
    }
  },
  {
    id: 'lucky_seven',
    name: 'Lucky Seven',
    desc: '14% de chance de ganhar 1 moeda ao comer orbes.',
    icon: '🎲',
    cost: 8,
    rarity: 'Rare',
    onEatPellet: (playerState) => {
      if (Math.random() < 0.14) {
        playerState.gold += 1;
        return true; // Retorna true para sinalizar que ganhou a moeda
      }
      return false;
    }
  }
];
