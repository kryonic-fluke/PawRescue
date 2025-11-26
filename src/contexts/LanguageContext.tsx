// src/contexts/LanguageContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../lib/i18n';

type LanguageContextType = {
  currentLanguage: string;
  changeLanguage: (lng: string) => Promise<boolean>;
  t: (key: string, defaultValue?: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = async (lng: string) => {
    const success = await changeLanguage(lng);
    if (success) {
      // Optional: You can add analytics or other side effects here
    }
    return success;
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage: i18n.language,
        changeLanguage: handleLanguageChange,
        t: (key, defaultValue) => t(key, defaultValue || '')
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};