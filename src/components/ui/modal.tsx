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
  sm: 'max-w-md max-h-[90vh]',
  lg: 'max-w-5xl max-h-[90vh]',
  full: 'max-w-[98vw] w-full h-[96vh] max-h-[96vh]',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div
        className={cn(
          'relative z-10 w-full rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl flex flex-col overflow-hidden',
          sizeClasses[size],
          className
        )}
      >
        <div className="flex items-center justify-between border-b border-zinc-700 px-4 py-3 shrink-0 bg-zinc-900">
          <h2 className="text-sm font-semibold text-zinc-100 truncate pr-4">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div
          className={cn(
            'min-h-0',
            size === 'sm' ? 'p-4 overflow-auto' : 'flex flex-1 flex-col overflow-hidden p-0'
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
