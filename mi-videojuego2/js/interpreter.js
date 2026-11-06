/**
 * CodeBot Execution Interpreter
 * Transpiles user code (Spanish pseudocode or JS) into an asynchronous generator
 * with line-by-line debugging, step control, infinite loop safety, and sandboxed state.
 */

class CodeInterpreter {
  constructor() {
    this.isRunning = false;
    this.isPaused = false;
    this.stepRequested = false;
    this.speed = 'normal'; // 'slow', 'normal', 'fast', 'ultra'
    this.currentGenerator = null;
    this.abortController = null;
    this.onLineChange = null;
    this.onLog = null;
    this.onFinish = null;
    this.onError = null;
  }

  getSpeedDelay() {
    switch (this.speed) {
      case 'slow': return 500;
      case 'normal': return 250;
      case 'fast': return 80;
      case 'ultra': return 10;
      default: return 250;
    }
  }

  setSpeed(speed) {
    this.speed = speed;
  }

  /**
   * Pre-validates syntax before compiling
   */
  validateSyntax(code) {
    // Check balanced braces and parenthesis
    let braces = 0;
    let parens = 0;
    const lines = code.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].replace(/\/\/.*$/, ''); // ignore comments
      for (const char of line) {
        if (char === '{') braces++;
        if (char === '}') braces--;
        if (char === '(') parens++;
        if (char === ')') parens--;

        if (braces < 0) {
          return { valid: false, line: i + 1, error: "Llave de cierre '}' inesperada sin apertura previa." };
        }
        if (parens < 0) {
          return { valid: false, line: i + 1, error: "Paréntesis de cierre ')' inesperado sin apertura previa." };
        }
      }
    }

    if (braces > 0) {
      return { valid: false, line: lines.length, error: `Falta cerrar ${braces} llave(s) '}' en el programa.` };
    }
    if (parens > 0) {
      return { valid: false, line: lines.length, error: `Falta cerrar ${parens} paréntesis ')' en el programa.` };
    }

    return { valid: true };
  }

  /**
   * Transpiles user code into an async generator function body
   * Maintains line number mapping 1:1.
   */
  transpileToGenerator(code) {
    const rawLines = code.split('\n');
    const transpiledLines = [];
    let loopIdCounter = 0;

    for (let i = 0; i < rawLines.length; i++) {
      const lineNum = i + 1;
      let line = rawLines[i];
      const trimmed = line.trim();

      // Skip empty lines or pure comment lines
      if (!trimmed || trimmed.startsWith('//')) {
        transpiledLines.push(line);
        continue;
      }

      // 1. Replace Spanish keywords
      // 'repetir ( n ) {' -> 'for (let _i_ = 0; _i_ < n; _i_++) {'
      if (/\brepetir\s*\(([^)]+)\)\s*\{?/.test(line)) {
        loopIdCounter++;
        line = line.replace(/\brepetir\s*\(([^)]+)\)\s*\{?/, (match, count) => {
          return `for (let _k${loopIdCounter}_ = 0; _k${loopIdCounter}_ < (${count}); _k${loopIdCounter}_++) { if (++_safetyCounter > 1000) throw new Error("¡Bucle infinito detectado! Superó 1000 iteraciones."); yield { line: ${lineNum}, type: 'loop_tick' };`;
        });
      }

      // 'mientras ( cond ) {' -> 'while ( cond ) {'
      if (/\bmientras\s*\(([^)]+)\)\s*\{?/.test(line)) {
        loopIdCounter++;
        line = line.replace(/\bmientras\s*\(([^)]+)\)\s*\{?/, (match, cond) => {
          return `while (${cond}) { if (++_safetyCounter > 1000) throw new Error("¡Bucle infinito detectado! Condición 'mientras' nunca se hizo falsa."); yield { line: ${lineNum}, type: 'while_tick' };`;
        });
      }

      // 'si ( cond ) {' -> 'if ( cond ) {'
      line = line.replace(/\bsi\s*\(([^)]+)\)\s*\{?/, (match, cond) => {
        return `yield { line: ${lineNum}, type: 'cond_eval' }; if (${cond}) {`;
      });

      // 'sino {' -> 'else {'
      line = line.replace(/\bsino\s*\{?/, '} else {');

      // 'funcion nombre( ... ) {' -> 'async function nombre( ... ) {'
      line = line.replace(/\bfuncion\s+([a-zA-Z0-9_$]+)\s*\(([^)]*)\)\s*\{?/, (match, name, params) => {
        return `async function ${name}(${params}) {`;
      });

      // 2. Instrument robot actions with yield & line number
      // Actions: avanzar(), girarDerecha(), girarIzquierda(), recoger(), activar()
      const actionKeywords = ['avanzar', 'girarDerecha', 'girarIzquierda', 'recoger', 'activar'];
      actionKeywords.forEach(act => {
        const regex = new RegExp(`\\b${act}\\s*\\(\\s*\\)`, 'g');
        line = line.replace(regex, `(yield { line: ${lineNum}, type: 'action', action: '${act}' })`);
      });

      transpiledLines.push(line);
    }

    return transpiledLines.join('\n');
  }

  /**
   * Executes the code with the given game environment context
   */
  async run(code, environment, mode = 'run') {
    this.stop(); // Stop any currently running task

    // 1. Syntax check
    const syntax = this.validateSyntax(code);
    if (!syntax.valid) {
      if (this.onError) {
        this.onError(`Error de sintaxis en línea ${syntax.line}: ${syntax.error}`, syntax.line);
      }
      return false;
    }

    this.isRunning = true;
    this.isPaused = (mode === 'step');
    this.stepRequested = (mode === 'step');
    this.abortController = new AbortController();

    let transpiled;
    try {
      transpiled = this.transpileToGenerator(code);
    } catch (e) {
      if (this.onError) this.onError(`Error de análisis: ${e.message}`, 1);
      this.isRunning = false;
      return false;
    }

    // Prepare sandbox context
    // Expose sensors and action proxies
    const sensors = {
      hayCristal: () => environment.hasGem(),
      hayObstaculo: () => environment.hasObstacleAhead(),
      noEnMeta: () => !environment.isAtGoal(),
      hayCamino: () => !environment.hasObstacleAhead(),
      // Standard English aliases
      hasGem: () => environment.hasGem(),
      hasObstacle: () => environment.hasObstacleAhead(),
      notAtGoal: () => !environment.isAtGoal(),
      isGoal: () => environment.isAtGoal(),
    };

    // Construct AsyncGeneratorFunction
    const AsyncGeneratorFunction = Object.getPrototypeOf(async function* () {}).constructor;
    let genFn;
    try {
      genFn = new AsyncGeneratorFunction(
        'env',
        'sensors',
        `
        const { hayCristal, hayObstaculo, noEnMeta, hayCamino, hasGem, hasObstacle, notAtGoal, isGoal } = sensors;
        let _safetyCounter = 0;
        ${transpiled}
        `
      );
    } catch (compileErr) {
      if (this.onError) {
        this.onError(`Error de compilación: ${compileErr.message}`, 1);
      }
      this.isRunning = false;
      return false;
    }

    const generator = genFn(environment, sensors);
    this.currentGenerator = generator;

    // Execution Loop
    try {
      while (this.isRunning) {
        // If stepping, wait until step is requested
        if (this.isPaused && !this.stepRequested) {
          await new Promise(resolve => setTimeout(resolve, 50));
          continue;
        }

        this.stepRequested = false;

        const { value, done } = await generator.next();

        if (done) {
          // Program finished normally
          if (this.onLineChange) this.onLineChange(null);
          this.isRunning = false;
          if (this.onFinish) this.onFinish(true);
          return true;
        }

        if (value && value.line && this.onLineChange) {
          this.onLineChange(value.line);
        }

        if (value && value.type === 'action') {
          // Execute action on environment
          const result = await environment.executeAction(value.action);
          if (!result.success) {
            if (this.onError) {
              this.onError(`Fallo de ejecución en línea ${value.line}: ${result.message}`, value.line);
            }
            this.stop();
            if (this.onFinish) this.onFinish(false, result.message);
            return false;
          }

          if (this.onLog) {
            this.onLog(`[Línea ${value.line}] ${value.action}() → OK`);
          }
        }

        // Check if goal was reached early or if all gems collected
        if (environment.isAtGoal() && environment.hasCollectedAllGems()) {
          if (this.onLineChange) this.onLineChange(null);
          this.isRunning = false;
          if (this.onFinish) this.onFinish(true, "¡Meta alcanzada con todos los cristales!");
          return true;
        }

        // Delay between steps depending on current speed
        if (!this.isPaused) {
          await new Promise(resolve => setTimeout(resolve, this.getSpeedDelay()));
        }
      }
    } catch (runtimeErr) {
      if (this.onError) {
        this.onError(`Error en tiempo de ejecución: ${runtimeErr.message}`);
      }
      this.stop();
      if (this.onFinish) this.onFinish(false, runtimeErr.message);
      return false;
    }

    return true;
  }

  step() {
    if (!this.isRunning) return;
    this.isPaused = true;
    this.stepRequested = true;
  }

  stop() {
    this.isRunning = false;
    this.isPaused = false;
    this.stepRequested = false;
    this.currentGenerator = null;
    if (this.onLineChange) this.onLineChange(null);
  }
}

// Global interpreter instance
const interpreter = new CodeInterpreter();
