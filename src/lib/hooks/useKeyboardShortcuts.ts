import { useEffect } from 'react';
import { useSelectionStore } from '@/store/selection';
import { useNotificationsStore } from '@/store/notifications';
import { useAria2 } from '@/lib/hooks/useAria2';
import type { Download } from '@/types/aria2';

export function useKeyboardShortcuts(downloads: Download[]) {
  const { selectedGids, selectAll, clearSelection } = useSelectionStore();
  const { addNotification } = useNotificationsStore();
  const aria2 = useAria2(process.env.NEXT_PUBLIC_ARIA2_URL || 'ws://localhost:6800/jsonrpc');

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // 如果正在输入，不处理快捷键
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Ctrl+A: 全选
      if (e.ctrlKey && e.key === 'a') {
        e.preventDefault();
        selectAll(downloads.map(d => d.gid));
        addNotification({
          type: 'info',
          message: '已全选下载项',
        });
      }

      // Esc: 取消选择
      if (e.key === 'Escape') {
        clearSelection();
        addNotification({
          type: 'info',
          message: '已取消选择',
        });
      }

      // Delete: 删除选中项
      if (e.key === 'Delete' && selectedGids.size > 0) {
        e.preventDefault();
        if (!confirm('确定要删除所选下载吗？')) return;

        try {
          await Promise.all(
            Array.from(selectedGids).map((gid) => aria2.remove(gid))
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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [downloads, selectedGids, selectAll, clearSelection, addNotification, aria2]);
} 