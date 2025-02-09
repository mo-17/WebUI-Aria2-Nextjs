const UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

export function formatBytes(bytes: number | string, decimals = 2): string {
  const size = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
  if (size === 0) return '0 B';

  const i = Math.floor(Math.log(size) / Math.log(1024));
  return (
    parseFloat((size / Math.pow(1024, i)).toFixed(decimals)) +
    ' ' +
    UNITS[i]
  );
}

export function formatSpeed(bytesPerSecond: number | string): string {
  return formatBytes(bytesPerSecond) + '/s';
}

export function formatProgress(completed: string, total: string): number {
  const completedSize = parseInt(completed, 10);
  const totalSize = parseInt(total, 10);
  if (totalSize === 0) return 0;
  return Math.round((completedSize / totalSize) * 100);
}

export function formatStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function formatTime(seconds: number): string {
  if (seconds === Infinity || seconds === 0) return '--:--:--';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return [hours, minutes, secs]
    .map(v => v.toString().padStart(2, '0'))
    .join(':');
}

export function formatEta(
  completedLength: string,
  totalLength: string,
  downloadSpeed: string
): string {
  const remaining =
    parseInt(totalLength, 10) - parseInt(completedLength, 10);
  const speed = parseInt(downloadSpeed, 10);
  if (speed === 0) return '--:--:--';

  return formatTime(remaining / speed);
} 