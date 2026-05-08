import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

// ── Constants ──────────────────────────────────────────────────────────────
const SNAP_DEBOUNCE_MS = 160;
const SNAP_THRESHOLD   = 0.42; // fraction of viewport — snap fires within 42% vh of a section top
const SNAP_DURATION    = 1.1;  // seconds

const lenisEasing = (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t));
const snapEasing  = (t: number) => 1 - Math.pow(1 - t, 3); // cubic ease-out — slightly softer than lenis default

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

// ── Section query ──────────────────────────────────────────────────────────
function getSnapSections(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('[data-snap-section]'));
}

// ── Keys that trigger page scroll ─────────────────────────────────────────
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

    // ── Snap logic ──────────────────────────────────────────────────────
    let snapTimer: ReturnType<typeof setTimeout> | null = null;
    let isSnapping = false;

    function doSnap() {
      if (isSnapping || isFormActive() || isTouchPrimary()) return;

      const scrollY    = window.scrollY;
      const threshold  = window.innerHeight * SNAP_THRESHOLD;
      const sections   = getSnapSections();

      let target: HTMLElement | null = null;
      let nearestDist  = Infinity;

      for (const section of sections) {
        const sectionTop = scrollY + section.getBoundingClientRect().top;
        const dist       = Math.abs(sectionTop - scrollY);

        // Skip if already aligned or beyond the snap range
        if (dist <= 5 || dist >= threshold) continue;

        if (dist < nearestDist) {
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

      // Release lock once the animation has finished
      setTimeout(() => { isSnapping = false; }, (SNAP_DURATION + 0.3) * 1000);
    }

    function scheduleSnap() {
      // If user scrolls during a snap, cancel it so they can scroll freely
      if (isSnapping) isSnapping = false;
      if (snapTimer) clearTimeout(snapTimer);
      snapTimer = setTimeout(doSnap, SNAP_DEBOUNCE_MS);
    }

    function onWheel() {
      scheduleSnap();
    }

    function onKeyDown(e: KeyboardEvent) {
      if (SCROLL_KEYS.has(e.key) && !isFormActive()) scheduleSnap();
    }

    window.addEventListener('wheel',   onWheel,   { passive: true });
    window.addEventListener('keydown', onKeyDown);

    return () => {
      cancelAnimationFrame(rafId);
      if (snapTimer) clearTimeout(snapTimer);
      window.removeEventListener('wheel',   onWheel);
      window.removeEventListener('keydown', onKeyDown);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return lenisRef;
}
