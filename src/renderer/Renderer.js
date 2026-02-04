import {
  CANVAS_W, CANVAS_H, CELL_SIZE, BG_COLOR,
  BOARD_X, BOARD_Y, BOARD_W, BOARD_H, BOARD_BG, BORDER_COLOR,
  COLORS,
} from '../constants.js';

export default class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.canvas.width = CANVAS_W;
    this.canvas.height = CANVAS_H;
  }

  clear() {
    this.ctx.fillStyle = BG_COLOR;
    this.ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }

  drawBlock(x, y, size, colorKey, alpha = 1) {
    const ctx = this.ctx;
    const color = typeof colorKey === 'string' && COLORS[colorKey]
      ? COLORS[colorKey]
      : colorKey;

    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, size, size);

    // Top-left highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(x, y, size, 1);
    ctx.fillRect(x, y, 1, size);

    // Bottom-right shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(x, y + size - 1, size, 1);
    ctx.fillRect(x + size - 1, y, 1, size);

    ctx.globalAlpha = 1;
  }

  drawBoardBackground() {
    const ctx = this.ctx;
    ctx.fillStyle = BOARD_BG;
    ctx.fillRect(BOARD_X, BOARD_Y, BOARD_W, BOARD_H);

    // Border
    ctx.strokeStyle = BORDER_COLOR;
    ctx.lineWidth = 2;
    ctx.strokeRect(BOARD_X - 1, BOARD_Y - 1, BOARD_W + 2, BOARD_H + 2);
  }
}
