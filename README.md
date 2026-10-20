# Edurock Web

React 19 + Vite web app for **Edurock**, a tuition marketplace for Bangladesh.

**Stack:** React 19 · React Router 7 · TanStack Query 5 · Tailwind CSS 4 + daisyUI 5 (theme tokens) · Firebase Auth · Recharts · Headless UI · a **custom motion engine** (no animation libraries).

```bash
cp .env.example .env    # VITE_API_URL, VITE_IMAGE_HOST_KEY
npm install
npm run dev             # http://localhost:5173
npm run build && npm run preview
npm run lint
```

## Structure

```
src/
├── lib/motion/       Animation engine: ticker, easing, spring, animate, timeline, smoothScroll, scroll observers
├── motion/           React bindings: <Reveal>, <Stagger>, <TextReveal>, <Presence>, <Parallax>, <Magnetic>, <Tilt>, <CountUp>, <Marquee>…
├── api/              Axios client (token + envelope + errors) and endpoint/query-key registry
├── hooks/            React Query hooks (useApi), URL-synced filters, chart colours, document title
├── providers/        Auth (Firebase + profile sync), Theme (light/dark/system)
├── components/
│   ├── ui/           Design system: Button, Field inputs, Card, Badge, Avatar, Modal, DataTable, StatCard, skeletons…
│   ├── layout/       Navbar, Footer, Auth layout, notifications, user menu
│   ├── home/ tuition/ tutor/ dashboard/ charts/
├── layouts/          Main and dashboard shells
├── pages/            public/, auth/, dashboard/{common,student,tutor,admin}
├── routes/           Router (every page lazy-loaded), guards, skeleton fallbacks
└── styles/index.css  Design tokens (Midnight Scholar theme) and utilities
```

## Design system — "Midnight Scholar"

- **Type:** Fraunces (serif display) for headings, Inter for UI text.
- **Colour:** deep ink and warm paper, a refined indigo primary and an amber accent. Light and dark themes are defined once as daisyUI tokens, so every component uses semantic classes (`bg-base-100`, `text-primary`, `text-muted`…) and switches themes automatically.
- **Utilities:** `container-page`, `text-muted` / `text-subtle`, `border-soft`, `bg-soft`, `glass`, `grain`, `bg-dots`, `text-gradient`, `skeleton-shimmer`, `spotlight`.
- **Reusable patterns:** every data view has a skeleton, an error state with retry, and an empty state with a next step. `DataTable` renders a table on desktop and cards on phones from the same column config.

## Motion engine (replaces framer-motion, GSAP and Lenis)

| Piece | Like | API |
| --- | --- | --- |
| `ticker` | GSAP ticker | One shared `requestAnimationFrame` loop that only runs while something is animating |
| `animate()` | framer `animate` / GSAP `to` | `animate(el, { opacity: [0, 1], y: [24, 0] }, { duration, ease, stagger, spring })`. Animates transform parts independently and interrupts cleanly |
| `createSpring` | framer springs | Frame-rate-independent damped spring (1 ms sub-steps) |
| `timeline()` | GSAP timeline | `.to(target, props, opts, '-=0.3').play() / reverse() / seek() / progress()` |
| `SmoothScroll` | Lenis | Damped wheel scrolling over native scroll (sticky, anchors and keyboard all keep working). Turned off on touch devices and with reduced motion |
| `observeInView` / `observeProgress` | ScrollTrigger | Shared IntersectionObservers, plus scroll-linked 0→1 progress with `start` / `end` |
| `<Presence>` | AnimatePresence | Enter/exit animations for mounting and unmounting |

Every component reads `prefers-reduced-motion` and jumps straight to the final state when it is set. Motion never delays content.

## Performance

- Route-level code splitting (every page is its own chunk), long-lived vendor chunks (`react`, `firebase`, `charts`, `data`), and SweetAlert loaded on demand.
- React Query caching (60 s fresh, 10 min in memory), `keepPreviousData` for pagination, and prefetch on hover for tuition and tutor pages.
- Optimistic UI for bookmarks and notification read state.
- Lazy images with a fade-in and a fallback, a high-priority hero image, preconnect + `display=swap` fonts, and an inline theme script (no colour flash).
- Filters live in the URL: shareable, survive refresh, and work with back/forward. Search is debounced.
- Immutable caching headers for hashed assets (`vercel.json`).

## Deploying (Vercel)

Import the repo, set the root directory to `frontend` (Vite preset), and add `VITE_API_URL` (your Render API URL) and `VITE_IMAGE_HOST_KEY`. Add the Vercel domain to the API's `CLIENT_URL` / `CORS_ORIGINS`.
