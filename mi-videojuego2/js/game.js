/**
 * CodeBot: Cyber Quest - Main Game Controller
 * Manages level state, robot simulation, UI interactions, modals,
 * code editor synchronization, and progress persistence.
 */

class GameApp {
  constructor() {
    this.currentLevelIndex = 0;
    this.levelData = null;
    this.robot = { x: 0, y: 0, dir: 'E' };
    this.initialRobot = { x: 0, y: 0, dir: 'E' };
    this.gems = [];
    this.collectedGemsCount = 0;
    this.totalGemsCount = 0;

    // Player saved progress in localStorage
    this.playerData = this.loadPlayerData();

    // DOM Elements
    this.canvas = document.getElementById('game-canvas');
    this.renderer = new WorldRenderer(this.canvas);
    this.editor = document.getElementById('code-editor');
    this.gutter = document.getElementById('code-gutter');
    this.backdrop = document.getElementById('syntax-backdrop');
    this.terminal = document.getElementById('terminal-output');

    // UI Buttons & HUD
    this.btnRun = document.getElementById('btn-run');
    this.btnStep = document.getElementById('btn-step');
    this.btnStop = document.getElementById('btn-stop');
    this.btnSound = document.getElementById('btn-sound-toggle');
    this.soundIcon = document.getElementById('sound-icon');
    this.hudLevelNumber = document.getElementById('hud-level-number');
    this.hudLevelTitle = document.getElementById('hud-level-title');
    this.hudGemsCount = document.getElementById('hud-gems-count');
    this.hudLinesCount = document.getElementById('hud-lines-count');
    this.hudStars = document.getElementById('hud-stars');
    this.viewportStatus = document.getElementById('viewport-status-text');

    // Modals
    this.modalLevels = document.getElementById('modal-levels');
    this.modalCodex = document.getElementById('modal-codex');
    this.modalVictory = document.getElementById('modal-victory');
    this.missionsGrid = document.getElementById('missions-grid-container');
    this.tutorBubble = document.getElementById('tutor-bubble');
    this.tutorText = document.getElementById('tutor-text');
    this.paletteContainer = document.getElementById('palette-chips-container');

    this.bindEvents();
    this.initInterpreter();

    // Load initial level
    const savedLevel = this.playerData.lastLevel || 1;
    this.loadLevel(savedLevel);

    // Initial resize listener
    window.addEventListener('resize', () => {
      this.renderer.calculateLayout();
    });
  }

