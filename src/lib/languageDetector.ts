// src/lib/languageDetector.ts
import { ModuleType } from 'i18next';

const languageDetector = {
  type: 'languageDetector' as ModuleType,
  async: true,
  detect: (callback: (lng: string) => void) => {
    try {
      // Get from localStorage
      const savedLanguage = localStorage.getItem('app_language');
      if (savedLanguage) {
        return callback(savedLanguage);
      }

      // Get browser language
      const browserLanguage = navigator.language.split('-')[0];
      const supportedLanguages = ['en', 'es', 'hi'];
      
      if (supportedLanguages.includes(browserLanguage)) {
        return callback(browserLanguage);
      }

      // Default to English
      callback('en');
    } catch (error) {
      console.warn('Error detecting language:', error);
      callback('en');
    }
  },
  init: () => {},
  cacheUserLanguage: () => {}
} as const;

export { languageDetector };