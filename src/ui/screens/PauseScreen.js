export default class PauseScreen {
  constructor(container) {
    this._container = container;
    this._el = null;
    this._keyHandler = null;
    this.onResume = null;
    this.onMenu = null;
  }

  show() {
    if (this._el) this.hide();

    const el = document.createElement('div');
    el.className = 'overlay overlay--dim';
    el.innerHTML = `
      <div class="overlay__title">PAUSED</div>
      <button class="overlay__btn" data-action="resume">RESUME</button>
      <button class="overlay__btn" data-action="menu">MAIN MENU</button>
      <div class="overlay__controls" style="margin-top:20px">Press Esc to resume</div>
    `;

    el.querySelector('[data-action="resume"]').addEventListener('click', () => {
      if (this.onResume) this.onResume();
    });
    el.querySelector('[data-action="menu"]').addEventListener('click', () => {
      if (this.onMenu) this.onMenu();
    });

    this._keyHandler = (e) => {
      if (e.code === 'Escape' || e.code === 'KeyP') {
        e.preventDefault();
        if (this.onResume) this.onResume();
      }
    };
    window.addEventListener('keydown', this._keyHandler);

    this._container.appendChild(el);
    this._el = el;
    el.querySelector('[data-action="resume"]').focus();
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
}
