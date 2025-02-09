'use client';

import { useState } from 'react';
import { DownloadList } from '@/components/downloads/download-list';
import { NewDownloadDialog } from '@/components/downloads/new-download-dialog';
import { SpeedChart } from '@/components/downloads/speed-chart';
import { useDownloadsStore } from '@/store/downloads';
import { formatSpeed } from '@/lib/utils/format';
import { PlusIcon } from 'lucide-react';

export default function Home() {
  const { globalStats } = useDownloadsStore();
  const [isNewDownloadOpen, setIsNewDownloadOpen] = useState(false);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">WebUI-Aria2</h1>
          <button
            onClick={() => setIsNewDownloadOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            <PlusIcon className="w-4 h-4" />
            新建下载
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="text-sm text-gray-500 dark:text-gray-400">下载速度</div>
            <div className="text-xl font-semibold">
              {formatSpeed(globalStats.downloadSpeed)}
            </div>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="text-sm text-gray-500 dark:text-gray-400">上传速度</div>
            <div className="text-xl font-semibold">
              {formatSpeed(globalStats.uploadSpeed)}
            </div>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="text-sm text-gray-500 dark:text-gray-400">活动下载</div>
            <div className="text-xl font-semibold">{globalStats.numActive}</div>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="text-sm text-gray-500 dark:text-gray-400">等待下载</div>
            <div className="text-xl font-semibold">{globalStats.numWaiting}</div>
          </div>
        </div>
        
        <SpeedChart
          downloadSpeed={globalStats.downloadSpeed}
          uploadSpeed={globalStats.uploadSpeed}
        />
      </div>

      <DownloadList />

      <NewDownloadDialog
        isOpen={isNewDownloadOpen}
        onClose={() => setIsNewDownloadOpen(false)}
      />
    </main>
  );
}
