'use client';

import { useEffect } from 'react';
import { authService, projectService } from '@/services/auth';
import { useAuthStore } from '@/stores/auth-store';
import { useWorkspaceStore } from '@/stores/workspace-store';

export function useAuthInit(): void {
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const setLoading = useAuthStore((s) => s.setLoading);
  const setProjects = useWorkspaceStore((s) => s.setProjects);

  useEffect(() => {
    void (async () => {
      const token = useAuthStore.getState().token;
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const user = await authService.getSession(token);
        if (!user) {
          clearAuth();
          return;
        }
        setAuth(user, token);
        const projects = await projectService.getAll(user.id);
        setProjects(projects);
      } catch {
        clearAuth();
      } finally {
        setLoading(false);
      }
    })();
  }, [setAuth, clearAuth, setLoading, setProjects]);
}
