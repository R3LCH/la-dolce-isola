# La Dolce Isola: design system and implementation plan

Sources: `research/vibe.md` (verified photo palette), `research/design-references.md` (references, taste rules), `src/data/menu.json` (21 pages, 32 categories, 343 items, 6 languages), `research/venue.json` (Google data), `research/tripadvisor.json`.

## 1. Design read

The venue is a classic Italian caffè-enoteca on the pedestrian street of Scalea. Indoors it is warm yellow walls, walnut wine shelving, cream capitonné, marble and crystal chandeliers. The brand mark is a hand-painted blue-and-white majolica tile with cobalt script. The site is there for the menu, so everything else stays short.

Concept: "La maiolica". Porcelain-white glaze surfaces, cobalt ink, one warm accent from the yellow walls. Ornament comes only from the brand's swirl motif, drawn as thin cobalt line art.

Dials: variance 7, motion 6-7, density 3.

## 2. Tokens (`src/styles/tokens.css`)

| Role | Token | Value | Source |
|---|---|---|---|
| Paper (page bg) | `--paper` | `#fbf8f2` | glaze white, neutralised |
| Paper raised | `--paper-2` | `#f3eee4` | menu page shadow side |
| Ink (text, brand) | `--ink` | `#16215a` | cobalt script on tile |
| Ink soft | `--ink-2` | `#3c5599` | majolica mid blue |
| Accent | `--sun` | `#f2c872` | interior wall yellow, used only for highlights and focus |
| Walnut | `--walnut` | `#5e3523` | bar wood, menu book cover |
| Night | `--night` | `#0f1430` | dark mode bg, cobalt-black |

Menu category pills keep the printed colours (gold drinks, orange food, green gelato, lilac desserts) so the digital pages read like the real ones.

Type: Bodoni Moda Variable (display, optical sizes, italic for emphasis), Manrope Variable (UI and body), Pinyon Script (only the wordmark "La Dolce Isola", echoing the tile script). All self-hosted via Fontsource.

Motion: enter `cubic-bezier(0.23,1,0.32,1)`, move `cubic-bezier(0.77,0,0.175,1)`, drawer `cubic-bezier(0.32,0.72,0,1)`. UI motion ≤ 300 ms, stagger 40 ms. Under `prefers-reduced-motion` only opacity fades remain, the book turns instantly and the 3D hero shows a static poster.

## 3. Tech stack

- Vite 8 + React 19 + TypeScript, Tailwind CSS 4 (`@tailwindcss/vite`) on top of CSS-variable tokens.
- GSAP 3 + ScrollTrigger for section reveals and the hero text; no scroll listeners.
- three.js + @react-three/fiber + drei, lazy-loaded, hero only.
- `@gullabs/react-flipbook` for the paper menu (real curl, touch back-peel, keyboard, reduced-motion support).
- i18next + react-i18next + language detector. Site UI: `it`, `en`. Menu content: `it`, `en`, `ru`, `uk`, `pl`, `de`, with its own switcher inside the menu.
- Deploy: GitHub Actions → GitHub Pages (`VITE_BASE=/la-dolce-isola/`), plus `Dockerfile` + `nginx.conf` for a server (`VITE_BASE=/`).

## 4. Page structure

Routes are hash-based (`#/` and `#/menu/<categoryId>`) so they work on Pages without server rewrites.

1. Header: centred brand logo, initially 2× compact size (72px mobile, 88px desktop), shrinking to 36px/44px over the first 160px of scroll. Reduced motion snaps on scrolling. Persistent "Menu" pill top-right, also on mobile; IT/EN toggle.
2. Hero (`min-h-[100dvh]`): a 3D majolica tile in the brand's cobalt line art, glazed, that tilts towards the pointer and catches a moving highlight. Headline in Bodoni, one line of copy, "Apri il menu" CTA. Poster image when WebGL or motion is unavailable.
3. Menu teaser: a row of category "tiles" (Caffetteria, Cocktail, Gelato, Crêpes, Vini, Food) with dish photos; each one deep-links into the book.
4. About: a short paragraph and two photos (17, 53), split layout with a clip-path reveal.
5. Reviews: small plaques (author, stars, quote clamped to 3 lines) in a slow horizontal drift, as on pasticceria-marylou. Italian headline: "Le opinioni dei nostri ospiti." Rating summary: Google 4.3 (575) and Tripadvisor 4.3 bubbles (125 reviews, #20 of 103 in Scalea).
6. Location: address, hours (07:00–01:00, closed Wednesdays), Google Maps embed, "Indicazioni" button; a review invitation and Google/Tripadvisor write-review buttons after the map.
7. Contacts: Instagram, Facebook, phone, WhatsApp, email buttons with line icons.

## 5. Menu book (`#/menu`)

- Book pages are HTML, not photos: 20 digital pages are rebuilt from the 21-page `menu.json` source booklet (category pill, translated item name, description and price). Food's 12 entries occupy one page on both devices. Digital numbering and category navigation follow `PAGE_SPECS` order; printed page metadata stays unchanged for source references and pill colors. Rendering is text-only; photo nodes in the printed-page specs are omitted. Phones omit decorative caption columns, expand remaining columns to fill the page, and show one gold category heading on each of the first two cocktail pages; desktop headings retain their printed arrangement.
- Desktop: two-page spread on a walnut cover. Mobile: single page, swipe to turn.
- Category rail on the left: full labels when open; collapses to vertical ticks while the reader is flipping; expands on hover (pointer devices) or tap (touch). The active category animates between ticks as pages turn. Clicking a label flips to the first page of that category.
- Language switcher for six menu languages; prices formatted as `€ 8,00`. Wine glass/bottle amounts use structured `servingPrices` and localized portion labels, never raw editorial `priceNote` text. Brand and producer names remain identifiable.

## 6. Delivery

- `npm run build` must pass with zero type errors.
- Browser check on desktop (1440×900) and mobile (390×844): hero, menu button, flip, rail, language switch, reduced motion.
- GitHub repo `la-dolce-isola`, Pages workflow, Docker/nginx for a server.
