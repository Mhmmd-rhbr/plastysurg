import { create } from 'zustand';

export const useSimulationStore = create((set) => ({
  currentModelUrl: null,
  originalModelUrl: null,
  simulationParams: {
    noseRotation: 0,
    noseProjection: 0,
  },
  setCurrentModelUrl: (url) => set({ currentModelUrl: url }),
  setOriginalModelUrl: (url) => set({ originalModelUrl: url }),
  setSimulationParams: (params) => set((state) => ({ simulationParams: { ...state.simulationParams, ...params } })),
  resetSimulation: () => set((state) => ({ currentModelUrl: state.originalModelUrl, simulationParams: { noseRotation: 0, noseProjection: 0 } })),
}));
