'use client';

import React, { useState, useCallback } from 'react';
import { useAria2 } from '@/lib/hooks/useAria2';
import { useNotificationsStore } from '@/store/notifications';
import { useSettingsStore } from '@/store/settings';
import { FileSelector } from './file-selector';
import { UploadIcon, Settings2Icon } from 'lucide-react';
import { formatBytes } from '@/lib/utils/format';
import type { DownloadFile } from '@/types/aria2';
import { useDownloadsStore } from '@/store/downloads';
interface NewDownloadDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DownloadOptions {
  dir?: string;
  'max-download-limit'?: string;
  'max-upload-limit'?: string;
  'seed-time'?: string;
  'seed-ratio'?: string;
  'bt-prioritize-piece'?: 'head' | 'tail';
  'split'?: string;
  'min-split-size'?: string;
  'max-connection-per-server'?: string;
  'allow-overwrite'?: string;
}

interface TorrentInfo {
  name?: string;
  comment?: string;
  creationDate?: string;
  totalLength?: string;
  files: DownloadFile[];
}

export function NewDownloadDialog({ isOpen, onClose }: NewDownloadDialogProps) {
  const [urls, setUrls] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [torrentFiles, setTorrentFiles] = useState<DownloadFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [torrentBase64, setTorrentBase64] = useState('');
  const [torrentInfo, setTorrentInfo] = useState<TorrentInfo | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [options, setOptions] = useState<DownloadOptions>({});
  const settings = useSettingsStore();
  const aria2 = useAria2(process.env.NEXT_PUBLIC_ARIA2_URL || 'ws://localhost:6800/jsonrpc');
  const { addNotification } = useNotificationsStore();
  const { setDownloads, stopped } = useDownloadsStore();
  
  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // 直接获取种子文件信息
      const info = await aria2.getTorrentInfo(base64);
      console.log(info);
      await aria2.removeDownload(info.gid);
    //   console.log(stopped);
    //   setDownloads('stopped', stopped.filter(d => d.gid !== info.gid));
      setTorrentFiles(info.files);
      setSelectedFiles(info.files.map(f => f.path));
      setTorrentBase64(base64);
      setTorrentInfo(info);

      addNotification({
        type: 'success',
        message: '种子文件已加载',
      });
    } catch (error) {
      console.error('Failed to load torrent:', error);
      addNotification({
        type: 'error',
        message: '加载种子文件失败',
      });
    }
  }, [aria2, addNotification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urls.trim() && !torrentBase64) return;

    setIsSubmitting(true);
    try {
      const defaultOptions = {
        'allow-overwrite': 'true',
        ...options
      };

      if (urls.trim()) {
        const urlList = urls
          .split('\n')
          .map(url => url.trim())
          .filter(url => url);

        await Promise.all(urlList.map(url => aria2.addUri([url], defaultOptions)));
      }

      if (torrentBase64) {
        // 添加种子文件到下载队列
        const torrentOptions = {
          ...defaultOptions,
          'select-file': selectedFiles.map(path => {
            // 找到对应文件的索引
            const file = torrentFiles.find(f => f.path === path);
            return file ? file.index : '';
          }).join(','),
        };
        await aria2.addTorrent(torrentBase64, [], torrentOptions);
      }

      setUrls('');
      setTorrentFiles([]);
      setSelectedFiles([]);
      setTorrentBase64('');
      setTorrentInfo(null);
      setShowAdvanced(false);
      setOptions({});
      onClose();
      addNotification({
        type: 'success',
        message: '下载任务已添加',
      });
    } catch (error) {
      console.error('Failed to add download:', error);
      addNotification({
        type: 'error',
        message: '添加下载任务失败',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6">
        <h2 className="text-xl font-semibold mb-4">新建下载</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                下载链接 (每行一个)
              </label>
              <textarea
                className="w-full h-32 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                value={urls}
                onChange={(e) => setUrls(e.target.value)}
                placeholder="http://example.com/file.zip"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                或者选择种子文件
              </label>
              <div className="flex items-center gap-2">
                <label className="flex-1">
                  <input
                    type="file"
                    accept=".torrent"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isSubmitting}
                  />
                  <div className="flex items-center justify-center gap-2 px-4 py-2 border border-dashed rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <UploadIcon className="w-5 h-5" />
                    <span>选择文件</span>
                  </div>
                </label>
              </div>
            </div>

            {torrentInfo && (
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">文件名: </span>
                  <span className="text-gray-600 dark:text-gray-400">{torrentInfo.name}</span>
                </div>
                {torrentInfo.comment && (
                  <div className="text-sm">
                    <span className="font-medium">注释: </span>
                    <span className="text-gray-600 dark:text-gray-400">{torrentInfo.comment}</span>
                  </div>
                )}
                {torrentInfo.creationDate && (
                  <div className="text-sm">
                    <span className="font-medium">创建时间: </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {new Date(parseInt(torrentInfo.creationDate) * 1000).toLocaleString()}
                    </span>
                  </div>
                )}
                {torrentInfo.totalLength && (
                  <div className="text-sm">
                    <span className="font-medium">总大小: </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {formatBytes(parseInt(torrentInfo.totalLength))}
                    </span>
                  </div>
                )}
              </div>
            )}

            {torrentFiles.length > 0 && (
              <div className="overflow-y-auto max-h-[200px]">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  选择要下载的文件
                </label>
                <FileSelector
                  files={torrentFiles}
                  onChange={setSelectedFiles}
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <Settings2Icon className="w-4 h-4" />
                {showAdvanced ? '隐藏高级选项' : '显示高级选项'}
              </button>
            </div>

            {showAdvanced && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    下载目录
                  </label>
                  <input
                    type="text"
                    value={options.dir || settings.dir}
                    onChange={(e) => setOptions({ ...options, dir: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    placeholder={settings.dir}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    最大下载速度 (0 表示不限制)
                  </label>
                  <input
                    type="text"
                    value={options['max-download-limit'] || settings.maxDownloadLimit}
                    onChange={(e) => setOptions({ ...options, 'max-download-limit': e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    placeholder="例如: 1M"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    最大上传速度 (0 表示不限制)
                  </label>
                  <input
                    type="text"
                    value={options['max-upload-limit'] || settings.maxUploadLimit}
                    onChange={(e) => setOptions({ ...options, 'max-upload-limit': e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    placeholder="例如: 1M"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    做种时间 (分钟, 0 表示一直做种)
                  </label>
                  <input
                    type="text"
                    value={options['seed-time'] || settings.seedTime}
                    onChange={(e) => setOptions({ ...options, 'seed-time': e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    placeholder="例如: 60"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    分享率 (例如: 1.0 表示上传量等于下载量)
                  </label>
                  <input
                    type="text"
                    value={options['seed-ratio'] || settings.seedRatio}
                    onChange={(e) => setOptions({ ...options, 'seed-ratio': e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    placeholder="例如: 1.0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    优先下载
                  </label>
                  <select
                    value={options['bt-prioritize-piece'] || 'head'}
                    onChange={(e) => setOptions({ ...options, 'bt-prioritize-piece': e.target.value as 'head' | 'tail' })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="head">文件头部</option>
                    <option value="tail">文件尾部</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
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
              {isSubmitting ? '添加中...' : '添加下载'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 