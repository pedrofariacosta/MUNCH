// MUNCH — Sistema Central de Meta-Progressão e Desbloqueios (Fase 2)

(function() {
  const STORAGE_KEY = 'munch_meta_progression';

  const DEFAULT_SCHEMA = {
    version: 2,
    stats: {
      totalRunsCleared: 0,
      totalGoldSpentInShop: 0,
      totalEnemiesKilled: 0,
      highestMultAchieved: 1,
      totalPelletsEaten: 0
    },
    unlocked: {
      stakes: ['white'],
      slimes: ['classic'],
      themes: ['default', 'amber']
    },
    completionMarks: {
      classic: { white: false, red: false, gold: false },
      metallic: { white: false, red: false, gold: false },
      ballistic: { white: false, red: false, gold: false },
      gambler: { white: false, red: false, gold: false }
    },
    discoveredRelics: [],
    pendingUnlocks: []
  };

  const MetaProgression = {
    cache: null,

    // Inicializa carregando do LocalStorage ou executando migração
    init() {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          this.cache = JSON.parse(raw);
          // Validação e mescla de campos caso falte algo
          this.cache.stats = Object.assign({}, DEFAULT_SCHEMA.stats, this.cache.stats || {});
          this.cache.unlocked = Object.assign({}, DEFAULT_SCHEMA.unlocked, this.cache.unlocked || {});
          this.cache.completionMarks = Object.assign({}, DEFAULT_SCHEMA.completionMarks, this.cache.completionMarks || {});
          if (!Array.isArray(this.cache.discoveredRelics)) {
            let disc = [];
            try { disc = JSON.parse(localStorage.getItem('munch_discovered_relics') || '[]'); } catch(e) {}
            this.cache.discoveredRelics = disc;
          }
          if (!Array.isArray(this.cache.pendingUnlocks)) this.cache.pendingUnlocks = [];
        } catch (e) {
          console.warn('[MUNCH] Erro ao parsear meta-progressão, recriando:', e);
          this.cache = this.migrateLegacyData();
        }
      } else {
        this.cache = this.migrateLegacyData();
      }
      this.save();
      return this.cache;
    },

    // Salva o cache em memória no LocalStorage
    save() {
      if (!this.cache) return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.cache));
    },

    // Migração transparente de dados legados do jogador
    migrateLegacyData() {
      const data = JSON.parse(JSON.stringify(DEFAULT_SCHEMA));

      // 1. Contadores legados
      const legacyKills = parseInt(localStorage.getItem('munch_total_kills')) || 0;
      const legacyPellets = parseInt(localStorage.getItem('munch_total_pellets')) || 0;
      const legacyMaxMult = parseInt(localStorage.getItem('munch_max_mult')) || 1;

      data.stats.totalEnemiesKilled = legacyKills;
      data.stats.totalPelletsEaten = legacyPellets;
      data.stats.highestMultAchieved = legacyMaxMult;

      // 2. Histórico de runs legadas para inferir vitórias e completion marks
      const historyRaw = localStorage.getItem('munch_run_history') || '[]';
      let history = [];
      try { history = JSON.parse(historyRaw); } catch(e) { history = []; }

      let hasWhiteWin = localStorage.getItem('munch_unlocked_red_stake') === 'true';
      let hasRedWin = localStorage.getItem('munch_unlocked_gold_stake') === 'true';

      history.forEach(run => {
        if (run && run.cleared) {
          data.stats.totalRunsCleared++;
          const slime = run.slime || 'classic';
          const stake = run.stake || 'white';
          if (data.completionMarks[slime]) {
            data.completionMarks[slime][stake] = true;
          }
          if (stake === 'white') hasWhiteWin = true;
          if (stake === 'red') hasRedWin = true;
        }
      });

      if (hasWhiteWin) {
        if (!data.unlocked.stakes.includes('red')) data.unlocked.stakes.push('red');
        if (!data.unlocked.themes.includes('gameboy')) data.unlocked.themes.push('gameboy');
      }
      if (hasRedWin) {
        if (!data.unlocked.stakes.includes('gold')) data.unlocked.stakes.push('gold');
      }

      // 3. Avalia desbloqueios baseados nos dados migrados
      if (data.stats.totalEnemiesKilled >= 500 && !data.unlocked.slimes.includes('ballistic')) {
        data.unlocked.slimes.push('ballistic');
      }
      if (data.stats.highestMultAchieved >= 30 && !data.unlocked.slimes.includes('gambler')) {
        data.unlocked.slimes.push('gambler');
      }

      return data;
    },

    getState() {
      if (!this.cache) this.init();
      return this.cache;
    },

    getData() {
      const state = this.getState();
      return {
        ...state,
        totalKills: state.stats.totalEnemiesKilled,
        totalGoldSpent: state.stats.totalGoldSpentInShop,
        maxMultReached: state.stats.highestMultAchieved,
        totalPellets: state.stats.totalPelletsEaten
      };
    },

    // Métodos de consulta de desbloqueio
    isStakeUnlocked(stake) {
      const state = this.getState();
      return state.unlocked.stakes.includes(stake);
    },

    isSlimeUnlocked(slime) {
      const state = this.getState();
      return state.unlocked.slimes.includes(slime);
    },

    isThemeUnlocked(theme) {
      const state = this.getState();
      return state.unlocked.themes.includes(theme);
    },

    getCompletionMarks(slime) {
      const state = this.getState();
      return state.completionMarks[slime] || { white: false, red: false, gold: false };
    },

    // Notificações pendentes de novo desbloqueio
    queueUnlock(id, type, title, desc, icon = '🎉') {
      const state = this.getState();
      if (!state.pendingUnlocks.some(u => u.id === id)) {
        state.pendingUnlocks.push({ id, type, title, desc, icon });
        this.save();
      }
    },

    consumePendingUnlocks() {
      const state = this.getState();
      const list = [...state.pendingUnlocks];
      state.pendingUnlocks = [];
      this.save();
      return list;
    },

    // --- GATILHOS DE INCREMENTO E VERIFICAÇÃO ---

    // 1. Abates de Inimigos (Gatilho Slime Balístico)
    addKills(amount = 1) {
      const state = this.getState();
      state.stats.totalEnemiesKilled += amount;
      let justUnlocked = false;
      
      if (state.stats.totalEnemiesKilled >= 500 && !state.unlocked.slimes.includes('ballistic')) {
        state.unlocked.slimes.push('ballistic');
        this.queueUnlock(
          'slime_ballistic',
          'Slime',
          'SLIME BALÍSTICO',
          'Eliminou 500 inimigos somando todas as partidas!',
          '🎯'
        );
        justUnlocked = true;
      }
      this.save();
      return justUnlocked;
    },

    // 2. Ouro Gasto em Lojas / Vouchers (Gatilho Slime Mercenário)
    addGoldSpent(amount) {
      if (!amount || amount <= 0) return false;
      const state = this.getState();
      state.stats.totalGoldSpentInShop += amount;
      let justUnlocked = false;

      if (state.stats.totalGoldSpentInShop >= 500 && !state.unlocked.slimes.includes('metallic')) {
        state.unlocked.slimes.push('metallic');
        this.queueUnlock(
          'slime_metallic',
          'Slime',
          'SLIME MERCENÁRIO',
          'Acumulou 500 ouros gastos em lojas/vouchers!',
          '💰'
        );
        justUnlocked = true;
      }
      this.save();
      return justUnlocked;
    },

    // 3. Multiplicador Atingido (Gatilho Slime Gambler)
    checkMult(mult) {
      const state = this.getState();
      const rounded = Math.round(mult);
      if (rounded > state.stats.highestMultAchieved) {
        state.stats.highestMultAchieved = rounded;
      }

      if (rounded >= 30 && !state.unlocked.slimes.includes('gambler')) {
        state.unlocked.slimes.push('gambler');
        this.queueUnlock(
          'slime_gambler',
          'Slime',
          'SLIME GAMBLER',
          'Atingiu um multiplicador de x30 ou mais!',
          '🎲'
        );
        this.save();
        return true; // Acabou de desbloquear
      }
      this.save();
      return false;
    },

    // 4. Pastilhas Devoradas
    addPellet() {
      const state = this.getState();
      state.stats.totalPelletsEaten++;
      this.save();
    },

    // 4.1 Descoberta de Relíquia
    discoverRelic(relicId) {
      if (!relicId) return false;
      const state = this.getState();
      if (!Array.isArray(state.discoveredRelics)) state.discoveredRelics = [];
      if (!state.discoveredRelics.includes(relicId)) {
        state.discoveredRelics.push(relicId);
        this.save();
        return true;
      }
      return false;
    },

    // 5. Vitória na Run (Completion Mark + Stakes + Temas)
    recordVictory(slime, stake) {
      const state = this.getState();
      state.stats.totalRunsCleared++;

      const validSlime = slime || 'classic';
      const validStake = stake || 'white';

      // Registra Completion Mark
      if (!state.completionMarks[validSlime]) {
        state.completionMarks[validSlime] = { white: false, red: false, gold: false };
      }
      state.completionMarks[validSlime][validStake] = true;

      // Desbloqueia Tema Game Boy Green se for primeira vitória geral
      if (!state.unlocked.themes.includes('gameboy')) {
        state.unlocked.themes.push('gameboy');
        this.queueUnlock(
          'theme_gameboy',
          'Tema CRT',
          'GAME BOY GREEN',
          'Venceu uma partida completa em qualquer dificuldade!',
          '📟'
        );
      }

      // Progressão de Stakes
      if (validStake === 'white') {
        if (!state.unlocked.stakes.includes('red')) {
          state.unlocked.stakes.push('red');
          localStorage.setItem('munch_unlocked_red_stake', 'true');
          this.queueUnlock(
            'stake_red',
            'Dificuldade',
            'FICHA VERMELHA',
            'Concluiu o Nível 8 na Ficha Branca!',
            '🔴'
          );
        }
      } else if (validStake === 'red') {
        if (!state.unlocked.stakes.includes('gold')) {
          state.unlocked.stakes.push('gold');
          localStorage.setItem('munch_unlocked_gold_stake', 'true');
          this.queueUnlock(
            'stake_gold',
            'Dificuldade',
            'FICHA DOURADA',
            'Concluiu o Nível 8 na Ficha Vermelha!',
            '🟡'
          );
        }
      } else if (validStake === 'gold') {
        // Desbloqueia Tema Cyberpunk ao vencer na Dourada
        if (!state.unlocked.themes.includes('cyberpunk')) {
          state.unlocked.themes.push('cyberpunk');
          this.queueUnlock(
            'theme_cyberpunk',
            'Tema CRT',
            'CYBERPUNK NEON',
            'Conquistou a vitória suprema na Ficha Dourada!',
            '🌆'
          );
        }
      }

      this.save();
      return state;
    }
  };

  // Inicializa imediatamente
  MetaProgression.init();

  if (typeof window !== 'undefined') {
    window.MetaProgression = MetaProgression;
  }
  if (typeof global !== 'undefined') {
    global.MetaProgression = MetaProgression;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = MetaProgression;
  }
})();
