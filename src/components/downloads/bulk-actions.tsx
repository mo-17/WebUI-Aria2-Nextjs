'use client';

import { useState } from 'react';
import { useSelectionStore } from '@/store/selection';
import { useDownloadsStore } from '@/store/downloads';
import { useAria2 } from '@/lib/hooks/useAria2';
import { useNotificationsStore } from '@/store/notifications';
import {
  PauseIcon,
  PlayIcon,
  TrashIcon,
  XIcon,
  ShareIcon,
  SettingsIcon,
  UndoIcon,
  RedoIcon,
} from 'lucide-react';
import { BulkSettingsDialog } from './bulk-settings-dialog';
import { ExportDialog } from './export-dialog';
import type { Download } from '@/types/aria2';
import { cn } from '@/lib/utils/cn';

interface BulkActionsProps {
  downloads: Array<Download>;
}

export function BulkActions({ downloads }: BulkActionsProps) {
  const { selectedGids, clearSelection, selectAll } = useSelectionStore();
  const { undo, redo, canUndo, canRedo } = useDownloadsStore();
  const aria2 = useAria2(process.env.NEXT_PUBLIC_ARIA2_URL || 'ws://localhost:6800/jsonrpc');
  const { addNotification } = useNotificationsStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  if (selectedGids.size === 0) return null;

  const handleUndo = () => {
    undo();
    addNotification({
      type: 'info',
      message: '已撤销排序',
    });
  };

  const handleRedo = () => {
    redo();
    addNotification({
      type: 'info',
      message: '已重做排序',
    });
  };

  const handlePause = async () => {
    try {
      await Promise.all(
        Array.from(selectedGids).map((gid) => aria2.pause(gid))
      );
      addNotification({
        type: 'success',
        message: '已暂停所选下载',
      });
    } catch (error) {
      console.error('Failed to pause downloads:', error);
      addNotification({
        type: 'error',
        message: '暂停下载失败',
      });
    }
  };

  const handleResume = async () => {
    try {
      await Promise.all(
        Array.from(selectedGids).map((gid) => aria2.unpause(gid))
      );
      addNotification({
        type: 'success',
        message: '已恢复所选下载',
      });
    } catch (error) {
      console.error('Failed to resume downloads:', error);
      addNotification({
        type: 'error',
        message: '恢复下载失败',
      });
    }
  };

  const handleRemove = async () => {
    if (!confirm('确定要删除所选下载吗？')) return;

    try {
      await Promise.all(
        Array.from(selectedGids).map((gid) => aria2.removeDownload(gid))
      );
      clearSelection();
      addNotification({
        type: 'success',
        message: '已删除所选下载',
      });
    } catch (error) {
      console.error('Failed to remove downloads:', error);
      addNotification({
        type: 'error',
        message: '删除下载失败',
      });
    }
  };

  const handleSelectAll = () => {
    selectAll(downloads.map((d) => d.gid));
  };

  const selectedCount = selectedGids.size;
  const totalCount = downloads.length;
  const hasActiveDownloads = downloads.some(
    (d) => selectedGids.has(d.gid) && d.status === 'active'
  );
  const hasPausedDownloads = downloads.some(
    (d) => selectedGids.has(d.gid) && d.status === 'paused'
  );

  // 获取选中的下载项
  const selectedDownloads = downloads.filter(d => selectedGids.has(d.gid));

  return (
    <>
      <div className="fixed bottom-16 md:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          已选择 {selectedCount} / {totalCount}
        </div>
        <div className="h-4 border-l dark:border-gray-700" />
        <button
          onClick={handleSelectAll}
          className="flex items-center gap-1 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          title="全选 (Ctrl+A)"
        >
          <span className="text-sm text-gray-600 dark:text-gray-400">全选</span>
          <span className="text-xs text-gray-400 dark:text-gray-500">Ctrl+A</span>
        </button>
        <button
          onClick={clearSelection}
          className="flex items-center gap-1 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          title="取消选择 (Esc)"
        >
          <XIcon className="w-4 h-4" />
          <span className="text-xs text-gray-400 dark:text-gray-500">Esc</span>
        </button>
        <div className="h-4 border-l dark:border-gray-700" />
        <button
          onClick={handleUndo}
          className={cn(
            'p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded',
            canUndo() ? 'text-blue-500' : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
          )}
          title="撤销排序 (Ctrl+Z)"
          disabled={!canUndo()}
        >
          <UndoIcon className="w-4 h-4" />
        </button>
        <button
          onClick={handleRedo}
          className={cn(
            'p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded',
            canRedo() ? 'text-blue-500' : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
          )}
          title="重做排序 (Ctrl+Y)"
          disabled={!canRedo()}
        >
          <RedoIcon className="w-4 h-4" />
        </button>
        <div className="h-4 border-l dark:border-gray-700" />
        {hasActiveDownloads && (
          <button
            onClick={handlePause}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="暂停所选"
          >
            <PauseIcon className="w-4 h-4" />
          </button>
        )}
        {hasPausedDownloads && (
          <button
            onClick={handleResume}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="恢复所选"
          >
            <PlayIcon className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={() => setIsExportOpen(true)}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-blue-500"
          title="导出下载信息"
        >
          <ShareIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-blue-500"
          title="批量修改设置"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>
        <button
          onClick={handleRemove}
          className="flex items-center gap-1 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-red-500"
          title="删除所选 (Delete)"
        >
          <TrashIcon className="w-4 h-4" />
          <span className="text-xs">Del</span>
        </button>
      </div>

      <BulkSettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        selectedGids={selectedGids}
      />

      <ExportDialog
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        selectedDownloads={selectedDownloads}
      />
    </>
  );
} 