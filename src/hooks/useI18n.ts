import { useCallback } from 'react';
import { en } from '@/i18n/en';
import { zh } from '@/i18n/zh';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Language = 'en' | 'zh';
type Messages = typeof en;
type NestedMessages = Messages | string;

interface I18nState {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const useI18nStore = create<I18nState>()(
  persist(
    (set) => ({
      language: 'zh',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'aria2-language',
    }
  )
);

const messages: Record<Language, Messages> = {
  en,
  zh,
};

export function useI18n() {
  const { language, setLanguage } = useI18nStore();

  const t = useCallback((key: string) => {
    const keys = key.split('.');
    let value: NestedMessages = messages[language];
    
    for (const k of keys) {
      if (typeof value === 'string') {
        console.warn(`Invalid translation key path: ${key}`);
        return key;
      }
      value = value[k];
      if (value === undefined) {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }
    
    if (typeof value !== 'string') {
      console.warn(`Translation value is not a string: ${key}`);
      return key;
    }
    
    return value;
  }, [language]);

  return {
    t,
    language,
    setLanguage,
  };
} 