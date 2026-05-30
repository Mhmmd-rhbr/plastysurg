import { create } from 'zustand';

export const useUiStore = create((set) => ({
  sidebarOpen: false,
  theme: 'dark', // medical dark theme default
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setTheme: (theme) => set({ theme }),
}));
