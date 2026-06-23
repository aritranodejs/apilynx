'use client';

import { useMutation } from '@tanstack/react-query';
import { settingsService } from '@/services/ipc';
import { useSettingsStore } from '@/stores/settings-store';
import { showError, showSuccess } from '@/stores/toast-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import type { ThemeMode } from '@/types';
import { X } from 'lucide-react';
import { useEffect } from 'react';

interface SettingsPanelProps {
  onClose: () => void;
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const settings = useSettingsStore();
  const setSettings = useSettingsStore((s) => s.setSettings);

  useEffect(() => {
    void settingsService.get().then(setSettings).catch((e: Error) => showError(e.message));
  }, [setSettings]);

  const saveMutation = useMutation({
    mutationFn: () =>
      settingsService.update({
        theme: settings.theme,
        timeout: settings.timeout,
        autoSave: settings.autoSave,
        maxHistorySize: settings.maxHistorySize,
        defaultEnvironmentId: settings.defaultEnvironmentId,
        sidebarCollapsed: settings.sidebarCollapsed,
      }),
    onSuccess: (data) => {
      setSettings(data);
      showSuccess('Settings saved');
      onClose();
    },
    onError: (e: Error) => showError(e.message),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
          <h2 className="text-lg font-semibold text-zinc-100">Settings</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4 p-4">
          <div className="flex items-center justify-between">
            <label className="text-sm text-zinc-400">Theme</label>
            <Select
              value={settings.theme}
              onChange={(e) => settings.setTheme(e.target.value as ThemeMode)}
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="system">System</option>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm text-zinc-400">Timeout (ms)</label>
            <Input
              type="number"
              value={settings.timeout}
              onChange={(e) => settings.setTimeout(Number(e.target.value))}
              className="w-32"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm text-zinc-400">Auto Save</label>
            <Checkbox
              checked={settings.autoSave}
              onChange={(v) => settings.setAutoSave(v)}
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm text-zinc-400">Max History Size</label>
            <Input
              type="number"
              value={settings.maxHistorySize}
              onChange={(e) => settings.setMaxHistorySize(Number(e.target.value))}
              className="w-32"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-zinc-800 px-4 py-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={() => saveMutation.mutate()}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
