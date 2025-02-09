import { Aria2Methods, RPCResponse, Download, GlobalStat, DownloadFile } from '@/types/aria2';

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

export class Aria2Client implements Aria2Methods {
  private websocket: WebSocket | null = null;
  private messageId = 0;
  private callbacks = new Map<number, (response: RPCResponse) => void>();

  constructor(private url: string) {}

  private async connect(): Promise<void> {
    let retryCount = 0;
    
    while (retryCount < MAX_RETRIES) {
      try {
        if (this.websocket?.readyState === WebSocket.OPEN) {
          return;
        }

        // 如果已经有连接但不是 OPEN 状态,先关闭它
        if (this.websocket) {
          this.websocket.close();
          this.websocket = null;
        }
        // 创建新的 WebSocket 连接
        const ws = new WebSocket(this.url);
        await new Promise<void>((resolve, reject) => {
        //   this.websocket = new WebSocket(this.url);

          // 设置超时
          const timeoutId = setTimeout(() => {
            reject(new Error('WebSocket connection timeout'));
          }, 5000);

          ws.onopen = () => {
            clearTimeout(timeoutId);
            resolve();
          };

          ws.onerror = (error) => {
            clearTimeout(timeoutId);
            reject(error);
          };

          ws.onclose = () => {
            this.websocket = null;
          };

          ws.onmessage = (event) => {
            const response: RPCResponse = JSON.parse(event.data);
            const callback = this.callbacks.get(Number(response.id));
            if (callback) {
              callback(response);
              this.callbacks.delete(Number(response.id));
            }
          };
        });

        // 确保连接已经打开
        if (ws?.readyState !== WebSocket.OPEN) {
          throw new Error('WebSocket connection failed');
        }
        this.websocket = ws;
        return;
      } catch (error) {
        retryCount++;
        if (retryCount === MAX_RETRIES) {
          throw new Error(`Failed to connect after ${MAX_RETRIES} attempts: ${error}`);
        }
        // 指数退避重试
        await new Promise(resolve => 
          setTimeout(resolve, INITIAL_RETRY_DELAY * Math.pow(2, retryCount))
        );
      }
    }
  }

  private async send<T>(method: string, params: unknown[] = []): Promise<T> {
    let retryCount = 0;

    while (retryCount < MAX_RETRIES) {
      try {
        await this.connect();

        // 再次检查连接状态
        if (this.websocket?.readyState !== WebSocket.OPEN) {
          throw new Error('WebSocket is not connected');
        }

        return await new Promise((resolve, reject) => {
          const id = ++this.messageId;
          const message = {
            jsonrpc: '2.0',
            id,
            method: `aria2.${method}`,
            params: ['token:' + (process.env.NEXT_PUBLIC_ARIA2_SECRET || ''), ...params],
          };

          const timeoutId = setTimeout(() => {
            this.callbacks.delete(id);
            reject(new Error('Request timeout'));
          }, 10000); // 10秒超时

          this.callbacks.set(id, (response: RPCResponse<T>) => {
            clearTimeout(timeoutId);
            if (response.error) {
              reject(new Error(response.error.message));
            } else {
              resolve(response.result as T);
            }
          });

          this.websocket?.send(JSON.stringify(message));
        });
      } catch (error) {
        retryCount++;
        if (retryCount === MAX_RETRIES) {
          throw error;
        }
        // 指数退避重试
        await new Promise(resolve => 
          setTimeout(resolve, INITIAL_RETRY_DELAY * Math.pow(2, retryCount))
        );
        // 重置 WebSocket 连接
        if (this.websocket) {
          this.websocket.close();
          this.websocket = null;
        }
      }
    }

    throw new Error('Maximum retries exceeded');
  }

  async addUri(uris: string[], options: object = {}): Promise<string> {
    return this.send<string>('addUri', [uris, options]);
  }

  async remove(gid: string): Promise<string> {
    return this.send<string>('remove', [gid]);
  }

  async removeDownload(gid: string): Promise<string> {
    return this.send<string>('removeDownloadResult', [gid]);
  }

  async pause(gid: string): Promise<string> {
    return this.send<string>('pause', [gid]);
  }

  async unpause(gid: string): Promise<string> {
    return this.send<string>('unpause', [gid]);
  }

  async tellActive(): Promise<Download[]> {
    return this.send<Download[]>('tellActive');
  }

  async tellWaiting(offset: number, num: number): Promise<Download[]> {
    return this.send<Download[]>('tellWaiting', [offset, num]);
  }

  async tellStopped(offset: number, num: number): Promise<Download[]> {
    return this.send<Download[]>('tellStopped', [offset, num]);
  }

  async getGlobalStat(): Promise<GlobalStat> {
    return this.send<GlobalStat>('getGlobalStat');
  }

  async changeGlobalOption(options: object): Promise<string> {
    return this.send<string>('changeGlobalOption', [options]);
  }

  async getVersion(): Promise<{ version: string }> {
    return this.send<{ version: string }>('getVersion');
  }

  async addTorrent(torrent: string, uris: string[] = [], options: object = {}): Promise<string> {
    return this.send<string>('addTorrent', [torrent, uris, options]);
  }

  async getFiles(gid: string): Promise<DownloadFile[]> {
    return this.send<DownloadFile[]>('getFiles', [gid]);
  }

  async getTorrentInfo(torrent: string): Promise<{ files: DownloadFile[]; gid: string }> {
    // 添加种子但不开始下载
    const gid = await this.send<string>('addTorrent', [torrent, [], { 'pause': true }]);
    try {
      // 获取文件列表
      const files = await this.getFiles(gid);
      // 删除暂停的任务
      await this.remove(gid);
      return { files, gid };
    } catch (error) {
      // 如果出错也要尝试删除任务
      try {
        await this.remove(gid);
      } catch {}
      throw error;
    }
  }

  async changeOption(gid: string, options: object): Promise<string> {
    return this.send<string>('changeOption', [gid, options]);
  }
} 