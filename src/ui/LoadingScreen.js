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
    
    // Vincula a função de disparo para não perder o escopo
    this.triggerStartHandler = (e) => this.handleStartTrigger(e);
  }

  // Reseta a tela para o estado A (inicial, carregamento em loop)
  reset() {
    this.readyToStart = false;
    
    // Remove eventos se estiverem ativos para evitar repetição
    window.removeEventListener('keydown', this.triggerStartHandler);
    window.removeEventListener('click', this.triggerStartHandler);
    
    // Limpa as classes de animação e efeitos
    this.overlay.classList.remove('exit-fade', 'shake-active');
    this.bottomRightLoader.classList.remove('fade-out');
    this.bigSlimeWrapper.classList.remove('fall-impact');
    this.shockwave.classList.remove('shockwave-active');
    this.dust.classList.remove('dust-active');
    this.startPrompt.classList.remove('visible');
    
    // Garante que a tela de carregamento está visível
    this.overlay.classList.remove('hidden');
  }

  // Inicia a sequência de carregamento
  startTransition(durationMs, onComplete, autoStart = false) {
    this.onCompleteCallback = onComplete;
    this.autoStart = autoStart;
    
    this.reset();
    
    // Estado A: Mantém o loop tocando pelo tempo simulado de carregamento
    setTimeout(() => {
      this.completeLoading();
    }, durationMs);
  }

  // Estado B: Conclusão do Carregamento (Transição de Impacto)
  completeLoading() {
    // 1. Esconde os mini loaders do canto inferior direito
    this.bottomRightLoader.classList.add('fade-out');
    
    // 2. Aciona a queda por gravidade do slime gigante
    this.bigSlimeWrapper.classList.add('fall-impact');
    
    // 3. Efeitos visuais no momento exato do impacto (360ms de queda)
    setTimeout(() => {
      this.triggerImpactEffects();
    }, 360);

    // 4. Final da animação de queda (800ms) -> Transiciona para o Estado C
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

    // Expansão da onda de choque
    this.shockwave.classList.add('shockwave-active');
    
    // Dispersão de partículas de poeira
    this.dust.classList.add('dust-active');
  }

  // Estado C: Pronto para Jogar (Exibe o prompt para iniciar)
  enterReadyState() {
    if (this.autoStart) {
      // Inicia direto se for uma transição automática de nível (sem aguardar clique)
      setTimeout(() => {
        this.exitLoading();
      }, 700);
    } else {
      // Aguarda o clique ou toque de tecla do jogador
      this.startPrompt.classList.add('visible');
      this.readyToStart = true;
      
      // Monitora teclado e cliques
      window.addEventListener('keydown', this.triggerStartHandler);
      window.addEventListener('click', this.triggerStartHandler);
    }
  }

  handleStartTrigger(e) {
    // Evita chamadas duplicadas
    if (!this.readyToStart) return;
    
    this.readyToStart = false;
    this.exitLoading();
  }

  exitLoading() {
    // Efeito de fade out na tela de carregamento inteira
    this.overlay.classList.add('exit-fade');
    
    // Aguarda a transição de opacidade acabar antes de esconder o elemento
    setTimeout(() => {
      this.overlay.classList.add('hidden');
      this.reset(); // Limpa as classes para evitar memory leaks
      
      if (typeof this.onCompleteCallback === 'function') {
        this.onCompleteCallback();
      }
    }, 500);
  }
}
