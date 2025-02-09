import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Settings {
  maxConcurrentDownloads: number;
  maxOverallDownloadLimit: number;
  maxOverallUploadLimit: number;
  dir: string;
  userAgent: string;
  downloadDir: string;
  maxDownloadLimit: string;
  maxUploadLimit: string;
  seedTime: string;
  seedRatio: string;
  splitSize: string;
  minSplitSize: string;
  maxConnectionPerServer: string;
}

interface SettingsState extends Settings {
  updateSettings: (settings: Partial<Settings>) => void;
}

// 根据操作系统获取默认下载目录
const getDefaultDownloadDir = () => {
  if (typeof window === 'undefined') return '';
  
  const ua = window.navigator.userAgent.toLowerCase();
  
  // 在 macOS 上默认使用 Downloads 目录
  if (ua.includes('mac')) {
    return '/Users/' + (process.env.USER || process.env.USERNAME) + '/Downloads';
  }
  
  // 在 Windows 上默认使用 Downloads 目录
  if (ua.includes('win')) {
    return 'C:\\Users\\' + (process.env.USER || process.env.USERNAME) + '\\Downloads';
  }
  
  // 在 Linux 上默认使用 Downloads 目录
  return '/home/' + (process.env.USER || process.env.USERNAME) + '/Downloads';
};

const defaultSettings: Settings = {
  maxConcurrentDownloads: 5,
  maxOverallDownloadLimit: 0,
  maxOverallUploadLimit: 0,
  dir: getDefaultDownloadDir(),
  userAgent: 'aria2/1.36.0',
  downloadDir: getDefaultDownloadDir(),
  maxDownloadLimit: '0',
  maxUploadLimit: '0',
  seedTime: '0',
  seedRatio: '1.0',
  splitSize: '20M',
  minSplitSize: '1M',
  maxConnectionPerServer: '16',
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      updateSettings: (newSettings) =>
        set((state) => ({
          ...state,
          ...newSettings,
        })),
    }),
    {
      name: 'aria2-settings',
    }
  )
); 