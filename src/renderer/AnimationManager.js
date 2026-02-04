import {
  BOARD_X, BOARD_Y, BOARD_W, CELL_SIZE,
  BOARD_ROWS, VISIBLE_ROWS, LINE_CLEAR_DURATION,
} from '../constants.js';

export default class AnimationManager {
  constructor() {
    this._clearingRows = null;
  }

  startLineClear(rows) {
    this._clearingRows = rows;
  }

  clear() {
    this._clearingRows = null;
  }

  draw(renderer, state) {
    if (!state.clearingRows || state.clearProgress === undefined) return;

    const ctx = renderer.ctx;
    const bufferRows = BOARD_ROWS - VISIBLE_ROWS;
    const t = state.clearProgress;
    const alpha = 0.6 * Math.abs(Math.sin(t * Math.PI * 2));

    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    for (const row of state.clearingRows) {
      if (row >= bufferRows) {
        const y = BOARD_Y + (row - bufferRows) * CELL_SIZE;
        ctx.fillRect(BOARD_X, y, BOARD_W, CELL_SIZE);
      }
    }
  }
}
