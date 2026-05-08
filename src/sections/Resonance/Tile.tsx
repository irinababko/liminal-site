import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ease } from '@/tokens/motion';
import s from './Tile.module.scss';

interface TileProps {
  name: string;
  description: string;
  image: string;
  gradientIndex?: number;
  index: number;
}

export function Tile({ name, description, image, index }: TileProps) {
  const reduced = useReducedMotion() === true;

  const label = String(index + 1).padStart(2, '0');

  return (
    <motion.div
      className={s.tile}
      whileHover={reduced ? undefined : { y: -8 }}
      transition={{ duration: 0.5, ease: ease.out }}
      data-hover=""
    >
      <motion.div
        className={s.bgImage}
        style={{ backgroundImage: `url(${image})` }}
        whileHover={reduced ? undefined : { scale: 1.08 }}
        transition={{ duration: 0.7, ease: ease.gentle }}
      />

      <div className={s.scrim} />

      <span className={s.index}>{label}</span>

      <div className={s.content}>
        <p className={s.name}>{name}</p>
        <p className={s.desc}>{description}</p>
      </div>
    </motion.div>
  );
}
