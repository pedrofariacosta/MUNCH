// Lógica do menu principal: modais arcade, navegabilidade, persistência via localStorage, card 3D e animações decorativas.

window.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // CONFIGURAÇÃO DO FAVICON ESTÁTICO DO SLIME
  // ==========================================================================
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
    
    faviconCtx.fillStyle = '#ffffff';
    faviconCtx.beginPath();
    faviconCtx.moveTo(-2.5, 5.5);
    faviconCtx.lineTo(-1, 7);
    faviconCtx.lineTo(0.5, 5.5);
    faviconCtx.closePath();
    faviconCtx.fill();
    
    faviconCtx.restore();
    faviconLink.href = faviconCanvas.toDataURL('image/png');
  }
  
  drawStaticFavicon();

  // ==========================================================================
  // BASE DE DADOS DO COMPÊNDIO DE RELÍQUIAS (MATCHING CARD_POOL)
  // ==========================================================================
  const RELIC_CODEX = [
    { id: "relic_jump_module", name: "Módulo de Salto", icon: "🚀", category: "ARSENAL", rarity: "Comum", desc: "Desbloqueia a habilidade de Pulo [ESPAÇO]." },
    { id: "relic_blaster_core", name: "Núcleo Blaster", icon: "💥", category: "ARSENAL", rarity: "Comum", desc: "Desbloqueia a habilidade de Disparo [F]." },
    { id: "relic_overclock", name: "Overclock de Pulo", icon: "⚡", category: "ARSENAL", rarity: "Incomum", desc: "Reduz o tempo de recarga das habilidades em 30%." },
    { id: "relic_backup_battery", name: "Bateria Reserva", icon: "❤️", category: "AÇÃO & SOBREVIVÊNCIA", rarity: "Comum", desc: "Aumenta sua vida máxima em +1." },
    { id: "relic_steel_coating", name: "Revestimento de Aço", icon: "🛡️", category: "MULTIPLICADORES & PONTUAÇÃO", rarity: "Comum", desc: "+20 Fichas Base por pastilha devorada." },
    { id: "relic_sharp_drift", name: "Drift Afiado", icon: "🏎️", category: "MULTIPLICADORES & PONTUAÇÃO", rarity: "Incomum", desc: "+2 Mult permanente a cada curva perfeita de 90°." },
    { id: "relic_bounty_hunter", name: "Caçador de Recompensas", icon: "🎯", category: "MULTIPLICADORES & PONTUAÇÃO", rarity: "Incomum", desc: "+5 Mult extra ao destruir um inimigo." },
    { id: "relic_gold_alchemist", name: "Alquimista de Ouro", icon: "✨", category: "MULTIPLICADORES & PONTUAÇÃO", rarity: "Rara", desc: "Pastilhas Douradas multiplicam seu Mult total por x1.75." },
    { id: "relic_slime_puddle", name: "Rastro Viscoso", icon: "🧪", category: "QUEBRA DE REGRAS", rarity: "Incomum", desc: "Pulos deixam poças de lodo que reduzem a velocidade dos inimigos em 50%." },
    { id: "relic_railgun", name: "Laser Perfurante", icon: "🔱", category: "QUEBRA DE REGRAS", rarity: "Rara", desc: "Seu disparo laser atravessa múltiplos inimigos sem ser destruído." },
    { id: "relic_magnetic_pull", name: "Vácuo Magnético", icon: "🧲", category: "QUEBRA DE REGRAS", rarity: "Rara", desc: "Devora pastilhas adjacentes à distância automaticamente." }
  ];

  // ==========================================================================
  // GERENCIAMENTO DE MODAIS E NAVEGAÇÃO
  // ==========================================================================
  const activeModalsStack = [];

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.add('visible');
    activeModalsStack.push(modalId);

    // Carrega dados específicos ao abrir
    if (modalId === 'modalPlay') refreshPlayModal();
    if (modalId === 'modalDeck') refreshDeckModal();
    if (modalId === 'modalStats') refreshStatsModal();
    if (modalId === 'modalOptions') refreshOptionsModal();
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.remove('visible');
    const idx = activeModalsStack.indexOf(modalId);
    if (idx !== -1) activeModalsStack.splice(idx, 1);
  }

  function closeTopModal() {
    if (activeModalsStack.length > 0) {
      const topModalId = activeModalsStack[activeModalsStack.length - 1];
      closeModal(topModalId);
      return true;
    }
    return false;
  }

  // Fechar botões via atributo data-close
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-close');
      closeModal(targetId);
    });
  });

  // Fechar ao clicar fora do container do modal (Backdrop Click)
  document.querySelectorAll('.arcade-modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal(overlay.id);
      }
    });
  });

  // ==========================================================================
  // BOTÕES PRINCIPAIS DO MENU E TECLADO
  // ==========================================================================
  const buttons = Array.from(document.querySelectorAll('.button-group .btn'));
  let focusIndex = 0;

  function setFocus(index) {
    buttons.forEach(b => b.classList.remove('kb-focus'));
    focusIndex = (index + buttons.length) % buttons.length;
    buttons[focusIndex].classList.add('kb-focus');
  }

  setFocus(0);

  function confirmSelection() {
    const btn = buttons[focusIndex];
    btn.classList.add('confirm-flash');
    setTimeout(() => btn.classList.remove('confirm-flash'), 120);
    btn.click();
  }

  // Navegação por teclado (Enter, W/S/Setas e ESC)
  window.addEventListener('keydown', (e) => {
    if (activeModalsStack.length > 0) {
      if (e.code === 'Escape') {
        e.preventDefault();
        closeTopModal();
      }
      return;
    }

    switch (e.code) {
      case 'ArrowUp':
      case 'KeyW':
        e.preventDefault();
        setFocus(focusIndex - 1);
        break;
      case 'ArrowDown':
      case 'KeyS':
        e.preventDefault();
        setFocus(focusIndex + 1);
        break;
      case 'Enter':
      case 'Space':
        e.preventDefault();
        confirmSelection();
        break;
    }
  });

  buttons.forEach((btn, i) => {
    btn.addEventListener('mouseenter', () => {
      if (activeModalsStack.length === 0) setFocus(i);
    });
  });

  // Vinculação dos 4 Botões do Menu Principal aos Modais
  document.getElementById('menuBtnPlay').addEventListener('click', () => openModal('modalPlay'));
  document.getElementById('menuBtnDeck').addEventListener('click', () => openModal('modalDeck'));
  document.getElementById('menuBtnStats').addEventListener('click', () => openModal('modalStats'));
  document.getElementById('menuBtnOptions').addEventListener('click', () => openModal('modalOptions'));

  // ==========================================================================
  // FUNCIONALIDADE 1: MODAL DE SELEÇÃO DE PARTIDA (▶ JOGAR)
  // ==========================================================================
  let selectedStake = localStorage.getItem('munch_selected_stake') || 'white';
  let endlessMode = localStorage.getItem('munch_endless_mode') === 'true';

  function refreshPlayModal() {
    // 1. Checa se existe run ativa salva
    const activeRunRaw = localStorage.getItem('munch_active_run');
    const activeRunCard = document.getElementById('activeRunCard');

    if (activeRunRaw) {
      try {
        const runData = JSON.parse(activeRunRaw);
        document.getElementById('activeRunAnte').innerText = `NÍVEL ${runData.ante} // ESTÁGIO ${runData.blind}`;
        document.getElementById('activeRunScore').innerText = Math.round(runData.score || 0).toLocaleString();
        
        const relicsContainer = document.getElementById('activeRunRelics');
        relicsContainer.innerHTML = '';
        if (runData.activeRelics && runData.activeRelics.length > 0) {
          runData.activeRelics.forEach(r => {
            const mini = document.createElement('div');
            mini.className = 'active-run-relic-mini';
            mini.innerText = r.icon || '🃏';
            relicsContainer.appendChild(mini);
          });
        } else {
          relicsContainer.innerHTML = '<span style="font-size:10px; color:#666;">Sem relíquias</span>';
        }
        
        activeRunCard.classList.remove('hidden');
      } catch (err) {
        activeRunCard.classList.add('hidden');
      }
    } else {
      activeRunCard.classList.add('hidden');
    }

    // 2. Atualiza Stakes
    document.querySelectorAll('.stake-card').forEach(card => {
      const stakeType = card.getAttribute('data-stake');
      if (stakeType === selectedStake) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
    });

    // 3. Atualiza Toggle Endless
    document.getElementById('chkEndlessMode').checked = endlessMode;
  }

  // Evento de Continuar Run
  document.getElementById('btnContinueRun').addEventListener('click', () => {
    window.location.href = 'game.html?resume=true';
  });

  // Seleção de Stakes
  document.querySelectorAll('.stake-card').forEach(card => {
    card.addEventListener('click', () => {
      selectedStake = card.getAttribute('data-stake');
      localStorage.setItem('munch_selected_stake', selectedStake);
      document.querySelectorAll('.stake-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
    });
  });

  // Toggle Endless
  document.getElementById('chkEndlessMode').addEventListener('change', (e) => {
    endlessMode = e.target.checked;
    localStorage.setItem('munch_endless_mode', endlessMode ? 'true' : 'false');
  });

  // Botão Iniciar Run
  document.getElementById('btnStartNewRun').addEventListener('click', () => {
    localStorage.setItem('munch_run_setup', JSON.stringify({
      stake: selectedStake,
      endless: endlessMode
    }));
    // Limpa a run salva anterior para começar uma nova
    localStorage.removeItem('munch_active_run');
    window.location.href = 'game.html';
  });

  // ==========================================================================
  // FUNCIONALIDADE 2: MODAL BARALHO / CUSTOMIZAÇÃO (SLIMES, COMPÊNDIO, TEMAS)
  // ==========================================================================
  let selectedSlime = localStorage.getItem('munch_selected_slime') || 'classic';
  let selectedTheme = localStorage.getItem('munch_crt_theme') || 'default';

  // Navegação por Abas
  document.querySelectorAll('.arcade-modal-tabs .tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      document.querySelectorAll('.arcade-modal-tabs .tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('#modalDeck .tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(targetTab).classList.add('active');
    });
  });

  function refreshDeckModal() {
    // ABA 1: Slimes
    document.querySelectorAll('.slime-select-card').forEach(card => {
      const slimeVariant = card.getAttribute('data-slime');
      const btn = card.querySelector('.btn-select-slime');
      if (slimeVariant === selectedSlime) {
        card.classList.add('selected');
        if (btn) btn.innerText = 'SELECIONADO';
      } else {
        card.classList.remove('selected');
        if (btn) btn.innerText = 'SELECIONAR';
      }
    });

    // ABA 2: Compêndio
    const discoveredRaw = localStorage.getItem('munch_discovered_relics') || '[]';
    let discoveredIds = [];
    try { discoveredIds = JSON.parse(discoveredRaw); } catch(e) { discoveredIds = []; }

    const compendiumGrid = document.getElementById('compendiumGrid');
    compendiumGrid.innerHTML = '';

    RELIC_CODEX.forEach(relic => {
      const isDiscovered = discoveredIds.includes(relic.id);
      const cardEl = document.createElement('div');
      
      if (isDiscovered) {
        cardEl.className = 'compendium-card';
        cardEl.innerHTML = `
          <div class="compendium-card-icon">${relic.icon}</div>
          <div class="compendium-card-name">${relic.name}</div>
          <div class="compendium-card-rarity ${relic.rarity.toLowerCase()}">${relic.rarity.toUpperCase()}</div>
          <div class="compendium-card-desc">${relic.desc}</div>
        `;
      } else {
        cardEl.className = 'compendium-card locked';
        cardEl.innerHTML = `
          <div class="compendium-card-icon">❓</div>
          <div class="compendium-card-name">???</div>
          <div class="compendium-card-rarity">BLOQUEADO</div>
          <div class="compendium-card-desc">Relíquia ainda não descoberta nesta conta.</div>
        `;
      }
      compendiumGrid.appendChild(cardEl);
    });

    document.getElementById('discoveredRelicsCount').innerText = `${discoveredIds.length} / ${RELIC_CODEX.length}`;

    // ABA 3: Temas
    document.querySelectorAll('.theme-card').forEach(card => {
      const themeName = card.getAttribute('data-theme');
      if (themeName === selectedTheme) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
    });
  }

  // Evento de Selecionar Slime
  document.querySelectorAll('.slime-select-card').forEach(card => {
    card.addEventListener('click', () => {
      selectedSlime = card.getAttribute('data-slime');
      localStorage.setItem('munch_selected_slime', selectedSlime);
      refreshDeckModal();
      updateMainSlimeCard();
    });
  });

  // Evento de Selecionar Tema CRT
  document.querySelectorAll('.theme-card').forEach(card => {
    card.addEventListener('click', () => {
      selectedTheme = card.getAttribute('data-theme');
      localStorage.setItem('munch_crt_theme', selectedTheme);
      applyTheme(selectedTheme);
      refreshDeckModal();
    });
  });

  function applyTheme(theme) {
    document.body.classList.remove('theme-gameboy', 'theme-amber', 'theme-cyberpunk');
    if (theme !== 'default') {
      document.body.classList.add(`theme-${theme}`);
    }
  }

  applyTheme(selectedTheme);

  // Atualiza o Card Holográfico do Slime no Canto Superior Direito do Menu
  function updateMainSlimeCard() {
    const cardName = document.getElementById('mainSlimeName');
    const cardBadge = document.getElementById('mainSlimeBadge');
    const cardDesc = document.getElementById('mainSlimeDesc');

    if (!cardName) return;

    if (selectedSlime === 'metallic') {
      cardName.innerText = 'SLIME MERCENÁRIO';
      cardBadge.className = 'card-stat-pill cyan';
      cardBadge.innerHTML = '<span class="pill-value">+30</span> Fichas / Pastilha';
      cardDesc.innerText = '+30 fichas por pastilha, mas recarga de habilidades 20% mais lenta.';
    } else if (selectedSlime === 'ballistic') {
      cardName.innerText = 'SLIME BALÍSTICO';
      cardBadge.className = 'card-stat-pill orange';
      cardBadge.innerHTML = '<span class="pill-value">2</span> Cargas de Tiro';
      cardDesc.innerText = 'Comece com 2 tiros desbloqueados, porém com 0 pulos iniciais.';
    } else if (selectedSlime === 'gambler') {
      cardName.innerText = 'SLIME GAMBLER';
      cardBadge.className = 'card-stat-pill gold';
      cardBadge.innerHTML = '<span class="pill-value">x0.5 - x3.0</span> Mult Caótico';
      cardDesc.innerText = 'Seu multiplicador oscila aleatoriamente entre x0.5 e x3.0 por pastilha.';
    } else {
      cardName.innerText = 'SLIME CLÁSSICO';
      cardBadge.className = 'card-stat-pill blue';
      cardBadge.innerHTML = '<span class="pill-value">Padrão</span>';
      cardDesc.innerText = 'Slime inicial balanceado sem habilidades extras.';
    }
    
    // Atualiza cor visual do slime nos SVGs
    const slimeColors = {
      classic: '#a3a3c2',
      metallic: '#22c55e', // Verde Mercenário
      ballistic: '#ef4444',
      gambler: '#eab308'
    };
    
    const currentColor = slimeColors[selectedSlime] || slimeColors.classic;
    const svgMain = document.querySelector('#mainSlimeSvg rect');
    const svgFooter = document.querySelector('.slime-character rect');
    if (svgMain) svgMain.setAttribute('fill', currentColor);
    if (svgFooter) svgFooter.setAttribute('fill', currentColor);
  }

  updateMainSlimeCard();

  // ==========================================================================
  // FUNCIONALIDADE 3: MODAL DE ESTATÍSTICAS GLOBAIS & HISTÓRICO
  // ==========================================================================
  function refreshStatsModal() {
    const bestRound = parseInt(localStorage.getItem('munch_best_round_score')) || 0;
    const maxMult = parseInt(localStorage.getItem('munch_max_mult')) || 1;
    const totalKills = parseInt(localStorage.getItem('munch_total_kills')) || 0;
    const totalPellets = parseInt(localStorage.getItem('munch_total_pellets')) || 0;
    const totalAntes = parseInt(localStorage.getItem('munch_total_antes')) || 0;
    const completedAntes = parseInt(localStorage.getItem('munch_completed_antes')) || 0;

    let winRate = 0;
    if (totalAntes > 0) {
      winRate = Math.round((completedAntes / totalAntes) * 100);
    }

    document.getElementById('statBestRound').innerText = bestRound.toLocaleString();
    document.getElementById('statMaxMult').innerText = `x${maxMult}`;
    document.getElementById('statTotalKills').innerText = totalKills.toLocaleString();
    document.getElementById('statTotalPellets').innerText = totalPellets.toLocaleString();
    document.getElementById('statWinRate').innerText = `${winRate}%`;

    // Atualiza placar do canto superior direito do menu principal
    const topBestRunScore = document.getElementById('topBestRunScore');
    const topMaxMultValue = document.getElementById('topMaxMultValue');
    if (topBestRunScore) topBestRunScore.innerText = bestRound.toLocaleString();
    if (topMaxMultValue) topMaxMultValue.innerText = `x${maxMult}`;

    // Tabela de Histórico Recente
    const historyRaw = localStorage.getItem('munch_run_history') || '[]';
    let history = [];
    try { history = JSON.parse(historyRaw); } catch(e) { history = []; }

    const tbody = document.getElementById('recentRunsTableBody');
    tbody.innerHTML = '';

    if (history.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center; color:#666; padding:20px;">Nenhuma partida recente registrada. Jogue partidas para gerar o seu histórico!</td>
        </tr>
      `;
    } else {
      history.slice(0, 5).forEach(run => {
        const tr = document.createElement('tr');

        let stakeBadge = '<span style="color:#aaa;">BRANCA</span>';
        if (run.stake === 'red') stakeBadge = '<span style="color:#f87171; font-weight:bold;">VERMELHA</span>';
        if (run.stake === 'gold') stakeBadge = '<span style="color:#FFE600; font-weight:bold;">DOURADA</span>';

        let relicsHtml = '<div class="history-relics-mini-list">';
        if (run.relics && run.relics.length > 0) {
          run.relics.forEach(r => {
            relicsHtml += `<div class="history-relic-icon">${r.icon || '🃏'}</div>`;
          });
        } else {
          relicsHtml += '<span style="color:#555; font-size:10px;">Sem relíquias</span>';
        }
        relicsHtml += '</div>';

        tr.innerHTML = `
          <td>${run.date || 'Desconhecida'}</td>
          <td>${stakeBadge}</td>
          <td style="font-family:'Press Start 2P', monospace; font-size:9px; color:var(--cyan-primary);">NÍVEL ${run.ante || 1}</td>
          <td style="font-family:'Press Start 2P', monospace; font-size:9px; color:var(--yellow-primary);">${Math.round(run.score || 0).toLocaleString()}</td>
          <td>${relicsHtml}</td>
        `;
        tbody.appendChild(tr);
      });
    }

    // Carrega Ranking (Top 5 por Categoria)
    loadGlobalRanking();
  }

  let currentRankingStake = 'white';

  async function loadGlobalRanking(stake = currentRankingStake) {
    currentRankingStake = stake;
    const rankingBody = document.getElementById('globalRankingTableBody');
    if (!rankingBody) return;
    rankingBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#888; padding:12px;">Carregando Top 5 da Ficha...</td></tr>`;

    const scores = await MunchLeaderboard.getTopScoresByStake(stake);
    rankingBody.innerHTML = '';

    if (!scores || scores.length === 0) {
      rankingBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#666; padding:12px;">Nenhum recorde registrado nesta categoria ainda. Seja o primeiro!</td></tr>`;
      return;
    }

    scores.slice(0, 5).forEach((item, index) => {
      const tr = document.createElement('tr');
      let medal = `#${index + 1}`;
      if (index === 0) medal = '🥇 #1';
      if (index === 1) medal = '🥈 #2';
      if (index === 2) medal = '🥉 #3';

      tr.innerHTML = `
        <td style="font-family:'Press Start 2P', monospace; font-size:8px; color:var(--yellow-primary);">${medal}</td>
        <td style="font-weight:bold; color:#fff;">${item.name || 'ANÔNIMO'}</td>
        <td style="font-family:'Press Start 2P', monospace; font-size:8px; color:var(--cyan-primary);">NÍVEL ${item.ante || 1}</td>
        <td style="font-family:'Press Start 2P', monospace; font-size:9px; color:var(--yellow-primary);">${Math.round(item.score || 0).toLocaleString()}</td>
        <td style="color:#888; font-size:10px;">${item.date || '-'}</td>
      `;
      rankingBody.appendChild(tr);
    });
  }

  // Ouvintes para as abas do ranking por ficha
  document.querySelectorAll('.ranking-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.ranking-tab-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      const stake = e.currentTarget.getAttribute('data-ranking-stake') || 'white';
      loadGlobalRanking(stake);
    });
  });

  const btnRefreshRanking = document.getElementById('btnRefreshRanking');
  if (btnRefreshRanking) {
    btnRefreshRanking.addEventListener('click', () => loadGlobalRanking(currentRankingStake));
  }

  // Sincroniza estatísticas iniciais no canto superior do menu
  refreshStatsModal();

  // ==========================================================================
  // FUNCIONALIDADE 4: MODAL DE CONFIGURAÇÕES & ACESSIBILIDADE
  // ==========================================================================
  function refreshOptionsModal() {
    const musicVol = parseInt(localStorage.getItem('munch_audio_music')) ?? 80;
    const sfxVol = parseInt(localStorage.getItem('munch_audio_sfx')) ?? 100;
    const scanlines = localStorage.getItem('munch_option_scanlines') !== 'false';
    const shake = localStorage.getItem('munch_option_shake') || '100';
    const reduceFlashes = localStorage.getItem('munch_option_reduce_flashes') === 'true';
    const controls = localStorage.getItem('munch_controls') || 'wasd';

    document.getElementById('sliderMusicVol').value = musicVol;
    document.getElementById('lblMusicVol').innerText = `${musicVol}%`;

    document.getElementById('sliderSfxVol').value = sfxVol;
    document.getElementById('lblSfxVol').innerText = `${sfxVol}%`;

    document.getElementById('chkScanlines').checked = scanlines;
    document.getElementById('selScreenShake').value = shake;
    document.getElementById('chkReduceFlashes').checked = reduceFlashes;

    document.querySelectorAll('.segmented-control .seg-btn').forEach(btn => {
      if (btn.getAttribute('data-control') === controls) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // Audio Sliders
  document.getElementById('sliderMusicVol').addEventListener('input', (e) => {
    const val = e.target.value;
    document.getElementById('lblMusicVol').innerText = `${val}%`;
    localStorage.setItem('munch_audio_music', val);
  });

  document.getElementById('sliderSfxVol').addEventListener('input', (e) => {
    const val = e.target.value;
    document.getElementById('lblSfxVol').innerText = `${val}%`;
    localStorage.setItem('munch_audio_sfx', val);
  });

  // Graphics & Access Toggles
  document.getElementById('chkScanlines').addEventListener('change', (e) => {
    localStorage.setItem('munch_option_scanlines', e.target.checked ? 'true' : 'false');
  });

  document.getElementById('selScreenShake').addEventListener('change', (e) => {
    localStorage.setItem('munch_option_shake', e.target.value);
  });

  document.getElementById('chkReduceFlashes').addEventListener('change', (e) => {
    localStorage.setItem('munch_option_reduce_flashes', e.target.checked ? 'true' : 'false');
  });

  // Controls Segmented Buttons
  document.querySelectorAll('.segmented-control .seg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-control');
      localStorage.setItem('munch_controls', mode);
      document.querySelectorAll('.segmented-control .seg-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Reset de Dados Salvos
  document.getElementById('btnOpenResetConfirm').addEventListener('click', () => {
    openModal('modalConfirmReset');
  });

  document.getElementById('btnCancelResetSave').addEventListener('click', () => {
    closeModal('modalConfirmReset');
  });

  document.getElementById('btnExecuteResetSave').addEventListener('click', () => {
    localStorage.clear();
    selectedStake = 'white';
    endlessMode = false;
    selectedSlime = 'classic';
    selectedTheme = 'default';

    closeModal('modalConfirmReset');
    closeModal('modalOptions');
    
    applyTheme('default');
    updateMainSlimeCard();
    refreshStatsModal();
  });

  // ==========================================================================
  // EFEITOS DE ANIMAÇÃO DE DECORAÇÃO DA TELA (GLITCH, 3D CARD, RUNNER TRACK)
  // ==========================================================================
  const title = document.querySelector('.brand-title');
  let glitchTimer = null;

  function triggerGlitch() {
    if (!title) return;
    title.classList.add('glitch-active');
    setTimeout(() => title.classList.remove('glitch-active'), 180);
  }

  function scheduleGlitch() {
    const delay = 3000 + Math.random() * 4000;
    glitchTimer = setTimeout(() => {
      triggerGlitch();
      scheduleGlitch();
    }, delay);
  }

  scheduleGlitch();

  // Efeito 3D holográfico com inclinação e reflexo no card ao passar o mouse
  const holoCard = document.querySelector('.holo-card');
  const holoGlare = document.querySelector('.holo-glare');

  if (holoCard) {
    holoCard.addEventListener('mousemove', (e) => {
      const rect = holoCard.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateY = ((x - centerX) / centerX) * 14;
      const rotateX = ((centerY - y) / centerY) * 14;

      holoCard.style.transform =
        `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;

      if (holoGlare) {
        const percX = (x / rect.width) * 100;
        const percY = (y / rect.height) * 100;
        holoGlare.style.background = `radial-gradient(
          circle at ${percX}% ${percY}%,
          rgba(255, 255, 255, 0.22) 0%,
          rgba(255, 255, 255, 0.06) 30%,
          transparent 60%
        )`;
      }
    });

    holoCard.addEventListener('mouseleave', () => {
      holoCard.style.transform = 'perspective(700px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
      if (holoGlare) {
        holoGlare.style.background = '';
      }
    });
  }

  // Animação de rastro de bolinhas comidas pelo slime decorativo no rodapé
  const dotsContainer = document.querySelector('.dots-trail');
  const chaseGroup = document.querySelector('.chase-group');
  const runnerTrack = document.querySelector('.runner-track');
  const DOT_SPACING = 32;
  let dots = [];

  function createDots() {
    if (!dotsContainer || !runnerTrack) return;
    dotsContainer.innerHTML = '';
    dots = [];

    const trackWidth = runnerTrack.offsetWidth;
    const count = Math.ceil(trackWidth / DOT_SPACING) + 2;

    for (let i = 0; i < count; i++) {
      const dot = document.createElement('div');
      dot.className = 'trail-dot';
      dot.style.left = (i * DOT_SPACING) + 'px';
      dotsContainer.appendChild(dot);
      dots.push({ el: dot, x: i * DOT_SPACING, eaten: false });
    }
  }

  createDots();
  window.addEventListener('resize', createDots);

  let animStart = performance.now();

  function updateDots() {
    if (!runnerTrack || dots.length === 0) {
      requestAnimationFrame(updateDots);
      return;
    }

    const elapsed = (performance.now() - animStart) % 12000;
    const progress = elapsed / 12000;
    const trackWidth = runnerTrack.offsetWidth || window.innerWidth;
    const groupX = -320 + progress * (trackWidth + 770);
    const slimeX = groupX + 32;

    dots.forEach(d => {
      if (!d.eaten && d.x < slimeX) {
        d.eaten = true;
        d.el.classList.add('eaten');
      }
    });

    if (groupX > trackWidth + 100) {
      dots.forEach(d => {
        d.eaten = false;
        d.el.classList.remove('eaten');
      });
    }

    requestAnimationFrame(updateDots);
  }

  requestAnimationFrame(updateDots);

  // Partículas de poeira otimizadas
  const slimeWrapper = document.querySelector('.slime-wrapper');

  function spawnDustBurst() {
    if (!slimeWrapper || !runnerTrack) return;
    const trackWidth = runnerTrack.offsetWidth || window.innerWidth;
    const elapsed = (performance.now() - animStart) % 12000;
    const progress = elapsed / 12000;
    const groupX = -320 + progress * (trackWidth + 770);

    const baseX = groupX + 32;
    const baseY = 80;

    for (let i = 0; i < 3; i++) {
      const p = document.createElement('div');
      p.className = 'dust-particle-track';
      const side = i < 2 ? -1 : 1;
      const dx = (4 + Math.random() * 8) * side;
      const dy = -(3 + Math.random() * 6);

      p.style.left = baseX + 'px';
      p.style.top = baseY + 'px';
      p.style.setProperty('--dx', dx + 'px');
      p.style.setProperty('--dy', dy + 'px');

      runnerTrack.appendChild(p);

      requestAnimationFrame(() => p.classList.add('burst'));
      setTimeout(() => p.remove(), 350);
    }
  }

  setInterval(spawnDustBurst, 600);

});
