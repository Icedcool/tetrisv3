Perfect! I'll create a comprehensive PRD based on your architectural choices. Given your preference for elegance and efficiency, I'll structure this around a clean separation between game logic, WebGL rendering, and UI.

---

# **Tetris - Product Requirements Document**

## **1. Product Overview**

### **1.1 Vision**
A modern, performant Tetris implementation deployed on Vercel, featuring WebGL-accelerated rendering and a clean, distraction-free gameplay experience. The game prioritizes smooth 60fps gameplay, elegant visual design, and desktop-optimized controls.

### **1.2 Success Metrics**
- 60fps consistent frame rate on modern browsers
- < 2 second initial load time
- < 100ms input latency
- Local high score persistence across sessions
- Zero runtime errors in production

### **1.3 Target Audience**
Desktop users seeking a quick, polished Tetris experience with no friction—no accounts, no ads, just instant play.

---

## **2. Technical Architecture**

### **2.1 Technology Stack**
- **Build Tool**: Vite (fast dev server, optimized production builds)
- **Language**: Vanilla JavaScript (ES6+)
- **Rendering**: WebGL 2.0 (with fallback to WebGL 1.0)
- **Styling**: CSS3 (for UI elements outside canvas)
- **Deployment**: Vercel (static site deployment)
- **Storage**: localStorage API (high scores)

### **2.2 Architecture Pattern**
```
┌─────────────────┐
│   Game Engine   │ ← Core logic, state, collision detection
└────────┬────────┘
         │
┌────────▼────────┐
│  WebGL Renderer │ ← Graphics rendering, animations
└────────┬────────┘
         │
┌────────▼────────┐
│   UI Controller │ ← DOM UI, input handling, HUD
└─────────────────┘
```

**Separation of Concerns:**
- **Game Engine**: Pure JavaScript class managing game state, tetromino logic, scoring, level progression
- **Renderer**: WebGL context managing shaders, vertex buffers, draw calls
- **UI Controller**: DOM manipulation for menus, scores, controls overlay

### **2.3 State Management**
Event-driven architecture using custom EventEmitter pattern:
- Game Engine emits events: `piece-moved`, `line-cleared`, `game-over`, `score-updated`
- Renderer subscribes to visual state changes
- UI Controller subscribes to HUD updates
- No external state management library needed

---

## **3. Game Mechanics**

### **3.1 Core Rules**
- **Standard Tetris Guidelines**: Official tetromino pieces (I, O, T, S, Z, J, L)
- **Board Size**: 10 columns × 20 rows (visible) + 2 rows buffer (spawn area)
- **Rotation System**: Super Rotation System (SRS) with wall kicks
- **Gravity**: Soft drop (down key), hard drop (space), auto-fall based on level
- **Line Clearing**: Standard 1-4 lines with scoring multipliers

### **3.2 Scoring System**
```
Single (1 line):  100 × level
Double (2 lines): 300 × level
Triple (3 lines): 500 × level
Tetris (4 lines): 800 × level
Soft Drop:        1 point per cell
Hard Drop:        2 points per cell
```

### **3.3 Level Progression**
- Start at Level 1
- Every 10 lines cleared → level up
- Gravity speed increases: `fall_delay = 1000ms - (level × 80ms)` (capped at 100ms)

---

## **4. User Interface**

### **4.1 Screen Layout**
```
┌─────────────────────────────────────┐
│           TETRIS                     │
├───────────┬─────────────┬───────────┤
│   HOLD    │             │   NEXT    │
│  [piece]  │             │  [piece]  │
│           │             │  [piece]  │
│           │             │  [piece]  │
│  SCORE    │   GAME      │           │
│  000000   │   BOARD     │  LEVEL    │
│           │  (10×20)    │    1      │
│  LINES    │             │           │
│   000     │             │  CONTROLS │
│           │             │   [info]  │
└───────────┴─────────────┴───────────┘
```

