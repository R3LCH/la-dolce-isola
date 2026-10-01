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

## Deploy

GitHub Pages: pushing to `main` runs `.github/workflows/pages.yml` (base path `/<repo-name>/`).

Own server (Docker + nginx, base path `/`):

```bash
docker compose up -d --build   # serves on http://<host>:8080
```

Without Docker: `VITE_BASE=/ npm run build` and serve `dist/` with `nginx.conf`.
