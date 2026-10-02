import type { ReactNode } from 'react'
import { Swirl } from './Swirl'

type Props = {
  kicker: string
  title: ReactNode
  id?: string
  align?: 'left' | 'center'
  tone?: 'ink' | 'paper'
  children?: ReactNode
}

/** Kicker, Bodoni title and the scroll-drawn swirl ornament shared by every home section. */
export function SectionHead({ kicker, title, id, align = 'left', tone = 'ink', children }: Props) {
  const center = align === 'center'
  return (
    <div className={center ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      <p
        data-reveal=""
        className={`text-[11px] font-semibold tracking-[0.28em] uppercase md:text-[12px] ${tone === 'ink' ? 'text-ink-2' : 'text-sun'}`}
      >
        {kicker}
      </p>
      <Swirl className={`mt-3 h-7 w-[132px] md:h-8 md:w-[150px] ${center ? 'mx-auto' : '-ml-1'} ${tone === 'ink' ? 'text-ink-2' : 'text-sun'}`} weight={1.8} />
      <h2
        id={id}
        data-reveal=""
        className="mt-4 font-display text-[clamp(2rem,8.4vw,2.75rem)] leading-[1.04] font-medium tracking-[-0.015em] text-balance md:text-[clamp(2.75rem,4.4vw,4.25rem)]"
      >
        {title}
      </h2>
      {children}
    </div>
  )
}
