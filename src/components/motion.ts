import { gsap } from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useLayoutEffect, type DependencyList, type RefObject } from 'react'

// Registered once for the whole app; the eases mirror the CSS tokens in index.css.
gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase)
CustomEase.create('ldi-out', '0.23,1,0.32,1')
CustomEase.create('ldi-move', '0.77,0,0.175,1')
CustomEase.create('ldi-drawer', '0.32,0.72,0,1')

export { gsap, ScrollTrigger, SplitText }

export type MotionFlags = { reduce: boolean; desktop: boolean }

/**
 * Scoped GSAP setup: runs `setup` inside gsap.matchMedia so every tween,
 * SplitText and ScrollTrigger is reverted on unmount and re-created when
 * reduced motion or the desktop breakpoint flips.
 */
export function useMotion(
  scope: RefObject<HTMLElement | null>,
  setup: (flags: MotionFlags, el: HTMLElement) => void,
  deps: DependencyList = [],
): void {
  useLayoutEffect(() => {
    const el = scope.current
    if (!el) return
    const mm = gsap.matchMedia(el)
    mm.add(
      { reduce: '(prefers-reduced-motion: reduce)', desktop: '(min-width: 768px)' },
      (ctx) => {
        const c = ctx.conditions as MotionFlags
        setup({ reduce: c.reduce, desktop: c.desktop }, el)
      },
      el,
    )
    return () => mm.revert()
    // `setup` is intentionally excluded: callers pass the values it reads through `deps`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, ...deps])
}

export const prefersReducedMotion = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** In-page navigation that keeps the hash router untouched (`#/...` stays the route). */
export function scrollToId(id: string): void {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
  el.focus({ preventScroll: true })
}

/**
 * Scroll-drawn majolica line art: every `[data-swirl]` SVG inside `root`
 * inks its strokes as it crosses the viewport, then its berry dots bloom.
 */
export function drawSwirls(root: HTMLElement): void {
  root.querySelectorAll<SVGSVGElement>('svg[data-swirl]').forEach((svg) => {
    const paths = svg.querySelectorAll('[data-swirl-path]')
    const dots = svg.querySelectorAll('[data-swirl-dot]')
    gsap.set(paths, { strokeDasharray: 1, strokeDashoffset: 1 })
    gsap.set(dots, { opacity: 0, scale: 0.6, transformOrigin: '50% 50%', transformBox: 'fill-box' })
    gsap
      .timeline({ scrollTrigger: { trigger: svg, start: 'top 92%', end: 'top 48%', scrub: 0.6 } })
      .to(paths, { strokeDashoffset: 0, ease: 'none', stagger: 0.04, duration: 1 })
      .to(dots, { opacity: 1, scale: 1, ease: 'ldi-out', stagger: 0.02, duration: 0.3 }, '-=0.35')
  })
}

/**
 * Tile-mosaic reveal: the glazed cells of every `[data-mosaic]` overlay inside
 * `root` lift away in a diagonal wave, like tiles being taken off a wall.
 */
export function revealMosaics(root: HTMLElement): void {
  root.querySelectorAll<HTMLElement>('[data-mosaic]').forEach((grid) => {
    const cols = Number(grid.dataset.cols)
    const rows = Number(grid.dataset.rows)
    const img = grid.parentElement?.querySelector('[data-mosaic-img]') ?? null
    gsap.set(grid, { display: 'grid' })
    const tl = gsap.timeline({ scrollTrigger: { trigger: grid, start: 'top 82%', once: true } })
    tl.to(grid.children, {
      scale: 0.4,
      rotate: 8,
      opacity: 0,
      duration: 0.55,
      ease: 'ldi-out',
      stagger: { grid: [rows, cols], from: 'start', amount: 0.55 },
    })
    if (img) tl.fromTo(img, { scale: 1.14 }, { scale: 1, duration: 1.3, ease: 'ldi-out' }, 0)
    tl.set(grid, { display: 'none' })
  })
}

/** Fade-and-rise for every `[data-reveal]` inside `root`, batched so neighbours stagger together. */
export function revealUp(root: HTMLElement): void {
  const items = root.querySelectorAll<HTMLElement>('[data-reveal]')
  if (!items.length) return
  gsap.set(items, { opacity: 0, y: 28 })
  ScrollTrigger.batch(items, {
    start: 'top 90%',
    once: true,
    onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.9, ease: 'ldi-out', stagger: 0.06, overwrite: true }),
  })
}
