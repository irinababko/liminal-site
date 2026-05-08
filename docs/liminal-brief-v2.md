# LIMINAL — Implementation Brief
**React · TypeScript · SCSS Modules · Framer Motion**

---

## File Structure

```
src/
├── tokens/
│   ├── colors.ts
│   ├── motion.ts
│   └── typography.ts
│
├── hooks/
│   ├── useScrollProgress.ts
│   └── useReducedMotion.ts
│
├── components/
│   ├── Cursor/
│   │   ├── Cursor.tsx
│   │   └── Cursor.module.scss
│   ├── Nav/
│   │   ├── Nav.tsx
│   │   └── Nav.module.scss
│   ├── Reveal/
│   │   └── Reveal.tsx           ← no styles, purely logic
│   ├── SectionLabel/
│   │   ├── SectionLabel.tsx
│   │   └── SectionLabel.module.scss
│   └── SectionDivider/
│       └── SectionDivider.tsx   ← single-line component, inline style ok
│
├── sections/
│   ├── Hero/
│   │   ├── Hero.tsx
│   │   ├── Hero.module.scss
│   │   └── HeroCanvas.ts        ← pure canvas logic, no React
│   ├── Breath/
│   │   ├── Breath.tsx
│   │   └── Breath.module.scss
│   ├── Current/
│   │   ├── Current.tsx
│   │   └── Current.module.scss
│   ├── Resonance/
│   │   ├── Resonance.tsx
│   │   ├── Resonance.module.scss
│   │   ├── Tile.tsx
│   │   └── Tile.module.scss
│   ├── Threshold/
│   │   ├── Threshold.tsx
│   │   └── Threshold.module.scss
│   ├── Verse/
│   │   ├── Verse.tsx
│   │   └── Verse.module.scss
│   └── Origin/
│       ├── Origin.tsx
│       └── Origin.module.scss
│
├── styles/
│   ├── _reset.scss
│   ├── _tokens.scss             ← CSS custom properties from tokens/
│   ├── _typography.scss         ← font-face / @import, base type rules
│   └── global.scss              ← imports above, sets body/html
│
└── app/
    ├── layout.tsx               ← mounts Cursor, global styles
    └── page.tsx                 ← imports all sections in order
```

---

## Tokens

### `tokens/colors.ts`

```ts
export const C = {
  deep:       '#0C0C10',
  graphite:   '#18181E',
  deepBlue:   '#0A0A0E',
  deepVerse:  '#070710',
  ivory:      '#F4EFE6',
  champagne:  '#C9A96E',
  blue:       '#879DB8',
  coral:      '#C07A65',
  electric:   '#6EFFD4',

  // Alphas
  ivoryDim:   'rgba(244,239,230,0.55)',
  ivoryGhost: 'rgba(244,239,230,0.08)',
  glassEdge:  'rgba(244,239,230,0.08)',
} as const;
```

### `tokens/motion.ts`

```ts
export const ease = {
  out:    [0.16, 1, 0.3, 1]    as const,  // primary — all reveals
  gentle: [0.25, 0.46, 0.45, 0.94] as const,
} as const;

export const dur = {
  fast:  0.4,
  base:  0.8,
  slow:  1.2,
  xl:    1.4,
} as const;

export const stagger = {
  hero:    0.09,
  section: 0.15,
  grid:    0.08,
} as const;

// Reusable variants
export const fadeUp = {
  hidden:  { opacity: 0, y: 48 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: dur.base, ease: ease.out, delay },
  }),
} as const;

export const fadeIn = {
  hidden:  { opacity: 0 },
  visible: (delay = 0) => ({
    opacity: 1,
    transition: { duration: dur.base, ease: ease.out, delay },
  }),
} as const;
```

### `tokens/typography.ts`

```ts
// All sizes use clamp() for fluid scaling — no media query overrides needed
export const fs = {
  hero:     'clamp(80px, 16vw, 210px)',
  display1: 'clamp(52px, 9.5vw, 134px)',
  display2: 'clamp(80px, 18vw, 270px)',
  h1:       'clamp(34px, 4.8vw, 66px)',
  bodyLg:   'clamp(14px, 1.4vw, 17px)',
  bodySm:   'clamp(13px, 1.3vw, 16px)',
  label:    '10px',
  micro:    '9px',
} as const;

export const font = {
  display: "'Cormorant Garamond', Georgia, serif",
  sans:    "'Syne', system-ui, sans-serif",
  body:    "'Jost', system-ui, sans-serif",
} as const;
```

