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

The hero uses a red/burgundy gradient matched to the reference in `public/img/business_logo.jpeg`, preserving its fine background motif without changing other sections. The old ceramic tile and flying companions were replaced by a single gold 3D business-logo relief: beveled medallion, painted blue/cloud face, raised reclining figure and script wordmark. The figure and “Dolce Isola” lettering are traced from the photograph; worn “dal 1996” strokes are rebuilt with Pinyon Script outlines. All gold contours and the cleaned sky painting live in the self-contained `public/hero-logo.svg` (`viewBox="0 0 1000 1250"`); its `#gold-relief` group supplies the extruded geometry, so the static poster and 3D face cannot drift between separate artwork files. Preserve that group and the disk center `(500, 470)`, outer radius `420`, when editing the asset.

`src/hero/HeroScene.tsx` owns the logo's WebGL resources. The poster hides only after a complete rendered frame; no WebGL or context loss leaves the static artwork visible. Reduced motion renders a still scene on demand. Offscreen/hidden-tab rendering stops, and Activity teardown cancels loads and disposes geometries, materials and textures; returning home loads a fresh generation rather than reusing disposed resources. No external HDRI or model downloads are required.

Opening hours are 07:00–01:00, closed on Wednesdays. Hours, contact and review destinations live in `src/lib/venue.ts`. Find us ends with Google and Tripadvisor write-review links. The Calabrian wine section uses the supplied `public/img/wines.jpeg`, converted to responsive WebP renditions; its native 1024px maximum is reflected in `srcSet` rather than advertised as 1600px.

## Deploy

GitHub Pages: pushing to `main` runs `.github/workflows/pages.yml` (base path `/<repo-name>/`).

Own server (Docker + nginx, base path `/`):

```bash
docker compose up -d --build   # serves on http://<host>:8080
```

Without Docker: `VITE_BASE=/ npm run build` and serve `dist/` with `nginx.conf`.

### IONOS managed webspace

SSH/SFTP: `access-5021547867.webspace-host.com`, port `22`, user `su406691`. The site's SFTP directory is `/public/la-dolce-isola` (`/home/www/public/la-dolce-isola` over SSH). This account also contains `/public/marylou`; do not replace or remove that site's files.

Build a portable release that works when the future domain is assigned to this directory:

```bash
VITE_BASE=./ npm run build
```

Upload only the contents of `dist/`, plus `deploy/ionos.htaccess` renamed to `.htaccess`. Keep public directories at `0755` and files at `0644`. Stage a complete release under `/releases`, verify its checksums, then move it to the site's directory. Before replacing an existing release, create a private recovery archive outside `public`; backup directories use `0700` and archives `0600`.

The initial 118-file release was uploaded and verified by SHA-256. Its private recovery archive is `/backups/la-dolce-isola-20261002T234008Z.tar.gz`. This is a manual, same-provider copy, not an automated or off-site backup. A downloaded copy of that archive was also checked and exercised locally on desktop and mobile.

No domain is connected yet. Domain purchase, DNS, HTTPS certificates and canonical redirects are deferred. The SFTP hostname is not a public website URL; do not point website DNS to the SSH server IP. When a domain is available, connect it to the `la-dolce-isola` webspace directory and verify live HTTPS, headers and assets before adding redirects. The current Apache configuration disables directory listing, protects hidden/service files and sets MIME-sniffing, referrer and HTML/JSON cache headers; it intentionally has no domain or HTTPS redirect.

Passwords stay in the local Secret Service, never in the repository or deployment artifact. The observed SSH server key is `ssh-ed25519 SHA256:1gx2w8Rtv3wCgi7Jh8myf/KVd72cRQbow03UP8P095Q`. Local hostname resolution returned a different, unreachable address during this deployment; the connection used the public DNS answer `217.160.137.1` without changing DNS settings. Re-check DNS and the server fingerprint when reconnecting from another machine.
