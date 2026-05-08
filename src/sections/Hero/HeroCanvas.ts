interface PlasmaBlob {
  cx: number;     // center offset from sphere center, in sphere-radius units
  cy: number;
  r: number;      // blob radius as fraction of sphere radius
  rgb: string;
  alpha: number;
  phase: number;
  speedX: number; // radians per frame — 0.003–0.007 → 15–35 s cycles at 60 fps
  speedY: number;
  ampX: number;   // drift amplitude in sphere-radius units
  ampY: number;
}

interface Star {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
}

/* ── Plasma blobs — flowing aurora on the sphere surface ────────────
   Alphas bumped slightly vs prior version because the sphere is now
   smaller; keeping the luminosity the same requires a modest increase.  */
const PLASMA: PlasmaBlob[] = [
  { cx:  0.05, cy: -0.18, r: 0.72, rgb: '0,195,225',   alpha: 0.68, phase: 0.00, speedX: 0.0046, speedY: 0.0034, ampX: 0.52, ampY: 0.42 },
  { cx:  0.36, cy:  0.20, r: 0.56, rgb: '55,172,252',  alpha: 0.56, phase: 1.80, speedX: 0.0034, speedY: 0.0051, ampX: 0.44, ampY: 0.38 },
  { cx: -0.26, cy:  0.30, r: 0.64, rgb: '0,152,192',   alpha: 0.50, phase: 3.20, speedX: 0.0052, speedY: 0.0038, ampX: 0.46, ampY: 0.34 },
  { cx:  0.24, cy: -0.36, r: 0.46, rgb: '72,90,212',   alpha: 0.44, phase: 2.10, speedX: 0.0038, speedY: 0.0056, ampX: 0.42, ampY: 0.38 },
  { cx: -0.04, cy:  0.06, r: 0.28, rgb: '172,222,252', alpha: 0.54, phase: 4.50, speedX: 0.0065, speedY: 0.0046, ampX: 0.36, ampY: 0.30 },
  { cx:  0.00, cy:  0.00, r: 0.92, rgb: '16,72,155',   alpha: 0.34, phase: 1.20, speedX: 0.0022, speedY: 0.0026, ampX: 0.18, ampY: 0.16 },
];

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function makeStars(count: number): Star[] {
  return Array.from({ length: count }, () => ({
    x:     Math.random(),
    y:     Math.random(),
    vx:    (Math.random() - 0.5) * 0.00008,
    vy:    (Math.random() - 0.5) * 0.00008,
    size:  rand(0.3, 1.2),
    alpha: rand(0.03, 0.13),
  }));
}

