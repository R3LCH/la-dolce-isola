import { useRef, type ComponentType, type SVGProps } from 'react'
import { useTranslation } from 'react-i18next'
import { IconArrowUpRight, IconClock, IconDirections, IconInstagram, IconMail, IconPhone, IconWhatsApp } from '../components/Icons'
import { drawSwirls, revealUp, useMotion } from '../components/motion'
import { SectionHead } from '../components/SectionHead'
import { menuHref } from '../lib/router'
import { VENUE } from '../lib/venue'

type Channel = {
  key: string
  href: string
  value: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
  external: boolean
  note?: string
  wide?: boolean
  bordeaux?: boolean
}

export function Contacts() {
  const { t } = useTranslation()
  const root = useRef<HTMLElement>(null)

  useMotion(root, ({ reduce }, el) => {
    if (reduce) return
    drawSwirls(el)
    revealUp(el)
  })

  const channels: Channel[] = [
    {
      key: 'instagram',
      href: VENUE.instagram,
      value: '@ladolceisola',
      Icon: IconInstagram,
      external: true,
      note: t('contacts.instagramNote'),
    },
    {
      key: 'email',
      href: `mailto:${VENUE.email}?subject=${encodeURIComponent(t('contacts.emailSubject'))}`,
      value: VENUE.email,
      Icon: IconMail,
      external: false,
    },
    { key: 'phone', href: VENUE.phoneHref, value: VENUE.phoneDisplay, Icon: IconPhone, external: false, bordeaux: true },
    {
      key: 'whatsapp',
      href: VENUE.whatsappHref,
      value: t('contacts.whatsappValue'),
      Icon: IconWhatsApp,
      external: true,
      wide: true,
      bordeaux: true,
    },
  ]

  return (
    <section
      ref={root}
      id="contatti"
      data-tone="light"
      aria-labelledby="contacts-title"
      className="relative bg-paper-2 px-5 py-24 md:px-14 md:py-32 lg:px-20"
    >
      <div className="mx-auto grid max-w-[1360px] gap-12 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-5">
          <SectionHead id="contacts-title" kicker={t('contacts.kicker')} title={t('contacts.title')} />
          <div data-reveal="" className="mt-6 flex items-center gap-3 text-[14px] text-ink/70">
            <IconClock className="shrink-0 text-[18px]" />
            <span>
              {t('location.hours', { hours: VENUE.hours })} · {t('location.closed')}
            </span>
          </div>
        </div>

        <div className="md:col-span-7">
          <ul className="grid gap-3 sm:grid-cols-2 md:gap-4">
            {channels.map(({ key, href, value, Icon, external, note, wide, bordeaux }) => (
              <li key={key} data-reveal="" className={wide ? 'sm:col-span-2' : undefined}>
                <a
                  href={href}
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className={[
                    'press contact-row flex min-h-[84px] items-center gap-4 rounded-[20px] border bg-paper p-4 md:p-5',
                    bordeaux ? 'border-[var(--color-bordeaux)]/25' : 'border-ink/10',
                  ].join(' ')}
                >
                  <span className="contact-icon grid size-12 shrink-0 place-items-center rounded-full border border-ink/20 text-[22px] text-ink">
                    <Icon />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11px] font-semibold tracking-[0.2em] text-ink-2 uppercase">
                      {t(`contacts.${key}`)}
                    </span>
                    <span className="mt-1 block truncate text-[16px] font-semibold text-ink">{value}</span>
                    {note && <span className="mt-0.5 block text-[12px] text-ink/55">{note}</span>}
                  </span>
                  <IconArrowUpRight aria-hidden="true" className="tile-arrow ml-auto shrink-0 text-[18px] text-ink/60" />
                </a>
              </li>
            ))}
          </ul>

          <div data-reveal="" className="mt-6 flex flex-wrap gap-3">
            <a
              href={VENUE.directionsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="press btn-ink inline-flex min-h-12 items-center gap-2 rounded-full bg-ink px-6 text-[15px] font-semibold text-paper"
            >
              <IconDirections className="text-[19px]" />
              {t('location.directions')}
            </a>
            <a
              href={menuHref()}
              className="press btn-bordeaux inline-flex min-h-12 items-center gap-2 rounded-full bg-bordeaux px-6 text-[15px] font-semibold text-paper"
            >
              {t('hero.cta')}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
