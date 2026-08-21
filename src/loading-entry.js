import { LoadingScreen } from './ui/LoadingScreen.js';

// Inicia a tela de loading ao carregar a página
window.addEventListener('DOMContentLoaded', () => {
  const loading = new LoadingScreen();
  
  // 3 segundos de loading simulado
  // autoStart = false para exigir clique antes de redirecionar
  loading.startTransition(3000, () => {
    // Redireciona para o menu principal
    window.location.href = 'menu.html';
  }, false);
});
