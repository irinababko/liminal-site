import { motion } from 'framer-motion';
import { Reveal } from '@/components/Reveal/Reveal';
import { SectionLabel } from '@/components/SectionLabel/SectionLabel';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { fadeUp, stagger } from '@/tokens/motion';
import { Tile } from './Tile';
import s from './Resonance.module.scss';

import echoImage  from '@/assets/resonance/echo.png';
import driftImage from '@/assets/resonance/drift.png';
import pulseImage from '@/assets/resonance/pulse.png';
import veilImage  from '@/assets/resonance/veil.png';
import surgeImage from '@/assets/resonance/surge.png';
import hazeImage  from '@/assets/resonance/haze.png';

const TILES = [
  { name: 'Echo',  description: 'A signal returned, changed.',   image: echoImage  },
  { name: 'Drift', description: 'Movement without destination.', image: driftImage },
  { name: 'Pulse', description: 'Life insisting on itself.',     image: pulseImage },
  { name: 'Veil',  description: 'What obscures also protects.',  image: veilImage  },
  { name: 'Surge', description: 'The moment before the crest.', image: surgeImage },
  { name: 'Haze',  description: 'Clarity waiting to emerge.',    image: hazeImage  },
];

export function Resonance() {
  const reduced = useReducedMotion() === true;

  const gridVariants = {
    hidden:  {},
    visible: { transition: { staggerChildren: stagger.grid } },
  };

  const tileVariants = {
    hidden:  { opacity: 0, y: reduced ? 0 : 48 },
    visible: fadeUp.visible(),
  };

  return (
    <section className={s.section}>
      <div className={s.bgImage} aria-hidden="true" />
      <header className={s.header}>
        <Reveal>
          <div className={s.label}>
            <SectionLabel text="Resonance" />
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <h2 className={s.heading}>
            Every frequency<br />
            has <em className={s.accent}>a name.</em>
          </h2>
        </Reveal>
      </header>

      <motion.div
        className={s.grid}
        variants={gridVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-70px' }}
      >
        {TILES.map((tile, i) => (
          <motion.div key={tile.name} variants={tileVariants}>
            <Tile
              name={tile.name}
              description={tile.description}
              image={tile.image}
              index={i}
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
