import { MENU_LANGS, type MenuLang } from '../data/menu'

/** Menu UI strings. Kept local to the menu (six languages); the site's i18next covers only it/en. */
export type MenuStrings = {
  langName: string
  back: string
  menu: string
  prev: string
  next: string
  categories: string
  showCategories: string
  hideCategories: string
  cover: string
  backCover: string
  info: string
  language: string
  book: string
  continued: string
  glass: string
  bottle: string
  toppings: string
  thanks: string
  openDaily: string
  phone: string
  address: string
  /** Live-region text and page indicator for the visible printed pages. */
  pages: (visible: number[], total: number) => string
}

export const MENU_STRINGS: Record<MenuLang, MenuStrings> = {
  it: {
    langName: 'Italiano',
    back: 'Torna al sito',
    menu: 'Menù',
    prev: 'Pagina precedente',
    next: 'Pagina successiva',
    categories: 'Categorie',
    showCategories: 'Mostra categorie',
    hideCategories: 'Nascondi categorie',
    cover: 'Copertina',
    backCover: 'Retro',
    info: 'Informazioni',
    language: 'Lingua del menù',
    book: 'libro',
    continued: 'segue',
    glass: 'calice',
    bottle: 'bottiglia',
    toppings: 'Farcitura a scelta',
    thanks: 'Grazie e a presto',
    openDaily: 'Aperto tutti i giorni',
    phone: 'Telefono',
    address: 'Indirizzo',
    pages: (v, t) => (v.length > 1 ? `Pagine ${v[0]} e ${v[1]} di ${t}` : `Pagina ${v[0]} di ${t}`),
  },
  en: {
    langName: 'English',
    back: 'Back to the site',
    menu: 'Menu',
    prev: 'Previous page',
    next: 'Next page',
    categories: 'Categories',
    showCategories: 'Show categories',
    hideCategories: 'Hide categories',
    cover: 'Cover',
    backCover: 'Back cover',
    info: 'Information',
    language: 'Menu language',
    book: 'book',
    continued: 'continued',
    glass: 'glass',
    bottle: 'bottle',
    toppings: 'Choice of topping',
    thanks: 'Thank you, see you soon',
    openDaily: 'Open every day',
    phone: 'Phone',
    address: 'Address',
    pages: (v, t) => (v.length > 1 ? `Pages ${v[0]} and ${v[1]} of ${t}` : `Page ${v[0]} of ${t}`),
  },
  ru: {
    langName: 'Русский',
    back: 'Назад на сайт',
    menu: 'Меню',
    prev: 'Предыдущая страница',
    next: 'Следующая страница',
    categories: 'Разделы',
    showCategories: 'Показать разделы',
    hideCategories: 'Скрыть разделы',
    cover: 'Обложка',
    backCover: 'Задняя обложка',
    info: 'Информация',
    language: 'Язык меню',
    book: 'книга',
    continued: 'продолжение',
    glass: 'бокал',
    bottle: 'бутылка',
    toppings: 'Начинка на выбор',
    thanks: 'Спасибо, до скорой встречи',
    openDaily: 'Открыто ежедневно',
    phone: 'Телефон',
    address: 'Адрес',
    pages: (v, t) => (v.length > 1 ? `Страницы ${v[0]} и ${v[1]} из ${t}` : `Страница ${v[0]} из ${t}`),
  },
  uk: {
    langName: 'Українська',
    back: 'Назад на сайт',
    menu: 'Меню',
    prev: 'Попередня сторінка',
    next: 'Наступна сторінка',
    categories: 'Розділи',
    showCategories: 'Показати розділи',
    hideCategories: 'Сховати розділи',
    cover: 'Обкладинка',
    backCover: 'Задня обкладинка',
    info: 'Інформація',
    language: 'Мова меню',
    book: 'книга',
    continued: 'продовження',
    glass: 'келих',
    bottle: 'пляшка',
    toppings: 'Начинка на вибір',
    thanks: 'Дякуємо, до зустрічі',
    openDaily: 'Відчинено щодня',
    phone: 'Телефон',
    address: 'Адреса',
    pages: (v, t) => (v.length > 1 ? `Сторінки ${v[0]} і ${v[1]} з ${t}` : `Сторінка ${v[0]} з ${t}`),
  },
  pl: {
    langName: 'Polski',
    back: 'Powrót do strony',
    menu: 'Menu',
    prev: 'Poprzednia strona',
    next: 'Następna strona',
    categories: 'Kategorie',
    showCategories: 'Pokaż kategorie',
    hideCategories: 'Ukryj kategorie',
    cover: 'Okładka',
    backCover: 'Tylna okładka',
    info: 'Informacje',
    language: 'Język menu',
    book: 'książka',
    continued: 'ciąg dalszy',
    glass: 'kieliszek',
    bottle: 'butelka',
    toppings: 'Dodatek do wyboru',
    thanks: 'Dziękujemy, do zobaczenia',
    openDaily: 'Otwarte codziennie',
    phone: 'Telefon',
    address: 'Adres',
    pages: (v, t) => (v.length > 1 ? `Strony ${v[0]} i ${v[1]} z ${t}` : `Strona ${v[0]} z ${t}`),
  },
  de: {
    langName: 'Deutsch',
    back: 'Zurück zur Website',
    menu: 'Speisekarte',
    prev: 'Vorherige Seite',
    next: 'Nächste Seite',
    categories: 'Kategorien',
    showCategories: 'Kategorien anzeigen',
    hideCategories: 'Kategorien ausblenden',
    cover: 'Einband',
    backCover: 'Rückseite',
    info: 'Informationen',
    language: 'Sprache der Speisekarte',
    book: 'Buch',
    continued: 'Fortsetzung',
    glass: 'Glas',
    bottle: 'Flasche',
    toppings: 'Belag nach Wahl',
    thanks: 'Danke und bis bald',
    openDaily: 'Täglich geöffnet',
    phone: 'Telefon',
    address: 'Adresse',
    pages: (v, t) => (v.length > 1 ? `Seiten ${v[0]} und ${v[1]} von ${t}` : `Seite ${v[0]} von ${t}`),
  },
}

export const LANG_STORAGE_KEY = 'ldi-menu-lang'

const isMenuLang = (v: string | null | undefined): v is MenuLang =>
  v != null && (MENU_LANGS as readonly string[]).includes(v)

/** Saved choice first, then the site language (`<html lang>`), then Italian. */
export function initialMenuLang(): MenuLang {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY)
    if (isMenuLang(saved)) return saved
  } catch {
    // Storage can be unavailable (private mode); fall through to the site language.
  }
  const site = document.documentElement.lang.slice(0, 2).toLowerCase()
  return isMenuLang(site) ? site : 'it'
}

export function saveMenuLang(lang: MenuLang) {
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang)
  } catch {
    // Not persisting is acceptable; the switch still applies for this visit.
  }
}
