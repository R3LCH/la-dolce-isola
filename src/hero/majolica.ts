import { CanvasTexture, ExtrudeGeometry, Shape, SRGBColorSpace } from 'three'

/** Brand palette, see research/vibe.md. */
export const INK = '#16215a'
export const INK_2 = '#3c5599'
export const PORCELAIN = '#fbf8f2'

const SCRIPT_FONT = "'Pinyon Script'"

type Rng = () => number

/** Deterministic PRNG so the painted tile looks identical on every visit. */
function mulberry32(seed: number): Rng {
  let s = seed | 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Turtle-style brush that paints the scroll ornaments of the brand tile:
 * vines with curling tendrils, round cobalt blobs and dotted trails.
 * All lengths are in tile units `u` (1/100 of the canvas height).
 */
class Brush {
  private readonly ctx: CanvasRenderingContext2D
  private readonly u: number
  private readonly rnd: Rng

  constructor(ctx: CanvasRenderingContext2D, u: number, rnd: Rng) {
    this.ctx = ctx
    this.u = u
    this.rnd = rnd
  }

  /**
   * The signature majolica curl: a short arcing stem that rolls into a
   * logarithmic spiral wrapped around a round cobalt blob. `curl` sign picks
   * the turning side, its magnitude scales the spiral.
   */
  tendril(x: number, y: number, heading: number, len: number, curl: number, w: number, blob: boolean): void {
    const { ctx, u } = this
    const dir = Math.sign(curl) || 1
    const L = len * u
    const r0 = L * 0.26 * Math.min(1.3, Math.abs(curl))
    let px = x * u
    let py = y * u
    let h = heading
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = INK_2
    ctx.lineWidth = w * u
    ctx.beginPath()
    ctx.moveTo(px, py)
    // Stem: gentle constant-curvature arc into the spiral.
    const stem = L * 0.55
    const stemSteps = 18
    for (let i = 0; i < stemSteps; i++) {
      h += (dir * 0.9) / stemSteps
      px += Math.cos(h) * (stem / stemSteps)
      py += Math.sin(h) * (stem / stemSteps)
      ctx.lineTo(px, py)
    }
    ctx.stroke()
    // Spiral: radius decays from r0 to ~0.45 r0 over 1.6 turns of half-circle.
    const turn = Math.PI * 1.6
    const b = Math.log(1 / 0.45) / turn
    const cx = px + dir * r0 * -Math.sin(h)
    const cy = py + dir * r0 * Math.cos(h)
    const steps = 40
    for (let i = 0; i < steps; i++) {
      const th = (turn * (i + 1)) / steps
      const r = r0 * Math.exp(-b * th)
      h += (dir * turn) / steps
      const nx = cx + dir * r * Math.sin(h)
      const ny = cy - dir * r * Math.cos(h)
      ctx.lineWidth = w * u * (1 - 0.45 * (i / steps))
      ctx.beginPath()
      ctx.moveTo(px, py)
      ctx.lineTo(nx, ny)
      ctx.stroke()
      px = nx
      py = ny
    }
    if (blob) {
      ctx.fillStyle = INK
      ctx.beginPath()
      ctx.arc(cx, cy, r0 * 0.42, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  /** A row of dots shrinking away from the stem, as in the hand-painted tile. */
  dots(x: number, y: number, heading: number, n: number, r: number, gap: number): void {
    const { ctx, u } = this
    ctx.fillStyle = INK_2
    for (let i = 0; i < n; i++) {
      const d = (i + 1) * gap * u
      const rr = r * u * (1 - i / (n + 1))
      ctx.beginPath()
      ctx.arc(x * u + Math.cos(heading) * d, y * u + Math.sin(heading) * d, rr, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  /**
   * Main stem with a gentle wave; sprouts tendrils on alternating sides and
   * ends in its own spiral. `inner` limits tendril length on the side facing
   * the lettering (+1 = left of travel, -1 = right) so the script stays clear.
   */
  vine(x: number, y: number, heading: number, len: number, wave: number, w: number, inner: 1 | -1): void {
    const { ctx, u, rnd } = this
    const L = len * u
    const steps = Math.round(len * 3)
    const ds = L / steps
    const sproutEvery = Math.round(steps / Math.max(2, Math.round(len / 9)))
    let px = x * u
    let py = y * u
    let h = heading
    let side: 1 | -1 = 1
    ctx.lineCap = 'round'
    for (let i = 0; i < steps; i++) {
      const s = i / steps
      h += ((wave * Math.cos(s * Math.PI * 2.2)) / L) * ds * 3
      const nx = px + Math.cos(h) * ds
      const ny = py + Math.sin(h) * ds
      ctx.strokeStyle = INK_2
      ctx.lineWidth = w * u * (1 - 0.35 * s)
      ctx.beginPath()
      ctx.moveTo(px, py)
      ctx.lineTo(nx, ny)
      ctx.stroke()
      px = nx
      py = ny

      if (i > 2 && i % sproutEvery === 0 && s < 0.92) {
        const toInner = side === inner
        const tl = (toInner ? 5 : 8) + rnd() * (toInner ? 3 : 6)
        const th = h + side * (0.75 + rnd() * 0.35)
        const sx = px / u
        const sy = py / u
        this.tendril(sx, sy, th, tl, side * (0.85 + rnd() * 0.3), w * 0.75, rnd() > 0.35)
        if (rnd() > 0.45) {
          this.dots(sx, sy, h - side * (1.2 + rnd() * 0.4), 3 + Math.floor(rnd() * 2), w * 0.7, 2.1)
        }
        side = side === 1 ? -1 : 1
      }
    }
    this.tendril(px / u, py / u, h, 9, inner * -1, w * 0.85, true)
  }
}

function paintPorcelain(ctx: CanvasRenderingContext2D, W: number, H: number, rnd: Rng): void {
  ctx.fillStyle = PORCELAIN
  ctx.fillRect(0, 0, W, H)
  // Warm glaze pooling in the middle, a breath cooler towards the rim.
  const g = ctx.createRadialGradient(W * 0.48, H * 0.42, H * 0.05, W * 0.5, H * 0.5, Math.max(W, H) * 0.7)
  g.addColorStop(0, 'rgba(255, 252, 244, 0.9)')
  g.addColorStop(0.7, 'rgba(250, 246, 238, 0)')
  g.addColorStop(1, 'rgba(226, 222, 214, 0.55)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
  // Fine speckle of the fired clay showing through the glaze.
  ctx.fillStyle = 'rgba(120, 104, 84, 0.06)'
  const n = Math.round((W * H) / 900)
  for (let i = 0; i < n; i++) {
    const r = 0.6 + rnd() * 1.4
    ctx.beginPath()
    ctx.arc(rnd() * W, rnd() * H, r, 0, Math.PI * 2)
    ctx.fill()
  }
}

/** Ink is painted on its own layer, then laid twice: a soft bleed and the crisp stroke. */
function compositeInk(ctx: CanvasRenderingContext2D, layer: HTMLCanvasElement, bleed: number): void {
  ctx.save()
  ctx.globalAlpha = 0.4
  ctx.filter = `blur(${bleed}px)`
  ctx.drawImage(layer, 0, 0)
  ctx.restore()
  ctx.save()
  ctx.globalAlpha = 0.96
  ctx.drawImage(layer, 0, 0)
  ctx.restore()
}

function makeTexture(canvas: HTMLCanvasElement, anisotropy: number): CanvasTexture {
  const tex = new CanvasTexture(canvas)
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = anisotropy
  tex.needsUpdate = true
  return tex
}

function layerLike(W: number, H: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')
  if (!ctx) throw new Error('2D canvas unavailable')
  return [c, ctx]
}

/** Aspect ratio (width / height) of the hero tile face. */
export const TILE_ASPECT = 1.42

/**
 * Paints the brand tile: cobalt scroll clusters in the top-left and
 * bottom-right corners around the script "La Dolce / Isola".
 * Waits for Pinyon Script so the canvas never captures a fallback face.
 */
export async function paintBrandTile(anisotropy: number): Promise<CanvasTexture> {
  await document.fonts.load(`400 120px ${SCRIPT_FONT}`)
  const H = 1440
  const W = Math.round(H * TILE_ASPECT)
  const u = H / 100
  const Wu = W / u
  const [canvas, ctx] = layerLike(W, H)
  const rnd = mulberry32(30)
  paintPorcelain(ctx, W, H, rnd)

  const [ink, ictx] = layerLike(W, H)
  const brush = new Brush(ictx, u, rnd)
  const cluster = (): void => {
    brush.vine(7, 20, -0.3, 50, 1.1, 1.05, 1)
    brush.vine(9, 12, 0.06, 40, -0.8, 0.85, -1)
    brush.vine(6, 26, 1.38, 40, -1.0, 1.0, -1)
    brush.tendril(7, 22, -2.2, 7, -1, 0.9, true)
    brush.dots(14, 30, 0.9, 4, 0.75, 2.3)
  }
  cluster()
  // The second cluster is the first one turned half way round, as on the real tile.
  ictx.save()
  ictx.translate(W, H)
  ictx.rotate(Math.PI)
  cluster()
  ictx.restore()

  // Lettering: two lines, the second nudged right like the hand-painted original.
  const size = 25 * u
  ictx.font = `400 ${size}px ${SCRIPT_FONT}`
  ictx.textAlign = 'center'
  ictx.textBaseline = 'alphabetic'
  ictx.fillStyle = INK
  ictx.fillText('La Dolce', (Wu / 2 - 3) * u, 47 * u)
  ictx.fillText('Isola', (Wu / 2 + 5) * u, 75 * u)

  compositeInk(ctx, ink, u * 0.35)
  return makeTexture(canvas, anisotropy)
}

/** Square companion tile: an eight-fold rosette with corner quarter-scrolls. */
export async function paintRosetteTile(anisotropy: number, seed: number): Promise<CanvasTexture> {
  const S = 512
  const u = S / 100
  const [canvas, ctx] = layerLike(S, S)
  const rnd = mulberry32(seed)
  paintPorcelain(ctx, S, S, rnd)
  const [ink, ictx] = layerLike(S, S)
  const brush = new Brush(ictx, u, rnd)

  ictx.save()
  ictx.translate(S / 2, S / 2)
  for (let i = 0; i < 8; i++) {
    ictx.save()
    ictx.rotate((i * Math.PI) / 4)
    ictx.translate(-S / 2, -S / 2)
    brush.tendril(50, 50, -Math.PI / 2, 26, i % 2 ? 0.9 : -0.9, 1.6, true)
    ictx.restore()
  }
  ictx.restore()
  ictx.fillStyle = INK
  ictx.beginPath()
  ictx.arc(S / 2, S / 2, 5 * u, 0, Math.PI * 2)
  ictx.fill()
  // Corner quarter-scrolls join neighbouring tiles into a larger pattern.
  for (let c = 0; c < 4; c++) {
    ictx.save()
    ictx.translate(S / 2, S / 2)
    ictx.rotate((c * Math.PI) / 2)
    ictx.translate(-S / 2, -S / 2)
    brush.tendril(9, 26, -Math.PI / 2 + 0.2, 20, 0.8, 1.3, true)
    brush.dots(9, 9, Math.PI / 4, 3, 1.2, 4.2)
    ictx.restore()
  }
  compositeInk(ctx, ink, u * 0.5)
  return makeTexture(canvas, anisotropy)
}

/**
 * Rounded slab with a soft bevel. Face UVs are remapped to 0..1 over the
 * full outline so the painted canvas lands squarely on the glaze; the sides
 * and bevel pick up the plain porcelain margin of the texture.
 */
export function tileGeometry(w: number, h: number, radius: number, depth: number): ExtrudeGeometry {
  const bevelSize = Math.min(w, h) * 0.035
  const bevelThickness = depth * 0.42
  const iw = w - bevelSize * 2
  const ih = h - bevelSize * 2
  const r = Math.max(0.001, radius - bevelSize)
  const x = -iw / 2
  const y = -ih / 2
  const shape = new Shape()
  shape.moveTo(x + r, y)
  shape.lineTo(x + iw - r, y)
  shape.absarc(x + iw - r, y + r, r, -Math.PI / 2, 0, false)
  shape.lineTo(x + iw, y + ih - r)
  shape.absarc(x + iw - r, y + ih - r, r, 0, Math.PI / 2, false)
  shape.lineTo(x + r, y + ih)
  shape.absarc(x + r, y + ih - r, r, Math.PI / 2, Math.PI, false)
  shape.lineTo(x, y + r)
  shape.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false)

  const geo = new ExtrudeGeometry(shape, {
    depth: depth - bevelThickness * 2,
    bevelEnabled: true,
    bevelThickness,
    bevelSize,
    bevelSegments: 6,
    curveSegments: 18,
  })
  geo.center()
  const pos = geo.attributes.position
  const uv = geo.attributes.uv
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(i, pos.getX(i) / w + 0.5, pos.getY(i) / h + 0.5)
  }
  uv.needsUpdate = true
  geo.computeVertexNormals()
  return geo
}
