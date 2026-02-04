import EventEmitter from './EventEmitter.js';
import Board from './Board.js';
import Tetromino from './Tetromino.js';
import BagRandomizer from './BagRandomizer.js';
import {
  PIECE_SHAPES, KICK_TABLE_JLSTZ, KICK_TABLE_I,
  GRAVITY_TABLE, SCORE_TABLE, SOFT_DROP_SCORE, HARD_DROP_SCORE,
  LOCK_DELAY, MAX_LOCK_RESETS, LINE_CLEAR_DURATION,
  LINES_PER_LEVEL, NEXT_QUEUE_SIZE, SPAWN_ROW, SPAWN_COL,
} from '../constants.js';

export default class GameEngine extends EventEmitter {
  constructor() {
    super();
    this.board = new Board();
    this.bag = new BagRandomizer();
    this._resetState();
  }

  _resetState() {
    this.state = 'menu'; // menu | playing | paused | gameOver
    this.piece = null;
    this.holdType = null;
    this.holdUsed = false;
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.nextQueue = [];
    this.gravityTimer = 0;
    this.lockTimer = 0;
    this.lockResets = 0;
    this.isLocking = false;
    this.clearingRows = null;
    this.clearTimer = 0;
  }

  startGame() {
    this.board.reset();
    this.bag.reset();
    this._resetState();
    this.state = 'playing';
    this._fillNextQueue();
    this._spawnPiece();
    this.emit('state-changed', this.state);
    this.emit('game-started');
  }

  pause() {
    if (this.state === 'playing') {
      this.state = 'paused';
      this.emit('state-changed', this.state);
    }
  }

  resume() {
    if (this.state === 'paused') {
      this.state = 'playing';
      this.emit('state-changed', this.state);
    }
  }

  togglePause() {
    if (this.state === 'playing') this.pause();
    else if (this.state === 'paused') this.resume();
  }

  returnToMenu() {
    this._resetState();
    this.board.reset();
    this.emit('state-changed', this.state);
  }

  update(dt) {
    if (this.state !== 'playing') return;

    // Line clear animation in progress
    if (this.clearingRows) {
      this.clearTimer += dt;
      if (this.clearTimer >= LINE_CLEAR_DURATION) {
        this._finishLineClear();
      }
      return;
    }

    if (!this.piece) return;

    // Gravity — loop for high-speed levels where multiple drops occur per frame
    const gravityInterval = this._getGravityInterval();
    this.gravityTimer += dt;
    while (this.gravityTimer >= gravityInterval && this.piece && !this.isLocking) {
      this.gravityTimer -= gravityInterval;
      this._applyGravity();
    }

    // Lock delay
    if (this.isLocking) {
      this.lockTimer += dt;
      if (this.lockTimer >= LOCK_DELAY) {
        this._lockPiece();
      }
    }
  }

  // --- Player Actions ---

  moveLeft() {
    if (this.state !== 'playing' || !this.piece || this.clearingRows) return false;
    if (this.board.isValidPosition(this.piece, 0, -1)) {
      this.piece.col--;
      this._onSuccessfulMove();
      return true;
    }
    return false;
  }

  moveRight() {
    if (this.state !== 'playing' || !this.piece || this.clearingRows) return false;
    if (this.board.isValidPosition(this.piece, 0, 1)) {
      this.piece.col++;
      this._onSuccessfulMove();
      return true;
    }
    return false;
  }

  softDrop() {
    if (this.state !== 'playing' || !this.piece || this.clearingRows) return false;
    if (this.board.isValidPosition(this.piece, 1, 0)) {
      this.piece.row++;
      this.score += SOFT_DROP_SCORE;
      this.gravityTimer = 0;
      this._onSuccessfulMove();
      this.emit('score-updated', this.score);
      return true;
    }
    return false;
  }

  hardDrop() {
    if (this.state !== 'playing' || !this.piece || this.clearingRows) return false;
    let distance = 0;
    while (this.board.isValidPosition(this.piece, distance + 1, 0)) {
      distance++;
    }
    this.piece.row += distance;
    this.score += distance * HARD_DROP_SCORE;
    this.emit('score-updated', this.score);
    this._lockPiece();
    return true;
  }

  rotateCW() {
    return this._rotate(1);
  }

  rotateCCW() {
    return this._rotate(-1);
  }

  holdPiece() {
    if (this.state !== 'playing' || !this.piece || this.holdUsed || this.clearingRows) return false;

    const currentType = this.piece.type;
    if (this.holdType) {
      // Swap with held piece
      this.piece = new Tetromino(this.holdType);
      // Try spawn position, then one row up
      if (!this.board.isValidPosition(this.piece)) {
        this.piece.row--;
        if (!this.board.isValidPosition(this.piece)) {
          this.piece = new Tetromino(currentType);
          return false;
        }
      }
    } else {
      // No held piece — pull from next queue directly
      this._fillNextQueue();
      const type = this.nextQueue.shift();
      this.nextQueue.push(this.bag.next());
      this.piece = new Tetromino(type);
      if (!this.board.isValidPosition(this.piece)) {
        this.piece.row--;
        if (!this.board.isValidPosition(this.piece)) {
          this._gameOver();
          return false;
        }
      }
      this.emit('next-updated', this.nextQueue.slice());
    }
    this.holdType = currentType;
    this.holdUsed = true;
    this.isLocking = false;
    this.lockTimer = 0;
    this.lockResets = 0;
    this.gravityTimer = 0;
    this.emit('hold-changed', this.holdType);
    return true;
  }

