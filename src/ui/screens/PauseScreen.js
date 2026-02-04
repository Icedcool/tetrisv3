export default class PauseScreen {
  constructor(container, isTouchDevice = false) {
    this._container = container;
    this._isTouchDevice = isTouchDevice;
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
      <div class="menu-card">
        <div class="menu-card__title">PAUSED</div>
        <button class="overlay__btn menu-card__play" data-action="resume">RESUME</button>
        <div class="menu-card__hint">${this._isTouchDevice ? 'Tap Resume to continue' : 'or press Esc'}</div>
        <div class="menu-card__divider"></div>
        <button class="overlay__btn" data-action="menu">MAIN MENU</button>
      </div>
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
