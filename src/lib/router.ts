import { useSyncExternalStore } from 'react'

/** Hash routes: `#/` (home) and `#/menu` or `#/menu/<categoryId>`. Works on GitHub Pages without rewrites. */
export type Route = { name: 'home' } | { name: 'menu'; categoryId: string | null }

function parse(hash: string): Route {
  const m = hash.match(/^#\/menu(?:\/([\w-]+))?/)
  if (m) return { name: 'menu', categoryId: m[1] ?? null }
  return { name: 'home' }
}

const subscribe = (cb: () => void) => {
  window.addEventListener('hashchange', cb)
  return () => window.removeEventListener('hashchange', cb)
}

export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash, () => '')
  return parse(hash)
}

export const menuHref = (categoryId?: string) => (categoryId ? `#/menu/${categoryId}` : '#/menu')

/** Update the category in the URL without adding history entries (used while flipping). */
export function replaceMenuCategory(categoryId: string) {
  const next = menuHref(categoryId)
  if (window.location.hash !== next) history.replaceState(null, '', next)
}
