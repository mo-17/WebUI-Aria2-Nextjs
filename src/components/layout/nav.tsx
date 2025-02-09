'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DownloadIcon, SettingsIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export function Nav() {
  const pathname = usePathname();

  const links = [
    {
      href: '/',
      label: '下载',
      icon: DownloadIcon,
    },
    {
      href: '/settings',
      label: '设置',
      icon: SettingsIcon,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-white dark:bg-gray-800 dark:border-gray-700 md:relative md:border-t-0 md:border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex justify-around md:justify-start md:space-x-8">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col md:flex-row items-center gap-1 px-3 py-3 text-sm font-medium transition-colors',
                  pathname === href
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </Link>
            ))}
          </div>
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
} 