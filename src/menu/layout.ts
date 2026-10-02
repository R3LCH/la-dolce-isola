import { MENU_PAGES, categoryById, type MenuCategory, type MenuCrop, type MenuItem, type T6 } from '../data/menu'

/**
 * Digital leaves rebuilt from the printed booklet
 * (research/menu-pages/menuN.jpeg + layoutNotes in research/menu/*.json).
 *
 * A page is a row of columns; a column is a vertical list of nodes. Blocks
 * reference menu data by category, group and item range, so every item lives
 * in exactly one block. The two printed Food pages share one digital leaf.
 */

/** [groupIndex, from?, to?] — an item slice of one group of a category. */
export type Part = readonly [g: number, from?: number, to?: number]

export type BlockSpec = {
  cat: string
  /** Item slices; omitted = every group in full; [] = header only. */
  parts?: readonly Part[]
  /** Category pill at the top of the block. Default true. */
  pill?: boolean
  /** Repeat the category pill on phones when the printed spread omits it. */
  mobilePill?: boolean
  /** Small "title (continued)" line instead of the pill (mobile splits). */
  cont?: boolean
  /** One price printed beside the pill for the whole category. */
  pillPrice?: boolean
  /** Titled groups whose items share one price print it once by the group title. */
  groupPrice?: boolean
  /** Number the items (food fillings), starting here. */
  numbered?: number
  /** Dotted rule between name and price. */
  leader?: boolean
  /** Price under the description instead of right-aligned (gelato coppe). */
  priceBelow?: boolean
  /** Groups rendered as a dense two-column list (toppings, flavours). */
  compact?: readonly number[]
  /** Glass / bottle price columns (wine list). */
  wine?: boolean
  /** Show the category note under the block. */
  note?: boolean
  /** Brand mark printed beside the pill. */
  mark?: string
  /** Light translucent panel behind the list (dark page). */
  panel?: boolean
}

export type PhotoKind = 'round' | 'ring' | 'cut' | 'panel'

export type PhotoNode = {
  t: 'photo'
  crop: MenuCrop
  kind: PhotoKind
  /** Width as % of the containing cell (desktop). */
  w: number
  align?: 'start' | 'center' | 'end'
  /** Height in em, set by mobile pagination. */
  hEm?: number
}

export type Node =
  | { t: 'block'; b: BlockSpec }
  | PhotoNode
  | { t: 'row'; cells: Node[]; widths: number[] }
  | { t: 'caption'; cat: string }
  | { t: 'note'; cat: string }
  | { t: 'spacer' }
  | { t: 'zigzag' }

export type Col = { w: number; nodes: Node[]; dark?: boolean; justify?: 'start' | 'center' | 'end' }

/** Half of a round photo printed across the gutter, clipped at the page edge. */
export type Bleed = { crop: MenuCrop; kind: 'ring' | 'cut'; side: 'left' | 'right'; top: number; w: number } | {
  crop: MenuCrop
  kind: 'backdrop'
  side: 'left'
  top: number
  w: number
}

export type PageSpec = {
  /** First source booklet page; digital page numbers follow array order. */
  page: number
  head?: Node[]
  cols: Col[]
  bleed?: Bleed
  /** Shown instead of the bleed when pages are not paired (phone). */
  mobileExtra?: Node[]
  dark?: boolean
}

const CROPS = new Map(MENU_PAGES.flatMap((p) => p.crops.map((c) => [c.src.replace(/^menu\/|\.webp$/g, ''), c] as const)))

function crop(name: string): MenuCrop {
  const c = CROPS.get(name)
  if (!c) throw new Error(`Unknown menu crop ${name}`)
  return c
}

const B = (b: BlockSpec): Node => ({ t: 'block', b })
const ph = (name: string, kind: PhotoKind, w: number, align?: PhotoNode['align']): PhotoNode => ({
  t: 'photo',
  crop: crop(name),
  kind,
  w,
  align,
})
const row = (cells: Node[], widths: number[]): Node => ({ t: 'row', cells, widths })
const spacer: Node = { t: 'spacer' }

