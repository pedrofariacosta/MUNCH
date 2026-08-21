import { FaviconManager } from './FaviconManager.js';

export class LoadingScreen {
  constructor() {
    this.overlay = document.getElementById('loading-screen');
    this.shockwave = document.getElementById('loading-shockwave');
    this.dust = document.getElementById('loading-dust');
    this.bigSlimeWrapper = document.getElementById('central-slime-wrapper');
    this.startPrompt = document.getElementById('start-prompt');
    this.bottomRightLoader = document.getElementById('bottom-right-loader');
    
    this.readyToStart = false;
    this.onCompleteCallback = null;
    this.autoStart = false;
    
    // Favicon e título da aba
    this.faviconManager = new FaviconManager();
    this.faviconManager.setStaticFavicon();
    
    // Handler do clique/tecla pra iniciar
    this.triggerStartHandler = (e) => this.handleStartTrigger(e);
  }

  // Reseta tela pro estado inicial de loading
  reset() {
    this.readyToStart = false;
    
    // Limpa ouvintes de evento pra não duplicar
    window.removeEventListener('keydown', this.triggerStartHandler);
    window.removeEventListener('click', this.triggerStartHandler);
    
    // Reseta classes de animação
    this.overlay.classList.remove('exit-fade', 'shake-active');
    this.bottomRightLoader.classList.remove('fade-out');
    this.bigSlimeWrapper.classList.remove('fall-impact');
    this.shockwave.classList.remove('shockwave-active');
    this.dust.classList.remove('dust-active');
    this.startPrompt.classList.remove('visible');
    
    // Mostra o overlay de loading
    this.overlay.classList.remove('hidden');
  }

  // Roda a transição de carregamento
  startTransition(durationMs, onComplete, autoStart = false) {
    this.onCompleteCallback = onComplete;
    this.autoStart = autoStart;
    
    this.reset();
    
    // Começa a animar o favicon e muda o título da aba
    this.faviconManager.startAnimation();
    
    // Mantém o loading rodando pelo tempo definido
    setTimeout(() => {
      this.completeLoading();
    }, durationMs);
  }

  // Transição de impacto após terminar o carregamento
  completeLoading() {
    // Para a animação do favicon e define o ícone estático
    this.faviconManager.setStaticFavicon();

    // Esconde o loader mini do canto
    this.bottomRightLoader.classList.add('fade-out');
    
    // Faz o slime gigante despencar
    this.bigSlimeWrapper.classList.add('fall-impact');
    
    // Treme a tela e solta poeira no impacto (360ms de queda)
    setTimeout(() => {
      this.triggerImpactEffects();
    }, 360);

    // Libera a tela pro jogador iniciar (800ms)
    setTimeout(() => {
      this.enterReadyState();
    }, 800);
  }

  triggerImpactEffects() {
    // Tremor de tela
    this.overlay.classList.add('shake-active');
    setTimeout(() => {
      this.overlay.classList.remove('shake-active');
    }, 150);

    // Onda de choque
    this.shockwave.classList.add('shockwave-active');
    
    // Partículas de poeira
    this.dust.classList.add('dust-active');
  }

  // Espera qualquer clique ou tecla pra avançar
  enterReadyState() {
    if (this.autoStart) {
      // Se for transição automática (fim de fase), não espera clique
      setTimeout(() => {
        this.exitLoading();
      }, 700);
    } else {
      // Espera clique ou qualquer tecla
      this.startPrompt.classList.add('visible');
      this.readyToStart = true;
      
      window.addEventListener('keydown', this.triggerStartHandler);
      window.addEventListener('click', this.triggerStartHandler);
    }
  }

  handleStartTrigger(e) {
    if (!this.readyToStart) return;
    
    this.readyToStart = false;
    this.exitLoading();
  }

  exitLoading() {
    // Faz fade out da tela inteira
    this.overlay.classList.add('exit-fade');
    
    // Esconde tudo após o fim do fade
    setTimeout(() => {
      this.overlay.classList.add('hidden');
      this.reset(); // Limpa pra evitar memory leak
      
      if (typeof this.onCompleteCallback === 'function') {
        this.onCompleteCallback();
      }
    }, 500);
  }
}
