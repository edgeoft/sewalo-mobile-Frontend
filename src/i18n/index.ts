import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import ne from './locales/ne.json';

const resources = {
  en: { translation: en },
  ne: { translation: ne },
};

const i18nInstance = i18n;

i18nInstance.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  compatibilityJSON: 'v4',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
