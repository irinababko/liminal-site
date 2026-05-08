import { motion, useScroll, useTransform, useMotionValueEvent, useAnimation, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ease } from '@/tokens/motion';
import s from './Verse.module.scss';

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
  { text: 'You arrived',                     size: 'xl' },
  { text: 'already luminous.',               size: 'lg', indent: 1 },
  { text: 'The world',                       size: 'xl', spacerBefore: 'lg' },
  { text: 'asked you to forget this.',       size: 'md', indent: 1, color: 'coral',     italic: true },
  { text: 'We are not the world.',           size: 'lg', indent: 2 },
  { text: 'Somewhere between what was',      size: 'md', indent: 1, color: 'blue',      italic: true, spacerBefore: 'lg' },
  { text: 'and what will be —',             size: 'md', indent: 1,                     italic: true },
  { text: 'you are',                         size: 'xl', color: 'champagne',            spacerBefore: 'sm' },
  { text: 'happening.',                      size: 'xl' },
];

const sizeClass   = { xl: s.lineXl, lg: s.lineLg, md: s.lineMd } as const;
const indentClass = { 1: s.indent1, 2: s.indent2 } as const;
const colorClass  = { coral: s.colorCoral, blue: s.colorBlue, champagne: s.colorChampagne } as const;
const spacerClass = { sm: s.spacerSm, lg: s.spacerLg } as const;

// ── Per-line component ────────────────────────────────
// Owns two animation phases:
//   1. Reveal — blur + y + opacity, fires once on viewport entry
//   2. Dimming — opacity only, responds to reading position

interface LineItemProps {
  index: number;
  activeIndex: number;
  classes: string;
  delay: number;
  reduced: boolean;
  children: string;
}

function LineItem({ index, activeIndex, classes, delay, reduced, children }: LineItemProps) {
  const ref      = useRef<HTMLParagraphElement>(null);
  const controls = useAnimation();
  const [hasRevealed, setHasRevealed] = useState(false);
  const isInView  = useInView(ref, { once: true, margin: '-80px' });

  // Phase 1 — reveal: runs once when line enters the viewport
  useEffect(() => {
    if (!isInView || hasRevealed) return;

    let cancelled = false;
    const run = async () => {
      await controls.start(
        reduced
          ? { opacity: 1,                                transition: { duration: 0.45, ease: ease.out } }
          : { opacity: 1, y: 0, filter: 'blur(0px)',    transition: { duration: 0.9,  ease: ease.out, delay } }
      );
      if (!cancelled) setHasRevealed(true);
    };
    run();
    return () => { cancelled = true; };
  }, [isInView, hasRevealed, controls, delay, reduced]);

  // Phase 2 — dimming: updates reading-position opacity after reveal
  useEffect(() => {
    if (!hasRevealed) return;
    const isPast    = activeIndex > index;
    const isCurrent = activeIndex === index;
    const opacity   = isPast ? 0.2 : isCurrent ? 1 : 0.62;
    controls.start({ opacity, transition: { duration: 0.7, ease: ease.out } });
  }, [activeIndex, hasRevealed, index, controls]);

  return (
    <motion.p
      ref={ref}
      className={classes}
      initial={reduced
        ? { opacity: 0 }
        : { opacity: 0, y: 40, filter: 'blur(12px)' }
      }
      animate={controls}
    >
      {children}
    </motion.p>
  );
}

// ── Section ───────────────────────────────────────────

export function Verse() {
  const reduced    = useReducedMotion() === true;
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start center', 'end center'],
  });

  // Scroll-driven glow travels downward with the reading position
  const glowY = useTransform(scrollYProgress, [0, 1], [0, 500]);

  // Update active line — only triggers re-render when index actually changes
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const next = Math.max(0, Math.min(lines.length - 1, Math.round(latest * (lines.length - 1))));
    setActiveIndex(prev => (prev === next ? prev : next));
  });

  return (
    <section ref={sectionRef} className={s.section}>

      <div className={s.bgImage} aria-hidden="true" />

      {/* Reading-light glow — follows scroll progress */}
      <motion.div
        className={s.scrollGlow}
        style={reduced ? undefined : { y: glowY }}
        aria-hidden="true"
      />

      {/* Floating atmospheric orbs */}
      <div className={s.orb1} aria-hidden="true" />
      <div className={s.orb2} aria-hidden="true" />
      <div className={s.orb3} aria-hidden="true" />

      <div className={s.poem}>
        {lines.map((line, i) => {
          const classes = [
            s.line,
            sizeClass[line.size],
            ...(line.indent ? [indentClass[line.indent]] : []),
            ...(line.color  ? [colorClass[line.color]]  : []),
            ...(line.italic ? [s.italic]                : []),
          ].join(' ');

          return (
            <div key={line.text}>
              {line.spacerBefore && (
                <div className={spacerClass[line.spacerBefore]} aria-hidden="true" />
              )}
              <LineItem
                index={i}
                activeIndex={activeIndex}
                classes={classes}
                delay={line.revealDelay ?? i * 0.07}
                reduced={reduced}
              >
                {line.text}
              </LineItem>
            </div>
          );
        })}
      </div>
    </section>
  );
}
