'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';

import { cn } from '@/utils/cn';
import { Switch, Input } from '@/components/ui/Field';
import { EMOJIS } from '@/features/storefront/constants';

export function Labeled({ label, help, children }: { label: string; help?: string; children: ReactNode }) {
  return (
    <div>
      <span className="mb-1 block text-sm font-semibold text-ink">{label}</span>
      {children}
      {help ? <p className="mt-1 text-[12px] leading-snug text-ink-3">{help}</p> : null}
    </div>
  );
}

export function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2.5">
      <span className="text-sm font-semibold text-ink">{label}</span>
      <Switch value={value} onChange={onChange} label={label} />
    </div>
  );
}

export function Segmented({ value, options, onChange }: { value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1 rounded-lg bg-gray-100 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn('min-w-0 flex-1 cursor-pointer rounded-md px-2 py-1.5 text-[12.5px] font-semibold whitespace-nowrap transition', value === o.value ? 'bg-white text-primary-700 shadow-sm' : 'text-ink-2 hover:text-ink')}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function ColorInput({ value, onChange, presets }: { value: string; onChange: (v: string) => void; presets?: string[] }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input type="color" value={/^#[0-9a-f]{6}$/i.test(value) ? value : '#ffffff'} onChange={(e) => onChange(e.target.value.toUpperCase())} className="h-10 w-12 cursor-pointer rounded-md border border-line bg-white p-1" aria-label="Pilih warna" />
        <Input value={value} onChange={(e) => onChange(e.target.value.toUpperCase().slice(0, 7))} placeholder="#FFFFFF" className="font-mono" />
      </div>
      {presets ? (
        <div className="flex flex-wrap gap-1.5">
          {presets.map((c) => (
            <button key={c} type="button" onClick={() => onChange(c)} aria-label={c} className={cn('size-6 cursor-pointer rounded-full border border-black/10 ring-offset-2', value === c && 'ring-2 ring-gray-900')} style={{ backgroundColor: c }} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function EmojiInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="flex gap-2">
        <button type="button" onClick={() => setOpen((o) => !o)} className="flex size-[46px] shrink-0 cursor-pointer items-center justify-center rounded-md border border-line bg-white text-2xl">
          {value || '＋'}
        </button>
        <Input value={value} onChange={(e) => onChange([...e.target.value].slice(0, 4).join(''))} placeholder="Ketik / pilih emoji" />
      </div>
      {open ? (
        <div className="mt-2 grid grid-cols-8 gap-1 rounded-lg border border-line bg-white p-2">
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => {
                onChange(e);
                setOpen(false);
              }}
              className="cursor-pointer rounded p-1 text-xl hover:bg-gray-100"
            >
              {e}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
