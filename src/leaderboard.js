// MUNCH — Serviço de Ranking Local (Top 5 por Categoria / Stake via LocalStorage)

(function() {
  const MunchLeaderboard = {
    // Retorna os 5 maiores recordes para a categoria/stake informada ('white', 'red', 'gold')
    async getTopScoresByStake(stake = 'white') {
      return this.getLocalFallbackScores(stake);
    },

    // Envia o recorde para a categoria correspondente e armazena localmente
    async submitScore(playerName, score, ante, stake = 'white') {
      const entry = {
        name: (playerName || "SLIME_ANONIMO").toUpperCase().trim().slice(0, 12),
        score: Math.round(score),
        ante: ante || 1,
        stake: stake || 'white',
        date: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now()
      };

      this.saveLocalScore(stake, entry);
      return entry;
    },

    // Verifica se uma pontuação entra no Top 5 da categoria
    async isTop5(stake, score) {
      if (score <= 0) return false;
      const topScores = await this.getTopScoresByStake(stake);
      if (topScores.length < 5) return true;
      return score > topScores[topScores.length - 1].score;
    },

    // Leitura dos recordes salvos no localStorage por categoria
    getLocalFallbackScores(stake = 'white') {
      const localRaw = localStorage.getItem(`munch_leaderboard_${stake}`) || '[]';
      try {
        const list = JSON.parse(localRaw);
        list.sort((a, b) => b.score - a.score);
        return list.slice(0, 5);
      } catch (e) {
        return [];
      }
    },

    // Gravação dos recordes no localStorage
    saveLocalScore(stake, entry) {
      const list = this.getLocalFallbackScores(stake);
      list.push(entry);
      list.sort((a, b) => b.score - a.score);
      localStorage.setItem(`munch_leaderboard_${stake}`, JSON.stringify(list.slice(0, 10)));
    }
  };

  window.MunchLeaderboard = MunchLeaderboard;
})();
