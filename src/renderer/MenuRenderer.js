import {
  CANVAS_W, CANVAS_H, PIECE_TYPES, PIECE_SHAPES, COLORS,
} from '../constants.js';

const NUM_PIECES = 12;
const MIN_SPEED = 30;
const MAX_SPEED = 80;
const MIN_OPACITY = 0.1;
const MAX_OPACITY = 0.3;
const MIN_SIZE = 15;
const MAX_SIZE = 25;

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function createFallingPiece() {
  const type = PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];
  const rotation = Math.floor(Math.random() * 4);
  return {
    type,
    rotation,
    x: rand(0, CANVAS_W),
    y: rand(-200, -20),
    speed: rand(MIN_SPEED, MAX_SPEED),
    opacity: rand(MIN_OPACITY, MAX_OPACITY),
    cellSize: rand(MIN_SIZE, MAX_SIZE),
  };
}

export default class MenuRenderer {
  constructor(renderer) {
    this.renderer = renderer;
    this.ctx = renderer.ctx;
    this._pieces = [];
    for (let i = 0; i < NUM_PIECES; i++) {
      const p = createFallingPiece();
      p.y = rand(-200, CANVAS_H); // spread across screen initially
      this._pieces.push(p);
    }
  }

  update(dt) {
    const dtSec = dt / 1000;
    for (const p of this._pieces) {
      p.y += p.speed * dtSec;
      if (p.y > CANVAS_H + 100) {
        Object.assign(p, createFallingPiece());
      }
    }
  }

  draw() {
    for (const p of this._pieces) {
      const cells = PIECE_SHAPES[p.type][p.rotation];
      const color = COLORS[p.type];
      const ctx = this.ctx;

      ctx.globalAlpha = p.opacity;
      for (const [r, c] of cells) {
        const x = p.x + c * p.cellSize;
        const y = p.y + r * p.cellSize;
        ctx.fillStyle = color;
        ctx.fillRect(x, y, p.cellSize, p.cellSize);
        // subtle border
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, p.cellSize - 1, p.cellSize - 1);
      }
    }
    this.ctx.globalAlpha = 1;
  }
}
