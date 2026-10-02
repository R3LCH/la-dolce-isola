# La Dolce Isola

Website for La Dolce Isola (Caffè, Enoteca, Wine Bar, Gelateria, Creperia), Via Michele Bianchi 30, Scalea.

Stack: Vite + React + TypeScript, Tailwind CSS 4, GSAP, three.js (R3F), `@gullabs/react-flipbook`, i18next. See `docs/PLAN.md`.

## Develop

```bash
npm ci
npm run dev
npm run build      # type-check + production build into dist/
```

Menu content lives in `src/data/menu.json` (6 languages). Source transcriptions and photo research are in `research/`.

Contact destinations live in `src/lib/venue.ts` and are shared by Contacts and the footer. Contacts pairs Instagram/Facebook, then phone/email, with WhatsApp across the next row. Grid rows share the tallest card's height, and links fill their cells so paired buttons have equal dimensions without clipping longer text. Historical contact URLs in `research/` are source records, not website links.

## Deploy

GitHub Pages: pushing to `main` runs `.github/workflows/pages.yml` (base path `/<repo-name>/`).

Own server (Docker + nginx, base path `/`):

```bash
docker compose up -d --build   # serves on http://<host>:8080
```

Without Docker: `VITE_BASE=/ npm run build` and serve `dist/` with `nginx.conf`.
