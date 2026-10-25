'use client';

import { useEffect, useRef, useState } from 'react';

import type { MenuAction } from '@/types/ui';
import { cn } from '@/utils/cn';
import { MoreIcon } from '@/components/ui/icons/ActionIcons';

/** Tombol ⋯ dengan daftar aksi — pengganti swipe action di aplikasi mobile. */
export function ActionMenu({ actions, className }: { actions: MenuAction[]; className?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  if (actions.length === 0) return null;

  return (
    // Elemen absolute juga jadi acuan posisi dropdown, jadi 'relative' hanya dipakai bila tidak ada className.
    <div ref={ref} className={className ?? 'relative'} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        aria-label="Aksi lain"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex size-8 cursor-pointer items-center justify-center rounded-md bg-white/90 text-gray-600 shadow-sm ring-1 ring-gray-200 backdrop-blur hover:text-ink"
      >
        <MoreIcon size={16} />
      </button>
      {open ? (
        <div className="absolute top-9 right-0 z-20 min-w-40 animate-[pop-in_0.15s_ease-out_both] overflow-hidden rounded-lg border border-line bg-white py-1 shadow-lg">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => {
                setOpen(false);
                action.onSelect();
              }}
              className={cn(
                'block w-full cursor-pointer px-3.5 py-2 text-left text-sm font-medium hover:bg-gray-50',
                action.destructive ? 'text-error-600' : 'text-ink',
              )}
            >
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
