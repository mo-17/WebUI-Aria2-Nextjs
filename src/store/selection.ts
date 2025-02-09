import { create } from 'zustand';

interface SelectionState {
  selectedGids: Set<string>;
  selectGid: (gid: string) => void;
  unselectGid: (gid: string) => void;
  toggleGid: (gid: string) => void;
  selectAll: (gids: string[]) => void;
  clearSelection: () => void;
}

export const useSelectionStore = create<SelectionState>((set) => ({
  selectedGids: new Set(),
  selectGid: (gid) =>
    set((state) => ({
      selectedGids: new Set([...state.selectedGids, gid]),
    })),
  unselectGid: (gid) =>
    set((state) => {
      const newSelected = new Set(state.selectedGids);
      newSelected.delete(gid);
      return { selectedGids: newSelected };
    }),
  toggleGid: (gid) =>
    set((state) => {
      const newSelected = new Set(state.selectedGids);
      if (newSelected.has(gid)) {
        newSelected.delete(gid);
      } else {
        newSelected.add(gid);
      }
      return { selectedGids: newSelected };
    }),
  selectAll: (gids) =>
    set(() => ({
      selectedGids: new Set(gids),
    })),
  clearSelection: () =>
    set(() => ({
      selectedGids: new Set(),
    })),
})); 