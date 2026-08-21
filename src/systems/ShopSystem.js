import { JOKERS_CATALOG, SHOP_REROLL_COST } from '../config/balance.js';

export class ShopSystem {
  constructor() {
    this.activeOffers = [];
    this.rerollCost = SHOP_REROLL_COST;
  }

  // Gera 3 ofertas aleatórias e únicas a partir do JOKERS_CATALOG
  generateOffers() {
    this.activeOffers = [];
    const pool = [...JOKERS_CATALOG];
    
    // Embaralha o catálogo (Fisher-Yates)
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    // Seleciona os 3 primeiros itens da lista e cria cópias deles
    for (let i = 0; i < Math.min(3, pool.length); i++) {
      this.activeOffers.push({
        ...pool[i],
        sold: false
      });
    }
    
    return this.activeOffers;
  }

  // Tenta realizar a compra de um item
  buyItem(offerIndex, playerState) {
    if (offerIndex < 0 || offerIndex >= this.activeOffers.length) return { success: false, reason: 'Slot inválido' };
    
    const offer = this.activeOffers[offerIndex];
    if (offer.sold) return { success: false, reason: 'Item já comprado' };
    
    // Verifica se o jogador tem ouro suficiente
    if (playerState.gold < offer.cost) {
      return { success: false, reason: 'Ouro insuficiente' };
    }
    
    // Limita o inventário a no máximo 5 coringas
    const inventoryCount = playerState.jokers.length;
    if (inventoryCount >= 5) {
      return { success: false, reason: 'Inventário cheio (máximo 5)' };
    }

    // Processa a compra deduzindo o ouro e guardando o coringa
    playerState.gold -= offer.cost;
    offer.sold = true;
    playerState.jokers.push(offer);

    return { success: true, item: offer };
  }

  // Executa o reroll das ofertas da loja
  reroll(playerState) {
    if (playerState.gold < this.rerollCost) {
      return false;
    }
    
    playerState.gold -= this.rerollCost;
    this.generateOffers();
    return true;
  }
}
