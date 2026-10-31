// MUNCH — Sistema Central de Conquistas e Sala de Troféus (Platina)

(function () {
  const STORAGE_KEY = 'munch_unlocked_achievements';

  // Definição dos 35 Troféus do Jogo
  const ACHIEVEMENTS_LIST = [
    // ----------------------------------------------------
    // 1. GULA & PASTILHAS (7 Troféus)
    // ----------------------------------------------------
    {
      id: 'ach_pellet_1',
      name: 'Primeira Mordida',
      tier: 'bronze',
      icon: '🍪',
      category: 'pellets',
      desc: 'Devore sua 1ª pastilha no jogo.',
      max: 1,
      getProgress: (s) => Math.min(1, s.totalPellets || 0)
    },
    {
      id: 'ach_pellet_1000',
      name: 'Apetite Voraz',
      tier: 'bronze',
      icon: '😋',
      category: 'pellets',
      desc: 'Devore 1.000 pastilhas no total acumulado.',
      max: 1000,
      getProgress: (s) => Math.min(1000, s.totalPellets || 0)
    },
    {
      id: 'ach_pellet_10000',
      name: 'Limpeza Geral',
      tier: 'silver',
      icon: '🧹',
      category: 'pellets',
      desc: 'Devore 10.000 pastilhas acumuladas.',
      max: 10000,
      getProgress: (s) => Math.min(10000, s.totalPellets || 0)
    },
    {
      id: 'ach_pellet_50000',
      name: 'A Máquina de Comer',
      tier: 'silver',
      icon: '🍽️',
      category: 'pellets',
      desc: 'Devore 50.000 pastilhas acumuladas.',
      max: 50000,
      getProgress: (s) => Math.min(50000, s.totalPellets || 0)
    },
    {
      id: 'ach_pellet_200000',
      name: 'Buraco Negro de Gosma',
      tier: 'gold',
      icon: '🌌',
      category: 'pellets',
      desc: 'Devore 200.000 pastilhas acumuladas.',
      max: 200000,
      getProgress: (s) => Math.min(200000, s.totalPellets || 0)
    },
    {
      id: 'ach_pellet_500000',
      name: 'Devorador de Mundos',
      tier: 'gold',
      icon: '🪐',
      category: 'pellets',
      desc: 'Devore 500.000 pastilhas acumuladas somando todas as runs.',
      max: 500000,
      getProgress: (s) => Math.min(500000, s.totalPellets || 0)
    },
    {
      id: 'ach_pellet_1000000',
      name: 'A Fome Infinita',
      tier: 'gold',
      icon: '♾️',
      category: 'pellets',
      desc: 'Devore 1.000.000 de pastilhas acumuladas!',
      max: 1000000,
      getProgress: (s) => Math.min(1000000, s.totalPellets || 0)
    },

    // ----------------------------------------------------
    // 2. COMBATE & ELIMINAÇÕES (5 Troféus)
    // ----------------------------------------------------
    {
      id: 'ach_kill_1',
      name: 'Primeiro Sangue',
      tier: 'bronze',
      icon: '💥',
      category: 'combat',
      desc: 'Elimine seu 1º fantasma com o Blaster.',
      max: 1,
      getProgress: (s) => Math.min(1, s.totalKills || 0)
    },
    {
      id: 'ach_kill_100',
      name: 'Tiro ao Alvo',
      tier: 'bronze',
      icon: '🎯',
      category: 'combat',
      desc: 'Elimine 100 inimigos acumulados no total.',
      max: 100,
      getProgress: (s) => Math.min(100, s.totalKills || 0)
    },
    {
      id: 'ach_kill_1000',
      name: 'Caçador Implacável',
      tier: 'silver',
      icon: '⚔️',
      category: 'combat',
      desc: 'Elimine 1.000 inimigos somando todas as runs.',
      max: 1000,
      getProgress: (s) => Math.min(1000, s.totalKills || 0)
    },
    {
      id: 'ach_kill_10000',
      name: 'Exterminador do Labirinto',
      tier: 'gold',
      icon: '💀',
      category: 'combat',
      desc: 'Elimine 10.000 inimigos acumulados.',
      max: 10000,
      getProgress: (s) => Math.min(10000, s.totalKills || 0)
    },
    {
      id: 'ach_kill_100000',
      name: 'Pesadelo dos Fantasmas',
      tier: 'gold',
      icon: '🔥',
      category: 'combat',
      desc: 'Elimine 100.000 inimigos acumulados!',
      max: 100000,
      getProgress: (s) => Math.min(100000, s.totalKills || 0)
    },

    // ----------------------------------------------------
    // 3. SLIMES & RELÍQUIAS (6 Troféus)
    // ----------------------------------------------------
    {
      id: 'ach_slime_mercenary',
      name: 'Sangue de Mercenário',
      tier: 'silver',
      icon: '🧪',
      category: 'slimes',
      desc: 'Desbloqueie o Slime Mercenário (Gaste 500 ouros em lojas).',
      max: 500,
      getProgress: (s) => Math.min(500, s.totalGoldSpent || 0),
      isUnlocked: (s) => s.slimesUnlocked && s.slimesUnlocked.includes('metallic')
    },
    {
      id: 'ach_slime_ballistic',
      name: 'Pólvora Pura',
      tier: 'silver',
      icon: '💣',
      category: 'slimes',
      desc: 'Desbloqueie o Slime Balístico (Elimine 500 inimigos).',
      max: 500,
      getProgress: (s) => Math.min(500, s.totalKills || 0),
      isUnlocked: (s) => s.slimesUnlocked && s.slimesUnlocked.includes('ballistic')
    },
    {
      id: 'ach_slime_gambler',
      name: 'Sorte Grande',
      tier: 'silver',
      icon: '🎲',
      category: 'slimes',
      desc: 'Desbloqueie o Slime Gambler (Atingir Mult >= x30).',
      max: 30,
      getProgress: (s) => Math.min(30, s.maxMult || 1),
      isUnlocked: (s) => s.slimesUnlocked && s.slimesUnlocked.includes('gambler')
    },
    {
      id: 'ach_all_slimes',
      name: 'Esquadrão de Gosmas',
      tier: 'gold',
      icon: '👑',
      category: 'slimes',
      desc: 'Desbloqueie todos os 4 Slimes jogáveis do jogo!',
      max: 4,
      getProgress: (s) => (s.slimesUnlocked ? s.slimesUnlocked.length : 1),
      isUnlocked: (s) => s.slimesUnlocked && s.slimesUnlocked.length >= 4
    },
    {
      id: 'ach_relics_half',
      name: 'Arqueólogo Curioso',
      tier: 'silver',
      icon: '📜',
      category: 'slimes',
      desc: 'Descubra metade das relíquias (13 de 25) no Compêndio.',
      max: 13,
      getProgress: (s) => Math.min(13, s.discoveredRelicsCount || 0),
      isUnlocked: (s) => (s.discoveredRelicsCount || 0) >= 13
    },
    {
      id: 'ach_relics_all',
      name: 'Colecionador Lendário',
      tier: 'gold',
      icon: '🃏',
      category: 'slimes',
      desc: 'Descubra e registre todas as 25 relíquias no Compêndio (100%).',
      max: 25,
      getProgress: (s) => Math.min(25, s.discoveredRelicsCount || 0),
      isUnlocked: (s) => (s.discoveredRelicsCount || 0) >= 25
    },

    // ----------------------------------------------------
    // 4. ECONOMIA & COMÉRCIO (4 Troféus)
    // ----------------------------------------------------
    {
      id: 'ach_gold_hoarder',
      name: 'Cofrinho Cheio',
      tier: 'bronze',
      icon: '🪙',
      category: 'economy',
      desc: 'Guarde 100 moedas de ouro em uma única partida.',
      max: 100,
      getProgress: (s) => Math.min(100, s.maxGoldHeld || 0),
      isUnlocked: (s) => (s.maxGoldHeld || 0) >= 100
    },
    {
      id: 'ach_gold_spent_500',
      name: 'Mão Aberta',
      tier: 'silver',
      icon: '🛍️',
      category: 'economy',
      desc: 'Gaste 500 moedas acumuladas em lojas.',
      max: 500,
      getProgress: (s) => Math.min(500, s.totalGoldSpent || 0)
    },
    {
      id: 'ach_gold_spent_5000',
      name: 'Capitalista Selvagem',
      tier: 'silver',
      icon: '💎',
      category: 'economy',
      desc: 'Gaste 5.000 moedas acumuladas em lojas.',
      max: 5000,
      getProgress: (s) => Math.min(5000, s.totalGoldSpent || 0)
    },
    {
      id: 'ach_gold_spent_25000',
      name: 'Magnata do Submundo',
      tier: 'gold',
      icon: '🏦',
      category: 'economy',
      desc: 'Gaste 25.000 moedas acumuladas em lojas!',
      max: 25000,
      getProgress: (s) => Math.min(25000, s.totalGoldSpent || 0)
    },

    // ----------------------------------------------------
    // 5. HABILIDADE, PULO & CHEFES (5 Troféus)
    // ----------------------------------------------------
    {
      id: 'ach_close_call_1',
      name: 'Salto Ornamental',
      tier: 'bronze',
      icon: '🦘',
      category: 'skills',
      desc: 'Salte por cima de um monstro para escapar no ar (bônus de esquiva).',
      max: 1,
      getProgress: (s) => Math.min(1, s.totalCloseCalls || 0)
    },
    {
      id: 'ach_close_call_50',
      name: 'Acrobata Experiente',
      tier: 'silver',
      icon: '🎪',
      category: 'skills',
      desc: 'Realize 50 esquivas aéreas no total acumulado.',
      max: 50,
      getProgress: (s) => Math.min(50, s.totalCloseCalls || 0)
    },
    {
      id: 'ach_close_call_250',
      name: 'Mestre da Gravidade',
      tier: 'gold',
      icon: '🌠',
      category: 'skills',
      desc: 'Realize 250 esquivas aéreas no total acumulado!',
      max: 250,
      getProgress: (s) => Math.min(250, s.totalCloseCalls || 0)
    },
    {
      id: 'ach_boss_1',
      name: 'Derrubador de Chefes',
      tier: 'silver',
      icon: '👹',
      category: 'skills',
      desc: 'Supere o seu 1º Chefe no 3º estágio de qualquer nível.',
      max: 1,
      getProgress: (s) => Math.min(1, s.totalBossesDefeated || 0)
    },
    {
      id: 'ach_boss_50',
      name: 'Terror dos Chefes',
      tier: 'gold',
      icon: '👑',
      category: 'skills',
      desc: 'Derrote 50 Chefes no total somando todas as runs.',
      max: 50,
      getProgress: (s) => Math.min(50, s.totalBossesDefeated || 0)
    },

    // ----------------------------------------------------
    // 6. PONTUAÇÃO & MULTIPLICADORES (6 Troféus)
    // ----------------------------------------------------
    {
      id: 'ach_mult_10',
      name: 'Aquecendo os Motores',
      tier: 'bronze',
      icon: '⚡',
      category: 'score',
      desc: 'Alcance um Multiplicador >= x10 em jogo.',
      max: 10,
      getProgress: (s) => Math.min(10, s.maxMult || 1)
    },
    {
      id: 'ach_mult_30',
      name: 'Zona Caótica',
      tier: 'silver',
      icon: '🌪️',
      category: 'score',
      desc: 'Alcance um Multiplicador >= x30 em jogo.',
      max: 30,
      getProgress: (s) => Math.min(30, s.maxMult || 1)
    },
    {
      id: 'ach_mult_50',
      name: 'Combo Cósmico',
      tier: 'gold',
      icon: '🌟',
      category: 'score',
      desc: 'Alcance um Multiplicador >= x50 em jogo.',
      max: 50,
      getProgress: (s) => Math.min(50, s.maxMult || 1)
    },
    {
      id: 'ach_score_1m',
      name: 'Primeiro Milhão',
      tier: 'silver',
      icon: '💰',
      category: 'score',
      desc: 'Obtenha 1.000.000 de pontos em uma partida.',
      max: 1000000,
      getProgress: (s) => Math.min(1000000, s.bestScore || 0)
    },
    {
      id: 'ach_score_10m',
      name: 'Lenda do Arcade',
      tier: 'gold',
      icon: '👾',
      category: 'score',
      desc: 'Obtenha 10.000.000 de pontos em uma única partida (Endless).',
      max: 10000000,
      getProgress: (s) => Math.min(10000000, s.bestScore || 0)
    },
    {
      id: 'ach_score_50m',
      name: 'Quebrador de Placas',
      tier: 'gold',
      icon: '🕹️',
      category: 'score',
      desc: 'Obtenha 50.000.000 de pontos em uma partida.',
      max: 50000000,
      getProgress: (s) => Math.min(50000000, s.bestScore || 0)
    },

    // ----------------------------------------------------
    // 7. CONCLUSÕES & DIFICULDADES (5 Troféus)
    // ----------------------------------------------------
    {
      id: 'ach_clear_white',
      name: 'Ficha Branca Dominada',
      tier: 'gold',
      icon: '⚪',
      category: 'stakes',
      desc: 'Conclua o Nível 8 na Ficha Branca (Vitória Padrão).',
      max: 1,
      getProgress: (s) => (s.clearedWhite ? 1 : 0),
      isUnlocked: (s) => !!s.clearedWhite
    },
    {
      id: 'ach_clear_red',
      name: 'Ficha Vermelha Dominada',
      tier: 'gold',
      icon: '🔴',
      category: 'stakes',
      desc: 'Conclua o Nível 8 na Ficha Vermelha (Inimigos mais velozes).',
      max: 1,
      getProgress: (s) => (s.clearedRed ? 1 : 0),
      isUnlocked: (s) => !!s.clearedRed
    },
    {
      id: 'ach_clear_gold',
      name: 'Mestre da Ficha Dourada',
      tier: 'gold',
      icon: '🟡',
      category: 'stakes',
      desc: 'Conclua uma partida na Ficha Dourada (Dificuldade Máxima).',
      max: 1,
      getProgress: (s) => (s.clearedGold ? 1 : 0),
      isUnlocked: (s) => !!s.clearedGold
    },
    {
      id: 'ach_endless_12',
      name: 'Além do Infinito',
      tier: 'gold',
      icon: '🚀',
      category: 'stakes',
      desc: 'Alcance o Nível 12 ou superior no Modo Sem Fim (Endless).',
      max: 12,
      getProgress: (s) => Math.min(12, s.maxAnteReached || 1),
      isUnlocked: (s) => (s.maxAnteReached || 1) >= 12
    },
    {
      id: 'ach_all_slimes_gold',
      name: 'Quarteto Fantástico',
      tier: 'gold',
      icon: '🎖️',
      category: 'stakes',
      desc: 'Conclua na Ficha Dourada com cada um dos 4 Slimes (Matriz 100%).',
      max: 4,
      getProgress: (s) => (s.goldMarksCount || 0),
      isUnlocked: (s) => (s.goldMarksCount || 0) >= 4
    },

    // ----------------------------------------------------
    // 8. O TROFÉU SUPREMO DE PLATINA (1 Troféu)
    // ----------------------------------------------------
    {
      id: 'ach_platinum',
      name: 'PLATINA // MUNCH SUPREMO',
      tier: 'platinum',
      icon: '💎',
      category: 'platinum',
      desc: 'Desbloqueie todas as outras 38 conquistas do jogo!',
      max: 38,
      getProgress: (s, unlockedMap) => {
        let count = 0;
        ACHIEVEMENTS_LIST.forEach(a => {
          if (a.id !== 'ach_platinum' && unlockedMap && unlockedMap[a.id]) count++;
        });
        return count;
      },
      isUnlocked: (s, unlockedMap) => {
        let count = 0;
        ACHIEVEMENTS_LIST.forEach(a => {
          if (a.id !== 'ach_platinum' && unlockedMap && unlockedMap[a.id]) count++;
        });
        return count >= 38;
      }
    }
  ];

  class AchievementManager {
    constructor() {
      this.achievements = ACHIEVEMENTS_LIST;
      this.unlocked = this.loadUnlocked();
      this.toastQueue = [];
      this.isShowingToast = false;

      // Executa verificação inicial retroativa
      this.checkAll();
    }

    loadUnlocked() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
      } catch (e) {
        return {};
      }
    }

    saveUnlocked() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.unlocked));
      } catch (e) { }
    }

    // Coleta todas as estatísticas atuais gravadas no localStorage
    getGlobalStats() {
      let slimesUnlocked = ['classic'];
      let goldMarksCount = 0;
      let clearedWhite = false;
      let clearedRed = false;
      let clearedGold = false;
      let metaGoldSpent = 0;

      try {
        const rawMeta = JSON.parse(localStorage.getItem('munch_meta_progression') || '{}');
        if (rawMeta.unlocked && Array.isArray(rawMeta.unlocked.slimes)) {
          slimesUnlocked = rawMeta.unlocked.slimes;
        } else if (Array.isArray(rawMeta.unlockedSlimes)) {
          slimesUnlocked = rawMeta.unlockedSlimes;
        }

        if (rawMeta.stats && rawMeta.stats.totalGoldSpentInShop) {
          metaGoldSpent = parseInt(rawMeta.stats.totalGoldSpentInShop) || 0;
        }

        if (rawMeta.completionMarks) {
          clearedWhite = Object.values(rawMeta.completionMarks).some(m => m && m.white);
          clearedRed = Object.values(rawMeta.completionMarks).some(m => m && m.red);
          clearedGold = Object.values(rawMeta.completionMarks).some(m => m && m.gold);
          goldMarksCount = Object.values(rawMeta.completionMarks).filter(m => m && m.gold).length;
        }
      } catch (e) { }

      // Relíquias descobertas
      let discoveredRelicsCount = 0;
      try {
        const disc1 = JSON.parse(localStorage.getItem('munch_discovered_relics') || '[]');
        const disc2 = JSON.parse(localStorage.getItem('unlockedRelics') || '[]');
        discoveredRelicsCount = Array.from(new Set([...disc1, ...disc2])).length;
      } catch (e) { }

      const rawGoldSpent = parseInt(localStorage.getItem('munch_total_gold_spent')) || 0;
      const totalGoldSpent = Math.max(rawGoldSpent, metaGoldSpent);

      return {
        totalKills: parseInt(localStorage.getItem('munch_total_kills')) || 0,
        totalPellets: parseInt(localStorage.getItem('munch_total_pellets')) || 0,
        totalGoldSpent: totalGoldSpent,
        maxGoldHeld: parseInt(localStorage.getItem('munch_max_gold_held')) || 0,
        maxMult: parseInt(localStorage.getItem('munch_max_mult')) || 1,
        bestScore: parseInt(localStorage.getItem('munch_best_round_score')) || 0,
        maxAnteReached: parseInt(localStorage.getItem('munch_max_ante_reached')) || 1,
        totalCloseCalls: parseInt(localStorage.getItem('munch_total_close_calls')) || 0,
        totalBossesDefeated: parseInt(localStorage.getItem('munch_total_bosses_defeated')) || 0,
        slimesUnlocked,
        discoveredRelicsCount,
        clearedWhite,
        clearedRed,
        clearedGold,
        goldMarksCount
      };
    }

    // Verifica todos os requisitos e desbloqueia troféus pendentes
    checkAll(silent = true) {
      const stats = this.getGlobalStats();
      let newlyUnlocked = [];

      // 1. Checa as 34 conquistas normais
      this.achievements.forEach(ach => {
        if (ach.id === 'ach_platinum') return;
        if (this.unlocked[ach.id]) return;

        let shouldUnlock = false;
        if (ach.isUnlocked) {
          shouldUnlock = ach.isUnlocked(stats, this.unlocked);
        } else if (ach.getProgress) {
          shouldUnlock = ach.getProgress(stats, this.unlocked) >= ach.max;
        }

        if (shouldUnlock) {
          this.unlocked[ach.id] = {
            date: new Date().toLocaleDateString('pt-BR')
          };
          newlyUnlocked.push(ach);
        }
      });

      // 2. Checa o Troféu de Platina
      const platAch = this.achievements.find(a => a.id === 'ach_platinum');
      if (platAch && !this.unlocked['ach_platinum']) {
        if (platAch.isUnlocked(stats, this.unlocked)) {
          this.unlocked['ach_platinum'] = {
            date: new Date().toLocaleDateString('pt-BR')
          };
          newlyUnlocked.push(platAch);
        }
      }

      if (newlyUnlocked.length > 0) {
        this.saveUnlocked();
        if (!silent) {
          newlyUnlocked.forEach(ach => this.enqueueToast(ach));
        }
      }

      return newlyUnlocked;
    }

    // Registrador de estatísticas com checagem automática
    recordStat(key, value, isAdditive = false) {
      try {
        let current = parseInt(localStorage.getItem(key)) || 0;
        let updated = isAdditive ? (current + value) : Math.max(current, value);
        localStorage.setItem(key, updated.toString());
      } catch (e) { }

      // Checa se alguma conquista foi batida e exibe toast comemorativo
      this.checkAll(false);
    }

    recordPellet(count = 1) {
      this.recordStat('munch_total_pellets', count, true);
    }

    recordKill(count = 1) {
      this.recordStat('munch_total_kills', count, true);
    }

    recordGoldSpent(coins = 0) {
      this.recordStat('munch_total_gold_spent', coins, true);
    }

    recordGoldHeld(currentGold = 0) {
      this.recordStat('munch_max_gold_held', currentGold, false);
    }

    recordCloseCall(count = 1) {
      this.recordStat('munch_total_close_calls', count, true);
    }

    recordBossDefeated(count = 1) {
      this.recordStat('munch_total_bosses_defeated', count, true);
    }

    recordMult(mult = 1) {
      this.recordStat('munch_max_mult', mult, false);
    }

    recordScore(score = 0) {
      this.recordStat('munch_best_round_score', score, false);
    }

    recordAnte(ante = 1) {
      this.recordStat('munch_max_ante_reached', ante, false);
    }

    isUnlocked(achId) {
      return !!this.unlocked[achId];
    }

    getUnlockedCount() {
      return Object.keys(this.unlocked).length;
    }

    getTotalCount() {
      return this.achievements.length;
    }

    getPlatinumProgress() {
      const unlockedCount = this.getUnlockedCount();
      const total = this.getTotalCount();
      const pct = Math.min(100, Math.round((unlockedCount / total) * 100));
      return {
        unlocked: unlockedCount,
        total: total,
        percentage: pct,
        isPlat: !!this.unlocked['ach_platinum']
      };
    }

    // Feedback visual / Notificação In-Game & Menu
    enqueueToast(ach) {
      this.toastQueue.push(ach);
      if (!this.isShowingToast) {
        this.processNextToast();
      }
    }

    processNextToast() {
      if (this.toastQueue.length === 0) {
        this.isShowingToast = false;
        return;
      }

      this.isShowingToast = true;
      const ach = this.toastQueue.shift();

      let container = document.getElementById('achievementToastContainer');
      if (!container) {
        container = document.createElement('div');
        container.id = 'achievementToastContainer';
        container.className = 'achievement-toast-container';
        document.body.appendChild(container);
      }

      const toast = document.createElement('div');
      toast.className = `achievement-toast ${ach.tier}`;
      toast.innerHTML = `
        <div class="ach-toast-icon">${ach.icon}</div>
        <div class="ach-toast-info">
          <div class="ach-toast-header">
            <span class="ach-toast-badge ${ach.tier}">${ach.tier.toUpperCase()}</span>
            <span class="ach-toast-sub">CONQUISTA DESBLOQUEADA!</span>
          </div>
          <div class="ach-toast-title">${ach.name}</div>
          <div class="ach-toast-desc">${ach.desc}</div>
        </div>
      `;

      container.appendChild(toast);

      // Efeito sonoro
      try {
        if (window.AudioManager) {
          window.AudioManager.playSFXPreview();
        }
      } catch (e) { }

      // Animação de entrada
      requestAnimationFrame(() => toast.classList.add('show'));

      // Remove após 4.2 segundos
      setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.add('hide');
        setTimeout(() => {
          if (toast && typeof toast.remove === 'function') {
            toast.remove();
          } else if (toast && toast.parentNode) {
            toast.parentNode.removeChild(toast);
          }
          this.processNextToast();
        }, 400);
      }, 4200);
    }
  }

  window.AchievementManager = new AchievementManager();
})();
