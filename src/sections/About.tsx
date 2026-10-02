import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { drawSwirls, gsap, revealUp, useMotion } from '../components/motion'
import { Photo } from '../components/Photo'
import { Swirl } from '../components/Swirl'

type Fact = { value: string; label: string }

export function About() {
  const { t } = useTranslation()
  const root = useRef<HTMLElement>(null)

  useMotion(root, ({ reduce }, el) => {
    if (reduce) return
    drawSwirls(el)
    revealUp(el)
    // Photos open like shutters: main wipes up from the base, accent in from the side.
    el.querySelectorAll<HTMLElement>('[data-clip]').forEach((fig) => {
      const from =
        fig.dataset.clip === 'side'
          ? 'inset(0% 100% 0% 0% round 24px)'
          : 'inset(100% 0% 0% 0% round 24px)'
      const img = fig.querySelector('img')
      gsap
        .timeline({ scrollTrigger: { trigger: fig, start: 'top 85%', once: true } })
        .fromTo(fig, { clipPath: from }, { clipPath: 'inset(0% 0% 0% 0% round 24px)', duration: 1.3, ease: 'ldi-drawer' })
        .fromTo(img, { scale: 1.18 }, { scale: 1, duration: 1.6, ease: 'ldi-out' }, 0)
    })
  })

  const facts = t('about.facts', { returnObjects: true }) as Fact[]

  return (
    <section
      ref={root}
      id="chi-siamo"
      data-tone="light"
      aria-labelledby="about-title"
      className="relative overflow-hidden bg-paper-2 px-5 py-24 md:px-14 md:py-36 lg:px-20"
    >
      <div className="mx-auto grid max-w-[1360px] gap-14 md:grid-cols-12 md:items-start md:gap-8">

        {/* Large photo — first on mobile, left column on desktop */}
        <figure
          data-clip="up"
          className="overflow-hidden rounded-[24px] md:col-span-6"
        >
          <Photo
            id="28"
            alt={t('about.barAlt')}
            sizes="(min-width: 768px) 46vw, 100vw"
            className="aspect-[4/3] w-full object-cover md:aspect-[3/4]"
          />
        </figure>

        {/* Copy + accent photo — second on mobile, right column on desktop */}
        <div className="md:col-span-6 md:pt-10">
          <div className="max-w-3xl">
            <p
              data-reveal=""
              className="text-[11px] font-semibold tracking-[0.28em] text-ink-2 uppercase md:text-[12px]"
            >
              {t('about.kicker')}
            </p>
            <Swirl
              variant="vine"
              still
              weight={0.9}
              className="mt-3 h-5 w-[120px] text-bordeaux/40"
            />
            <h2
              id="about-title"
              data-reveal=""
              className="mt-4 font-display text-[clamp(2rem,8.4vw,2.75rem)] leading-[1.04] font-normal tracking-[-0.015em] text-balance md:text-[clamp(2.75rem,4.4vw,4.25rem)]"
            >
              {t('about.title1')}
              <br />
              <em className="text-ink-2 italic">{t('about.title2')}</em>
            </h2>
            <p
              data-reveal=""
              className="mt-6 max-w-[48ch] text-[16px] leading-[1.75] text-ink/80 md:text-[17px]"
            >
              {t('about.body')}
            </p>
          </div>

          {/* Accent photo — enoteca corner */}
          <figure
            data-clip="side"
            className="mt-10 overflow-hidden rounded-[24px] md:mt-8"
          >
            <Photo
              id="53"
              alt={t('about.wineAlt')}
              sizes="(min-width: 768px) 32vw, 100vw"
              className="aspect-[3/2] w-full object-cover"
            />
          </figure>

          {/* Facts row */}
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

      </div>
    </section>
  )
}
