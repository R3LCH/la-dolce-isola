import type { ReactNode, SVGProps } from 'react'

/** One family of thin line icons: 24 grid, 1.5 stroke, round caps and joins. */
function Icon({ children, ...props }: SVGProps<SVGSVGElement> & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  )
}

type P = SVGProps<SVGSVGElement>

export const IconInstagram = (p: P) => (
  <Icon {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
  </Icon>
)

export const IconFacebook = (p: P) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M13.2 20.5v-7.3h2.4M10.4 13.2h2.8M13.2 13.2v-2.4c0-1.3.8-2 2-2h1.2" />
  </Icon>
)

export const IconMail = (p: P) => (
  <Icon {...p}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
    <path d="m4.5 7 7.5 6 7.5-6" />
  </Icon>
)

export const IconPhone = (p: P) => (
  <Icon {...p}>
    <path d="M8.2 3.8 6 4.4a2 2 0 0 0-1.4 2.2c1 6.7 6.1 11.8 12.8 12.8a2 2 0 0 0 2.2-1.4l.6-2.2a1 1 0 0 0-.6-1.2l-3-1.2a1 1 0 0 0-1.1.3l-1.2 1.4a9.6 9.6 0 0 1-4.6-4.6l1.4-1.2a1 1 0 0 0 .3-1.1l-1.2-3a1 1 0 0 0-1.2-.6Z" />
  </Icon>
)

export const IconWhatsApp = (p: P) => (
  <Icon {...p}>
    <path d="M4.2 19.8 5.3 16A8.5 8.5 0 1 1 8 18.7Z" />
    <path d="M9.4 8.6c-.3 2.4 2.6 5.6 5.4 5.9l1-1.1-1.6-.9-.8.7a4 4 0 0 1-2.2-2.2l.7-.8-.9-1.6Z" />
  </Icon>
)

export const IconPin = (p: P) => (
  <Icon {...p}>
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
    <circle cx="12" cy="10" r="2.3" />
  </Icon>
)

export const IconClock = (p: P) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Icon>
)

export const IconArrow = (p: P) => (
  <Icon {...p}>
    <path d="M5 12h14M13.5 6.5 19 12l-5.5 5.5" />
  </Icon>
)

export const IconArrowUpRight = (p: P) => (
  <Icon {...p}>
    <path d="M7 17 17 7M9 7h8v8" />
  </Icon>
)

export const IconDirections = (p: P) => (
  <Icon {...p}>
    <path d="M11.3 3.2a1 1 0 0 1 1.4 0l8.1 8.1a1 1 0 0 1 0 1.4l-8.1 8.1a1 1 0 0 1-1.4 0l-8.1-8.1a1 1 0 0 1 0-1.4Z" />
    <path d="M9.5 14v-2.2a1.3 1.3 0 0 1 1.3-1.3h4.2M13 8.5l2 2-2 2" />
  </Icon>
)

export const IconBook = (p: P) => (
  <Icon {...p}>
    <path d="M12 6.5c-1.8-1.3-4.4-2-7.5-2v13c3.1 0 5.7.7 7.5 2 1.8-1.3 4.4-2 7.5-2v-13c-3.1 0-5.7.7-7.5 2Z" />
    <path d="M12 6.5v13" />
  </Icon>
)

export const IconPause = (p: P) => (
  <Icon {...p}>
    <path d="M9 6.5v11M15 6.5v11" />
  </Icon>
)

export const IconPlay = (p: P) => (
  <Icon {...p}>
    <path d="M8 5.8v12.4a.6.6 0 0 0 .9.5l9.6-6.2a.6.6 0 0 0 0-1L8.9 5.3a.6.6 0 0 0-.9.5Z" />
  </Icon>
)