### `styles/_tokens.scss`

SCSS mirror of the TS tokens as CSS custom properties. The source of truth for styles.

```scss
:root {
  // Color
  --deep:       #0C0C10;
  --graphite:   #18181E;
  --deep-blue:  #0A0A0E;
  --deep-verse: #070710;
  --ivory:      #F4EFE6;
  --champagne:  #C9A96E;
  --blue:       #879DB8;
  --coral:      #C07A65;
  --electric:   #6EFFD4;

  --ivory-dim:   rgba(244,239,230,0.55);
  --glass-edge:  rgba(244,239,230,0.08);
  --divider:     rgba(244,239,230,0.055);

  // Typography
  --font-display: 'Cormorant Garamond', Georgia, serif;
  --font-sans:    'Syne', system-ui, sans-serif;
  --font-body:    'Jost', system-ui, sans-serif;

  // Layout
  --page-pad:  clamp(24px, 5.5vw, 88px);
  --section-v: clamp(80px, 10vh, 140px);
}
```

---

## Shared Components

### `Reveal.tsx`
**Responsibility:** Wraps any child with a scroll-triggered `fadeUp` or `fadeIn` animation. Respects `prefers-reduced-motion`.

```tsx
import { motion } from 'framer-motion';
import { fadeUp, ease, dur } from '@/tokens/motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  y?: number;          // override translateY distance, default 48
  once?: boolean;      // default true
}

export function Reveal({ children, delay = 0, y = 48, once = true }: RevealProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: reduced ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-70px' }}
      transition={{ duration: dur.base, ease: ease.out, delay }}
    >
      {children}
    </motion.div>
  );
}
```

**Usage:**
```tsx
<Reveal delay={0.15}><h2 className={s.heading}>…</h2></Reveal>
```

---

### `SectionLabel.tsx`
**Responsibility:** Renders the eyebrow label (line + text) that appears at the top of each section. Accepts a `color` prop to match the section's accent.

```tsx
interface SectionLabelProps {
  text: string;
  color?: string;  // defaults to --champagne
}
```

SCSS: flex row, `gap: 16px`, `align-items: center`. `::before` pseudo-element is the 22×1px line.

---

### `SectionDivider.tsx`
**Responsibility:** 1px gradient horizontal rule between sections. Single JSX line, inline style acceptable.

```tsx
export function SectionDivider() {
  return (
    <div style={{
      width: '100%', height: '1px',
      background: 'linear-gradient(90deg, transparent, rgba(244,239,230,0.06), transparent)',
    }} />
  );
}
```

---

### `Cursor.tsx`
**Responsibility:** Renders the cursor dot (snaps to mouse) and ring (follows with spring lag). Mounts once in `layout.tsx`. Manages hover-expand state via `data-cursor-hover` on the `<body>`.

The ring uses `useSpring` with `{ stiffness: 120, damping: 22, mass: 0.8 }` applied to `useMotionValue` x/y, which are updated on `mousemove`.

Hover detection: a single delegated listener on `document` for `mouseenter`/`mouseleave` on elements matching `a, button, [data-hover]`. On hover, ring expands to `54px` with `border-color: rgba(201,169,110,0.5)`.

```scss
// Cursor.module.scss
.dot {
  position: fixed; width: 5px; height: 5px;
  background: var(--ivory); border-radius: 50%;
  pointer-events: none; z-index: 9999;
  transform: translate(-50%, -50%);
}
.ring {
  position: fixed; width: 30px; height: 30px;
  border: 1px solid rgba(244,239,230,0.35); border-radius: 50%;
  pointer-events: none; z-index: 9998;
  transform: translate(-50%, -50%);
}
```

---

### `useScrollProgress.ts`
**Responsibility:** Returns a Framer `MotionValue<number>` from 0 to 1 based on scroll position. Used by ProgressBar and Hero parallax.

```ts
import { useScroll, useTransform } from 'framer-motion';

export function useScrollProgress() {
  const { scrollYProgress } = useScroll();
  return scrollYProgress; // already 0–1
}
```

---

