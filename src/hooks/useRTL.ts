// src/hooks/useRTL.ts
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const useRTL = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Add RTL class to HTML element for RTL languages
    const html = document.documentElement;
    const isRTL = ['ar', 'he', 'fa'].includes(i18n.language);

    if (isRTL) {
      html.dir = 'rtl';
      html.lang = i18n.language;
    } else {
      html.dir = 'ltr';
      html.lang = i18n.language;
    }

    return () => {
      // Cleanup if needed
    };
  }, [i18n.language]);
};

// Usage in your App component:
const App = () => {
  useRTL();
  // ... rest of your component
};