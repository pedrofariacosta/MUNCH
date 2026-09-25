<div align="center">
    
# MUNCH

### Um arcade roguelike de labirinto com progressão por cartas.

Controle um Slime, explore labirintos, enfrente inimigos e combine cartas para alcançar pontuações cada vez maiores.

<br>

[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/CSS)

<br>

[![Jogar MUNCH](https://img.shields.io/badge/JOGAR_AGORA-22C55E?style=for-the-badge&logo=googlechrome&logoColor=white)](https://www.munch.bytecodegroup.com.br/index.html)

</div>

---

## 📖 Sobre o projeto

**MUNCH** é um jogo arcade roguelike de labirinto, inspirado em jogos clássicos como Pac-Man e combinado com um sistema de progressão por cartas.

O jogador controla um Slime que precisa percorrer labirintos, coletar pastilhas e evitar inimigos para atingir a meta de pontuação de cada fase. Ao alcançar essa meta, um portal é liberado, permitindo avançar para o próximo nível.

Entre as fases, o jogador pode acessar uma loja e adquirir cartas que concedem novas habilidades, aumentam a pontuação e modificam as mecânicas do jogo. Os efeitos das cartas podem ser combinados, permitindo criar diferentes estratégias durante cada partida.

O projeto foi desenvolvido utilizando **HTML5, CSS3 e JavaScript puro**, sem frameworks ou engines externas. A renderização do jogo utiliza a Canvas API, enquanto a organização do código é feita por meio de módulos JavaScript (ES Modules).

---

## 📸 Imagens do jogo

### Gameplay

<p align="center">
  <img width="1867" height="915" alt="image" src="https://github.com/user-attachments/assets/5c6d3c0f-d4b5-45a6-9475-0fc887d0d692" />
</p>

### Menu inicial e loja de cartas

<p align="center">
  <img width="1861" height="927" alt="image" src="https://github.com/user-attachments/assets/afabd74c-2f24-46cf-8c4a-58f83210d3c2" />

  <img width="1868" height="923" alt="image" src="https://github.com/user-attachments/assets/36234928-fbf4-432d-833f-3e6c49188bcb" />
</p>

---

## ✨ Funcionalidades

- **Movimentação em labirintos:** controle do personagem em tempo real, com coleta de pastilhas e obstáculos pelo cenário.
- **Inimigos:** cartas de baralho que perseguem o jogador durante as fases.
- **Progressão por fases:** cada fase possui uma meta de pontuação que deve ser alcançada para desbloquear o portal.
- **Sistema de cartas:** loja de melhorias entre as fases, com efeitos que podem ser combinados e acumulados durante a partida.
- **Habilidades especiais:** pulo para atravessar obstáculos e disparo para atordoar inimigos.
- **Sistema de pontuação:** multiplicadores e bônus que permitem criar diferentes combinações de cartas.
- **Modo frenesi:** pastilhas especiais tornam os inimigos temporariamente vulneráveis.
- **Morte permanente:** ao perder todas as vidas, o jogador precisa iniciar uma nova partida.

---

## 🎮 Como jogar

O objetivo é percorrer o labirinto, coletar pastilhas e acumular pontos suficientes para atingir a meta de cada fase.

Durante a partida, o jogador deve evitar os inimigos e utilizar suas habilidades para sobreviver. Ao alcançar a pontuação necessária, um portal é liberado no centro do mapa.

O jogador pode entrar no portal para avançar ou continuar explorando o labirinto para acumular mais recursos.

Entre as fases, uma loja permite utilizar o ouro coletado para adquirir cartas que melhoram as habilidades do personagem e aumentam seu potencial de pontuação.

### Controles

| Tecla | Ação |
|:---:|---|
| Setas / WASD | Movimentar o personagem |
| Espaço / X | Pular obstáculos e inimigos |
| Z / Shift | Disparar contra os inimigos |
| F3 | Abrir o painel de debug |

> **Observação:** As habilidades de pulo e disparo começam desabilitadas. Para utilizá-las, é necessário adquirir as cartas Mola Hidráulica e Canhão de Plasma na loja durante a partida.

### Tipos de pastilhas

| Pastilha | Efeito |
|---|---|
| ⚪ Normal | Concede a pontuação base ao ser coletada. |
| 🟡 Dourada | Oferece mais fichas e bônus de multiplicador. |
| 🔵 Azul | Ativa o modo frenesi, permitindo devorar inimigos temporariamente vulneráveis. |

---

## 🃏 Sistema de cartas

O sistema de cartas é uma das principais mecânicas do MUNCH.

A cada fase concluída, o jogador pode utilizar o ouro coletado para adquirir melhorias na loja. As cartas permanecem ativas durante a partida e seus efeitos podem ser combinados para criar diferentes estratégias.

As cartas estão divididas em três raridades:

- 🟢 **Comum:** melhorias básicas de habilidades, vida e pontuação.
- 🔵 **Incomum:** efeitos adicionais e modificadores de habilidades.
- 🟣 **Rara:** melhorias especiais que modificam as mecânicas do jogo.

### Exemplos de cartas

| Carta | Raridade | Efeito |
|---|---|---|
| Mola Hidráulica | 🟢 Comum | Adiciona uma carga de pulo. |
| Canhão de Plasma | 🟢 Comum | Adiciona uma carga de disparo. |
| Bateria Reserva | 🟢 Comum | Aumenta a vida máxima e recupera as vidas. |
| Revestimento de Aço | 🟢 Comum | Aumenta as fichas recebidas por pastilha normal. |
| Overclock de Sistema | 🔵 Incomum | Reduz o tempo de recarga das habilidades. |
| Drift Perfeito | 🔵 Incomum | Concede multiplicador ao realizar curvas precisas. |
| Lodo Viscoso | 🔵 Incomum | Cria poças que reduzem a velocidade dos inimigos. |
| Tiro Perfurante | 🟣 Rara | Permite que os disparos atravessem múltiplos inimigos. |
| Vácuo Magnético | 🟣 Rara | Atrai pastilhas próximas ao personagem. |

As diferentes combinações de cartas permitem desenvolver estratégias de sobrevivência, movimentação e pontuação durante cada partida.

---

## 🛠️ Tecnologias utilizadas

O MUNCH foi desenvolvido utilizando as seguintes tecnologias:

| Tecnologia | Utilização |
|---|---|
| HTML5 | Estrutura das páginas, menus e interface do jogo. |
| CSS3 | Estilização, animações e elementos visuais. |
| JavaScript (ES6+) | Lógica do jogo, movimentação, colisões, inimigos e sistema de cartas. |
| Canvas API | Renderização gráfica do labirinto e dos elementos do jogo. |
| ES Modules | Organização e modularização do código JavaScript. |

O projeto é executado diretamente no navegador e não depende de frameworks, engines externas ou serviços de backend.

---

## 📁 Estrutura do projeto

```text
MUNCH/
│
├── assets/
│   └── images/
│       ├── logo.png
│       ├── gameplay.png
│       ├── menu.png
│       └── shop.png
│
├── src/
│   ├── game.js
│   └── menu.js
│
├── styles/
│   ├── loading.css
│   ├── menu.css
│   ├── game.css
│   └── ui.css
│
├── index.html
├── menu.html
├── game.html
└── README.md
```

### Principais arquivos

- `index.html`: tela de carregamento e animação inicial.
- `menu.html`: menu principal e navegação.
- `game.html`: estrutura da tela de jogo, HUD e elementos de interface.
- `src/game.js`: lógica principal, movimentação, renderização, inimigos, pontuação e sistema de cartas.
- `src/menu.js`: lógica e interações do menu principal.
- `styles/`: arquivos CSS responsáveis pela aparência e pelas animações das diferentes telas.
- `assets/images/`: imagens utilizadas na documentação do projeto.

---

## 🚀 Como executar o projeto

O MUNCH pode ser acessado diretamente pelo navegador, sem necessidade de instalação:

**[Jogar MUNCH online](https://www.munch.bytecodegroup.com.br/index.html)**

Para executar o projeto localmente, siga as instruções abaixo.

### 1. Clone o repositório

```bash
git clone https://github.com/pedrofariacosta/MUNCH.git
```

### 2. Acesse a pasta do projeto

```bash
cd MUNCH
```

### 3. Inicie um servidor local

O projeto utiliza ES Modules, portanto é necessário executá-lo por meio de um servidor HTTP local.

Escolha uma das opções abaixo.

**Opção 1 — Visual Studio Code**

Instale a extensão Live Server e abra o arquivo `index.html` utilizando a opção `Open with Live Server`.

**Opção 2 — Python**

Execute o comando abaixo no terminal, dentro da pasta do projeto:

```bash
python -m http.server 8000
```

Em seguida, acesse:

http://localhost:8000

**Opção 3 — Node.js**

Caso tenha o Node.js instalado, execute:

```bash
npx serve
```

Acesse o endereço local informado no terminal.

---

## 👨‍💻 Desenvolvimento

Projeto desenvolvido por [Pedro Arthur Faria Costa](https://github.com/pedrofariacosta).

---

<div align="center">

### 🟢 Pronto para jogar?

Explore o labirinto, descubra novas combinações de cartas e tente superar sua pontuação.

**[JOGAR MUNCH](https://www.munch.bytecodegroup.com.br/index.html)**

</div>
