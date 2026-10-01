import { useRef, type ComponentType, type SVGProps } from 'react'
import { useTranslation } from 'react-i18next'
import { IconArrowUpRight, IconFacebook, IconInstagram, IconMail, IconPhone, IconWhatsApp } from '../components/Icons'
import { drawSwirls, revealUp, useMotion } from '../components/motion'
import { SectionHead } from '../components/SectionHead'
import { VENUE } from '../lib/venue'

type Channel = { key: string; href: string; value: string; Icon: ComponentType<SVGProps<SVGSVGElement>>; external: boolean }

export function Contacts() {
  const { t } = useTranslation()
  const root = useRef<HTMLElement>(null)

  useMotion(root, ({ reduce }, el) => {
    if (reduce) return
    drawSwirls(el)
    revealUp(el)
  })

  const channels: Channel[] = [
    { key: 'instagram', href: VENUE.instagram, value: '@ladolceisola', Icon: IconInstagram, external: true },
    { key: 'facebook', href: VENUE.facebook, value: 'ladolceisola.scalea', Icon: IconFacebook, external: true },
    {
      key: 'email',
      href: `mailto:${VENUE.email}?subject=${encodeURIComponent(t('contacts.emailSubject'))}`,
      value: VENUE.email,
      Icon: IconMail,
      external: false,
    },
    { key: 'phone', href: VENUE.phoneHref, value: VENUE.phoneDisplay, Icon: IconPhone, external: false },
    { key: 'whatsapp', href: VENUE.whatsappHref, value: t('contacts.whatsappValue'), Icon: IconWhatsApp, external: true },
  ]

  return (
    <section ref={root} id="contatti" data-tone="light" aria-labelledby="contacts-title" className="relative bg-paper-2 px-5 py-24 md:px-14 md:py-32 lg:px-20">
      <div className="mx-auto grid max-w-[1360px] gap-12 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-5">
          <SectionHead id="contacts-title" kicker={t('contacts.kicker')} title={t('contacts.title')} />
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 md:col-span-7 md:gap-4">
          {channels.map(({ key, href, value, Icon, external }) => (
            <li key={key} data-reveal="" className={key === 'whatsapp' ? 'sm:col-span-2' : undefined}>
              <a
                href={href}
                {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="press contact-row flex min-h-[84px] items-center gap-4 rounded-[20px] border border-ink/10 bg-paper p-4 md:p-5"
              >
                <span className="contact-icon grid size-12 shrink-0 place-items-center rounded-full border border-ink/20 text-[22px] text-ink">
                  <Icon />
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] font-semibold tracking-[0.2em] text-ink-2 uppercase">{t(`contacts.${key}`)}</span>
                  <span className="mt-1 block truncate text-[16px] font-semibold text-ink">{value}</span>
                </span>
                <IconArrowUpRight aria-hidden="true" className="tile-arrow ml-auto shrink-0 text-[18px] text-ink/60" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
