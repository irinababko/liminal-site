import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

// ── Constants ──────────────────────────────────────────────────────────────
const SNAP_THRESHOLD     = 0.18;  // fraction of viewport — only snap within 18% vh of a section top
const SNAP_DURATION      = 0.7;   // seconds — short enough to feel continuous
const WHEEL_IDLE_MS      = 60;    // ms after last wheel event before "wheel has paused"
const VELOCITY_THRESHOLD = 150;   // px/s — below this, Lenis is coasting nearly to a stop

const lenisEasing = (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t));
const snapEasing  = (t: number) => 1 - Math.pow(1 - t, 3); // cubic ease-out

// ── Guards ─────────────────────────────────────────────────────────────────
function isFormActive(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select';
}

function isTouchPrimary(): boolean {
  return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
}

function getSnapSections(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('[data-snap-section]'));
}

const SCROLL_KEYS = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', ' ']);

// ── Hook ───────────────────────────────────────────────────────────────────
export function useLenis() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const lenis = new Lenis({
      duration:        1.2,
      smoothWheel:     true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.0,
      easing:          lenisEasing,
    });

    lenisRef.current = lenis;

    // ── RAF loop ────────────────────────────────────────────────────────
    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // ── Velocity-based section snap ─────────────────────────────────────
    // Fires from the Lenis scroll event every RAF tick. When velocity
    // has dropped below the threshold AND the user hasn't wheeled recently,
    // we know the scroll is coasting to a natural stop. If a section
    // boundary is within the snap zone at that moment, glide to it.
    // This avoids any visible debounce pause — the snap merges with the
    // end of the Lenis deceleration curve.

    let isSnapping    = false;
    let lastWheelTime = 0;

    lenis.on('scroll', (l: Lenis) => {
      if (isSnapping || isFormActive() || isTouchPrimary()) return;

      const now       = Date.now();
      const wheelIdle = now - lastWheelTime > WHEEL_IDLE_MS;
      const velLow    = Math.abs(l.velocity) < VELOCITY_THRESHOLD;

      // Only act when wheel input has paused and Lenis is nearly coasting to stop
      if (!wheelIdle || !velLow) return;

      const scroll    = l.scroll;
      const threshold = window.innerHeight * SNAP_THRESHOLD;

      let target: HTMLElement | null = null;
      let nearestDist = Infinity;

      for (const section of getSnapSections()) {
        const sectionTop = scroll + section.getBoundingClientRect().top;
        const dist       = Math.abs(sectionTop - scroll);
        if (dist > 5 && dist < threshold && dist < nearestDist) {
          nearestDist = dist;
          target      = section;
        }
      }

      if (!target) return;

      isSnapping = true;
      lenis.scrollTo(target, {
        duration: SNAP_DURATION,
        easing:   snapEasing,
        offset:   0,
      });

      // Release lock once snap animation finishes
      setTimeout(() => { isSnapping = false; }, (SNAP_DURATION + 0.2) * 1000);
    });

    // ── User input tracking ─────────────────────────────────────────────
    function onUserInput() {
      lastWheelTime = Date.now();
      // User scrolling overrides any in-progress snap
      if (isSnapping) isSnapping = false;
    }

    function onKeyDown(e: KeyboardEvent) {
      if (SCROLL_KEYS.has(e.key) && !isFormActive()) onUserInput();
    }

    window.addEventListener('wheel',   onUserInput, { passive: true });
    window.addEventListener('keydown', onKeyDown);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('wheel',   onUserInput);
      window.removeEventListener('keydown', onKeyDown);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return lenisRef;
}
