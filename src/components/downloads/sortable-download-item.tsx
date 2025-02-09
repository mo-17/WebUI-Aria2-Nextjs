'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVerticalIcon } from 'lucide-react';
import { DownloadItem } from './download-item';
import type { Download } from '@/types/aria2';

interface SortableDownloadItemProps {
  download: Download;
  onPause?: () => void;
  onResume?: () => void;
  onRemove?: () => void;
}

export function SortableDownloadItem({
  download,
  onPause,
  onResume,
  onRemove,
}: SortableDownloadItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: download.gid });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <button
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
        {...attributes}
        {...listeners}
      >
        <GripVerticalIcon className="w-4 h-4 text-gray-400" />
      </button>
      <DownloadItem
        download={download}
        onPause={onPause}
        onResume={onResume}
        onRemove={onRemove}
      />
    </div>
  );
} 