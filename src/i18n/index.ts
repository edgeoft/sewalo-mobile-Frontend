import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';

import commonEn from './locales/en/common.json';
import onboardingEn from './locales/en/onboarding.json';
import authEn from './locales/en/auth.json';
import notificationsEn from './locales/en/notifications.json';
import homeEn from './locales/en/home.json';
import navigationEn from './locales/en/navigation.json';
import customerEn from './locales/en/customer.json';
import providerEn from './locales/en/provider.json';
import componentsEn from './locales/en/components.json';
import servicesEn from './locales/en/services.json';
import settingsEn from './locales/en/settings.json';
import blogEn from './locales/en/blog.json';
import guestEn from './locales/en/guest.json';
import errorsEn from './locales/en/errors.json';
import termsEn from './locales/en/terms.json';
import privacyEn from './locales/en/privacy.json';

import commonNe from './locales/ne/common.json';
import onboardingNe from './locales/ne/onboarding.json';
import authNe from './locales/ne/auth.json';
import notificationsNe from './locales/ne/notifications.json';
import homeNe from './locales/ne/home.json';
import navigationNe from './locales/ne/navigation.json';
import customerNe from './locales/ne/customer.json';
import providerNe from './locales/ne/provider.json';
import componentsNe from './locales/ne/components.json';
import servicesNe from './locales/ne/services.json';
import settingsNe from './locales/ne/settings.json';
import blogNe from './locales/ne/blog.json';
import guestNe from './locales/ne/guest.json';
import errorsNe from './locales/ne/errors.json';
import termsNe from './locales/ne/terms.json';
import privacyNe from './locales/ne/privacy.json';

const resources = {
  en: {
    translation: {
      common: commonEn,
      onboarding: onboardingEn,
      auth: authEn,
      notifications: notificationsEn,
      home: homeEn,
      navigation: navigationEn,
      customer: customerEn,
      provider: providerEn,
      components: componentsEn,
      services: servicesEn,
      settings: settingsEn,
      blog: blogEn,
      guest: guestEn,
      errors: errorsEn,
      terms: termsEn,
      privacy: privacyEn,
    },
  },
  ne: {
    translation: {
      common: commonNe,
      onboarding: onboardingNe,
      auth: authNe,
      notifications: notificationsNe,
      home: homeNe,
      navigation: navigationNe,
      customer: customerNe,
      provider: providerNe,
      components: componentsNe,
      services: servicesNe,
      settings: settingsNe,
      blog: blogNe,
      guest: guestNe,
      errors: errorsNe,
      terms: termsNe,
      privacy: privacyNe,
    },
  },
};

const i18nInstance = i18n;

const deviceLanguage = getLocales?.()?.[0]?.languageCode === 'ne' ? 'ne' : 'en';

i18nInstance.use(initReactI18next).init({
  resources,
  lng: deviceLanguage,
  fallbackLng: 'en',
  compatibilityJSON: 'v4',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
