import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ApiRequest, ApiResponse, RequestTab } from '@/types';
import { createDefaultRequest, generateId } from '@/lib/utils';

interface TabsState {
  tabs: RequestTab[];
  activeTabId: string | null;
  addTab: (request?: ApiRequest) => string;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateTabRequest: (tabId: string, updates: Partial<ApiRequest>) => void;
  setTabResponse: (tabId: string, response: ApiResponse | undefined) => void;
  setTabLoading: (tabId: string, isLoading: boolean) => void;
  setTabDuration: (tabId: string, duration: number) => void;
  duplicateTab: (tabId: string) => string;
  getActiveTab: () => RequestTab | undefined;
}

export const useTabsStore = create<TabsState>()(
  persist(
    (set, get) => ({
      tabs: [],
      activeTabId: null,

      addTab: (request) => {
        const req = request ?? createDefaultRequest();
        const tab: RequestTab = {
          id: generateId(),
          request: req,
          isLoading: false,
        };
        set((state) => ({
          tabs: [...state.tabs, tab],
          activeTabId: tab.id,
        }));
        return tab.id;
      },

      closeTab: (tabId) => {
        set((state) => {
          const newTabs = state.tabs.filter((t) => t.id !== tabId);
          let newActive = state.activeTabId;
          if (state.activeTabId === tabId) {
            const idx = state.tabs.findIndex((t) => t.id === tabId);
            newActive = newTabs[Math.min(idx, newTabs.length - 1)]?.id ?? null;
          }
          if (newTabs.length === 0) {
            const req = createDefaultRequest();
            const tab: RequestTab = { id: generateId(), request: req, isLoading: false };
            return { tabs: [tab], activeTabId: tab.id };
          }
          return { tabs: newTabs, activeTabId: newActive };
        });
      },

      setActiveTab: (tabId) => set({ activeTabId: tabId }),

      updateTabRequest: (tabId, updates) => {
        set((state) => ({
          tabs: state.tabs.map((t) =>
            t.id === tabId
              ? { ...t, request: { ...t.request, ...updates, updatedAt: new Date().toISOString() } }
              : t
          ),
        }));
      },

      setTabResponse: (tabId, response) => {
        set((state) => ({
          tabs: state.tabs.map((t) => (t.id === tabId ? { ...t, response } : t)),
        }));
      },

      setTabLoading: (tabId, isLoading) => {
        set((state) => ({
          tabs: state.tabs.map((t) => (t.id === tabId ? { ...t, isLoading } : t)),
        }));
      },

      setTabDuration: (tabId, duration) => {
        set((state) => ({
          tabs: state.tabs.map((t) => (t.id === tabId ? { ...t, duration } : t)),
        }));
      },

      duplicateTab: (tabId) => {
        const tab = get().tabs.find((t) => t.id === tabId);
        if (!tab) return get().addTab();
        const duplicated = structuredClone(tab.request);
        duplicated.id = generateId();
        duplicated.name = `${duplicated.name} (Copy)`;
        return get().addTab(duplicated);
      },

      getActiveTab: () => {
        const { tabs, activeTabId } = get();
        return tabs.find((t) => t.id === activeTabId);
      },
    }),
    {
      name: 'reqforge-tabs',
      skipHydration: true,
      partialize: (state) => ({
        tabs: state.tabs.map(({ id, request }) => ({ id, request, isLoading: false })),
        activeTabId: state.activeTabId,
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<TabsState>;
        return {
          ...current,
          ...p,
          tabs: (p.tabs ?? []).map((t) => ({
            ...t,
            isLoading: false,
            response: undefined,
          })),
        };
      },
    }
  )
);
