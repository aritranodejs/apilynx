'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useTabsStore } from '@/stores/tabs-store';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { RequestBuilder } from '@/features/requests/request-builder';
import { ResponseViewer } from '@/features/requests/response-viewer';
import { CollectionsPanel } from '@/features/collections/collections-panel';
import { SaveRequestModal } from '@/features/collections/save-request-modal';
import { HistoryPanel } from '@/features/history/history-panel';
import { EnvironmentsPanel, EnvironmentSelector } from '@/features/environments/environments-panel';
import { TeamsPanel } from '@/features/teams/teams-panel';
import { AuthModal } from '@/features/auth/auth-modal';
import { ProfileModal } from '@/features/auth/profile-modal';
import { ProjectSelector } from '@/features/projects/project-selector';
import { WorkspaceModal } from '@/features/projects/workspace-modal';
import { SettingsPanel } from '@/features/settings/settings-panel';
import { Modal } from '@/components/ui/modal';
import { environmentService, settingsService, isElectronApp, requestService } from '@/services/ipc';
import { InvitationsModal } from '@/features/invitations/invitations-modal';
import { DocsPanel } from '@/features/documentation/docs-panel';
import { MockServerPanel } from '@/features/mock/mock-server-panel';
import { inviteService, authService } from '@/services/auth';
import { assetPath } from '@/lib/asset-path';
import { useQuery } from '@tanstack/react-query';
import { useEnvironmentStore } from '@/stores/environment-store';
import { useSettingsStore } from '@/stores/settings-store';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { Button } from '@/components/ui/button';
import {
  FolderOpen,
  History,
  Globe,
  Plus,
  X,
  Settings,
  PanelLeftClose,
  PanelLeft,
  Users,
  LogIn,
  LogOut,
  Save,
  Bell,
  BookOpen,
  Server,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { showError, showSuccess } from '@/stores/toast-store';
import { useAuthInit } from '@/hooks/use-auth-init';
import { useSendRequest } from '@/hooks/use-send-request';
import { SHORTCUTS, useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';

export function AppShell() {
  const { tabs, activeTabId, addTab, closeTab, setActiveTab } = useTabsStore();
  const { sidebarCollapsed, activeSidebarPanel, toggleSidebar, setActiveSidebarPanel } =
    useUIStore();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const token = useAuthStore((s) => s.token);
  const setEnvironments = useEnvironmentStore((s) => s.setEnvironments);
  const setSettings = useSettingsStore((s) => s.setSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const [showInvitations, setShowInvitations] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isElectron, setIsElectron] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const { send } = useSendRequest();

  const { data: projectInvites = [] } = useQuery({
    queryKey: ['project-invites', user?.email],
    queryFn: () => inviteService.getPendingProjects(user!.email),
    enabled: !!user,
    refetchInterval: 30000,
  });
  const { data: teamInvites = [] } = useQuery({
    queryKey: ['team-invites', user?.email],
    queryFn: () => inviteService.getPendingTeams(user!.email),
    enabled: !!user,
    refetchInterval: 30000,
  });
  const inviteCount = projectInvites.length + teamInvites.length;

  useAuthInit();

  useEffect(() => {
    void useTabsStore.persist.rehydrate();
    setIsElectron(isElectronApp());
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    void environmentService.getAll().then(setEnvironments).catch((e: Error) => showError(e.message));
    void settingsService.get().then(setSettings).catch((e: Error) => showError(e.message));
  }, [isReady, setEnvironments, setSettings]);

  useEffect(() => {
    if (isReady && tabs.length === 0) addTab();
  }, [isReady, tabs.length, addTab]);

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const updateTabRequest = useTabsStore((s) => s.updateTabRequest);

  const handleSaveExample = useCallback(
    async (body: string) => {
      if (!activeTab) return;
      const updated = { ...activeTab.request, exampleResponse: body };
      updateTabRequest(activeTab.id, { exampleResponse: body });
      if (updated.collectionId) {
        try {
          await requestService.save(updated);
          showSuccess('Example response saved to collection');
        } catch (e) {
          showError(e instanceof Error ? e.message : 'Failed to save example');
        }
      } else {
        showSuccess('Example saved on tab — save to a collection to persist');
      }
    },
    [activeTab, updateTabRequest]
  );

  const shortcuts = useMemo(
    () => ({
      onSave: () => setShowSave(true),
      onSend: () => {
        if (activeTabId) void send(activeTabId);
      },
      onNewTab: () => addTab(),
      onCloseTab: () => {
        if (activeTabId) closeTab(activeTabId);
      },
      onShowShortcuts: () => setShowShortcuts(true),
    }),
    [activeTabId, send, addTab, closeTab]
  );

  useKeyboardShortcuts(shortcuts);

  const handleLogout = useCallback(async () => {
    if (token) {
      try {
        await authService.logout(token);
      } catch {
        /* ignore */
      }
    }
    clearAuth();
    useWorkspaceStore.getState().setProjects([]);
    useWorkspaceStore.getState().setActiveProject(null);
  }, [token, clearAuth]);

  const sidebarItems = [
    { id: 'collections' as const, icon: FolderOpen, label: 'Collections' },
    { id: 'history' as const, icon: History, label: 'History' },
    { id: 'environments' as const, icon: Globe, label: 'Environments' },
    { id: 'documentation' as const, icon: BookOpen, label: 'Documentation' },
    { id: 'mock' as const, icon: Server, label: 'Mock Server' },
    { id: 'teams' as const, icon: Users, label: 'Teams' },
  ];

  if (!isReady) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-zinc-400">
        Loading Apilynx...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen af-surface">
      {!isElectron && (
        <div className="shrink-0 border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs text-amber-200">
          Browser mode — CORS applies. Run{' '}
          <code className="rounded bg-zinc-800 px-1">npm run electron:dev</code> for full desktop
          features with Apilynx.
        </div>
      )}
      <header className="flex items-center gap-3 border-b af-border px-4 py-2 shrink-0 af-surface-2">
        <img src={assetPath('icon.png')} alt="" className="h-6 w-6 rounded" />
        <span className="font-semibold text-sm">Apilynx</span>
        <ProjectSelector onOpenSettings={() => setShowWorkspace(true)} />
        <EnvironmentSelector />
        <div className="ml-auto flex items-center gap-2">
          {activeTab && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSave(true)}
              title="Save to collection (Ctrl+S)"
            >
              <Save className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowShortcuts(true)}
            title="Keyboard shortcuts (Ctrl+/)"
            className="text-xs text-zinc-500"
          >
            ?
          </Button>
          {user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowInvitations(true)}
              title="Invitations"
              className="relative"
            >
              <Bell className="h-4 w-4" />
              {inviteCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[9px] font-bold text-white">
                  {inviteCount}
                </span>
              )}
            </Button>
          )}
          {user ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowProfile(true)}
                className="text-xs text-zinc-300 hover:text-orange-400 max-w-[140px] truncate transition-colors"
                title="My profile"
              >
                {user.name}
              </button>
              <Button variant="ghost" size="sm" onClick={() => void handleLogout()} title="Sign out">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setShowAuth(true)}>
              <LogIn className="h-4 w-4" /> Sign in
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setShowSettings(true)}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="flex items-center border-b af-border af-surface-2 shrink-0 overflow-x-auto">
        <Button variant="ghost" size="sm" onClick={toggleSidebar} className="shrink-0 mx-1">
          {sidebarCollapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 text-xs border-r border-zinc-800 shrink-0 max-w-[200px]',
              activeTabId === tab.id
                ? 'bg-zinc-900 text-zinc-100'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
            )}
          >
            <span className="truncate">{tab.request.name}</span>
            {tabs.length > 1 && (
              <X
                className="h-3 w-3 shrink-0 hover:text-red-400"
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
              />
            )}
          </button>
        ))}
        <Button variant="ghost" size="sm" onClick={() => addTab()} className="shrink-0" title="New tab (Ctrl+N)">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {!sidebarCollapsed && (
          <div
            className={cn(
              'flex shrink-0 border-r border-zinc-800',
              activeSidebarPanel === 'documentation' ? 'w-[22rem]' : 'w-80'
            )}
          >
            <div className="flex flex-col w-12 border-r border-zinc-800 bg-zinc-900/30">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSidebarPanel(item.id)}
                  title={item.label}
                  className={cn(
                    'flex items-center justify-center p-3 transition-colors',
                    activeSidebarPanel === item.id
                      ? 'text-orange-400 bg-zinc-800'
                      : 'text-zinc-500 hover:text-zinc-300'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-hidden">
              {activeSidebarPanel === 'collections' && <CollectionsPanel />}
              {activeSidebarPanel === 'history' && <HistoryPanel />}
              {activeSidebarPanel === 'environments' && <EnvironmentsPanel />}
              {activeSidebarPanel === 'documentation' && <DocsPanel />}
              {activeSidebarPanel === 'mock' && <MockServerPanel />}
              {activeSidebarPanel === 'teams' && <TeamsPanel />}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-hidden">
          {activeTab ? (
            <PanelGroup direction="vertical">
              <Panel defaultSize={55} minSize={25}>
                <RequestBuilder
                  tabId={activeTab.id}
                  request={activeTab.request}
                  onSave={() => setShowSave(true)}
                />
              </Panel>
              <PanelResizeHandle className="h-1 bg-zinc-800 hover:bg-orange-500/50 transition-colors" />
              <Panel defaultSize={45} minSize={15}>
                <ResponseViewer
                  response={activeTab.response}
                  isLoading={activeTab.isLoading}
                  request={activeTab.request}
                  onSaveExample={handleSaveExample}
                />
              </Panel>
            </PanelGroup>
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-500">
              Create a new request to get started
            </div>
          )}
        </div>
      </div>

      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
      <ProfileModal open={showProfile} onClose={() => setShowProfile(false)} />
      <WorkspaceModal open={showWorkspace} onClose={() => setShowWorkspace(false)} />
      <InvitationsModal open={showInvitations} onClose={() => setShowInvitations(false)} />
      <SaveRequestModal
        open={showSave}
        onClose={() => setShowSave(false)}
        tabId={activeTabId}
        request={activeTab?.request ?? null}
      />
      <Modal open={showShortcuts} onClose={() => setShowShortcuts(false)} title="Keyboard shortcuts">
        <div className="space-y-2">
          {SHORTCUTS.map((s) => (
            <div key={s.keys} className="flex justify-between text-sm">
              <kbd className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-xs text-orange-300">
                {s.keys}
              </kbd>
              <span className="text-zinc-400">{s.action}</span>
            </div>
          ))}
        </div>
      </Modal>

      <footer className="shrink-0 border-t af-border px-4 py-1.5 text-center text-xs af-text-muted">
        Developed By Aritra Dutta
      </footer>
    </div>
  );
}
