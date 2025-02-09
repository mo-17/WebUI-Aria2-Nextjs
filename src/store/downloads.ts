import { create } from 'zustand';
import { Download, GlobalStat } from '@/types/aria2';

interface DownloadsState {
  active: Download[];
  waiting: Download[];
  stopped: Download[];
  globalStats: GlobalStat;
  history: Array<{
    type: 'active' | 'waiting' | 'stopped';
    downloads: Download[];
  }>[];
  currentHistoryIndex: number;
  setDownloads: (type: 'active' | 'waiting' | 'stopped', downloads: Download[]) => void;
  updateGlobalStats: (stats: GlobalStat) => void;
  reorderDownloads: (type: 'active' | 'waiting' | 'stopped', startIndex: number, endIndex: number) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

export const useDownloadsStore = create<DownloadsState>((set, get) => ({
  active: [],
  waiting: [],
  stopped: [],
  globalStats: {
    downloadSpeed: '0',
    uploadSpeed: '0',
    numActive: 0,
    numWaiting: 0,
    numStopped: 0,
  },
  history: [],
  currentHistoryIndex: -1,

  setDownloads: (type, downloads) => {
    set((state) => {
      // 检查数组是否相同
      const currentDownloads = state[type];
      if (
        downloads.length === currentDownloads.length &&
        downloads.every((d, i) => d.gid === currentDownloads[i].gid)
      ) {
        return state;
      }
      return {
        ...state,
        [type]: downloads,
      };
    });
  },

  updateGlobalStats: (stats) => {
    set((state) => {
      // 检查状态是否有变化
      if (
        stats.downloadSpeed === state.globalStats.downloadSpeed &&
        stats.uploadSpeed === state.globalStats.uploadSpeed &&
        stats.numActive === state.globalStats.numActive &&
        stats.numWaiting === state.globalStats.numWaiting &&
        stats.numStopped === state.globalStats.numStopped
      ) {
        return state;
      }
      return {
        ...state,
        globalStats: stats,
      };
    });
  },

  reorderDownloads: (type, startIndex, endIndex) =>
    set((state) => {
      const list = [...state[type]];
      const [removed] = list.splice(startIndex, 1);
      list.splice(endIndex, 0, removed);

      // 创建新的历史记录
      const newHistory = state.history.slice(0, state.currentHistoryIndex + 1);
      newHistory.push([
        { type: 'active', downloads: type === 'active' ? list : state.active },
        { type: 'waiting', downloads: type === 'waiting' ? list : state.waiting },
        { type: 'stopped', downloads: type === 'stopped' ? list : state.stopped },
      ]);

      return {
        ...state,
        [type]: list,
        history: newHistory,
        currentHistoryIndex: newHistory.length - 1,
      };
    }),

  undo: () =>
    set((state) => {
      if (!get().canUndo()) return state;

      const newIndex = state.currentHistoryIndex - 1;
      const previousState = state.history[newIndex];

      return {
        ...state,
        active: previousState.find(s => s.type === 'active')?.downloads || state.active,
        waiting: previousState.find(s => s.type === 'waiting')?.downloads || state.waiting,
        stopped: previousState.find(s => s.type === 'stopped')?.downloads || state.stopped,
        currentHistoryIndex: newIndex,
      };
    }),

  redo: () =>
    set((state) => {
      if (!get().canRedo()) return state;

      const newIndex = state.currentHistoryIndex + 1;
      const nextState = state.history[newIndex];

      return {
        ...state,
        active: nextState.find(s => s.type === 'active')?.downloads || state.active,
        waiting: nextState.find(s => s.type === 'waiting')?.downloads || state.waiting,
        stopped: nextState.find(s => s.type === 'stopped')?.downloads || state.stopped,
        currentHistoryIndex: newIndex,
      };
    }),

  canUndo: () => {
    const state = get();
    return state.currentHistoryIndex > 0;
  },

  canRedo: () => {
    const state = get();
    return state.currentHistoryIndex < state.history.length - 1;
  },
})); 