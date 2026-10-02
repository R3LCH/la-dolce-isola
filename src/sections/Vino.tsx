import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { drawSwirls, gsap, revealUp, useMotion } from '../components/motion'
import { IconArrow } from '../components/Icons'
import { Photo } from '../components/Photo'
import { SectionHead } from '../components/SectionHead'
import { menuHref } from '../lib/router'

export function Vino() {
  const { t } = useTranslation()
  const root = useRef<HTMLElement>(null)

  useMotion(root, ({ reduce }, el) => {
    if (reduce) return
    drawSwirls(el)
    revealUp(el)
    el.querySelectorAll<HTMLElement>('[data-clip]').forEach((fig) => {
      const img = fig.querySelector('img')
      gsap
        .timeline({ scrollTrigger: { trigger: fig, start: 'top 85%', once: true } })
        .fromTo(fig, { clipPath: 'inset(0% 100% 0% 0% round 24px)' }, { clipPath: 'inset(0% 0% 0% 0% round 24px)', duration: 1.3, ease: 'ldi-drawer' })
        .fromTo(img, { scale: 1.18 }, { scale: 1, duration: 1.6, ease: 'ldi-out' }, 0)
    })
  })

  return (
    <section
      ref={root}
      id="vino"
      data-tone="light"
      aria-labelledby="vino-title"
      className="relative overflow-hidden bg-paper-2 px-5 py-24 text-ink md:px-14 md:py-36 lg:px-20"
    >
      <div className="mx-auto grid max-w-[1360px] gap-14 md:grid-cols-12 md:gap-8">
        {/* Copy — left 6 cols on desktop; first in DOM so mobile shows text before photo */}
        <div className="flex flex-col justify-center md:col-span-6 md:pr-10">
          <SectionHead
            id="vino-title"
            kicker={t('vino.kicker')}
            title={t('vino.title')}
            tone="ink"
          >
            <p
              data-reveal=""
              className="mt-6 max-w-[48ch] text-[16px] leading-[1.75] text-ink/80 md:text-[17px]"
            >
              {t('vino.body')}
            </p>
            <a
              data-reveal=""
              href={menuHref('selezione-vini')}
              className="press tile mt-7 inline-flex min-h-12 items-center gap-3 rounded-full bg-ink py-3 pr-4 pl-6 text-[15px] font-semibold text-paper"
            >
              {t('vino.cta')}
              <span className="grid size-8 place-items-center rounded-full bg-paper/15">
                <IconArrow className="tile-arrow text-[16px]" />
              </span>
            </a>
          </SectionHead>
        </div>

        {/* Photo — right 6 cols on desktop, full-width below text on mobile */}
        <div className="md:col-span-6">
          <figure data-clip="side" className="overflow-hidden rounded-[24px]">
            <Photo
              id="30"
              alt={t('vino.photoAlt')}
              sizes="(min-width: 768px) 44vw, 100vw"
              className="aspect-[2/3] w-full object-cover"
            />
          </figure>
        </div>
      </div>
    </section>
  )
}
