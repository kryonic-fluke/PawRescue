// src/lib/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from '../locales/en/translation.json';
import esTranslation from '../locales/es/translation.json';
import hiTranslation from '../locales/hi/translation.json';
import { languageDetector } from './languageDetector';
// Safely get language from localStorage with fallback
const getInitialLanguage = (): string => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('app_language') || 'en';
    }
  } catch (error) {
    console.warn('Failed to access localStorage:', error);
  }
  return 'en';
};

// Type for our translation resources
type TranslationResources = {
  [key: string]: {
    translation: Record<string, any>;
  };
};

const resources: TranslationResources = {
  en: { translation: enTranslation },
  es: { translation: esTranslation },
  hi: { translation: hiTranslation }
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already safes from XSS
    },
    react: {
      useSuspense: false
    }
  });

// Function to change language
export const changeLanguage = (lng: string): Promise<boolean> => {
  return new Promise((resolve) => {
    i18n.changeLanguage(lng).then(() => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('app_language', lng);
        }
        resolve(true);
      } catch (error) {
        console.warn('Failed to save language preference:', error);
        resolve(false);
      }
    }).catch(() => resolve(false));
  });
};

// Type for the i18n instance
export type I18n = typeof i18n;
export default i18n;