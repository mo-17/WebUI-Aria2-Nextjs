'use client';

import { SunIcon, MoonIcon, MonitorIcon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import type { Theme } from '@/store/theme';

const themes: { value: Theme; label: string; icon: typeof SunIcon }[] = [
  { value: 'light', label: '浅色', icon: SunIcon },
  { value: 'dark', label: '深色', icon: MoonIcon },
  { value: 'system', label: '系统', icon: MonitorIcon },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="relative inline-block">
      <div className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-gray-800 shadow">
        {themes.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={`p-2 rounded-md transition-colors ${
              theme === value
                ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
            title={label}
          >
            <Icon className="w-5 h-5" />
          </button>
        ))}
      </div>
    </div>
  );
} 