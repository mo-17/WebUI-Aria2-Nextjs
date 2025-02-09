'use client';

import { useState, useEffect } from 'react';
import { useSettingsStore } from '@/store/settings';
import { useAria2 } from '@/lib/hooks/useAria2';
import { useNotificationsStore } from '@/store/notifications';

declare global {
  interface Window {
    electron?: {
      openDirectory: () => Promise<string>;
    };
  }
}

export default function Settings() {
  const settings = useSettingsStore();
  const aria2 = useAria2(process.env.NEXT_PUBLIC_ARIA2_URL || 'ws://localhost:6800/jsonrpc');
  const { addNotification } = useNotificationsStore();
  const [isSaving, setIsSaving] = useState(false);
  const [dirExists, setDirExists] = useState(true);

  // 检查目录是否存在
  useEffect(() => {
    const checkDir = async () => {
      try {
        // 使用 aria2.changeGlobalOption 尝试设置目录
        // 如果目录不存在，aria2 会返回错误
        await aria2.changeGlobalOption({ dir: settings.dir });
        setDirExists(true);
      } catch (error) {
        setDirExists(false);
        console.error('Directory check failed:', error);
      }
    };

    if (settings.dir) {
      checkDir();
    }
  }, [settings.dir, aria2]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const formData = new FormData(e.currentTarget);
      const newSettings = {
        maxConcurrentDownloads: Number(formData.get('maxConcurrentDownloads')),
        maxOverallDownloadLimit: Number(formData.get('maxOverallDownloadLimit')),
        maxOverallUploadLimit: Number(formData.get('maxOverallUploadLimit')),
        dir: formData.get('dir') as string,
        userAgent: formData.get('userAgent') as string,
      };

      // 更新 aria2 设置
      await aria2.changeGlobalOption({
        'max-concurrent-downloads': newSettings.maxConcurrentDownloads.toString(),
        'max-overall-download-limit': newSettings.maxOverallDownloadLimit.toString(),
        'max-overall-upload-limit': newSettings.maxOverallUploadLimit.toString(),
        dir: newSettings.dir,
        'user-agent': newSettings.userAgent,
      });

      // 更新本地存储
      settings.updateSettings(newSettings);
      
      addNotification({
        type: 'success',
        message: '设置已保存',
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      addNotification({
        type: 'error',
        message: '保存设置失败',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">设置</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              最大同时下载数
            </label>
            <input
              type="number"
              name="maxConcurrentDownloads"
              defaultValue={settings.maxConcurrentDownloads}
              min="1"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              最大下载速度 (bytes/sec, 0 表示不限制)
            </label>
            <input
              type="number"
              name="maxOverallDownloadLimit"
              defaultValue={settings.maxOverallDownloadLimit}
              min="0"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              最大上传速度 (bytes/sec, 0 表示不限制)
            </label>
            <input
              type="number"
              name="maxOverallUploadLimit"
              defaultValue={settings.maxOverallUploadLimit}
              min="0"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              下载目录
            </label>
            <div className="space-y-2">
              <div className="relative">
                <input
                  type="text"
                  name="dir"
                  defaultValue={settings.dir}
                  placeholder="例如：./downloads 或 /Users/username/Downloads"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 ${
                    !dirExists ? 'border-red-500 dark:border-red-500' : ''
                  }`}
                />
                {!dirExists && (
                  <p className="mt-1.5 text-sm text-red-500">
                    目录不存在或无权限访问
                  </p>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                支持相对路径（如 ./downloads）或绝对路径（如 /Users/username/Downloads）
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              User Agent
            </label>
            <input
              type="text"
              name="userAgent"
              defaultValue={settings.userAgent}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSaving || !dirExists}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
            >
              {isSaving ? '保存中...' : '保存设置'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
} 