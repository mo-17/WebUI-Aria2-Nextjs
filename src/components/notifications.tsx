'use client';

import { useNotificationsStore } from '@/store/notifications';
import { AlertCircleIcon, CheckCircleIcon, InfoIcon, XCircleIcon, XIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function Notifications() {
  const { notifications, removeNotification } = useNotificationsStore();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg border animate-in slide-in-from-right',
            {
              'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800':
                notification.type === 'success',
              'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800':
                notification.type === 'error',
              'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800':
                notification.type === 'info',
              'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800':
                notification.type === 'warning',
            }
          )}
        >
          {notification.type === 'success' && (
            <CheckCircleIcon className="w-5 h-5 text-green-500" />
          )}
          {notification.type === 'error' && (
            <XCircleIcon className="w-5 h-5 text-red-500" />
          )}
          {notification.type === 'info' && (
            <InfoIcon className="w-5 h-5 text-blue-500" />
          )}
          {notification.type === 'warning' && (
            <AlertCircleIcon className="w-5 h-5 text-yellow-500" />
          )}
          <span
            className={cn('text-sm', {
              'text-green-700 dark:text-green-300': notification.type === 'success',
              'text-red-700 dark:text-red-300': notification.type === 'error',
              'text-blue-700 dark:text-blue-300': notification.type === 'info',
              'text-yellow-700 dark:text-yellow-300': notification.type === 'warning',
            })}
          >
            {notification.message}
          </span>
          <button
            onClick={() => removeNotification(notification.id)}
            className={cn('p-1 rounded hover:bg-black/5 dark:hover:bg-white/5', {
              'text-green-700 dark:text-green-300': notification.type === 'success',
              'text-red-700 dark:text-red-300': notification.type === 'error',
              'text-blue-700 dark:text-blue-300': notification.type === 'info',
              'text-yellow-700 dark:text-yellow-300': notification.type === 'warning',
            })}
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
} 