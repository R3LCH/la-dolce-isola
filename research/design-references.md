# La Dolce Isola: design references

Research date 2026-10-01. Unverified claims are marked [INFERENCE] and gaps are marked [UNKNOWN]. This file contains no code.

## 0. Verdict

- **Flipbook:** use `@gullabs/react-flipbook` (HTML mode, real menu photos as `<img>` pages). It is a maintained fork of StPageFlip with the mobile back-curl fixed, built-in reduced-motion and keyboard support, and it is about 18 kB gzip. Keep three.js out of the menu.
- **3D:** use it only in the hero, lazy-loaded. Use R3F 9 + drei 10 (`MeshTransmissionMaterial`, `Caustics`) + maath. Do not use lamina (archived).
- **Repo hygiene from designsystems.one:** `tokens.json` (W3C DTCG) as the source of truth, semantic token names, `AGENTS.md` + `llms.txt`, and typed components with union variants.

## 1. Site references (Awwwards / Site of Sites)

siteinspire.com returned HTTP 429. No picks come from it [UNKNOWN].

Motion details come from Awwwards element titles, descriptions and screenshots. I did not observe them live [INFERENCE for the exact behaviour].

| # | Site | What to steal | Why it fits |
|---|---|---|---|
| 1 | [Pier88 Coast](https://pier88coast.com) ([Awwwards](https://www.awwwards.com/sites/pier88-coast-by-monarq)) | Day-arc storytelling: beach morning, shared plates, aperitivo, golden hour by the sea. Sections are ordered by time of day. | The closest brief match: a Mediterranean beach dining spot. Use a time-of-day arc for the menu categories (colazione → pranzo → aperitivo). |
| 2 | [KUBE Saint-Tropez](https://www.kubehotel-saint-tropez.com/fr) ([Awwwards](https://www.awwwards.com/sites/kube-saint-tropez)) | "Browsing as the beginning of the stay": immersive full-bleed imagery. Two-colour palette, lime #DAF092 on black. | Shows one bold accent can carry a Riviera brand without beige. |
| 3 | [Caffè Gilli](https://www.caffegilli.com/en) ([Awwwards](https://www.awwwards.com/sites/caffe-gilli)) | Cinematic hero video in a framed inset with a wide gutter. Centered all-caps thin display type. Logo-oval wordmark. Palette: navy #142342 + powder blue #a9bdcc. | Italian historic café. The navy + sky pair reads "sea" without cliché turquoise. |
| 4 | [Giacosa Firenze](https://www.giacosafirenze.com/en) ([Awwwards](https://www.awwwards.com/sites/giacosa-firenze)) | "Scroll Storytelling": a cut-out drink sits center while flanking type and an ingredient list (1/3 gin, 1/3 vermouth, 1/3 Campari) reveal staggered. Condensed display in a tan tone on dark teal. | A direct model for featuring one signature drink or granita. |
| 5 | [La table de Joakim](https://latabledejoakim.fr/) ([Awwwards](https://www.awwwards.com/sites/la-table-de-joakim)) | Page-loading sequence and a dedicated "Menu Interactions" element. Condensed serif headline + monospace caps body. Single small portrait photo per screen. | Restraint: tiny type, one image, lots of air. Its menu interactions are a reference for the categories rail. |
| 6 | [Masia Mont Rural](https://mont-rural.emblematica.agency) ([Awwwards](https://www.awwwards.com/sites/masia-mont-rural)) | Editorial headline set with words staggered across the grid ("Private Masia / the Vineyards / of Penedès") with italic small connectors. A notch-cut seam between the hero card and the photo. Hero, about, gallery, footer are all separate elements. | Mediterranean rural editorial. The about-section layout fits our short about. |
| 7 | [Lingers](https://www.lingers.it/en) ([Awwwards](https://www.awwwards.com/sites/lingers)) | Hero as an inset rounded card over a blurred copy of itself. Circular CTA badge. Spaced serif wordmark. Palette: olive grey #777162 + #f7f7f7. | Italian, quiet luxury. The circle badge maps to a "Prenota / Chiama" chip. |
| 8 | [Faith Ibiza](https://faithibiza.com/) ([Awwwards](https://www.awwwards.com/sites/faith-ibiza)) | Homepage scroll transitions plus a mobile map + listing "Booking" element. Palette: sea blue #3C859B + sand #EEEBE4. | A Balearic sea palette and a mobile-first map pattern for the location section. |
| 9 | [Le Saint Georges](https://lesaintgeorges.ch/) ([Awwwards](https://www.awwwards.com/sites/le-saint-georges)) | "Header color change on hover and scroll": the nav swaps ink colour per section. | A cheap, premium detail for a photo-heavy one-pager. |
| 10 | [Santioni Spirits](https://santionispirits.com/) ([Awwwards](https://www.awwwards.com/sites/santioni-spirits), Active Theory, HM + Developer Award) | Illustrated comic-book opening, hand animation, story intro. | Reference for an illustrated menu-cover moment, for example an illustrated cover page before the real pages. |
| 11 | [Casa Portufornia](https://casaportufornia.com/) ([Site of Sites](https://www.siteofsites.co/websites/casa-portufornia)) | Retreat site by Garbo Studios with photography-led layout. | Sun-bleached Iberian coast photography tone. |
| 12 | [The Surfers Journal Archives](https://archives.surfersjournal.com/) ([Site of Sites](https://www.siteofsites.co/websites/the-surfers-journal-archives)) | A print-archive presented as browsable issues. | Closest analogue to "a printed object you leaf through online". [INFERENCE: interaction not inspected] |

Patterns repeated across 3 or more references:

- Framed or inset hero with a gutter, not edge-to-edge (Gilli, Lingers, Masia).
- A two-colour palette with one accent.
- A centered wordmark logo with a hairline hamburger on the left.
- Slow cinematic video or still in the hero, and small type elsewhere.

## 2. Codrops demos usable here

License notes:

- Codrops states downloadable demos are MIT unless stated otherwise ([licensing](https://tympanus.net/codrops/licensing/)).
- Hub items by third parties carry their own repo license. Check each before copying.
- CodePen public pens are MIT by CodePen's terms [INFERENCE: not re-verified today].

| Need | Demo | Source | Technique | License |
|---|---|---|---|---|
| Page flip (flat, magazine) | [Page Flip Layout](https://tympanus.net/Development/PageFlipLayout/) | [codrops/PageFlipLayout](https://github.com/codrops/PageFlipLayout) | Flat page-flip transition between magazine spreads, JS + CSS transforms | Codrops MIT default (no LICENSE file shown by GitHub API) |
| Page flip (3D CSS) | [BookBlock](http://tympanus.net/Development/BookBlock/), [Look-inside Book Preview](http://tympanus.net/Development/BookPreview/) | [codrops/BookPreview](https://github.com/codrops/BookPreview) | `rotateY` + `preserve-3d` hard pages, jQuery-era | MIT (Codrops). Dated (2012-14): use as a reference only |
| Menu as object | [3D Restaurant Menu Concept](http://tympanus.net/Tutorials/3DRestaurantMenu/) | zip on the tutorial page | Tri-fold paper menu that opens in 3D | MIT (Codrops). Dated, but a direct concept match |
| Book shelf/gallery | [Book Gallery](https://codepen.io/daniel-mu-oz/full/RNRaXwZ) (2026) | [pen](https://codepen.io/daniel-mu-oz/pen/RNRaXwZ) | CSS 3D book flip gallery | CodePen MIT [INFERENCE] |
| Water ripple on hero | [Creating a Water-like Distortion Effect with Three.js](https://tympanus.net/codrops/2019/10/08/creating-a-water-like-distortion-effect-with-three-js) | tutorial code inline. Repo URL [UNKNOWN] | A 64 px offscreen canvas of decaying "ripple" circles (drawn via shadowBlur) with momentum. Used as a displacement map in a `postprocessing` custom Effect. Cheap: no fluid sim | Codrops MIT |
| Water distortion, light | [Lightweight Water Distortion Effect](https://codepen.io/ksenia-k/full/RwXVMMY) | [pen](https://codepen.io/ksenia-k/pen/RwXVMMY) | Single-pass GLSL water distortion on an image | CodePen MIT [INFERENCE] |
| Liquid slideshow | [Liquid Distortion Effects](https://tympanus.net/Development/LiquidDistortion) | [codrops/LiquidDistortion](https://github.com/codrops/LiquidDistortion) | PixiJS displacement-sprite transitions + GSAP | MIT (Codrops) |
| Image wave | [Wave Motion Effect](http://tympanus.net/Tutorials/WaveMotionEffect/) | [marioecg/codrops-wave-motion](https://github.com/marioecg/codrops-wave-motion/) | Vertex-shader sine wave on a textured plane (like a flag or awning) | [UNKNOWN] check repo |
| Real water sim (desktop only) | [WebGPU Water](https://jeantimex.github.io/webgpu-water/) | [jeantimex/webgpu-water](https://github.com/jeantimex/webgpu-water) | Port of Evan Wallace's water with caustics. WebGPU | [UNKNOWN]. WebGPU-only, so fallback required |
| Puddle/ripple R3F | [Puddle in rain](https://faraz-portfolio.github.io/demo-2023-rain-puddle/) | [Faraz-Portfolio/demo-2023-rain-puddle](https://github.com/Faraz-Portfolio/demo-2023-rain-puddle/tree/main) | R3F + GLSL ripple normals | [UNKNOWN] |
| Text reveal | [On-Scroll Sliced Text](https://tympanus.net/Development/SlicedTextEffect) | [codrops/SlicedTextEffect](https://github.com/codrops/SlicedTextEffect) | Text split into slices offset by ScrollTrigger scrub | MIT |
| Accessible WebGL text | [Accessible WebGL Text](https://tympanus.net/Tutorials/AccessibleWebGLText) | [ehaakana/codrops-text-demo](https://github.com/ehaakana/codrops-text-demo) | WebGL text kept in sync with real DOM text for SEO/a11y | [UNKNOWN] |
| Image reveal | [Image Layer Animations with Clip-Path](http://tympanus.net/Development/LayersAnimation), [Fullscreen Clip](http://tympanus.net/Development/FullscreenClipEffect/) | [codrops/LayersAnimation](https://github.com/codrops/LayersAnimation/), [codrops/FullscreenClipEffect](https://github.com/codrops/FullscreenClipEffect/) | Stacked `clip-path` layers animated by GSAP | MIT |
| Infinite marquee | [Unwoven](https://tympanus.net/Development/Unwoven/) (2026-09) | [clementgrellier/unwoven](https://github.com/clementgrellier/unwoven) | Three.js marquee with ribbon distortion | MIT (repo) |
| Reflection | [Reflection Scroll Effect](https://tympanus.net/Development/ReflectionScroll/) | [codrops/ReflectionScroll](https://github.com/codrops/ReflectionScroll) | Mirrored, faded copy of images on scroll ("on-water" look) | MIT |
| Scroll zoom | [ScrollTrigger Image Zoom](https://codepen.io/GreenSock/full/YzbPYMx) | [pen](https://codepen.io/GreenSock/pen/YzbPYMx) | Pinned image scales into a full-bleed frame | CodePen MIT [INFERENCE] |
| Scroll polaroids | [Scroll-Driven Polaroid Animation](https://tympanus.net/Tutorials/Scrollaroids/) | [pen](https://codepen.io/creativeocean/pen/dPOvbPB) | GSAP-scrubbed photo stack. Fits a "review chips" or photo strip | CodePen MIT [INFERENCE] |
| Cursor | [Satisfying curly cursor](https://codepen.io/ksenia-k/full/rNoBgbV) | [pen](https://codepen.io/ksenia-k/pen/rNoBgbV) | 2 KB canvas trail cursor | CodePen MIT [INFERENCE]. Desktop only, gate with `(hover:hover) and (pointer:fine)` |
| Page transitions | [Async Page Transitions](https://async-page-transitions.crnacura.workers.dev/) | [blenkcode/codrops-demo](https://github.com/blenkcode/codrops-demo) | GSAP transitions that wait on async content | [UNKNOWN] |

No Codrops Hub item implements a WebGL paper curl. The hub's `book` and `flip` tags hold only CSS 3D demos (checked [tag/flip](https://tympanus.net/codrops/hub/tag/flip/) and [tag/book](https://tympanus.net/codrops/hub/tag/book/)).

## 3. Page-flip options for React (2026)

| Option | Realism | Mobile touch | Perf | Bundle | Maintenance | License |
|---|---|---|---|---|---|---|
| [StPageFlip](https://github.com/Nodlik/StPageFlip) `page-flip@2.0.7` + [react-pageflip@2.0.3](https://github.com/Nodlik/react-pageflip) | Soft curl with shadow, hard covers | Swipe/drag, but **portrait back-swipe slides instead of curls** ([#49](https://github.com/Nodlik/StPageFlip/issues/49)) | Good (DOM/canvas) | 10.4 kB gzip, 0 deps | **Stale.** Both last published Apr 2021. 48 open issues. react-pageflip pins `page-flip: latest` | MIT |
| [`@gullabs/react-flipbook`](https://github.com/gul-labs/flipbook) + `@gullabs/flipbook-core` 3.1 | Same curl engine. Opaque fold (no text bleed-through). Correct portrait back-peel | Pointer Events, ResizeObserver + visualViewport. Playwright WebKit e2e. iOS physical devices not yet signed off | Good. HTML only (canvas mode removed in 3.0) | 18.1 kB gzip, 0 deps | Active, with CI and visual-regression snapshots. But **2 stars, tiny community** (bus-factor risk) | core **MPL-2.0** (file-level copyleft: modified core files must stay open). React binding MIT |
| [Wawa Sensei R3F book slider](https://github.com/wass08/r3f-animated-book-slider-final) ([demo](https://r3f-animated-book-slider-final.vercel.app/), [video](https://youtu.be/b7a_Y1Ja6js)) | Highest. A real 3D book: `SkinnedMesh` with 30 bones per page, segmented `BoxGeometry`, sin/cos curve per bone, `maath` `dampAngle` easing, page-flip sound | Click-to-turn only. **No drag-curl.** Touch drag would need a custom build | Heavy: three + R3F + drei. Every page is a texture, so 21 menu photos is a lot of GPU memory [INFERENCE] | Large (three.js core alone is far heavier than 18 kB) [INFERENCE] | Tutorial repo, not a library. Deps R3F 8 / drei 9 (current is R3F 9.8.1 / drei 10.7.9) | **No LICENSE in repo.** Do not copy code. Reimplementing the technique is fine |
| Custom CSS 3D + GSAP (reference: Codrops BookBlock / PageFlipLayout) | Hard rigid pages only (`rotateY`). No curl unless you build clip-path folding yourself | Whatever you build (Pointer Events + GSAP Draggable/Inertia) | Excellent | Smallest | You own it | n/a |

**Recommendation: `@gullabs/react-flipbook`, pinned to an exact version.**

Why:
- It is the only option with real paper curl, correct mobile back-peel, `respectReducedMotion` (instant turn), keyboard turning, SSR-safe imports, a controlled `page` prop + `usePageFlip()`, and React 18/19 support.
- The categories rail can call the controlled page or `flip(pageIndex)` to jump.

Mitigations:
- **Fork risk:** if the fork dies, StPageFlip upstream is the fallback with an almost identical API (see `MIGRATION.md`).
- **MPL-2.0:** fine for a website. Only publish changes if you edit core files.
- **iOS:** test on a physical iPhone before launch.
- **Accessibility/SEO:** each page should be `<img alt>` plus a visually hidden text transcription of the items, or a parallel HTML list.

Optional premium layer: a WebGL "closed menu" object in the hero (Wawa-style bones, reimplemented) that hands off to the DOM flipbook when opened. Keep this out of scope unless there is budget.

## 4. pmnd.rs fit

Libraries:

- Use:
  - [`@react-three/fiber`](https://github.com/pmndrs/react-three-fiber) 9.8.1
  - [`@react-three/drei`](https://drei.docs.pmnd.rs/getting-started/introduction) 10.7.9: `MeshTransmissionMaterial` ([docs](https://drei.docs.pmnd.rs/shaders/mesh-transmission-material)), `Caustics` ([docs](https://drei.docs.pmnd.rs/staging/caustics)), `Environment`, `Float`, `useTexture`, `PerformanceMonitor`
  - [`maath`](https://github.com/pmndrs/maath) for damping/easing
  - `postprocessing` / `@react-three/postprocessing` for a subtle ripple displacement or a vignette
- Avoid [`lamina`](https://github.com/pmndrs/lamina). It was archived on 2023-04-05, and the author says it is "unreliable, unpredictable and slow". Use `three-custom-shader-material` instead.
- Relevant examples on [pmnd.rs](https://pmnd.rs/): `caustics`, `water-shader`, `transparent-aesop-bottles`, `frosted-glass`, `scrollcontrols-and-lens-refraction`, `hi-key-bubbles`, `floating-diamonds` (URL pattern `https://pmndrs.github.io/examples/<name>` [INFERENCE]).

Hero idea: a lemon granita glass on the bar counter at noon.

- **Scene:** a single faceted glass of lemon granita with a lemon slice, sitting on a sun-washed counter plane.
- **Glass:** `MeshTransmissionMaterial` (low samples on mobile, `chromaticAberration` small, `thickness` ~0.3), with a crushed-ice inner mesh in a frosted material.
- **Light:** drei `Caustics` projects light swirls onto the counter. Animate the caustic light direction slowly with maath damp to suggest the sun moving and umbrella shade. Add an HDRI `Environment` of a beach (low-res, blurred).
- **Interaction:** on pointer move, the glass tilts a few degrees via spring damping. On tap, a short ripple passes through the granita surface: a vertex-noise uniform pulse, or the Codrops canvas-ripple displacement in postprocessing.
- **Scroll:** a ScrollTrigger scrub pushes the camera down and toward the glass, then the canvas cross-fades into the paper-menu cover so the glass "becomes" the menu entry point.
- **Performance:**
  - Lazy-load the canvas after LCP with a static AVIF poster of the same render as the LCP image.
  - `PerformanceMonitor` lowers DPR, transmission samples and caustic resolution.
  - Under `prefers-reduced-motion` or no WebGL, show the poster only.
  - Pause `frameloop` when off-screen (`frameloop="demand"` + invalidate).
- **Assets needed:** a glass + lemon GLB (modelled, under 300 KB with Draco/meshopt) and one HDRI. [UNKNOWN: no assets exist yet]

Alternatives, both cheaper:

- A shallow sea-water plane with caustics seen from above, with the logo floating.
- A single floating lemon with `Float`.

## 5. Design-system structure (designsystems.one)

### Structural references

- [shadcn/ui](https://www.designsystems.one/design-systems/shadcn-ui) (AI-ready 3/5): copy-owned components, CSS-variable theming, registry JSON manifests. Use it as the component substrate pattern (Radix primitives + Tailwind v4 + CSS variables).
- [Carbon](https://www.designsystems.one/design-systems/carbon-design) (AI-ready 4/5, the highest in the list I scanned): tokens via Style Dictionary, layered semantic tokens. Use it as the token-architecture reference only, not its visuals.

### AI-ready pillars to implement in the repo ([source](https://www.designsystems.one/ai-ready))

1. **Machine-readable tokens.** A W3C DTCG `tokens.json` as the source of truth, generating `tokens.css` (named CSS variables) + TS export.
   - Use semantic over primitive layering: `color.surface.paper`, `color.action.primary`, not `sand.200`.
   - Give each token a description (JSDoc/`$description`) so agents see intent.
   - Include motion tokens (easings, durations) and z-index layers.
2. **Query surface.** The site recommends an MCP server (list-tokens, find-component, get-pattern). For a small site that is overkill [INFERENCE]. The same page lists repo files, package types and readable docs as valid distribution paths, so ship `AGENTS.md` (rules, token usage, banned patterns) + `llms.txt` (site/content map). Those are two of the five "Agent-Ready Check" signals.
3. **Components agents can't misuse.**
   - TypeScript discriminated unions for variants (`size: 'sm'|'md'|'lg'`), not open strings.
   - Predictable prop shapes.
   - MDX/markdown component docs with type-checked code samples, not screenshots.

Readiness checklist from the page:

- Tokens are findable without docs.
- Names are semantic.
- Components are enumerable with prop shapes.
- Patterns are shown as code.
- MCP (optional here).
- Union-typed variants.

### Tools ([source](https://www.designsystems.one/tools))

- [Token Generator](https://www.designsystems.one/tools/token-generator): OKLCH scales anchored on the brand hex, APCA contrast, light + dark semantic roles, 12 exports including W3C and Tokens Studio. Use it to generate the palette.
- [Website → design.md](https://www.designsystems.one/tools/website-to-design-md): extracts design.md + tokens.css + W3C JSON + Tailwind theme from a URL. Could bootstrap from a reference site, but it sends the URL to their server.
- [Agent-Ready Check](https://www.designsystems.one/tools/agent-ready-check): scores llms.txt / registry / DTCG / MCP / Code Connect. Run it after deploy.
- [Accessibility Checklist](https://www.designsystems.one/tools/accessibility-checklist), [Grid Builder](https://www.designsystems.one/tools/grid-builder) (exports W3C layout tokens), [Token Diff](https://www.designsystems.one/tools/token-diff).

## 6. Taste rules: the 15 most relevant

Sources: `.agents/skills/high-end-visual-design` (HEVD), `.agents/skills/design-taste-frontend` (DTF), `emil-design-eng` (EDE). The emil skill was found via `skill://emil-design-eng`. It is not at the given `.agents/skills/emil-design-eng/` path.

1. **Write the Design Read first.** Dials for this brief: "premium consumer / brand", about VARIANCE 7, MOTION 6-7, DENSITY 3 (DTF §0-1).
2. **Palette:** max one accent, saturation under 80%, one palette per page, no AI purple (DTF §4.2).
   - The beige/cream + brass/oxblood + espresso family (`#f5f1ea`, `#b08947`, `#1a1714`…) is banned as a default.
   - A paper menu tempts exactly that. Take the paper colour from the real menu photos and pair it with a sea accent: navy/powder blue (Gilli) or sea blue + sand (Faith Ibiza).
3. **Serif only when justified** (DTF §4.1). A heritage printed menu justifies one display serif. Banned defaults: Fraunces, Instrument Serif. Emphasis uses italic or bold of the same family. Allow italic descender clearance (`leading` ≥ 1.1).
4. **Banned:** Inter, Roboto, Arial, Open Sans, Helvetica as defaults, thick Lucide/FontAwesome icons, 1 px grey borders, harsh black shadows (HEVD §2). Use Phosphor Light-style icons from one family (DTF §3.C).
5. **Hero:** fits the first viewport (`min-h-[100dvh]`, never `h-screen`). Headline ≤ 2 lines, subtext ≤ 20 words, max 4 text elements, top padding ≤ `pt-24`. No review chips inside the hero (they go below it) (DTF §4.7).
6. **One label per intent** ("Chiama", "Indicazioni", "WhatsApp"; never also "Contattaci"). CTAs fit on one line and pass AA contrast over photos (use a scrim) (DTF §4.5).
7. **Section rhythm:** no layout family repeats, max 2 consecutive image/text splits, max 1 eyebrow per 3 sections, max one marquee per page (DTF §4.7, §5).
8. **Every animation must be motivated** (hierarchy, story, feedback, state). "GSAP-for-show" fails (DTF §5).
9. **Never `window.addEventListener('scroll')`.** Use ScrollTrigger, IntersectionObserver or CSS `animation-timeline` (DTF §5.D, HEVD §5.C).
10. **Do not mix GSAP/three.js with Motion in the same component tree.** Isolate each as a client leaf with cleanup (DTF §10).
11. **Animate only `transform` and `opacity`.** Use `will-change` sparingly. Apply `backdrop-blur` only to fixed elements. Put grain on a fixed `pointer-events-none` layer only (HEVD §6, DTF §6).
12. **Easing:** custom curves only, never `ease-in` on UI.
    - ease-out `cubic-bezier(0.23,1,0.32,1)` for enter.
    - `cubic-bezier(0.77,0,0.175,1)` for on-screen moves.
    - Drawer curve `cubic-bezier(0.32,0.72,0,1)` (EDE).
13. **Timing:** UI motion stays under 300 ms (rail expand ~200-250 ms, button press 100-160 ms). Stagger 30-80 ms. Exit faster than enter. Never animate from `scale(0)`; start ≥ 0.95 with opacity. Press feedback is `scale(0.97)` (EDE).
14. **Hover only behind `@media (hover:hover) and (pointer:fine)`.** The rail needs a tap or focus path on touch. Rail expand/collapse uses interruptible transitions, not keyframes (EDE).
15. **Reduced motion is mandatory.** Under reduce, keep opacity/colour fades and drop movement, parallax, curl and 3D (instant page turn, static hero poster). Lazy-load three.js. Targets: LCP < 2.5 s, CLS < 0.1 (DTF §6, EDE).

Also:

- No em-dashes in site copy (DTF §9.G).
- Review quotes ≤ 3 lines (DTF §4.10).
- Both light and dark modes designed (DTF §6.C).

## 7. Open items

- siteinspire.com was not reachable (HTTP 429).
- Live motion on the reference sites was not observed. Descriptions come from Awwwards element titles and screenshots.
- Licenses marked [UNKNOWN] must be checked before reusing any code.
- The Wawa book has no license, so reimplement only.
- `@gullabs/flipbook` is not yet verified on a physical iOS device (its README says so).