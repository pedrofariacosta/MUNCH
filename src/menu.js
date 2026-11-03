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
    { id: "relic_jump_module", name: "MOLA HIDRÁULICA", icon: "assets/icons/relic_jump_module.svg", category: "AÇÃO & SOBREVIVÊNCIA", rarity: "Comum", desc: "+1 Carga Máxima de Pulo. Permite saltar paredes e inimigos." },
    { id: "relic_blaster_core", name: "CANHÃO DE PLASMA", icon: "assets/icons/relic_blaster_core.svg", category: "AÇÃO & SOBREVIVÊNCIA", rarity: "Comum", desc: "+1 Carga Máxima de Disparo. Atordoa inimigos em linha reta." },
    { id: "relic_overclock", name: "OVERCLOCK DE SISTEMA", icon: "assets/icons/relic_overclock.svg", category: "AÇÃO & SOBREVIVÊNCIA", rarity: "Incomum", desc: "Reduz o tempo de recarga de todas as habilidades em 30%." },
    { id: "relic_backup_battery", name: "BATERIA RESERVA", icon: "assets/icons/relic_backup_battery.svg", category: "AÇÃO & SOBREVIVÊNCIA", rarity: "Comum", desc: "+1 Vida Máxima e recupera todas as vidas perdidas." },
    { id: "relic_steel_coating", name: "REVESTIMENTO DE AÇO", icon: "assets/icons/relic_steel_coating.svg", category: "MULTIPLICADORES & PONTUAÇÃO", rarity: "Comum", desc: "Pastilhas normais concedem +20 Fichas base." },
    { id: "relic_sharp_drift", name: "DRIFT PERFEITO", icon: "assets/icons/relic_sharp_drift.svg", category: "MULTIPLICADORES & PONTUAÇÃO", rarity: "Incomum", desc: "Mudar de direção na quina exata concede +2 Mult na rodada." },
    { id: "relic_bounty_hunter", name: "CAÇADOR DE NAIPES", icon: "assets/icons/relic_bounty_hunter.svg", category: "MULTIPLICADORES & PONTUAÇÃO", rarity: "Incomum", desc: "Destruir um inimigo com Blaster concede +5 Mult permanente no round." },
    { id: "relic_gold_alchemist", name: "ALQUIMIA DOURADA", icon: "assets/icons/relic_gold_alchemist.svg", category: "MULTIPLICADORES & PONTUAÇÃO", rarity: "Rara", desc: "Moedas especiais concedem x1.75 Mult ao serem consumidas." },
    { id: "relic_slime_puddle", name: "LODO VISCOSO", icon: "assets/icons/relic_slime_puddle.svg", category: "QUEBRA DE REGRAS", rarity: "Incomum", desc: "Pular deixa poças de lodo que reduzem velocidade inimiga em 50% por 4s." },
    { id: "relic_railgun", name: "TIRO PERFURANTE", icon: "assets/icons/relic_railgun.svg", category: "QUEBRA DE REGRAS", rarity: "Rara", desc: "O laser do Blaster perfura inimigos e limpa linhas até bater em paredes." },
    { id: "relic_magnetic_pull", name: "VÁCUO MAGNÉTICO", icon: "assets/icons/relic_magnetic_pull.svg", category: "QUEBRA DE REGRAS", rarity: "Rara", desc: "Atrai e devora pastilhas a até 1.5 blocos de distância do Slime." },
    { id: "relic_mercury_skates", name: "PATINS DE MERCÚRIO", icon: "assets/icons/relic_mercury_skates.svg", category: "AÇÃO & SOBREVIVÊNCIA", rarity: "Incomum", desc: "Aumenta a velocidade base de movimento do Slime em +10%." },
    { id: "relic_adrenaline", name: "INJEÇÃO DE ADRENALINA", icon: "assets/icons/relic_adrenaline.svg", category: "AÇÃO & SOBREVIVÊNCIA", rarity: "Rara", desc: "Concede +20% de velocidade por 3s após abater um inimigo ou saltar." },
    { id: "relic_quantum_leap", name: "SALTO QUÂNTICO", icon: "assets/icons/relic_quantum_leap.svg", category: "QUEBRA DE REGRAS", rarity: "Incomum", desc: "O Pulo passa a atravessar 3 blocos de distância e recarrega 2s mais rápido." },
    { id: "relic_midas_touch", name: "TOQUE DE MIDAS", icon: "assets/icons/relic_midas_touch.svg", category: "MULTIPLICADORES & PONTUAÇÃO", rarity: "Incomum", desc: "Ao saltar, converte a pastilha mais próxima em uma Moeda Dourada." },
    { id: "relic_black_card", name: "CARTÃO BLACK", icon: "assets/icons/relic_black_card.svg", category: "MULTIPLICADORES & PONTUAÇÃO", rarity: "Rara", desc: "Moedas Douradas concedem +5 Ouros extras e +100 Fichas." },
    { id: "relic_laser_ricochet", name: "RICOCHETE LASER", icon: "assets/icons/relic_laser_ricochet.svg", category: "QUEBRA DE REGRAS", rarity: "Rara", desc: "O disparo do Blaster rebate em até 2 paredes." },
    { id: "relic_infinite_battery", name: "BATERIA INFINITA", icon: "assets/icons/relic_infinite_battery.svg", category: "AÇÃO & SOBREVIVÊNCIA", rarity: "Lendária", desc: "Eliminar 2 inimigos num curto intervalo recupera 1 carga de disparo." },
    { id: "relic_straight_combo", name: "COMBO EM LINHA RETA", icon: "assets/icons/relic_straight_combo.svg", category: "MULTIPLICADORES & PONTUAÇÃO", rarity: "Comum", desc: "Andar 5 blocos sem fazer curvas adiciona +1 Mult." },
    { id: "relic_slime_meteor", name: "METEORO DE GOSMA", icon: "assets/icons/relic_slime_meteor.svg", category: "AÇÃO & SOBREVIVÊNCIA", rarity: "Incomum", desc: "Ao aterrissar do pulo, gera choque de 2.5 blocos atordoando inimigos por 2s. Cooldown do pulo +25%." },
    { id: "relic_quantum_jump", name: "SALTO QUÂNTICO", icon: "assets/icons/relic_quantum_jump.svg", category: "QUEBRA DE REGRAS", rarity: "Incomum", desc: "Pular por cima de um perseguidor (Close Call) e aterrissar em pastilha comum restaura 50% da recarga do pulo." },
    { id: "relic_gravity_boots", name: "BOTAS GRAVITACIONAIS", icon: "assets/icons/relic_gravity_boots.svg", category: "QUEBRA DE REGRAS", rarity: "Rara", desc: "Permite saltar por cima das paredes do labirinto. Enquanto o pulo recarrega, tem -10% de velocidade." },
    { id: "relic_slam_dunk", name: "ENTERRADA TRIUNFAL", icon: "assets/icons/relic_slam_dunk.svg", category: "MULTIPLICADORES & PONTUAÇÃO", rarity: "Comum", desc: "Enquanto o Slime estiver no ar, qualquer pontuação gerada recebe um multiplicador temporário de x2.0 Mult." },
    { id: "relic_loan_shark", name: "EMPRÉSTIMO TUBARÃO", icon: "assets/icons/relic_loan_shark.svg", category: "ECONOMIA & RISCO", rarity: "Incomum", desc: "Concede +15 moedas agora. As próximas 3 lojas cobram taxa de 5 moedas ou custam 1 vida." },
    { id: "relic_piggy_bank", name: "COFRINHO DE CERÂMICA", icon: "assets/icons/relic_piggy_bank.svg", category: "ECONOMIA & RISCO", rarity: "Comum", desc: "+1 moeda por fase concluída sem usar pulo. Ao sofrer dano, quebra, concede as moedas e é destruído." },
    { id: "relic_leaky_bag", name: "BOLSA FURADA", icon: "assets/icons/relic_leaky_bag.svg", category: "ECONOMIA & RISCO", rarity: "Rara", desc: "Reduz o preço da loja em 50%. Perde 1 moeda a cada 8s de fase sem super-pastilha ativa." },
    { id: "relic_saber_tooth", name: "DENTE DE SABRE", icon: "assets/icons/relic_saber_tooth.svg", category: "MULTIPLICADORES & PONTUAÇÃO", rarity: "Comum", desc: "+10 fichas por pastilha devorada em movimento retilíneo contínuo por mais de 2 segundos." },
    { id: "relic_tape_measure", name: "FITA MÉTRICA", icon: "assets/icons/relic_tape_measure.svg", category: "MULTIPLICADORES & PONTUAÇÃO", rarity: "Incomum", desc: "+0.1 Mult por segundo de movimento sem colidir em paredes (acumula até +3.0 Mult; zera se colidir)." },
    { id: "relic_unstable_gunpowder", name: "PÓLVORA INSTÁVEL", icon: "assets/icons/relic_unstable_gunpowder.svg", category: "QUEBRA DE REGRAS", rarity: "Incomum", desc: "Eliminar inimigos vulneráveis explode e devora pastilhas normais em raio de 3 blocos. Super-pastilha dura 30% a menos." },
    { id: "relic_wicked_shadow", name: "SOMBRA PERVERSA", icon: "assets/icons/relic_wicked_shadow.svg", category: "MULTIPLICADORES & PONTUAÇÃO", rarity: "Incomum", desc: "Até x1.75 Mult por proximidade de inimigo perigoso pelas costas. Toque nas costas causa dano imediato sem imunidade." },
    { id: "relic_faustian_bargain", name: "CONTRATO FAUSTO", icon: "assets/icons/relic_faustian_bargain.svg", category: "ECONOMIA & RISCO", rarity: "Rara", desc: "Concede +100.000 pontos no início de cada estágio. A vida máxima fica travada em exatamente 1." },
    { id: "relic_pure_adrenaline", name: "ADRENALINA PURA", icon: "assets/icons/relic_pure_adrenaline.svg", category: "MULTIPLICADORES & PONTUAÇÃO", rarity: "Rara", desc: "Enquanto estiver com apenas 1 vida restante, todas as pastilhas devoradas aplicam x2.0 Mult." }
  ];

  // ==========================================================================
  // GERENCIAMENTO DE MODAIS E NAVEGAÇÃO
  // ==========================================================================
  const activeModalsStack = [];
  const CURRENT_PATCH_VERSION = 'patch_2026_10_31';

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.add('visible');
    activeModalsStack.push(modalId);

    // Carrega dados específicos ao abrir
    if (modalId === 'modalPlay') refreshPlayModal();
    if (modalId === 'modalDeck') refreshDeckModal();
    if (modalId === 'modalStats') refreshStatsModal();
    if (modalId === 'modalAchievements') refreshAchievementsModal();
    if (modalId === 'modalOptions') refreshOptionsModal();

    modalFocusIndex = 0;
    setTimeout(() => {
      const interactables = getModalInteractables(modalId);
      if (modalId === 'modalPlay') {
        const activeRunCard = document.getElementById('activeRunCard');
        if (!activeRunCard || activeRunCard.classList.contains('hidden')) {
          const selectedIdx = interactables.findIndex(el => el.classList && el.classList.contains('selected'));
          if (selectedIdx !== -1) modalFocusIndex = selectedIdx;
        }
      }
      updateModalFocus(interactables);
    }, 50);
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.remove('visible');
    const idx = activeModalsStack.indexOf(modalId);
    if (idx !== -1) activeModalsStack.splice(idx, 1);

    if (modalId === 'modalPatchNotes') {
      try {
        localStorage.setItem('munch_last_patch_seen', CURRENT_PATCH_VERSION);
      } catch (e) { }
    }
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

  // Botão do Rodapé para Abertura Posterior do Patch Notes
  const btnOpenPatchNotes = document.getElementById('btnOpenPatchNotes');
  if (btnOpenPatchNotes) {
    btnOpenPatchNotes.addEventListener('click', () => {
      openModal('modalPatchNotes');
    });
  }

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

  // ==========================================================================
  // NAVEGAÇÃO COMPLETA POR TECLADO (MENU PRINCIPAL E MODAIS)
  // ==========================================================================
  let modalFocusIndex = 0;

  function getModalInteractables(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return [];

    if (modalId === 'modalPlay') {
      const items = [];
      const activeRunCard = document.getElementById('activeRunCard');
      const btnContinue = document.getElementById('btnContinueRun');
      if (activeRunCard && !activeRunCard.classList.contains('hidden') && btnContinue) {
        items.push(btnContinue);
      }
      const stakes = Array.from(modal.querySelectorAll('.stake-card'));
      items.push(...stakes);

      const chkEndless = document.getElementById('chkEndlessMode');
      if (chkEndless) items.push(chkEndless);

      const btnStart = document.getElementById('btnStartNewRun');
      if (btnStart) items.push(btnStart);

      return items;
    }

    if (modalId === 'modalDeck') {
      const items = [];
      const tabs = Array.from(modal.querySelectorAll('.arcade-tab-btn'));
      items.push(...tabs);

      const activeContent = modal.querySelector('.arcade-tab-content.active');
      if (activeContent) {
        const selectables = Array.from(activeContent.querySelectorAll('.slime-select-card, .theme-card, .compendium-card'));
        items.push(...selectables);
      }
      return items;
    }

    if (modalId === 'modalAchievements') {
      return Array.from(modal.querySelectorAll('.ach-filter-btn'));
    }

    if (modalId === 'modalOptions') {
      return Array.from(modal.querySelectorAll('input, button:not(.arcade-modal-close)'));
    }

    return Array.from(modal.querySelectorAll('button:not(.arcade-modal-close), input, .stake-card, .slime-select-card'));
  }

  function updateModalFocus(interactables) {
    if (!interactables || interactables.length === 0) return;
    modalFocusIndex = (modalFocusIndex + interactables.length) % interactables.length;
    interactables.forEach((el, idx) => {
      if (idx === modalFocusIndex) {
        el.classList.add('kb-focus');
        if (typeof el.focus === 'function' && el.tagName !== 'DIV') {
          el.focus();
        }
      } else {
        el.classList.remove('kb-focus');
      }
    });
  }

  // Navegação por teclado (Enter, W/S/A/D/Setas e ESC)
  window.addEventListener('keydown', (e) => {
    if (activeModalsStack.length > 0) {
      if (e.code === 'Escape') {
        e.preventDefault();
        closeTopModal();
        return;
      }

      const topModalId = activeModalsStack[activeModalsStack.length - 1];
      const interactables = getModalInteractables(topModalId);
      if (interactables.length === 0) return;

      if (e.code === 'ArrowDown' || e.code === 'ArrowRight' || e.code === 'KeyS' || e.code === 'KeyD') {
        e.preventDefault();
        modalFocusIndex = (modalFocusIndex + 1) % interactables.length;
        updateModalFocus(interactables);
        return;
      }

      if (e.code === 'ArrowUp' || e.code === 'ArrowLeft' || e.code === 'KeyW' || e.code === 'KeyA') {
        e.preventDefault();
        modalFocusIndex = (modalFocusIndex - 1 + interactables.length) % interactables.length;
        updateModalFocus(interactables);
        return;
      }

      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        const currentEl = interactables[modalFocusIndex];
        if (currentEl) {
          if (currentEl.type === 'checkbox') {
            currentEl.checked = !currentEl.checked;
            currentEl.dispatchEvent(new Event('change'));
          } else {
            currentEl.click();
            // Se foi uma aba, atualiza interactables disponíveis
            if (currentEl.classList.contains('arcade-tab-btn')) {
              setTimeout(() => {
                const refreshed = getModalInteractables(topModalId);
                updateModalFocus(refreshed);
              }, 60);
            }
          }
        }
        return;
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
      case 'ArrowRight':
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

  // Vinculação dos Botões do Menu Principal e Placar aos Modais
  document.getElementById('menuBtnPlay').addEventListener('click', () => openModal('modalPlay'));
  document.getElementById('menuBtnDeck').addEventListener('click', () => openModal('modalDeck'));
  
  const btnAch = document.getElementById('menuBtnAchievements');
  if (btnAch) btnAch.addEventListener('click', () => openModal('modalAchievements'));

  const pillAch = document.getElementById('menuAchievementPill');
  if (pillAch) pillAch.addEventListener('click', () => openModal('modalAchievements'));

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
            mini.title = r.name || '';
            const isImg = r.icon && (r.icon.includes('/') || r.icon.includes('.'));
            if (isImg) {
              mini.innerHTML = `<img class="relic-svg-icon" src="${r.icon}" alt="${r.name || ''}">`;
            } else {
              mini.innerText = r.icon || '🃏';
            }
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

    // 2. Atualiza Stakes e bloqueios
    const isRedUnlocked = window.MetaProgression ? window.MetaProgression.isStakeUnlocked('red') : (localStorage.getItem('munch_unlocked_red_stake') === 'true');
    const isGoldUnlocked = window.MetaProgression ? window.MetaProgression.isStakeUnlocked('gold') : (localStorage.getItem('munch_unlocked_gold_stake') === 'true');

    if (selectedStake === 'red' && !isRedUnlocked) {
      selectedStake = 'white';
      localStorage.setItem('munch_selected_stake', 'white');
    }
    if (selectedStake === 'gold' && !isGoldUnlocked) {
      selectedStake = 'white';
      localStorage.setItem('munch_selected_stake', 'white');
    }

    document.querySelectorAll('.stake-card').forEach(card => {
      const stakeType = card.getAttribute('data-stake');
      const tagEl = card.querySelector('.stake-tag');
      if (tagEl && !tagEl.getAttribute('data-original-text')) {
        tagEl.setAttribute('data-original-text', tagEl.innerText);
      }

      let isLocked = false;
      if (stakeType === 'red' && !isRedUnlocked) isLocked = true;
      if (stakeType === 'gold' && !isGoldUnlocked) isLocked = true;

      if (isLocked) {
        card.classList.add('locked');
        card.classList.remove('selected');
        if (tagEl) tagEl.innerText = 'BLOQUEADO 🔒';
        card.setAttribute('title', stakeType === 'red' ? 'Conclua o Nível 8 na Ficha Branca para desbloquear!' : 'Conclua a Ficha Vermelha para desbloquear!');
      } else {
        card.classList.remove('locked');
        if (tagEl && tagEl.getAttribute('data-original-text')) {
          tagEl.innerText = tagEl.getAttribute('data-original-text');
        }
        card.removeAttribute('title');
        if (stakeType === selectedStake) {
          card.classList.add('selected');
        } else {
          card.classList.remove('selected');
        }
      }
    });

    // 3. Atualiza Toggle Endless
    document.getElementById('chkEndlessMode').checked = endlessMode;
  }

  // Executa atualização inicial
  refreshPlayModal();

  // Evento de Continuar Run
  document.getElementById('btnContinueRun').addEventListener('click', () => {
    if (window.AudioManager) window.AudioManager.stopMenuMusic();
    window.location.href = 'game.html?resume=true';
  });

  // Seleção de Stakes
  document.querySelectorAll('.stake-card').forEach(card => {
    card.addEventListener('click', () => {
      const stakeType = card.getAttribute('data-stake');
      const isRedUnlocked = window.MetaProgression ? window.MetaProgression.isStakeUnlocked('red') : (localStorage.getItem('munch_unlocked_red_stake') === 'true');
      const isGoldUnlocked = window.MetaProgression ? window.MetaProgression.isStakeUnlocked('gold') : (localStorage.getItem('munch_unlocked_gold_stake') === 'true');

      if (stakeType === 'red' && !isRedUnlocked) {
        card.classList.add('shake-locked');
        playLockSound();
        setTimeout(() => card.classList.remove('shake-locked'), 300);
        return;
      }
      if (stakeType === 'gold' && !isGoldUnlocked) {
        card.classList.add('shake-locked');
        playLockSound();
        setTimeout(() => card.classList.remove('shake-locked'), 300);
        return;
      }

      selectedStake = stakeType;
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
    if (window.AudioManager) window.AudioManager.stopMenuMusic();
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

  // Efeitos Sonoros Arcade para Bloqueios e Desbloqueios
  function playLockSound() {
    try {
      if (window.AudioManager && window.AudioManager.settings.isMuted) return;
      const effectiveVol = window.AudioManager ? window.AudioManager.getEffectiveSFXVolume() : 1.0;
      if (effectiveVol <= 0) return;

      const ctx = window.AudioManager ? window.AudioManager.getAudioContext() : new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.2 * effectiveVol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(window.AudioManager && window.AudioManager.sfxGainNode ? window.AudioManager.sfxGainNode : ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) { }
  }

  function playUnlockJingle() {
    try {
      if (window.AudioManager && window.AudioManager.settings.isMuted) return;
      const effectiveVol = window.AudioManager ? window.AudioManager.getEffectiveSFXVolume() : 1.0;
      if (effectiveVol <= 0) return;

      const ctx = window.AudioManager ? window.AudioManager.getAudioContext() : new (window.AudioContext || window.webkitAudioContext)();
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C E G C E G
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
        gain.gain.setValueAtTime(0.18 * effectiveVol, ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + (i + 1) * 0.08 + 0.1);
        osc.connect(gain);
        gain.connect(window.AudioManager && window.AudioManager.sfxGainNode ? window.AudioManager.sfxGainNode : ctx.destination);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + (i + 1) * 0.08 + 0.12);
      });
    } catch (e) { }
  }

  // Notificações / Toasts de Novos Desbloqueios
  function displayUnlockToast(unlock) {
    const container = document.getElementById('unlockToastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'unlock-notification-toast';
    toast.innerHTML = `
      <span class="unlock-toast-icon">${unlock.icon || '🏆'}</span>
      <div class="unlock-toast-content">
        <span class="unlock-toast-tag">★ NOVO DESBLOQUEIO! ★</span>
        <span class="unlock-toast-title">${unlock.title || unlock.name}</span>
        <span class="unlock-toast-desc">${unlock.desc || 'Disponível para seleção no menu!'}</span>
      </div>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-20px) scale(0.9)';
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 350);
    }, 6000);
  }

  function checkPendingUnlocks() {
    if (!window.MetaProgression) return;
    const pending = window.MetaProgression.consumePendingUnlocks();
    if (pending && pending.length > 0) {
      playUnlockJingle();
      pending.forEach((u, idx) => {
        setTimeout(() => displayUnlockToast(u), idx * 450);
      });
    }
  }

  function refreshDeckModal() {
    const metaData = window.MetaProgression ? window.MetaProgression.getData() : null;

    // ABA 1: Slimes
    // Se o slime atualmente selecionado estiver bloqueado, reseta para o clássico
    if (window.MetaProgression && !window.MetaProgression.isSlimeUnlocked(selectedSlime)) {
      selectedSlime = 'classic';
      localStorage.setItem('munch_selected_slime', 'classic');
      updateMainSlimeCard();
    }

    document.querySelectorAll('.slime-select-card').forEach(card => {
      const slimeVariant = card.getAttribute('data-slime');
      const btn = card.querySelector('.btn-select-slime');
      const lockInfo = card.querySelector('.slime-lock-info');
      const reqText = card.querySelector('.lock-req-text');
      const progressFill = card.querySelector('.lock-progress-fill');
      const marksContainer = card.querySelector('.slime-completion-marks');

      const isUnlocked = window.MetaProgression ? window.MetaProgression.isSlimeUnlocked(slimeVariant) : (slimeVariant === 'classic');

      if (!isUnlocked) {
        card.classList.add('locked');
        card.classList.remove('selected');
        if (btn) btn.innerText = 'BLOQUEADO 🔒';
        if (lockInfo) lockInfo.style.display = 'flex';

        // Atualiza texto do requisito e barra de progresso cumulativo
        if (reqText && progressFill && metaData) {
          if (slimeVariant === 'metallic') {
            const spent = metaData.totalGoldSpent || 0;
            const pct = Math.min(100, Math.round((spent / 500) * 100));
            reqText.innerText = `🔒 Gastar 500 Ouros em Lojas (${spent}/500)`;
            progressFill.style.width = `${pct}%`;
          } else if (slimeVariant === 'ballistic') {
            const kills = metaData.totalKills || 0;
            const pct = Math.min(100, Math.round((kills / 500) * 100));
            reqText.innerText = `🔒 Eliminar 500 Inimigos (${kills}/500)`;
            progressFill.style.width = `${pct}%`;
          } else if (slimeVariant === 'gambler') {
            const maxMult = metaData.maxMultReached || 1;
            const pct = Math.min(100, Math.round((maxMult / 30) * 100));
            reqText.innerText = `🔒 Atingir Mult >= x30 em Jogo (Recorde: x${maxMult})`;
            progressFill.style.width = `${pct}%`;
          }
        }
      } else {
        card.classList.remove('locked');
        if (lockInfo) lockInfo.style.display = 'none';
        if (slimeVariant === selectedSlime) {
          card.classList.add('selected');
          if (btn) btn.innerText = 'SELECIONADO';
        } else {
          card.classList.remove('selected');
          if (btn) btn.innerText = 'SELECIONAR';
        }
      }

      // Atualiza Matriz de Conclusão (Completion Marks)
      if (marksContainer && window.MetaProgression) {
        const marks = window.MetaProgression.getCompletionMarks(slimeVariant);
        const whiteChip = marksContainer.querySelector('.mark-chip[data-stake="white"]');
        const redChip = marksContainer.querySelector('.mark-chip[data-stake="red"]');
        const goldChip = marksContainer.querySelector('.mark-chip[data-stake="gold"]');

        if (whiteChip) {
          whiteChip.classList.toggle('active', !!marks.white);
          whiteChip.classList.toggle('inactive', !marks.white);
        }
        if (redChip) {
          redChip.classList.toggle('active', !!marks.red);
          redChip.classList.toggle('inactive', !marks.red);
        }
        if (goldChip) {
          goldChip.classList.toggle('active', !!marks.gold);
          goldChip.classList.toggle('inactive', !marks.gold);
        }
      }
    });

    // ABA 2: Compêndio / Álbum de Relíquias
    let discoveredIds = [];
    try {
      const disc1 = JSON.parse(localStorage.getItem('munch_discovered_relics') || '[]');
      const disc2 = JSON.parse(localStorage.getItem('unlockedRelics') || '[]');
      discoveredIds = Array.from(new Set([...disc1, ...disc2]));
    } catch (e) {
      discoveredIds = [];
    }

    const compendiumGrid = document.getElementById('compendiumGrid');
    if (compendiumGrid) {
      compendiumGrid.innerHTML = '';
      RELIC_CODEX.forEach(relic => {
        const isDiscovered = discoveredIds.includes(relic.id);
        const cardEl = document.createElement('div');
        const rarityMap = {
          'Comum': 'comum',
          'Incomum': 'incomum',
          'Rara': 'rara',
          'Lendária': 'lendaria',
          'Lendaria': 'lendaria'
        };
        const rarityClass = rarityMap[relic.rarity] || relic.rarity.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        if (isDiscovered) {
          cardEl.className = `compendium-card discovered ${rarityClass}`;
          const isImg = relic.icon && (relic.icon.includes('/') || relic.icon.includes('.'));
          const iconHtml = isImg ? `<img class="relic-svg-icon" src="${relic.icon}" alt="${relic.name}">` : relic.icon;
          cardEl.innerHTML = `
            <div class="compendium-card-icon">${iconHtml}</div>
            <div class="compendium-card-name">${relic.name}</div>
            <div class="compendium-card-rarity ${rarityClass}">${relic.rarity.toUpperCase()}</div>
            <div class="compendium-card-desc">${relic.desc}</div>
          `;
        } else {
          cardEl.className = 'compendium-card locked';
          cardEl.innerHTML = `
            <div class="compendium-card-icon" style="font-size: 11px; font-weight: bold; font-family: 'Press Start 2P', monospace; color: #555;">? ? ?</div>
            <div class="compendium-card-name" style="letter-spacing: 1px;">DESCONHECIDA</div>
            <div class="compendium-card-rarity">BLOQUEADA</div>
            <div class="compendium-card-desc" style="font-style: italic; color: #777;">Encontre esta relíquia em uma partida para registrar</div>
          `;
        }
        compendiumGrid.appendChild(cardEl);
      });
    }

    const counterEl = document.getElementById('discoveredRelicsCount');
    if (counterEl) {
      counterEl.innerText = `${discoveredIds.length} / ${RELIC_CODEX.length}`;
    }

    // ABA 3: Temas
    if (window.MetaProgression && !window.MetaProgression.isThemeUnlocked(selectedTheme)) {
      selectedTheme = 'default';
      localStorage.setItem('munch_crt_theme', 'default');
      applyTheme('default');
    }

    document.querySelectorAll('.theme-card').forEach(card => {
      const themeName = card.getAttribute('data-theme');
      const lockBadge = card.querySelector('.theme-lock-badge');
      const isUnlocked = window.MetaProgression ? window.MetaProgression.isThemeUnlocked(themeName) : true;

      if (!isUnlocked) {
        card.classList.add('locked');
        card.classList.remove('selected');
        if (lockBadge) {
          lockBadge.style.display = 'block';
          if (themeName === 'gameboy') {
            lockBadge.innerText = '🔒 Vencer 1 Run (Qualquer Ficha)';
          } else if (themeName === 'cyberpunk') {
            lockBadge.innerText = '🔒 Vencer na Ficha Dourada';
          }
        }
      } else {
        card.classList.remove('locked');
        if (lockBadge) lockBadge.style.display = 'none';
        if (themeName === selectedTheme) {
          card.classList.add('selected');
        } else {
          card.classList.remove('selected');
        }
      }
    });
  }

  // Evento de Selecionar Slime
  document.querySelectorAll('.slime-select-card').forEach(card => {
    card.addEventListener('click', () => {
      const targetSlime = card.getAttribute('data-slime');
      if (window.MetaProgression && !window.MetaProgression.isSlimeUnlocked(targetSlime)) {
        card.classList.add('shake-locked');
        playLockSound();
        setTimeout(() => card.classList.remove('shake-locked'), 300);
        return;
      }
      selectedSlime = targetSlime;
      localStorage.setItem('munch_selected_slime', selectedSlime);
      refreshDeckModal();
      updateMainSlimeCard();
    });
  });

  // Evento de Selecionar Tema CRT
  document.querySelectorAll('.theme-card').forEach(card => {
    card.addEventListener('click', () => {
      const targetTheme = card.getAttribute('data-theme');
      if (window.MetaProgression && !window.MetaProgression.isThemeUnlocked(targetTheme)) {
        card.classList.add('shake-locked');
        playLockSound();
        setTimeout(() => card.classList.remove('shake-locked'), 300);
        return;
      }
      selectedTheme = targetTheme;
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
    const cardEl = document.getElementById('mainSlimeCard');
    const cardName = document.getElementById('mainSlimeName');
    const cardBadge = document.getElementById('mainSlimeBadge');
    const cardDesc = document.getElementById('mainSlimeDesc');
    const cardRarity = document.getElementById('mainSlimeRarity');
    const cardCategory = cardEl ? cardEl.querySelector('.pill-category') : null;

    if (!cardName) return;

    // Metadados dos Slimes com Raridades
    const slimeData = {
      classic: {
        name: 'SLIME CLÁSSICO',
        rarityClass: 'comum',
        rarityText: 'COMUM',
        categoryText: 'STARTER',
        badgeClass: 'card-stat-pill blue',
        badgeHtml: '<span class="pill-value">Padrão</span>',
        desc: 'Slime inicial balanceado sem habilidades extras.',
        color: '#a3a3c2'
      },
      metallic: {
        name: 'SLIME MERCENÁRIO',
        rarityClass: 'incomum',
        rarityText: 'INCOMUM',
        categoryText: 'ECONOMIA',
        badgeClass: 'card-stat-pill cyan',
        badgeHtml: '<span class="pill-value">+30</span> Fichas / Pastilha',
        desc: '+30 fichas por pastilha, mas recarga de habilidades 20% mais lenta.',
        color: '#22c55e'
      },
      ballistic: {
        name: 'SLIME BALÍSTICO',
        rarityClass: 'rara',
        rarityText: 'RARA',
        categoryText: 'COMBATE',
        badgeClass: 'card-stat-pill orange',
        badgeHtml: '<span class="pill-value">2</span> Cargas de Tiro',
        desc: 'Comece com 2 tiros desbloqueados, porém com 0 pulos iniciais.',
        color: '#ef4444'
      },
      gambler: {
        name: 'SLIME GAMBLER',
        rarityClass: 'lendaria',
        rarityText: 'LENDÁRIA',
        categoryText: 'CAOS',
        badgeClass: 'card-stat-pill gold',
        badgeHtml: '<span class="pill-value">x0.5 - x3.0</span> Mult Caótico',
        desc: 'Seu multiplicador oscila aleatoriamente entre x0.5 e x3.0 por pastilha.',
        color: '#eab308'
      }
    };

    const currentSlime = slimeData[selectedSlime] || slimeData.classic;

    cardName.innerText = currentSlime.name;
    cardBadge.className = currentSlime.badgeClass;
    cardBadge.innerHTML = currentSlime.badgeHtml;
    cardDesc.innerText = currentSlime.desc;

    if (cardRarity) cardRarity.innerText = currentSlime.rarityText;
    if (cardCategory) cardCategory.innerText = currentSlime.categoryText;

    if (cardEl) {
      cardEl.classList.remove('comum', 'incomum', 'rara', 'lendaria');
      cardEl.classList.add(currentSlime.rarityClass);
    }

    // Atualiza cor visual do slime nos SVGs
    const currentColor = currentSlime.color;
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
    const topAchievementsCount = document.getElementById('topAchievementsCount');
    if (topBestRunScore) topBestRunScore.innerText = bestRound.toLocaleString();
    if (topMaxMultValue) topMaxMultValue.innerText = `x${maxMult}`;
    if (topAchievementsCount && window.AchievementManager) {
      const plat = window.AchievementManager.getPlatinumProgress();
      topAchievementsCount.innerText = `${plat.unlocked}/${plat.total}`;
    }

    // Tabela de Histórico Recente
    const historyRaw = localStorage.getItem('munch_run_history') || '[]';
    let history = [];
    try { history = JSON.parse(historyRaw); } catch (e) { history = []; }

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

        const victoryBadge = run.cleared ? '<span class="history-cleared-badge" title="Vitória! Run Concluída">★ VENCEU</span>' : '';

        let relicsHtml = '<div class="history-relics-mini-list">';
        if (run.relics && run.relics.length > 0) {
          run.relics.forEach(r => {
            const isImg = r.icon && (r.icon.includes('/') || r.icon.includes('.'));
            const iconHtml = isImg ? `<img class="relic-svg-icon" src="${r.icon}" alt="${r.name || ''}">` : (r.icon || '🃏');
            relicsHtml += `<div class="history-relic-icon" title="${r.name || ''}">${iconHtml}</div>`;
          });
        } else {
          relicsHtml += '<span style="color:#555; font-size:10px;">Sem relíquias</span>';
        }
        relicsHtml += '</div>';

        tr.innerHTML = `
          <td>${run.date || 'Desconhecida'}</td>
          <td>${stakeBadge}${victoryBadge}</td>
          <td style="font-family:'Press Start 2P', monospace; font-size:9px; color:var(--cyan-primary);">NÍVEL ${run.ante || 1} ${run.cleared ? '<span style="color:#FFE600; font-size:8px;" title="Vitória Conquistada">★</span>' : ''}</td>
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

      const victoryStar = item.cleared ? '<span style="color:#FFE600; font-size:9px; margin-left:4px;" title="Vitória Conquistada!">★</span>' : '';

      tr.innerHTML = `
        <td style="font-family:'Press Start 2P', monospace; font-size:8px; color:var(--yellow-primary);">${medal}</td>
        <td style="font-weight:bold; color:#fff;">${item.name || 'ANÔNIMO'}${victoryStar}</td>
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
    const audio = window.AudioManager ? window.AudioManager.settings : { musicVolume: 10, sfxVolume: 10, isMuted: false };
    const scanlines = localStorage.getItem('munch_option_scanlines') !== 'false';
    const shake = localStorage.getItem('munch_option_shake') || '100';
    const reduceFlashes = localStorage.getItem('munch_option_reduce_flashes') === 'true';
    const controls = localStorage.getItem('munch_controls') || 'wasd';

    const chkMasterMute = document.getElementById('chkMasterMute');
    if (chkMasterMute) chkMasterMute.checked = audio.isMuted;

    document.getElementById('sliderMusicVol').value = audio.musicVolume;
    document.getElementById('lblMusicVol').innerText = `${audio.musicVolume}%`;

    document.getElementById('sliderSfxVol').value = audio.sfxVolume;
    document.getElementById('lblSfxVol').innerText = `${audio.sfxVolume}%`;

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

    if (window.AudioManager) {
      window.AudioManager.updateUI();
    }
  }

  // Master Mute Toggle
  const chkMasterMute = document.getElementById('chkMasterMute');
  if (chkMasterMute) {
    chkMasterMute.addEventListener('change', (e) => {
      if (window.AudioManager) {
        window.AudioManager.setMasterMute(e.target.checked, true);
      }
    });
  }

  // Audio Sliders
  document.getElementById('sliderMusicVol').addEventListener('input', (e) => {
    const val = parseInt(e.target.value) || 0;
    document.getElementById('lblMusicVol').innerText = `${val}%`;
    if (window.AudioManager) {
      window.AudioManager.setMusicVolume(val);
    }
  });

  document.getElementById('sliderSfxVol').addEventListener('input', (e) => {
    const val = parseInt(e.target.value) || 0;
    document.getElementById('lblSfxVol').innerText = `${val}%`;
    if (window.AudioManager) {
      window.AudioManager.setSfxVolume(val);
    }
  });

  // Pré-visualização Sonora do SFX ao soltar ou alterar o slider
  document.getElementById('sliderSfxVol').addEventListener('change', () => {
    if (window.AudioManager) {
      window.AudioManager.playSFXPreview();
    }
  });

  // Botão Restaurar Padrões
  const btnRestoreDefaults = document.getElementById('btnRestoreDefaults');
  if (btnRestoreDefaults) {
    btnRestoreDefaults.addEventListener('click', () => {
      // 1. Áudio
      if (window.AudioManager) {
        window.AudioManager.setMasterMute(false, false);
        window.AudioManager.setMusicVolume(10);
        window.AudioManager.setSfxVolume(10);
      }

      // 2. Gráficos & Acessibilidade
      localStorage.setItem('munch_option_scanlines', 'true');
      localStorage.setItem('munch_option_shake', '100');
      localStorage.setItem('munch_option_reduce_flashes', 'false');
      localStorage.setItem('munch_controls', 'wasd');

      refreshOptionsModal();

      // Feedback sonoro da restauração
      if (window.AudioManager) {
        window.AudioManager.playSFXPreview();
      }
    });
  }

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
    if (window.AchievementManager) {
      window.AchievementManager.unlocked = {};
      window.AchievementManager.saveUnlocked();
    }
  });

  // ==========================================================================
  // FUNCIONALIDADE 5: SALA DE TROFÉUS & CONQUISTAS (SISTEMA DE PLATINA)
  // ==========================================================================
  let currentAchFilter = 'all';

  function refreshAchievementsModal(filter = currentAchFilter) {
    currentAchFilter = filter;
    if (!window.AchievementManager) return;

    window.AchievementManager.checkAll(true);
    const plat = window.AchievementManager.getPlatinumProgress();
    const stats = window.AchievementManager.getGlobalStats();
    const unlockedMap = window.AchievementManager.unlocked || {};
    const list = window.AchievementManager.achievements;

    // 1. Atualiza topo do banner de Platina
    const lblPct = document.getElementById('lblPlatinumPercent');
    const barProgress = document.getElementById('barPlatinumProgress');
    const chipTotal = document.getElementById('chipTotalAch');
    const topCount = document.getElementById('topAchievementsCount');

    if (lblPct) lblPct.innerText = `${plat.percentage}%`;
    if (barProgress) barProgress.style.width = `${plat.percentage}%`;
    if (chipTotal) chipTotal.innerText = `${plat.unlocked} / ${plat.total} Desbloqueadas`;
    if (topCount) topCount.innerText = `${plat.unlocked}/${plat.total}`;

    // Contagem por Tiers
    let bronzeUnlocked = 0, bronzeTotal = 0;
    let silverUnlocked = 0, silverTotal = 0;
    let goldUnlocked = 0, goldTotal = 0;
    let platUnlocked = 0;

    list.forEach(a => {
      const isUnl = !!unlockedMap[a.id];
      if (a.tier === 'bronze') { bronzeTotal++; if (isUnl) bronzeUnlocked++; }
      else if (a.tier === 'silver') { silverTotal++; if (isUnl) silverUnlocked++; }
      else if (a.tier === 'gold') { goldTotal++; if (isUnl) goldUnlocked++; }
      else if (a.tier === 'platinum') { if (isUnl) platUnlocked++; }
    });

    const elBronze = document.getElementById('chipBronzeCount');
    const elSilver = document.getElementById('chipSilverCount');
    const elGold = document.getElementById('chipGoldCount');
    const elPlat = document.getElementById('chipPlatCount');

    if (elBronze) elBronze.innerText = `🥉 ${bronzeUnlocked}/${bronzeTotal}`;
    if (elSilver) elSilver.innerText = `🥈 ${silverUnlocked}/${silverTotal}`;
    if (elGold) elGold.innerText = `🥇 ${goldUnlocked}/${goldTotal}`;
    if (elPlat) elPlat.innerText = `💎 ${platUnlocked}/1`;

    // Atualiza contadores nas abas
    const tabAll = document.getElementById('countTabAll');
    const tabUnl = document.getElementById('countTabUnlocked');
    const tabLck = document.getElementById('countTabLocked');
    if (tabAll) tabAll.innerText = plat.total;
    if (tabUnl) tabUnl.innerText = plat.unlocked;
    if (tabLck) tabLck.innerText = plat.total - plat.unlocked;

    // 2. Renderiza lista de cartões no Grid
    const grid = document.getElementById('achievementsListGrid');
    if (!grid) return;
    grid.innerHTML = '';

    list.forEach(ach => {
      const isUnl = !!unlockedMap[ach.id];
      const unlockInfo = unlockedMap[ach.id];

      // Filtro
      if (filter === 'unlocked' && !isUnl) return;
      if (filter === 'locked' && isUnl) return;

      const card = document.createElement('div');
      card.className = `achievement-card ${isUnl ? 'unlocked' : 'locked'} ${ach.tier}`;

      // Progresso numérico para metas cumulativas
      let progressHtml = '';
      if (ach.max > 1) {
        let currentProg = 0;
        if (isUnl) {
          currentProg = ach.max;
        } else if (ach.getProgress) {
          currentProg = ach.getProgress(stats, unlockedMap);
        }
        const pct = Math.min(100, Math.round((currentProg / ach.max) * 100));
        progressHtml = `
          <div class="ach-progress-box">
            <div class="ach-progress-track">
              <div class="ach-progress-fill" style="width: ${pct}%;"></div>
            </div>
            <div class="ach-progress-text">
              <span>Progresso</span>
              <span>${currentProg.toLocaleString()} / ${ach.max.toLocaleString()} (${pct}%)</span>
            </div>
          </div>
        `;
      }

      const statusBadge = isUnl
        ? `<span class="ach-status-badge completed">★ CONCLUÍDA</span>`
        : `<span class="ach-status-badge locked-status">🔒 BLOQUEADA</span>`;

      const dateText = (isUnl && unlockInfo && unlockInfo.date)
        ? `<span class="ach-card-date">${unlockInfo.date}</span>`
        : '';

      card.innerHTML = `
        <div class="ach-card-icon-box">${ach.icon}</div>
        <div class="ach-card-content">
          <div class="ach-card-header">
            <span class="ach-card-title">${ach.name}</span>
            <span class="ach-card-tier-badge ${ach.tier}">${ach.tier}</span>
          </div>
          <div class="ach-card-desc">${ach.desc}</div>
          ${progressHtml}
          <div class="ach-card-footer">
            ${statusBadge}
            ${dateText}
          </div>
        </div>
      `;

      grid.appendChild(card);
    });
  }

  // Evento das abas de filtro das Conquistas
  document.querySelectorAll('.ach-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.ach-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter') || 'all';
      refreshAchievementsModal(filter);
    });
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

  // ==========================================================================

  // POEIRA CÓSMICA FLUTUANTE DINÂMICA (PARTÍCULAS VIVAS NO ESPAÇO)

  // ==========================================================================

  const cosmicDustContainer = document.querySelector('.cosmic-dust');

  if (cosmicDustContainer) {

    cosmicDustContainer.innerHTML = '';

    const particleCount = 28;

    const colors = [

      'rgba(255, 255, 255, 0.85)',

      'rgba(0, 229, 255, 0.9)',

      'rgba(255, 230, 0, 0.85)',

      'rgba(255, 0, 128, 0.8)'

    ];



    for (let i = 0; i < particleCount; i++) {

      const p = document.createElement('div');

      p.className = 'floating-dust-mote';

      const size = 2 + Math.random() * 3.5;

      const color = colors[Math.floor(Math.random() * colors.length)];

      const duration = 12 + Math.random() * 16;

      const delay = -(Math.random() * duration);

      const left = Math.random() * 98;

      const driftX = (Math.random() - 0.5) * 80;

      const maxOp = 0.35 + Math.random() * 0.45;



      p.style.left = left + '%';

      p.style.width = size + 'px';

      p.style.height = size + 'px';

      p.style.backgroundColor = color;

      p.style.boxShadow = '0 0 ' + (size * 2.5) + 'px ' + color;

      p.style.animationDuration = duration + 's';

      p.style.animationDelay = delay + 's';

      p.style.setProperty('--drift-x', driftX + 'px');

      p.style.setProperty('--max-op', maxOp.toString());



      cosmicDustContainer.appendChild(p);

    }

  }



  // Animação de rastro de bolinhas comidas pelo slime decorativo no rodapé
  const dotsContainer = document.querySelector('.dots-trail');
  const chaseGroup = document.querySelector('.chase-group');
  const runnerTrack = document.querySelector('.runner-track');
  const DOT_SPACING = 68;
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

  // Partículas de poeira sincronizadas no impacto do pulo com o chão
  const slimeWrapper = document.querySelector('.slime-wrapper');
  const slimeCharacter = document.querySelector('.slime-character');

  function spawnDustBurst() {
    if (!slimeWrapper || !runnerTrack) return;
    const trackRect = runnerTrack.getBoundingClientRect();
    const slimeRect = slimeWrapper.getBoundingClientRect();

    // Apenas solta poeira se o slime estiver visível na tela
    if (slimeRect.right < trackRect.left || slimeRect.left > trackRect.right) return;

    // O slime corre para a direita -> a parte de trás dele fica em slimeRect.left
    const baseX = (slimeRect.left - trackRect.left) + 8;
    const baseY = (slimeRect.bottom - trackRect.top) - 8;

    for (let i = 0; i < 3; i++) {
      const p = document.createElement('div');
      p.className = 'dust-particle-track';
      // As partículas sopram estritamente para trás (dx negativo) e sobem levemente
      const dx = -(8 + Math.random() * 12);
      const dy = -(3 + Math.random() * 7);

      p.style.left = baseX + 'px';
      p.style.top = baseY + 'px';
      p.style.setProperty('--dx', dx + 'px');
      p.style.setProperty('--dy', dy + 'px');

      runnerTrack.appendChild(p);

      requestAnimationFrame(() => p.classList.add('burst'));
      setTimeout(() => p.remove(), 400);
    }
  }

  // Aciona perfeitamente no momento exato em que o slime toca o chão (0%/100% de cada pulo)
  if (slimeCharacter) {
    slimeCharacter.addEventListener('animationiteration', (e) => {
      if (e.animationName === 'slime-jump') {
        spawnDustBurst();
      }
    });
  }

  // Inicialização da Meta-Progressão no Menu
  refreshDeckModal();
  checkPendingUnlocks();

  // Inicialização das Conquistas no Menu
  if (window.AchievementManager) {
    window.AchievementManager.checkAll(true);
    const plat = window.AchievementManager.getPlatinumProgress();
    const topCount = document.getElementById('topAchievementsCount');
    if (topCount) topCount.innerText = `${plat.unlocked}/${plat.total}`;
  }

  // Verificação e exibição automática do Patch Notes (Primeira vez nesta versão)
  try {
    const lastSeenPatch = localStorage.getItem('munch_last_patch_seen');
    if (lastSeenPatch !== CURRENT_PATCH_VERSION) {
      setTimeout(() => {
        if (activeModalsStack.length === 0) {
          openModal('modalPatchNotes');
        }
      }, 400);
    }
  } catch (e) { }

});
