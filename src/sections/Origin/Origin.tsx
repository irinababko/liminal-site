import { useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Reveal } from '@/components/Reveal/Reveal';
import { SectionLabel } from '@/components/SectionLabel/SectionLabel';
import { ease } from '@/tokens/motion';
import s from './Origin.module.scss';

type SubmitState = 'idle' | 'loading' | 'done';

const LABEL: Record<SubmitState, string> = {
  idle:    'Receive',
  loading: '···',
  done:    '✓ Received',
};

export function Origin() {
  const [state, setState] = useState<SubmitState>('idle');
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (state !== 'idle' || !email.includes('@')) return;
    setState('loading');
    await new Promise<void>(resolve => setTimeout(resolve, 1500));
    setState('done');
  };

  return (
    <section className={s.section}>
      <div className={s.bgImage} aria-hidden="true" />

      {/* Dual-layer ambient glow */}
      <div className={s.glow} aria-hidden="true" />

      {/* Floating light particles — CSS-only */}
      <div className={s.particles} aria-hidden="true">
        <div className={s.p1} />
        <div className={s.p2} />
        <div className={s.p3} />
        <div className={s.p4} />
        <div className={s.p5} />
        <div className={s.p6} />
      </div>

      <div className={s.inner}>

        <Reveal>
          <div className={s.header}>
            <SectionLabel text="Origin" />
            <h2 className={s.heading}>
              Where it<br />begins.
            </h2>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <p className={s.tagline}>Receive what's already yours.</p>
        </Reveal>

        <Reveal delay={0.30}>
          <div className={s.formWrap}>
            <form className={s.form} onSubmit={handleSubmit} noValidate>
              <input
                className={s.input}
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={state !== 'idle'}
                aria-label="Email address"
              />

              <button
                type="submit"
                className={s.button}
                disabled={state !== 'idle'}
                data-state={state}
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={state}
                    className={s.btnLabel}
                    initial={{ opacity: 0, y: 7 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -7 }}
                    transition={{ duration: 0.22, ease: ease.out }}
                  >
                    {LABEL[state]}
                  </motion.span>
                </AnimatePresence>
              </button>
            </form>
          </div>
        </Reveal>

        <Reveal delay={0.45}>
          <p className={s.note}>No noise. Only signal.</p>
        </Reveal>

      </div>
    </section>
  );
}