  // --- State Snapshot ---

  getState() {
    return {
      state: this.state,
      board: this.board.grid,
      piece: this.piece,
      ghostRow: this.piece ? this.board.getGhostRow(this.piece) : null,
      holdType: this.holdType,
      holdUsed: this.holdUsed,
      nextQueue: this.nextQueue.slice(),
      score: this.score,
      lines: this.lines,
      level: this.level,
      clearingRows: this.clearingRows,
      clearProgress: this.clearingRows ? this.clearTimer / LINE_CLEAR_DURATION : 0,
    };
  }

  // --- Internal ---

  _fillNextQueue() {
    while (this.nextQueue.length < NEXT_QUEUE_SIZE) {
      this.nextQueue.push(this.bag.next());
    }
  }

  _spawnPiece() {
    this._fillNextQueue();
    const type = this.nextQueue.shift();
    this.nextQueue.push(this.bag.next());
    this.piece = new Tetromino(type);
    this.isLocking = false;
    this.lockTimer = 0;
    this.lockResets = 0;
    this.gravityTimer = 0;
    this.holdUsed = false;

    // Check if spawn position is valid
    if (!this.board.isValidPosition(this.piece)) {
      // Try one row up
      this.piece.row--;
      if (!this.board.isValidPosition(this.piece)) {
        this._gameOver();
        return;
      }
    }
    this.emit('next-updated', this.nextQueue.slice());
  }

  _applyGravity() {
    if (this.board.isValidPosition(this.piece, 1, 0)) {
      this.piece.row++;
      this._checkLanding();
    } else {
      // Start lock delay if not already
      if (!this.isLocking) {
        this.isLocking = true;
        this.lockTimer = 0;
      }
    }
  }

  _checkLanding() {
    if (!this.board.isValidPosition(this.piece, 1, 0)) {
      if (!this.isLocking) {
        this.isLocking = true;
        this.lockTimer = 0;
      }
    } else {
      this.isLocking = false;
      this.lockTimer = 0;
    }
  }

  _onSuccessfulMove() {
    if (this.isLocking && this.lockResets < MAX_LOCK_RESETS) {
      this.lockTimer = 0;
      this.lockResets++;
    }
    this._checkLanding();
  }

  _rotate(direction) {
    if (this.state !== 'playing' || !this.piece || this.clearingRows) return false;
    if (this.piece.type === 'O') return false;

    const fromRot = this.piece.rotation;
    const toRot = (fromRot + direction + 4) % 4;
    const kickKey = `${fromRot}>${toRot}`;
    const kickTable = this.piece.type === 'I' ? KICK_TABLE_I : KICK_TABLE_JLSTZ;
    const kicks = kickTable[kickKey];

    if (!kicks) return false;

    const newCells = PIECE_SHAPES[this.piece.type][toRot];

    for (const [kr, kc] of kicks) {
      if (this.board.checkPosition(newCells, this.piece.row + kr, this.piece.col + kc)) {
        this.piece.rotation = toRot;
        this.piece.row += kr;
        this.piece.col += kc;
        this._onSuccessfulMove();
        return true;
      }
    }
    return false;
  }

  _lockPiece() {
    this.board.placePiece(this.piece);
    this.emit('piece-locked', this.piece);

    const fullRows = this.board.getFullRows();
    if (fullRows.length > 0) {
      this.clearingRows = fullRows;
      this.clearTimer = 0;
      this.piece = null;
      this.emit('lines-clearing', fullRows);
    } else {
      this.piece = null;
      this._spawnPiece();
    }
  }

  _finishLineClear() {
    const count = this.clearingRows.length;
    this.board.clearRows(this.clearingRows);
    this.clearingRows = null;
    this.clearTimer = 0;

    // Update score
    const lineScore = (SCORE_TABLE[count] || 0) * this.level;
    this.score += lineScore;
    this.lines += count;

    // Level up
    const newLevel = Math.floor(this.lines / LINES_PER_LEVEL) + 1;
    if (newLevel !== this.level) {
      this.level = newLevel;
    }

    this.emit('lines-cleared', count);
    this.emit('score-updated', this.score);

    this._spawnPiece();
  }

  _getGravityInterval() {
    const idx = Math.min(this.level - 1, GRAVITY_TABLE.length - 1);
    return GRAVITY_TABLE[idx];
  }

  _gameOver() {
    this.state = 'gameOver';
    this.piece = null;
    this.emit('game-over', { score: this.score, lines: this.lines, level: this.level });
    this.emit('state-changed', this.state);
  }
}
