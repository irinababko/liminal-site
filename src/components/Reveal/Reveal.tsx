import { motion } from 'framer-motion';
import { dur, ease } from '@/tokens/motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import * as React from "react";

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  once?: boolean;
}

export function Reveal({ children, delay = 0, y = 48, once = true }: RevealProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: reduced ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-70px' }}
      transition={{ duration: dur.base, ease: ease.out, delay }}
    >
      {children}
    </motion.div>
  );
}