### **4.2 Visual Design Principles**
- **Clean & Sharp**: High-contrast colors, crisp edges via WebGL anti-aliasing
- **Minimal Distractions**: No particle effects, subtle animations only
- **Monochromatic Base**: Dark background (#1a1a1a), white UI text
- **Vibrant Blocks**: Standard Tetris colors with slight glow effect

### **4.3 UI States**
1. **Main Menu**: Play button, high scores view, controls guide
2. **Active Game**: Full layout as shown above
3. **Paused**: Translucent overlay with "PAUSED" text
4. **Game Over**: Score display, high score comparison, restart/menu buttons

---

## **5. Controls**

### **5.1 Keyboard Mapping**
| Key | Action |
|-----|--------|
| ← / A | Move left |
| → / D | Move right |
| ↓ / S | Soft drop (faster fall) |
| SPACE | Hard drop (instant) |
| ↑ / W / X | Rotate clockwise |
| Z / CTRL | Rotate counter-clockwise |
| C | Hold piece |
| P / ESC | Pause/Resume |
| R | Restart (game over only) |

### **5.2 Input Handling**
- **Key Repeat**: Left/right movement with DAS (Delayed Auto Shift): 170ms delay, 50ms repeat
- **Soft Drop**: Continuous while held
- **Rotation**: Single press per keydown (no repeat)
- **Input Buffer**: 100ms buffer for inputs during lock delay

---

## **6. WebGL Rendering**

### **6.1 Rendering Strategy**
- **Instanced Rendering**: Single draw call for all blocks using instancing
- **Shader-based Coloring**: Pass color data as uniforms/attributes
- **Orthographic Projection**: 2D game doesn't need perspective
- **Frame Budget**: Target 16.67ms per frame (60fps)

### **6.2 Visual Effects**
- **Block Appearance**: Solid color with subtle gradient and border
- **Ghost Piece**: Semi-transparent preview of hard drop position (opacity: 0.3)
- **Line Clear Animation**: 200ms flash before disappearing
- **Smooth Movement**: Interpolated position updates for fluid visuals

### **6.3 Shader Architecture**
```glsl
// Vertex Shader
- Transform block positions to screen space
- Pass through color attributes

// Fragment Shader
- Apply color with gradient
- Add border via distance function
- Handle transparency for ghost piece
```

---

## **7. Game Engine Details**

### **7.1 Core Classes**
```javascript
class TetrisGame {
  - board: Board
  - currentPiece: Tetromino
  - nextQueue: Tetromino[] (preview 3 pieces)
  - heldPiece: Tetromino | null
  - score: number
  - level: number
  - lines: number
  - gameState: 'menu' | 'playing' | 'paused' | 'gameOver'
  
  Methods:
  - update(deltaTime)
  - handleInput(keyEvent)
  - checkCollision()
  - lockPiece()
  - clearLines()
  - calculateScore()
}

class Tetromino {
  - shape: number[][] (4×4 matrix)
  - color: RGB
  - position: {x, y}
  - rotation: 0-3
  
  Methods:
  - rotate(direction)
  - getKickTable() (for SRS)
  - project() (for ghost piece)
}

class Board {
  - grid: number[][] (10×22)
  - lockedBlocks: Map<position, color>
  
  Methods:
  - isValidPosition(tetromino)
  - placePiece(tetromino)
  - getFullRows()
  - clearRows(rowIndices)
}
```

### **7.2 Game Loop**
```javascript
function gameLoop(timestamp) {
  const deltaTime = timestamp - lastTimestamp;
  
  // Update game state
  game.update(deltaTime);
  
  // Render via WebGL
  renderer.render(game.getState());
  
  // Update UI
  uiController.update(game.getStats());
  
  requestAnimationFrame(gameLoop);
}
```

---

## **8. Data Persistence**

### **8.1 Local Storage Schema**
```javascript
localStorage.setItem('tetris-high-scores', JSON.stringify([
  { score: 50000, lines: 123, level: 13, date: '2024-02-04' },
  { score: 45000, lines: 110, level: 12, date: '2024-02-03' },
  // ... top 10 scores
]));

localStorage.setItem('tetris-settings', JSON.stringify({
  volume: 0.7,
  keyBindings: { /* custom mappings */ }
}));
```

### **8.2 High Score Features**
- Store top 10 scores
- Display: rank, score, lines cleared, level reached, date
- Auto-sort by score (descending)
- Clear all scores button (with confirmation)

---

## **9. Performance Optimization**

### **9.1 WebGL Optimizations**
- **Geometry Caching**: Pre-compute block vertex data
- **Texture Atlasing**: Single texture for all block types (if using textures)
- **Culling**: Only render visible board area
- **Batch Rendering**: Group identical block colors in single draw call

### **9.2 JavaScript Optimizations**
- **Object Pooling**: Reuse Tetromino objects instead of creating new ones
- **RAF Throttling**: Use requestAnimationFrame for optimal timing
- **Event Delegation**: Single keydown listener, not per-element
- **Lazy Initialization**: Load shaders and buffers once on init

### **9.3 Build Optimizations**
- Vite tree-shaking to remove unused code
- Minification and compression
- Inline critical CSS
- Preload WebGL context and shaders

---

## **10. Error Handling & Fallbacks**

### **10.1 WebGL Fallback**
```javascript
if (!gl) {
  // Display error message
  showError('WebGL not supported. Please use a modern browser.');
  // Offer Canvas 2D fallback? (optional)
}
```

### **10.2 localStorage Fallback**
- Detect localStorage availability
- Use in-memory storage if unavailable (scores lost on refresh)
- Show warning banner: "High scores won't be saved"

### **10.3 Error States**
- Shader compilation errors → log to console, show user-friendly message
- Invalid game states → reset to main menu
- Storage quota exceeded → delete oldest scores

---

## **11. Deployment Configuration**

### **11.1 Vercel Setup**
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

### **11.2 Build Script**
```json
// package.json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### **11.3 Asset Optimization**
- Compress shaders (remove comments, whitespace)
- Inline small assets (< 10KB)
- Use Vercel's automatic compression

---

## **12. Development Roadmap**

### **Phase 1: Core Game (Week 1)**
- [ ] Project setup (Vite + Vercel)
- [ ] WebGL renderer initialization
- [ ] Tetromino class and rotation logic
- [ ] Board collision detection
- [ ] Basic game loop

### **Phase 2: Gameplay Mechanics (Week 1)**
- [ ] Piece spawning and queue system
- [ ] Line clearing logic
- [ ] Scoring and level progression
- [ ] Hold piece functionality
- [ ] Ghost piece rendering

### **Phase 3: UI & Polish (Week 2)**
- [ ] Main menu and game over screens
- [ ] HUD (score, level, next pieces)
- [ ] Pause functionality
- [ ] Keyboard controls and input handling
- [ ] Visual effects (line clear animation)

### **Phase 4: Persistence & Testing (Week 2)**
- [ ] localStorage integration
- [ ] High scores table
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Performance profiling
- [ ] Bug fixes and refinements

### **Phase 5: Deployment**
- [ ] Production build optimization
- [ ] Vercel deployment
- [ ] Domain configuration (optional)
- [ ] Analytics integration (optional)

---

## **13. Future Enhancements (Post-MVP)**

### **Optional Features**
- Marathon mode (endless)
- Sprint mode (40 lines race)
- Custom key bindings UI
- Sound effects and background music
- Theme customization (color schemes)
- Touch controls for mobile
- Multiplayer mode (requires backend)

---

## **14. Open Questions**

1. **Visual Style**: Minimalist flat colors or gradient/glow effects on blocks?
2. **Sound**: Include audio or keep it silent by default?
3. **Analytics**: Track gameplay stats (sessions, average score)?
4. **Domain**: Custom domain or use Vercel subdomain?

---

**Document Version**: 1.0  
**Last Updated**: February 4, 2026  
**Status**: Ready for Implementation