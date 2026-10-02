import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { IconArrowUpRight, IconClock, IconDirections, IconPin } from '../components/Icons'
import { drawSwirls, gsap, revealUp, useMotion } from '../components/motion'
import { SectionHead } from '../components/SectionHead'
import { VENUE } from '../lib/venue'

export function Location() {
  const { t } = useTranslation()
  const root = useRef<HTMLElement>(null)

  useMotion(root, ({ reduce }, el) => {
    if (reduce) return
    drawSwirls(el)
    revealUp(el)
    gsap.fromTo(
      el.querySelector('[data-map]'),
      { clipPath: 'inset(8% 8% 8% 8% round 40px)' },
      {
        clipPath: 'inset(0% 0% 0% 0% round 28px)',
        duration: 1.3,
        ease: 'ldi-drawer',
        scrollTrigger: { trigger: el.querySelector('[data-map]'), start: 'top 85%', once: true },
      },
    )
  })

  return (
    <section ref={root} id="dove" tabIndex={-1} data-tone="light" aria-labelledby="location-title" className="relative bg-paper px-5 py-24 outline-none md:px-14 md:py-36 lg:px-20">
      <div className="mx-auto grid max-w-[1360px] gap-12 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-5 md:py-6">
          <SectionHead id="location-title" kicker={t('location.kicker')} title={VENUE.address}>
            <p data-reveal="" className="mt-3 font-display text-[22px] text-ink-2 italic md:text-[26px]">
              {VENUE.city}
            </p>
            <p data-reveal="" className="mt-5 max-w-[40ch] text-[16px] leading-relaxed text-ink/75">
              {t('location.note')}
            </p>
          </SectionHead>

          <dl className="mt-10 divide-y divide-ink/12 border-y border-ink/12">
            <div data-reveal="" className="flex items-center gap-4 py-5">
              <dt className="flex items-center gap-3 text-[12px] font-semibold tracking-[0.2em] text-ink-2 uppercase">
                <IconClock className="text-[20px]" />
                {t('location.hoursLabel')}
              </dt>
              <dd className="ml-auto text-right">
                <span className="block text-[16px] font-semibold tabular-nums">{t('location.hours', { hours: VENUE.hours })}</span>
                <span className="block text-[13px] text-ink/60">{t('location.closed')}</span>
              </dd>
            </div>
            <div data-reveal="" className="flex items-center gap-4 py-5">
              <dt className="sr-only">{t('location.kicker')}</dt>
              <IconPin aria-hidden="true" className="shrink-0 text-[20px] text-ink-2" />
              <dd className="text-[16px]">
                {VENUE.address}, {VENUE.city}
              </dd>
            </div>
          </dl>

          <div data-reveal="" className="mt-8 flex flex-wrap gap-3">
            <a
              href={VENUE.directionsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="press btn-ink inline-flex min-h-12 items-center gap-2.5 rounded-full bg-ink px-6 text-[15px] font-semibold text-paper"
            >
              <IconDirections className="text-[19px]" />
              {t('location.directions')}
            </a>
            <a
              href={VENUE.mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="press contact-row inline-flex min-h-12 items-center gap-2 rounded-full border border-ink/25 px-5 text-[15px] font-medium text-ink"
            >
              {t('location.openMaps')}
              <IconArrowUpRight className="tile-arrow text-[16px]" />
            </a>
          </div>
        </div>

        <div className="md:col-span-7">
          <div data-map="" className="relative h-[420px] overflow-hidden rounded-[28px] bg-paper-2 ring-1 ring-ink/10 md:h-full md:min-h-[560px]">
            <iframe
              src={VENUE.mapsEmbed}
              title={t('location.mapTitle')}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 size-full border-0 grayscale-[35%] sepia-[12%]"
              allowFullScreen
            />
            <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[28px] ring-8 ring-paper/70 ring-inset" />
          </div>
        </div>
      </div>

      <div data-reveal="" className="mx-auto mt-12 max-w-[1360px] border-t border-ink/12 pt-10">
        <p className="max-w-[56ch] text-[16px] leading-relaxed text-ink/75">
          {t('location.reviewCta')}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={VENUE.googleReviewHref}
            target="_blank"
            rel="noopener noreferrer"
            className="press btn-ink inline-flex min-h-12 items-center gap-2.5 rounded-full bg-ink px-6 text-[15px] font-semibold text-paper"
          >
            {t('location.reviewGoogle')}
            <IconArrowUpRight className="text-[16px]" />
          </a>
          <a
            href={VENUE.tripadvisorReviewHref}
            target="_blank"
            rel="noopener noreferrer"
            className="press contact-row inline-flex min-h-12 items-center gap-2 rounded-full border border-ink/25 px-5 text-[15px] font-medium text-ink"
          >
            {t('location.reviewTripadvisor')}
            <IconArrowUpRight className="tile-arrow text-[16px]" />
          </a>
        </div>
      </div>
    </section>
  )
}
