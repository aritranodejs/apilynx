'use client';

import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
  /** sm = max-w-md (default), lg = max-w-5xl, full = near viewport */
  size?: 'sm' | 'lg' | 'full';
}

const sizeClasses = {
  sm: 'max-w-md',
  lg: 'max-w-5xl max-h-[90vh] flex flex-col',
  full: 'max-w-[96vw] w-full max-h-[96vh] h-[96vh] flex flex-col',
};

export function Modal({ open, onClose, title, children, className, size = 'sm' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        className={cn(
          'relative z-10 w-full rounded-lg border af-border af-surface-2 shadow-xl',
          sizeClasses[size],
          className
        )}
      >
        <div className="flex items-center justify-between border-b af-border px-4 py-3 shrink-0">
          <h2 className="text-sm font-semibold af-text-primary">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className={cn('p-4', (size === 'lg' || size === 'full') && 'flex-1 min-h-0 overflow-hidden p-0')}>
          {children}
        </div>
      </div>
    </div>
  );
}
