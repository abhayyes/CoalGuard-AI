import { create } from 'zustand';
import { Mine } from '../types';

interface MineState {
  selectedMine: Mine | null;
  setSelectedMine: (mine: Mine | null) => void;
  fetchMines: () => Promise<void>;
}

export const useMineStore = create<MineState>((set) => ({
  selectedMine: null,
  setSelectedMine: (mine) => set({ selectedMine: mine }),
  fetchMines: async () => {},
}));
