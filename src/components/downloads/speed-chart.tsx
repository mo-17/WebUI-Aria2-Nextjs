'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatBytes } from '@/lib/utils/format';

interface SpeedData {
  time: string;
  download: number;
  upload: number;
}

interface SpeedChartProps {
  downloadSpeed: string;
  uploadSpeed: string;
}

export function SpeedChart({ downloadSpeed, uploadSpeed }: SpeedChartProps) {
  const [data, setData] = useState<SpeedData[]>([]);

  useEffect(() => {
    const now = new Date();
    const time = now.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    setData((prevData) => {
      const newData = [
        ...prevData,
        {
          time,
          download: parseInt(downloadSpeed, 10),
          upload: parseInt(uploadSpeed, 10),
        },
      ];

      // 保持最近 30 个数据点
      if (newData.length > 30) {
        return newData.slice(-30);
      }
      return newData;
    });
  }, [downloadSpeed, uploadSpeed]);

  const formatSpeed = (value: number) => {
    return formatBytes(value);
  };

  return (
    <div className="w-full h-[300px] bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={formatSpeed}
            width={80}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: number) => [formatBytes(value) + '/s']}
            labelStyle={{ fontSize: 12 }}
          />
          <Line
            type="monotone"
            dataKey="download"
            stroke="#3b82f6"
            name="下载速度"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="upload"
            stroke="#10b981"
            name="上传速度"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
} 