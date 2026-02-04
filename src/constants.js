// Board dimensions
export const BOARD_COLS = 10;
export const BOARD_ROWS = 22; // 2 buffer rows at top
export const VISIBLE_ROWS = 20;
export const CELL_SIZE = 30;

// Canvas layout
export const CANVAS_W = 660;
export const CANVAS_H = 700;
export const BOARD_X = 180;
export const BOARD_Y = 60;
export const BOARD_W = BOARD_COLS * CELL_SIZE; // 300
export const BOARD_H = VISIBLE_ROWS * CELL_SIZE; // 600

// Left panel (0–150), right panel (510–660)
export const LEFT_PANEL_X = 0;
export const LEFT_PANEL_W = 150;
export const RIGHT_PANEL_X = 510;
export const RIGHT_PANEL_W = 150;

// Colors — dark blue theme
export const BG_COLOR = '#0a0a2e';
export const BOARD_BG = '#111133';
export const BORDER_COLOR = '#3333aa';
export const TEXT_COLOR = '#ffffff';
export const TEXT_DIM = '#8888bb';
export const GHOST_COLOR = 'rgba(255, 255, 255, 0.15)';

// Piece colors (flat + subtle borders handled by renderer)
export const COLORS = {
  I: '#00f0f0',
  O: '#f0f000',
  T: '#a000f0',
  S: '#00f000',
  Z: '#f00000',
  J: '#0000f0',
  L: '#f0a000',
};

// Timing
export const DAS_DELAY = 170;  // ms before auto-repeat starts
export const ARR_DELAY = 50;   // ms between auto-repeat moves
export const SOFT_DROP_DELAY = 50; // ms per cell when soft-dropping
export const LOCK_DELAY = 500; // ms
export const MAX_LOCK_RESETS = 15;
export const LINE_CLEAR_DURATION = 200; // ms
export const DT_CAP = 50; // ms max delta time

// Gravity — frames per cell drop at 60fps, converted to ms
// Level 1 = ~1s, increases with level
export const GRAVITY_TABLE = [
  1000, 793, 618, 473, 355, 262, 190, 135, 94, 64,
  43, 28, 18, 11, 7, 4, 3, 2, 1, 1
];

// Scoring (guideline)
export const SCORE_TABLE = {
  1: 100,
  2: 300,
  3: 500,
  4: 800,
};
export const SOFT_DROP_SCORE = 1;  // per cell
export const HARD_DROP_SCORE = 2;  // per cell

// Lines per level
export const LINES_PER_LEVEL = 10;

// Piece types
export const PIECE_TYPES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

// Piece shapes — 4 rotation states, each is array of [row, col] offsets
// Rotation 0 = spawn state
export const PIECE_SHAPES = {
  I: [
    [[1,0],[1,1],[1,2],[1,3]],
    [[0,2],[1,2],[2,2],[3,2]],
    [[2,0],[2,1],[2,2],[2,3]],
    [[0,1],[1,1],[2,1],[3,1]],
  ],
  O: [
    [[0,1],[0,2],[1,1],[1,2]],
    [[0,1],[0,2],[1,1],[1,2]],
    [[0,1],[0,2],[1,1],[1,2]],
    [[0,1],[0,2],[1,1],[1,2]],
  ],
  T: [
    [[0,1],[1,0],[1,1],[1,2]],
    [[0,1],[1,1],[1,2],[2,1]],
    [[1,0],[1,1],[1,2],[2,1]],
    [[0,1],[1,0],[1,1],[2,1]],
  ],
  S: [
    [[0,1],[0,2],[1,0],[1,1]],
    [[0,1],[1,1],[1,2],[2,2]],
    [[1,1],[1,2],[2,0],[2,1]],
    [[0,0],[1,0],[1,1],[2,1]],
  ],
  Z: [
    [[0,0],[0,1],[1,1],[1,2]],
    [[0,2],[1,1],[1,2],[2,1]],
    [[1,0],[1,1],[2,1],[2,2]],
    [[0,1],[1,0],[1,1],[2,0]],
  ],
  J: [
    [[0,0],[1,0],[1,1],[1,2]],
    [[0,1],[0,2],[1,1],[2,1]],
    [[1,0],[1,1],[1,2],[2,2]],
    [[0,1],[1,1],[2,0],[2,1]],
  ],
  L: [
    [[0,2],[1,0],[1,1],[1,2]],
    [[0,1],[1,1],[2,1],[2,2]],
    [[1,0],[1,1],[1,2],[2,0]],
    [[0,0],[0,1],[1,1],[2,1]],
  ],
};

// SRS wall kick data
// Offsets to try (in order) for each rotation transition
// Format: KICK_TABLE[from_rotation][to_rotation] = [[row_offset, col_offset], ...]
// Standard JLSTZ kicks
export const KICK_TABLE_JLSTZ = {
  '0>1': [[0,0],[0,-1],[-1,-1],[2,0],[2,-1]],
  '1>0': [[0,0],[0,1],[1,1],[-2,0],[-2,1]],
  '1>2': [[0,0],[0,1],[1,1],[-2,0],[-2,1]],
  '2>1': [[0,0],[0,-1],[-1,-1],[2,0],[2,-1]],
  '2>3': [[0,0],[0,1],[-1,1],[2,0],[2,1]],
  '3>2': [[0,0],[0,-1],[1,-1],[-2,0],[-2,-1]],
  '3>0': [[0,0],[0,-1],[1,-1],[-2,0],[-2,-1]],
  '0>3': [[0,0],[0,1],[-1,1],[2,0],[2,1]],
};

// I-piece kicks (different table)
export const KICK_TABLE_I = {
  '0>1': [[0,0],[0,-2],[0,1],[-1,-2],[2,1]],
  '1>0': [[0,0],[0,2],[0,-1],[1,2],[-2,-1]],
  '1>2': [[0,0],[0,-1],[0,2],[2,-1],[-1,2]],
  '2>1': [[0,0],[0,1],[0,-2],[-2,1],[1,-2]],
  '2>3': [[0,0],[0,2],[0,-1],[1,2],[-2,-1]],
  '3>2': [[0,0],[0,-2],[0,1],[-1,-2],[2,1]],
  '3>0': [[0,0],[0,1],[0,-2],[-2,1],[1,-2]],
  '0>3': [[0,0],[0,-1],[0,2],[2,-1],[-1,2]],
};

// Spawn position
export const SPAWN_ROW = 0;
export const SPAWN_COL = 3;

// Next queue size
export const NEXT_QUEUE_SIZE = 3;

// Preview cell size
export const PREVIEW_CELL_SIZE = 20;
