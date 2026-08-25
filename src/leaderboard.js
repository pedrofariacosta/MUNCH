// MUNCH — Serviço de Ranking Híbrido (Online Upstash Redis + Fallback LocalStorage)

(function() {
  const MunchLeaderboard = {
    // Retorna os 5 maiores recordes da Stake (Online primeiro, fallback LocalStorage)
    async getTopScoresByStake(stake = 'white') {
      try {
        const response = await fetch(`/api/leaderboard?stake=${stake}`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          const onlineScores = await response.json();
          if (Array.isArray(onlineScores)) {
            // Atualiza o cache local de segurança com os dados mais recentes da nuvem
            localStorage.setItem(`munch_leaderboard_${stake}`, JSON.stringify(onlineScores));
            return onlineScores;
          }
        }
      } catch (err) {
        console.warn(`[MUNCH] Falha ao consultar ranking online (${stake}), usando cache local.`);
      }

      // Se falhar a conexão ou estiver vazio, retorna os dados locais
      return this.getLocalFallbackScores(stake);
    },

    // Envia o recorde para a API online e persiste também localmente
    async submitScore(playerName, score, ante, stake = 'white') {
      const entry = {
        name: (playerName || "SLIME_ANONIMO").toUpperCase().trim().slice(0, 12),
        score: Math.round(score),
        ante: ante || 1,
        stake: stake || 'white',
        date: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now()
      };

      // 1. Grava no LocalStorage imediatamente
      this.saveLocalScore(stake, entry);

      // 2. Envia para a nuvem em segundo plano
      try {
        await fetch('/api/leaderboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry)
        });
      } catch (err) {
        console.warn('[MUNCH] Erro ao sincronizar pontuação na nuvem:', err);
      }

      return entry;
    },

    // Verifica se a pontuação entra no Top 5 da categoria
    async isTop5(stake, score) {
      if (score <= 0) return false;
      const topScores = await this.getTopScoresByStake(stake);
      if (topScores.length < 5) return true;
      return score > topScores[topScores.length - 1].score;
    },

    // Leitura dos recordes salvos no localStorage
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
