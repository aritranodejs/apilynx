import { create } from 'zustand';
import type { AppSettings, ThemeMode } from '@/types';

interface SettingsState extends AppSettings {
  isLoaded: boolean;
  setSettings: (settings: AppSettings) => void;
  setTheme: (theme: ThemeMode) => void;
  setTimeout: (timeout: number) => void;
  setAutoSave: (autoSave: boolean) => void;
  setMaxHistorySize: (size: number) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setDefaultEnvironmentId: (id: string | undefined) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  id: '',
  theme: 'dark',
  timeout: 30000,
  autoSave: true,
  maxHistorySize: 10000,
  sidebarCollapsed: false,
  isLoaded: false,
  setSettings: (settings) => set({ ...settings, isLoaded: true }),
  setTheme: (theme) => set({ theme }),
  setTimeout: (timeout) => set({ timeout }),
  setAutoSave: (autoSave) => set({ autoSave }),
  setMaxHistorySize: (maxHistorySize) => set({ maxHistorySize }),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  setDefaultEnvironmentId: (defaultEnvironmentId) => set({ defaultEnvironmentId }),
}));