### `useReducedMotion.ts`
**Responsibility:** Returns `true` if user has `prefers-reduced-motion: reduce`. Pass to all animation components.

```ts
import { useReducedMotion as useFramerRM } from 'framer-motion';
export const useReducedMotion = useFramerRM; // re-export Framer's built-in
```

---

## Sections

### `Hero/HeroCanvas.ts`
**Responsibility:** Pure canvas animation — no React, no DOM outside the canvas element. Exported as a class or factory function so it can be started/stopped from `useEffect`.

```ts
export class HeroCanvas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private t = 0;
  private rafId = 0;
  private orbs = [ /* 6 orb configs */ ];
  private particles = [ /* 55 particle configs */ ];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
  }

  resize() {
    this.canvas.width  = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
  }

  start() { this.loop(); }
  stop()  { cancelAnimationFrame(this.rafId); }

  private loop() {
    this.t++;
    this.draw();
    this.rafId = requestAnimationFrame(() => this.loop());
  }

  private draw() { /* clear → fill #0C0C10 → draw orbs → draw particles */ }
}
```

**Orb config** (6 entries):

| # | Color | cx | cy | ax | ay | ωx | ωy | radius |
|---|-------|----|----|----|----|-----|-----|--------|
| 1 | `201,169,110` | .30 | .70 | .28 | .18 | .00034 | .00027 | .48 |
| 2 | `135,157,184` | .76 | .24 | .21 | .22 | .00027 | .00041 | .37 |
| 3 | `192,122,101` | .55 | .54 | .17 | .27 | .00044 | .00021 | .26 |
| 4 | `244,239,230` | .13 | .34 | .11 | .17 | .00019 | .00037 | .23 |
| 5 | `110,255,212` | .87 | .81 | .13 | .11 | .00054 | .00029 | .19 |
| 6 | `201,169,110` | .50 | .10 | .34 | .13 | .00029 | .00054 | .42 |

Each orb position per frame:
```ts
x = (cx + ax * Math.sin(ωx * t + phase)) * canvasWidth
y = (cy + ay * Math.sin(ωy * t + phase * 0.7)) * canvasHeight
```

Radial gradient stops: `rgba(r,g,b, 0.17)` → `rgba(r,g,b, 0.07)` at 45% → `rgba(r,g,b, 0)` at edge.

**55 particles:** `x, y` normalized 0–1. Each frame: `x += vx; y += vy`. Wrap at 0/1. Size `0.4–1.8px`. Alpha `0.04–0.28`.

---

### `Hero/Hero.tsx`
**Responsibility:** Full-viewport hero. Mounts `HeroCanvas`, runs entry animation sequence, applies scroll parallax to content.

**Canvas mount:**
```tsx
const canvasRef = useRef<HTMLCanvasElement>(null);
useEffect(() => {
  if (!canvasRef.current) return;
  const instance = new HeroCanvas(canvasRef.current);
  instance.resize();
  instance.start();
  const onResize = () => instance.resize();
  window.addEventListener('resize', onResize);
  return () => { instance.stop(); window.removeEventListener('resize', onResize); };
}, []);
```

**Parallax on content:**
```tsx
const { scrollY } = useScroll();
const y       = useTransform(scrollY, [0, vh], [0, vh * 0.22]);
const opacity = useTransform(scrollY, [0, vh * 0.58], [1, 0]);
// vh = window.innerHeight, captured once on mount
```

**Letter animation** — `staggerChildren: 0.09`, each letter `fadeUp` variant but with `y: '115%'` and `rotate: 4`. Set `overflow: hidden` on the title wrapper so letters aren't visible before animating in.

**Entry sequence — delays:**
```
Letters:   0.08s base, +0.09s per letter
Subtitle:  1.30s
Tagline:   1.55s
Nav:       1.80s  ← Nav animates itself (opacity 0→1 on mount)
Scroll ind: 2.20s
Year tag:  2.20s
Line draw: 2.80s
```

