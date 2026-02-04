export default class MenuScreen {
  constructor(container, highScores, isTouchDevice = false) {
    this._container = container;
    this._highScores = highScores;
    this._isTouchDevice = isTouchDevice;
    this._el = null;
    this._keyHandler = null;
    this.onPlay = null;
  }

  show() {
    if (this._el) this.hide();

    const el = document.createElement('div');
    el.className = 'overlay';
    el.innerHTML = `
      <div class="menu-card">
        <div class="menu-card__title">TETRIS</div>
        <div class="menu-card__version">v3</div>
        <button class="overlay__btn menu-card__play" data-action="play">PLAY</button>
        <div class="menu-card__hint">${this._isTouchDevice ? 'Tap to play' : 'or press Enter'}</div>
        <div class="overlay__high-scores"></div>
        <div class="menu-card__divider"></div>
        <div class="menu-card__controls">
          ${this._isTouchDevice ? `
          <h4>Controls</h4>
          <p style="font-size:13px;color:#999;text-align:center;">Use the buttons below to play</p>
          ` : `
          <h4>Controls</h4>
          <table>
            <tr><td>← →</td><td>Move</td></tr>
            <tr><td>↑ / X</td><td>Rotate CW</td></tr>
            <tr><td>Z</td><td>Rotate CCW</td></tr>
            <tr><td>↓</td><td>Soft Drop</td></tr>
            <tr><td>Space</td><td>Hard Drop</td></tr>
            <tr><td>Shift / C</td><td>Hold Piece</td></tr>
            <tr><td>Esc / P</td><td>Pause</td></tr>
          </table>
          `}
        </div>
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
