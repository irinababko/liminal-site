import { Reveal } from '@/components/Reveal/Reveal';
import { SectionLabel } from '@/components/SectionLabel/SectionLabel';
import s from './Breath.module.scss';

export function Breath() {
  return (
    <section className={s.section}>
      <div className={s.bgImage} aria-hidden="true" />
      <span className={s.ghostNumber} aria-hidden="true">01</span>

      <div className={s.left}>
        <Reveal>
          <div className={s.label}>
            <SectionLabel text="Breath" />
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <h2 className={s.heading}>
            You arrived <em>already luminous.</em>
          </h2>
        </Reveal>

        <Reveal delay={0.30}>
          <p className={s.body}>
            The space between impulse and expression is where identity lives.
            We work in that interval — holding the tension between what you carry
            and what you are becoming. Not to resolve it, but to make it visible.
          </p>
        </Reveal>
      </div>

      <div className={s.right}>
        <Reveal delay={0.45}>
          <blockquote className={s.aside}>
            "The world asked you to forget this. We are not the world. We are
            the pause before the word — the breath that makes language possible."
          </blockquote>
        </Reveal>
      </div>
    </section>
  );
}