**SCSS — `Hero.module.scss`:**
```scss
.section {
  position: relative;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 var(--page-pad) 8vh;
  overflow: hidden;
}
.canvas {
  position: absolute;
  inset: 0; width: 100%; height: 100%;
  z-index: 0;
}
.content { position: relative; z-index: 1; }
.title {
  font-family: var(--font-display);
  font-weight: 300;
  font-size: clamp(80px, 16vw, 210px);
  line-height: 0.88;
  letter-spacing: -0.025em;
  overflow: hidden;   // ← required for letter clip
}
.letter { display: inline-block; }
.subtitle {
  font-family: var(--font-sans);
  font-size: 10px;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: var(--ivory-dim);
  margin-top: 26px;
}
.tagline {
  font-family: var(--font-display);
  font-style: italic;
  font-size: clamp(17px, 2.2vw, 30px);
  color: rgba(201,169,110,0.65);
  margin-top: 14px;
}
.scrollIndicator {
  position: absolute;
  bottom: 44px; left: var(--page-pad);
  display: flex; align-items: center; gap: 18px;
}
.scrollLine {
  width: 44px; height: 1px;
  background: var(--ivory-dim);
  transform-origin: left;
}
.scrollLabel {
  font-family: var(--font-body);
  font-size: 9px; letter-spacing: 0.35em; text-transform: uppercase;
  color: var(--ivory-dim);
}
.yearTag {
  position: absolute;
  bottom: 44px; right: var(--page-pad);
  font-family: var(--font-display);
  font-size: 11px; letter-spacing: 0.2em;
  color: rgba(244,239,230,0.18);
  writing-mode: vertical-rl;
}
```

---

### `Breath/Breath.tsx`
**Responsibility:** Static two-column editorial section. No animation logic (handled by `<Reveal>`). No canvas. No JS.

**Layout:** CSS Grid, `grid-template-columns: 1fr 1fr`, `align-items: center`, `gap: 72px`.

**Ghost number** `"01"`: `position: absolute`, decorative, `z-index: 0`.

**SCSS — key rules:**
```scss
.section {
  position: relative;
  min-height: 100vh;
  background: var(--deep);
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 72px;
  padding: var(--section-v) var(--page-pad);
}
.ghostNumber {
  position: absolute;
  top: -0.05em; right: var(--page-pad);
  font-family: var(--font-display);
  font-weight: 200;
  font-size: clamp(180px, 28vw, 380px);
  color: rgba(244,239,230,0.025);
  pointer-events: none;
  user-select: none;
  z-index: 0;
  line-height: 1;
}
.heading {
  font-family: var(--font-display);
  font-weight: 300;
  font-size: clamp(34px, 4.8vw, 66px);
  line-height: 1.1;
  letter-spacing: -0.01em;

  em { font-style: italic; color: var(--blue); }
}
.body {
  font-family: var(--font-body);
  font-weight: 200;
  font-size: clamp(14px, 1.4vw, 17px);
  line-height: 1.85;
  color: var(--ivory-dim);
  margin-top: 32px;
}
.aside {
  font-family: var(--font-display);
  font-style: italic;
  font-size: clamp(18px, 2.2vw, 30px);
  line-height: 1.45;
  color: rgba(244,239,230,0.30);
  border-left: 1px solid rgba(244,239,230,0.09);
  padding-left: 40px;
}
// Responsive
@media (max-width: 768px) {
  .section { grid-template-columns: 1fr; }
  .aside { border-left: none; padding-left: 0; margin-top: 40px; border-top: 1px solid rgba(244,239,230,0.09); padding-top: 32px; }
}
```

---

### `Current/Current.tsx`
**Responsibility:** Animated mesh gradient section. The mesh is pure CSS (`@keyframes`). No JS animation.

