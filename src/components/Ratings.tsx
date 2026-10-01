import { useId } from 'react'

const STAR = 'M12 2.8l2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 16.7l-5.4 2.9 1.1-6.1-4.5-4.3 6.1-.8Z'

/**
 * Five marks with fractional fill (4.3 → four full, the fifth 30 %), drawn as
 * outline + clipped fill so the partial mark reads as a real fraction.
 */
function Marks({ score, shape, color, size, label }: { score: number; shape: 'star' | 'bubble'; color: string; size: number; label: string }) {
  const uid = useId()
  return (
    <span role="img" aria-label={label} className="inline-flex items-center gap-[3px]">
      {Array.from({ length: 5 }, (_, i) => {
        const fill = Math.max(0, Math.min(1, score - i))
        const clip = `${uid}-${i}`
        return (
          <svg key={i} viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false">
            <defs>
              <clipPath id={clip}>
                <rect x="0" y="0" width={24 * fill} height="24" />
              </clipPath>
            </defs>
            {shape === 'star' ? (
              <>
                <path d={STAR} fill="none" stroke={color} strokeWidth="1.3" strokeLinejoin="round" />
                <path d={STAR} fill={color} clipPath={`url(#${clip})`} />
              </>
            ) : (
              <>
                <circle cx="12" cy="12" r="9.6" fill="none" stroke={color} strokeWidth="2" />
                <circle cx="12" cy="12" r="9.6" fill={color} clipPath={`url(#${clip})`} />
              </>
            )}
          </svg>
        )
      })}
    </span>
  )
}

export function Stars({ score, label, size = 16, color = 'var(--color-sun)' }: { score: number; label: string; size?: number; color?: string }) {
  return <Marks score={score} shape="star" color={color} size={size} label={label} />
}

/** Tripadvisor's rating idiom: five bubbles in the brand green. */
export function Bubbles({ score, label, size = 18 }: { score: number; label: string; size?: number }) {
  return <Marks score={score} shape="bubble" color="#00aa6c" size={size} label={label} />
}
