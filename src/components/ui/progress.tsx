import * as React from 'react';
import { cn } from '@/lib/utils/cn';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

const variantStyles = {
  default: 'bg-blue-600',
  success: 'bg-green-600',
  warning: 'bg-yellow-600',
  error: 'bg-red-600',
};

export function Progress({
  value,
  max = 100,
  variant = 'default',
  className,
  ...props
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div
      className={cn(
        'h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'h-full w-full transition-all',
          variantStyles[variant]
        )}
        style={{ width: `${percentage}%` }}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
      />
    </div>
  );
} 