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
import { MENU_CATEGORIES, categoryById, formatPrice, pillColor } from '../data/menu'
import type { MenuCategory, MenuCrop, MenuLang } from '../data/menu'
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
  type PhotoNode,
} from './layout'
import { MENU_STRINGS, initialMenuLang, saveMenuLang } from './strings'
import type { MenuStrings } from './strings'

// ─── helpers ─────────────────────────────────────────────────────────────────

function cropSrc(crop: MenuCrop): string {
  // src is like "menu/p02-corona-mojito-moscow-mule.webp"
  return `${import.meta.env.BASE_URL}${crop.src}`
}

/** First printed page (1-based) for a category, or null. */
function firstPageOfCategory(catId: string): number | null {
  const cat = categoryById.get(catId)
  if (!cat || !cat.pages.length) return null
  return cat.pages[0]
}

/** Category ids visible on a given 1-based page number. */
function categoriesOnPage(page: number): string[] {
  const spec = PAGE_SPECS.find((p) => p.page === page)
  return spec ? pageCategories(spec) : []
}

/** Leaf index (0-based) for a 1-based page. No hard covers. */
function leafOf(page: number) {
  return page - 1
}

// ─── sub-components ──────────────────────────────────────────────────────────

type LangProps = { lang: MenuLang; strings: MenuStrings; onChange: (l: MenuLang) => void }
function LangSwitcher({ lang, strings: _strings, onChange }: LangProps) {
  const langs: MenuLang[] = ['it', 'en', 'ru', 'uk', 'pl', 'de']
  return (
    <div className="flex items-center gap-1" role="group" aria-label="Menu language">
      {langs.map((l) => (
        <button
          key={l}
          onClick={() => onChange(l)}
          aria-pressed={l === lang}
          className={[
            'rounded-sm px-2 py-0.5 text-[10px] font-semibold tracking-widest uppercase transition-colors',
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

// ─── photo node ──────────────────────────────────────────────────────────────

type PhotoProps = { node: PhotoNode; containW?: number }
function Photo({ node }: PhotoProps) {
  const { crop, kind, w, align } = node
  const src = cropSrc(crop)
  const alignClass = align === 'start' ? 'mr-auto' : align === 'end' ? 'ml-auto' : 'mx-auto'
  const style = { width: `${w}%` }

  if (kind === 'round') {
    return (
      <div className={`${alignClass} aspect-square overflow-hidden rounded-full`} style={style}>
        <img
          src={src}
          alt={crop.depicts}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </div>
    )
  }
  if (kind === 'ring') {
    return (
      <div
        className={`${alignClass} relative aspect-square overflow-hidden rounded-full ring-[3px] ring-[var(--color-pill-gold)]/60`}
        style={style}
      >
        <img
          src={src}
          alt={crop.depicts}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </div>
    )
  }
  if (kind === 'panel') {
    return (
      <div
        className={`${alignClass} overflow-hidden rounded-xl`}
        style={{ ...style, aspectRatio: `${crop.w}/${crop.h}` }}
      >
        <img
          src={src}
          alt={crop.depicts}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </div>
    )
  }
  // 'cut'
  return (
    <div
      className={`${alignClass} overflow-hidden`}
      style={{ ...style, aspectRatio: `${crop.w}/${crop.h}` }}
    >
      <img
        src={src}
        alt={crop.depicts}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover"
      />
    </div>
  )
}

// ─── block node ──────────────────────────────────────────────────────────────

type BlockProps = { spec: BlockSpec; lang: MenuLang }
function Block({ spec, lang }: BlockProps) {
  const cat = category(spec.cat)
  const groups = resolveBlock(spec)
  const pillC = pillColor(cat.pages[0] ?? 1)
  const showPill = spec.pill !== false && !spec.cont

  return (
    <div className="mb-3 last:mb-0">
      {showPill && (
        <div
          className="mb-2 inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em]"
          style={{ background: pillC, color: '#fff' }}
        >
          {cat.title[lang]}
          {spec.pillPrice && groups.length > 0 && (() => {
            const allItems = groups.flatMap((g) => g.items)
            const u = uniformPrice(allItems)
            return u != null ? <span className="ml-1 font-normal opacity-80">{formatPrice(u)}</span> : null
          })()}
        </div>
      )}
      {spec.cont && (
        <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.18em] opacity-50">
          {cat.title[lang]} (segue)
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
                  <p key={ii} className="text-[10px] leading-tight text-[var(--color-ink)]">
                    {item.nameT ? item.nameT[lang] : item.name}
                  </p>
                ))}
              </div>
            ) : (
              grp.items.map((item, ii) => {
                const num = spec.numbered != null ? spec.numbered + grp.offset + ii : null
                const name = item.nameT ? item.nameT[lang] : item.name
                const desc = item.desc ? item.desc[lang] : null

                if (spec.wine) {
                  const parts = item.priceNote?.split('/').map((s) => s.trim()) ?? []
                  return (
                    <div key={ii} className="grid grid-cols-[1fr_auto_auto] items-baseline gap-x-2 py-[2px]">
                      <span className="text-[10px] leading-tight">{name}</span>
                      <span className="text-[10px] tabular-nums text-[var(--color-ink-2)]">{parts[0] ?? ''}</span>
                      <span className="text-[10px] tabular-nums text-[var(--color-ink-2)]">{parts[1] ?? ''}</span>
                    </div>
                  )
                }

                return (
                  <div key={ii} className={`py-[2px] ${spec.priceBelow ? '' : 'flex items-baseline gap-2'}`}>
                    <div className="flex-1 min-w-0">
                      {spec.leader ? (
                        <span className="flex items-baseline gap-1 text-[10px] leading-snug">
                          {num != null && <span className="text-[var(--color-ink-2)] w-4 shrink-0">{num}.</span>}
                          <span>{name}</span>
                          <span className="flex-1 border-b border-dotted border-[var(--color-ink)]/25 self-end mb-[3px]" />
                        </span>
                      ) : (
                        <span className="block text-[10px] leading-snug">
                          {num != null && <span className="mr-1 text-[var(--color-ink-2)]">{num}.</span>}
                          {name}
                        </span>
                      )}
                      {desc && <p className="text-[9px] leading-tight text-[var(--color-ink)]/55">{desc}</p>}
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
  if (node.t === 'block') return <Block spec={node.b} lang={lang} />

  if (node.t === 'photo') return <Photo node={node} />

  if (node.t === 'row') {
    return (
      <div className="flex gap-2">
        {node.cells.map((cell, ci) => (
          <div key={ci} style={{ width: `${node.widths[ci]}%`, flexShrink: 0 }}>
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
        className="text-[11px] font-bold uppercase tracking-[0.22em]"
        style={{ color: pillC }}
      >
        {cat.title[lang]}
      </p>
    )
  }

  if (node.t === 'note') {
    const cat = category(node.cat)
    return cat.notes ? (
      <p className="text-[9px] italic opacity-55 leading-snug">{cat.notes[lang]}</p>
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

// ─── single printed page ─────────────────────────────────────────────────────

type PageLeafProps = { spec: PageSpec; lang: MenuLang }
function PageLeaf({ spec, lang }: PageLeafProps) {
  const bg = spec.dark
    ? 'bg-[var(--color-night)] text-[var(--color-paper)]'
    : 'bg-[var(--color-paper)] text-[var(--color-ink)]'

  return (
    <div className={`relative h-full w-full overflow-hidden ${bg} p-4 md:p-6`}>
      {/* head nodes */}
      {spec.head?.map((node, ni) => (
        <NodeRenderer key={ni} node={node} lang={lang} />
      ))}

      {/* bleed photo (desktop-only; mobileExtra used on phone) */}
      {spec.bleed && (
        <div
          className="absolute hidden md:block pointer-events-none"
          style={{
            [spec.bleed.side]: '-2%',
            top: `${spec.bleed.top}%`,
            width: `${spec.bleed.w}%`,
            zIndex: 0,
          }}
        >
          <Photo
            node={{
              t: 'photo',
              crop: spec.bleed.crop,
              kind: spec.bleed.kind === 'backdrop' ? 'panel' : spec.bleed.kind,
              w: 100,
              align: spec.bleed.side === 'left' ? 'start' : 'end',
            }}
          />
        </div>
      )}

      {/* columns */}
      <div className="relative z-10 flex h-full gap-2 md:gap-4">
        {spec.cols.map((col: Col, ci) => (
          <div
            key={ci}
            style={{ width: `${col.w}%`, flexShrink: 0 }}
            className={`flex flex-col ${
              col.dark ? 'bg-[var(--color-night)]/80 rounded-lg p-2' : ''
            } ${
              col.justify === 'end' ? 'justify-end' : col.justify === 'center' ? 'justify-center' : 'justify-start'
            }`}
          >
            {col.nodes.map((node, ni) => (
              <NodeRenderer key={ni} node={node} lang={lang} />
            ))}
          </div>
        ))}
      </div>

      {/* mobile extra (replaces gutter bleed) */}
      {spec.mobileExtra && (
        <div className="md:hidden mt-3">
          {spec.mobileExtra.map((node, ni) => (
            <NodeRenderer key={ni} node={node} lang={lang} />
          ))}
        </div>
      )}

      {/* page number */}
      <span
        className="absolute bottom-2 right-3 text-[9px] tabular-nums opacity-30 font-mono"
        aria-hidden
      >
        {spec.page}
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

  // keyboard: escape collapses
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onCollapsed(true)
  }

  return (
    <div
      ref={railRef}
      className={[
        'relative flex flex-col bg-[var(--color-paper-2)]/90 backdrop-blur-sm',
        'transition-[width] duration-300',
        collapsed ? 'w-6 md:w-7' : 'w-44 md:w-52',
        'h-full shrink-0 overflow-hidden rounded-l-xl md:rounded-l-2xl',
      ].join(' ')}
      onMouseEnter={() => onCollapsed(false)}
      onMouseLeave={() => onCollapsed(true)}
      onFocus={() => onCollapsed(false)}
      onBlur={(e) => {
        if (!railRef.current?.contains(e.relatedTarget as HTMLElement | null)) onCollapsed(true)
      }}
      onKeyDown={onKey}
      role="navigation"
      aria-label="Menu categories"
      aria-expanded={!collapsed}
    >
      {/* toggle button */}
      <button
        className="flex items-center justify-center w-full h-8 shrink-0 text-[var(--color-ink-2)] hover:text-[var(--color-ink)] transition-colors"
        onClick={() => onCollapsed(!collapsed)}
        aria-label={collapsed ? 'Show categories' : 'Hide categories'}
        tabIndex={0}
      >
        {collapsed ? (
          <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <line x1="3" y1="8" x2="13" y2="8" />
            <line x1="3" y1="4" x2="13" y2="4" />
            <line x1="3" y1="12" x2="13" y2="12" />
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
        'bg-[var(--color-paper-2)]/80 backdrop-blur-sm border border-[var(--color-ink)]/10',
        'transition-opacity duration-150',
        disabled ? 'opacity-20 pointer-events-none' : 'hover:bg-[var(--color-paper)] active:scale-95',
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
  const [currentPage, setCurrentPage] = useState(1) // 1-based printed page
  const [railCollapsed, setRailCollapsed] = useState(true)
  const [bookSize, setBookSize] = useState({ w: 400, h: 560 })
  const [loaded, setLoaded] = useState(false)
  const [isPortrait, setIsPortrait] = useState(false)

  const totalPages = PAGE_SPECS.length // 21
  const activeCatId = categoriesOnPage(currentPage)[0] ?? null

  // ── size calculation ──────────────────────────────────────────────────────

  const calcSize = useCallback(() => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    const portrait = vw < 768

    // Landscape: two pages side by side; portrait: one page
    const availW = vw - (portrait ? 48 : 96) - (railCollapsed ? 28 : (portrait ? 176 : 208))
    const availH = vh - 120 // toolbar + nav arrows

    const pagesInSpread = portrait ? 1 : 2
    const pageW = Math.min(Math.floor(availW / pagesInSpread), 480)
    const pageH = Math.min(availH, Math.round(pageW * 1.41)) // A4 ratio

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
  const atLast = currentPage >= totalPages

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-40 flex flex-col bg-[var(--color-night)] opacity-0"
      role="main"
      aria-label={strings.menu}
    >
      {/* ── toolbar ── */}
      <div className="flex items-center justify-between gap-3 px-4 py-2 bg-[var(--color-night)]/90 backdrop-blur-sm border-b border-white/10 shrink-0">
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

        <p className="font-display text-[var(--color-sun)] text-base font-normal tracking-widest">
          La Dolce Isola — {strings.menu}
        </p>

        <LangSwitcher lang={lang} strings={strings} onChange={handleLangChange} />
      </div>

      {/* ── book area ── */}
      <div className="flex flex-1 min-h-0 items-center justify-center gap-2 md:gap-4 px-2 md:px-4 py-2">
        {/* category rail */}
        <CategoryRail
          categories={MENU_CATEGORIES}
          activeCatId={activeCatId}
          lang={lang}
          collapsed={railCollapsed}
          onCollapsed={setRailCollapsed}
          onSelect={handleCategorySelect}
        />

        {/* prev button */}
        <NavBtn
          dir="prev"
          label={strings.prev}
          onClick={() => bookRef.current?.flipPrev()}
          disabled={atFirst}
        />

        {/* flipbook */}
        <div
          className="relative flex-shrink-0 shadow-2xl rounded-xl overflow-hidden"
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
            {PAGE_SPECS.map((spec) => (
              <div key={spec.page} className="page-wrapper" style={{ height: '100%' }}>
                <PageLeaf spec={spec} lang={lang} />
              </div>
            ))}
          </HTMLFlipBook>
        </div>

        {/* next button */}
        <NavBtn
          dir="next"
          label={strings.next}
          onClick={() => bookRef.current?.flipNext()}
          disabled={atLast}
        />
      </div>

      {/* ── page indicator ── */}
      <div className="flex items-center justify-center gap-1 py-2 shrink-0" aria-hidden>
        {PAGE_SPECS.map((spec) => {
          const isActive = spec.page === currentPage || (
            !isPortrait && spec.page === currentPage + 1
          )
          return (
            <button
              key={spec.page}
              className={[
                'rounded-full transition-all duration-200',
                isActive ? 'w-4 h-1.5 bg-[var(--color-sun)]' : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40',
              ].join(' ')}
              onClick={() => {
                if (prefersReducedMotion()) bookRef.current?.turnToPage(leafOf(spec.page))
                else bookRef.current?.flipToPage(leafOf(spec.page))
              }}
              tabIndex={-1}
              aria-label={`Page ${spec.page}`}
            />
          )
        })}
      </div>
    </div>
  )
}
