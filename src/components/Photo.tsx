import type { ImgHTMLAttributes } from 'react'
import { asset } from '../lib/venue'

/** Intrinsic size of the 800 px rendition of every photo in public/img (1600 rendition is the 2× unless noted otherwise). */
const SIZES = {
  '01': [800, 600],
  '02': [800, 561],
  '06': [800, 1067],
  '12': [800, 450],
  '17': [800, 600],
  '24': [800, 1063],
  '27': [800, 602],
  '28': [800, 600],
  '30': [800, 1067],
  '34': [800, 1063],
  // The source of 36 is only 604 px wide; both files hold that same frame.
  '36': [604, 404],
  '46': [800, 600],
  '48': [800, 1067],
  '53': [800, 1067],
  '56': [800, 1067],
  // The source of wines is 1024×1280; the 1600 rendition holds the native frame (no true 2×).
  'wines': [800, 1000],
} as const

export type PhotoId = keyof typeof SIZES

type PhotoProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'width' | 'height'> & {
  id: PhotoId
  alt: string
  sizes: string
}

/** Responsive photo from public/img with intrinsic size set to avoid layout shift. */
export function Photo({ id, alt, sizes, loading = 'lazy', decoding = 'async', ...rest }: PhotoProps) {
  const [w, h] = SIZES[id]
  const small = asset(`img/${id}-800.webp`)
  const srcSet = w < 800 ? undefined : `${small} 800w, ${asset(`img/${id}-1600.webp`)} ${id === 'wines' ? 1024 : 1600}w`
  return (
    <img
      src={small}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      width={w}
      height={h}
      alt={alt}
      loading={loading}
      decoding={decoding}
      {...rest}
    />
  )
}
