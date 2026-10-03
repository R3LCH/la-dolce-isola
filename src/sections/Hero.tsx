import { lazy, Suspense, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { IconArrow, IconPin } from '../components/Icons'
import { gsap, scrollToId, SplitText, useMotion } from '../components/motion'
import { Swirl } from '../components/Swirl'
import { menuHref } from '../lib/router'
import { asset } from '../lib/venue'

const HeroScene = lazy(() => import('../hero/HeroScene'))

export function Hero() {
  const { t, i18n } = useTranslation()
  const root = useRef<HTMLElement>(null)

  useMotion(
    root,
    ({ reduce }, el) => {
      const title = el.querySelector<HTMLElement>('[data-hero-title]')
      const fades = el.querySelectorAll('[data-hero-fade]')
      const frame = el.querySelector('[data-hero-frame]')
      if (!title) return
      if (reduce) {
        gsap.from([title, ...fades], { opacity: 0, duration: 0.6, ease: 'ldi-out', stagger: 0.05 })
        return
      }
      // Letters rise out of a per-line mask, as if pressed up through the glaze.
      const split = SplitText.create(title, { type: 'lines,chars', mask: 'lines', aria: 'auto' })
      const tl = gsap.timeline({ defaults: { ease: 'ldi-out' } })
      tl.from(frame, { clipPath: 'inset(6% 6% 6% 6% round 40px)', duration: 1.4, ease: 'ldi-drawer' }, 0)
        .from(split.chars, { yPercent: 115, rotate: 6, duration: 1.1, stagger: 0.028 }, 0.25)
        .from(fades, { opacity: 0, y: 18, duration: 0.8, stagger: 0.07 }, 0.75)
      // Gentle parallax as the hero leaves: the frame recedes, the copy lifts.
      gsap.to(el.querySelector('[data-hero-copy]'), {
        yPercent: -18,
        opacity: 0.2,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true },
      })
    },
    [i18n.resolvedLanguage],
  )

  return (
    <section ref={root} id="top" tabIndex={-1} data-tone="dark" className="relative bg-paper p-2 outline-none md:p-3">
      <div
        data-hero-frame=""
        className="hero-frame hero-ground relative isolate flex min-h-[calc(100dvh-16px)] flex-col overflow-hidden rounded-[22px] text-paper md:min-h-[calc(100dvh-24px)] md:rounded-[32px]"
      >
        {/* The same clean logo remains visible while 3D loads or when WebGL is unavailable. */}
        <div className="hero-poster pointer-events-none absolute inset-x-0 top-[13%] mx-auto w-[min(60%,30.4dvh)] max-w-[280px] md:inset-x-auto md:top-1/2 md:right-[8%] md:w-[min(32%,60dvh)] md:max-w-[520px] md:-translate-y-1/2">
          <img
            src={asset('hero-logo.svg')}
            width={1000}
            height={1250}
            alt={t('hero.posterAlt')}
            fetchPriority="high"
            className="h-auto w-full drop-shadow-[0_24px_30px_rgb(46_7_16/0.35)]"
          />
        </div>

        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>

        <Swirl
          variant="vine"
          still
          weight={1.2}
          className="pointer-events-none absolute -bottom-6 left-0 w-[220%] text-paper/15 md:w-[120%]"
        />

        <div
          data-hero-copy=""
          className="relative z-10 mt-auto px-5 pt-[58vh] pb-8 md:max-w-[62%] md:px-14 md:pt-40 md:pb-16 lg:px-20"
        >
          <p data-hero-fade="" className="mb-5 text-[11px] font-semibold tracking-[0.28em] text-sun uppercase md:text-[12px]">
            {t('hero.kicker')}
          </p>
          <h1
            key={i18n.resolvedLanguage}
            data-hero-title=""
            className="font-display text-[clamp(2.6rem,11.5vw,4rem)] leading-[0.98] font-medium tracking-[-0.02em] text-balance md:text-[clamp(4rem,6.6vw,7.25rem)]"
          >
            {t('hero.line1')}{' '}
            <br />
            {t('hero.line2a')}
            <em className="font-medium text-sun italic">{t('hero.line2b')}</em>
          </h1>
          <p data-hero-fade="" className="mt-5 max-w-[34ch] text-[15px] leading-relaxed text-paper/80 md:mt-7 md:text-[17px]">
            {t('hero.sub')}
          </p>
          <div data-hero-fade="" className="mt-7 flex flex-wrap items-center gap-3 md:mt-9">
            <a
              href={menuHref()}
              className="press btn-paper link-arrow inline-flex min-h-12 items-center gap-3 rounded-full bg-paper py-3 pr-4 pl-6 text-[15px] font-semibold text-ink"
            >
              {t('hero.cta')}
              <span className="grid size-8 place-items-center rounded-full bg-ink text-paper">
                <IconArrow className="tile-arrow text-[16px]" />
              </span>
            </a>
            <a
              href="#dove"
              onClick={(e) => {
                e.preventDefault()
                scrollToId('dove')
              }}
              className="press inline-flex min-h-12 items-center gap-2 rounded-full px-4 text-[15px] font-medium text-paper/85 underline decoration-paper/30 underline-offset-[6px]"
            >
              <IconPin className="text-[18px]" />
              {t('hero.where')}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