**SCSS — mesh animation:**
```scss
.section {
  position: relative;
  min-height: 100vh;
  background: var(--graphite);
  display: flex;
  align-items: center;
  padding: var(--section-v) var(--page-pad);
  overflow: hidden;
}
.mesh {
  position: absolute; inset: 0;
  animation: meshShift 14s ease-in-out infinite alternate;
}
@keyframes meshShift {
  from {
    background:
      radial-gradient(ellipse 65% 55% at 18% 72%, rgba(192,122,101,0.14) 0%, transparent 70%),
      radial-gradient(ellipse 55% 65% at 78% 28%, rgba(135,157,184,0.11) 0%, transparent 70%),
      radial-gradient(ellipse 45% 45% at 52% 52%, rgba(201,169,110,0.07) 0%, transparent 70%);
  }
  to {
    background:
      radial-gradient(ellipse 55% 65% at 42% 28%, rgba(192,122,101,0.11) 0%, transparent 70%),
      radial-gradient(ellipse 65% 55% at 68% 72%, rgba(135,157,184,0.14) 0%, transparent 70%),
      radial-gradient(ellipse 55% 55% at 28% 58%, rgba(201,169,110,0.09) 0%, transparent 70%);
  }
}
.heading {
  font-family: var(--font-display);
  font-weight: 300;
  font-size: clamp(52px, 9.5vw, 134px);
  line-height: 0.9;
  letter-spacing: -0.025em;

  .accent { font-style: italic; color: var(--coral); display: block; }
}
.statsRow {
  display: flex;
  gap: 48px;
  margin-top: 60px;
  flex-wrap: wrap;
}
.stat {
  border-top: 1px solid rgba(244,239,230,0.08);
  padding-top: 18px;
  min-width: 110px;
}
.statValue {
  font-family: var(--font-display);
  font-size: clamp(28px, 3.2vw, 46px);
  font-weight: 300;
}
.statLabel {
  font-size: 9px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--ivory-dim);
  opacity: 0.5;
  margin-top: 6px;
}
```

Heading words: each word wrapped in `<motion.span style={{ display: 'block' }}>` with `staggerChildren: 0.12` on parent. Uses shared `fadeUp` variant.

---

### `Resonance/Tile.tsx`
**Responsibility:** Individual tile. Handles its own hover state. Accepts `name`, `description`, and `gradientIndex: 1–6` (selects the SCSS modifier class).

**Hover:** `whileHover` on the container `motion.div` — `y: -5`, border transition via CSS. Inner `.bg` element: separate `motion.div` with `whileHover={{ scale: 1.06 }}`. Description: CSS transition (`opacity 0→0.72`, `translateY 7px→0`) driven by `:hover` on the parent — no JS needed for this.

**6 tile backgrounds** — SCSS modifier classes (`.tile--1` through `.tile--6`):

```scss
// gradient compositions — example:
.tile--1 .bg {
  background:
    radial-gradient(ellipse 70% 70% at 30% 40%, rgba(201,169,110,0.22) 0%, transparent 70%),
    radial-gradient(ellipse 60% 60% at 72% 68%, rgba(135,157,184,0.14) 0%, transparent 70%),
    linear-gradient(135deg, #1A1510, #0C0C10);
}
// ... tiles 2–6 vary orb colors, positions, base color
```

**6 tile gradient reference:**

| Tile | Name | Primary orb | Primary pos | Secondary orb | Base |
|------|------|-------------|-------------|---------------|------|
| 1 | Echo | Champagne .22 | 30% 40% | Blue .14 | #1A1510 |
| 2 | Drift | Coral .19 | 62% 28% | Champagne .10 | #151210 |
| 3 | Pulse | Blue .19 | 50% 20% | Electric .07 | #101318 |
| 4 | Veil | Coral .14 | 22% 60% | Blue .17 | #121218 |
| 5 | Surge | Champagne .17 | 42% 50% | Coral .11 | #181410 |
| 6 | Haze | Electric .07 | 60% 58% | Blue .12 | #0E1218 |

**SCSS — `Tile.module.scss`:**
```scss
.tile {
  position: relative;
  aspect-ratio: 4/3;
  border-radius: 3px;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid rgba(244,239,230,0.055);
  transition: border-color 0.4s ease;
}
.bg {
  position: absolute; inset: 0;
  // gradient set per modifier class
}
.scrim {
  position: absolute; inset: 0;
  background: rgba(12,12,16,0.28);
  transition: background 0.4s;
}
.content {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  padding: 22px;
  background: linear-gradient(to top, rgba(10,10,14,0.85) 0%, transparent 100%);
}
.name {
  font-family: var(--font-sans);
  font-weight: 700;
  font-size: 9px;
  letter-spacing: 0.42em;
  text-transform: uppercase;
  opacity: 0.6;
  transition: opacity 0.3s;
}
.desc {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 15px;
  opacity: 0;
  transform: translateY(7px);
  transition: opacity 0.4s, transform 0.4s ease;
}
.tile:hover .scrim   { background: rgba(12,12,16,0.08); }
.tile:hover .name    { opacity: 1; }
.tile:hover .desc    { opacity: 0.72; transform: translateY(0); }
```