  // --- Persistence ---
  loadPlayerData() {
    const raw = localStorage.getItem('codebot_player_data');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {}
    }
    return {
      unlockedLevels: [1],
      levelStars: {},
      savedCode: {},
      lastLevel: 1
    };
  }

  savePlayerData() {
    localStorage.setItem('codebot_player_data', JSON.stringify(this.playerData));
  }

  // --- Level Management ---
  loadLevel(levelId) {
    const idx = LEVELS_DATA.findIndex(l => l.id === levelId);
    if (idx === -1) return;

    this.currentLevelIndex = idx;
    this.levelData = JSON.parse(JSON.stringify(LEVELS_DATA[idx])); // Deep clone
    this.playerData.lastLevel = levelId;
    this.savePlayerData();

    // Reset robot state
    this.robot = { ...this.levelData.startPos };
    this.initialRobot = { ...this.levelData.startPos };

    // Reset collectibles
    this.gems = this.levelData.gems ? this.levelData.gems.map(g => ({ ...g, collected: false })) : [];
    this.totalGemsCount = this.gems.length;
    this.collectedGemsCount = 0;

    // Setup Renderer
    this.renderer.setLevel(this.levelData, this.robot);

    // Update HUD
    const formattedNum = String(this.levelData.id).padStart(2, '0');
    this.hudLevelNumber.textContent = `Nivel ${formattedNum}`;
    this.hudLevelTitle.textContent = this.levelData.title;
    this.updateHUDStats();

    // Update Tutor speech bubble
    this.tutorText.innerHTML = this.levelData.dialog;
    this.tutorBubble.style.display = 'flex';

    // Populate Command Chips Palette
    this.renderCommandPalette(this.levelData.allowedChips);

    // Load Code (either player's saved code for this level or default starter code)
    const savedCode = this.playerData.savedCode[this.levelData.id];
    this.editor.value = savedCode !== undefined ? savedCode : this.levelData.starterCode;
    this.syncEditorState();

    // Clear and reset Terminal
    this.clearTerminal();
    this.logTerminal(`> Misión cargada: ${this.levelData.title} (${this.levelData.tagline})`, 'info');
    this.logTerminal(`> ${this.levelData.tip}`, 'step');

    this.setStatus("SISTEMA ONLINE - LISTO");
    this.updateControlsState('ready');
  }

  resetCurrentLevel() {
    interpreter.stop();
    this.robot = { ...this.initialRobot };
    this.gems = this.levelData.gems ? this.levelData.gems.map(g => ({ ...g, collected: false })) : [];
    this.collectedGemsCount = 0;
    this.renderer.syncBot(this.robot, true);
    this.updateHUDStats();
    this.setStatus("NIVEL REINICIADO");
    this.updateControlsState('ready');
    this.highlightActiveLine(null);
  }

  // --- Environment API for Interpreter ---
  async executeAction(action) {
    if (action === 'avanzar') {
      const nextPos = this.calculateNextPos(this.robot.x, this.robot.y, this.robot.dir);

      // Check boundary limits
      if (
        nextPos.x < 0 || nextPos.x >= this.levelData.gridSize.cols ||
        nextPos.y < 0 || nextPos.y >= this.levelData.gridSize.rows
      ) {
        soundEngine.playError();
        return { success: false, message: `ByteBot chocó con el límite exterior de la matriz en (${nextPos.x}, ${nextPos.y}).` };
      }

      // Check obstacles
      const hitObstacle = this.levelData.obstacles && this.levelData.obstacles.some(o => o.x === nextPos.x && o.y === nextPos.y);
      if (hitObstacle) {
        soundEngine.playError();
        return { success: false, message: `ByteBot colisionó contra un muro en (${nextPos.x}, ${nextPos.y}).` };
      }

      // Move forward
      this.robot.x = nextPos.x;
      this.robot.y = nextPos.y;
      this.renderer.syncBot(this.robot);
      soundEngine.playMove();

      // Auto-collect or check for gem on this tile if already there
      return { success: true };
    }

    if (action === 'girarDerecha') {
      const dirs = ['N', 'E', 'S', 'W'];
      const curIdx = dirs.indexOf(this.robot.dir);
      this.robot.dir = dirs[(curIdx + 1) % 4];
      this.renderer.syncBot(this.robot);
      soundEngine.playTurn();
      return { success: true };
    }

    if (action === 'girarIzquierda') {
      const dirs = ['N', 'E', 'S', 'W'];
      const curIdx = dirs.indexOf(this.robot.dir);
      this.robot.dir = dirs[(curIdx + 3) % 4];
      this.renderer.syncBot(this.robot);
      soundEngine.playTurn();
      return { success: true };
    }

    if (action === 'recoger') {
      const gem = this.gems.find(g => g.x === this.robot.x && g.y === this.robot.y && !g.collected);
      if (gem) {
        gem.collected = true;
        this.collectedGemsCount++;
        this.renderer.spawnGemParticles(this.robot.x, this.robot.y);
        soundEngine.playCollect();
        this.updateHUDStats();
        return { success: true };
      } else {
        // Did not find gem on this tile
        return { success: true, warning: 'No había ningún cristal en esta casilla.' };
      }
    }

    return { success: false, message: `Comando desconocido: ${action}` };
  }

  calculateNextPos(x, y, dir) {
    switch (dir) {
      case 'E': return { x: x + 1, y: y };
      case 'S': return { x: x, y: y + 1 };
      case 'W': return { x: x - 1, y: y };
      case 'N': return { x: x, y: y - 1 };
      default: return { x, y };
    }
  }

  hasGem() {
    return this.gems.some(g => g.x === this.robot.x && g.y === this.robot.y && !g.collected);
  }

  hasObstacleAhead() {
    const nextPos = this.calculateNextPos(this.robot.x, this.robot.y, this.robot.dir);
    if (
      nextPos.x < 0 || nextPos.x >= this.levelData.gridSize.cols ||
      nextPos.y < 0 || nextPos.y >= this.levelData.gridSize.rows
    ) {
      return true;
    }
    return this.levelData.obstacles && this.levelData.obstacles.some(o => o.x === nextPos.x && o.y === nextPos.y);
  }

  isAtGoal() {
    return this.robot.x === this.levelData.goalPos.x && this.robot.y === this.levelData.goalPos.y;
  }

  hasCollectedAllGems() {
    return this.collectedGemsCount >= this.totalGemsCount;
  }

  // --- Interpreter Integration ---
  initInterpreter() {
    interpreter.onLineChange = (lineNum) => {
      this.highlightActiveLine(lineNum);
    };

    interpreter.onLog = (msg) => {
      this.logTerminal(msg, 'step');
    };

    interpreter.onError = (errText, lineNum) => {
      this.logTerminal(`✗ ${errText}`, 'error');
      this.setStatus("ERROR DE EJECUCIÓN");
      if (lineNum) this.highlightErrorLine(lineNum);
    };

    interpreter.onFinish = (success, message) => {
      this.updateControlsState('ready');
      this.highlightActiveLine(null);

      if (success) {
        // Check win criteria: at goal and all gems collected
        if (this.isAtGoal() && this.hasCollectedAllGems()) {
          this.handleVictory();
        } else if (!this.hasCollectedAllGems()) {
          this.logTerminal("! Llegaste al portal, pero olvidaste recoger todos los cristales de datos.", 'warn');
          this.setStatus("FALTAN CRISTALES");
        } else {
          this.logTerminal("! El código terminó, pero ByteBot no alcanzó el portal cuántico.", 'warn');
          this.setStatus("OBJETIVO INCOMPLETO");
        }
      }
    };
  }

  async runCode(mode = 'run') {
    soundEngine.init();
    soundEngine.startAmbientMusic();

    // Auto save code for this level
    this.playerData.savedCode[this.levelData.id] = this.editor.value;
    this.savePlayerData();

    // Reset world before run
    this.robot = { ...this.initialRobot };
    this.gems = this.levelData.gems ? this.levelData.gems.map(g => ({ ...g, collected: false })) : [];
    this.collectedGemsCount = 0;
    this.renderer.syncBot(this.robot, true);
    this.updateHUDStats();

    this.setStatus(mode === 'step' ? "DEPURANDO PASO A PASO..." : "EJECUTANDO SECUENCIA...");
    this.updateControlsState('running');
    this.logTerminal(`> Iniciando ejecución [Modo: ${mode}]...`, 'info');

    await interpreter.run(this.editor.value, this, mode);
  }

  stepCode() {
    soundEngine.init();
    soundEngine.playStep();
    if (!interpreter.isRunning) {
      this.runCode('step');
    } else {
      interpreter.step();
    }
  }

  stopCode() {
    interpreter.stop();
    this.resetCurrentLevel();
    this.logTerminal("> Ejecución cancelada por el usuario.", 'warn');
  }

  // --- Victory Handler ---
  handleVictory() {
    soundEngine.playWin();
    this.renderer.spawnPortalBurst(this.levelData.goalPos.x, this.levelData.goalPos.y);
    this.setStatus("¡MISIÓN COMPLETADA CON ÉXITO!");
    this.logTerminal("★ ¡Sector estabilizado! Acceso concedido al siguiente nivel.", 'success');

    // Calculate Stars
    const lines = this.editor.value.split('\n').filter(l => l.trim() && !l.trim().startsWith('//')).length;
    let starsEarned = 1;

    // Condition for 2 stars: collected all gems & completed
    if (this.hasCollectedAllGems()) {
      starsEarned = 2;
    }
    // Condition for 3 stars: code brevity <= target lines
    if (lines <= this.levelData.targetLines && this.hasCollectedAllGems()) {
      starsEarned = 3;
    }

    // Save stars & unlock next level
    const currentStars = this.playerData.levelStars[this.levelData.id] || 0;
    if (starsEarned > currentStars) {
      this.playerData.levelStars[this.levelData.id] = starsEarned;
    }

    const nextId = this.levelData.id + 1;
    if (nextId <= LEVELS_DATA.length && !this.playerData.unlockedLevels.includes(nextId)) {
      this.playerData.unlockedLevels.push(nextId);
    }
    this.savePlayerData();

    // Show Victory Modal
    this.showVictoryModal(starsEarned, lines);
  }

  showVictoryModal(stars, lines) {
    document.getElementById('victory-level-name').textContent = `${this.levelData.title} completado`;
    document.getElementById('victory-gems-stat').textContent = `${this.collectedGemsCount} / ${this.totalGemsCount}`;
    document.getElementById('victory-lines-stat').textContent = `${lines} (Meta 3★: ≤ ${this.levelData.targetLines})`;

    const effPercent = Math.min(100, Math.round((this.levelData.targetLines / Math.max(lines, 1)) * 100));
    document.getElementById('victory-efficiency-stat').textContent = `${effPercent}% Eficiente`;

    document.getElementById('victory-tip-text').textContent = this.levelData.tip;

    // Render stars
    const starEls = document.querySelectorAll('#victory-stars-display .star-item');
    starEls.forEach((el, idx) => {
      el.classList.remove('active');
      if (idx < stars) {
        setTimeout(() => el.classList.add('active'), (idx + 1) * 220);
      }
    });

    this.modalVictory.classList.add('active');
  }

  // --- UI Helpers & Highlighting ---
  setStatus(text) {
    this.viewportStatus.textContent = text;
  }

  updateControlsState(state) {
    if (state === 'running') {
      this.btnRun.disabled = true;
      this.btnStop.disabled = false;
    } else {
      this.btnRun.disabled = false;
      this.btnStep.disabled = false;
      this.btnStop.disabled = true;
    }
  }

  updateHUDStats() {
    this.hudGemsCount.textContent = `${this.collectedGemsCount} / ${this.totalGemsCount}`;
    const lines = this.editor.value.split('\n').filter(l => l.trim() && !l.trim().startsWith('//')).length;
    this.hudLinesCount.textContent = `${lines} líneas`;

    const savedStars = this.playerData.levelStars[this.levelData.id] || 0;
    this.hudStars.textContent = `⭐ ${savedStars}/3`;
  }

  logTerminal(text, type = 'info') {
    const line = document.createElement('div');
    line.className = `terminal-line ${type}-line`;
    line.textContent = text;
    this.terminal.appendChild(line);
    this.terminal.scrollTop = this.terminal.scrollHeight;
  }

  clearTerminal() {
    this.terminal.innerHTML = '';
  }

  highlightActiveLine(lineNum) {
    const gutterLines = this.gutter.querySelectorAll('.gutter-line');
    gutterLines.forEach(gl => gl.classList.remove('active-line', 'error-line'));

    if (lineNum && gutterLines[lineNum - 1]) {
      gutterLines[lineNum - 1].classList.add('active-line');
    }

    this.syncEditorState(lineNum);
  }

  highlightErrorLine(lineNum) {
    const gutterLines = this.gutter.querySelectorAll('.gutter-line');
    if (lineNum && gutterLines[lineNum - 1]) {
      gutterLines[lineNum - 1].classList.add('error-line');
    }
  }

  syncEditorState(activeLineNum = null) {
    const code = this.editor.value;
    const lines = code.split('\n');

    // 1. Update Gutter
    let gutterHTML = '';
    for (let i = 1; i <= lines.length; i++) {
      const isActive = i === activeLineNum ? ' active-line' : '';
      gutterHTML += `<div class="gutter-line${isActive}">${i}</div>`;
    }
    this.gutter.innerHTML = gutterHTML;

    // 2. Syntax Highlight Backdrop
    let highlightedHTML = '';
    for (let i = 0; i < lines.length; i++) {
      const lineText = lines[i];
      const isActive = (i + 1) === activeLineNum;
      const highlighted = this.syntaxHighlightLine(lineText);
      const activeClass = isActive ? ' class="hl-active-exec"' : '';
      highlightedHTML += `<span${activeClass}>${highlighted}</span>\n`;
    }
    this.backdrop.querySelector('code').innerHTML = highlightedHTML;

    this.updateHUDStats();
  }

  syntaxHighlightLine(text) {
    if (!text) return ' ';

    // Escape HTML
    let safe = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Comments
    if (safe.includes('//')) {
      const parts = safe.split('//');
      return `${this.syntaxHighlightLine(parts[0])}<span class="hl-comment">//${parts.slice(1).join('//')}</span>`;
    }

    // Keywords (Spanish & standard JS)
    safe = safe.replace(/\b(repetir|mientras|si|sino|funcion|for|while|if|else|function|let|const|var|return)\b/g, '<span class="hl-keyword">$1</span>');

    // Robot Functions & Sensors
    safe = safe.replace(/\b(avanzar|girarDerecha|girarIzquierda|recoger|activar|hayCristal|hayObstaculo|noEnMeta|hayCamino)\b(?=\s*\()/g, '<span class="hl-fn-call">$1</span>');

    // Numbers
    safe = safe.replace(/\b(\d+)\b/g, '<span class="hl-number">$1</span>');

    return safe;
  }

  // --- Quick Command Chips Palette ---
  renderCommandPalette(allowedChips = []) {
    this.paletteContainer.innerHTML = '';

    const chipDefinitions = {
      avanzar: { label: 'avanzar()', snippet: 'avanzar();\n', class: '' },
      girarDerecha: { label: 'girarDerecha()', snippet: 'girarDerecha();\n', class: '' },
      girarIzquierda: { label: 'girarIzquierda()', snippet: 'girarIzquierda();\n', class: '' },
      recoger: { label: 'recoger()', snippet: 'recoger();\n', class: '' },
      repetir: { label: 'repetir(4) { ... }', snippet: 'repetir(4) {\n  avanzar();\n}\n', class: 'chip-loop' },
      mientras: { label: 'mientras (noEnMeta())', snippet: 'mientras (noEnMeta()) {\n  avanzar();\n}\n', class: 'chip-loop' },
      si: { label: 'si (hayCristal())', snippet: 'si (hayCristal()) {\n  recoger();\n}\n', class: 'chip-cond' },
      sino: { label: 'sino { ... }', snippet: 'sino {\n  girarDerecha();\n}\n', class: 'chip-cond' },
      hayCristal: { label: 'hayCristal()', snippet: 'hayCristal()', class: 'chip-cond' },
      hayObstaculo: { label: 'hayObstaculo()', snippet: 'hayObstaculo()', class: 'chip-cond' },
      noEnMeta: { label: 'noEnMeta()', snippet: 'noEnMeta()', class: 'chip-cond' },
      funcion: { label: 'funcion miAccion()', snippet: 'funcion nuevaAccion() {\n  avanzar();\n  recoger();\n}\n', class: 'chip-func' }
    };

    allowedChips.forEach(chipKey => {
      const def = chipDefinitions[chipKey];
      if (!def) return;

      const btn = document.createElement('button');
      btn.className = `code-chip ${def.class}`;
      btn.textContent = def.label;
      btn.onclick = () => {
        soundEngine.playClick();
        this.insertSnippetIntoEditor(def.snippet);
      };
      this.paletteContainer.appendChild(btn);
    });
  }

  insertSnippetIntoEditor(snippet) {
    const start = this.editor.selectionStart;
    const end = this.editor.selectionEnd;
    const val = this.editor.value;

    this.editor.value = val.substring(0, start) + snippet + val.substring(end);
    this.editor.focus();
    this.editor.selectionStart = this.editor.selectionEnd = start + snippet.length;

    this.syncEditorState();
  }

  // --- Modal Openers ---
  openMissionsModal() {
    soundEngine.playClick();
    this.missionsGrid.innerHTML = '';

    LEVELS_DATA.forEach(lvl => {
      const isUnlocked = this.playerData.unlockedLevels.includes(lvl.id);
      const isActive = lvl.id === this.levelData.id;
      const stars = this.playerData.levelStars[lvl.id] || 0;

      const card = document.createElement('div');
      card.className = `mission-card ${!isUnlocked ? 'locked' : ''} ${isActive ? 'active-mission' : ''}`;

      const starsStr = isUnlocked ? '★'.repeat(stars) + '☆'.repeat(3 - stars) : '🔒';

      card.innerHTML = `
        <div class="card-top">
          <span class="card-badge">NIVEL ${String(lvl.id).padStart(2, '0')}</span>
          <span class="card-stars">${starsStr}</span>
        </div>
        <div class="card-title">${lvl.title}</div>
        <div class="card-desc">${lvl.tagline}</div>
        <span class="card-tag">${lvl.module}</span>
      `;

      if (isUnlocked) {
        card.onclick = () => {
          soundEngine.playClick();
          this.loadLevel(lvl.id);
          this.modalLevels.classList.remove('active');
        };
      }

      this.missionsGrid.appendChild(card);
    });

    this.modalLevels.classList.add('active');
  }

  openCodexModal(topic = 'algoritmos') {
    soundEngine.playClick();
    this.loadCodexArticle(topic);
    this.modalCodex.classList.add('active');
  }

  loadCodexArticle(topicKey) {
    const article = CODEX_ARTICLES[topicKey];
    if (!article) return;

    // Highlight nav item
    document.querySelectorAll('.codex-nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-topic') === topicKey);
    });

    const container = document.getElementById('codex-article-content');
    container.innerHTML = `
      <h3>${article.title}</h3>
      ${article.content}
    `;
  }

  // --- Event Bindings ---
  bindEvents() {
    // Editor typing & scrolling sync
    this.editor.addEventListener('input', () => this.syncEditorState());
    this.editor.addEventListener('scroll', () => {
      this.gutter.scrollTop = this.editor.scrollTop;
      this.backdrop.scrollTop = this.editor.scrollTop;
      this.backdrop.scrollLeft = this.editor.scrollLeft;
    });

    // Indentation Tab key support in textarea
    this.editor.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        this.insertSnippetIntoEditor('  ');
      }
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        this.runCode('run');
      }
    });

    // Run / Step / Stop buttons
    this.btnRun.addEventListener('click', () => this.runCode('run'));
    this.btnStep.addEventListener('click', () => this.stepCode());
    this.btnStop.addEventListener('click', () => this.stopCode());

    // Sound toggle
    this.btnSound.addEventListener('click', () => {
      const isMuted = soundEngine.toggleMute();
      this.soundIcon.textContent = isMuted ? '🔇' : '🔊';
    });

    // Modals
    document.getElementById('level-display-btn').addEventListener('click', () => this.openMissionsModal());
    document.getElementById('btn-levels-modal').addEventListener('click', () => this.openMissionsModal());
    document.getElementById('btn-close-levels-modal').addEventListener('click', () => this.modalLevels.classList.remove('active'));

    document.getElementById('btn-codex').addEventListener('click', () => this.openCodexModal());
    document.getElementById('btn-close-codex-modal').addEventListener('click', () => this.modalCodex.classList.remove('active'));

    // Codex tabs
    document.querySelectorAll('.codex-nav-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        soundEngine.playClick();
        this.loadCodexArticle(e.currentTarget.getAttribute('data-topic'));
      });
    });

    // Victory actions
    document.getElementById('btn-victory-replay').addEventListener('click', () => {
      soundEngine.playClick();
      this.modalVictory.classList.remove('active');
      this.resetCurrentLevel();
    });

    document.getElementById('btn-victory-next').addEventListener('click', () => {
      soundEngine.playClick();
      this.modalVictory.classList.remove('active');
      const nextId = this.levelData.id + 1;
      if (nextId <= LEVELS_DATA.length) {
        this.loadLevel(nextId);
      } else {
        alert("¡Felicitaciones! Has completado todos los sectores de CodeBot. ¡Eres un maestro de la programación!");
      }
    });

    // Speed selector buttons
    document.querySelectorAll('.speed-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        soundEngine.playClick();
        document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        interpreter.setSpeed(e.currentTarget.getAttribute('data-speed'));
      });
    });

    // Tab switcher (Editor vs Terminal)
    const tabBtnEditor = document.getElementById('tab-btn-editor');
    const tabBtnTerminal = document.getElementById('tab-btn-terminal');
    const tabEditor = document.getElementById('tab-editor');
    const tabTerminal = document.getElementById('tab-terminal');

    tabBtnEditor.addEventListener('click', () => {
      tabBtnEditor.classList.add('active');
      tabBtnTerminal.classList.remove('active');
      tabEditor.classList.add('active');
      tabTerminal.classList.remove('active');
    });

    tabBtnTerminal.addEventListener('click', () => {
      tabBtnTerminal.classList.add('active');
      tabBtnEditor.classList.remove('active');
      tabTerminal.classList.add('active');
      tabEditor.classList.remove('active');
    });

    // Reset Code Button
    document.getElementById('btn-code-reset').addEventListener('click', () => {
      if (confirm('¿Deseas restablecer el código a las instrucciones iniciales?')) {
        soundEngine.playClick();
        this.editor.value = this.levelData.starterCode;
        this.syncEditorState();
      }
    });

    // Format Code Button
    document.getElementById('btn-code-format').addEventListener('click', () => {
      soundEngine.playClick();
      const formatted = this.editor.value
        .split('\n')
        .map(l => l.trimEnd())
        .join('\n');
      this.editor.value = formatted;
      this.syncEditorState();
    });

    // Center camera button
    document.getElementById('btn-canvas-reset-view').addEventListener('click', () => {
      soundEngine.playClick();
      this.renderer.calculateLayout();
    });

    // Tutor close button
    document.getElementById('btn-tutor-close').addEventListener('click', () => {
      this.tutorBubble.style.display = 'none';
    });

    // Close modals on overlay click or Escape
    window.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
      }
    });
  }
}

// Boot application when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.app = new GameApp();
});
