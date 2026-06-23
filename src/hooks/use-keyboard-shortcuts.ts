'use client';

import { useEffect } from 'react';

interface ShortcutHandlers {
  onSave?: () => void;
  onSend?: () => void;
  onNewTab?: () => void;
  onCloseTab?: () => void;
  onShowShortcuts?: () => void;
}

function isInputFocused(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select' || (el as HTMLElement).isContentEditable;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers): void {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;

      if (mod && e.key === 's') {
        e.preventDefault();
        handlers.onSave?.();
        return;
      }

      if (mod && e.key === 'Enter') {
        e.preventDefault();
        handlers.onSend?.();
        return;
      }

      if (mod && e.key === 'n') {
        e.preventDefault();
        handlers.onNewTab?.();
        return;
      }

      if (mod && e.key === 'w') {
        e.preventDefault();
        handlers.onCloseTab?.();
        return;
      }

      if (mod && e.key === '/') {
        e.preventDefault();
        handlers.onShowShortcuts?.();
        return;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handlers]);
}

export const SHORTCUTS = [
  { keys: 'Ctrl+S', action: 'Save request to collection' },
  { keys: 'Ctrl+Enter', action: 'Send request' },
  { keys: 'Ctrl+N', action: 'New request tab' },
  { keys: 'Ctrl+W', action: 'Close current tab' },
  { keys: 'Ctrl+/', action: 'Show keyboard shortcuts' },
  { keys: 'Esc', action: 'Close modal' },
] as const;
