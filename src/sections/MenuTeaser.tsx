import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { IconArrow } from '../components/Icons'
import { Mosaic } from '../components/Mosaic'
import { revealMosaics, revealUp, drawSwirls, useMotion } from '../components/motion'
import { Photo, type PhotoId } from '../components/Photo'
import { SectionHead } from '../components/SectionHead'
import { categoryById } from '../data/menu'
import { menuHref } from '../lib/router'

/** Teaser tiles: category id, venue photo, CSS object-position for the crop. */
const TILES: { id: string; photo: PhotoId; focus: string }[] = [
  { id: 'caffetteria', photo: '17', focus: '62% 50%' },
  { id: 'cocktail-long-drinks', photo: '27', focus: '50% 60%' },
  { id: 'gelato', photo: '34', focus: '50% 40%' },
  { id: 'crepes', photo: '48', focus: '50% 55%' },
  { id: 'selezione-vini', photo: '01', focus: '45% 40%' },
  { id: 'food', photo: '02', focus: '50% 50%' },
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
    <section ref={root} id="menu-teaser" data-tone="light" aria-labelledby="teaser-title" className="relative bg-paper px-5 pt-24 pb-24 md:px-14 md:pt-36 md:pb-40 lg:px-20">
      <div className="mx-auto max-w-[1360px]">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHead id="teaser-title" kicker={t('teaser.kicker')} title={t('teaser.title')}>
            <p data-reveal="" className="mt-5 max-w-[46ch] text-[16px] leading-relaxed text-ink/75">
              {t('teaser.lead')}
            </p>
          </SectionHead>
          <a
            data-reveal=""
            href={menuHref()}
            className="press btn-ink link-arrow inline-flex min-h-12 shrink-0 items-center gap-3 self-start rounded-full bg-ink py-3 pr-3 pl-6 text-[15px] font-semibold text-paper md:self-auto"
          >
            {t('teaser.all')}
            <span className="grid size-8 place-items-center rounded-full bg-paper/15">
              <IconArrow className="tile-arrow text-[16px]" />
            </span>
          </a>
        </div>

        <ul className="mt-14 grid grid-cols-2 gap-3 md:mt-20 md:grid-cols-3 md:gap-6">
          {TILES.map((tile, i) => {
            const cat = categoryById.get(tile.id)
            if (!cat) return null
            const name = cat.title[lang]
            const count = cat.groups.reduce((n, g) => n + g.items.length, 0)
            // Phones: wide first and last tile; desktop: the middle column sits lower for an off-grid rhythm.
            const wide = i === 0 || i === TILES.length - 1
            return (
              <li key={tile.id} className={`${wide ? 'col-span-2 md:col-span-1' : ''} ${i % 3 === 1 ? 'md:translate-y-16' : ''}`}>
                <a
                  href={menuHref(tile.id)}
                  aria-label={t('teaser.open', { name })}
                  className={`tile group relative block overflow-hidden rounded-[18px] bg-paper-2 outline-offset-4 md:rounded-[26px] ${
                    wide ? 'aspect-[16/11] md:aspect-[4/5]' : 'aspect-[3/4] md:aspect-[4/5]'
                  }`}
                >
                  <Photo
                    id={tile.photo}
                    alt=""
                    sizes="(min-width: 768px) 30vw, (min-width: 0px) 50vw"
                    data-mosaic-img=""
                    className="tile-img absolute inset-0 size-full object-cover"
                    style={{ objectPosition: tile.focus }}
                  />
                  <span aria-hidden="true" className="tile-sheen pointer-events-none absolute inset-y-0 -left-1/4 w-1/2 bg-gradient-to-r from-transparent via-paper/25 to-transparent" />
                  <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-night/85 via-night/20 to-transparent" />
                  <Mosaic cols={wide ? 6 : 4} rows={5} />
                  <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 text-paper md:p-6">
                    <span className="min-w-0">
                      <span className="block text-[10px] font-semibold tracking-[0.22em] text-sun uppercase md:text-[11px]">
                        {String(i + 1).padStart(2, '0')} · {t('teaser.count', { count })}
                      </span>
                      <span className="mt-1.5 block font-display text-[22px] leading-[1.05] md:text-[34px]">{name}</span>
                      <span className="mt-2 hidden text-[14px] leading-snug text-paper/80 md:block">{t(`teaser.blurb.${tile.id}`)}</span>
                    </span>
                    <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-paper text-ink md:size-11">
                      <IconArrow className="tile-arrow text-[16px] md:text-[18px]" />
                    </span>
                  </span>
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
