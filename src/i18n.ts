import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import it from './locales/it.json'

export const SITE_LANGS = ['it', 'en'] as const
export type SiteLang = (typeof SITE_LANGS)[number]

/** Keeps <html lang>, the title and the meta description in step with the site language. */
function syncDocument(lng: string): void {
  const lang: SiteLang = lng.startsWith('en') ? 'en' : 'it'
  document.documentElement.lang = lang
  document.title = i18n.t('meta.title', { lng: lang })
  document.querySelector('meta[name="description"]')?.setAttribute('content', i18n.t('meta.description', { lng: lang }))
}

i18n.on('languageChanged', syncDocument)

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { it: { translation: it }, en: { translation: en } },
    supportedLngs: SITE_LANGS,
    nonExplicitSupportedLngs: true,
    load: 'languageOnly',
    fallbackLng: 'it',
    initAsync: false,
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'ldi-lang',
      caches: ['localStorage'],
    },
  })

export const currentLang = (): SiteLang => (i18n.resolvedLanguage === 'en' ? 'en' : 'it')

export default i18n
