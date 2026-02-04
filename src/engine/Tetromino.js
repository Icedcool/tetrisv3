import { PIECE_SHAPES, SPAWN_ROW, SPAWN_COL } from '../constants.js';

export default class Tetromino {
  constructor(type) {
    this.type = type;
    this.rotation = 0;
    this.row = SPAWN_ROW;
    this.col = SPAWN_COL;
  }

  get cells() {
    return PIECE_SHAPES[this.type][this.rotation];
  }

  clone() {
    const t = new Tetromino(this.type);
    t.rotation = this.rotation;
    t.row = this.row;
    t.col = this.col;
    return t;
  }

  absoluteCells() {
    return this.cells.map(([r, c]) => [this.row + r, this.col + c]);
  }
}
