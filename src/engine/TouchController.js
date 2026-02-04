import EventEmitter from './EventEmitter.js';
import { DAS_DELAY, ARR_DELAY, SOFT_DROP_DELAY } from '../constants.js';

const BUTTON_ACTIONS = {
  'btn-left':      'left',
  'btn-right':     'right',
  'btn-softdrop':  'softDrop',
  'btn-harddrop':  'hardDrop',
  'btn-rotatecw':  'rotateCW',
  'btn-rotateccw': 'rotateCCW',
  'btn-hold':      'hold',
  'btn-pause':     'pause',
};

const REPEATABLE = new Set(['left', 'right', 'softDrop']);

export default class TouchController extends EventEmitter {
  constructor() {
    super();
    this._held = new Set();
    this._dasTimers = { left: 0, right: 0 };
    this._dasActive = { left: false, right: false };
    this._softDropTimer = 0;

    this._onTouchStart = this._onTouchStart.bind(this);
    this._onTouchEnd = this._onTouchEnd.bind(this);
  }

  bind(containerEl) {
    containerEl.addEventListener('touchstart', this._onTouchStart, { passive: false });
    containerEl.addEventListener('touchend', this._onTouchEnd, { passive: false });
    containerEl.addEventListener('touchcancel', this._onTouchEnd, { passive: false });
  }

  update(dt) {
    // DAS/ARR for left
    if (this._held.has('left')) {
      this._dasTimers.left += dt;
      if (this._dasActive.left) {
        while (this._dasTimers.left >= ARR_DELAY) {
          this._dasTimers.left -= ARR_DELAY;
          this.emit('action', 'left');
        }
      } else if (this._dasTimers.left >= DAS_DELAY) {
        this._dasActive.left = true;
        this._dasTimers.left -= DAS_DELAY;
        this.emit('action', 'left');
      }
    }

    // DAS/ARR for right
    if (this._held.has('right')) {
      this._dasTimers.right += dt;
      if (this._dasActive.right) {
        while (this._dasTimers.right >= ARR_DELAY) {
          this._dasTimers.right -= ARR_DELAY;
          this.emit('action', 'right');
        }
      } else if (this._dasTimers.right >= DAS_DELAY) {
        this._dasActive.right = true;
        this._dasTimers.right -= DAS_DELAY;
        this.emit('action', 'right');
      }
    }

    // Soft drop repeat
    if (this._held.has('softDrop')) {
      this._softDropTimer += dt;
      while (this._softDropTimer >= SOFT_DROP_DELAY) {
        this._softDropTimer -= SOFT_DROP_DELAY;
        this.emit('action', 'softDrop');
      }
    }
  }

  _onTouchStart(e) {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      const btn = touch.target.closest('[data-touch]');
      if (!btn) continue;

      const action = BUTTON_ACTIONS[btn.dataset.touch];
      if (!action) continue;

      if (REPEATABLE.has(action)) {
        if (this._held.has(action)) continue;
        this._held.add(action);

        if (action === 'left') {
          this._dasTimers.left = 0;
          this._dasActive.left = false;
        } else if (action === 'right') {
          this._dasTimers.right = 0;
          this._dasActive.right = false;
        } else if (action === 'softDrop') {
          this._softDropTimer = 0;
        }
      }

      this.emit('action', action);
      btn.classList.add('touch-btn--active');
    }
  }

  _onTouchEnd(e) {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      const btn = touch.target.closest('[data-touch]');
      if (!btn) continue;

      const action = BUTTON_ACTIONS[btn.dataset.touch];
      if (!action) continue;

      if (action === 'left') {
        this._held.delete('left');
        this._dasTimers.left = 0;
        this._dasActive.left = false;
      } else if (action === 'right') {
        this._held.delete('right');
        this._dasTimers.right = 0;
        this._dasActive.right = false;
      } else if (action === 'softDrop') {
        this._held.delete('softDrop');
        this._softDropTimer = 0;
      }

      btn.classList.remove('touch-btn--active');
    }
  }
}
