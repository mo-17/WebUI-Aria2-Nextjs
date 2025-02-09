import { useCallback, useEffect } from 'react';
import { useThemeStore } from '@/store/theme';
import { lightTheme, darkTheme, type CustomTheme } from '@/styles/theme';

export function useTheme() {
  const { theme, setTheme } = useThemeStore();

  const getSystemTheme = useCallback(() => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, []);

  const getCurrentTheme = useCallback((): CustomTheme => {
    const actualTheme = theme === 'system' ? getSystemTheme() : theme;
    return actualTheme === 'dark' ? darkTheme : lightTheme;
  }, [theme, getSystemTheme]);

  useEffect(() => {
    const root = window.document.documentElement;
    const actualTheme = theme === 'system' ? getSystemTheme() : theme;
    
    root.classList.remove('light', 'dark');
    root.classList.add(actualTheme);

    // 监听系统主题变化
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        root.classList.remove('light', 'dark');
        root.classList.add(mediaQuery.matches ? 'dark' : 'light');
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme, getSystemTheme]);

  return {
    theme,
    setTheme,
    currentTheme: getCurrentTheme(),
  };
} 