import {
  BOARD_X, BOARD_Y, BOARD_H, BOARD_W,
  LEFT_PANEL_X, LEFT_PANEL_W, RIGHT_PANEL_X, RIGHT_PANEL_W,
  CELL_SIZE, PREVIEW_CELL_SIZE, PIECE_SHAPES, COLORS,
  TEXT_COLOR, TEXT_DIM, BORDER_COLOR, BOARD_BG,
} from '../constants.js';

export default class PanelRenderer {
  constructor(renderer) {
    this.renderer = renderer;
    this.ctx = renderer.ctx;
  }

  draw(state) {
    this._drawHold(state);
    this._drawNext(state);
    this._drawScore(state);
    this._drawLevel(state);
    this._drawControls();
  }

  _drawHold(state) {
    const ctx = this.ctx;
    const x = LEFT_PANEL_X + 15;
    const y = BOARD_Y;
    const boxW = 120;
    const boxH = 80;

    // Label
    ctx.fillStyle = TEXT_DIM;
    ctx.font = '12px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('HOLD', x + boxW / 2, y - 8);

    // Box
    ctx.fillStyle = BOARD_BG;
    ctx.fillRect(x, y, boxW, boxH);
    ctx.strokeStyle = BORDER_COLOR;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, boxW, boxH);

    // Piece
    if (state.holdType) {
      const alpha = state.holdUsed ? 0.3 : 1;
      this._drawPreviewPiece(state.holdType, x + boxW / 2, y + boxH / 2, alpha);
    }
  }

  _drawNext(state) {
    const ctx = this.ctx;
    const x = RIGHT_PANEL_X + 15;
    const y = BOARD_Y;
    const boxW = 120;
    const pieceH = 60;

    // Label
    ctx.fillStyle = TEXT_DIM;
    ctx.font = '12px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('NEXT', x + boxW / 2, y - 8);

    // Box
    const boxH = pieceH * state.nextQueue.length;
    ctx.fillStyle = BOARD_BG;
    ctx.fillRect(x, y, boxW, boxH);
    ctx.strokeStyle = BORDER_COLOR;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, boxW, boxH);

    // Pieces
    for (let i = 0; i < state.nextQueue.length; i++) {
      this._drawPreviewPiece(
        state.nextQueue[i],
        x + boxW / 2,
        y + pieceH / 2 + i * pieceH,
        1
      );
    }
  }

  _drawScore(state) {
    const ctx = this.ctx;
    const x = LEFT_PANEL_X + 75;
    const y = BOARD_Y + 120;

    ctx.textAlign = 'center';

    ctx.fillStyle = TEXT_DIM;
    ctx.font = '12px "Segoe UI", sans-serif';
    ctx.fillText('SCORE', x, y);

    ctx.fillStyle = TEXT_COLOR;
    ctx.font = 'bold 20px "Segoe UI", sans-serif';
    ctx.fillText(state.score.toLocaleString(), x, y + 24);

    ctx.fillStyle = TEXT_DIM;
    ctx.font = '12px "Segoe UI", sans-serif';
    ctx.fillText('LINES', x, y + 56);

    ctx.fillStyle = TEXT_COLOR;
    ctx.font = 'bold 20px "Segoe UI", sans-serif';
    ctx.fillText(state.lines.toString(), x, y + 80);
  }

  _drawLevel(state) {
    const ctx = this.ctx;
    const x = RIGHT_PANEL_X + 75;
    const y = BOARD_Y + 220;

    ctx.textAlign = 'center';

    ctx.fillStyle = TEXT_DIM;
    ctx.font = '12px "Segoe UI", sans-serif';
    ctx.fillText('LEVEL', x, y);

    ctx.fillStyle = TEXT_COLOR;
    ctx.font = 'bold 24px "Segoe UI", sans-serif';
    ctx.fillText(state.level.toString(), x, y + 28);
  }

  _drawControls() {
    const ctx = this.ctx;
    const x = LEFT_PANEL_X + 75;
    const y = BOARD_Y + BOARD_H - 120;

    ctx.textAlign = 'center';
    ctx.fillStyle = TEXT_DIM;
    ctx.font = '10px "Segoe UI", sans-serif';

    const lines = [
      '← → Move',
      '↑ / X  Rotate CW',
      'Z  Rotate CCW',
      '↓  Soft Drop',
      'Space  Hard Drop',
      'Shift/C  Hold',
      'Esc/P  Pause',
    ];

    lines.forEach((line, i) => {
      ctx.fillText(line, x, y + i * 16);
    });
  }

  _drawPreviewPiece(type, cx, cy, alpha) {
    const cells = PIECE_SHAPES[type][0];
    const size = PREVIEW_CELL_SIZE;

    // Find bounding box to center
    let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity;
    for (const [r, c] of cells) {
      minR = Math.min(minR, r);
      maxR = Math.max(maxR, r);
      minC = Math.min(minC, c);
      maxC = Math.max(maxC, c);
    }
    const pieceW = (maxC - minC + 1) * size;
    const pieceH = (maxR - minR + 1) * size;
    const offsetX = cx - pieceW / 2;
    const offsetY = cy - pieceH / 2;

    for (const [r, c] of cells) {
      const x = offsetX + (c - minC) * size;
      const y = offsetY + (r - minR) * size;
      this.renderer.drawBlock(x, y, size, type, alpha);
    }
  }
}
