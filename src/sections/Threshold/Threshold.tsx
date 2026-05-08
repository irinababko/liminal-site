import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ease, dur } from '@/tokens/motion';
import s from './Threshold.module.scss';

export function Threshold() {
  const reduced = useReducedMotion() === true;

  const viewport = { once: true, margin: '-80px' } as const;

  return (
    <section className={s.section} data-snap-section>
      <div className={s.bgImage} aria-hidden="true" />
      <div className={s.glow} aria-hidden="true" />

      {/* Ghost text above — descends into place from above */}
      <motion.p
        className={s.textAbove}
        initial={{ opacity: 0, y: reduced ? 0 : -44 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewport}
        transition={{ duration: dur.slow, ease: ease.out }}
        aria-hidden="true"
      >
        Before
      </motion.p>

      {/* Dividing line — draws left to right, cinematic pace */}
      <div className={s.lineWrap}>
        <motion.div
          className={s.line}
          style={{ originX: 0 }}
          initial={{ scaleX: reduced ? 1 : 0, opacity: reduced ? 1 : 0.6 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={viewport}
          transition={{ duration: 2.0, ease: [0.12, 0, 0.18, 1] }}
        />

        {/* Centre label — fades in once line has mostly arrived */}
        <motion.span
          className={s.lineLabel}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={viewport}
          transition={{ duration: dur.slow, ease: ease.out, delay: 1.5 }}
        >
          The Threshold
        </motion.span>
      </div>

      {/* Ghost text below — rises into place from below */}
      <motion.p
        className={s.textBelow}
        initial={{ opacity: 0, y: reduced ? 0 : 44 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewport}
        transition={{ duration: dur.slow, ease: ease.out, delay: 0.4 }}
        aria-hidden="true"
      >
        After
      </motion.p>
    </section>
  );
}
