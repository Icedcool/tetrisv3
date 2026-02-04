import { BOARD_ROWS, BOARD_COLS } from '../constants.js';

export default class Board {
  constructor() {
    this.grid = this._createGrid();
  }

  _createGrid() {
    return Array.from({ length: BOARD_ROWS }, () => Array(BOARD_COLS).fill(null));
  }

  reset() {
    this.grid = this._createGrid();
  }

  isValidPosition(piece, rowOffset = 0, colOffset = 0) {
    const r = piece.row + rowOffset;
    const c = piece.col + colOffset;
    for (const [cr, cc] of piece.cells) {
      const row = r + cr;
      const col = c + cc;
      if (row < 0 || row >= BOARD_ROWS || col < 0 || col >= BOARD_COLS) return false;
      if (this.grid[row][col] !== null) return false;
    }
    return true;
  }

  checkPosition(cells, row, col) {
    for (const [cr, cc] of cells) {
      const r = row + cr;
      const c = col + cc;
      if (r < 0 || r >= BOARD_ROWS || c < 0 || c >= BOARD_COLS) return false;
      if (this.grid[r][c] !== null) return false;
    }
    return true;
  }

  placePiece(piece) {
    for (const [cr, cc] of piece.cells) {
      const row = piece.row + cr;
      const col = piece.col + cc;
      if (row >= 0 && row < BOARD_ROWS && col >= 0 && col < BOARD_COLS) {
        this.grid[row][col] = piece.type;
      }
    }
  }

  getFullRows() {
    const full = [];
    for (let r = 0; r < BOARD_ROWS; r++) {
      if (this.grid[r].every(cell => cell !== null)) {
        full.push(r);
      }
    }
    return full;
  }

  clearRows(rows) {
    const sorted = [...rows].sort((a, b) => b - a);
    for (const r of sorted) {
      this.grid.splice(r, 1);
    }
    while (this.grid.length < BOARD_ROWS) {
      this.grid.unshift(Array(BOARD_COLS).fill(null));
    }
  }

  getGhostRow(piece) {
    let offset = 0;
    while (this.isValidPosition(piece, offset + 1, 0)) {
      offset++;
    }
    return piece.row + offset;
  }
}
