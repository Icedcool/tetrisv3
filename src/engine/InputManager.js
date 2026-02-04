import EventEmitter from './EventEmitter.js';
import { DAS_DELAY, ARR_DELAY, SOFT_DROP_DELAY } from '../constants.js';

const KEY_MAP = {
  ArrowLeft:  'left',
  ArrowRight: 'right',
  ArrowDown:  'softDrop',
  ArrowUp:    'rotateCW',
  KeyX:       'rotateCW',
  KeyZ:       'rotateCCW',
  Space:      'hardDrop',
  ShiftLeft:  'hold',
  ShiftRight: 'hold',
  KeyC:       'hold',
  Escape:     'pause',
  KeyP:       'pause',
};

export default class InputManager extends EventEmitter {
  constructor() {
    super();
    this._keys = new Set();
    this._dasTimers = { left: 0, right: 0 };
    this._dasActive = { left: false, right: false };
    this._softDropTimer = 0;
    this._enabled = false;

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
  }

  enable() {
    if (this._enabled) return;
    this._enabled = true;
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
  }

  disable() {
    this._enabled = false;
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    this._keys.clear();
  }

  update(dt) {
    // DAS/ARR for left
    if (this._keys.has('left')) {
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
    if (this._keys.has('right')) {
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
    if (this._keys.has('softDrop')) {
      this._softDropTimer += dt;
      while (this._softDropTimer >= SOFT_DROP_DELAY) {
        this._softDropTimer -= SOFT_DROP_DELAY;
        this.emit('action', 'softDrop');
      }
    }
  }

  _onKeyDown(e) {
    const action = KEY_MAP[e.code];
    if (!action) return;
    e.preventDefault();

    if (this._keys.has(action)) return; // already held
    this._keys.add(action);

    // Immediate press actions
    switch (action) {
      case 'left':
        this._dasTimers.left = 0;
        this._dasActive.left = false;
        this.emit('action', 'left');
        break;
      case 'right':
        this._dasTimers.right = 0;
        this._dasActive.right = false;
        this.emit('action', 'right');
        break;
      case 'softDrop':
        this._softDropTimer = 0;
        this.emit('action', 'softDrop');
        break;
      case 'rotateCW':
      case 'rotateCCW':
      case 'hardDrop':
      case 'hold':
      case 'pause':
        this.emit('action', action);
        break;
    }
  }

  _onKeyUp(e) {
    const action = KEY_MAP[e.code];
    if (!action) return;
    this._keys.delete(action);

    if (action === 'left') {
      this._dasTimers.left = 0;
      this._dasActive.left = false;
    }
    if (action === 'right') {
      this._dasTimers.right = 0;
      this._dasActive.right = false;
    }
    if (action === 'softDrop') {
      this._softDropTimer = 0;
    }
  }
}
