'use client';

import { useState } from 'react';
import { useNotificationsStore } from '@/store/notifications';
import { XIcon } from 'lucide-react';
import { formatBytes } from '@/lib/utils/format';
import type { Download } from '@/types/aria2';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDownloads: Download[];
}

interface ExportOptions {
  includeLinks: boolean;
  includeFileName: boolean;
  includeFileSize: boolean;
  includeProgress: boolean;
  includeDir: boolean;
  format: 'txt' | 'json' | 'csv';
}

interface ExportItem {
  name?: string;
  links?: string[];
  totalSize?: string;
  completedSize?: string;
  progress?: string;
  dir?: string;
  [key: string]: string | string[] | undefined;
}

export function ExportDialog({
  isOpen,
  onClose,
  selectedDownloads,
}: ExportDialogProps) {
  const [options, setOptions] = useState<ExportOptions>({
    includeLinks: true,
    includeFileName: true,
    includeFileSize: true,
    includeProgress: true,
    includeDir: true,
    format: 'txt',
  });
  const { addNotification } = useNotificationsStore();

  if (!isOpen) return null;

  const handleExport = () => {
    try {
      let content = '';
      const items = selectedDownloads.map(download => {
        const item: ExportItem = {};

        if (options.includeFileName) {
          item.name = download.name;
        }

        if (options.includeLinks && download.files) {
          item.links = download.files.flatMap(file => 
            file.uris.map(uri => uri.uri)
          );
        }

        if (options.includeFileSize) {
          item.totalSize = formatBytes(download.totalLength);
          item.completedSize = formatBytes(download.completedLength);
        }

        if (options.includeProgress) {
          const progress = Math.round(
            (parseInt(download.completedLength, 10) / parseInt(download.totalLength, 10)) * 100
          );
          item.progress = `${progress}%`;
        }

        if (options.includeDir) {
          item.dir = download.dir;
        }

        return item;
      });

      switch (options.format) {
        case 'json':
          content = JSON.stringify(items, null, 2);
          break;
        case 'csv':
          // 获取所有可能的字段
          const fields = Array.from(
            new Set(items.flatMap(item => Object.keys(item)))
          );
          // 创建 CSV 头
          content = fields.join(',') + '\n';
          // 添加数据行
          content += items.map(item => 
            fields.map(field => {
              const value = item[field];
              if (Array.isArray(value)) {
                return `"${value.join('; ')}"`;
              }
              return `"${value || ''}"`;
            }).join(',')
          ).join('\n');
          break;
        default: // txt
          content = items.map(item => {
            const lines = [];
            if (item.name) lines.push(`文件名: ${item.name}`);
            if (item.links) lines.push(`链接:\n${item.links.join('\n')}`);
            if (item.totalSize) lines.push(`总大小: ${item.totalSize}`);
            if (item.completedSize) lines.push(`已完成: ${item.completedSize}`);
            if (item.progress) lines.push(`进度: ${item.progress}`);
            if (item.dir) lines.push(`目录: ${item.dir}`);
            return lines.join('\n');
          }).join('\n\n');
      }

      // 创建并下载文件
      const blob = new Blob([content], {
        type: {
          txt: 'text/plain',
          json: 'application/json',
          csv: 'text/csv',
        }[options.format],
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `downloads.${options.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      addNotification({
        type: 'success',
        message: '已导出下载信息',
      });
      onClose();
    } catch (error) {
      console.error('Failed to export downloads:', error);
      addNotification({
        type: 'error',
        message: '导出下载信息失败',
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">导出下载信息</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              包含信息
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.includeLinks}
                  onChange={(e) =>
                    setOptions((prev) => ({
                      ...prev,
                      includeLinks: e.target.checked,
                    }))
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">下载链接</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.includeFileName}
                  onChange={(e) =>
                    setOptions((prev) => ({
                      ...prev,
                      includeFileName: e.target.checked,
                    }))
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">文件名</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.includeFileSize}
                  onChange={(e) =>
                    setOptions((prev) => ({
                      ...prev,
                      includeFileSize: e.target.checked,
                    }))
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">文件大小</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.includeProgress}
                  onChange={(e) =>
                    setOptions((prev) => ({
                      ...prev,
                      includeProgress: e.target.checked,
                    }))
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">下载进度</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.includeDir}
                  onChange={(e) =>
                    setOptions((prev) => ({
                      ...prev,
                      includeDir: e.target.checked,
                    }))
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">下载目录</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              导出格式
            </label>
            <div className="grid grid-cols-3 gap-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={options.format === 'txt'}
                  onChange={() =>
                    setOptions((prev) => ({
                      ...prev,
                      format: 'txt',
                    }))
                  }
                  className="rounded-full border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">文本文件</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={options.format === 'json'}
                  onChange={() =>
                    setOptions((prev) => ({
                      ...prev,
                      format: 'json',
                    }))
                  }
                  className="rounded-full border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">JSON</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  checked={options.format === 'csv'}
                  onChange={() =>
                    setOptions((prev) => ({
                      ...prev,
                      format: 'csv',
                    }))
                  }
                  className="rounded-full border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">CSV</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            导出
          </button>
        </div>
      </div>
    </div>
  );
} 