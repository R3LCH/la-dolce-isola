import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import HTMLFlipBook, { type BookSnapshot, type FlipBookHandle } from '@gullabs/react-flipbook'
import { MENU_CATEGORIES, formatPrice, pillColor } from '../data/menu'
import type { MenuCategory, MenuLang } from '../data/menu'
import { gsap, prefersReducedMotion } from '../components/motion'
import { replaceMenuCategory } from '../lib/router'
import {
  PAGE_SPECS,
  category,
  pageCategories,
  resolveBlock,
  uniformPrice,
  type BlockSpec,
  type Col,
  type Node as LayoutNode,
  type PageSpec,
} from './layout'
import { MENU_STRINGS, initialMenuLang, saveMenuLang } from './strings'
import type { MenuStrings } from './strings'

// ─── helpers ─────────────────────────────────────────────────────────────────

/** First digital page (1-based) for a category, or null. */
function firstPageOfCategory(catId: string): number | null {
  const index = PAGE_SPECS.findIndex((spec) => pageCategories(spec).includes(catId))
  return index < 0 ? null : index + 1
}

/** Category ids visible on a given 1-based page number. */
function categoriesOnPage(page: number): string[] {
  const spec = PAGE_SPECS[leafOf(page)]
  return spec ? pageCategories(spec) : []
}

/** Leaf index (0-based) for a 1-based page. No hard covers. */
function leafOf(page: number) {
  return page - 1
}

// ─── sub-components ──────────────────────────────────────────────────────────

