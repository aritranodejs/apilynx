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
  const { sidebarCollapsed, activeSidebarPanel, toggleSidebar, setActiveSidebarPanel, setSidebarCollapsed } =
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
  const [isMobile, setIsMobile] = useState(false);
  const [isPhone, setIsPhone] = useState(false);
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
    try {
      void useTabsStore.persist.rehydrate();
    } catch (e) {
      console.error('Tabs rehydrate failed:', e);
    }
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

  useEffect(() => {
    const mobileMedia = window.matchMedia('(max-width: 1023px)');
    const phoneMedia = window.matchMedia('(max-width: 767px)');

    const syncLayout = () => {
      const mobile = mobileMedia.matches;
      const phone = phoneMedia.matches;
      setIsMobile(mobile);
      setIsPhone(phone);
      if (mobile) setSidebarCollapsed(true);
    };

    syncLayout();
    mobileMedia.addEventListener('change', syncLayout);
    phoneMedia.addEventListener('change', syncLayout);
    return () => {
      mobileMedia.removeEventListener('change', syncLayout);
      phoneMedia.removeEventListener('change', syncLayout);
    };
  }, [setSidebarCollapsed]);

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
      <div className="flex h-dvh items-center justify-center bg-zinc-950 text-zinc-400">
        Loading Apilynx...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-dvh min-h-0 af-surface apilynx-app-shell">
      {!isElectron && (
        <div className="shrink-0 border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs text-amber-200 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>You&apos;re trying Apilynx in the browser. For the full experience,</span>
          <a href="/docs/download/" className="font-medium text-orange-300 underline hover:text-orange-200">
            download the desktop app
          </a>
          <span>.</span>
        </div>
      )}
      <header className="shrink-0 border-b af-border af-surface-2">
        <div className="flex items-center gap-2 px-3 py-2 sm:px-4">
          <a href="/" className="flex shrink-0 items-center gap-2 rounded hover:opacity-90" title="Home">
            <img src={assetPath('icon.png')} alt="" className="h-6 w-6 rounded" />
            <span className="hidden font-semibold text-sm sm:inline">Apilynx</span>
          </a>
          {!isElectron && (
            <a
              href="/docs/"
              className="hidden text-xs text-zinc-500 transition-colors hover:text-orange-400 md:inline"
            >
              Docs
            </a>
          )}
          <div className="hidden min-w-0 items-center gap-2 md:flex">
            <ProjectSelector onOpenSettings={() => setShowWorkspace(true)} />
            <EnvironmentSelector />
          </div>
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
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
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setShowProfile(true)}
                  className="hidden max-w-[140px] truncate text-xs text-zinc-300 transition-colors hover:text-orange-400 sm:inline"
                  title="My profile"
                >
                  {user.name}
                </button>
                <Button variant="ghost" size="sm" onClick={() => void handleLogout()} title="Sign out">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setShowAuth(true)} title="Sign in">
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Sign in</span>
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setShowSettings(true)} title="Settings">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 border-t af-border px-3 py-1.5 md:hidden sm:gap-2 sm:px-4">
          <ProjectSelector onOpenSettings={() => setShowWorkspace(true)} />
          <EnvironmentSelector />
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

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {!sidebarCollapsed && isMobile && (
          <button
            type="button"
            className="absolute inset-0 z-40 bg-black/60 lg:hidden"
            aria-label="Close sidebar"
            onClick={() => setSidebarCollapsed(true)}
          />
        )}
        {!sidebarCollapsed && (
          <div
            className={cn(
              'flex shrink-0 border-r border-zinc-800 bg-zinc-950',
              isMobile
                ? 'absolute inset-y-0 left-0 z-50 max-w-[min(20rem,88vw)] shadow-2xl'
                : activeSidebarPanel === 'documentation'
                  ? 'w-[22rem]'
                  : 'w-80'
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

        <div className="min-w-0 flex-1 overflow-hidden">
          {activeTab ? (
            isPhone ? (
              <div className="flex h-full flex-col">
                <div className="min-h-0 flex-1 overflow-hidden">
                  <RequestBuilder
                    tabId={activeTab.id}
                    request={activeTab.request}
                    onSave={() => setShowSave(true)}
                  />
                </div>
                <div className="min-h-0 flex-1 overflow-hidden border-t border-zinc-800">
                  <ResponseViewer
                    response={activeTab.response}
                    isLoading={activeTab.isLoading}
                    request={activeTab.request}
                    onSaveExample={handleSaveExample}
                  />
                </div>
              </div>
            ) : (
              <PanelGroup direction="vertical">
                <Panel defaultSize={55} minSize={25}>
                  <RequestBuilder
                    tabId={activeTab.id}
                    request={activeTab.request}
                    onSave={() => setShowSave(true)}
                  />
                </Panel>
                <PanelResizeHandle className="h-1 bg-zinc-800 transition-colors hover:bg-orange-500/50" />
                <Panel defaultSize={45} minSize={15}>
                  <ResponseViewer
                    response={activeTab.response}
                    isLoading={activeTab.isLoading}
                    request={activeTab.request}
                    onSaveExample={handleSaveExample}
                  />
                </Panel>
              </PanelGroup>
            )
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

      <footer className="hidden shrink-0 border-t af-border px-3 py-1.5 text-center text-[10px] af-text-muted sm:block sm:px-4 sm:text-xs">
        Developed By Aritra Dutta
      </footer>
    </div>
  );
}