---

### `Resonance/Resonance.tsx`
**Responsibility:** Renders the 6-tile grid with staggered entry animation. Composes `<Tile>` and `<SectionLabel>`.

Grid entry: `motion.div` with `variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}`. Each `<Tile>` wrapped in a `motion.div` using shared `fadeUp` variant. `whileInView` on the grid parent.

---

### `Threshold/Threshold.tsx`
**Responsibility:** The centrepiece "Before / After" section. Three animated elements: ghost text above, line that draws itself, ghost text below.

**Line draw animation:**
```tsx
<motion.div
  className={s.line}
  style={{ scaleX: 0, originX: 0 }}
  whileInView={{ scaleX: 1 }}
  viewport={{ once: true }}
  transition={{ duration: 1.4, ease: ease.out }}
/>
```

**Center label** on the line: `position: absolute`, `left: 50%`, `transform: translateX(-50%)`. Background `var(--deep-blue)` masks the line behind the text. Fades in with `delay: 1.2` after line starts drawing.

**SCSS:**
```scss
.section {
  min-height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: var(--deep-blue);
  overflow: hidden;
}
.glow {
  position: absolute;
  width: 650px; height: 650px; border-radius: 50%;
  background: radial-gradient(circle, rgba(201,169,110,0.055) 0%, transparent 70%);
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  animation: pulseGlow 4.5s ease-in-out infinite;
}
@keyframes pulseGlow {
  0%, 100% { transform: translate(-50%,-50%) scale(1); opacity: 1; }
  50%       { transform: translate(-50%,-50%) scale(1.18); opacity: 0.55; }
}
.textAbove {
  font-family: var(--font-display);
  font-weight: 200;
  font-size: clamp(80px, 18vw, 270px);
  line-height: 0.9; letter-spacing: -0.04em;
  color: rgba(244,239,230,0.07);
  text-align: center;
  padding: 48px 0;
}
.lineWrap {
  width: 100%;
  padding: 0 var(--page-pad);
  position: relative;
}
.line {
  width: 100%; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(201,169,110,0.6), rgba(135,157,184,0.4), transparent);
}
.lineLabel {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  background: var(--deep-blue);
  padding: 0 28px;
  white-space: nowrap;
  font-family: var(--font-body);
  font-size: clamp(10px, 1vw, 13px);
  letter-spacing: 0.45em;
  text-transform: uppercase;
  color: var(--champagne);
}
.textBelow {
  // same as textAbove but color: rgba(135,157,184,0.08)
}
```

---

### `Verse/Verse.tsx`
**Responsibility:** Typographic poem. Static layout — all animation via `<Reveal>`. No JS.

**Line data:** Define as a typed array, render in a loop to keep JSX clean.

```ts
type VerseLine = {
  text: string;
  size: 'xl' | 'lg' | 'md';
  indent?: 1 | 2;
  color?: 'coral' | 'blue' | 'champagne';
  italic?: boolean;
  spacerBefore?: 'sm' | 'lg';
  revealDelay?: number;
};

const lines: VerseLine[] = [
  { text: 'You arrived', size: 'xl' },
  { text: 'already luminous.', size: 'lg', indent: 1 },
  { text: 'The world', size: 'xl', spacerBefore: 'lg' },
  { text: 'asked you to forget this.', size: 'md', indent: 1, color: 'coral', italic: true },
  { text: 'We are not the world.', size: 'lg', indent: 2 },
  { text: 'Somewhere between what was', size: 'md', indent: 1, color: 'blue', italic: true, spacerBefore: 'lg' },
  { text: 'and what will be —', size: 'md', indent: 1, italic: true },
  { text: 'you are', size: 'xl', color: 'champagne', spacerBefore: 'sm' },
  { text: 'happening.', size: 'xl' },
];
```

**SCSS — sizes and indents:**
```scss
.lineXl { font-size: clamp(44px, 7.5vw, 108px); letter-spacing: -0.025em; color: var(--ivory); }
.lineLg { font-size: clamp(28px, 4.2vw, 62px); color: rgba(244,239,230,0.48); letter-spacing: -0.015em; }
.lineMd { font-size: clamp(20px, 2.6vw, 40px); color: rgba(244,239,230,0.28); font-style: italic; }

.indent1 { padding-left: clamp(44px, 8.5vw, 170px); }
.indent2 { padding-left: clamp(88px, 17vw, 340px); }

.colorCoral    { color: var(--coral);     opacity: 0.68; }
.colorBlue     { color: var(--blue);      opacity: 0.58; }
.colorChampagne{ color: var(--champagne); opacity: 0.50; }
// All lines: font-family: var(--font-display); font-weight: 300; line-height: 1.22;
```