const CL = 'cocktail-long-drinks'
const YG = 'yogurt-granite'
const GE = 'gelato'
const FD = 'food'

/** p16/p17 gelato coppa: text left, sundae on its plate right. */
const coppa = (from: number, plate: string): Node =>
  row([B({ cat: GE, parts: [[1, from, from + 1]], pill: false, priceBelow: true }), ph(plate, 'cut', 92, 'center')], [60, 40])

export const PAGE_SPECS: PageSpec[] = [
  {
    page: 1,
    cols: [
      { w: 62, nodes: [B({ cat: CL, parts: [[0], [1, 0, 5]] })] },
      { w: 38, nodes: [{ t: 'caption', cat: CL }, ph('p01-tagliere-salumi-tartare', 'ring', 92, 'center'), spacer, { t: 'zigzag' }] },
    ],
  },
  {
    page: 2,
    cols: [
      { w: 38, justify: 'end', nodes: [ph('p02-corona-mojito-moscow-mule', 'cut', 100, 'start')] },
      { w: 62, nodes: [B({ cat: CL, parts: [[1, 5], [2]], pill: false, mobilePill: true })] },
    ],
  },
  {
    page: 3,
    cols: [
      { w: 64, nodes: [B({ cat: 'aperitivi-pre-dinner' })] },
      { w: 36, nodes: [] },
    ],
    bleed: { crop: crop('p04-cocktails-passion-fruit'), kind: 'ring', side: 'right', top: 24, w: 64 },
  },
  {
    page: 4,
    cols: [
      { w: 34, nodes: [] },
      {
        w: 66,
        nodes: [B({ cat: CL, parts: [[3]], pill: false }), B({ cat: 'delizie-analcoliche', pillPrice: true })],
      },
    ],
    bleed: { crop: crop('p04-cocktails-passion-fruit'), kind: 'ring', side: 'left', top: 24, w: 64 },
    mobileExtra: [ph('p04-cocktails-passion-fruit', 'ring', 70, 'center')],
  },
  {
    page: 5,
    cols: [
      { w: 56, nodes: [B({ cat: 'amari-calabresi' }), B({ cat: 'amari', pillPrice: true })] },
      {
        w: 44,
        nodes: [ph('p05-amari-calabresi-bottles', 'round', 92, 'end'), spacer, ph('p05-articolo-1-bottle', 'round', 70, 'center')],
      },
    ],
  },
  {
    page: 6,
    cols: [
      { w: 50, nodes: [B({ cat: 'liquori', pillPrice: true }), spacer, ph('p06-grappa-glass', 'round', 78, 'center')] },
      { w: 50, nodes: [B({ cat: 'liquori-dolci', pillPrice: true }), B({ cat: 'grappe' })] },
    ],
  },
  {
    page: 7,
    cols: [
      { w: 54, nodes: [B({ cat: 'cognac-brandy', pillPrice: true }), B({ cat: 'whisky' })] },
      { w: 46, nodes: [B({ cat: 'tequila' }), spacer, ph('p07-whisky-glass', 'cut', 96, 'end')] },
    ],
  },
  {
    page: 8,
    cols: [
      { w: 34, justify: 'center', nodes: [ph('p08-rum-glass', 'cut', 100, 'center')] },
      { w: 66, nodes: [B({ cat: 'rum' })] },
    ],
  },
  {
    page: 9,
    cols: [
      { w: 60, nodes: [B({ cat: 'vodka' }), B({ cat: 'coolers-energizers' })] },
      {
        w: 40,
        justify: 'end',
        nodes: [
          row([ph('p09-vodka-cocktail-glass', 'cut', 100, 'end'), ph('p09-belvedere-vodka-bottle', 'cut', 100, 'end')], [48, 52]),
        ],
      },
    ],
  },
  {
    page: 10,
    cols: [
      { w: 22, justify: 'center', nodes: [ph('p10-beer-glass', 'cut', 100, 'center')] },
      { w: 78, nodes: [B({ cat: 'birre' })] },
    ],
  },
  {
    page: 11,
    cols: [
      { w: 66, nodes: [B({ cat: 'selezione-vini', wine: true })] },
      { w: 34, dark: true, nodes: [{ t: 'caption', cat: 'selezione-vini' }, spacer, ph('p11-tartare-di-pesce', 'panel', 100, 'center')] },
    ],
  },
  {
    page: 12,
    cols: [
      { w: 34, nodes: [] },
      { w: 66, nodes: [B({ cat: 'spumanti', panel: true })] },
    ],
    bleed: { crop: crop('p12-tagliere-formaggi'), kind: 'backdrop', side: 'left', top: 40, w: 74 },
    mobileExtra: [ph('p12-tagliere-formaggi', 'panel', 92, 'center')],
  },
  {
    page: 13,
    head: [B({ cat: FD, parts: [] })],
    cols: [
      {
        w: 100,
        nodes: [
          B({ cat: FD, parts: [[0]], pill: false, groupPrice: true, numbered: 1, leader: true }),
          B({ cat: FD, parts: [[1]], pill: false, groupPrice: true, numbered: 2, leader: true }),
          B({ cat: FD, parts: [[2]], pill: false, groupPrice: true, numbered: 4, leader: true }),
          B({ cat: FD, parts: [[3]], pill: false, groupPrice: true, numbered: 7, leader: true }),
          B({ cat: FD, parts: [[4]], pill: false, numbered: 9, leader: true }),
          { t: 'note', cat: FD },
        ],
      },
    ],
  },
  {
    page: 15,
    cols: [
      { w: 52, nodes: [B({ cat: 'piadine' })] },
      { w: 48, nodes: [B({ cat: 'fattilla-tu' }), spacer, ph('p15-piadina-stack', 'round', 88, 'center')] },
    ],
  },
  {
    page: 16,
    cols: [
      {
        w: 45,
        nodes: [
          B({ cat: YG, parts: [[0, 0, 1]] }),
          ph('p16-coppa-yogurt-soft', 'cut', 74, 'center'),
          B({ cat: YG, parts: [[0, 1, 2]], pill: false }),
          ph('p16-creazioni-semifreddi', 'cut', 92, 'center'),
          row([B({ cat: YG, parts: [[0, 2, 3]], pill: false }), ph('p16-granita', 'cut', 100, 'end')], [52, 48]),
        ],
      },
      {
        w: 55,
        nodes: [
          B({ cat: GE, parts: [[0]], mark: 'Gelato Revolution' }),
          ph('p16-gelato-scoops-row', 'cut', 100, 'center'),
          coppa(0, 'p16-coppa-kinder'),
          coppa(1, 'p16-coppa-coockies'),
          coppa(2, 'p16-coppa-amarena'),
        ],
      },
    ],
  },
  {
    page: 17,
    head: [B({ cat: GE, parts: [] })],
    cols: [
      {
        w: 50,
        justify: 'center',
        nodes: [
          coppa(3, 'p17-coppa-meraviglia'),
          coppa(4, 'p17-coppa-strange-day'),
          coppa(5, 'p17-coppa-sayonara'),
          coppa(6, 'p17-coppa-coba-cabana'),
          coppa(7, 'p17-coppa-dolce-isola'),
        ],
      },
      {
        w: 50,
        justify: 'center',
        nodes: [
          coppa(8, 'p17-coppa-spagnolita'),
          coppa(9, 'p17-cialda-alla-frutta'),
          coppa(10, 'p17-cialda-alla-crema'),
          coppa(11, 'p17-affogato'),
          coppa(12, 'p17-coppa-capriccio'),
        ],
      },
    ],
  },
  {
    page: 18,
    cols: [
      { w: 50, nodes: [B({ cat: 'smoothies', pillPrice: true, note: true }), spacer, ph('p18-smoothie-fruits', 'panel', 100, 'center')] },
      { w: 50, nodes: [B({ cat: 'pancake', pillPrice: true }), spacer, ph('p18-pancake-chocolate', 'panel', 100, 'center')] },
    ],
  },
  {
    page: 19,
    cols: [
      {
        w: 46,
        nodes: [
          B({ cat: 'dessert', parts: [] }),
          row([B({ cat: 'dessert', parts: [[0, 0, 1]], pill: false }), ph('p19-souffle', 'round', 84, 'center')], [60, 40]),
          row([B({ cat: 'dessert', parts: [[0, 1, 3]], pill: false }), ph('p19-waffel', 'round', 84, 'center')], [60, 40]),
          row([B({ cat: 'dessert', parts: [[0, 3, 5]], pill: false }), ph('p19-brioches', 'round', 80, 'center')], [60, 40]),
          row([B({ cat: 'dessert', parts: [[0, 5, 7]], pill: false }), ph('p19-frappe', 'round', 76, 'center')], [60, 40]),
        ],
      },
      {
        w: 54,
        nodes: [B({ cat: 'crepes', groupPrice: true, compact: [1] }), spacer, ph('p19-crepes-gelato', 'cut', 92, 'end')],
      },
    ],
  },
  {
    page: 20,
    cols: [
      { w: 50, nodes: [B({ cat: 'caffetteria' })] },
      {
        w: 50,
        nodes: [B({ cat: 'delizie-con-caffe', pillPrice: true }), B({ cat: 'mousse-di-caffe' }), spacer, ph('p20-mousse-di-caffe', 'panel', 70, 'center')],
      },
    ],
  },
  {
    page: 21,
    cols: [
      { w: 50, nodes: [B({ cat: 'batido', pillPrice: true }), B({ cat: 'bibite' })] },
      { w: 50, nodes: [B({ cat: 'succhi-di-frutta', pillPrice: true, compact: [0] }), spacer, ph('p21-orange-juice', 'cut', 92, 'center')] },
    ],
  },
]

