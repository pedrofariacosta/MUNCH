// Gerenciador de entradas do teclado (teclas pressionadas)

export class Input {
  constructor() {
    this.keys = {};
    this.presses = {};
    
    // Mapeamento de teclas de atalho
    this.bindings = {
      // Movimentação
      'ArrowUp': 'UP',
      'KeyW': 'UP',
      'ArrowDown': 'DOWN',
      'KeyS': 'DOWN',
      'ArrowLeft': 'LEFT',
      'KeyA': 'LEFT',
      'ArrowRight': 'RIGHT',
      'KeyD': 'RIGHT',
      
      // Habilidades
      'Space': 'VAULT',
      'KeyX': 'VAULT',
      'ShiftLeft': 'BLASTER',
      'KeyZ': 'BLASTER',
      
      // Controles do estado do jogo
      'KeyP': 'PAUSE',
      'Escape': 'PAUSE'
    };
    
    this.setupListeners();
  }

  setupListeners() {
    window.addEventListener('keydown', (e) => {
      // Evita o scroll da tela com as setas e espaço
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
      
      const action = this.bindings[e.code];
      if (action) {
        if (!this.keys[action]) {
          this.presses[action] = true;
        }
        this.keys[action] = true;
      }
    });

    window.addEventListener('keyup', (e) => {
      const action = this.bindings[e.code];
      if (action) {
        this.keys[action] = false;
      }
    });

    // Limpa as teclas se o jogador alternar de janela
    window.addEventListener('blur', () => {
      this.clear();
    });
  }

  isDown(action) {
    return !!this.keys[action];
  }

  // Verifica se a tecla foi pressionada (retorna true apenas uma vez por clique)
  isPressed(action) {
    const pressed = !!this.presses[action];
    if (pressed) {
      this.presses[action] = false; // consume press
    }
    return pressed;
  }

  // Retorna a direção de movimento ativa
  getMovementDirection() {
    if (this.isDown('UP')) return 'UP';
    if (this.isDown('DOWN')) return 'DOWN';
    if (this.isDown('LEFT')) return 'LEFT';
    if (this.isDown('RIGHT')) return 'RIGHT';
    return null;
  }

  clear() {
    this.keys = {};
    this.presses = {};
  }
}
