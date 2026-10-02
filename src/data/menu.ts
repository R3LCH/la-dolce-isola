import raw from './menu.json'

export const MENU_LANGS = ['it', 'en', 'ru', 'uk', 'pl', 'de'] as const
export type MenuLang = (typeof MENU_LANGS)[number]
export type T6 = Record<MenuLang, string>

export type MenuItem = {
  id: string
  name: string
  nameT: T6 | null
  desc: T6 | null
  price: number | null
  priceNote: string | null
  uncertain: boolean
  servingPrices?: { glass?: number; bottle?: number }
}
export type MenuGroup = { title: T6 | null; items: MenuItem[] }
export type MenuCategory = { id: string; title: T6; pages: number[]; groups: MenuGroup[]; notes: T6 | null }
export type MenuCrop = { src: string; w: number; h: number; round: boolean; depicts: string; items: string[] }
export type MenuPage = { page: number; categoryIds: string[]; crops: MenuCrop[] }

const data = raw as unknown as { pages: MenuPage[]; categories: MenuCategory[] }

export const MENU_PAGES = data.pages
export const MENU_CATEGORIES = data.categories
export const categoryById = new Map(MENU_CATEGORIES.map((c) => [c.id, c]))

/** Printed pill colour per page range (from the real menu photos). */
export function pillColor(page: number): string {
  if (page <= 12) return 'var(--color-pill-gold)'
  if (page <= 15) return 'var(--color-pill-orange)'
  if (page <= 17) return 'var(--color-pill-green)'
  if (page <= 19) return 'var(--color-pill-lilac)'
  return 'var(--color-pill-orange)'
}

const eur = new Intl.NumberFormat('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const formatPrice = (p: number | null) => (p == null ? '' : `€ ${eur.format(p)}`)
