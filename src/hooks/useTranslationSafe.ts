// src/hooks/useTranslationSafe.ts
import { useTranslation as useI18nTranslation } from 'react-i18next';
import { TFunction } from 'i18next';

// Define the translation keys for type safety
type TranslationKeys = 
  | 'nav.map' | 'nav.home' | 'nav.settings' | 'nav.messages' | 'nav.report' | 'nav.profile' | 'nav.adopt'
  | `home.${string}`
  | `common.${string}`
  | `auth.${string}`
  | `profile.${string}`
  | `settings.${string}`
  | `notification.${string}`
  | string; // Fallback for any other keys

// Define the options type for the translation function
type TranslationOptions = {
  defaultValue?: string;
  [key: string]: any; // Allow any other options for i18next
} | string; // Also allow string as a shortcut for defaultValue

interface UseTranslationSafeReturn {
  t: (key: TranslationKeys, options?: TranslationOptions) => string;
  i18n: {
    language: string;
    changeLanguage: (lng: string) => Promise<TFunction>;
  };
  ready: boolean;
  language: string;
  changeLanguage: (lng: string) => Promise<TFunction>;
}

export const useTranslationSafe = (): UseTranslationSafeReturn => {
  const { t: originalT, i18n, ready } = useI18nTranslation();

  // A type-safe version of t() that handles missing keys and string options
  const tSafe: UseTranslationSafeReturn['t'] = (key, options) => {
    if (!key) {
      if (typeof options === 'string') return options;
      return options?.defaultValue || '';
    }
    
    try {
      // Handle both string and object options
      const tOptions = typeof options === 'string' 
        ? { defaultValue: options }
        : options || {};

      const result = originalT(key as any, tOptions);
      
      // If the key doesn't exist, i18next returns the key by default
      return result !== key ? result : (tOptions.defaultValue || key);
    } catch (error) {
      console.warn(`Translation error for key "${key}":`, error);
      if (typeof options === 'string') return options;
      return options?.defaultValue || key;
    }
  };

  return {
    t: tSafe,
    i18n: {
      language: i18n.language,
      changeLanguage: i18n.changeLanguage.bind(i18n)
    },
    ready,
    language: i18n.language,
    changeLanguage: i18n.changeLanguage.bind(i18n)
  };
};