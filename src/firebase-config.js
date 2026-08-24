// MUNCH - Serviço de Ranking Global (Top 5 por Categoria/Stake) via Firebase & Local Fallback

(function() {
  // Configuração padrão do projeto Firebase munch-cbbd5 (chaves privadas vêm do window.MUNCH_FIREBASE_CONFIG via env.js)
  const defaultConfig = {
    apiKey: "",
    authDomain: "munch-cbbd5.firebaseapp.com",
    projectId: "munch-cbbd5",
    storageBucket: "munch-cbbd5.firebasestorage.app",
    messagingSenderId: "218078253246",
    appId: "1:218078253246:web:0e3e36cab291b933b70eef",
    databaseURL: "https://munch-cbbd5-default-rtdb.firebaseio.com"
  };

  const config = window.MUNCH_FIREBASE_CONFIG || defaultConfig;
  
  let dbUrl = config.databaseURL || localStorage.getItem('munch_firebase_db_url') || "";
  if (!dbUrl && config.projectId) {
    dbUrl = `https://${config.projectId}-default-rtdb.firebaseio.com`;
  }

  const MunchLeaderboard = {

    // Retorna os 5 maiores recordes de todos os tempos para a categoria/stake informada ('white', 'red', 'gold')
    async getTopScoresByStake(stake = 'white') {
      if (!dbUrl && (!config || !config.projectId)) {
        return this.getLocalFallbackScores(stake);
      }

      try {
        // Tenta buscar no Realtime Database primeiro
        const rtdbUrl = `${dbUrl.replace(/\/$/, '')}/scores/${stake}.json?orderBy="score"&limitToLast=5`;
        const response = await fetch(rtdbUrl);
        if (response.ok) {
          const data = await response.json();
          if (data && typeof data === 'object') {
            const list = Object.values(data);
            list.sort((a, b) => b.score - a.score);
            return list.slice(0, 5);
          }
        }

        // Tenta buscar no nó geral se não houver subpasta
        const altUrl = `${dbUrl.replace(/\/$/, '')}/scores.json?orderBy="score"&limitToLast=20`;
        const altRes = await fetch(altUrl);
        if (altRes.ok) {
          const altData = await altRes.json();
          if (altData && typeof altData === 'object') {
            const list = Object.values(altData).filter(item => item.stake === stake || (!item.stake && stake === 'white'));
            list.sort((a, b) => b.score - a.score);
            return list.slice(0, 5);
          }
        }

        return this.getLocalFallbackScores(stake);
      } catch (err) {
        console.warn(`[MUNCH FIREBASE] Não foi possível conectar ao Firebase. Usando ranking local (${stake}).`, err);
        return this.getLocalFallbackScores(stake);
      }
    },

    // Envia o recorde para a categoria correspondente
    async submitScore(playerName, score, ante, stake = 'white') {
      const entry = {
        name: (playerName || "SLIME_ANONIMO").toUpperCase().trim().slice(0, 12),
        score: Math.round(score),
        ante: ante || 1,
        stake: stake || 'white',
        date: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now()
      };

      // Salva no fallback local por categoria
      this.saveLocalScore(stake, entry);

      if (!dbUrl && (!config || !config.projectId)) {
        return entry;
      }

      try {
        // Envia para Realtime Database na pasta da categoria
        if (dbUrl) {
          fetch(`${dbUrl.replace(/\/$/, '')}/scores/${stake}.json`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entry)
          }).catch(e => console.log("[MUNCH RTDB]", e));
        }

        // Envia para Firestore
        if (config.projectId) {
          const fsUrl = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/(default)/documents/scores_${stake}`;
          const fsPayload = {
            fields: {
              name: { stringValue: entry.name },
              score: { integerValue: entry.score },
              ante: { integerValue: entry.ante },
              stake: { stringValue: entry.stake },
              date: { stringValue: entry.date },
              timestamp: { integerValue: entry.timestamp }
            }
          };
          fetch(fsUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fsPayload)
          }).catch(e => console.log("[MUNCH FIRESTORE]", e));
        }
      } catch (err) {
        console.error("[MUNCH FIREBASE] Erro ao enviar recorde:", err);
      }

      return entry;
    },

    // Verifica se uma pontuação entra no Top 5 da categoria
    async isTop5(stake, score) {
      if (score <= 0) return false;
      const topScores = await this.getTopScoresByStake(stake);
      if (topScores.length < 5) return true;
      return score > topScores[topScores.length - 1].score;
    },

    // Fallback Local por Categoria
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

    saveLocalScore(stake, entry) {
      const list = this.getLocalFallbackScores(stake);
      list.push(entry);
      list.sort((a, b) => b.score - a.score);
      localStorage.setItem(`munch_leaderboard_${stake}`, JSON.stringify(list.slice(0, 10)));
    }
  };

  window.MunchLeaderboard = MunchLeaderboard;
})();