---

### `Origin/Origin.tsx`
**Responsibility:** Email capture. Centered layout. Manages submit state (`idle | loading | done`).

```tsx
type SubmitState = 'idle' | 'loading' | 'done';
const [state, setState] = useState<SubmitState>('idle');
```

Button label: `idle → "Receive"`, `loading → "···"`, `done → "✓ Received"`. Brief crossfade between states using `<AnimatePresence>` and `motion.span`.

---

## Implementation Phases

---

### Phase 1 — Hero

**Goal:** Pixel-perfect hero with canvas, entry animation, and parallax. Everything else is placeholders.

**Checklist:**
- [ ] Set up `styles/global.scss` with reset, CSS tokens, font import (Google Fonts)
- [ ] Set up `tokens/` — `colors.ts`, `motion.ts`, `typography.ts`
- [ ] Implement `HeroCanvas.ts` — class with `start()`, `stop()`, `resize()`. Test orbs render.
- [ ] Implement `Hero.tsx` — canvas mount via `useEffect`, letter stagger animation, subtitle/tagline fade-in
- [ ] Add scroll parallax — `useScroll` + `useTransform` on content wrapper
- [ ] Implement `Cursor.tsx` — dot snaps, ring springs, hover expand
- [ ] Implement `Nav.tsx` — static layout, fade-in delay `1.8s`
- [ ] Mount in `layout.tsx`: `<Cursor>`, grain `<div>`, progress bar, `<Nav>`
- [ ] Implement `useScrollProgress.ts` and wire to progress bar
- [ ] Test on Safari — check canvas performance, check `position: fixed` cursor
- [ ] Test `prefers-reduced-motion` — canvas should stop, letters should not animate

**Acceptance:** Canvas glows, letters arrive in sequence, content parallaxes out on scroll, cursor tracks correctly.

---

### Phase 2 — Scroll Sections

**Goal:** All six sections rendered with correct visual design. No animation yet (sections are visible static).

**Checklist:**
- [ ] Implement `Reveal.tsx` — `whileInView` with `once: true`
- [ ] Implement `SectionLabel.tsx` + `SectionDivider.tsx`
- [ ] Build `Breath.tsx` — two-column grid, all typography, ghost number
- [ ] Build `Current.tsx` — mesh CSS animation, heading, stats row
- [ ] Build `Tile.tsx` — all 6 gradient variants, hover state (CSS only first)
- [ ] Build `Resonance.tsx` — grid layout, compose Tiles
- [ ] Build `Threshold.tsx` — static layout first (line not animated yet)
- [ ] Build `Verse.tsx` — data-driven line renderer, all SCSS size/indent classes
- [ ] Build `Origin.tsx` — email form, submit state machine
- [ ] Compose all sections in `page.tsx` with `<SectionDivider>` between each
- [ ] Visual QA pass — check all colors, spacing, font weights against token spec

**Acceptance:** Full page renders top to bottom. Every section looks correct. No scroll animation yet.

---

### Phase 3 — Motion System

**Goal:** All scroll animations, hover effects, and micro-interactions live. Page feels like it breathes.

**Checklist:**
- [ ] Wrap each section's children in `<Reveal delay={n}>` — stagger per section
- [ ] Breath: 4 children with `0 / 0.15 / 0.30 / 0.45s` delays
- [ ] Current: label, each heading word (`staggerChildren: 0.12`), body, stats (`0.45/0.60/0.75s`)
- [ ] Resonance: label + title, then grid with `staggerChildren: 0.08`
- [ ] Threshold: "Before" fade-up → line draw (`1.4s`) → "After" (`delay: 0.3s`) → label (`delay: 1.2s`)
- [ ] Verse: each line as individual `<Reveal>` with sequential delays
- [ ] Origin: 4 children staggered
- [ ] Tile hover: add `whileHover` to container and `.bg` inner element (Framer)
- [ ] Canvas: pause when `document.hidden` (Page Visibility API)
- [ ] Grain: CSS only — verify `steps(1)` flicker is working
- [ ] Cursor hover expand: wire `data-hover` attribute to Tile, Nav links

