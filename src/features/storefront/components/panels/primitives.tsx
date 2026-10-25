'use client';

import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';
import { Switch } from '@/components/ui/Field';

export function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="border-b border-line pb-5 last:border-0">
      <h3 className="text-[13px] font-bold tracking-wide text-ink">{title}</h3>
      {hint ? <p className="mt-0.5 text-[12px] text-ink-3">{hint}</p> : null}
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

export function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <span className="mb-1 block text-[13px] font-semibold text-ink-2">{label}</span>
      {children}
    </div>
  );
}

export function Toggle({ label, value, onChange, hint }: { label: string; value: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2.5">
      <span>
        <span className="block text-sm font-semibold text-ink">{label}</span>
        {hint ? <span className="block text-[12px] text-ink-3">{hint}</span> : null}
      </span>
      <Switch value={value} onChange={onChange} label={label} />
    </div>
  );
}

export function IconAction({ label, onClick, danger, children }: { label: string; onClick: () => void; danger?: boolean; children: ReactNode }) {
  return (
    <button type="button" title={label} aria-label={label} onClick={onClick} className={cn('flex size-7 cursor-pointer items-center justify-center rounded hover:bg-gray-100', danger ? 'text-error-600 hover:bg-error-50' : 'text-ink-3')}>
      {children}
    </button>
  );
}
