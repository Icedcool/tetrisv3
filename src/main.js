import { DT_CAP } from './constants.js';
import GameEngine from './engine/GameEngine.js';
import InputManager from './engine/InputManager.js';
import TouchController from './engine/TouchController.js';
import Renderer from './renderer/Renderer.js';
import BoardRenderer from './renderer/BoardRenderer.js';
import PanelRenderer from './renderer/PanelRenderer.js';
import AnimationManager from './renderer/AnimationManager.js';
import MenuRenderer from './renderer/MenuRenderer.js';
import UIController from './ui/UIController.js';
import HighScoreManager from './ui/HighScoreManager.js';

// --- Touch detection ---
const isTouchDevice = 'ontouchstart' in window;

// --- Setup ---
const canvas = document.getElementById('game-canvas');
const overlay = document.getElementById('overlay-container');
const gameContainer = document.getElementById('game-container');
const touchBar = document.getElementById('touch-controls');

const engine = new GameEngine();
const input = new InputManager();
const renderer = new Renderer(canvas);
const boardRenderer = new BoardRenderer(renderer);
const panelRenderer = new PanelRenderer(renderer, isTouchDevice);
const animationManager = new AnimationManager();
const menuRenderer = new MenuRenderer(renderer);
const highScores = new HighScoreManager();
const ui = new UIController(overlay, engine, highScores, isTouchDevice);

// --- Touch controller (mobile only) ---
let touch = null;
if (isTouchDevice) {
  touchBar.classList.remove('touch-controls--hidden');
  touch = new TouchController();
  touch.bind(touchBar);
  touch.on('action', (action) => {
    switch (action) {
      case 'left':      engine.moveLeft(); break;
      case 'right':     engine.moveRight(); break;
      case 'softDrop':  engine.softDrop(); break;
      case 'hardDrop':  engine.hardDrop(); break;
      case 'rotateCW':  engine.rotateCW(); break;
      case 'rotateCCW': engine.rotateCCW(); break;
      case 'hold':      engine.holdPiece(); break;
      case 'pause':     engine.togglePause(); break;
    }
  });
}

// --- Input → Engine ---
input.on('action', (action) => {
  switch (action) {
    case 'left':      engine.moveLeft(); break;
    case 'right':     engine.moveRight(); break;
    case 'softDrop':  engine.softDrop(); break;
    case 'hardDrop':  engine.hardDrop(); break;
    case 'rotateCW':  engine.rotateCW(); break;
    case 'rotateCCW': engine.rotateCCW(); break;
    case 'hold':      engine.holdPiece(); break;
    case 'pause':     engine.togglePause(); break;
  }
});

// --- UI callbacks ---
ui.onPlay = () => {
  engine.startGame();
};

ui.onResume = () => {
  engine.resume();
};

ui.onReturnToMenu = () => {
  engine.returnToMenu();
};

// --- High score on game over ---
engine.on('game-over', (data) => {
  highScores.addScore({
    score: data.score,
    lines: data.lines,
    level: data.level,
    date: new Date().toISOString(),
  });
});

// --- Line clear animation ---
engine.on('lines-clearing', (rows) => {
  animationManager.startLineClear(rows);
});

engine.on('lines-cleared', () => {
  animationManager.clear();
});

// --- Responsive scaling ---
const CANVAS_W = 660;
const CANVAS_H = 700;
const TOUCH_BAR_H = isTouchDevice ? 110 : 0;

function applyScaling() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const totalH = CANVAS_H + TOUCH_BAR_H;
  const scale = Math.min(vw / CANVAS_W, vh / totalH, 1);

  if (scale < 1) {
    gameContainer.style.transform = `scale(${scale})`;
    gameContainer.style.marginBottom = `${-(totalH - totalH * scale)}px`;
  } else {
    gameContainer.style.transform = '';
    gameContainer.style.marginBottom = '';
  }
}

applyScaling();
window.addEventListener('resize', applyScaling);

// --- Game Loop ---
let lastTime = 0;
let menuRafId = null;
let gameRafId = null;

function menuLoop(time) {
  const dt = Math.min(time - (lastTime || time), DT_CAP);
  lastTime = time;

  renderer.clear();
  menuRenderer.update(dt);
  menuRenderer.draw();

  menuRafId = requestAnimationFrame(menuLoop);
}

function gameLoop(time) {
  const dt = Math.min(time - (lastTime || time), DT_CAP);
  lastTime = time;

  input.update(dt);
  if (touch) touch.update(dt);
  engine.update(dt);

  const state = engine.getState();
  renderer.clear();
  boardRenderer.draw(state);
  panelRenderer.draw(state);
  animationManager.draw(renderer, state);

  gameRafId = requestAnimationFrame(gameLoop);
}

function stopMenuLoop() {
  if (menuRafId) {
    cancelAnimationFrame(menuRafId);
    menuRafId = null;
  }
}

function stopGameLoop() {
  if (gameRafId) {
    cancelAnimationFrame(gameRafId);
    gameRafId = null;
  }
}

// --- State transitions ---
engine.on('state-changed', (state) => {
  if (state === 'playing') {
    stopMenuLoop();
    input.enable();
    lastTime = 0;
    if (!gameRafId) gameRafId = requestAnimationFrame(gameLoop);
  } else if (state === 'paused') {
    input.disable();
  } else if (state === 'menu') {
    stopGameLoop();
    input.disable();
    lastTime = 0;
    if (!menuRafId) menuRafId = requestAnimationFrame(menuLoop);
  } else if (state === 'gameOver') {
    // Keep game loop running to show final state
    input.disable();
  }
});

// --- Start on menu ---
lastTime = 0;
menuRafId = requestAnimationFrame(menuLoop);
ui.showMenu();
