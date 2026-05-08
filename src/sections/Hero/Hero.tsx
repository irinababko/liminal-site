import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { HeroCanvas } from './HeroCanvas';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ease, dur, stagger } from '@/tokens/motion';
import s from './Hero.module.scss';

const TITLE = 'LIMINAL';

export function Hero() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const reduced    = useReducedMotion() === true;
  const [vh]       = useState(() => window.innerHeight);

  const { scrollY } = useScroll();
  const contentY       = useTransform(scrollY, [0, vh],        [0, vh * 0.22]);
  const contentOpacity = useTransform(scrollY, [0, vh * 0.58], [1, 0]);

  /* ── Mouse parallax MotionValues ─────────────────── */
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const r1X  = useSpring(useTransform(mouseX, [-0.5, 0.5], [14, -14]),  { stiffness: 55, damping: 28 });
  const r1Y  = useSpring(useTransform(mouseY, [-0.5, 0.5], [9,  -9]),   { stiffness: 55, damping: 28 });
  const r2X  = useSpring(useTransform(mouseX, [-0.5, 0.5], [20, -20]),  { stiffness: 42, damping: 24 });
  const r2Y  = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]),  { stiffness: 42, damping: 24 });
  const r3X  = useSpring(useTransform(mouseX, [-0.5, 0.5], [9,  -9]),   { stiffness: 65, damping: 32 });
  const r3Y  = useSpring(useTransform(mouseY, [-0.5, 0.5], [6,  -6]),   { stiffness: 65, damping: 32 });

  /* ── Canvas ───────────────────────────────────────── */
  useEffect(() => {
    if (!canvasRef.current) return;
    const instance = new HeroCanvas(canvasRef.current);
    instance.resize();
    if (!reduced) instance.start();
    const onResize = () => instance.resize();
    window.addEventListener('resize', onResize);
    return () => {
      instance.stop();
      window.removeEventListener('resize', onResize);
    };
  }, [reduced]);

  /* ── Mouse listener — no React re-renders ─────────── */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || reduced) return;
    const onMove = (e: MouseEvent) => {
      const { left, top, width, height } = el.getBoundingClientRect();
      mouseX.set((e.clientX - left) / width  - 0.5);
      mouseY.set((e.clientY - top)  / height - 0.5);
    };
    const onLeave = () => { mouseX.set(0); mouseY.set(0); };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [reduced, mouseX, mouseY]);

  /* ── Variants ─────────────────────────────────────── */
  const titleContainerVariants = {
    hidden:  {},
    visible: { transition: { staggerChildren: stagger.hero, delayChildren: 0.08 } },
  };

  const letterVariants = {
    hidden:  { opacity: reduced ? 1 : 0, y: reduced ? '0%' : '115%', rotate: reduced ? 0 : 4 },
    visible: {
      opacity: 1, y: '0%', rotate: 0,
      transition: { duration: dur.base, ease: ease.out },
    },
  };

  return (
    <section ref={sectionRef} className={s.section}>
      <canvas ref={canvasRef} className={s.canvas} />

      {/* CSS gradient flow — primary visible background animation */}
      <div className={s.bgLayers} aria-hidden="true">
        <div className={s.bgAurora} />
        <div className={s.bgNebula} />
        <div className={s.bgPulse} />
      </div>

      {/* Atmospheric ribbons — behind content */}
      <div className={s.ribbons} aria-hidden="true">
        <motion.div style={{ x: r1X, y: r1Y }} className={s.ribbonWrap}>
          <div className={s.ribbon1} />
        </motion.div>
        <motion.div style={{ x: r2X, y: r2Y }} className={s.ribbonWrap}>
          <div className={s.ribbon2} />
        </motion.div>
        <motion.div style={{ x: r3X, y: r3Y }} className={s.ribbonWrap}>
          <div className={s.ribbon3} />
        </motion.div>
      </div>

      {/* One-shot horizontal light sweep */}
      <div className={s.lightSweep} aria-hidden="true" />

      {/* Content */}
      <motion.div className={s.content} style={{ y: contentY, opacity: contentOpacity }}>
        <motion.h1
          className={s.title}
          variants={titleContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {TITLE.split('').map((char, i) => (
            <motion.span key={i} className={s.letter} variants={letterVariants}>
              {char}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p
          className={s.subtitle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: dur.base, ease: ease.out, delay: 1.30 }}
        >
          Between what was and what will be
        </motion.p>

        <motion.p
          className={s.tagline}
          initial={{ opacity: 0, y: reduced ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: dur.base, ease: ease.out, delay: 1.55 }}
        >
          Where becoming begins.
        </motion.p>
      </motion.div>

      {/* Scroll indicator */}
      <div className={s.scrollIndicator}>
        <motion.div
          className={s.scrollLine}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, ease: ease.out, delay: 2.80 }}
        />
        <motion.span
          className={s.scrollLabel}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: dur.base, ease: ease.out, delay: 2.20 }}
        >
          Scroll
        </motion.span>
      </div>

      {/* Year tag */}
      <motion.div
        className={s.yearTag}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: dur.base, ease: ease.out, delay: 2.20 }}
      >
        MMXXVI
      </motion.div>
    </section>
  );
}
