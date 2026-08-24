# MUNCH

Um arcade roguelike de labirinto onde você controla um Slime rabugento que devora pastilhas, atordoa inimigos e coleciona cartas entre as fases pra montar combos absurdos de pontuação.

O jogo mistura ação em tempo real dentro do labirinto com um sistema de progressão por cartas. Cada run é diferente, e a graça tá em descobrir quais combinações de cartas quebram o jogo mais rápido.

Roda 100% no navegador, sem backend, sem framework — só HTML, CSS e JavaScript vanilla. Dá pra hospedar de graça no GitHub Pages.

---

## Controles

| Tecla | Ação |
|---|---|
| Setas / WASD | Movimentação pelo labirinto |
| Espaço / X | Pulo (Vault) — salta 2 casas à frente, passando por cima de paredes e inimigos |
| Z / Shift | Disparo (Blaster) — projétil que atordoa inimigos em linha reta |
| F3 | Painel de debug (posição, grid, direção, etc.) |

O Pulo e o Disparo começam desabilitados. Você desbloqueia eles comprando as cartas **Mola Hidráulica** e **Canhão de Plasma** na loja entre as fases.

---

## Como funciona

Cada fase tem uma **meta de pontuação**. Você percorre o labirinto comendo pastilhas e fugindo dos inimigos (que são cartas de baralho — Espadas e Ouros). Quando atinge a meta, um portal verde abre no centro do mapa. Você pode continuar catando pastilhas pra acumular mais fichas ou entrar no portal pra avançar.

Entre uma fase e outra, aparece uma **loja de cartas** onde você gasta o ouro que coletou. As cartas que você compra ficam ativas pelo resto da run e vão empilhando efeitos.

Se perder todas as vidas, a run acaba e você recomeça do zero. Roguelike clássico.

### Pastilhas

- **Normal** — as pastilhas padrão espalhadas pelo labirinto
- **Dourada** — dá mais fichas e um boost de multiplicador. Aparece em posições aleatórias a cada fase
- **Azul (Power Pellet)** — ativa o modo frenesi: os inimigos ficam vulneráveis por alguns segundos e você pode devorá-los pra ganhar pontos massivos. Também aparece aleatoriamente

### Pontuação

A pontuação funciona em duas camadas: cada pastilha rende fichas base, e esse valor é multiplicado pelo seu multiplicador atual. As cartas que você coleta ao longo da run vão inflando esses números, e o jogo escala exponencialmente conforme você avança.

---

## Cartas

As cartas têm três raridades — **Comum**, **Incomum** e **Rara** — e se dividem em três categorias:

### Ação & Sobrevivência
| Carta | Raridade | Efeito |
|---|---|---|
| Mola Hidráulica | Comum | +1 carga de pulo |
| Canhão de Plasma | Comum | +1 carga de disparo |
| Bateria Reserva | Comum | +1 vida máxima e recupera todas |
| Overclock de Sistema | Incomum | -30% no cooldown de todas as habilidades |

### Multiplicadores & Pontuação
| Carta | Raridade | Efeito |
|---|---|---|
| Revestimento de Aço | Comum | +20 fichas por pastilha normal |
| Drift Perfeito | Incomum | +2 Mult ao fazer curva na quina exata |
| Caçador de Naipes | Incomum | +5 Mult ao destruir inimigo com disparo |
| Alquimia Dourada | Rara | Moedas especiais dão ×1.75 Mult |

### Quebra de Regras
| Carta | Raridade | Efeito |
|---|---|---|
| Lodo Viscoso | Incomum | Pular deixa poças que reduzem velocidade inimiga em 50% |
| Tiro Perfurante | Rara | O disparo perfura todos os inimigos até bater na parede |
| Vácuo Magnético | Rara | Atrai pastilhas num raio de 1.5 blocos |

---

## Rodando localmente

O jogo usa ES Modules, então abrir o `index.html` direto pelo explorador de arquivos não vai funcionar (CORS). Precisa de um servidor local:

**VS Code:** instala a extensão Live Server, clica com botão direito no `index.html` → Open with Live Server.

**Node:**
```
npx serve
```

**Python:**
```
python -m http.server 8000
```

---

## Deploy

Pra colocar online, sobe tudo pra um repositório no GitHub, vai em Settings → Pages, seleciona a branch `main` na raiz `/` e salva. Em alguns minutos o jogo fica acessível em `https://<seu-usuario>.github.io/<nome-do-repo>/`.

---

## Estrutura do projeto

```
MUNCH/
├── index.html          # Tela de loading com animação do Slime
├── menu.html           # Menu principal com vitrine de carta holográfica
├── game.html           # Tela do jogo (canvas + HUD + modais)
├── src/
│   ├── game.js         # Engine completa — mapa, entidades, física, loja, cartas
│   └── menu.js         # Lógica do menu e navegação
└── styles/
    ├── loading.css      # Animações da tela de loading
    ├── menu.css         # Layout e estilo do menu
    ├── game.css         # HUD, modais, cartas durante o jogo
    └── ui.css           # Componentes de UI da loja
```
