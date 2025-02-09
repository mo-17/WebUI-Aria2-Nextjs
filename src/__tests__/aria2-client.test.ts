import { Aria2Client } from '@/lib/aria2/client';

// Mock WebSocket
class MockWebSocket {
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: ((error: Error) => void) | null = null;
  readyState = WebSocket.CONNECTING;

  constructor(public url: string) {
    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      this.onopen?.();
    }, 0);
  }

  send(data: string) {
    const message = JSON.parse(data);
    setTimeout(() => {
      this.onmessage?.({
        data: JSON.stringify({
          id: message.id,
          jsonrpc: '2.0',
          result: 'mock-result',
        }),
      });
    }, 0);
  }
}

// Mock global WebSocket
global.WebSocket = MockWebSocket as any;

describe('Aria2Client', () => {
  let client: Aria2Client;

  beforeEach(() => {
    client = new Aria2Client('ws://localhost:6800/jsonrpc');
  });

  it('should connect to WebSocket server', async () => {
    const result = await client.getVersion();
    expect(result).toBe('mock-result');
  });

  it('should add URI download', async () => {
    const result = await client.addUri(['http://example.com/file.zip']);
    expect(result).toBe('mock-result');
  });

  it('should add torrent download', async () => {
    const result = await client.addTorrent('base64-encoded-torrent');
    expect(result).toBe('mock-result');
  });

  it('should get active downloads', async () => {
    const result = await client.tellActive();
    expect(result).toBe('mock-result');
  });

  it('should get waiting downloads', async () => {
    const result = await client.tellWaiting(0, 10);
    expect(result).toBe('mock-result');
  });

  it('should get stopped downloads', async () => {
    const result = await client.tellStopped(0, 10);
    expect(result).toBe('mock-result');
  });

  it('should pause download', async () => {
    const result = await client.pause('mock-gid');
    expect(result).toBe('mock-result');
  });

  it('should resume download', async () => {
    const result = await client.unpause('mock-gid');
    expect(result).toBe('mock-result');
  });

  it('should remove download', async () => {
    const result = await client.remove('mock-gid');
    expect(result).toBe('mock-result');
  });

  it('should get global stat', async () => {
    const result = await client.getGlobalStat();
    expect(result).toBe('mock-result');
  });

  it('should change global option', async () => {
    const result = await client.changeGlobalOption({ 'max-concurrent-downloads': '5' });
    expect(result).toBe('mock-result');
  });
}); 