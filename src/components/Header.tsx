import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SITE_LANGS } from '../i18n'
import { menuHref } from '../lib/router'
import { IconBook } from './Icons'
import { gsap, ScrollTrigger, scrollToId } from './motion'

type Tone = 'dark' | 'light'

/**
 * Tracks the tone of whichever `[data-tone]` section sits under the header
 * (a band covering the top 5% of the viewport, inside the 64 px bar on phones
 * and desktops alike). Pure IntersectionObserver, no scroll listener.
 */
function useToneUnderHeader(): Tone {
  const [tone, setTone] = useState<Tone>('dark')
  useEffect(() => {
    const sections = [...document.querySelectorAll<HTMLElement>('[data-tone]')]
    if (!sections.length) return
    const observer = new IntersectionObserver(
      () => {
        // Only runs when a section crosses the band, so measuring here is cheap; it also stays correct
        // after instant jumps where enter/leave records for different sections arrive in separate batches.
        const probe = Math.min(32, window.innerHeight * 0.05)
        const top = sections.find((s) => {
          const r = s.getBoundingClientRect()
          return r.top <= probe && r.bottom > probe
        })
        if (top) setTone(top.dataset.tone === 'dark' ? 'dark' : 'light')
      },
      { rootMargin: '0px 0px -95% 0px', threshold: 0 },
    )
    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])
  return tone
}

export function Header() {
  const { t, i18n } = useTranslation()
  const tone = useToneUnderHeader()
  const dark = tone === 'dark'
  const lang = i18n.resolvedLanguage === 'en' ? 'en' : 'it'

  const headerRef = useRef<HTMLElement>(null)
  const logoRef = useRef<HTMLImageElement>(null)

  useLayoutEffect(() => {
    const logo = logoRef.current
    if (!logo) return

    // Match both motion preferences: normal-motion phones match neither
    // condition in useMotion's desktop/reduced-motion setup.
    const mm = gsap.matchMedia(headerRef)
    mm.add({
      reduce: '(prefers-reduced-motion: reduce)',
      normal: '(prefers-reduced-motion: no-preference)',
    }, (ctx) => {
      if (ctx.conditions?.reduce) {
        gsap.set(logo, { scale: window.scrollY > 0 ? 1 : 2 })
        ScrollTrigger.create({
          start: 1,
          onEnter: () => gsap.set(logo, { scale: 1 }),
          onLeaveBack: () => gsap.set(logo, { scale: 2 }),
        })
        return
      }

      gsap.fromTo(logo, { scale: 2 }, {
        scale: 1,
        ease: 'none',
        scrollTrigger: { start: 0, end: 160, scrub: true, invalidateOnRefresh: true },
      })
    })
    return () => mm.revert()
  }, [])

  return (
    <header
      ref={headerRef}
      className={`nav-bar fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)] ${
        dark ? 'text-paper' : 'border-b border-ink/10 bg-paper/80 text-ink backdrop-blur-md'
      }`}
    >
      <div className="mx-auto grid h-16 max-w-[1600px] grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 sm:px-4 md:h-[72px] md:gap-3 md:px-8">
        <div role="group" aria-label={t('nav.language')} className="flex min-w-0 items-center justify-self-start text-[12px] font-semibold tracking-[0.14em] md:text-[13px]">
          {SITE_LANGS.map((l, i) => (
            <span key={l} className="flex items-center">
              {i > 0 && <span aria-hidden="true" className="px-1 opacity-40">/</span>}
              <button
                type="button"
                lang={l}
                aria-pressed={lang === l}
                title={t(`langs.${l}`)}
                onClick={() => void i18n.changeLanguage(l)}
                className={`lang-btn press min-h-11 min-w-9 rounded-full px-1.5 uppercase transition-opacity ${
                  lang === l ? 'opacity-100 underline decoration-sun decoration-2 underline-offset-[6px]' : 'opacity-60'
                }`}
              >
                {l}
              </button>
            </span>
          ))}
        </div>

        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault()
            scrollToId('top')
          }}
          aria-label={t('nav.home')}
          className="flex items-center justify-self-center py-1"
        >
          <img
            ref={logoRef}
            src={`${import.meta.env.BASE_URL}logo-header.svg`}
            alt="La Dolce Isola"
            className={`h-9 w-auto origin-top md:h-11 transition-[filter] duration-300 ${dark ? 'brightness-0 invert' : ''}`}
            style={{ transform: 'scale(2)' }}
            draggable={false}
          />
        </a>

        <a
          href={menuHref()}
          className={`press inline-flex min-h-11 min-w-0 items-center gap-1 justify-self-end rounded-full px-2.5 text-[12px] font-bold tracking-[0.14em] uppercase shadow-[0_6px_20px_-8px_rgb(15_20_48/0.45)] sm:gap-1.5 sm:px-3.5 md:gap-2 md:px-5 md:text-[13px] md:tracking-[0.16em] ${
            dark ? 'btn-paper bg-paper text-ink' : 'btn-ink bg-ink text-paper'
          }`}
        >
          <IconBook className="text-[17px] md:text-[18px]" />
          <span className="hidden sm:inline">{t('nav.menu')}</span>
        </a>
      </div>
    </header>
  )
}
