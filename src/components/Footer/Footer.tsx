import s from './Footer.module.scss';

const NAV_LINKS   = ['Manifesto', 'Resonance', 'Origin', 'Contact'] as const;
const SOCIAL_LINKS = ['Instagram', 'Behance', 'GitHub'] as const;

export function Footer() {
  return (
    <footer className={s.footer} data-snap-section>
      <div className={s.top}>
        <div className={s.brand}>
          <p className={s.wordmark}>LIMINAL</p>
          <p className={s.brandLine}>A study of motion, light, and becoming.</p>
        </div>

        <div className={s.links}>
          <nav className={s.nav} aria-label="Footer navigation">
            {NAV_LINKS.map(label => (
              <a key={label} href="#" className={s.navLink} data-hover="">
                {label}
              </a>
            ))}
          </nav>

          <div className={s.social}>
            {SOCIAL_LINKS.map(label => (
              <a key={label} href="#" className={s.socialLink} data-hover="" aria-label={label}>
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className={s.bottom}>
        <p className={s.copyright}>© 2026 LIMINAL. All rights reserved.</p>
      </div>
    </footer>
  );
}
