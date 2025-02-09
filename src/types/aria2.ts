export interface GlobalStat {
  downloadSpeed: string;
  uploadSpeed: string;
  numActive: number;
  numWaiting: number;
  numStopped: number;
}

export interface Download {
  gid: string;
  status: 'active' | 'waiting' | 'paused' | 'error' | 'complete' | 'removed';
  totalLength: string;
  completedLength: string;
  uploadLength: string;
  downloadSpeed: string;
  uploadSpeed: string;
  connections: number;
  numSeeders: number;
  seeder: boolean;
  name: string;
  errorCode?: string;
  errorMessage?: string;
  files: DownloadFile[];
  bittorrent?: {
    info: {
      name: string;
    };
  };
  dir: string;
}

export interface DownloadFile {
  index: string;
  path: string;
  length: string;
  completedLength: string;
  selected: boolean;
  uris: Array<{
    status: string;
    uri: string;
  }>;
}

export interface Aria2Methods {
  addUri: (uris: string[], options?: object) => Promise<string>;
  remove: (gid: string) => Promise<string>;
  pause: (gid: string) => Promise<string>;
  unpause: (gid: string) => Promise<string>;
  tellActive: () => Promise<Download[]>;
  tellWaiting: (offset: number, num: number) => Promise<Download[]>;
  tellStopped: (offset: number, num: number) => Promise<Download[]>;
  getGlobalStat: () => Promise<GlobalStat>;
  changeGlobalOption: (options: object) => Promise<string>;
  getVersion: () => Promise<{ version: string }>;
  addTorrent: (torrent: string, uris: string[], options?: object) => Promise<string>;
  getTorrentInfo: (gid: string) => Promise<{ files: DownloadFile[] }>;
  changeOption: (gid: string, options: object) => Promise<string>;
}

export type RPCResponse<T = any> = {
  id: string | number;
  jsonrpc: '2.0';
  result?: T;
  error?: {
    code: number;
    message: string;
  };
} 