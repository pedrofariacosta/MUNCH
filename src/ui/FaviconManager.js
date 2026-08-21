export class FaviconManager {
  constructor() {
    // Cria um canvas invisível para gerar os frames do favicon
    this.canvas = document.createElement('canvas');
    this.canvas.width = 32;
    this.canvas.height = 32;
    this.ctx = this.canvas.getContext('2d');
    
    // Procura a tag link do favicon ou cria uma se não existir
    this.faviconLink = document.getElementById('dynamic-favicon');
    if (!this.faviconLink) {
      this.faviconLink = document.createElement('link');
      this.faviconLink.id = 'dynamic-favicon';
      this.faviconLink.rel = 'icon';
      this.faviconLink.type = 'image/png';
      document.head.appendChild(this.faviconLink);
    }
    
    this.animationInterval = null;
    this.titleInterval = null;
    this.time = 0;
  }

  // Inicia a animação do favicon pulando e os pontinhos no título da aba
  startAnimation() {
    this.stopAnimation();
    
    this.time = 0;
    
    // Atualiza o favicon em loop (~8 FPS para suavidade ideal sem sobrecarga)
    this.animationInterval = setInterval(() => {
      this.time += 0.22;
      
      // Controla a altura do salto (procedural)
      const yOffset = -Math.abs(Math.sin(this.time)) * 5;
      
      // Controla o estiramento (squash & stretch) conforme a posição do salto
      let squishX = 1;
      let squishY = 1;
      
      const sinVal = Math.sin(this.time);
      const cosVal = Math.cos(this.time);
      
      if (Math.abs(sinVal) < 0.3) {
        // Impacto no chão: achata o slime
        squishX = 1.2;
        squishY = 0.8;
      } else {
        // No ar: estica na subida e normaliza na descida
        if (cosVal > 0) {
          squishX = 0.9;
          squishY = 1.1;
        } else {
          squishX = 0.95;
          squishY = 1.05;
        }
      }
      
      this.drawSlimeFrame(yOffset, squishX, squishY);
    }, 125);

    // Animação de carregamento clássica no título da aba: Carregando...
    let dotCount = 0;
    document.title = 'MUNCH — Carregando';
    this.titleInterval = setInterval(() => {
      dotCount = (dotCount + 1) % 4;
      const dots = '.'.repeat(dotCount);
      document.title = `MUNCH — Carregando${dots}`;
    }, 500);
  }

  // Interrompe qualquer animação ativa
  stopAnimation() {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
      this.animationInterval = null;
    }
    if (this.titleInterval) {
      clearInterval(this.titleInterval);
      this.titleInterval = null;
    }
  }

  // Desenha um frame do slime saltador no favicon canvas
  drawSlimeFrame(yOffset, squishX, squishY) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, 32, 32);
    
    ctx.save();
    ctx.translate(16, 18 + yOffset);
    ctx.scale(squishX, squishY);
    
    // 1. Corpo principal do slime (cubo cinza)
    ctx.beginPath();
    ctx.roundRect(-8, -8, 16, 16, 3);
    ctx.fillStyle = '#9e9e9e';
    ctx.fill();
    
    // Borda branca bem visível
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    
    // 2. Sobrancelhas raivosas
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    // Esquerda
    ctx.beginPath();
    ctx.moveTo(-6, -4);
    ctx.lineTo(-2, -2);
    ctx.stroke();
    // Direita
    ctx.beginPath();
    ctx.moveTo(6, -4);
    ctx.lineTo(2, -2);
    ctx.stroke();
    
    // 3. Olhos bravos em formato wedge (\ /)
    ctx.fillStyle = '#ffffff';
    // Esquerdo
    ctx.beginPath();
    ctx.moveTo(-6, -1);
    ctx.lineTo(-2, 1);
    ctx.lineTo(-6, 2);
    ctx.closePath();
    ctx.fill();
    // Direito
    ctx.beginPath();
    ctx.moveTo(6, -1);
    ctx.lineTo(2, 1);
    ctx.lineTo(6, 2);
    ctx.closePath();
    ctx.fill();
    
    // Pupilas escuras
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-4, 0, 1.2, 1.2);
    ctx.fillRect(3, 0, 1.2, 1.2);
    
    // 4. Narinas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-1, 3, 0.8, 0.8);
    ctx.fillRect(1, 3, 0.8, 0.8);
    
    // 5. Boca com rosnado e dente afiado
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-3, 5, 6, 2);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(-3, 5, 6, 2);
    
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-2, 5);
    ctx.lineTo(-1, 6);
    ctx.lineTo(0, 5);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
    
    // Injeta a imagem gerada no link do favicon
    this.faviconLink.href = this.canvas.toDataURL('image/png');
  }

  // Define o favicon fixo, nítido e estático pós-carregamento
  setStaticFavicon() {
    this.stopAnimation();
    
    // Define o título definitivo da aba
    document.title = 'MUNCH';
    
    const ctx = this.ctx;
    ctx.clearRect(0, 0, 32, 32);
    
    ctx.save();
    ctx.translate(16, 16);
    
    // 1. Corpo fixo do slime (tamanho ideal de 18x18px para visualização na aba)
    ctx.beginPath();
    ctx.roundRect(-9, -9, 18, 18, 3.5);
    ctx.fillStyle = '#9e9e9e';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    
    // 2. Sobrancelhas agressivas
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';
    // Esquerda
    ctx.beginPath();
    ctx.moveTo(-7, -4.5);
    ctx.lineTo(-2, -2.5);
    ctx.stroke();
    // Direita
    ctx.beginPath();
    ctx.moveTo(7, -4.5);
    ctx.lineTo(2, -2.5);
    ctx.stroke();
    
    // 3. Olhos em cunha (\ /) com alto contraste
    ctx.fillStyle = '#ffffff';
    // Esquerdo
    ctx.beginPath();
    ctx.moveTo(-7, -1);
    ctx.lineTo(-2.5, 1.2);
    ctx.lineTo(-7, 2.5);
    ctx.closePath();
    ctx.fill();
    // Direito
    ctx.beginPath();
    ctx.moveTo(7, -1);
    ctx.lineTo(2.5, 1.2);
    ctx.lineTo(7, 2.5);
    ctx.closePath();
    ctx.fill();
    
    // Pupilas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-5, 0.2, 1.5, 1.5);
    ctx.fillRect(3.5, 0.2, 1.5, 1.5);
    
    // 4. Narinas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-1.2, 3.5, 0.8, 0.8);
    ctx.fillRect(0.8, 3.5, 0.8, 0.8);
    
    // 5. Boca de rosnado com dente
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-4, 5.5, 8, 2.5);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 0.6;
    ctx.strokeRect(-4, 5.5, 8, 2.5);
    
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-2.5, 5.5);
    ctx.lineTo(-1, 7);
    ctx.lineTo(0.5, 5.5);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
    
    this.faviconLink.href = this.canvas.toDataURL('image/png');
  }
}
