import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import faTranslations from './fa.json';
import enTranslations from './en.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      fa: { translation: faTranslations }
    },
    lng: 'fa', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
