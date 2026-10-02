import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { IconArrow } from '../components/Icons'
import { Mosaic } from '../components/Mosaic'
import { revealMosaics, revealUp, drawSwirls, useMotion } from '../components/motion'
import { Photo, type PhotoId } from '../components/Photo'
import { SectionHead } from '../components/SectionHead'
import { menuHref } from '../lib/router'

const CARDS: {
  photo: PhotoId
  label: { it: string; en: string }
  focus: string
}[] = [
  { photo: '27', label: { it: 'Aperitivo', en: 'Aperitivo' }, focus: '50% 60%' },
  { photo: '01', label: { it: 'Vino',      en: 'Wine'      }, focus: '45% 40%' },
  { photo: '34', label: { it: 'Gelato',    en: 'Gelato'    }, focus: '50% 40%' },
  { photo: '17', label: { it: 'Colazione', en: 'Breakfast' }, focus: '62% 50%' },
  { photo: '24', label: { it: 'Antipasti', en: 'Antipasti' }, focus: '50% 40%' },
  { photo: '48', label: { it: 'Dolci',     en: 'Desserts'  }, focus: '50% 55%' },
]

export function MenuTeaser() {
  const { t, i18n } = useTranslation()
  const lang = i18n.resolvedLanguage === 'en' ? 'en' : 'it'
  const root = useRef<HTMLElement>(null)

  useMotion(root, ({ reduce }, el) => {
    if (reduce) return
    drawSwirls(el)
    revealUp(el)
    revealMosaics(el)
  })

  return (
    <section
      ref={root}
      id="menu-teaser"
      data-tone="light"
      aria-labelledby="gallery-title"
      className="relative bg-paper px-5 pt-24 pb-24 md:px-14 md:pt-36 md:pb-40 lg:px-20"
    >
      <div className="mx-auto max-w-[1360px]">
        <SectionHead
          id="gallery-title"
          kicker={t('gallery.kicker')}
          title={t('gallery.title')}
        />

        {/*
          Desktop 3-col asymmetric grid (3 cols × auto rows):
            Row 1: card-0 (×2 cols) | card-1 (right col)
            Row 2: card-0 (×2 cols) | card-2 (right col)
            Row 3: card-3           | card-4  | card-5

          Card 0 drives rows 1-2 with aspect-[16/10].
          Cards 1-2 have no fixed aspect on desktop — they stretch
          to fill their row cell (grid default align-items:stretch).
          Cards 3-5 use aspect-[4/3] on both breakpoints.
          Mobile: 2-col grid, all cards aspect-[4/3].
        */}
        <ul className="mt-14 grid grid-cols-2 gap-3 md:mt-20 md:grid-cols-3 md:gap-6">
          {CARDS.map((card, i) => {
            const isBig      = i === 0        // col-span-2, row-span-2 on desktop
            const isSideCard = i === 1 || i === 2 // right-column tall cards

            const liClass = [
              isBig ? 'md:col-span-2 md:row-span-2' : '',
              // side cards need h-full so the inner div can stretch
              isSideCard ? 'md:h-full' : '',
            ].filter(Boolean).join(' ')

            const cardClass = [
              'tile relative overflow-hidden rounded-[18px] bg-paper-2 md:rounded-[26px]',
              // mobile: always 4:3
              'aspect-[4/3]',
              // desktop overrides
              isBig      ? 'md:aspect-[16/10]' : '',
              isSideCard ? 'md:aspect-auto md:h-full' : '',
            ].filter(Boolean).join(' ')

            const mosaicCols = isBig ? 8 : 4
            const mosaicRows = isBig ? 6 : 5

            const imgSizes = isBig
              ? '(min-width: 768px) 66vw, 50vw'
              : '(min-width: 768px) 33vw, 50vw'

            return (
              <li key={card.photo} className={liClass}>
                <div className={cardClass}>
                  <Photo
                    id={card.photo}
                    alt=""
                    sizes={imgSizes}
                    data-mosaic-img=""
                    className="tile-img absolute inset-0 size-full object-cover"
                    style={{ objectPosition: card.focus }}
                  />

                  {/* Bottom-up vignette */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night/80 via-night/15 to-transparent"
                  />

                  {/* Mosaic overlay lifted away on scroll by revealMosaics */}
                  <Mosaic cols={mosaicCols} rows={mosaicRows} />

                  {/* Category pill — z-20 sits above mosaic z-10 */}
                  <span
                    aria-hidden="true"
                    className="absolute bottom-4 left-4 z-20 md:bottom-5 md:left-5"
                  >
                    <span className="inline-block rounded-full bg-bordeaux/90 px-3 py-1 text-[10px] font-semibold tracking-[0.2em] text-paper uppercase md:text-[11px]">
                      {card.label[lang]}
                    </span>
                  </span>
                </div>
              </li>
            )
          })}
        </ul>

        {/* Single CTA to the full menu — no per-card menu links */}
        <div data-reveal="" className="mt-12 flex justify-center md:mt-16">
          <a
            href={menuHref()}
            className="press btn-ink link-arrow inline-flex min-h-12 items-center gap-3 rounded-full bg-ink py-3 pr-3 pl-6 text-[15px] font-semibold text-paper"
          >
            {t('gallery.cta')}
            <span className="grid size-8 place-items-center rounded-full bg-paper/15">
              <IconArrow className="tile-arrow text-[16px]" />
            </span>
          </a>
        </div>
      </div>
    </section>
  )
}
