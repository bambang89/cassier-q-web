'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/lib/cn';
import { CloseIcon } from '@/components/icons/LineIcons';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  closeOnBackdropPress?: boolean;
  /** Lebar kartu di layar lebar (default 460px seperti tablet). */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZES = { sm: 'tab:max-w-[400px]', md: 'tab:max-w-[460px]', lg: 'tab:max-w-[620px]', xl: 'tab:max-w-[860px]' };

/**
 * HP: bottom sheet dari bawah. Layar lebar: kartu di tengah (fade + scale) —
 * perilaku yang sama dengan Modal di aplikasi mobile.
 */
export function Modal({ isOpen, onClose, children, title, closeOnBackdropPress = true, size = 'md', className }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnBackdropPress) onClose();
    };
    window.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [isOpen, onClose, closeOnBackdropPress]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center tab:items-center tab:p-5">
      <div
        className="absolute inset-0 animate-[fade-in_0.2s_ease-out_both] bg-navy-900/45"
        onClick={closeOnBackdropPress ? onClose : undefined}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'relative flex max-h-[92dvh] w-full animate-sheet-up flex-col rounded-t-3xl bg-white px-5 pt-2 pb-5 shadow-float',
          'tab:max-h-[88dvh] tab:animate-pop-in tab:rounded-2xl tab:p-6 tab:shadow-lg',
          SIZES[size],
          className,
        )}
      >
        <div className="mx-auto mb-3 h-[5px] w-10 shrink-0 rounded-full bg-gray-300 tab:hidden" />
        {title ? (
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-ink">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup"
              className="flex size-8 cursor-pointer items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
            >
              <CloseIcon size={18} />
            </button>
          </div>
        ) : null}
        <div className="scroll-thin -mx-1 min-h-0 flex-1 overflow-y-auto px-1">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
