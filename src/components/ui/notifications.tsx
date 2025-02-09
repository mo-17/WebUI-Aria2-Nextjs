'use client';

import { useNotificationsStore } from '@/store/notifications';
import { XIcon, CheckCircleIcon, XCircleIcon, InfoIcon, AlertCircleIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const icons = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  info: InfoIcon,
  warning: AlertCircleIcon,
} as const;

const styles = {
  success: 'bg-green-50 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  error: 'bg-red-50 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  info: 'bg-blue-50 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  warning: 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
} as const;

export function Notifications() {
  const { notifications, removeNotification } = useNotificationsStore();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-0 right-0 p-4 mb-16 md:mb-0 space-y-2 z-50">
      {notifications.map((notification) => {
        const Icon = icons[notification.type];
        return (
          <div
            key={notification.id}
            className={cn(
              'flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg max-w-sm',
              styles[notification.type]
            )}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{notification.message}</p>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-auto flex-shrink-0 hover:opacity-75"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        );
      })}
    </div>
  );
} 