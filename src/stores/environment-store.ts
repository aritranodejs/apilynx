import { create } from 'zustand';
import type { Environment } from '@/types';

interface EnvironmentState {
  environments: Environment[];
  activeEnvironmentId: string | null;
  setEnvironments: (envs: Environment[]) => void;
  setActiveEnvironment: (id: string | null) => void;
  getActiveEnvironment: () => Environment | undefined;
  getVariablesMap: () => Record<string, string>;
}

export const useEnvironmentStore = create<EnvironmentState>((set, get) => ({
  environments: [],
  activeEnvironmentId: null,

  setEnvironments: (environments) => {
    const defaultEnv = environments.find((e) => e.isDefault);
    set((state) => ({
      environments,
      activeEnvironmentId: state.activeEnvironmentId ?? defaultEnv?.id ?? environments[0]?.id ?? null,
    }));
  },

  setActiveEnvironment: (id) => set({ activeEnvironmentId: id }),

  getActiveEnvironment: () => {
    const { environments, activeEnvironmentId } = get();
    return environments.find((e) => e.id === activeEnvironmentId);
  },

  getVariablesMap: () => {
    const env = get().getActiveEnvironment();
    if (!env) return {};
    const map: Record<string, string> = {};
    env.variables
      .filter((v) => v.enabled && v.key.trim())
      .forEach((v) => {
        map[v.key.trim()] = v.value;
      });
    return map;
  },
}));
