import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { drawSwirls, gsap, revealUp, useMotion } from '../components/motion'
import { Photo } from '../components/Photo'
import { SectionHead } from '../components/SectionHead'

type Fact = { value: string; label: string }

export function About() {
  const { t } = useTranslation()
  const root = useRef<HTMLElement>(null)

  useMotion(root, ({ reduce, desktop }, el) => {
    if (reduce) return
    drawSwirls(el)
    revealUp(el)
    // Photos open like shutters: one wipes up from the base, the other in from the side.
    el.querySelectorAll<HTMLElement>('[data-clip]').forEach((fig) => {
      const from = fig.dataset.clip === 'side' ? 'inset(0% 100% 0% 0% round 24px)' : 'inset(100% 0% 0% 0% round 24px)'
      const img = fig.querySelector('img')
      gsap
        .timeline({ scrollTrigger: { trigger: fig, start: 'top 85%', once: true } })
        .fromTo(fig, { clipPath: from }, { clipPath: 'inset(0% 0% 0% 0% round 24px)', duration: 1.3, ease: 'ldi-drawer' })
        .fromTo(img, { scale: 1.18 }, { scale: 1, duration: 1.6, ease: 'ldi-out' }, 0)
    })
    if (desktop) {
      // The small portrait drifts against the large photo while scrolling through.
      gsap.fromTo(
        el.querySelector('[data-drift]'),
        { yPercent: 12 },
        { yPercent: -12, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } },
      )
    }
  })

  const facts = t('about.facts', { returnObjects: true }) as Fact[]

  return (
    <section ref={root} id="chi-siamo" data-tone="light" aria-labelledby="about-title" className="relative overflow-hidden bg-paper-2 px-5 py-24 md:px-14 md:py-36 lg:px-20">
      <div className="mx-auto grid max-w-[1360px] gap-14 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-5 md:pt-10">
          <SectionHead
            id="about-title"
            kicker={t('about.kicker')}
            title={
              <>
                {t('about.title1')}
                <br />
                <em className="text-ink-2 italic">{t('about.title2')}</em>
              </>
            }
          >
            <p data-reveal="" className="mt-6 max-w-[48ch] text-[16px] leading-[1.75] text-ink/80 md:text-[17px]">
              {t('about.body')}
            </p>
          </SectionHead>
          <dl className="mt-10 grid grid-cols-3 gap-3 border-t border-ink/15 pt-6 md:mt-14">
            {facts.map((f) => (
              <div key={f.label} data-reveal="">
                <dt className="sr-only">{f.label}</dt>
                <dd className="font-display text-[22px] leading-none md:text-[28px]">{f.value}</dd>
                <dd className="mt-2 text-[12px] leading-snug text-ink/65 md:text-[13px]">{f.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative md:col-span-7 md:pl-8">
          <figure data-clip="up" className="relative overflow-hidden rounded-[24px]">
            <Photo
              id="17"
              alt={t('about.barAlt')}
              sizes="(min-width: 768px) 52vw, 100vw"
              className="aspect-[4/3] w-full object-cover"
            />
            <figcaption className="absolute top-4 left-4 rounded-full bg-paper/90 px-3 py-1.5 text-[11px] font-semibold tracking-[0.2em] text-ink uppercase backdrop-blur-sm">
              {t('about.barCaption')}
            </figcaption>
          </figure>
          <figure
            data-drift=""
            className="relative -mt-20 ml-auto w-[58%] md:absolute md:-bottom-24 md:left-0 md:mt-0 md:ml-0 md:w-[40%]"
          >
            <div data-clip="side" className="overflow-hidden rounded-[24px] ring-8 ring-paper-2">
              <Photo id="53" alt={t('about.wineAlt')} sizes="(min-width: 768px) 24vw, 58vw" className="aspect-[3/4] w-full object-cover" />
            </div>
            <figcaption className="mt-3 text-right text-[11px] font-semibold tracking-[0.2em] text-ink-2 uppercase md:text-left">
              {t('about.wineCaption')}
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  )
}
