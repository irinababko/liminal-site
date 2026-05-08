export const ease = {
  out:    [0.16, 1, 0.3, 1]           as const,
  gentle: [0.25, 0.46, 0.45, 0.94]   as const,
} as const;

export const dur = {
  fast:  0.4,
  base:  0.8,
  slow:  1.2,
  xl:    1.4,
} as const;

export const stagger = {
  hero:    0.09,
  section: 0.15,
  grid:    0.08,
} as const;

export const fadeUp = {
  hidden:  { opacity: 0, y: 48 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: dur.base, ease: ease.out, delay },
  }),
} as const;

export const fadeIn = {
  hidden:  { opacity: 0 },
  visible: (delay = 0) => ({
    opacity: 1,
    transition: { duration: dur.base, ease: ease.out, delay },
  }),
} as const;
