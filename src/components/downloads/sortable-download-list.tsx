'use client';

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableDownloadItem } from './sortable-download-item';
import type { Download } from '@/types/aria2';

interface SortableDownloadListProps {
  downloads: Download[];
  onReorder: (startIndex: number, endIndex: number) => void;
  onPause?: (gid: string) => void;
  onResume?: (gid: string) => void;
  onRemove?: (gid: string) => void;
}

export function SortableDownloadList({
  downloads,
  onReorder,
  onPause,
  onResume,
  onRemove,
}: SortableDownloadListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = downloads.findIndex((item) => item.gid === active.id);
    const newIndex = downloads.findIndex((item) => item.gid === over.id);

    onReorder(oldIndex, newIndex);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      {/* @ts-expect-error - SortableContext 的类型定义与 React 18 不完全兼容 */}
      <SortableContext
        items={downloads.map((item) => item.gid)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3 pl-8">
          {downloads.map((download) => (
            <SortableDownloadItem
              key={download.gid}
              download={download}
              onPause={onPause ? () => onPause(download.gid) : undefined}
              onResume={onResume ? () => onResume(download.gid) : undefined}
              onRemove={onRemove ? () => onRemove(download.gid) : undefined}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
} 