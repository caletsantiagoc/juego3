/**
 * CodeBot Canvas Renderer
 * 2D / 2.5D Futuristic Cyber Grid Renderer with smooth robot interpolation,
 * floating data crystals, pulsating quantum portals, and particle effects.
 */

class WorldRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.level = null;
    
    // Robot render state with smooth visual interpolation
    this.bot = {
      gridX: 0,
      gridY: 0,
      drawX: 0,
      drawY: 0,
      angle: 0, // In radians
      targetAngle: 0,
      hoverOffset: 0
    };

    // Active particles
    this.particles = [];

    // Animation frame timing
    this.lastTime = performance.now();
    this.animTime = 0;

    // Viewport transform
    this.cellSize = 64;
    this.offsetX = 0;
    this.offsetY = 0;

    // Start render loop
    this.render = this.render.bind(this);
    requestAnimationFrame(this.render);
  }

  setLevel(level, robotState) {
    this.level = level;
    this.syncBot(robotState, true);
    this.calculateLayout();
  }

  syncBot(robotState, immediate = false) {
    this.bot.gridX = robotState.x;
    this.bot.gridY = robotState.y;

    // Convert direction character ('E', 'S', 'W', 'N') to radians
    let targetRad = 0;
    switch (robotState.dir) {
      case 'E': targetRad = 0; break;
      case 'S': targetRad = Math.PI / 2; break;
      case 'W': targetRad = Math.PI; break;
      case 'N': targetRad = (Math.PI * 3) / 2; break;
    }

    if (immediate) {
      this.bot.drawX = robotState.x;
      this.bot.drawY = robotState.y;
      this.bot.angle = targetRad;
      this.bot.targetAngle = targetRad;
    } else {
      // Choose shortest rotation path
      let diff = (targetRad - this.bot.angle) % (Math.PI * 2);
      if (diff > Math.PI) diff -= Math.PI * 2;
      if (diff < -Math.PI) diff += Math.PI * 2;
      this.bot.targetAngle = this.bot.angle + diff;
    }
  }

  calculateLayout() {
    if (!this.level) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);

    const cols = this.level.gridSize.cols;
    const rows = this.level.gridSize.rows;

    const availableW = rect.width - 40;
    const availableH = rect.height - 40;

    this.cellSize = Math.min(
      Math.floor(availableW / cols),
      Math.floor(availableH / rows),
      76
    );

    this.offsetX = Math.floor((rect.width - cols * this.cellSize) / 2);
    this.offsetY = Math.floor((rect.height - rows * this.cellSize) / 2);
  }

  // Spawn gem collection particles
  spawnGemParticles(gridX, gridY) {
    const cx = this.offsetX + (gridX + 0.5) * this.cellSize;
    const cy = this.offsetY + (gridY + 0.5) * this.cellSize;

    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3.5;
      this.particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        decay: 0.02 + Math.random() * 0.03,
        color: Math.random() > 0.4 ? '#00f0ff' : '#00ff9d',
        size: 2.5 + Math.random() * 3
      });
    }
  }

  // Spawn portal completion fireworks
  spawnPortalBurst(gridX, gridY) {
    const cx = this.offsetX + (gridX + 0.5) * this.cellSize;
    const cy = this.offsetY + (gridY + 0.5) * this.cellSize;

    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      this.particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        life: 1.0,
        decay: 0.015 + Math.random() * 0.02,
        color: ['#00f0ff', '#ff007f', '#ffe600', '#00ff9d'][Math.floor(Math.random() * 4)],
        size: 3 + Math.random() * 4
      });
    }
  }

  render(currentTime) {
    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;
    this.animTime += dt;

    const ctx = this.ctx;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);

    if (!this.level) {
      requestAnimationFrame(this.render);
      return;
    }

    // Smooth bot movement interpolation
    const lerpSpeed = 12 * dt;
    this.bot.drawX += (this.bot.gridX - this.bot.drawX) * lerpSpeed;
    this.bot.drawY += (this.bot.gridY - this.bot.drawY) * lerpSpeed;
    this.bot.angle += (this.bot.targetAngle - this.bot.angle) * (14 * dt);
    this.bot.hoverOffset = Math.sin(this.animTime * 4) * 3;

    // 1. Draw Grid Tiles
    this.drawGridTiles(ctx);

    // 2. Draw Obstacles & Walls
    this.drawObstacles(ctx);

    // 3. Draw Quantum Portal (Goal)
    this.drawPortal(ctx);

    // 4. Draw Collectible Data Crystals (Gems)
    this.drawGems(ctx);

    // 5. Draw ByteBot
    this.drawRobot(ctx);

    // 6. Update and Draw Particles
    this.drawParticles(ctx, dt);

    requestAnimationFrame(this.render);
  }

  drawGridTiles(ctx) {
    const cols = this.level.gridSize.cols;
    const rows = this.level.gridSize.rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = this.offsetX + c * this.cellSize;
        const y = this.offsetY + r * this.cellSize;

        // Base tile
        ctx.fillStyle = ((c + r) % 2 === 0) ? '#0b111e' : '#0e1626';
        ctx.fillRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);

        // Grid border line
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, this.cellSize, this.cellSize);

        // Tech corner dots
        ctx.fillStyle = 'rgba(0, 240, 255, 0.25)';
        ctx.fillRect(x + 2, y + 2, 2, 2);
      }
    }
  }

  drawObstacles(ctx) {
    if (!this.level.obstacles) return;

    this.level.obstacles.forEach(obs => {
      const x = this.offsetX + obs.x * this.cellSize;
      const y = this.offsetY + obs.y * this.cellSize;
      const pad = 4;

      // Obstacle block with 3D bevel and warning grid
      ctx.fillStyle = '#172033';
      ctx.fillRect(x + pad, y + pad, this.cellSize - pad * 2, this.cellSize - pad * 2);

      // Neon warning rim
      ctx.strokeStyle = 'rgba(255, 0, 127, 0.45)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + pad, y + pad, this.cellSize - pad * 2, this.cellSize - pad * 2);

      // Warning hazard stripes inside
      ctx.fillStyle = 'rgba(255, 0, 127, 0.15)';
      ctx.beginPath();
      ctx.moveTo(x + pad + 6, y + pad);
      ctx.lineTo(x + this.cellSize - pad, y + this.cellSize - pad - 6);
      ctx.lineTo(x + this.cellSize - pad, y + this.cellSize - pad);
      ctx.lineTo(x + pad, y + pad + 6);
      ctx.fill();

      // Top corner glow
      ctx.fillStyle = '#ff007f';
      ctx.fillRect(x + pad + 2, y + pad + 2, 4, 4);
    });
  }

  drawPortal(ctx) {
    const goal = this.level.goalPos;
    if (!goal) return;

    const cx = this.offsetX + (goal.x + 0.5) * this.cellSize;
    const cy = this.offsetY + (goal.y + 0.5) * this.cellSize;
    const radius = this.cellSize * 0.38;

    ctx.save();
    ctx.translate(cx, cy);

    // Rotating outer ring
    ctx.rotate(this.animTime * 1.5);
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 12;

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 1.5);
    ctx.stroke();

    // Counter-rotating inner ring
    ctx.rotate(-this.animTime * 2.8);
    ctx.strokeStyle = '#9d4edd';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#9d4edd';
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.65, 0, Math.PI * 1.3);
    ctx.stroke();

    // Pulsating energy core
    const corePulse = 0.8 + Math.sin(this.animTime * 6) * 0.2;
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 0.5 * corePulse);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.5, '#00f0ff');
    grad.addColorStop(1, 'rgba(0, 240, 255, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.5 * corePulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawGems(ctx) {
    if (!this.level.gems) return;

    this.level.gems.forEach(gem => {
      if (gem.collected) return;

      const cx = this.offsetX + (gem.x + 0.5) * this.cellSize;
      const cy = this.offsetY + (gem.y + 0.5) * this.cellSize + Math.sin(this.animTime * 4 + gem.x) * 4;
      const size = this.cellSize * 0.22;

      ctx.save();
      ctx.translate(cx, cy);

      // Rotating glow
      ctx.shadowColor = '#00ff9d';
      ctx.shadowBlur = 14;

      // Diamond shape
      ctx.fillStyle = '#00ff9d';
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(size * 0.8, 0);
      ctx.lineTo(0, size);
      ctx.lineTo(-size * 0.8, 0);
      ctx.closePath();
      ctx.fill();

      // Inner specular facet
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(size * 0.35, 0);
      ctx.lineTo(0, size * 0.6);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    });
  }

  drawRobot(ctx) {
    const cx = this.offsetX + (this.bot.drawX + 0.5) * this.cellSize;
    const cy = this.offsetY + (this.bot.drawY + 0.5) * this.cellSize + this.bot.hoverOffset;
    const r = this.cellSize * 0.32;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.bot.angle);

    // Hover shadow underneath
    ctx.fillStyle = 'rgba(0, 240, 255, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 6 - this.bot.hoverOffset, r * 0.8, r * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body Chassis (Sleek sci-fi capsule)
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 10;

    ctx.beginPath();
    ctx.roundRect(-r * 0.8, -r * 0.8, r * 1.6, r * 1.6, [r * 0.5, r * 0.8, r * 0.8, r * 0.5]);
    ctx.fill();
    ctx.stroke();

    // Cyber visor / LED Screen
    ctx.fillStyle = '#0a0f1d';
    ctx.fillRect(r * 0.1, -r * 0.45, r * 0.6, r * 0.9);

    // Glowing cyan eyes
    ctx.fillStyle = '#00f0ff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 8;
    ctx.fillRect(r * 0.3, -r * 0.3, r * 0.28, r * 0.2);
    ctx.fillRect(r * 0.3, r * 0.1, r * 0.28, r * 0.2);

    // Antenna & glowing diode
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-r * 0.4, 0);
    ctx.lineTo(-r * 0.9, 0);
    ctx.stroke();

    ctx.fillStyle = '#ff007f';
    ctx.shadowColor = '#ff007f';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(-r * 0.95, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Directional orientation arrow
    ctx.fillStyle = 'rgba(0, 240, 255, 0.7)';
    ctx.beginPath();
    ctx.moveTo(r * 0.85, 0);
    ctx.lineTo(r * 1.15, -r * 0.2);
    ctx.lineTo(r * 1.15, r * 0.2);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  drawParticles(ctx, dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}
