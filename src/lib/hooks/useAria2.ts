import { useEffect, useRef } from 'react';
import { Aria2Client } from '@/lib/aria2/client';
import { useDownloadsStore } from '@/store/downloads';

const POLLING_INTERVAL = 1000; // 1 second

export function useAria2(url: string) {
  const client = useRef<Aria2Client>(new Aria2Client(url));
  const { setDownloads, updateGlobalStats } = useDownloadsStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 并行获取所有数据
        const [active, waiting, stopped, stats] = await Promise.all([
          client.current.tellActive(),
          client.current.tellWaiting(0, 1000),
          client.current.tellStopped(0, 1000),
          client.current.getGlobalStat()
        ]);
        // console.log('active', active);
        // 直接更新状态
        setDownloads('active', active);
        setDownloads('waiting', waiting);
        setDownloads('stopped', stopped);
        updateGlobalStats(stats);
      } catch (error) {
        console.error('Failed to fetch downloads:', error);
      }
    };

    // 立即执行一次
    fetchData();

    // 设置轮询
    const intervalId = setInterval(fetchData, POLLING_INTERVAL);

    // 清理函数
    return () => {
      clearInterval(intervalId);
    };
  }, [setDownloads, updateGlobalStats]);

  return client.current;
} 