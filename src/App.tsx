import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import './components/shell.css'
import { Header } from './components/Header'
import { gsap, prefersReducedMotion, ScrollTrigger } from './components/motion'
import { Swirl } from './components/Swirl'
import { useRoute } from './lib/router'
import { About } from './sections/About'
import { Contacts } from './sections/Contacts'
import { Footer } from './sections/Footer'
import { Hero } from './sections/Hero'
import { Location } from './sections/Location'
import { MenuTeaser } from './sections/MenuTeaser'
import { Reviews } from './sections/Reviews'

const loadMenu = () => import('./menu/MenuBook')
const MenuBook = lazy(() => loadMenu().then((m) => ({ default: m.MenuBook })))

type View = 'home' | 'menu'

/** Runs once when its Suspense boundary has resolved and committed (MenuBook chunk loaded and mounted). */
function OnCommit({ run }: { run: () => void }) {
  // Mount-only on purpose: later hash changes inside the menu must not lift the curtain again.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(run, [])
  return null
}

/**
 * Glaze curtain between home and menu: a cobalt panel that wipes up over the
 * page, the view swaps underneath, then it wipes away upwards. Reduced motion
 * keeps only a short cross-fade.
 */
function useCurtain(curtain: RefObject<HTMLDivElement | null>) {
  const cover = (then: () => void) => {
    const el = curtain.current
    if (!el) return then()
    gsap.killTweensOf(el)
    gsap.set(el, { visibility: 'visible' })
    if (prefersReducedMotion()) {
      gsap.fromTo(el, { opacity: 0, clipPath: 'inset(0% 0% 0% 0%)' }, { opacity: 1, duration: 0.18, onComplete: then })
      return
    }
    gsap.fromTo(
      el,
      { opacity: 1, clipPath: 'inset(100% 0% 0% 0%)' },
      { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.55, ease: 'ldi-move', onComplete: then },
    )
    gsap.fromTo(el.querySelector('[data-curtain-mark]'), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.2, ease: 'ldi-out' })
  }
  const reveal = () => {
    const el = curtain.current
    if (!el) return
    gsap.killTweensOf(el)
    const done = () => gsap.set(el, { visibility: 'hidden' })
    if (prefersReducedMotion()) {
      gsap.to(el, { opacity: 0, duration: 0.18, onComplete: done })
      return
    }
    gsap.to(el, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.6, delay: 0.08, ease: 'ldi-move', onComplete: done })
  }
  return { cover, reveal }
}

export default function App() {
  const { t } = useTranslation()
  const route = useRoute()
  const [view, setView] = useState<View>(route.name)
  const curtain = useRef<HTMLDivElement>(null)
  const homeScroll = useRef(0)
  const { cover, reveal } = useCurtain(curtain)

  // Scroll is restored by hand when the menu closes; the browser must not fight it.
  useEffect(() => {
    history.scrollRestoration = 'manual'
  }, [])

  // Warm the menu chunk once the home page is idle, so the first open is instant.
  useEffect(() => {
    const id = window.setTimeout(() => void loadMenu(), 2500)
    return () => window.clearTimeout(id)
  }, [])

  useEffect(() => {
    if (route.name === view) return
    if (route.name === 'menu') {
      homeScroll.current = window.scrollY
      void loadMenu()
      cover(() => setView('menu'))
    } else {
      cover(() => setView('home'))
    }
    // `cover` is stable in behaviour; only the route drives transitions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.name])

  // Back on home: put the reader where they left, re-measure triggers, then lift the curtain.
  useLayoutEffect(() => {
    if (view !== 'home') return
    if (curtain.current?.style.visibility !== 'visible') return
    window.scrollTo(0, homeScroll.current)
    ScrollTrigger.refresh()
    reveal()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view])

  // Direct load of #/menu: the curtain starts closed and lifts once the book has mounted.
  const initialMenu = useRef(route.name === 'menu')

  return (
    <div className="grain min-h-[100dvh]">
      <a
        href="#main"
        className="sr-only z-[90] rounded-full bg-ink px-4 py-2 text-paper focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        {t('nav.skip')}
      </a>

      <div hidden={view !== 'home'}>
        {view === 'home' && <Header />}
        <main id="main">
          <Hero />
          <MenuTeaser />
          <About />
          <Reviews />
          <Location />
          <Contacts />
        </main>
        <Footer />
      </div>

      {view === 'menu' && (
        <Suspense fallback={null}>
          <MenuBook initialCategoryId={route.name === 'menu' ? route.categoryId : null} />
          <OnCommit
            run={() => {
              window.scrollTo(0, 0)
              initialMenu.current = false
              reveal()
            }}
          />
        </Suspense>
      )}

      <div
        ref={curtain}
        className="fixed inset-0 z-[80] flex flex-col items-center justify-center gap-4 bg-ink text-paper"
        style={initialMenu.current ? { visibility: 'visible' } : { visibility: 'hidden', clipPath: 'inset(100% 0% 0% 0%)' }}
      >
        <div data-curtain-mark="" className="flex flex-col items-center gap-3">
          <Swirl still className="h-10 w-[180px] text-sun" weight={1.8} />
          <p aria-hidden="true" className="font-script text-[44px] leading-none md:text-[56px]">
            La Dolce Isola
          </p>
          {/* Only the way in needs a word; going back home the curtain is a pure wipe. */}
          <p role="status" className="min-h-4 text-[11px] font-semibold tracking-[0.28em] text-paper/70 uppercase">
            {view === 'home' || initialMenu.current ? t('transition.loading') : ''}
          </p>
        </div>
      </div>
    </div>
  )
}
