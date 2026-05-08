
import s from './SectionLabel.module.scss';

interface SectionLabelProps {
  text: string;
  color?: string;
}

export function SectionLabel({ text, color = 'var(--champagne)' }: SectionLabelProps) {
  return (
    <p className={s.label} style={{ color }}>
      {text}
    </p>
  );
}