// ── Data resolution ─────────────────────────────────────────────────────────

export type ResolvedGroup = { gi: number; title: T6 | null; items: MenuItem[]; offset: number }

export function category(id: string): MenuCategory {
  const c = categoryById.get(id)
  if (!c) throw new Error(`Unknown menu category ${id}`)
  return c
}

/** The item slices a block shows, in printed order. */
export function resolveBlock(b: BlockSpec): ResolvedGroup[] {
  const c = category(b.cat)
  const parts: readonly Part[] = b.parts ?? c.groups.map((_, gi) => [gi] as const)
  return parts.map(([gi, from = 0, to]) => {
    const g = c.groups[gi]
    if (!g) throw new Error(`Category ${b.cat} has no group ${gi}`)
    return { gi, title: g.title, items: g.items.slice(from, to ?? g.items.length), offset: from }
  })
}

/** The single price of a category or group when every item shares it. */
export function uniformPrice(items: MenuItem[]): number | null {
  if (items.length === 0) return null
  const p = items[0].price
  return items.every((i) => i.price === p) ? p : null
}

export function walkBlocks(nodes: Node[], visit: (b: BlockSpec) => void) {
  for (const n of nodes) {
    if (n.t === 'block') visit(n.b)
    else if (n.t === 'row') walkBlocks(n.cells, visit)
  }
}

export function pageNodes(p: PageSpec): Node[] {
  return [...(p.head ?? []), ...p.cols.flatMap((c) => c.nodes)]
}

/** Category ids on a digital leaf, in reading order (blocks that show items or a pill). */
export function pageCategories(p: PageSpec): string[] {
  const out: string[] = []
  walkBlocks(pageNodes(p), (b) => {
    if (!out.includes(b.cat)) out.push(b.cat)
  })
  return out
}
