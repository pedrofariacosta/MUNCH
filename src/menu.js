// ── Menu principal do MUNCH ──
// Controla navegação por teclado, glitch do título, card holográfico 3D,
// partículas de poeira e efeito de "devorar" pontos na pista.

window.addEventListener('DOMContentLoaded', () => {

  // ════════════════════════════════════
  //  0. Favicon Estático (Slime)
  // ════════════════════════════════════
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
    
    // Corpo
    faviconCtx.beginPath();
    faviconCtx.roundRect(-9, -9, 18, 18, 3.5);
    faviconCtx.fillStyle = '#9e9e9e';
    faviconCtx.fill();
    faviconCtx.strokeStyle = '#ffffff';
    faviconCtx.lineWidth = 2.5;
    faviconCtx.stroke();
    
    // Sobrancelhas
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
    
    // Olhos
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
    
    // Pupilas
    faviconCtx.fillStyle = '#1a1a1a';
    faviconCtx.fillRect(-5, 0.2, 1.5, 1.5);
    faviconCtx.fillRect(3.5, 0.2, 1.5, 1.5);
    
    // Narinas
    faviconCtx.fillStyle = '#ffffff';
    faviconCtx.fillRect(-1.2, 3.5, 0.8, 0.8);
    faviconCtx.fillRect(0.8, 3.5, 0.8, 0.8);
    
    // Boca
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

  // ════════════════════════════════════
  //  1. Navegação por teclado + botões
  // ════════════════════════════════════

  const buttons = Array.from(document.querySelectorAll('.button-group .btn'));
  let focusIndex = 0;

  function setFocus(index) {
    buttons.forEach(b => b.classList.remove('kb-focus'));
    focusIndex = (index + buttons.length) % buttons.length;
    buttons[focusIndex].classList.add('kb-focus');
  }

  // Inicia com foco no primeiro botão
  setFocus(0);

  function confirmSelection() {
    const btn = buttons[focusIndex];

    // Flash visual de confirmação
    btn.classList.add('confirm-flash');
    setTimeout(() => btn.classList.remove('confirm-flash'), 120);

    // Dispara a ação correspondente
    btn.click();
  }

  window.addEventListener('keydown', (e) => {
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

  // Sincroniza hover do mouse com o foco do teclado
  buttons.forEach((btn, i) => {
    btn.addEventListener('mouseenter', () => setFocus(i));
  });

  // Ação do botão Jogar
  const playButton = document.querySelector('.btn-play');
  if (playButton) {
    playButton.addEventListener('click', () => {
      window.location.href = 'game.html';
    });
  }

  // ════════════════════════════════════
  //  2. Aberração cromática no título
  // ════════════════════════════════════

  const title = document.querySelector('.brand-title');
  let glitchTimer = null;

  function triggerGlitch() {
    title.classList.add('glitch-active');
    setTimeout(() => title.classList.remove('glitch-active'), 180);
  }

  // Glitches aleatórios a cada 3–7s
  function scheduleGlitch() {
    const delay = 3000 + Math.random() * 4000;
    glitchTimer = setTimeout(() => {
      triggerGlitch();
      scheduleGlitch();
    }, delay);
  }

  scheduleGlitch();

  // ════════════════════════════════════
  //  3. Card holográfico 3D com parallax
  // ════════════════════════════════════

  const holoCard = document.querySelector('.holo-card');
  const holoGlare = document.querySelector('.holo-glare');

  if (holoCard) {
    holoCard.addEventListener('mousemove', (e) => {
      const rect = holoCard.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Rotação 3D proporcional à posição do mouse
      const rotateY = ((x - centerX) / centerX) * 14;
      const rotateX = ((centerY - y) / centerY) * 14;

      holoCard.style.transform =
        `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;

      // Move o ponto de luz junto com o cursor
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

  // ════════════════════════════════════
  //  4. Pontos "devorados" na pista
  // ════════════════════════════════════

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

  // A cada frame, checa se o slime passou por cima de algum ponto
  function updateDots() {
    if (!chaseGroup || dots.length === 0) {
      requestAnimationFrame(updateDots);
      return;
    }

    const trackRect = runnerTrack.getBoundingClientRect();
    const groupRect = chaseGroup.getBoundingClientRect();

    // Posição X do slime relativa à pista
    const slimeX = groupRect.left - trackRect.left + 32;

    dots.forEach(d => {
      if (!d.eaten && d.x < slimeX) {
        d.eaten = true;
        d.el.classList.add('eaten');
      }
    });

    // Quando o grupo recicla (volta pro começo), reseta os pontos
    if (groupRect.left > trackRect.right) {
      dots.forEach(d => {
        d.eaten = false;
        d.el.classList.remove('eaten');
      });
    }

    requestAnimationFrame(updateDots);
  }

  requestAnimationFrame(updateDots);

  // ════════════════════════════════════
  //  5. Partículas de poeira no impacto
  // ════════════════════════════════════

  const slimeWrapper = document.querySelector('.slime-wrapper');

  function spawnDustBurst() {
    if (!slimeWrapper || !runnerTrack) return;

    const wrapperRect = slimeWrapper.getBoundingClientRect();
    const trackRect = runnerTrack.getBoundingClientRect();

    // Pé do slime (base)
    const baseX = wrapperRect.left - trackRect.left + wrapperRect.width / 2;
    const baseY = wrapperRect.bottom - trackRect.top;

    for (let i = 0; i < 6; i++) {
      const p = document.createElement('div');
      p.className = 'dust-particle-track';
      const side = i < 3 ? -1 : 1;
      const dx = (4 + Math.random() * 10) * side;
      const dy = -(3 + Math.random() * 7);

      p.style.left = baseX + 'px';
      p.style.top = baseY + 'px';
      p.style.setProperty('--dx', dx + 'px');
      p.style.setProperty('--dy', dy + 'px');

      runnerTrack.appendChild(p);

      // Inicia a animação no próximo frame pra garantir a transição
      requestAnimationFrame(() => p.classList.add('burst'));

      // Remove do DOM quando acabar
      setTimeout(() => p.remove(), 400);
    }
  }

  // O slime-jump leva 500ms, aterrissa em ~0% e ~100% do ciclo
  // Dispara poeira sincronizada com a aterrissagem
  setInterval(spawnDustBurst, 500);

});
