import { motion } from 'framer-motion';
import { Reveal } from '@/components/Reveal/Reveal';
import { SectionLabel } from '@/components/SectionLabel/SectionLabel';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { dur, ease } from '@/tokens/motion';
import s from './Current.module.scss';

const STATS = [
  { value: '12+', label: 'Years of craft'    },
  { value: '∞',   label: 'Possible states'   },
  { value: '01',  label: 'Direction forward'  },
];

const HEADING_LINES = ['In motion,', 'always'] as const;

export function Current() {
  const reduced = useReducedMotion() === true;

  const headingVariants = {
    hidden:   {},
    visible:  { transition: { staggerChildren: 0.12 } },
  };

  const wordVariants = {
    hidden:  { opacity: reduced ? 1 : 0, y: reduced ? 0 : 48 },
    visible: { opacity: 1, y: 0, transition: { duration: dur.base, ease: ease.out } },
  };

  return (
    <section className={s.section}>
      <div className={s.mesh} aria-hidden="true" />
      <div className={s.bgImage} aria-hidden="true" />

      <div className={s.content}>
        <Reveal>
          <div className={s.label}>
            <SectionLabel text="Current" />
          </div>
        </Reveal>

        <motion.h2
          className={s.heading}
          variants={headingVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-70px' }}
        >
          {HEADING_LINES.map((line) => (
            <motion.span key={line} style={{ display: 'block' }} variants={wordVariants}>
              {line}
            </motion.span>
          ))}
          <motion.span className={s.accent} style={{ display: 'block' }} variants={wordVariants}>
            arriving.
          </motion.span>
        </motion.h2>

        <Reveal delay={0.30}>
          <p className={s.body}>
            We exist in the current — the continuous flow between impulse and form.
            Every project is a crossing. Every crossing changes the terrain.
          </p>
        </Reveal>

        <div className={s.statsRow}>
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} delay={0.45 + i * 0.15}>
              <div className={s.stat}>
                <div className={s.statValue}>{stat.value}</div>
                <div className={s.statLabel}>{stat.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
