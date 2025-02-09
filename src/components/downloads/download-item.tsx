import React from 'react';
import { Download } from '@/types/aria2';
import { Progress } from '@/components/ui/progress';
import {
  formatBytes,
  formatSpeed,
  formatProgress,
  formatEta,
} from '@/lib/utils/format';
import { PauseIcon, PlayIcon, TrashIcon } from 'lucide-react';
import { useSelectionStore } from '@/store/selection';
import { cn } from '@/lib/utils/cn';

interface DownloadItemProps {
  download: Download;
  onPause?: () => void;
  onResume?: () => void;
  onRemove?: () => void;
}

export function DownloadItem({
  download,
  onPause,
  onResume,
  onRemove,
}: DownloadItemProps) {
  const { selectedGids, toggleGid } = useSelectionStore();
  const isSelected = selectedGids.has(download.gid);

  const progress = formatProgress(
    download.completedLength,
    download.totalLength
  );

  const isActive = download.status === 'active';
  const isPaused = download.status === 'paused';
  const isError = download.status === 'error';

  const variant = isError ? 'error' : isActive ? 'default' : 'success';

  return (
    <div 
      className={cn(
        'p-4 border rounded-lg bg-white dark:bg-gray-800 cursor-pointer transition-colors',
        isSelected && 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20'
      )}
      onClick={() => toggleGid(download.gid)}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium truncate">{download.bittorrent?.info.name || download.name}</h3>
        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
          {isActive && onPause && (
            <button
              onClick={onPause}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <PauseIcon className="w-4 h-4" />
            </button>
          )}
          {isPaused && onResume && (
            <button
              onClick={onResume}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <PlayIcon className="w-4 h-4" />
            </button>
          )}
          {onRemove && (
            <button
              onClick={onRemove}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-red-500"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <Progress value={progress} variant={variant} className="mb-2" />

      <div className="grid grid-cols-2 gap-2 text-sm text-gray-500 dark:text-gray-400">
        <div>
          {formatBytes(download.completedLength)} /{' '}
          {formatBytes(download.totalLength)}
        </div>
        <div className="text-right">
          {isActive ? (
            <>
              {formatSpeed(download.downloadSpeed)} •{' '}
              {formatEta(
                download.completedLength,
                download.totalLength,
                download.downloadSpeed
              )}
            </>
          ) : (
            <span className="capitalize">{download.status}</span>
          )}
        </div>
      </div>

      {isError && download.errorMessage && (
        <div className="mt-2 text-sm text-red-500">
          Error: {download.errorMessage}
        </div>
      )}
    </div>
  );
} 