**Acceptance:** Page feels alive on scroll. Every section enters gracefully. Tiles respond to hover.

---

### Phase 4 — Responsive Polish

**Goal:** All breakpoints work. Mobile nav implemented. No layout breaks.

**Checklist:**
- [ ] `768px` — Breath collapses to single column. Aside gets top border, loses left border.
- [ ] `900px` — Resonance grid switches to `repeat(2, 1fr)`.
- [ ] `600px` — Resonance grid switches to `1fr`.
- [ ] `768px` — Nav links hidden, hamburger shown. Full-screen overlay menu.
- [ ] Mobile nav overlay — staggered link entry, close on link click or `Escape`
- [ ] `768px` — Verse indent-2 reduces to same as indent-1 (collapsing deep indentation)
- [ ] All `clamp()` values — verify nothing breaks at `320px` minimum
- [ ] Cursor — hide on touch devices: `@media (hover: none) { .dot, .ring { display: none; } }`
- [ ] Canvas — set `canvas.style.imageRendering = 'pixelated'` not needed; verify no blurriness at 1x pixel ratio
- [ ] Test on actual iOS Safari — fixed elements, viewport height (`100dvh` vs `100vh`)

**Acceptance:** Looks correct at 320px, 375px, 768px, 1024px, 1440px, 1920px. Touch cursor hidden.

---

### Phase 5 — Performance Polish

**Goal:** Smooth 60fps on mid-range hardware. Fast initial load. No jank.

**Checklist:**
- [ ] Canvas: detect `prefers-reduced-motion` — stop `rAF` loop, show static gradient fallback
- [ ] Canvas: reduce particle count on `window.devicePixelRatio < 1.5` or slow connection (`navigator.connection.effectiveType`)
- [ ] Canvas: only run when `IntersectionObserver` reports Hero is in viewport. Stop when scrolled past.
- [ ] All `motion.div` elements with `transform`: add `will-change: transform` only during active animation, remove after. Use `onAnimationComplete` to unset.
- [ ] SCSS: audit for any `box-shadow` or `filter` on animated elements — move to separate layers
- [ ] Fonts: add `<link rel="preconnect">` for Google Fonts. Subset to weights actually used.
- [ ] Images: none in this design — skip
- [ ] Lazy load: sections below fold can use React `lazy` + `Suspense` if bundle size warrants it (likely not needed)
- [ ] `useScrollProgress`: ensure listener is `{ passive: true }`
- [ ] Test with Chrome DevTools — Performance tab, target 60fps during scroll, no long tasks on main thread
- [ ] Test with Lighthouse — target 90+ Performance score

**Acceptance:** Smooth scroll at 60fps on a mid-2019 MacBook. No visible jank. Lighthouse ≥ 90.

---

## Component Responsibility Summary

| Component | Renders | Owns state | Owns animation |
|-----------|---------|-----------|---------------|
| `HeroCanvas` | Canvas element (class, not component) | No — mutable ref | rAF loop |
| `Hero` | Canvas + title + subtitle + indicators | No | Entry sequence, parallax |
| `Cursor` | Dot + ring | Mouse position (ref) | Spring tracking |
| `Nav` | Logo + links | Mobile open (bool) | Mount fade-in |
| `Reveal` | Wrapper div | No | whileInView fadeUp |
| `SectionLabel` | Eyebrow line + text | No | None (parent Reveal handles it) |
| `SectionDivider` | 1px hr | No | None |
| `Breath` | Two-column editorial | No | None (Reveal) |
| `Current` | Mesh bg + heading + stats | No | CSS mesh, Framer heading stagger |
| `Resonance` | Label + title + grid | No | Grid stagger |
| `Tile` | Single tile with hover | No | Framer whileHover |
| `Threshold` | Ghost text + line + label | No | Line draw, text reveals |
| `Verse` | Poem lines | No | None (Reveal per line) |
| `Origin` | Email form | Submit state | Reveal, button state crossfade |
| `useScrollProgress` | — | scrollYProgress (MotionValue) | — |
| `useReducedMotion` | — | reduced (bool) | — |
