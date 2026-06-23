import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Project } from '@/types/auth';

interface WorkspaceState {
  projects: Project[];
  activeProjectId: string | null;
  setProjects: (projects: Project[]) => void;
  setActiveProject: (id: string | null) => void;
  getActiveProject: () => Project | undefined;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      projects: [],
      activeProjectId: null,
      setProjects: (projects) => {
        const current = get().activeProjectId;
        set({
          projects,
          activeProjectId: current ?? projects[0]?.id ?? null,
        });
      },
      setActiveProject: (id) => set({ activeProjectId: id }),
      getActiveProject: () => {
        const { projects, activeProjectId } = get();
        return projects.find((p) => p.id === activeProjectId);
      },
    }),
    { name: 'apilynx-workspace' }
  )
);
