# Liminal Site — Project Rules

## Project Brief

The main implementation brief is located at:

docs/liminal-brief-v2.md

Claude must read this brief before implementing sections.

Important:
- Follow the brief as the visual and architectural source of truth.
- This is a Vite React project, not Next.js.
- Replace any `app/layout.tsx` or `app/page.tsx` references from the brief with Vite equivalents:
    - use `src/App.tsx` for page composition
    - use `src/main.tsx` for app mounting and global styles
- Work phase by phase.
- Start with Phase 1: Hero only.

## Stack
- React
- TypeScript
- SCSS Modules
- Framer Motion
- Lenis smooth scroll
- Vite

## Code Style
- Use clean component structure.
- Use reusable components.
- Avoid inline styles.
- Avoid Tailwind.
- Keep files small and modular.
- Prefer functional components.
- Do not rewrite unrelated files.
- Do not build the whole site at once.

## Styling
- Use SCSS Modules.
- Use BEM-like naming inside modules.
- Use CSS variables for colors.
- Use clamp() for responsive typography.
- Use responsive layouts for desktop, tablet, and mobile.
- Prefer modern CSS: grid, flex, custom properties, backdrop-filter, gradients.

## Animations
- Use Framer Motion for UI animations.
- Use Lenis for smooth scroll.
- Prefer subtle premium motion.
- Use opacity, transform, scale, blur, and parallax.
- Use stagger animations for groups.
- Avoid chaotic or excessive motion.
- Respect prefers-reduced-motion.

## Visual Direction
- Abstract creative technology.
- Premium editorial design.
- Awwwards-style landing page.
- Cinematic scrolling.
- Soft mesh gradients.
- Floating translucent shapes.
- Huge expressive typography.
- Lots of negative space.
- Elegant, mysterious, emotional, and futuristic.

## Architecture
Preferred structure:

src/
components/
sections/
ui/
hooks/
styles/

## Important
- Work section by section.
- Start with Hero only unless asked otherwise.
- Do not refactor the full app unless explicitly requested.
- Keep animations performant.
- Keep canvas or heavy visual effects isolated in separate components.