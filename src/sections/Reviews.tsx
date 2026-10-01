import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { IconArrowUpRight, IconPause, IconPlay } from '../components/Icons'
import { drawSwirls, revealUp, useMotion } from '../components/motion'
import { Bubbles, Stars } from '../components/Ratings'
import { SectionHead } from '../components/SectionHead'
import reviews from '../data/reviews.json'
import { VENUE } from '../lib/venue'

type Review = { author: string; rating: number; lang: string; date: string; text: string }

const AVATAR = ['bg-ink text-paper', 'bg-sun text-ink', 'bg-ink-2 text-paper', 'bg-paper-2 text-ink']

// Google's scraped snippets drop the space after a full stop ("gentile.Ottimi"); restore it for reading.
const QUOTES = (reviews as Review[]).map((r) => ({ ...r, text: r.text.replace(/([.!?])(?=\p{Lu})/gu, '$1 ') }))

function Plaque({ review, index }: { review: Review; index: number }) {
  const { t } = useTranslation()
  return (
    <figure className="flex h-full w-[284px] shrink-0 flex-col rounded-[20px] border border-paper/12 bg-paper/[0.06] p-5 md:w-[340px] md:p-6">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className={`grid size-10 shrink-0 place-items-center rounded-full font-display text-[18px] ${AVATAR[index % AVATAR.length]}`}>
          {review.author.charAt(0).toUpperCase()}
        </span>
        <figcaption className="min-w-0">
          <span className="block truncate text-[14px] font-semibold text-paper">{review.author}</span>
          <Stars score={review.rating} size={13} label={t('reviews.stars', { score: review.rating })} />
        </figcaption>
      </div>
      <blockquote lang={review.lang} className="mt-4 line-clamp-3 text-[15px] leading-[1.6] text-paper/85">
        {review.text}
      </blockquote>
    </figure>
  )
}

export function Reviews() {
  const { t, i18n } = useTranslation()
  const root = useRef<HTMLElement>(null)
  const [paused, setPaused] = useState(false)
  const fmt = new Intl.NumberFormat(i18n.resolvedLanguage === 'en' ? 'en-GB' : 'it-IT', { minimumFractionDigits: 1 })

  useMotion(root, ({ reduce }, el) => {
    if (reduce) return
    drawSwirls(el)
    revealUp(el)
  })

  const { google, tripadvisor: ta } = VENUE

  return (
    <section ref={root} id="recensioni" data-tone="dark" aria-labelledby="reviews-title" className="relative overflow-hidden bg-ink py-24 text-paper md:py-36">
      <div className="mx-auto max-w-[1360px] px-5 md:px-14 lg:px-20">
        <div className="grid gap-12 md:grid-cols-12 md:items-end">
          <div className="md:col-span-6">
            <SectionHead id="reviews-title" kicker={t('reviews.kicker')} title={t('reviews.title')} tone="paper" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 md:col-span-6">
            <a
              data-reveal=""
              href={VENUE.mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="press contact-row group flex flex-col justify-between gap-6 rounded-[20px] bg-paper p-5 text-ink md:p-6"
            >
              <span className="flex items-start justify-between gap-3">
                <span className="text-[12px] font-semibold tracking-[0.2em] text-ink-2 uppercase">Google</span>
                <IconArrowUpRight className="tile-arrow text-[18px]" />
              </span>
              <span>
                <span className="flex items-baseline gap-2">
                  <span className="font-display text-[52px] leading-none">{fmt.format(google.rating)}</span>
                  <span className="text-[13px] text-ink/65">{t('reviews.googleLabel')}</span>
                </span>
                <span className="mt-2 flex items-center gap-2">
                  <Stars score={google.rating} size={18} color="var(--color-ink)" label={t('reviews.stars', { score: fmt.format(google.rating) })} />
                  <span className="text-[13px] text-ink/70">{t('reviews.googleCount', { count: google.count })}</span>
                </span>
                <span className="sr-only">{t('reviews.googleLink')}</span>
              </span>
            </a>

            <a
              data-reveal=""
              href={ta.href}
              target="_blank"
              rel="noopener noreferrer"
              className="press contact-row group flex flex-col justify-between gap-6 rounded-[20px] bg-paper p-5 text-ink md:p-6"
            >
              <span className="flex items-start justify-between gap-3">
                <span className="text-[12px] font-semibold tracking-[0.2em] text-[#00754a] uppercase">Tripadvisor</span>
                <IconArrowUpRight className="tile-arrow text-[18px]" />
              </span>
              <span>
                <span className="flex items-baseline gap-2">
                  <span className="font-display text-[52px] leading-none">{fmt.format(ta.rating)}</span>
                  <span className="text-[13px] text-ink/65">{t('reviews.taLabel')}</span>
                </span>
                <span className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <Bubbles score={ta.rating} label={t('reviews.bubbles', { score: fmt.format(ta.rating) })} />
                  <span className="text-[13px] text-ink/70">
                    {t('reviews.taScore', { score: fmt.format(ta.rating) })} · {t('reviews.taCount', { count: ta.count })}
                  </span>
                </span>
                <span className="mt-2 block text-[13px] font-semibold text-ink">{t('reviews.taRank', { rank: ta.rank, of: ta.of })}</span>
                <span className="sr-only">{t('reviews.taLink')}</span>
              </span>
            </a>
          </div>
        </div>
      </div>

      <div
        role="region"
        aria-label={t('reviews.region')}
        className="marquee group/marquee relative mt-14 md:mt-20"
        data-paused={paused || undefined}
      >
        <div className="marquee-track flex w-max">
          <ul className="flex gap-3 pr-3 md:gap-5 md:pr-5">
            {QUOTES.map((r, i) => (
              <li key={r.author}>
                <Plaque review={r} index={i} />
              </li>
            ))}
          </ul>
          {/* Second copy makes the loop seamless; hidden from assistive tech and the tab order. */}
          <ul className="marquee-clone flex gap-3 pr-3 md:gap-5 md:pr-5" aria-hidden="true" inert>
            {QUOTES.map((r, i) => (
              <li key={r.author}>
                <Plaque review={r} index={i} />
              </li>
            ))}
          </ul>
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-ink to-transparent md:w-24" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-ink to-transparent md:w-24" />
      </div>

      <div className="mx-auto mt-6 flex max-w-[1360px] items-center justify-between gap-4 px-5 md:px-14 lg:px-20">
        <p className="text-[12px] text-paper/60">{t('reviews.source')}</p>
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          className="marquee-toggle press inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-paper/25 px-4 text-[13px] font-medium whitespace-nowrap text-paper"
        >
          {paused ? <IconPlay className="text-[16px]" /> : <IconPause className="text-[16px]" />}
          {paused ? t('reviews.play') : t('reviews.pause')}
        </button>
      </div>
    </section>
  )
}
