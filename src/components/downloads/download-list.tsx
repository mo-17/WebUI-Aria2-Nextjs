import React from 'react';
import { useDownloadsStore } from '@/store/downloads';
import { useAria2 } from '@/lib/hooks/useAria2';
import { useKeyboardShortcuts } from '@/lib/hooks/useKeyboardShortcuts';
import { DownloadItem } from './download-item';
import { BulkActions } from './bulk-actions';
import { useI18n } from '@/hooks/useI18n';

export function DownloadList() {
  const { active, waiting, stopped } = useDownloadsStore();
  const aria2 = useAria2(process.env.NEXT_PUBLIC_ARIA2_URL || 'ws://localhost:6800/jsonrpc');
  const { t } = useI18n();

  const handlePause = async (gid: string) => {
    try {
      await aria2.pause(gid);
    } catch (error) {
      console.error('Failed to pause download:', error);
    }
  };

  const handleResume = async (gid: string) => {
    try {
      await aria2.unpause(gid);
    } catch (error) {
      console.error('Failed to resume download:', error);
    }
  };

  const handleRemove = async (gid: string) => {
    try {
      await aria2.remove(gid);
      await aria2.removeDownload(gid);
    } catch (error) {
      console.error('Failed to remove download:', error);
    }
  };

  // 合并所有下载项以传递给批量操作工具栏和键盘快捷键 Hook
  const allDownloads = [...active, ...waiting, ...stopped];
  useKeyboardShortcuts(allDownloads);

  return (
    <div className="space-y-6 pb-24">
      {active.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">{t('download.active')}</h2>
          <div className="space-y-3">
            {active.map((download) => (
              <DownloadItem
                key={download.gid}
                download={download}
                onPause={() => handlePause(download.gid)}
                onRemove={() => handleRemove(download.gid)}
              />
            ))}
          </div>
        </section>
      )}

      {waiting.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">{t('download.waiting')}</h2>
          <div className="space-y-3">
            {waiting.map((download) => (
              <DownloadItem
                key={download.gid}
                download={download}
                onResume={() => handleResume(download.gid)}
                onRemove={() => handleRemove(download.gid)}
              />
            ))}
          </div>
        </section>
      )}

      {stopped.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">{t('download.completed')}</h2>
          <div className="space-y-3">
            {stopped.map((download) => (
              <DownloadItem
                key={download.gid}
                download={download}
                onRemove={() => handleRemove(download.gid)}
              />
            ))}
          </div>
        </section>
      )}

      {active.length === 0 && waiting.length === 0 && stopped.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 py-12">
          {t('download.noTasks')}
        </div>
      )}

      {allDownloads.length > 0 && <BulkActions downloads={allDownloads} />}
    </div>
  );
} 