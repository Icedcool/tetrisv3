import MenuScreen from './screens/MenuScreen.js';
import PauseScreen from './screens/PauseScreen.js';
import GameOverScreen from './screens/GameOverScreen.js';

export default class UIController {
  constructor(container, engine, highScores) {
    this._container = container;
    this._engine = engine;
    this._highScores = highScores;

    this.menu = new MenuScreen(container, highScores);
    this.pause = new PauseScreen(container);
    this.gameOver = new GameOverScreen(container, highScores);

    // Callbacks set by main.js
    this.onPlay = null;
    this.onResume = null;
    this.onReturnToMenu = null;

    this._wireScreenCallbacks();
    this._wireEngineEvents();
  }

  _wireScreenCallbacks() {
    this.menu.onPlay = () => {
      this.menu.hide();
      if (this.onPlay) this.onPlay();
    };

    this.pause.onResume = () => {
      this.pause.hide();
      if (this.onResume) this.onResume();
    };

    this.pause.onMenu = () => {
      this.pause.hide();
      if (this.onReturnToMenu) this.onReturnToMenu();
    };

    this.gameOver.onRestart = () => {
      this.gameOver.hide();
      if (this.onPlay) this.onPlay();
    };

    this.gameOver.onMenu = () => {
      this.gameOver.hide();
      if (this.onReturnToMenu) this.onReturnToMenu();
    };
  }

  _wireEngineEvents() {
    this._engine.on('state-changed', (state) => {
      this._hideAll();
      switch (state) {
        case 'menu':
          this.menu.show();
          break;
        case 'paused':
          this.pause.show();
          break;
      }
    });

    this._engine.on('game-over', (data) => {
      // Small delay so final state renders
      setTimeout(() => {
        this.gameOver.show(data);
      }, 300);
    });
  }

  _hideAll() {
    this.menu.hide();
    this.pause.hide();
    this.gameOver.hide();
  }

  showMenu() {
    this._hideAll();
    this.menu.show();
  }
}
