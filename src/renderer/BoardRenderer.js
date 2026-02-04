import {
  CELL_SIZE, BOARD_X, BOARD_Y, BOARD_ROWS, VISIBLE_ROWS, BOARD_COLS,
  GHOST_COLOR, COLORS,
} from '../constants.js';

export default class BoardRenderer {
  constructor(renderer) {
    this.renderer = renderer;
    this.ctx = renderer.ctx;
  }

  draw(state) {
    this.renderer.drawBoardBackground();
    this._drawLockedBlocks(state.board);
    if (state.piece && !state.clearingRows) {
      this._drawGhost(state.piece, state.ghostRow);
      this._drawActivePiece(state.piece);
    }
  }

  _drawLockedBlocks(grid) {
    const bufferRows = BOARD_ROWS - VISIBLE_ROWS;
    for (let r = bufferRows; r < BOARD_ROWS; r++) {
      for (let c = 0; c < BOARD_COLS; c++) {
        const type = grid[r][c];
        if (type) {
          const x = BOARD_X + c * CELL_SIZE;
          const y = BOARD_Y + (r - bufferRows) * CELL_SIZE;
          this.renderer.drawBlock(x, y, CELL_SIZE, type);
        }
      }
    }
  }

  _drawGhost(piece, ghostRow) {
    const bufferRows = BOARD_ROWS - VISIBLE_ROWS;
    for (const [cr, cc] of piece.cells) {
      const row = ghostRow + cr;
      const col = piece.col + cc;
      if (row >= bufferRows) {
        const x = BOARD_X + col * CELL_SIZE;
        const y = BOARD_Y + (row - bufferRows) * CELL_SIZE;
        const ctx = this.ctx;
        ctx.fillStyle = GHOST_COLOR;
        ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, CELL_SIZE - 1, CELL_SIZE - 1);
      }
    }
  }

  _drawActivePiece(piece) {
    const bufferRows = BOARD_ROWS - VISIBLE_ROWS;
    for (const [cr, cc] of piece.cells) {
      const row = piece.row + cr;
      const col = piece.col + cc;
      if (row >= bufferRows) {
        const x = BOARD_X + col * CELL_SIZE;
        const y = BOARD_Y + (row - bufferRows) * CELL_SIZE;
        this.renderer.drawBlock(x, y, CELL_SIZE, piece.type);
      }
    }
  }
}
