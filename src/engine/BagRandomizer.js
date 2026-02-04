import { PIECE_TYPES } from '../constants.js';

export default class BagRandomizer {
  constructor() {
    this._bag = [];
  }

  next() {
    if (this._bag.length === 0) {
      this._refill();
    }
    return this._bag.pop();
  }

  peek(count) {
    while (this._bag.length < count) {
      this._refill();
    }
    // bag is drawn from end, so peek from end
    const result = [];
    for (let i = this._bag.length - 1; i >= 0 && result.length < count; i--) {
      result.push(this._bag[i]);
    }
    return result;
  }

  reset() {
    this._bag = [];
  }

  _refill() {
    const pieces = [...PIECE_TYPES];
    // Fisher-Yates shuffle
    for (let i = pieces.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
    }
    // Prepend so we pop from end
    this._bag = pieces.concat(this._bag);
  }
}