type LangProps = { lang: MenuLang; strings: MenuStrings; onChange: (l: MenuLang) => void }
function LangSwitcher({ lang, strings, onChange }: LangProps) {
  const langs: MenuLang[] = ['it', 'en', 'ru', 'uk', 'pl', 'de']
  return (
    <div className="flex items-center gap-1" role="group" aria-label={strings.language}>
      {langs.map((l) => (
        <button
          key={l}
          onClick={() => onChange(l)}
          aria-pressed={l === lang}
          className={[
            'rounded-sm px-1.5 py-0.5 text-[10px] font-semibold tracking-widest uppercase transition-colors',
            l === lang
              ? 'bg-[var(--color-ink)] text-[var(--color-paper)]'
              : 'text-[var(--color-ink-2)] hover:bg-[var(--color-paper-2)]',
          ].join(' ')}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

// ─── block node ──────────────────────────────────────────────────────────────

type BlockProps = { spec: BlockSpec; lang: MenuLang; strings: MenuStrings }
function Block({ spec, lang, strings }: BlockProps) {
  const cat = category(spec.cat)
  const groups = resolveBlock(spec)
  const pillC = pillColor(cat.pages[0] ?? 1)
  const showPill = spec.pill !== false && !spec.cont
  const showMobilePill = spec.mobilePill === true && !spec.cont

  return (
    <div className="mb-3 last:mb-0">
      {(showPill || showMobilePill) && (
        <div
          className={`mb-2 inline-flex max-w-full items-center gap-1.5 overflow-hidden rounded-full px-3 py-0.5 text-[10px] font-bold uppercase leading-tight tracking-[0.12em] break-words ${showPill ? '' : 'md:hidden'}`}
          style={{ background: pillC, color: '#fff' }}
        >
          <span className="min-w-0 break-words">{cat.title[lang]}</span>
          {spec.pillPrice && groups.length > 0 && (() => {
            const allItems = groups.flatMap((g) => g.items)
            const u = uniformPrice(allItems)
            return u != null ? <span className="ml-1 font-normal opacity-80">{formatPrice(u)}</span> : null
          })()}
        </div>
      )}
      {spec.cont && (
        <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.18em] opacity-50">
          {cat.title[lang]} ({strings.continued})
        </p>
      )}

      {groups.map((grp, gi) => {
        const groupUniform = spec.groupPrice ? uniformPrice(grp.items) : null
        const isCompact = spec.compact?.includes(grp.gi)

        return (
          <div key={gi} className="mb-2 last:mb-0">
            {grp.title && (
              <div className="flex items-baseline justify-between gap-2 border-b border-[var(--color-ink)]/10 pb-0.5 mb-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-2)]">
                  {grp.title[lang]}
                </p>
                {groupUniform != null && (
                  <span className="text-[10px] tabular-nums text-[var(--color-ink-2)]">
                    {formatPrice(groupUniform)}
                  </span>
                )}
              </div>
            )}

            {isCompact ? (
              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                {grp.items.map((item, ii) => (
                  <p key={ii} className="text-[10px] leading-tight text-[var(--color-ink)] break-words overflow-hidden">
                    {item.nameT ? item.nameT[lang] : item.name}
                  </p>
                ))}
              </div>
            ) : (
              grp.items.map((item, ii) => {
                const num = spec.numbered != null ? spec.numbered + grp.offset + ii : null
                const name = item.nameT ? item.nameT[lang] : item.name
                const desc = item.desc ? item.desc[lang] : null

                if (spec.wine || item.servingPrices) {
                  const sp = item.servingPrices
                  let priceLabel: string | null = null
                  if (sp) {
                    if (sp.glass != null && sp.bottle != null) {
                      priceLabel = `${strings.glass} ${formatPrice(sp.glass)} · ${strings.bottle} ${formatPrice(sp.bottle)}`
                    } else if (sp.bottle != null) {
                      priceLabel = `${strings.bottleOnly} ${formatPrice(sp.bottle)}`
                    } else if (sp.glass != null) {
                      priceLabel = `${strings.glass} ${formatPrice(sp.glass)}`
                    }
                  }
                  return (
                    <div key={ii} className="py-[3px] overflow-hidden">
                      <span className="block text-[10px] leading-tight break-words">{name}</span>
                      {priceLabel && (
                        <span className="block text-[9px] leading-tight tabular-nums text-[var(--color-ink-2)]">
                          {priceLabel}
                        </span>
                      )}
                    </div>
                  )
                }

                return (
                  <div key={ii} className={`py-[3px] ${spec.priceBelow ? '' : 'flex items-baseline gap-2'}`}>
                    <div className="flex-1 min-w-0">
                      {spec.leader ? (
                        <span className="flex items-baseline gap-1 text-[10px] leading-snug">
                          {num != null && <span className="text-[var(--color-ink-2)] w-4 shrink-0">{num}.</span>}
                          <span className="break-words leading-tight min-w-0">{name}</span>
                          <span className="flex-1 border-b border-dotted border-[var(--color-ink)]/25 self-end mb-[3px]" />
                        </span>
                      ) : (
                        <span className="block text-[10px] leading-snug break-words overflow-hidden">
                          {num != null && <span className="mr-1 text-[var(--color-ink-2)]">{num}.</span>}
                          {name}
                        </span>
                      )}
                      {desc && <p className="text-[9px] leading-tight text-[var(--color-ink)]/55 break-words overflow-hidden">{desc}</p>}
                    </div>
                    {!spec.groupPrice && !spec.pillPrice && item.price != null && (
                      <span className={`tabular-nums text-[10px] text-[var(--color-ink-2)] shrink-0 ${spec.priceBelow ? 'block mt-0.5' : ''}`}>
                        {formatPrice(item.price)}
                      </span>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )
      })}

      {spec.note && cat.notes && (
        <p className="mt-1 text-[9px] italic opacity-50">{cat.notes[lang]}</p>
      )}
    </div>
  )
}

// ─── node tree renderer ──────────────────────────────────────────────────────

type NodeProps = { node: LayoutNode; lang: MenuLang }
function NodeRenderer({ node, lang }: NodeProps) {
  if (node.t === 'block') return <Block spec={node.b} lang={lang} strings={MENU_STRINGS[lang]} />

  if (node.t === 'photo') return null

  if (node.t === 'row') {
    const visibleCells = node.cells
      .map((cell, ci) => ({ cell, ci, w: node.widths[ci] }))
      .filter(({ cell }) => cell.t !== 'photo')
    if (visibleCells.length === 0) return null
    const totalW = visibleCells.reduce((sum, { w }) => sum + w, 0)
    return (
      <div className="flex min-w-0 overflow-hidden">
        {visibleCells.map(({ cell, ci, w }) => (
          <div key={ci} style={{ width: `${(w / totalW) * 100}%`, minWidth: 0, overflow: 'hidden', flexShrink: 0 }}>
            <NodeRenderer node={cell} lang={lang} />
          </div>
        ))}
      </div>
    )
  }

  if (node.t === 'caption') {
    const cat = category(node.cat)
    const pillC = pillColor(cat.pages[0] ?? 1)
    return (
      <p
        className="text-[11px] font-bold uppercase tracking-[0.22em] break-words overflow-hidden"
        style={{ color: pillC }}
      >
        {cat.title[lang]}
      </p>
    )
  }

  if (node.t === 'note') {
    const cat = category(node.cat)
    return cat.notes ? (
      <p className="text-[9px] italic opacity-55 leading-snug break-words overflow-hidden">{cat.notes[lang]}</p>
    ) : null
  }

  if (node.t === 'spacer') return <div className="flex-1" />

  if (node.t === 'zigzag') {
    return (
      <svg viewBox="0 0 120 8" className="w-full h-2 my-2 text-[var(--color-pill-gold)]/40" aria-hidden>
        <polyline
          points="0,4 10,0 20,4 30,0 40,4 50,0 60,4 70,0 80,4 90,0 100,4 110,0 120,4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    )
  }

  return null
}

// ─── single digital page ─────────────────────────────────────────────────────

type PageLeafProps = { spec: PageSpec; page: number; lang: MenuLang; isPortrait: boolean }
function PageLeaf({ spec, page, lang, isPortrait }: PageLeafProps) {
  const bg = spec.dark
    ? 'bg-[var(--color-night)] text-[var(--color-paper)]'
    : 'bg-[var(--color-paper)] text-[var(--color-ink)]'
  const cols = spec.cols.filter((col) => col.nodes.some((node) =>
    node.t !== 'photo' && node.t !== 'spacer' && node.t !== 'caption' &&
    (!isPortrait || node.t !== 'zigzag'),
  ))
  const totalW = cols.reduce((sum, col) => sum + col.w, 0)

  return (
    <div className={`relative flex h-full w-full flex-col overflow-hidden ${bg} p-2`}>
      {/* head nodes */}
      {spec.head?.map((node, ni) => (
        <NodeRenderer key={ni} node={node} lang={lang} />
      ))}

      {/* bleed photo (desktop-only; mobileExtra used on phone) */}
      {/* bleed photo: skipped — text-only layout */}

      {/* Mobile content fills the space left by omitted decorative columns. */}
      <div className="relative z-10 flex min-h-0 flex-1 min-w-0" style={{ gap: '4px' }}>
        {cols.map((col: Col, ci) => {
          return (
            <div
              key={ci}
              style={{ flex: `0 0 calc(${isPortrait ? col.w / totalW * 100 : col.w}% - 4px)`, minWidth: 0, overflowX: 'hidden' }}
              className={`flex flex-col min-w-0 overflow-y-auto ${
                col.dark ? 'bg-[var(--color-night)]/80 rounded-lg p-2' : ''
              } ${
                'justify-start'
              }`}
            >
              {col.nodes.map((node, ni) => (
                <NodeRenderer key={ni} node={node} lang={lang} />
              ))}
            </div>
          )
        })}
      </div>

      {/* mobileExtra: skipped — photos only */}

      {/* page number */}
      <span
        className="absolute bottom-2 right-3 text-[9px] tabular-nums opacity-30 font-mono"
        aria-hidden
      >
        {page}
      </span>
    </div>
  )
}

// ─── category rail ───────────────────────────────────────────────────────────

type RailProps = {
  categories: MenuCategory[]
  activeCatId: string | null
  lang: MenuLang
  collapsed: boolean
  onCollapsed: (c: boolean) => void
  onSelect: (catId: string) => void
}

function CategoryRail({ categories, activeCatId, lang, collapsed, onCollapsed, onSelect }: RailProps) {
  const railRef = useRef<HTMLDivElement>(null)
  const portrait = typeof window !== 'undefined' && window.innerWidth < 768
  const strings = MENU_STRINGS[lang]

  // keyboard: escape collapses
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onCollapsed(true)
  }

  return (
    <div
      ref={railRef}
      className={[
        'flex flex-col bg-[var(--color-paper-2)]/90 backdrop-blur-sm',
        'transition-[width] duration-300',
        collapsed
          ? 'hidden md:relative md:flex md:w-7'
          : 'absolute left-2 top-2 bottom-2 z-30 w-44 shadow-2xl md:static md:inset-auto md:relative md:z-auto md:w-52 md:shadow-none',
        'h-auto md:h-full shrink-0 overflow-hidden rounded-xl md:rounded-l-2xl md:rounded-r-none',
      ].join(' ')}
      onMouseEnter={() => { if (!portrait) onCollapsed(false) }}
      onMouseLeave={() => { if (!portrait) onCollapsed(true) }}
      onFocus={() => onCollapsed(false)}
      onBlur={(e) => {
        if (!railRef.current?.contains(e.relatedTarget as HTMLElement | null)) onCollapsed(true)
      }}
      onKeyDown={onKey}
      role="navigation"
      aria-label={strings.categories}
      aria-expanded={!collapsed}
    >
      {/* toggle button */}
      <button
        className="flex items-center justify-center w-full h-8 shrink-0 text-[var(--color-ink-2)] hover:text-[var(--color-ink)] transition-colors"
        onClick={() => onCollapsed(!collapsed)}
        aria-label={collapsed ? strings.showCategories : strings.hideCategories}
        title={collapsed ? strings.showCategories : strings.hideCategories}
        tabIndex={0}
      >
        {collapsed ? (
          <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="5,3 11,8 5,13" />
          </svg>
        ) : (
          <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <line x1="5" y1="4" x2="11" y2="4" />
            <line x1="5" y1="8" x2="11" y2="8" />
            <line x1="5" y1="12" x2="11" y2="12" />
          </svg>
        )}
      </button>

      <div className="flex-1 overflow-y-auto overflow-x-hidden py-1" style={{ scrollbarWidth: 'none' }}>
        {categories.map((cat) => {
          const isActive = cat.id === activeCatId
          const pillC = pillColor(cat.pages[0] ?? 1)

          if (collapsed) {
            // collapsed: show only colored tick
            return (
              <button
                key={cat.id}
                className="flex items-center justify-center w-full py-1 group"
                onClick={() => { onCollapsed(false); onSelect(cat.id) }}
                title={cat.title[lang]}
                aria-label={cat.title[lang]}
              >
                <span
                  className="block rounded-full transition-all duration-200"
                  style={{
                    width: isActive ? 6 : 3,
                    height: 20,
                    background: pillC,
                    opacity: isActive ? 1 : 0.35,
                  }}
                />
              </button>
            )
          }

          return (
            <button
              key={cat.id}
              className={[
                'flex items-center gap-2 w-full px-3 py-1.5 text-left transition-all duration-150',
                isActive
                  ? 'text-[var(--color-ink)]'
                  : 'text-[var(--color-ink)]/60 hover:text-[var(--color-ink)]',
              ].join(' ')}
              onClick={() => onSelect(cat.id)}
              aria-label={cat.title[lang]}
              aria-current={isActive ? 'true' : undefined}
            >
              <span
                className="shrink-0 rounded-full"
                style={{
                  width: 6,
                  height: 6,
                  background: pillC,
                  opacity: isActive ? 1 : 0.45,
                }}
              />
              <span
                className={[
                  'text-[10px] font-medium leading-snug whitespace-nowrap truncate',
                  isActive ? 'font-semibold' : '',
                ].join(' ')}
              >
                {cat.title[lang]}
              </span>
              {isActive && (
                <span
                  className="ml-auto shrink-0 block rounded-full"
                  style={{ width: 4, height: 4, background: pillC }}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── nav arrow button ─────────────────────────────────────────────────────────

function NavBtn({
  dir,
  label,
  onClick,
  disabled,
}: {
  dir: 'prev' | 'next'
  label: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={[
        'flex items-center justify-center w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-full',
        'md:bg-[var(--color-paper-2)]/80 md:backdrop-blur-sm md:border md:border-[var(--color-ink)]/10',
        'transition-opacity duration-150',
        disabled ? 'opacity-20 pointer-events-none' : 'md:hover:bg-[var(--color-paper)] active:scale-95',
      ].join(' ')}
    >
      <svg
        viewBox="0 0 16 16"
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={dir === 'prev' ? { transform: 'rotate(180deg)' } : undefined}
      >
        <polyline points="5,3 11,8 5,13" />
      </svg>
    </button>
  )
}

// ─── main MenuBook ────────────────────────────────────────────────────────────

export function MenuBook({ initialCategoryId }: { initialCategoryId: string | null }) {
  const bookRef = useRef<FlipBookHandle | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  const [lang, setLang] = useState<MenuLang>(initialMenuLang)
  const [currentPage, setCurrentPage] = useState(1) // 1-based digital page
  const [railCollapsed, setRailCollapsed] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 768,
  )
  const [bookSize, setBookSize] = useState({ w: 400, h: 560 })
  const [loaded, setLoaded] = useState(false)
  const [isPortrait, setIsPortrait] = useState(false)

  const totalPages = PAGE_SPECS.length
  const activeCatId = categoriesOnPage(currentPage)[0] ?? null

  // ── size calculation ──────────────────────────────────────────────────────

  const calcSize = useCallback(() => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    const portrait = vw < 768

    // Landscape: two pages side by side; portrait: one page
    const availW = vw - (portrait ? 16 : 128) - (railCollapsed ? (portrait ? 0 : 28) : (portrait ? 0 : 208))
    const availH = vh - (portrait ? 56 : 120) // toolbar (+ nav arrows landscape only)

    const pagesInSpread = portrait ? 1 : 2
    // Portrait: fill height first, then derive width; landscape: fill width first
    let pageW: number, pageH: number
    if (portrait) {
      pageH = availH
      pageW = Math.min(Math.floor(availW), Math.floor(pageH / 1.35))
    } else {
      pageW = Math.min(Math.floor(availW / pagesInSpread), 480)
      pageH = Math.min(availH, Math.round(pageW * 1.1))
    }

    setIsPortrait(portrait)
    setBookSize({ w: pageW, h: pageH })
  }, [railCollapsed])

  useLayoutEffect(() => {
    calcSize()
    const ro = new ResizeObserver(calcSize)
    ro.observe(document.documentElement)
    return () => ro.disconnect()
  }, [calcSize])

  // ── initial page jump ─────────────────────────────────────────────────────

  useLayoutEffect(() => {
    if (!loaded) return
    const catId = initialCategoryId
    if (!catId) return
    const page = firstPageOfCategory(catId)
    if (page != null) {
      bookRef.current?.turnToPage(leafOf(page))
    }
  }, [loaded, initialCategoryId])

  // ── keyboard nav ──────────────────────────────────────────────────────────

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        bookRef.current?.flipNext()
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        bookRef.current?.flipPrev()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // ── enter animation ───────────────────────────────────────────────────────

  useLayoutEffect(() => {
    const el = rootRef.current
    if (!el) return
    if (prefersReducedMotion()) {
      gsap.set(el, { opacity: 1 })
      return
    }
    gsap.fromTo(el, { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' })
  }, [])

  // ── page change ───────────────────────────────────────────────────────────

  const onPageChange = useCallback((snap: BookSnapshot) => {
    // snap.page is 0-based leaf
    const page = snap.page + 1
    setCurrentPage(page)
    const cats = categoriesOnPage(page)
    if (cats[0]) replaceMenuCategory(cats[0])
  }, [])

  const onLoaded = useCallback((snap: BookSnapshot) => {
    setLoaded(true)
    onPageChange(snap)
  }, [onPageChange])

  // ── lang change ───────────────────────────────────────────────────────────

  const handleLangChange = useCallback((l: MenuLang) => {
    setLang(l)
    saveMenuLang(l)
  }, [])

  // ── rail select ───────────────────────────────────────────────────────────

  const handleCategorySelect = useCallback((catId: string) => {
    const page = firstPageOfCategory(catId)
    if (page == null) return
    const reduced = prefersReducedMotion()
    if (reduced) {
      bookRef.current?.turnToPage(leafOf(page))
    } else {
      bookRef.current?.flipToPage(leafOf(page))
    }
    setRailCollapsed(true)
  }, [])

  // ── interaction collapse rail ─────────────────────────────────────────────

  const handleBookInteract = useCallback((_e: ReactPointerEvent) => {
    setRailCollapsed(true)
  }, [])

  const strings = MENU_STRINGS[lang]

  const atFirst = currentPage <= 1
  const atLast = currentPage + (isPortrait ? 0 : 1) >= totalPages

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-40 flex flex-col bg-[var(--color-night)] opacity-0"
      role="main"
      aria-label={strings.menu}
    >
      {/* ── toolbar ── */}
      <div className="flex items-center justify-between gap-2 overflow-hidden px-3 py-2 bg-[var(--color-night)]/90 backdrop-blur-sm border-b border-white/10 shrink-0 sm:gap-3 sm:px-4">
        <a
          href="#/"
          className="flex items-center gap-1.5 text-[var(--color-paper)]/70 hover:text-[var(--color-paper)] transition-colors text-[11px] font-medium tracking-wide"
          aria-label={strings.back}
        >
          <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="10,3 4,8 10,13" />
          </svg>
          <span className="hidden sm:inline">{strings.back}</span>
        </a>

        <a
          href="#/"
          className="md:hidden flex items-center justify-center shrink-0"
          aria-label={strings.back}
        >
          <img src={`${import.meta.env.BASE_URL}logo-header.svg`} alt="La Dolce Isola" className="h-7 w-auto brightness-0 invert" draggable={false} />
        </a>
        <p className="hidden md:block truncate min-w-0 font-display text-[var(--color-sun)] text-sm font-normal tracking-widest sm:text-base">
          La Dolce Isola — {strings.menu}
        </p>

        <div className="flex items-center gap-2 shrink-0">
          {isPortrait && railCollapsed && (
            <button
              type="button"
              className="md:hidden shrink-0 rounded-full border border-white/15 px-2.5 py-1 text-[10px] font-medium tracking-wide text-[var(--color-paper)]/80 hover:text-[var(--color-paper)]"
              onClick={() => setRailCollapsed(false)}
              aria-label={strings.showCategories}
              title={strings.showCategories}
            >
              {strings.categories}
            </button>
          )}
          <div className="overflow-x-auto shrink-0" style={{ scrollbarWidth: 'none' }}>
            <LangSwitcher lang={lang} strings={strings} onChange={handleLangChange} />
          </div>
        </div>
      </div>

      {/* ── book area ── */}
      <div className="relative flex flex-1 min-h-0 items-center justify-center gap-1 md:gap-4 px-2 md:px-4 py-2 overflow-hidden">
        {/* category rail */}
        <CategoryRail
          categories={MENU_CATEGORIES}
          activeCatId={activeCatId}
          lang={lang}
          collapsed={railCollapsed}
          onCollapsed={setRailCollapsed}
          onSelect={handleCategorySelect}
        />

        <div className="relative flex items-center justify-center min-w-0">
          {!isPortrait && (
            <NavBtn
              dir="prev"
              label={strings.prev}
              onClick={() => bookRef.current?.flipPrev()}
              disabled={atFirst}
            />
          )}

          {/* flipbook */}
          <div
            className="book-frame relative flex-shrink-0 shadow-2xl rounded-xl overflow-hidden"
            onPointerDown={handleBookInteract}
            style={{ width: bookSize.w * (isPortrait ? 1 : 2), height: bookSize.h }}
          >
            {/* live region for screen readers */}
            <div
              className="sr-only"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              {strings.pages(
                isPortrait ? [currentPage] : [currentPage, Math.min(currentPage + 1, totalPages)],
                totalPages,
              )}
            </div>

            <HTMLFlipBook
              ref={bookRef}
              width={bookSize.w}
              height={bookSize.h}
              sizing="fixed"
              maxShadowOpacity={0.4}
              hardCovers={false}
              allowTouchScroll={true}
              flippingTime={prefersReducedMotion() ? 0 : 700}
              usePortrait={isPortrait}
              initialPage={0}
              drawShadow={true}
              autoSize={false}
              respectInteractiveContent={true}
              pointerInput={['mouse', 'touch', 'pen']}
              swipeDistance={30}
              foldCornerOnHover={true}
              flipOnClick="anywhere"
              className="book-root"
              onLoaded={onLoaded}
              onPageChange={onPageChange}
            >
              {PAGE_SPECS.map((spec, index) => (
                <div key={spec.page} className="page-wrapper" style={{ height: '100%' }}>
                  <PageLeaf spec={spec} page={index + 1} lang={lang} isPortrait={isPortrait} />
                </div>
              ))}
            </HTMLFlipBook>
          </div>

          {!isPortrait && (
            <NavBtn
              dir="next"
              label={strings.next}
              onClick={() => bookRef.current?.flipNext()}
              disabled={atLast}
            />
          )}

          {isPortrait && (
            <>
              <div className="absolute left-1 top-1/2 z-20 -translate-y-1/2">
                <NavBtn
                  dir="prev"
                  label={strings.prev}
                  onClick={() => bookRef.current?.flipPrev()}
                  disabled={atFirst}
                />
              </div>
              <div className="absolute right-1 top-1/2 z-20 -translate-y-1/2">
                <NavBtn
                  dir="next"
                  label={strings.next}
                  onClick={() => bookRef.current?.flipNext()}
                  disabled={atLast}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── page indicator ── */}
      <div className="flex items-center justify-center gap-1 py-2 shrink-0" aria-hidden>
        {PAGE_SPECS.map((spec, index) => {
          const page = index + 1
          const isActive = page === currentPage || (
            !isPortrait && page === currentPage + 1
          )
          return (
            <button
              key={spec.page}
              className={[
                'rounded-full transition-all duration-200',
                isActive ? 'w-4 h-1.5 bg-[var(--color-sun)]' : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40',
              ].join(' ')}
              onClick={() => {
                if (prefersReducedMotion()) bookRef.current?.turnToPage(leafOf(page))
                else bookRef.current?.flipToPage(leafOf(page))
              }}
              tabIndex={-1}
              aria-label={strings.pages([page], totalPages)}
            />
          )
        })}
      </div>
    </div>
  )
}
