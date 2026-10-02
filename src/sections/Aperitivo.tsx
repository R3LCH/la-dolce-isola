import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { drawSwirls, gsap, revealUp, useMotion } from '../components/motion'
import { Photo } from '../components/Photo'
import { SectionHead } from '../components/SectionHead'

export function Aperitivo() {
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
        .fromTo(fig, { clipPath: 'inset(100% 0% 0% 0% round 24px)' }, { clipPath: 'inset(0% 0% 0% 0% round 24px)', duration: 1.3, ease: 'ldi-drawer' })
        .fromTo(img, { scale: 1.18 }, { scale: 1, duration: 1.6, ease: 'ldi-out' }, 0)
    })
  })

  return (
    <section
      ref={root}
      id="aperitivo"
      data-tone="dark"
      aria-labelledby="aperitivo-title"
      className="relative overflow-hidden bg-night px-5 py-24 text-paper md:px-14 md:py-36 lg:px-20"
    >
      <div className="mx-auto grid max-w-[1360px] gap-14 md:grid-cols-12 md:gap-8">
        {/* Photo — left 5 cols on desktop, full-width first on mobile */}
        <div className="md:col-span-5">
          <figure data-clip="up" className="overflow-hidden rounded-[24px]">
            <Photo
              id="01"
              alt={t('aperitivo.photoAlt')}
              sizes="(min-width: 768px) 38vw, 100vw"
              className="aspect-[3/4] w-full object-cover"
            />
          </figure>
        </div>

        {/* Copy — right 7 cols on desktop */}
        <div className="flex flex-col justify-center md:col-span-7 md:pl-10">
          <SectionHead
            id="aperitivo-title"
            kicker={t('aperitivo.kicker')}
            title={t('aperitivo.title')}
            tone="paper"
          >
            <p
              data-reveal=""
              className="mt-6 max-w-[48ch] text-[16px] leading-[1.75] text-paper/75 md:text-[17px]"
            >
              {t('aperitivo.body')}
            </p>
          </SectionHead>

          <div data-reveal="" className="mt-10">
            <a
              href="#/menu/aperitivi-pre-dinner"
              className="inline-flex items-center rounded-full bg-[var(--color-bordeaux)] px-7 py-3.5 text-[13px] font-semibold tracking-[0.12em] text-paper uppercase transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-bordeaux-2)]"
            >
              {t('aperitivo.cta')}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
