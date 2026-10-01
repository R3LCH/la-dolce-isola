/**
 * Majolica line art in the brand's swirl idiom: a vine with spiral curls and
 * berry dots, generated once at module load. Paths carry `pathLength=1` so the
 * scroll-drawn animation in motion.ts can work in normalised dash units.
 */

type Pt = [number, number]

const f = (n: number) => Math.round(n * 10) / 10

/** Archimedean curl that starts at `attach` and winds inward around a centre `r` away. */
function curl(attach: Pt, r: number, startAngle: number, turns: number, cw: boolean): string {
  const [ax, ay] = attach
  const cx = ax - r * Math.cos(startAngle)
  const cy = ay - r * Math.sin(startAngle)
  const steps = Math.ceil(36 * turns)
  const dir = cw ? 1 : -1
  let d = `M${f(ax)} ${f(ay)}`
  for (let i = 1; i <= steps; i++) {
    const t = i / steps
    const a = startAngle + dir * t * turns * Math.PI * 2
    const rr = r * (1 - 0.82 * t)
    d += `L${f(cx + rr * Math.cos(a))} ${f(cy + rr * Math.sin(a))}`
  }
  return d
}

/** Small teardrop leaf pointing along `angle` from `base`. */
function leaf([x, y]: Pt, len: number, angle: number): string {
  const tip: Pt = [x + len * Math.cos(angle), y + len * Math.sin(angle)]
  const n = angle + Math.PI / 2
  const w = len * 0.42
  const c1: Pt = [x + len * 0.5 * Math.cos(angle) + w * Math.cos(n), y + len * 0.5 * Math.sin(angle) + w * Math.sin(n)]
  const c2: Pt = [x + len * 0.5 * Math.cos(angle) - w * Math.cos(n), y + len * 0.5 * Math.sin(angle) - w * Math.sin(n)]
  return `M${f(x)} ${f(y)}Q${f(c1[0])} ${f(c1[1])} ${f(tip[0])} ${f(tip[1])}Q${f(c2[0])} ${f(c2[1])} ${f(x)} ${f(y)}`
}

type Art = { w: number; h: number; paths: string[]; dots: { x: number; y: number; r: number }[] }

/** A long horizontal vine: `n` waves, each crest carrying a curl, a leaf and berries. */
function vine(n: number): Art {
  const seg = 200
  const mid = 70
  const amp = 30
  const w = seg * n
  let main = `M0 ${mid}`
  const paths: string[] = []
  const dots: Art['dots'] = []
  for (let i = 0; i < n; i++) {
    const x0 = i * seg
    const up = i % 2 === 0
    const cy = up ? mid - amp : mid + amp
    main += `C${x0 + 45} ${mid} ${x0 + 60} ${cy} ${x0 + 100} ${cy}S${x0 + 155} ${mid} ${x0 + seg} ${mid}`
    // Curl springs from the crest and winds back towards the stem.
    paths.push(curl([x0 + 100, cy], 17, up ? Math.PI / 2 : -Math.PI / 2, 1.6, up))
    paths.push(leaf([x0 + 150, mid + (up ? -8 : 8)], 18, up ? Math.PI * 0.2 : -Math.PI * 0.2))
    dots.push({ x: x0 + 100, y: up ? cy - 22 : cy + 22, r: 4.2 })
    dots.push({ x: x0 + 78, y: up ? cy - 14 : cy + 14, r: 2 })
    dots.push({ x: x0 + 124, y: up ? cy - 12 : cy + 12, r: 1.6 })
    dots.push({ x: x0 + 40, y: mid + (up ? 16 : -16), r: 1.8 })
  }
  return { w, h: mid * 2, paths: [main, ...paths], dots }
}

/** Symmetric ornament used under section titles, mirrored around the centre. */
function ornament(): Art {
  const w = 240
  const h = 64
  const m = 34
  const half = [
    `M120 ${m}C100 ${m} 92 16 70 16S40 ${m} 6 ${m}`,
    curl([70, 16], 11, Math.PI / 2, 1.7, true),
    curl([120, m], 9, -Math.PI / 2, 1.5, false),
    leaf([40, m - 3], 12, Math.PI * 1.15),
  ]
  // Mirror every "x y" coordinate pair around the vertical centre line.
  const paths = [
    ...half,
    ...half.map((d) => d.replace(/(-?[\d.]+) (-?[\d.]+)/g, (_, x: string, y: string) => `${f(w - Number(x))} ${y}`)),
  ]
  const dots = [
    { x: 120, y: 12, r: 3.2 },
    { x: 70, y: 46, r: 2.6 },
    { x: 170, y: 46, r: 2.6 },
    { x: 22, y: 22, r: 1.5 },
    { x: 218, y: 22, r: 1.5 },
    { x: 96, y: 48, r: 1.4 },
    { x: 144, y: 48, r: 1.4 },
  ]
  return { w, h, paths, dots }
}

const ARTS = { ornament: ornament(), vine: vine(6) }

type SwirlProps = {
  variant?: keyof typeof ARTS
  className?: string
  /** Stroke width in viewBox units. */
  weight?: number
  /** Opt out of the scroll-drawn animation (e.g. static decoration). */
  still?: boolean
}

export function Swirl({ variant = 'ornament', className, weight = 1.6, still = false }: SwirlProps) {
  const art = ARTS[variant]
  return (
    <svg
      viewBox={`0 0 ${art.w} ${art.h}`}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={weight}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      data-swirl={still ? undefined : ''}
      preserveAspectRatio="xMidYMid meet"
    >
      {art.paths.map((d, i) => (
        <path key={i} d={d} pathLength={1} data-swirl-path="" />
      ))}
      {art.dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="currentColor" stroke="none" data-swirl-dot="" />
      ))}
    </svg>
  )
}
