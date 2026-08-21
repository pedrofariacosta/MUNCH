import { Game } from './core/Game.js';

// Inicializa o jogo assim que a página estiver carregada
window.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  
  // Deixa o jogo exposto globalmente para facilitar testes e debug se precisar
  window.munchGame = game;
});
