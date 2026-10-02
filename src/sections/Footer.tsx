import { useTranslation } from 'react-i18next'
import { scrollToId } from '../components/motion'
import { Swirl } from '../components/Swirl'
import { menuHref } from '../lib/router'
import { VENUE } from '../lib/venue'

export function Footer() {
  const { t } = useTranslation()
  return (
    <footer data-tone="dark" className="relative overflow-hidden bg-night px-5 pt-20 pb-[calc(2rem+env(safe-area-inset-bottom))] text-paper md:px-14 md:pt-28 lg:px-20">
      <Swirl variant="vine" still weight={1.1} className="pointer-events-none absolute -top-4 left-0 w-[260%] text-paper/10 md:w-[130%]" />
      <div className="relative mx-auto max-w-[1360px]">
        <p className="font-script text-[clamp(3.5rem,16vw,9rem)] leading-[0.9] text-paper">La Dolce Isola</p>
        <p className="mt-4 max-w-[40ch] text-[15px] font-medium text-paper/80">{t('footer.tagline')}</p>

        <div className="mt-14 grid gap-8 border-t border-paper/15 pt-8 text-[14px] font-medium text-paper/85 sm:grid-cols-3">
          <address className="not-italic">
            {VENUE.address}
            <br />
            {VENUE.city}
          </address>
          <p>
            {t('location.hours', { hours: VENUE.hours })}
            <br />
            {t('location.closed')}
            <br />
            <a href={VENUE.phoneHref} className="underline decoration-paper/30 underline-offset-4">
              {VENUE.phoneDisplay}
            </a>
          </p>
          <nav className="flex gap-5 sm:justify-end" aria-label={t('footer.menu')}>
            <a href={menuHref()} className="min-h-11 font-semibold text-sun">
              {t('footer.menu')}
            </a>
            <a
              href={VENUE.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-11"
            >
              Instagram
            </a>
            <a
              href={VENUE.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-11"
            >
              WhatsApp
            </a>
            <a href={`mailto:${VENUE.email}`} className="min-h-11">
              {t('contacts.email')}
            </a>
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault()
                scrollToId('top')
              }}
              className="min-h-11"
            >
              {t('footer.top')}
            </a>
          </nav>
        </div>
        <p className="mt-6 text-[12px] text-paper/50">{t('footer.rights', { year: new Date().getFullYear() })}</p>
      </div>
    </footer>
  )
}
