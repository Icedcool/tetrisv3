export default class GameOverScreen {
  constructor(container, highScores) {
    this._container = container;
    this._highScores = highScores;
    this._el = null;
    this.onRestart = null;
    this.onMenu = null;
  }

  show(data) {
    if (this._el) this.hide();

    const isHigh = this._highScores.isHighScore(data.score);

    const el = document.createElement('div');
    el.className = 'overlay overlay--dim';
    el.innerHTML = `
      <div class="overlay__title">GAME OVER</div>
      ${isHigh ? '<div class="overlay__new-high">NEW HIGH SCORE!</div>' : ''}
      <div class="overlay__score">Score: ${data.score.toLocaleString()}</div>
      <div class="overlay__subtitle">Level ${data.level} — ${data.lines} Lines</div>
      <button class="overlay__btn" data-action="restart">PLAY AGAIN</button>
      <button class="overlay__btn" data-action="menu">MAIN MENU</button>
    `;

    el.querySelector('[data-action="restart"]').addEventListener('click', () => {
      if (this.onRestart) this.onRestart();
    });
    el.querySelector('[data-action="menu"]').addEventListener('click', () => {
      if (this.onMenu) this.onMenu();
    });

    this._container.appendChild(el);
    this._el = el;
    el.querySelector('[data-action="restart"]').focus();
  }

  hide() {
    if (this._el) {
      this._el.remove();
      this._el = null;
    }
  }
}
