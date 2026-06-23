import { create } from 'zustand';

type SidebarPanel = 'collections' | 'history' | 'environments' | 'teams' | 'documentation' | 'mock';

interface UIState {
  sidebarCollapsed: boolean;
  activeSidebarPanel: SidebarPanel;
  responsePanelSize: number;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActiveSidebarPanel: (panel: SidebarPanel) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  activeSidebarPanel: 'collections',
  responsePanelSize: 40,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setActiveSidebarPanel: (panel) => set({ activeSidebarPanel: panel }),
}));
