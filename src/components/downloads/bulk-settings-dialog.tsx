'use client';

import { useState } from 'react';
import { useAria2 } from '@/lib/hooks/useAria2';
import { useNotificationsStore } from '@/store/notifications';
import { XIcon } from 'lucide-react';
import { formatBytes } from '@/lib/utils/format';

interface BulkSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGids: Set<string>;
}

interface Settings {
  maxDownloadLimit: string;
  maxUploadLimit: string;
  dir: string;
}

export function BulkSettingsDialog({
  isOpen,
  onClose,
  selectedGids,
}: BulkSettingsDialogProps) {
  const [settings, setSettings] = useState<Settings>({
    maxDownloadLimit: '',
    maxUploadLimit: '',
    dir: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const aria2 = useAria2(process.env.NEXT_PUBLIC_ARIA2_URL || 'ws://localhost:6800/jsonrpc');
  const { addNotification } = useNotificationsStore();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const options: Record<string, string> = {};

      // 只包含有值的设置
      if (settings.maxDownloadLimit) {
        options['max-download-limit'] = settings.maxDownloadLimit;
      }
      if (settings.maxUploadLimit) {
        options['max-upload-limit'] = settings.maxUploadLimit;
      }
      if (settings.dir) {
        options.dir = settings.dir;
      }

      // 如果没有任何设置被修改，直接返回
      if (Object.keys(options).length === 0) {
        addNotification({
          type: 'info',
          message: '没有设置被修改',
        });
        onClose();
        return;
      }

      // 批量修改设置
      await Promise.all(
        Array.from(selectedGids).map((gid) =>
          aria2.changeOption(gid, options)
        )
      );

      addNotification({
        type: 'success',
        message: '已更新下载设置',
      });
      onClose();
    } catch (error) {
      console.error('Failed to update settings:', error);
      addNotification({
        type: 'error',
        message: '更新设置失败',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSpeedInput = (value: string, field: keyof Settings) => {
    // 移除非数字字符
    const number = value.replace(/[^0-9]/g, '');
    setSettings((prev) => ({
      ...prev,
      [field]: number,
    }));
  };

  const formatSpeedLimit = (value: string) => {
    if (!value) return '';
    return formatBytes(parseInt(value, 10)) + '/s';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">批量修改设置</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              最大下载速度
            </label>
            <div className="relative">
              <input
                type="text"
                value={settings.maxDownloadLimit}
                onChange={(e) => handleSpeedInput(e.target.value, 'maxDownloadLimit')}
                placeholder="0 表示不限制"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
              {settings.maxDownloadLimit && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  {formatSpeedLimit(settings.maxDownloadLimit)}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              最大上传速度
            </label>
            <div className="relative">
              <input
                type="text"
                value={settings.maxUploadLimit}
                onChange={(e) => handleSpeedInput(e.target.value, 'maxUploadLimit')}
                placeholder="0 表示不限制"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
              {settings.maxUploadLimit && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  {formatSpeedLimit(settings.maxUploadLimit)}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              下载目录
            </label>
            <input
              type="text"
              value={settings.dir}
              onChange={(e) => setSettings((prev) => ({ ...prev, dir: e.target.value }))}
              placeholder="保持原目录不变"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              disabled={isSubmitting}
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? '保存中...' : '保存设置'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 