export class HeroCanvas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private t = 0;
  private rafId = 0;
  private running = false;
  private stars: Star[] = makeStars(28);

  private surfaceDots = Array.from({ length: 80 }, () => ({
    angle:  Math.random() * Math.PI * 2,
    radius: rand(0.05, 0.94),
    phase:  Math.random() * Math.PI * 2,
    alpha:  rand(0.02, 0.07),
  }));

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
  }

  resize() {
    this.canvas.width  = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
  }

  start() {
    this.running = true;
    this.loop();
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  private loop() {
    if (!this.running) return;
    this.t++;
    this.draw();
    this.rafId = requestAnimationFrame(() => this.loop());
  }

  private draw() {
    const { ctx, canvas, t } = this;
    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#030810';
    ctx.fillRect(0, 0, W, H);

    // Sphere geometry — right-side accent, fully contained within viewport.
    // sr formula caps at 22% of width or 33% of height, whichever is tighter,
    // so the sphere never bleeds awkwardly on any standard screen ratio.
    const sx = W * 0.75;
    const sy = H * 0.50;
    const sr = Math.min(W * 0.22, H * 0.33);

    // ── 1. Far atmospheric bloom — wide soft halo outside sphere ─────
    ctx.globalCompositeOperation = 'screen';
    const farBloom = ctx.createRadialGradient(sx, sy, sr * 0.80, sx, sy, sr * 2.4);
    farBloom.addColorStop(0,   'rgba(0,100,185, 0.09)');
    farBloom.addColorStop(0.4, 'rgba(0, 60,145, 0.04)');
    farBloom.addColorStop(1,   'rgba(0,  0,  0, 0)');
    ctx.fillStyle = farBloom;
    ctx.beginPath();
    ctx.arc(sx, sy, sr * 2.4, 0, Math.PI * 2);
    ctx.fill();

    // Tight near-surface bloom
    const nearBloom = ctx.createRadialGradient(sx, sy, sr * 0.88, sx, sy, sr * 1.45);
    nearBloom.addColorStop(0,   'rgba(0,125,205, 0.14)');
    nearBloom.addColorStop(0.5, 'rgba(0, 80,165, 0.07)');
    nearBloom.addColorStop(1,   'rgba(0,  0,  0, 0)');
    ctx.fillStyle = nearBloom;
    ctx.beginPath();
    ctx.arc(sx, sy, sr * 1.45, 0, Math.PI * 2);
    ctx.fill();

    // ── 2. Sphere base — offset gradient simulates 3D light direction ─
    // Light source: upper-left. Gradient origin is offset toward that
    // corner, making the sphere lighter there and darker lower-right.
    ctx.globalCompositeOperation = 'source-over';
    const hlx = sx - sr * 0.24;  // highlight x (upper-left)
    const hly = sy - sr * 0.20;  // highlight y
    const base = ctx.createRadialGradient(hlx, hly, 0, sx, sy, sr);
    base.addColorStop(0,    'rgba(16, 34, 82, 0.90)');  // lit face — deep navy
    base.addColorStop(0.28, 'rgba( 8, 18, 52, 0.94)');
    base.addColorStop(0.58, 'rgba( 3,  8, 26, 0.97)');
    base.addColorStop(0.84, 'rgba( 1,  3, 14, 0.99)');
    base.addColorStop(1,    'rgba( 0,  2, 10, 1.00)');  // shadow side
    ctx.fillStyle = base;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();

    // ── 3. Clip everything below to sphere boundary ───────────────────
    ctx.save();
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.clip();

    // ── 4. Plasma blobs — flowing aurora (additive screen blend) ─────
    ctx.globalCompositeOperation = 'screen';
    for (const b of PLASMA) {
      const bx = sx + (b.cx + b.ampX * Math.sin(b.speedX * t + b.phase))        * sr;
      const by = sy + (b.cy + b.ampY * Math.sin(b.speedY * t + b.phase * 0.73)) * sr;
      const br = b.r * sr;
      const g = ctx.createRadialGradient(bx, by, 0, bx, by, br);
      g.addColorStop(0,    `rgba(${b.rgb}, ${b.alpha})`);
      g.addColorStop(0.38, `rgba(${b.rgb}, ${b.alpha * 0.52})`);
      g.addColorStop(0.72, `rgba(${b.rgb}, ${b.alpha * 0.12})`);
      g.addColorStop(1,    `rgba(${b.rgb}, 0)`);
      ctx.fillStyle = g;
      ctx.fillRect(bx - br, by - br, br * 2, br * 2);
    }

    // ── 5. Specular highlight — simulates glass surface reflection ────
    // Small bright spot at upper-left interior, offset from sphere center.
    const specX = sx - sr * 0.30;
    const specY = sy - sr * 0.26;
    const spec  = ctx.createRadialGradient(specX, specY, 0, specX, specY, sr * 0.48);
    spec.addColorStop(0,    'rgba(150,195,255, 0.30)');
    spec.addColorStop(0.38, 'rgba( 90,150,240, 0.12)');
    spec.addColorStop(0.72, 'rgba( 50, 95,210, 0.04)');
    spec.addColorStop(1,    'rgba(  0,  0,  0, 0)');
    ctx.fillStyle = spec;
    ctx.fillRect(specX - sr * 0.5, specY - sr * 0.5, sr, sr);

    // ── 6. Limb darkening — sphere edges curve away from the viewer ───
    // Drawn last inside the clip so it dampens plasma glow near the rim,
    // preventing the sphere from looking flat or disc-like.
    ctx.globalCompositeOperation = 'source-over';
    const limb = ctx.createRadialGradient(sx, sy, sr * 0.58, sx, sy, sr);
    limb.addColorStop(0,    'rgba(0,0,0, 0)');
    limb.addColorStop(0.52, 'rgba(0,0,6, 0.16)');
    limb.addColorStop(0.78, 'rgba(0,0,8, 0.54)');
    limb.addColorStop(1,    'rgba(0,0,8, 0.84)');
    ctx.fillStyle = limb;
    ctx.fillRect(sx - sr, sy - sr, sr * 2, sr * 2);

    // ── 7. Surface micro-dots — fine rotating texture ─────────────────
    for (const d of this.surfaceDots) {
      const ang = d.angle + t * 0.00028;
      const px  = sx + Math.cos(ang) * d.radius * sr;
      const py  = sy + Math.sin(ang) * d.radius * sr * 0.96;
      const a   = d.alpha * (0.6 + 0.4 * Math.sin(t * 0.0018 + d.phase));
      ctx.fillStyle = `rgba(180,220,255,${a})`;
      ctx.beginPath();
      ctx.arc(px, py, 0.7, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore(); // end sphere clip

    // ── 8. Rim shadow — dark inner ring, deepens edge curvature ──────
    ctx.globalCompositeOperation = 'source-over';
    const rimShadow = ctx.createRadialGradient(sx, sy, sr * 0.82, sx, sy, sr * 1.02);
    rimShadow.addColorStop(0,    'rgba(0,0,0, 0)');
    rimShadow.addColorStop(0.62, 'rgba(0,2,18, 0.28)');
    rimShadow.addColorStop(1,    'rgba(0,0, 0, 0)');
    ctx.fillStyle = rimShadow;
    ctx.beginPath();
    ctx.arc(sx, sy, sr * 1.02, 0, Math.PI * 2);
    ctx.fill();

    // ── 9. Rim light — luminous edge ring (backlight effect) ─────────
    ctx.globalCompositeOperation = 'screen';
    const rimLight = ctx.createRadialGradient(sx, sy, sr * 0.86, sx, sy, sr * 1.06);
    rimLight.addColorStop(0,    'rgba(  0,  0,  0, 0)');
    rimLight.addColorStop(0.55, 'rgba( 38,148,215, 0.20)');
    rimLight.addColorStop(0.80, 'rgba( 80,180,240, 0.36)');
    rimLight.addColorStop(0.93, 'rgba(115,205,255, 0.14)');
    rimLight.addColorStop(1,    'rgba(  0,  0,  0, 0)');
    ctx.fillStyle = rimLight;
    ctx.beginPath();
    ctx.arc(sx, sy, sr * 1.06, 0, Math.PI * 2);
    ctx.fill();

    // ── 10. Ambient star field (full canvas, behind everything) ──────
    ctx.globalCompositeOperation = 'source-over';
    for (const s of this.stars) {
      s.x += s.vx;
      s.y += s.vy;
      if (s.x > 1) s.x -= 1;
      if (s.x < 0) s.x += 1;
      if (s.y > 1) s.y -= 1;
      if (s.y < 0) s.y += 1;
      ctx.fillStyle = `rgba(200,215,255,${s.alpha})`;
      ctx.beginPath();
      ctx.arc(s.x * W, s.y * H, s.size * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalCompositeOperation = 'source-over';
  }
}
