import { LoadingScreen } from './ui/LoadingScreen.js';

// Configura e inicia a sequência da tela de carregamento
window.addEventListener('DOMContentLoaded', () => {
  const loading = new LoadingScreen();
  
  // Inicia a transição com 3 segundos de carregamento simulado.
  // autoStart = false exige um clique/tecla para avançar e redirecionar.
  loading.startTransition(3000, () => {
    // Manda o jogador para a página principal do jogo
    window.location.href = 'game.html';
  }, false);
});
