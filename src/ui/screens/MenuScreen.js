export default class MenuScreen {
  constructor(container, highScores) {
    this._container = container;
    this._highScores = highScores;
    this._el = null;
    this._keyHandler = null;
    this.onPlay = null;
  }

  show() {
    if (this._el) this.hide();

    const el = document.createElement('div');
    el.className = 'overlay';
    el.innerHTML = `
      <div class="overlay__title">TETRIS</div>
      <button class="overlay__btn" data-action="play">PLAY</button>
      <div class="overlay__high-scores"></div>
      <div class="overlay__controls">
        ← → Move &nbsp;|&nbsp; ↑/X Rotate CW &nbsp;|&nbsp; Z Rotate CCW<br>
        ↓ Soft Drop &nbsp;|&nbsp; Space Hard Drop &nbsp;|&nbsp; Shift/C Hold<br>
        Esc/P Pause
      </div>
    `;

    el.querySelector('[data-action="play"]').addEventListener('click', () => {
      if (this.onPlay) this.onPlay();
    });

    this._keyHandler = (e) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        if (this.onPlay) this.onPlay();
      }
    };
    window.addEventListener('keydown', this._keyHandler);

    this._renderScores(el.querySelector('.overlay__high-scores'));
    this._container.appendChild(el);
    this._el = el;
  }

  hide() {
    if (this._keyHandler) {
      window.removeEventListener('keydown', this._keyHandler);
      this._keyHandler = null;
    }
    if (this._el) {
      this._el.remove();
      this._el = null;
    }
  }

  _renderScores(container) {
    const scores = this._highScores.getScores();
    if (scores.length === 0) return;

    let html = '<h3>High Scores</h3><ol>';
    for (const entry of scores) {
      html += `<li>${entry.score.toLocaleString()} — Lv.${entry.level} — ${entry.lines} lines</li>`;
    }
    html += '</ol>';
    container.innerHTML = html;
  }
}
