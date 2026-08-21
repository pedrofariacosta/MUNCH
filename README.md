# MUNCH — Arcade Action Roguelike

**Munch** é um jogo indie de ação e estratégia roguelike executado 100% no lado do cliente (Client-Side) e projetado para hospedagem gratuita e contínua via **GitHub Pages**.

O game funde a movimentação rápida de labirinto clássico (estilo *Pac-Man*) com a progressão exponencial de pontuação inspirada em *Balatro*.

---

## 🕹️ Como Jogar (Controles)

- **Setas / WASD:** Navegação em tempo real pela grade do labirinto.
- **Espaço / X:** **Pulo (Vault)** — Salta instantaneamente 2 casas à frente na direção atual. Útil para ultrapassar paredes finas ou pular por cima de fantasmas. *(Possui tempo de recarga).*
- **Z / Shift:** **Disparo (Blaster)** — Dispara um projétil linear de choque que atordoa temporariamente qualquer fantasma atingido. *(Possui tempo de recarga).*

---

## 📈 Sistema de Pontuação (Chips x Mult)

Assim como em *Balatro*, a pontuação de cada pastilha comida é calculada dinamicamente:
$$\text{Pontos} = (\text{Chips Base} + \text{Chips de Coringas}) \times (\text{Mult Base} + \text{Mult de Coringas})$$

- **Pastilha Normal:** 10 Chips x 1 Mult
- **Pastilha Dourada:** 50 Chips x 2 Mult
- **Super Pastilha:** 100 Chips x 4 Mult
- **Devorar Fantasma Atordoado:** 300 Chips x 5 Mult $\times$ Combo acumulado.
- **Combo:** Comer pastilhas rapidamente mantém um combo (durabilidade de 3.5 segundos). Relíquias especiais tiram proveito do multiplicador de combo.

---

## 🛒 Loja & Progressão Roguelike

1. **Meta de Blind:** Cada fase (Blind) possui uma meta de pontuação (ex: Fase 1 pede 1.500 pontos, Fase 2 pede 4.000, etc.).
2. **Portal:** Ao atingir a pontuação alvo, um **Portal Verde** se abre no centro do mapa. A fase continua ativa para você buscar pontos adicionais; entre no portal quando decidir avançar.
3. **Loja de Upgrades:** A cada portal, você visita a loja onde gasta o Ouro ganho.
4. **Coringas e Relíquias (Múltiplos efeitos):**
   - **Slime Booster:** +15 Chips permanentes por pastilha comida.
   - **Sugar Rush:** +3 Mult se sua vida estiver cheia.
   - **Combo Master:** Cada 5 de combo adiciona +1 Mult.
   - **Golden Tooth:** Pastilhas Douradas ganham +50 Chips extras.
   - **Heavy Blaster:** Fantasmas ficam atordoados por mais tempo.
   - **Vault Sandals:** Diminui em 25% o tempo de recarga do pulo.
   - **Rage Slime:** x1.5 de Mult se houverem 2 ou mais fantasmas no mapa.
   - **Tax Refund:** Adiciona +3 de Ouro ao passar de fase.
   - **Overdrive:** +60 Chips ao custo de recarga de blaster maior.
   - **Lucky Seven:** Chance de 14% de ganhar ouro extra ao comer orbes.

---

## 🚀 Execução Local

Como o projeto faz uso de **ES6 Modules** (`import` / `export`), a abertura direta do arquivo `index.html` via protocolo `file://` no navegador será bloqueada por políticas de CORS. É necessário servir os arquivos a partir de um servidor local.

### Opção 1: VS Code Live Server
Se você usa o VS Code, instale a extensão **Live Server**, clique com o botão direito em `index.html` e selecione *Open with Live Server*.

### Opção 2: Servidor Node.js (npx)
Execute o seguinte comando no terminal na raiz do projeto:
```bash
npx serve
```
Abra o endereço `http://localhost:3000` informado.

### Opção 3: Servidor Python
Se tiver Python instalado, execute na raiz do projeto:
```bash
# Python 3
python -m http.server 8000
```
Abra `http://localhost:8000` em seu navegador.

---

## 🌐 Deploy no GitHub Pages

Para publicar seu jogo online:
1. Crie um repositório no GitHub (ex: `munch-game`).
2. Suba todos os arquivos para a branch principal (`main` ou `master`).
3. Vá em **Settings** (Configurações) do repositório no GitHub.
4. No menu lateral, acesse **Pages**.
5. Em **Build and deployment**, selecione para implantar a partir de uma branch (`Deploy from a branch`).
6. Escolha a branch `main` e a pasta `/` (root), depois clique em **Save**.
7. Em poucos minutos, seu jogo estará online no endereço `https://<seu-usuario>.github.io/munch-game/`.
