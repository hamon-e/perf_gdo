import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from 'i18next-browser-languagedetector';
import translationEN from './translations/en/translationEN.json'
import translationFR from './translations/fr/translationFR.json'

const resources = {
  en: translationEN,
  fr: translationFR
}

i18n
.use(initReactI18next) // passes i18n down to react-i18next
.use(LanguageDetector)
.init({
  resources,
  fallbackLng: "fr",
  detection: {
    order: ['localStorage'],
    lookupLocalStorage: 'i18nextLng',
    caches: ['localStorage'],
  },
  load: 'current',
  interpolation: {
    escapeValue: false,
    formatSeparator: ',',
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
