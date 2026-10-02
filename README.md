# La Dolce Isola

Website for La Dolce Isola (Caffè, Enoteca, Wine Bar, Gelateria, Creperia), Via Michele Bianchi 30, Scalea.

Stack: Vite + React + TypeScript, Tailwind CSS 4, GSAP, three.js (R3F), `@gullabs/react-flipbook`, i18next. See `docs/PLAN.md`.

## Develop

```bash
npm ci
npm run dev
npm run build      # type-check + production build into dist/
```

Menu content lives in `src/data/menu.json` (Italian, English, Russian, Ukrainian, Polish and German). Translate generic names, ingredients, regions and UI labels; retain brand, producer and house-recipe names. Wine `servingPrices` records glass/bottle amounts separately, including bottle-only wines; `priceNote` is archival transcription data, not guest-facing copy. Source transcriptions and photo research are in `research/`.

The digital menu has 20 pages built from the 21-page source booklet: all 12 Food entries share digital page 13 on phone and desktop. `PageSpec.page` retains the first source page as its stable key; reader numbering, category jumps and pagination use the order in `PAGE_SPECS`, not source page numbers. Source category page numbers still determine pill colors. On phones, the first two cocktail pages show the gold category pill; decorative caption columns are omitted and remaining content columns fill the available width. The printed desktop heading arrangement remains unchanged.

The homepage stays inside React's [`Activity`](https://react.dev/reference/react/Activity) boundary in `src/App.tsx` while the menu is open. Hidden mode preserves component/DOM state but cleans up its Effects, including GSAP contexts and ScrollTriggers; returning home reconnects those Effects on visible geometry, restores the saved scroll position and refreshes the triggers before lifting the curtain. CSS-only `hidden` previously left homepage animations running against zero-sized elements and could crash direct desktop menu loads in `ScrollTrigger.refresh`. Unmounting the homepage instead would discard state such as the review marquee's pause setting.

Contact destinations live in `src/lib/venue.ts` and are shared by Contacts and the footer. Contacts pairs Instagram/Facebook, then phone/email, with WhatsApp across the next row. Grid rows share the tallest card's height, and links fill their cells so paired buttons have equal dimensions without clipping longer text. Historical contact URLs in `research/` are source records, not website links.

The homepage header logo starts at twice its compact size and shrinks over the first 160px of scrolling, on both desktop and mobile; reduced motion snaps between the two sizes. Keep its motion media setup independent of `useMotion`'s desktop/reduced-motion conditions so normal-motion phones also initialize.

Both header logos use `public/logo-header.svg`, cropped from the original artwork in `public/logo.svg` / `public/logo.pdf`. Lettering stays vector; the illustration retains its native 703×315 detail with a transparent background. Preserve the 77:88 aspect ratio so changing artwork does not change layout or scroll sizing; do not downsample the whole logo to a small PNG.

Opening hours are 07:00–01:00, closed on Wednesdays. Hours, contact and review destinations live in `src/lib/venue.ts`. Find us ends with Google and Tripadvisor write-review links. The Calabrian wine section uses the supplied `public/img/wines.jpeg`, converted to responsive WebP renditions; its native 1024px maximum is reflected in `srcSet` rather than advertised as 1600px.

## Deploy

GitHub Pages: pushing to `main` runs `.github/workflows/pages.yml` (base path `/<repo-name>/`).

Own server (Docker + nginx, base path `/`):

```bash
docker compose up -d --build   # serves on http://<host>:8080
```

Without Docker: `VITE_BASE=/ npm run build` and serve `dist/` with `nginx.conf`.
